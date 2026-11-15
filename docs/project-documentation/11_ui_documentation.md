# User Interface & Frontend Documentation: BUP Nest Platform

This document provides a comprehensive technical inventory of all user interface screens, layouts, component trees, navigation flows, and interactive components in BUP Nest.

---

## 1. Complete Frontend Screen Inventory

| Screen / Page | Route | Access Level | Primary Purpose | Key Components Used | Primary User Actions |
|---|---|---|---|---|---|
| **Campus Hub & Landing** | `/` | Public | Multi-workspace campus gateway with hero showcase, interactive blueprint map, and lake stalls. | `WorkspaceHeader`, `BottomDock`, `BupArchitecturalMap`, `ExtravagantStallSection`, `CartDrawer`, `ProductQuickViewModal` | Switch workspaces (Hub/Buyer/Seller), click campus blueprint nodes, filter stalls, open modal views. |
| **Buyer Market View** | `/?tab=buyer` (or `/buyer`) | Public / Buyer | Dedicated catalog stream with category tabs, trending items, and quick-add actions. | `BuyerWorkspace`, `ProductCard`, `AddToCartButton` | Filter by category, add items to cart, quick-view product details. |
| **Seller Onboarding / Landing** | `/?tab=seller` (or `/sell`) | Public / Seller | Informative seller landing page with store setup actions or redirection to Seller Studio. | `SellerWorkspace`, `UpgradeToSellerForm` | Open seller account, input store name/bio, review seller guidelines. |
| **Public Catalog Shop** | `/shop` | Public | Full-page searchable catalog with multi-category filters, sorting controls, and search bar. | `ProductCard`, search form, category pill filters, sort dropdown | Search by title/seller, filter categories, sort by price/rating, navigate to product detail. |
| **Product Detail Page** | `/product/[id]` | Public | Full product specifications, inventory status, verified reviews, and Buy Now checkout. | `AddToCartButton`, `BuyNowButton`, `ProductReviews`, `ProductCard` (related) | Adjust quantity, add to bag, click "Buy Now" for instant checkout, submit reviews. |
| **Shopping Cart Manager** | `/cart` | Public / Buyer | Detailed bag inspection, line-item quantity controls, subtotal computation, and checkout redirection. | `CartProvider`, `formatBdt`, line item rows, clear cart button | Increment/decrement quantities, remove line items, wipe cart, proceed to `/checkout`. |
| **Checkout & Order Form** | `/checkout` | Authenticated Buyer | Multi-step order placement, campus delivery point selection, discount computation, and payment selection. | `CheckoutForm`, payment radio selectors, MFS TrxID fields | Select delivery point, choose payment method, submit TrxID, confirm order. |
| **Buyer Order History** | `/orders` | Authenticated Buyer | Dashboard listing all orders placed by the student, with real-time fulfillment status badges. | Order card list, status badges, thumbnail galleries | View past orders, track live status, click into detailed order receipt. |
| **Buyer Order Receipt** | `/orders/[id]` | Authenticated Buyer / Admin | Comprehensive invoice receipt displaying breakdown, campus delivery point, and cancellation. | `CancelOrderButton`, invoice breakdown, status timeline | Review order receipt, cancel `PENDING` order with instant stock restoration. |
| **Seller Studio Dashboard** | `/seller` | Authenticated Seller / Admin | Central operational studio for campus vendors displaying gross sales, active listings, and orders. | `SellerSettingsModal`, metric summary cards, inventory table | Monitor sales, edit store profile, launch product creation, navigate to order fulfillment. |
| **Seller Order Fulfillment**| `/seller/orders` | Authenticated Seller / Admin | Operational fulfillment view for incoming orders containing the vendor's items. | Order fulfillment cards, status action buttons | Confirm order, mark shipped to campus point, mark delivered, or reject/cancel. |
| **Create Product** | `/seller/products/new` | Authenticated Seller / Admin | Form interface to list a new item with image preview and pricing rules. | `ProductForm`, preset image selector | Upload photo URL, input price/stock, assign category and delivery ETA. |
| **Edit Product** | `/seller/products/[id]` | Product Owner / Admin | Modify existing listing pricing, stock levels, or active catalog visibility. | `ProductForm` (with initial values) | Update pricing, restock inventory, toggle `is_active` catalog visibility, save changes. |
| **User Sign In** | `/login` | Public | Standard authentication portal supporting credential login and redirect parameters. | `LoginForm`, password visibility toggle | Input email/password, submit login, redirect back to prior action (e.g. `/checkout`). |
| **User Registration** | `/register` | Public | Account registration interface with dual-role selector (Buyer vs Seller vs Connected). | `RegisterForm`, account type toggle, student ID input | Select account type, enter BUP student ID, configure store name (if seller), register. |

---

## 2. Key Screen Breakdown & Layout Design

### A. Campus Hub & Workspace Architecture (`app/page.tsx`)
The root page implements a responsive multi-desktop workspace managed by `WorkspaceContext.tsx`:
- **Workspace Navigation Bar (`WorkspaceHeader.tsx`):** Displays the BUP Nest branding, dynamic workspace switcher pills (`Campus Hub`, `Buyer Market`, `Seller Studio`), quick links to `/orders`, cart badge counter, and user profile status.
- **Top Campus Architectural Blueprint (`components/bup/BupArchitecturalMap.tsx`):** An interactive SVG vector map rendering the BUP Mirpur Cantonment campus layout. Users can interact with hot-spots representing the **Lake Promenade**, **Academic Wing (FST/FBS)**, **Auditorium Plaza**, **Central Library**, and **Sports Grounds**. Clicking a node surfaces localized details and stall occupancy.
- **Lakeside Stall Promenade (`components/bup/ExtravagantStallSection.tsx`):** Showcases physical campus stalls with filterable zones, footfall ratings, daily rental rates, and interactive reservation simulation (`StallBookingModal.tsx`).

