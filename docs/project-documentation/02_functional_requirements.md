# Functional Requirements Specification: BUP Nest

This document details all functional requirements identified across the BUP Nest codebase. Each requirement is assigned a unique identifier, categorized by module, mapped to target actors, and verified against the actual implementation.

---

## 1. Authentication & User Identity Module (AUTH)

| Req ID | Requirement Name | Description | Actor | Expected System Behavior | Implementation Status | Source Evidence |
|---|---|---|---|---|---|---|
| **FR-AUTH-01** | User Registration | Create a new student/faculty account with email, name, password, student ID, and department. | Guest / Unregistered Student | Validate unique email, hash password via `bcryptjs` (salt 10), insert user record into `users` table, and create signed session cookie. | **Fully Implemented** | `lib/actions/auth.ts:registerAction` |
| **FR-AUTH-02** | User Login | Authenticate existing user credentials. | Registered User | Verify email exists, compare password hash via `bcrypt.compare`, set HTTP-only JWT cookie (`bup_nest_session`), and redirect to intended destination. | **Fully Implemented** | `lib/actions/auth.ts:loginAction` |
| **FR-AUTH-03** | User Logout | Terminate active user session. | Authenticated User | Expire and clear the `bup_nest_session` cookie and revalidate page paths. | **Fully Implemented** | `lib/actions/auth.ts:logoutAction` |
| **FR-AUTH-04** | Dual-Role Account Elevation | Enable a buyer to activate a seller studio without creating a second account. | Registered Buyer | Update user flags (`has_seller_account = 1`), record store name, store description, and phone number in SQLite. | **Fully Implemented** | `lib/actions/auth.ts:upgradeToSellerAction` |
| **FR-AUTH-05** | Student ID Verification | Mark university student as verified for promotional discounts. | Admin | Toggle `is_bup_verified` flag on `users` table and log administrative audit trail. | **Fully Implemented** | `lib/actions/admin.ts:adminToggleStudentVerificationAction` |
| **FR-AUTH-06** | User Account Suspension | Suspend rule-violating or abusive accounts. | Admin | Toggle `is_suspended` flag on `users` table and prevent subsequent login or order placement. | **Fully Implemented** | `lib/actions/admin.ts:adminToggleUserSuspensionAction` |

---

## 2. Product Catalog & Inventory Module (CAT)

| Req ID | Requirement Name | Description | Actor | Expected System Behavior | Implementation Status | Source Evidence |
|---|---|---|---|---|---|---|
| **FR-CAT-01** | Multi-Category Browsing | View products categorized into Merch, Books, Dining, Tech, and Stationery. | Buyer / Guest | Fetch active products from SQLite filtered by `category` and `is_active = 1`. | **Fully Implemented** | `lib/catalog.ts:listProducts` |
| **FR-CAT-02** | Keyword Search & Filtering | Search products by text query, price range, and tags. | Buyer / Guest | Execute SQL `LIKE` queries against `name`, `description`, and `tag` fields with parameterized inputs. | **Fully Implemented** | `lib/catalog.ts:searchProducts` |
| **FR-CAT-03** | Product Detail Inspection | View product specifications, seller identity, images, and reviews. | Buyer / Guest | Retrieve single product record by primary key `id` along with seller profile metadata and user review history. | **Fully Implemented** | `app/product/[id]/page.tsx` |
| **FR-CAT-04** | Create Product Listing | Create a new listing with price, stock, delivery time, and category. | Seller / Admin | Validate authenticated seller status, insert record into `products` table, and revalidate catalog caches. | **Fully Implemented** | `lib/actions/products.ts:createProductAction` |
| **FR-CAT-05** | Update Product Listing | Edit existing product details (price, stock, descriptions, meal type). | Product Owner (Seller) / Admin | Verify product ownership, execute parameterized `UPDATE` statement, and adjust `in_stock` boolean. | **Fully Implemented** | `lib/actions/products.ts:updateProductAction` |
| **FR-CAT-06** | Toggle Product Visibility | Delist or activate product without deletion. | Product Owner / Admin | Toggle `is_active` between 1 and 0, immediately hiding or revealing the item from public search. | **Fully Implemented** | `lib/actions/admin.ts:adminToggleProductStatusAction` |
| **FR-CAT-07** | Assign Promotional Badge | Assign high-visibility campus tags (`HOT`, `NEW`, `POPULAR`, `SALE`). | Admin | Update `tag` column on `products` table and log audit action. | **Fully Implemented** | `lib/actions/admin.ts:adminSetProductTagAction` |
| **FR-CAT-08** | Product Review & Rating | Submit product rating (1-5 stars) and qualitative feedback. | Verified Buyer | Ensure unique constraint per (product, user), insert review, and re-compute average rating dynamically. | **Fully Implemented** | `lib/actions/products.ts:addReviewAction` |

