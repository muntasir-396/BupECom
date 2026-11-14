# API & Server Action Documentation: BUP Nest Platform

This document provides a complete technical specification of all backend endpoints, HTTP route handlers, and Next.js Server Actions implemented in BUP Nest.

---

## 1. Overview of Backend Communication Protocols

BUP Nest utilizes two complementary communication paradigms provided by the Next.js App Router:
1. **HTTP Route Handler (REST API):** A standard RESTful JSON endpoint (`GET /api/products`) designed for programmatic product listing retrieval, external integrations, and client-side asynchronous fetches.
2. **Server Actions (RPC Mutations):** Strongly typed, server-executed functions invoked directly from client components over encrypted POST requests with built-in CSRF mitigation, automatic cookie transmission, and cache revalidation.

---

## 2. Master API & Server Action Inventory Table

| Identifier | Method / Protocol | Target / Function | Purpose | Authentication Required | Request Payload | Response Format |
|---|---|---|---|---|---|---|
| **API-01** | `GET` (REST) | `/api/products` | Retrieve catalog products with optional category and search filters | None (Public) | Query Params: `category`, `q` | `JSON Array<Product>` (HTTP 200) |
| **ACT-01** | `POST` (Server Action) | `loginAction` | Authenticate user credentials and issue session cookie | None (Public) | `FormData`: `email`, `password` | `{ ok: true }` or `{ ok: false, error: string }` |
| **ACT-02** | `POST` (Server Action) | `registerAction` | Register a new user as Buyer, Seller, or Connected Account | None (Public) | `FormData`: `name`, `email`, `password`, `role`, `connectBoth`, etc. | `{ ok: true }` or `{ ok: false, error: string }` |
| **ACT-03** | `POST` (Server Action) | `openSellerAccountAction` | Elevate authenticated buyer to possess active seller store | Authenticated User | `FormData`: `storeName`, `sellerType`, `phone`, `storeDescription` | `{ ok: true }` or `{ ok: false, error: string }` |
| **ACT-04** | `POST` (Server Action) | `openBuyerAccountAction` | Enable buyer capabilities on a seller account | Authenticated User | None | `{ ok: true }` or `{ ok: false, error: string }` |
| **ACT-05** | `POST` (Server Action) | `updateUserProfileAction` | Update user profile, contact, or store details | Authenticated User | `FormData`: `name`, `phone`, `storeName`, `storeDescription` | `{ ok: true }` or `{ ok: false, error: string }` |
| **ACT-06** | `POST` (Server Action) | `logoutAction` | Invalidate session and clear HTTP-only cookie | Authenticated User | None | Redirects to `/` |
| **ACT-07** | `POST` (Server Action) | `placeOrderAction` | Place concurrency-safe order with atomic stock decrement | Authenticated Buyer | JSON Object (Line items, payment method, delivery point, TrxID) | `{ ok: true, orderId, orderNumber }` or `{ ok: false, error: string }` |
| **ACT-08** | `POST` (Server Action) | `updateSellerOrderStatusAction` | Advance order fulfillment status (`CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`) | Authenticated Seller / Admin | Arguments: `orderId: string`, `status: string` | `{ ok: true }` or `{ ok: false, error: string }` |
| **ACT-09** | `POST` (Server Action) | `cancelBuyerOrderAction` | Buyer self-service cancellation with atomic inventory restoration | Authenticated Buyer | Arguments: `orderId: string` | `{ ok: true }` or `{ ok: false, error: string }` |
| **ACT-10** | `POST` (Server Action) | `createProductAction` | Create and publish a new product listing | Authenticated Seller / Admin | `FormData`: `name`, `description`, `category`, `price`, `stock`, `image`, etc. | `{ ok: true, id: string }` or `{ ok: false, error: string }` |
| **ACT-11** | `POST` (Server Action) | `updateProductAction` | Modify existing product details, stock, or status | Product Seller Owner / Admin | Arguments: `productId: string`, `formData: FormData` | `{ ok: true, id: string }` or `{ ok: false, error: string }` |
| **ACT-12** | `POST` (Server Action) | `deleteProductAction` | Delete a product listing permanently | Product Seller Owner / Admin | Arguments: `productId: string` | `{ ok: true }` or `{ ok: false, error: string }` |
| **ACT-13** | `POST` (Server Action) | `submitReviewAction` | Submit or update a verified rating and review | Authenticated User | Arguments: `productId: string`, `formData: FormData` | `{ ok: true }` or `{ ok: false, error: string }` |

