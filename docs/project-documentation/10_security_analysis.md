# Security and Privacy Analysis: BUP Nest Platform

This document presents a comprehensive security audit of the BUP Nest codebase, evaluating authentication defenses, authorization perimeters, data protection, session integrity, cryptographic algorithms, and vulnerability vectors.

---

## 1. Security Mechanisms Classification Matrix

| Security Domain | Mechanism | Implementation Status | Implementation Details / Evidence |
|---|---|---|---|
| **Authentication** | Salted Password Hashing | **Implemented** | Uses `bcryptjs` with 10 salt rounds (`hashPassword`). Never stores plaintext passwords. |
| **Authentication** | Cryptographic Session Tokens | **Implemented** | Issues HS256-signed JSON Web Tokens via `jose` library (`SignJWT`). |
| **Authentication** | BUP Student Verification | **Implemented** | Automated domain check (`@bup.edu.bd`) and Student ID verification. |
| **Session Management**| HTTP-Only Cookie Transport | **Implemented** | Stored in `bup_session` cookie (`httpOnly: true`, `sameSite: 'lax'`, `secure` in production). |
| **Session Management**| Token Expiration | **Implemented** | 30-day token lifetime configured via `.setExpirationTime('30d')` and cookie `maxAge`. |
| **Authorization** | Role-Based Access Control (RBAC) | **Implemented** | Enforced via `requireUser(['BUYER', 'SELLER', 'ADMIN'])` server middleware. |
| **Authorization** | Multi-Vendor Tenant Isolation | **Implemented** | Enforced via SQL ownership predicates (`WHERE id = ? AND seller_id = ?`). |
| **Input Validation** | Runtime Schema Validation | **Implemented** | Strict Zod validation on all login, registration, product, and checkout actions. |
| **Data Protection** | SQL Injection Prevention | **Implemented** | 100% parameterized prepared statements (`db.prepare(...).run/all/get`). Zero raw string interpolation. |
| **Concurrency Security**| Double-Spending / Overselling Guard | **Implemented** | Atomic conditional SQL decrements inside `BEGIN ... COMMIT` transactions. |
| **Payment Security**| Duplicate Transaction ID Prevention | **Implemented** | Uniqueness check on `payment_trx_id` prior to order creation. |
| **API Protection** | CSRF Protection | **Implemented** | Next.js Server Actions automatically enforce origin matching and action token headers. |
| **Environment Handling**| Secrets Segregation | **Implemented** | Secrets loaded via `process.env`. `.env.local` is ignored in Git (`.gitignore`). |
| **Data Sanitization**| HTML / XSS Escaping | **Implemented** | React automatically escapes JSX expressions, mitigating stored XSS. |
| **Network Security**| Direct MFS Webhook Signature Verif. | **Missing / Simulated** | Digital payments rely on manual TrxID validation rather than cryptographic webhook callbacks from bKash/Nagad merchant APIs. |
| **Access Control** | Rate Limiting / Brute-Force Throttling| **Missing** | No IP-based rate limiting or Redis throttling on `/login` or `/register`. |
| **Access Control** | Multi-Factor Authentication (MFA) | **Missing** | No SMS OTP or TOTP authenticator support implemented. |

---

## 2. Authentication Architecture