### B. Public Catalog Experience (`app/shop/page.tsx`)
- **Header & Search:** Prominently displays the catalog title, active product counter, and search input supporting real-time text queries against titles, descriptions, and stall names.
- **Category Filter Strip:** Displays pill buttons for `All`, `Merch`, `Dining & Canteen`, `Textbooks`, `Electronics`, and `Stationery & Arts`.
- **Sort Dropdown:** Allows sorting by `Price: Low to High`, `Price: High to Low`, and `Highest Customer Rating`.
- **Product Card (`ProductCard.tsx`):** Features rounded-3xl cards with smooth image zoom on hover, verified student rating badge, store name badge, price formatting in BDT (`৳`), and quick Add-to-Bag action.

### C. Checkout & Order Placement (`app/checkout/page.tsx`)
- **Guest Gate Alert:** If an unauthenticated user enters checkout, a terracotta alert banner prompts them to log in, offering a direct link to `/login?redirect=/checkout` that preserves cart selections.
- **Student Verification Banner:** Automatically displays an emerald notification badge when an authenticated user has `is_bup_verified = 1`, confirming the 5% student discount and free campus delivery waiver.
- **Payment Method Radio Selector:** Allows selecting between Cash on Delivery (`COD`), bKash (`BKASH`), Nagad (`NAGAD`), and Card / Escrow (`CARD`). For bKash and Nagad, input fields for **Sender Phone Number** and **Transaction ID (TrxID)** appear dynamically.

### D. Seller Studio Dashboard (`app/seller/page.tsx`)
- **Key Performance Indicator (KPI) Cards:** Displays three high-level metric cards:
  1. *Active Listings:* Total products listed by the seller.
  2. *Customer Orders:* Total orders received containing the seller's items.
  3. *Gross Sales (BDT):* Summation of fulfilled/pending order values.
- **Quick Actions:** Buttons to open **Seller Settings Modal**, view **Incoming Orders**, and **Add New Product**.
- **Inventory Table:** Lists product thumbnails, names, categories, pricing, stock levels, active status pills, edit buttons, and deletion buttons.

---

## 3. Responsive Design & Navigation Patterns

- **Desktop Layout ($\ge 768\text{px}$):** Persistent top header with full category navigation, search bar, cart badge, and user dropdown. Multi-column grid displays (3 columns on `/shop`, 2 columns on `/checkout`, 3 KPI cards on `/seller`).
- **Mobile Layout ($< 768\text{px}$):** 
  - Top header collapses secondary links into an accessible slide-over mobile drawer (`MobileNav.tsx`).
  - Bottom navigation dock (`BottomDock.tsx`) fixes to the viewport base, offering one-tap access to **Campus Hub**, **Buyer Market**, **Seller Studio**, and **Shopping Bag**.
  - Form grids collapse to single-column vertical stacks.

---

## 4. Screenshot Inventory for Formal University Report

For the final BUP Web Technology Lab report, the following 12 exact screenshots should be captured from a running local instance (`npm run dev` at `http://localhost:3000`):

| Screenshot ID | Recommended Filename | Screen / State to Capture | Visual Elements to Highlight |
|---|---|---|---|
| **SS-01** | `01_campus_hub_landing.png` | Homepage (`/`) Top View | BUP Nest header, workspace switcher pills, and hero banner. |
| **SS-02** | `02_architectural_map.png` | Homepage (`/`) Map Section | Interactive SVG campus map showing Lake, FST, and FBS zones. |
| **SS-03** | `03_lakeside_stalls.png` | Homepage (`/#stalls`) | Lakeside stall cards with footfall indicators and booking buttons. |
| **SS-04** | `04_public_shop_catalog.png` | Shop Catalog (`/shop`) | Category pills, search input, sort dropdown, and product card grid. |
| **SS-05** | `05_product_detail_page.png` | Product Detail (`/product/prod-1`) | Product image, price, verified review rating, Add to Bag, and Buy Now buttons. |
| **SS-06** | `06_cart_drawer_and_page.png` | Cart View (`/cart`) | Line item rows, quantity selectors, subtotal calculation, and checkout button. |
| **SS-07** | `07_checkout_student_discount.png`| Checkout (`/checkout`) as Student | Verified BUP student 5% discount badge, free delivery waiver, and delivery point dropdown. |
| **SS-08** | `08_checkout_bkash_payment.png` | Checkout (`/checkout`) MFS Selection| bKash payment selected showing Sender Number and Transaction ID (TrxID) input fields. |
| **SS-09** | `09_buyer_order_history.png` | Orders (`/orders`) | Order history list with status badges (`PENDING`, `DELIVERED`). |
| **SS-10** | `10_buyer_order_receipt.png` | Order Receipt (`/orders/[id]`) | Detailed invoice receipt with line items and Cancel Order button. |
| **SS-11** | `11_seller_studio_dashboard.png` | Seller Studio (`/seller`) | Gross revenue metric, active listings counter, and product inventory table. |
| **SS-12** | `12_user_registration_roles.png` | Registration (`/register`) | Dual account type segmented selector (Buyer Account vs Seller Account toggle). |

