# System Module Implementation Details: BUP Nest Platform

This document presents a deep technical breakdown of the six primary operational modules composing the BUP Nest platform.

---

## Module 1: Authentication & Identity Management

### 1. Module Name
**Authentication & Multi-Role Identity Module**

### 2. Module Purpose
Provides self-contained, cryptographically secure authentication, student status verification, role elevation, profile maintenance, and cookie session persistence without relying on third-party cloud auth daemons.

### 3. Features
- Dual-role account registration (independent Buyer vs Seller account flags).
- One-click account elevation (`openSellerAccountAction`, `openBuyerAccountAction`).
- Automatic BUP student status verification based on `@bup.edu.bd` email domain or student ID.
- Blowfish salted password hashing (10 rounds via `bcryptjs`).
- HS256 JWT session tokens stored in secure, HTTP-only browser cookies (`jose`).

### 4. Frontend Implementation
- **Source Files:**
  - [app/login/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/login/page.tsx)
  - [app/register/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/register/page.tsx)
  - [components/bup/AuthModal.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/bup/AuthModal.tsx)
  - [components/marketplace/SellerSettingsModal.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/marketplace/SellerSettingsModal.tsx)
- Renders segmented toggles for Buyer vs Seller accounts, input validation feedback, and password visibility toggles.

### 5. Backend Implementation
- **Source Files:**
  - [lib/auth.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/auth.ts)
  - [lib/actions/auth.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/auth.ts)
- Enforces Zod schemas (`loginSchema`, `registerSchema`), calls `bcrypt.hash` / `bcrypt.compare`, signs JWTs using `SignJWT`, and configures HTTP-only cookies.

### 6. Database Interaction
- Inserts and updates records in the `users` table:
  - `findUserByEmail()`: `SELECT * FROM users WHERE email = ? COLLATE NOCASE`
  - `createUser()`: `INSERT INTO users (...) VALUES (...)`
  - `openSellerAccount()`: `UPDATE users SET has_seller_account = 1, store_name = ?, ... WHERE id = ?`
  - `openBuyerAccount()`: `UPDATE users SET has_buyer_account = 1 WHERE id = ?`

### 7. APIs Involved
- `loginAction`, `registerAction`, `openSellerAccountAction`, `openBuyerAccountAction`, `updateUserProfileAction`, `logoutAction`.

### 8. User Workflow
User opens `/register`, chooses account type, enters credentials and optional BUP ID. On submission, the server verifies uniqueness, hashes credentials, creates the database record, issues the JWT cookie, and signs the user in immediately.

### 9. Implementation Status
**Fully Implemented & Verified.**

---

## Module 2: Product Catalog & Search Engine

### 1. Module Name
**Product Catalog, Categorization & Search Module**

### 2. Module Purpose
Delivers a public campus store catalog allowing students and visitors to search, filter, sort, and inspect merchandise, textbooks, food items, and electronics.

### 3. Features
- Public access without mandatory login.
- Category taxonomy: `Merch`, `Dining & Canteen`, `Textbooks`, `Electronics`, `Stationery & Arts`.
- SQL-level full-text matching (`LIKE %q%`) against title, description, and store name.
- Client and server-side multi-criteria sorting (Price Low/High, Rating).
- Verified customer reviews and dynamically aggregated average ratings.

### 4. Frontend Implementation
- **Source Files:**
  - [app/shop/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/shop/page.tsx)
  - [app/product/[id]/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/product/[id]/page.tsx)
  - [components/marketplace/ProductCard.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/marketplace/ProductCard.tsx)
  - [components/marketplace/ProductReviews.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/marketplace/ProductReviews.tsx)
- Responsive 3-column product cards, category pill buttons, search input with live URL synchronization, and review submission forms.

