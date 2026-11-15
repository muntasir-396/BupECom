# BUP Nest — Multi-vendor Campus Marketplace

Anyone can **buy** products and anyone can **open a seller account** to sell items.

## Changelog & Update Log — November 2, 2026

### 1. Separate Buyer & Seller Account Architecture
- **Independent Account Profiles**: Implemented separate flags (`has_buyer_account`, `has_seller_account`) in SQLite schema. Users can start as a Buyer or a Seller independently without being forced into both.
- **Optional Account Connection**: Users who open both account types receive a unified `Connected Account` status with seamless workspace switching between **Campus Hub**, **Buyer Market**, and **Seller Studio**.
- **Role-Aware Header & Badges**: Added visual indicators for `Buyer`, `Seller`, and `Connected` accounts, along with dynamic quick links for `Orders` and `Studio`.

### 2. Dedicated Marketplace Routes Restored
- **Fixed Routing Roadblocks**: Removed conflicting hardcoded permanent redirects from `next.config.mjs` that previously blocked dedicated sub-routes.
- **Restored & Upgraded Pages**:
  - `/shop`: Public catalog with live search, category filtering (Merch, Textbooks, Tech, Food), and price/rating sorting.
  - `/product/[id]`: Public detail page featuring **Add to Cart**, instant **Buy Now**, verified student reviews, and seller store badges.
  - `/cart`: Full cart manager with live quantity controls, subtotal computation, and checkout redirection.
  - `/checkout`: Multi-step checkout supporting BUP campus delivery points, student discounts, and payment methods.
  - `/orders` & `/orders/[id]`: Buyer order tracking dashboard with order receipts, item breakdowns, and pending cancellation.
  - `/seller`: Seller Studio with gross sales metrics, active listings counter, stock levels, and product management.
  - `/seller/orders`: Seller order fulfillment dashboard with status progression controls (`CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - `/seller/products/new` & `/seller/products/[id]`: Standalone product creation and edit interfaces with ownership validation.

### 3. Payment Verification & Multi-Vendor Payout Settlement
- **Escrow & Payout Decoupling**: Order payments are captured at the marketplace platform level. A new column `seller_payout_status` tracks marketplace liability (`UNSETTLED` vs `SETTLED`), ensuring seller payouts are reconciled separately from customer payments.
- **Duplicate TrxID Prevention**: Digital payment methods (bKash, Nagad) enforce unique Transaction ID validation in SQLite to prevent duplicate or spoofed submissions.
- **Server-Side Validation**: Order placement validates prices and stock server-side before order creation.

### 4. Inventory Concurrency & Stock Recovery
- **Atomic Stock Decrement**: Wrapped order creation in an SQLite transaction (`BEGIN...COMMIT`) with atomic check `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?` to avoid overselling during concurrent checkouts.
- **Automatic Stock Restoration**: When a buyer cancels a `PENDING` order, or a seller marks an order `CANCELLED`, inventory quantities are automatically restored to the database.

### 5. Guest-to-Buyer Authentication Flow
- **Persistent Cart State**: Cart lines are preserved in client `localStorage` across page reloads and authentication redirects.
- **Seamless Login Return**: Unauthenticated users clicking **Buy Now** or checking out are redirected to `/login?redirect=/checkout` and returned directly to checkout with their selections intact upon signing in.

---

## Features

- Buyer accounts, persistent cart, checkout, and order history
- Seller studio with product CRUD, inventory control, and fulfillment tracking
- Separate buyer & seller accounts with optional cross-connection
- SQLite database with atomic transactions and migration hooks
- Cookie sessions (JWT via `jose`) + bcrypt passwords
- Payment methods: Cash on Delivery (COD), bKash, Nagad, Card / Marketplace Escrow
- Automated verification test suite in `scratch/test_suite.ts`

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

Password for all: `password123`

| Role | Email | Configuration |
|---|---|---|
| Buyer | `buyer@example.com` | Buyer account (`has_buyer: 1`, `has_seller: 0`) |
| Seller | `alumni@bupnest.com` | Seller account (`has_buyer: 0`, `has_seller: 1`) |
| Admin | `admin@bupnest.com` | Connected account (`has_buyer: 1`, `has_seller: 1`) |

## Main routes

| Path | Purpose | Access |
|---|---|---|
| `/` | Campus landing & multi-desktop hub | Public |
| `/shop` | Full product catalog with search/filter | Public |
| `/product/[id]` | Product details, reviews, Buy Now | Public |
| `/cart` | Shopping cart | Public / Buyer |
| `/checkout` | Order placement & payment | Authenticated Buyer |
| `/orders` | Buyer order history & status tracking | Authenticated Buyer |
| `/orders/[id]` | Buyer order receipt & cancellation | Authenticated Buyer |
| `/seller` | Seller Studio (metrics & listings) | Authenticated Seller |
| `/seller/orders` | Fulfill incoming buyer orders | Authenticated Seller |
| `/seller/products/new` | List new product | Authenticated Seller |
| `/seller/products/[id]` | Edit existing product & inventory | Seller Owner / Admin |
| `/login` `/register` | Authentication with role selection | Public |

## Reset demo data

```bash
npm run db:reset
npm run dev
```

Database file: `data/marketplace.db` (created and migrated automatically on first run).