### A. Password Storage & Cryptographic Hashing
- **Algorithm:** Blowfish-based `bcrypt` implemented via `bcryptjs`.
- **Cost Factor / Salt Rounds:** `10` rounds.
- **Implementation in [lib/auth.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/auth.ts#L23-L29):**
  ```typescript
  export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10)
  }

  export async function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash)
  }
  ```
- **Security Impact:** Resistant to rainbow table and GPU brute-force attacks.

### B. JWT Session Token Lifecycle
- **Specification:** Compact, URL-safe JSON Web Token signed with HMAC SHA-256 (`HS256`).
- **Cryptographic Engine:** `jose` (v6.2.13), avoiding legacy unmaintained JWT libraries.
- **Claims Stored in Token:**
  - `sub`: User ID (`users.id`).
  - `email`: User email address.
  - `name`: Full display name.
  - `role`: Role string (`BUYER`, `SELLER`, `ADMIN`).
  - `hasBuyerAccount`: Boolean flag.
  - `hasSellerAccount`: Boolean flag.
  - `isBothConnected`: Boolean flag.
- **Cookie Security Flags in [lib/auth.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/auth.ts#L65-L72):**
  - `httpOnly: true`: Prevents client-side scripts from reading the token via `document.cookie`, mitigating XSS credential harvesting.
  - `sameSite: 'lax'`: Protects against Cross-Site Request Forgery (CSRF) on cross-origin navigations.
  - `secure: process.env.NODE_ENV === 'production'`: Ensures cookies are only transmitted over TLS/HTTPS in production.
  - `path: '/'`: Scope restricted to the entire application root.
  - `maxAge: 60 * 60 * 24 * 30`: 30-day persistence.

---

## 3. Role-Based Access Control (RBAC) & Tenant Boundaries

### Access Control Matrix

| Route / Resource | Public Guest | Verified Buyer | Campus Seller | Platform Admin |
|---|---|---|---|---|
| View Catalog (`/shop`, `/product/[id]`) | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| View Campus Map & Stalls (`/`, `/#stalls`)| ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| Add Items to Bag / View Cart (`/cart`) | ✅ Manage | ✅ Manage | ✅ Manage | ✅ Manage |
| Checkout & Order Placement (`/checkout`)| ❌ Redirect | ✅ Submit | ✅ (If Buyer) | ✅ Submit |
| Buyer Order Tracking (`/orders`, `/orders/[id]`)| ❌ Forbidden | ✅ Own Orders | ✅ Own Orders | ✅ All Orders |
| Cancel Order (`cancelBuyerOrderAction`) | ❌ Forbidden | ✅ Own Orders | ✅ Own Orders | ✅ All Orders |
| Seller Studio Dashboard (`/seller`) | ❌ Redirect | ❌ Redirect | ✅ Own Studio | ✅ Full Studio |
| Manage Seller Listings (`/seller/products/*`)| ❌ Forbidden | ❌ Forbidden | ✅ Own Items | ✅ All Items |
| Seller Order Fulfillment (`/seller/orders`)| ❌ Forbidden | ❌ Forbidden | ✅ Own Items | ✅ All Items |

### Enforcement Mechanisms in Code:
1. **Server Middleware Gate (`requireUser`):**
   ```typescript
   export async function requireUser(roles?: Role[]) {
     const user = await getSession()
     if (!user) throw new Error('Unauthorized')
     if (roles) {
       if (user.role === 'ADMIN') return user
       const isAllowed = roles.some((r) => {
         if (r === 'BUYER') return user.hasBuyerAccount
         if (r === 'SELLER') return user.hasSellerAccount
         return user.role === r
       })
       if (!isAllowed) throw new Error('Forbidden')
     }
     return user
   }
   ```
2. **Tenant Ownership Validation in SQLite:**
   When updating an order status or editing a product, the SQL query explicitly asserts ownership:
   ```sql
   UPDATE products SET name = ?, price = ? ... WHERE id = ? AND seller_id = ?
   ```
   If a non-admin seller passes the product ID of a rival vendor, the query modifies zero rows and aborts with an unauthorized response.

---

## 4. Input Validation & Data Sanitization

- **Runtime Schema Validation:** All user inputs are parsed through Zod schemas before reaching the database:
  - `loginSchema`: Validates email syntax and password length.
  - `registerSchema`: Validates name, email, password strength, and optional phone format.
  - `productSchema`: Validates string lengths, positive price numbers, and image URL formats.
  - `checkoutSchema`: Validates array of item quantities, contact phone, and MFS transaction strings.
- **SQL Injection Defense:** All queries in `lib/catalog.ts` and `lib/db.ts` use parameterized SQLite statements (`?` placeholders). No user inputs are concatenated directly into SQL strings:
  ```typescript
  // SECURE: Parameterized Statement
  db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email)
  ```

---

## 5. Environment Variables & Secret Key Handling

The application requires specific environment variables for operation:
1. `AUTH_SECRET`: Symmetric cryptographic key used to sign and verify HS256 JWT tokens. Fallback default exists for local development, with explicit documentation warning to set a 32+ character random secret in production.
2. `MONGODB_URI`: Present in `.env.local` for legacy/future database connections.
3. `NEXT_PUBLIC_APP_URL`: Base URL for absolute client links.

*Security Verification:* The `.env.local` file is explicitly ignored in `.gitignore`, preventing sensitive credentials from being committed to public version control.

---

## 6. Identified Vulnerabilities & Mitigation Recommendations

1. **Absence of Rate Limiting on Authentication Endpoints:**
   - *Risk:* An attacker could script automated credential stuffing attacks against `/login`.
   - *Mitigation:* Implement an in-memory or sliding-window rate limiter (e.g. `@upstash/ratelimit` or custom IP tracking middleware) allowing a maximum of 5 failed attempts per 15-minute window per IP.
2. **Simulated MFS Payments (TrxID Manual Verification):**
   - *Risk:* Buyers can submit fabricated transaction IDs for bKash/Nagad orders. While duplicate TrxIDs are rejected, genuine payment capture is not checked via bank APIs.
   - *Mitigation:* Integrate official bKash Merchant API tokenized checkout to verify payment capture via server webhooks.
3. **Next.js 16.4.0 Dependency Vulnerability Notice:**
   - *Risk:* Build-time security warning regarding Next.js 16.4.0 upstream advisories.
   - *Mitigation:* Execute the standard Next.js security upgrade path as recommended by the framework maintainers.