---

## 3. Detailed Endpoint & Action Specifications

### Endpoint API-01: `GET /api/products`
- **Source File:** [app/api/products/route.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/api/products/route.ts)
- **Runtime:** Node.js (`export const runtime = 'nodejs'`)
- **Query Parameters:**
  - `category` (optional, string): Filter by category name (e.g. `Merch`, `Dining & Canteen`).
  - `q` (optional, string): Search term matching title, description, or seller name.
- **Success Response (HTTP 200 OK):**
```json
[
  {
    "id": "prod-1",
    "name": "Official BUP Varsity Winter Hoodie (Deep Emerald & Gold)",
    "category": "Merch",
    "price": 1450,
    "originalPrice": 1650,
    "rating": 4.9,
    "reviewsCount": 42,
    "seller": "BUP Alumni & Student Welfare Club",
    "sellerType": "BUP Official",
    "image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    "description": "Heavyweight premium cotton fleece hoodie featuring embroidered BUP crest...",
    "inStock": true,
    "tag": "Official Merch",
    "deliveryTime": "2-4 days",
    "mealType": null
  }
]
```

---

### Server Action ACT-01: `loginAction`
- **Source File:** [lib/actions/auth.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/auth.ts#L43-L59)
- **Authentication:** Public
- **Input Parameters (`FormData`):**
  - `email` (string, required): Valid email string.
  - `password` (string, required): Plaintext password ($\ge 6$ chars).
- **Processing Logic:**
  1. Validates inputs against `loginSchema` (Zod).
  2. Queries user record via `findUserByEmail(email)` with case-insensitivity.
  3. Verifies password hash using `bcrypt.compare`.
  4. Generates HS256 signed JWT via `createSession(user)`.
  5. Sets HTTP-only `bup_session` cookie (Max Age: 30 days).
- **Return Type:**
  - Success: `{ ok: true }`
  - Error: `{ ok: false, error: 'No account found with this email' | 'Incorrect password' }`

---

### Server Action ACT-02: `registerAction`
- **Source File:** [lib/actions/auth.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/auth.ts#L61-L122)
- **Authentication:** Public
- **Input Parameters (`FormData`):**
  - `name` (string, required): Full name ($\ge 2$ characters).
  - `email` (string, required): User email address.
  - `password` (string, required): Plaintext password ($\ge 6$ characters).
  - `phone` (string, optional): Mobile phone number.
  - `role` (string, optional): `'BUYER'` (default) or `'SELLER'`.
  - `connectBoth` (boolean/string, optional): `'true'` or `'on'` to enable both accounts.
  - `studentId` (string, optional): BUP student ID.
  - `storeName` (string, optional): Required if registering as seller.
  - `sellerType` (string, optional): e.g. `'Student Vendor'`, `'Campus Canteen'`.
- **Processing Logic:**
  1. Validates schema using Zod.
  2. Checks for email collision; aborts if duplicate exists.
  3. Detects BUP verification (`email.endsWith('@bup.edu.bd') || !!studentId`).
  4. Hashes password with `bcrypt.hash(password, 10)`.
  5. Inserts user into `users` table with appropriate role flags.
  6. Automatically signs JWT and writes `bup_session` session cookie.
- **Return Type:**
  - Success: `{ ok: true }`
  - Error: `{ ok: false, error: string }`

---

### Server Action ACT-07: `placeOrderAction`
- **Source File:** [lib/actions/orders.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/orders.ts#L30-L97)
- **Authentication:** Authenticated Buyer (`requireUser(['BUYER', 'ADMIN'])`)
- **Input Payload (`checkoutSchema`):**
```typescript
{
  paymentMethod: 'COD' | 'BKASH' | 'NAGAD' | 'CARD';
  deliveryCampus?: string;
  deliveryAddress?: string;
  phone: string;
  notes?: string;
  trxId?: string;
  senderPhone?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
```
- **Processing Logic:**
  1. Verifies caller authentication and buyer privileges.
  2. If MFS method is selected, enforces `trxId` length ($\ge 4$ characters).
  3. Validates that each item exists, is active, and possesses sufficient stock.
  4. Calculates financial breakdown:
     $$\text{discount} = \begin{cases} \text{round}(\text{subtotal} \times 0.05) & \text{if } \text{isBupVerified} \\ 0 & \text{otherwise} \end{cases}$$
     $$\text{deliveryFee} = \begin{cases} 0 & \text{if } \text{isBupVerified} \lor \text{subtotal} > 1000 \\ 60 & \text{otherwise} \end{cases}$$
     $$\text{total} = \text{subtotal} - \text{discount} + \text{deliveryFee}$$
  5. Verifies `trxId` uniqueness across `orders`.
  6. Opens SQLite transaction (`BEGIN`):
     - Decrements stock conditionally: `WHERE id = ? AND stock >= ?`.
     - Inserts line items into `order_items`.
     - Inserts record into `orders` with initial status `PENDING` and payout status `UNSETTLED`.
     - Commits transaction (`COMMIT`).
  7. Triggers Next.js cache revalidation for paths `/`, `/buyer`, and `/seller`.
- **Return Type:**
  - Success: `{ ok: true, orderId: string, orderNumber: string }`
  - Error: `{ ok: false, error: string }`

---

### Server Action ACT-08: `updateSellerOrderStatusAction`
- **Source File:** [lib/actions/orders.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/orders.ts#L99-L112)
- **Authentication:** Authenticated Seller (`requireUser(['SELLER', 'ADMIN'])`)
- **Input Parameters:**
  - `orderId` (string, required): ID of target order.
  - `status` (string, required): Allowed values: `'CONFIRMED'`, `'SHIPPED'`, `'DELIVERED'`, `'CANCELLED'`.
- **Processing Logic:**
  1. Checks ownership: seller must own at least one item in the order or be an admin.
  2. If status is `CANCELLED`: executes transaction restoring item quantities back to `products.stock`.
  3. If status is `DELIVERED`: sets `seller_payout_status = 'SETTLED'` and `payment_status = 'PAID'`.
  4. Revalidates paths `/seller` and `/`.
- **Return Type:**
  - Success: `{ ok: true }`
  - Error: `{ ok: false, error: string }`

---

### Server Action ACT-09: `cancelBuyerOrderAction`
- **Source File:** [lib/actions/orders.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/orders.ts#L114-L126)
- **Authentication:** Authenticated Buyer (`requireUser(['BUYER', 'SELLER', 'ADMIN'])`)
- **Input Parameters:** `orderId` (string)
- **Processing Logic:**
  1. Validates that `orders.buyer_id == user.id` and `orders.status == 'PENDING'`.
  2. Opens transaction: sets status to `CANCELLED`, restores `products.stock`, and commits.
  3. Revalidates `/`, `/buyer`, and `/seller`.
- **Return Type:**
  - Success: `{ ok: true }`
  - Error: `{ ok: false, error: string }`

---

### Server Action ACT-10: `createProductAction`
- **Source File:** [lib/actions/products.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/products.ts#L22-L67)
- **Authentication:** Authenticated Seller (`requireUser(['SELLER', 'ADMIN'])`)
- **Input Parameters (`FormData`):**
  - `name`, `description`, `category`, `price`, `originalPrice`, `image`, `stock`, `tag`, `deliveryTime`.
- **Processing Logic:**
  1. Validates input schema via `productSchema` (Zod).
  2. Inserts new product record linked to caller's `user.id`.
  3. Revalidates `/seller`, `/shop`, `/buyer`, and `/`.
- **Return Type:**
  - Success: `{ ok: true, id: string }`
  - Error: `{ ok: false, error: string }`

---

### Server Action ACT-13: `submitReviewAction`
- **Source File:** [lib/actions/products.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/products.ts#L137-L162)
- **Authentication:** Authenticated User
- **Input Parameters:** `productId` (string), `formData` (`rating`: number 1-5, `comment`: string).
- **Processing Logic:**
  1. Validates rating between 1 and 5.
  2. Upserts review into `reviews` table (`ON CONFLICT(product_id, user_id) DO UPDATE`).
  3. Recalculates average rating and review count across all reviews for this product.
  4. Updates `products.rating` and `products.reviews_count`.
- **Return Type:**
  - Success: `{ ok: true }`
  - Error: `{ ok: false, error: string }`