---

## 3. Shopping Cart & Checkout Module (CART)

| Req ID | Requirement Name | Description | Actor | Expected System Behavior | Implementation Status | Source Evidence |
|---|---|---|---|---|---|---|
| **FR-CART-01** | Add to Shopping Cart | Append product items to user cart with quantity selection. | Buyer / Guest | Persist cart state in browser `localStorage` via React Context, with stock limit clamping. | **Fully Implemented** | `components/marketplace/CartProvider.tsx` |
| **FR-CART-02** | Cart Quantity Adjustment | Increment, decrement, or remove cart items. | Buyer / Guest | Dynamically recalculate cart subtotal, item counts, and promotional discounts in real time. | **Fully Implemented** | `app/cart/page.tsx` |
| **FR-CART-03** | Verified Student Discount | Apply automatic promotional deduction for verified BUP students. | Verified Student Buyer | Check `user.isBupVerified`; if true, apply discount percentage (default 5%) across subtotal. | **Fully Implemented** | `app/checkout/page.tsx` |
| **FR-CART-04** | Campus Drop-Off Selector | Specify designated BUP campus delivery drop-off zone. | Buyer | Provide predefined dropdown locations (Vista Hall, Academic Gate 1, FBS Lobby, FST Deck, Lake Promenade). | **Fully Implemented** | `app/checkout/page.tsx` |
| **FR-CART-05** | Multi-Gateway Payment Selection | Select payment method (COD, bKash, Nagad, Card). | Buyer | Conditionally display payment fields; require valid transaction ID for bKash and Nagad options. | **Fully Implemented** | `app/checkout/page.tsx` |

---

## 4. Order Processing & Inventory Concurrency Module (ORD)

| Req ID | Requirement Name | Description | Actor | Expected System Behavior | Implementation Status | Source Evidence |
|---|---|---|---|---|---|---|
| **FR-ORD-01** | Atomic Order Creation | Create order and line items while decrementing inventory. | Buyer | Execute database transaction (`BEGIN` ... `COMMIT`); verify stock availability, deduct stock, check duplicate TrxID, and record order. | **Fully Implemented** | `lib/actions/orders.ts:createOrderAction` |
| **FR-ORD-02** | Duplicate TrxID Prevention | Reject reused bKash/Nagad transaction numbers. | System / Buyer | Check `payment_trx_id` against existing orders; reject submission if already present in database. | **Fully Implemented** | `lib/actions/orders.ts:createOrder` |
| **FR-ORD-03** | Order Status Progression | Update order lifecycle (`PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`). | Seller / Admin | Verify vendor ownership of order items, update order status, and update timestamp. | **Fully Implemented** | `lib/actions/orders.ts:updateOrderStatusAction` |
| **FR-ORD-04** | Self-Service Order Cancellation | Cancel order while still in `PENDING` state. | Buyer | Verify order belongs to buyer, update status to `CANCELLED`, and atomically restore inventory stock. | **Fully Implemented** | `lib/actions/orders.ts:cancelOrderAction` |
| **FR-ORD-05** | Printable Order Invoice | View printable digital receipt and fulfillment timeline. | Buyer / Seller / Admin | Render order summary, line items, recipient phone, campus drop-off location, and fulfillment progress. | **Fully Implemented** | `app/orders/[id]/page.tsx` |
| **FR-ORD-06** | MFS Payment Validation | Validate bKash / Nagad payment transaction from pending to paid. | Admin | Update `payment_status` from `PENDING` to `PAID` after verifying funds. | **Fully Implemented** | `lib/actions/admin.ts:adminVerifyOrderPaymentAction` |
| **FR-ORD-07** | Vendor Escrow Settlement | Disburse escrow earnings to seller upon verified delivery. | Admin | Transition `seller_payout_status` from `UNSETTLED` to `SETTLED` with disbursement notes. | **Fully Implemented** | `lib/actions/admin.ts:adminSettleOrderPayoutAction` |
| **FR-ORD-08** | Bulk Vendor Payout Settlement | Disburse all pending payouts for a vendor in one operation. | Admin | Execute multi-row update inside SQLite transaction for all unsettled orders of the specified seller. | **Fully Implemented** | `lib/actions/admin.ts:adminBulkSettleSellerPayoutsAction` |

