# Non-Functional Requirements Specification: BUP Nest

This document details the Non-Functional Requirements (NFRs) for the BUP Nest platform. It clearly distinguishes **Verified Characteristics** (empirically tested and measured in the running codebase) from **Intended Design Goals** (architectural targets under production conditions).

---

## 1. Performance

### Verified Characteristics
- **Server Response Time:** Sub-50ms query execution on SQLite for indexed reads (`SELECT * FROM products WHERE id = ?`).
- **Build Compilation Speed:** Next.js with Turbopack compiles the full application in under 400ms (`Compiled successfully in 311ms`).
- **Zero-Latency In-Process Database:** Native `node:sqlite` eliminates network latency overhead associated with external database connections (PostgreSQL/MySQL TCP sockets).
- **Client Bundle Optimization:** React Server Components (RSC) keep server-only database logic, cryptographic modules (`bcryptjs`, `jose`), and SQL queries out of client-side JavaScript bundles.

### Intended Design Goals
- **Page Load Time (FCP):** First Contentful Paint (FCP) $\le 1.2\text{s}$ on standard campus 4G/Wi-Fi connections.
- **Concurrent Request Throughput:** Capable of handling $50+$ concurrent requests/sec during peak 15-minute lecture break ordering surges.

---

## 2. Usability & User Experience (UX)

### Verified Characteristics
- **Windows-Style Desktop Switcher:** Dedicated navigation dock enabling smooth switching between **Campus Hub**, **Buyer Market**, and **Seller Studio**.
- **Campus Visual Palette:** Custom theme adhering to BUP campus branding: Deep Emerald (`#213527`), Terracotta Brown (`#392525`), Goldenrod Yellow (`#E3E890`), and Warm Parchment (`#FAF5E9`).
- **Responsive Layout:** Adaptive design using Tailwind CSS v4 breakpoints (`sm`, `md`, `lg`, `xl`) supporting mobile phones (375px+), tablets, and desktop workstations.
- **Feedback & Transitions:** React 19 `useTransition` hooks provide spinner feedback on asynchronous server mutations without blocking user interaction.

### Intended Design Goals
- **Accessibility (a11y):** Compliance with WCAG 2.1 Level AA standards for color contrast, keyboard navigation, and ARIA labels.

---

## 3. Reliability & Data Integrity

### Verified Characteristics
- **ACID Transaction Guarantee:** SQLite transactions (`db.exec('BEGIN')` ... `db.exec('COMMIT')`) wrap order creation and inventory updates. If any line item is out of stock, the entire order is rolled back with zero orphaned records.
- **Stock Restoration on Cancellation:** Calling `cancelOrderAction` automatically restores product inventory in the database using parameterized increments.
- **Zero Overselling:** Strict check `WHERE stock >= ?` ensures orders cannot be submitted when stock is insufficient.
- **Foreign Key Constraints:** Foreign keys (`ON DELETE CASCADE`, `ON DELETE RESTRICT`) ensure referential integrity across users, products, orders, order items, reviews, and stall bookings.

### Intended Design Goals
- **Automated Backup Strategy:** Daily automated snapshots of `data/marketplace.db` to cold object storage (AWS S3 or Cloudflare R2).

---

## 4. Security & Privacy

### Verified Characteristics
- **Password Protection:** Passwords are never stored in plain text. Salting and hashing are performed with `bcryptjs` using 10 salt rounds.
- **Stateless Session Management:** Sessions are encapsulated in HTTP-only, SameSite=Lax signed JWT tokens using HMAC-SHA256 (`jose`). Tokens are immune to client-side JavaScript tampering and XSS extraction.
- **SQL Injection Prevention:** 100% of SQL queries utilize parameterized statements (`db.prepare('... WHERE id = ?').get(id)`), eliminating SQL injection vulnerabilities.
- **Role-Based Authorization:** Hardened `requireAdmin()` and `requireSeller()` guard functions verify identity on every administrative and vendor action.
- **Audit Logging:** Every administrative action (verification, suspension, delisting, settlement) is immutably recorded in the `audit_logs` table with the acting admin's user ID and timestamp.

### Intended Design Goals
- **CSRF Token Integration:** Secondary anti-CSRF tokens for standard REST endpoints (Next.js Server Actions inherently validate Host and Origin headers).
- **Rate Limiting:** IP-based request throttling on authentication endpoints (`/login`, `/register`) to thwart brute-force password guessing.

---

## 5. Maintainability & Code Quality

### Verified Characteristics
- **Strict TypeScript Typing:** Complete type safety across database entities (`DbUser`, `DbProduct`, `DbOrder`, `DbStallBooking`, `DbAuditLog`), API inputs, and React props. Verified clean compilation with `npx tsc --noEmit`.
- **Modular Directory Structure:** Strict separation of concerns:
  - Database schema and connections: `lib/db.ts`
  - Authentication helpers: `lib/auth.ts`
  - Server Actions: `lib/actions/*`
  - Reusable presentation components: `components/*`
  - Application routes and page views: `app/*`
- **Zero External Microservice Dependencies:** Self-contained architecture where all features (auth, database, file serving) operate within the Next.js runtime.

---

## 6. Scalability

### Verified Characteristics
- **SQLite WAL Mode:** Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) allows concurrent readers to proceed without blocking writers, supporting multi-user read workloads.
- **Static Asset Caching:** Next.js automatic asset hashing and immutable HTTP caching headers for static styles and scripts.

### Intended Design Goals
- **Database Scalability:** If concurrent writes exceed single-file SQLite capacity ($>1,000$ writes/sec), the database layer is designed with clean abstraction allowing seamless migration to PostgreSQL or Cloudflare D1.

---

## 7. Compatibility

### Verified Characteristics
- **Cross-Browser Support:** Verified rendering and functionality across modern browsers: Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge.
- **Node.js Environment:** Built on Node.js native standard library (`node:sqlite`, `node:crypto`, `node:path`), compatible with Node.js v22+ and macOS/Linux environments.

---

## 8. Availability

### Verified Characteristics
- **Self-Healing Schema:** Application startup script (`initDb()`) automatically executes table creation, index creation, and column migrations if the database file is missing or out of date.
- **Automatic Seed Resilience:** Default system seed (`lib/seed.ts`) populates initial administrative credentials, campus products, and settings automatically if empty.