### 5. Backend Implementation
- **Source Files:**
  - [lib/catalog.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/catalog.ts#L9-L58)
  - [app/api/products/route.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/api/products/route.ts)
  - [lib/actions/products.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/products.ts)
- Executes query builders assembling dynamic `WHERE` clauses based on active status, category, and search terms.

### 6. Database Interaction
- Queries `products` joined with `users` to resolve vendor identities:
  ```sql
  SELECT p.*, u.name as seller_name, u.store_name, u.seller_type
  FROM products p
  JOIN users u ON u.id = p.seller_id
  WHERE p.is_active = 1 AND p.category = ? AND (p.name LIKE ? OR p.description LIKE ?)
  ORDER BY p.created_at DESC
  ```
- Submits reviews to `reviews` table and recalculates rating averages:
  ```sql
  SELECT AVG(rating) as avg_rating, COUNT(*) as rev_count FROM reviews WHERE product_id = ?
  ```

### 7. APIs Involved
- `GET /api/products` (HTTP Route Handler)
- `submitReviewAction` (Server Action)

### 8. User Workflow
User lands on `/shop`, browses items by category or searches for "Hoodie", clicks a product card to open `/product/[id]`, inspects seller badges and reviews, and adds the item to the bag.

### 9. Implementation Status
**Fully Implemented & Verified.**

---

## Module 3: Persistent Shopping Cart

### 1. Module Name
**Persistent Client Shopping Bag Module**

### 2. Module Purpose
Manages temporary item selections, quantities, and pricing calculations across page navigations, browser restarts, and authentication redirects.

### 3. Features
- Instant in-memory state updates via React Context.
- Browser storage persistence (`localStorage` key `bup_nest_cart_v2`).
- Quantity increment, decrement, and line removal.
- Cart subtotal and total item count summation.
- Guest preservation across login redirects.

### 4. Frontend Implementation
- **Source Files:**
  - [components/marketplace/CartProvider.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/marketplace/CartProvider.tsx)
  - [components/marketplace/CartBadge.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/marketplace/CartBadge.tsx)
  - [components/bup/CartDrawer.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/bup/CartDrawer.tsx)
  - [app/cart/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/cart/page.tsx)

### 5. Backend Implementation
- None (intentionally designed as a client-side module to eliminate premature database writes before checkout).

### 6. Database Interaction
- None.

### 7. APIs Involved
- Internal React Context API hooks (`useCart()`).

### 8. User Workflow
User clicks "Add to Bag", cart badge increments in header, drawer slides open showing subtotal. User navigates to `/cart` to adjust quantities, then clicks "Proceed to Checkout".

### 9. Implementation Status
**Fully Implemented & Verified.**

---

## Module 4: Order Placement & Concurrency-Safe Checkout

### 1. Module Name
**Order Processing & Concurrency Control Module**

### 2. Module Purpose
Transitions cart items into formal database orders with concurrency protection, student discounts, and payment validation.

### 3. Features
- Multi-step checkout supporting BUP campus delivery points.
- Automated student benefits: 5% discount and delivery fee waiver for verified BUP students.
- Multi-channel payment options: COD, bKash, Nagad, Card.
- Transaction ID validation and duplicate rejection for MFS payments.
- Atomic SQLite stock decrement inside transactions (`UPDATE ... WHERE stock >= ?`).
- Buyer self-service cancellation with automatic inventory replenishment.

### 4. Frontend Implementation
- **Source Files:**
  - [app/checkout/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/checkout/page.tsx)
  - [components/marketplace/CheckoutForm.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/marketplace/CheckoutForm.tsx)
  - [app/orders/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/orders/page.tsx)
  - [app/orders/[id]/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/orders/[id]/page.tsx)
  - [components/marketplace/CancelOrderButton.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/marketplace/CancelOrderButton.tsx)

### 5. Backend Implementation
- **Source Files:**
  - [lib/actions/orders.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/orders.ts)
  - [lib/catalog.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/catalog.ts#L255-L459)
- Enforces user authentication via `requireUser(['BUYER', 'ADMIN'])`, runs Zod validation, enforces SQLite `BEGIN ... COMMIT` blocks, and handles rollback on stock exhaustion.

### 6. Database Interaction
- Reads/writes to `orders`, `order_items`, and updates `products`:
  - Enforces duplicate TrxID check: `SELECT 1 FROM orders WHERE payment_trx_id = ?`
  - Atomic stock reduction: `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`
  - Inserts order record with unique `order_number` and payout status `'UNSETTLED'`.

### 7. APIs Involved
- `placeOrderAction`, `cancelBuyerOrderAction`.

### 8. User Workflow
Buyer arrives at `/checkout`, reviews order totals and applied student discounts, enters phone number, selects bKash payment, enters TrxID, and clicks "Place Order". On success, cart is cleared, and buyer is redirected to order receipt `/orders/[id]?placed=true`.

### 9. Implementation Status
**Fully Implemented & Verified.**

---

## Module 5: Seller Studio & Order Fulfillment

### 1. Module Name
**Multi-Vendor Seller Studio & Fulfillment Module**

### 2. Module Purpose
Empowers campus vendors to list products, manage inventory quantities, track gross sales metrics, and fulfill incoming customer orders through a state machine.

### 3. Features
- Seller dashboard with real-time sales metrics, active listings counter, and pending orders alert.
- Complete product CRUD (Create, Read, Update, Delete) with image gallery presets.
- Order fulfillment lifecycle: `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`.
- Seller payout separation: Orders track `seller_payout_status` (`UNSETTLED` vs `SETTLED`).
- Stock restoration if seller cancels an order.

### 4. Frontend Implementation
- **Source Files:**
  - [app/seller/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/seller/page.tsx)
  - [app/seller/orders/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/seller/orders/page.tsx)
  - [app/seller/products/new/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/seller/products/new/page.tsx)
  - [app/seller/products/[id]/page.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/app/seller/products/[id]/page.tsx)
  - [components/marketplace/ProductForm.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/marketplace/ProductForm.tsx)

### 5. Backend Implementation
- **Source Files:**
  - [lib/actions/products.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/products.ts)
  - [lib/actions/orders.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/lib/actions/orders.ts)
- Enforces seller role authorization (`hasSellerAccount: true`), validates product inputs, verifies item ownership on order updates, and revalidates Next.js cache paths.

### 6. Database Interaction
- `listSellerOrders()`: Filters `orders` where `order_items.seller_id == user.id`.
- `createProduct()`: Inserts record into `products`.
- `updateOrderStatus()`: Updates `orders.status`, and when marked `DELIVERED`, updates `seller_payout_status = 'SETTLED'`.

### 7. APIs Involved
- `createProductAction`, `updateProductAction`, `deleteProductAction`, `updateSellerOrderStatusAction`.

### 8. User Workflow
Seller opens `/seller`, reviews active listings and gross revenue, clicks "Add Product" to list a new hoodie, sets price and stock. When orders arrive, seller navigates to `/seller/orders`, confirms preparation, and marks items shipped.

### 9. Implementation Status
**Fully Implemented & Verified.**

---

## Module 6: Campus Architectural Experience & Lakeside Stalls

### 1. Module Name
**BUP Campus Spatial Hub & Stall Experience Module**

### 2. Module Purpose
Provides an interactive spatial experience mapping the physical BUP Mirpur Cantonment campus, showcasing lake stalls, events, and stall reservation simulations.

### 3. Features
- Vector SVG interactive campus blueprint mapping Lakeside, FST, FBS, Library, and Sports zones.
- Lakeside stall showcase with footfall metrics, peak hours, and daily rates.
- Stall reservation modal with 15% student discount and pass code generation.
- Campus club events modal displaying scheduled university expos.

### 4. Frontend Implementation
- **Source Files:**
  - [components/bup/BupArchitecturalMap.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/bup/BupArchitecturalMap.tsx)
  - [components/bup/ExtravagantStallSection.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/bup/ExtravagantStallSection.tsx)
  - [components/bup/StallBookingModal.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/bup/StallBookingModal.tsx)
  - [components/bup/CampusEventsModal.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/bup/CampusEventsModal.tsx)
  - [components/bup/CampusMapModal.tsx](file:///Users/muntasirmamun/Muntasir/PROJECT/E-Commerce/components/bup/CampusMapModal.tsx)

### 5. Backend Implementation
- Operates primarily on client-side state and mock data in `lib/mock-data.ts`.

### 6. Database Interaction
- None (Stall reservations are handled in client memory as an interactive architectural demonstration; no `stalls` table exists in SQLite).

### 7. APIs Involved
- None.

### 8. User Workflow
User navigates to the campus hub, interacts with the SVG campus map to view the Lake Promenade, clicks a stall card to inspect rental rates, and completes a simulated reservation receiving a pass code.

### 9. Implementation Status
**Partially Implemented (UI Demonstration & Simulation).**