---

## 5. Campus Experience & Lakeside Spatial Module (SPACE)

| Req ID | Requirement Name | Description | Actor | Expected System Behavior | Implementation Status | Source Evidence |
|---|---|---|---|---|---|---|
| **FR-SPACE-01** | Campus Interactive Blueprint | Interactive architectural map of BUP Mirpur Cantonment campus. | All Users | Render SVG vector map with selectable zones (Lake, FST, FBS, Central Plaza, Vista Hall). | **Fully Implemented** | `components/bup/CampusBlueprint.tsx` |
| **FR-SPACE-02** | Lakeside Stall Showcase | View physical pop-up stall allocations near the lake promenade. | All Users | Display interactive stall cards showing vendor name, club category, and active status. | **Fully Implemented** | `components/bup/LakesideStallsShowcase.tsx` |
| **FR-SPACE-03** | Digital Stall Booking Form | Submit reservation for physical pop-up stall near the lake. | Student Club Rep / Seller | Capture club name, purpose, date, duration; compute student discount; generate unique Pass Code; persist to SQLite. | **Fully Implemented** | `components/bup/StallBookingModal.tsx` |
| **FR-SPACE-04** | Stall Permit Moderation | Review, approve, or reject club stall reservation applications. | Admin | Update `stall_bookings.status` (`APPROVED`, `REJECTED`, `COMPLETED`) with admin feedback notes. | **Fully Implemented** | `app/admin/stalls/page.tsx` |

---

## 6. Administration & Governance Module (ADMIN)

| Req ID | Requirement Name | Description | Actor | Expected System Behavior | Implementation Status | Source Evidence |
|---|---|---|---|---|---|---|
| **FR-ADMIN-01** | Executive Dashboard KPIs | Real-time overview of GMV, escrow liability, orders, and user counts. | Admin | Query aggregated counts and sums across `orders`, `users`, `products`, and `stall_bookings`. | **Fully Implemented** | `lib/actions/admin.ts:getAdminDashboardStats` |
| **FR-ADMIN-02** | User Management Directory | Search, filter, elevate, or delete user accounts. | Admin | Provide search by name/email/student ID, filter by role/status, and execute administrative actions. | **Fully Implemented** | `app/admin/users/page.tsx` |
| **FR-ADMIN-03** | Catalog Content Moderation | Delist inappropriate or out-of-stock items campus-wide. | Admin | Immediate toggle of product active flag; delete prohibited listings. | **Fully Implemented** | `app/admin/products/page.tsx` |
| **FR-ADMIN-04** | Master Fulfillment Ledger | View, search, and override order fulfillment across all vendors. | Admin | Comprehensive ledger supporting status overrides, payment verification, and invoice inspection. | **Fully Implemented** | `app/admin/orders/page.tsx` |
| **FR-ADMIN-05** | Multi-Vendor Escrow Payouts | Track vendor gross sales, settled earnings, and pending disbursements. | Admin | Calculate per-vendor financial balances and provide bulk settlement execution. | **Fully Implemented** | `app/admin/payouts/page.tsx` |
| **FR-ADMIN-06** | Platform Broadcast Banner | Publish or clear campus-wide announcement alert banner. | Admin | Persist broadcast message in `platform_settings` table; render at top of all public pages. | **Fully Implemented** | `app/admin/settings/page.tsx` |
| **FR-ADMIN-07** | Immutable Security Audit Trail | Log all critical admin interventions with timestamp and admin ID. | System / Admin | Append records to `audit_logs` on every moderation, status change, verification, and settlement. | **Fully Implemented** | `lib/actions/admin.ts:logAudit` |
