# Formal Screenshot Inventory & Figure Index: BUP Nest Platform

This document provides a structured guide for capturing and annotating application screenshots for inclusion in the formal BUP Web Technology Lab report.

---

## 1. Master Screenshot & Figure Index

| Figure # | Suggested File Name | Screen Title | Route / View | User Persona | Key Architectural Elements to Annotate |
|---|---|---|---|---|---|
| **Figure 1** | `fig01_campus_hub_hero.png` | Campus Hub & Hero Section | `/` (Top) | Public Visitor | Header logo, multi-workspace pills (`Campus Hub`, `Buyer Market`, `Seller Studio`), hero value proposition, and quick links. |
| **Figure 2** | `fig02_architectural_map.png` | Interactive BUP Campus Blueprint | `/` (Scroll to Blueprint) | Student / Visitor | Vector SVG interactive campus map displaying Lake Promenade, Academic Wing, Vista Hall, and clickable hotspot indicators. |
| **Figure 3** | `fig03_lakeside_stalls_section.png`| Lakeside Promenade Stalls | `/#stalls` | Student / Visitor | Filterable stall grid, footfall indicators, daily rates (BDT), and *"Book Stall"* call-to-actions. |
| **Figure 4** | `fig04_stall_reservation_modal.png` | Stall Reservation Modal | Modal on `/#stalls` | Student Club Rep | Booking date picker, duration counter, 15% student discount calculation, and generated pass code. |
| **Figure 5** | `fig05_shop_catalog_search.png` | Public Catalog with Search & Filter | `/shop` | Public Buyer | Category pill buttons (`Merch`, `Dining & Canteen`, etc.), live search bar, sort dropdown, and product card grid. |
| **Figure 6** | `fig06_product_detail_page.png` | Product Detail & Review View | `/product/prod-1` | Student Buyer | Product gallery, verified student rating badge, store ownership badge, delivery ETA, Add to Bag, and Buy Now buttons. |
| **Figure 7** | `fig07_verified_reviews_section.png`| Verified Student Reviews Section | `/product/prod-1` (Bottom) | Authenticated User | Star rating distribution, customer review cards, and interactive review submission form. |
| **Figure 8** | `fig08_shopping_cart_drawer.png` | Slide-Over Shopping Bag Drawer | Drawer on `/` or `/shop` | Buyer | Line items, individual prices, quantity controls, subtotal computation, and *"Proceed to Checkout"* button. |
| **Figure 9** | `fig09_cart_management_page.png` | Dedicated Shopping Bag Manager | `/cart` | Buyer | Full-screen cart manager with product thumbnail snapshots, unit price breakdowns, clear cart action, and checkout navigation. |
| **Figure 10** | `fig10_checkout_guest_prompt.png` | Checkout Guest Authentication Prompt | `/checkout` (Unauthenticated) | Unauthenticated Guest| Amber warning banner indicating authentication requirement, cart retention notice, and *"Sign in now"* button. |
| **Figure 11** | `fig11_checkout_student_discount.png`| Checkout with Student Discount | `/checkout` (as BUP Student) | Verified Student Buyer | Emerald student discount banner (-5%), delivery fee waiver (৳0), campus pickup zone selector, and payment method options. |
| **Figure 12** | `fig12_checkout_mfs_bkash.png` | Mobile Banking (bKash) Selection | `/checkout` (bKash selected)| Buyer | Dynamic form fields revealing Sender Phone Number and Transaction ID (TrxID) input with format guidelines. |
| **Figure 13** | `fig13_buyer_order_history.png` | Buyer Order Tracking Dashboard | `/orders` | Authenticated Buyer | Order cards displaying public order number (`BUP-XXXXXX`), order timestamp, item thumbnails, and colored status badges. |
| **Figure 14** | `fig14_buyer_order_invoice.png` | Detailed Buyer Order Invoice | `/orders/[id]?placed=true` | Authenticated Buyer | Success notification banner, payment status badge, delivery campus point, financial breakdown, and Cancel Order button. |
| **Figure 15** | `fig15_seller_studio_dashboard.png` | Multi-Vendor Seller Studio | `/seller` | Campus Vendor | Key performance metric cards (Active Listings, Customer Orders, Gross Sales BDT), store settings button, and inventory table. |
| **Figure 16** | `fig16_seller_order_fulfillment.png`| Seller Order Fulfillment Controls | `/seller/orders` | Campus Vendor | Order cards containing vendor items, customer campus drop-off point, payout status pill, and status action buttons (`Confirm`, `Ship`, `Deliver`). |
| **Figure 17** | `fig17_product_creation_form.png` | Product Listing Creation Interface | `/seller/products/new` | Campus Vendor | Product title, price, compare-at price, available stock counter, delivery ETA, and Unsplash preset image picker. |
| **Figure 18** | `fig18_dual_role_registration.png` | User Registration & Role Selection | `/register` | Unauthenticated Visitor | Dual account type segmented toggle (Buyer Account vs Seller Account), student ID field, and optional store setup fields. |

---

## 2. Step-by-Step Instructions to Capture Screenshots

### Prerequisites:
1. Ensure the development server is running locally:
   ```bash
   npm run dev
   ```
2. Open Google Chrome or Firefox in an Incognito / Private window at `http://localhost:3000`.
3. Set browser window dimensions to standard desktop view: **1440px $\times$ 900px** or **1920px $\times$ 1080px** for consistent high-definition figures.

### Procedure for Capturing Each Persona:

#### A. Guest / Public Persona (Figures 1, 2, 3, 4, 5, 10, 18):
1. Navigate to `http://localhost:3000` (Figure 1: Top Hero; Figure 2: Scroll to Map; Figure 3: Scroll to Stalls).
2. Click any *"Reserve Stall"* button on a lakeside stall card (Figure 4: Modal).
3. Click *"Buyer Market"* or navigate to `/shop` (Figure 5).
4. Add an item to the bag and navigate directly to `/checkout` without logging in (Figure 10).
5. Navigate to `/register` (Figure 18).

#### B. Verified Student Buyer Persona (Figures 6, 7, 8, 9, 11, 12, 13, 14):
1. Navigate to `/login` and sign in using demo credentials:
   - **Email:** `buyer@example.com`
   - **Password:** `password123`
2. Navigate to `/product/prod-1` (Figure 6: Top; Figure 7: Bottom Reviews).
3. Click *"Add to Bag"*, then click the header cart icon to open the drawer (Figure 8).
4. Click *"View Full Bag"* to open `/cart` (Figure 9).
5. Click *"Proceed to Checkout"* (Figure 11: Shows applied 5% student discount and ৳0 delivery fee).
6. Click *"bKash"* under payment options (Figure 12: Shows TrxID and Sender Phone inputs).
7. Submit order and land on receipt (Figure 14).
8. Navigate to `/orders` (Figure 13).

#### C. Campus Seller Persona (Figures 15, 16, 17):
1. Sign out and sign in using demo seller credentials:
   - **Email:** `alumni@bupnest.com`
   - **Password:** `password123`
2. Navigate to `/seller` (Figure 15).
3. Click *"Customer Orders"* or navigate to `/seller/orders` (Figure 16).
4. Click *"Add Product"* or navigate to `/seller/products/new` (Figure 17).

