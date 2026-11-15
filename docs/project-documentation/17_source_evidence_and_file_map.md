# Source Evidence and Codebase File Map: BUP Nest Platform

This document provides a complete technical directory map and evidence repository cataloging every source code file, module, server action, component, and configuration file in the BUP Nest project.

---

## 1. Directory Tree Overview

```
E-Commerce/
├── app/
│   ├── api/
│   │   └── products/
│   │       └── route.ts            # Public REST API for product catalog
│   ├── buyer/
│   │   └── page.tsx                # Buyer tab redirect
│   ├── cart/
│   │   └── page.tsx                # Dedicated shopping cart manager
│   ├── checkout/
│   │   └── page.tsx                # Order checkout and payment page
│   ├── globals.css                 # Global styles, Tailwind imports, theme tokens
│   ├── hub/
│   │   └── page.tsx                # Hub root redirect
│   ├── layout.tsx                  # Root layout, HTML shell, Providers, Header, Footer
│   ├── login/
│   │   └── page.tsx                # User sign-in interface
│   ├── not-found.tsx               # 404 error handler page
│   ├── orders/
│   │   ├── [id]/
│   │   │   └── page.tsx            # Order invoice receipt and cancellation
│   │   └── page.tsx                # Buyer order history dashboard
│   ├── page.tsx                    # Multi-workspace landing page & campus hub
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx            # Product detail, stock, and reviews
│   ├── register/
│   │   └── page.tsx                # Account registration with dual-role picker
│   ├── sell/
│   │   └── page.tsx                # Seller routing guard / redirect
│   ├── seller/
│   │   ├── orders/
│   │   │   └── page.tsx            # Multi-vendor order fulfillment dashboard
│   │   ├── page.tsx                # Seller studio dashboard (metrics, inventory)
│   │   └── products/
│   │       ├── [id]/
│   │       │   └── page.tsx        # Edit existing product
│   │       └── new/
│   │           └── page.tsx        # Create new product listing
│   └── shop/
│       └── page.tsx                # Public product catalog with search/filter/sort
├── components/
│   ├── bup/
│   │   ├── AuthModal.tsx           # Client-side modal authentication demo
│   │   ├── BottomDock.tsx          # Mobile navigation dock
│   │   ├── BupArchitecturalMap.tsx # Vector SVG interactive campus map
│   │   ├── CampusEventsModal.tsx   # Campus club events schedule modal
│   │   ├── CampusMapModal.tsx      # Enlarged interactive map modal
│   │   ├── CartDrawer.tsx          # Slide-over shopping bag drawer
│   │   ├── ExpandedMasterplanModal.tsx # Detailed architectural masterplan modal
│   │   ├── ExtravagantStallSection.tsx # Lakeside stalls grid with filter controls
│   │   ├── ProductQuickViewModal.tsx   # Fast preview modal for catalog items
│   │   ├── SearchModal.tsx         # Full-screen quick search modal
│   │   ├── StallBookingModal.tsx   # Interactive stall reservation modal
│   │   └── UserProfileModal.tsx    # User profile drawer/modal
│   ├── marketplace/
│   │   ├── AddToCartButton.tsx     # Add-to-bag and instant Buy-Now buttons
│   │   ├── CancelOrderButton.tsx   # Buyer order cancellation button
│   │   ├── CartBadge.tsx           # Header cart icon with dynamic badge counter
│   │   ├── CartProvider.tsx        # React Context provider for cart state
│   │   ├── CheckoutForm.tsx        # Multi-step checkout form component
│   │   ├── MobileNav.tsx           # Slide-over mobile drawer navigation
│   │   ├── ProductCard.tsx         # Reusable product card with rating & store tag
│   │   ├── ProductForm.tsx         # Product creation and edit form
│   │   ├── ProductReviews.tsx      # Customer review cards and submission form
│   │   ├── SellerSettingsModal.tsx # Seller profile and stall metadata modal
│   │   ├── SiteFooter.tsx          # Platform footer with copyright and links
│   │   ├── SiteHeader.tsx          # Alternative/legacy desktop navigation header
│   │   └── UpgradeToSellerForm.tsx # Seller account elevation form
│   ├── ui/
│   │   └── button.tsx              # CVA-styled accessible button component
│   └── workspace/
│       ├── BuyerWorkspace.tsx      # Buyer Market tab view component
│       ├── SellerWorkspace.tsx     # Seller Onboarding tab view component
│       ├── WorkspaceContext.tsx    # Context provider for multi-workspace tabs
│       └── WorkspaceHeader.tsx     # Main top header with workspace switcher pills
├── data/
│   └── marketplace.db              # SQLite physical database file
├── lib/
│   ├── actions/
│   │   ├── auth.ts                 # Server Actions for authentication & profiles
│   │   ├── orders.ts               # Server Actions for checkout, status, & cancel
│   │   └── products.ts             # Server Actions for product CRUD & reviews
│   ├── auth.ts                     # JWT signing, cookie management, password hashing
│   ├── catalog.ts                  # Core business logic, queries, and transactions
│   ├── db.ts                       # SQLite connection, schema migrations, models
│   ├── format.ts                   # Currency formatter (BDT) and category constants
│   ├── mock-data.ts                # Initial mock products, stalls, and campus events
│   ├── seed.ts                     # Database seed routines for initial startup
│   ├── types.ts                    # TypeScript domain interfaces and types
│   └── utils.ts                    # Class name merging utility (`cn`)
├── scratch/
│   ├── test_suite.ts               # Automated end-to-end TypeScript test suite
│   └── test_suite.mjs              # Standalone ESM test harness script
├── .env.local                      # Local environment variable configuration
├── .gitignore                      # Git exclusion rules
├── AGENTS.md                       # Next.js agent operational guidelines
├── components.json                 # Shadcn UI configuration file
├── next.config.mjs                 # Next.js framework configuration
├── package.json                    # Project dependencies, metadata, and scripts
├── postcss.config.mjs              # PostCSS plugins configuration
├── README.md                       # Project overview and changelog
└── tsconfig.json                   # TypeScript compiler options
```

---

## 2. File-by-File Technical Evidence Inventory

### A. Routing & Page Components (`app/`)

| File Path | Lines | Key Exports | Primary Responsibility & Evidence |
|---|---|---|---|
| `app/layout.tsx` | 51 | `RootLayout`, `metadata`, `viewport` | Top-level HTML shell. Seeds database via `ensureSeeded()`, reads user session via `getSession()`, and wraps application with `CartProvider`, `WorkspaceProvider`, and `WorkspaceHeader`. |
| `app/page.tsx` | 758 | `Page` (default) | Main entry hub. Implements multi-workspace sliding tabs (`hub`, `buyer`, `seller`), architectural blueprint section, lakeside stalls section, quick-view modals, and cart drawer. |
| `app/shop/page.tsx` | 130 | `ShopPage` (default) | Public catalog page. Executes server-side queries via `listProducts()`, handles text query matching (`q`), category filtering, and sorting (`price-low`, `price-high`, `rating`). |
| `app/product/[id]/page.tsx` | 195 | `ProductDetailPage` (default) | Product detail page. Fetches product via `getProduct(id)`, lists verified reviews via `listProductReviews()`, renders `AddToCartButton`, `BuyNowButton`, and related items. |
| `app/cart/page.tsx` | 172 | `CartPage` (default) | Dedicated shopping bag interface. Reads client state from `useCart()`, provides quantity controls, subtotal formatting, and redirection to checkout. |
| `app/checkout/page.tsx` | 10 | `CheckoutPage` (default) | Checkout page wrapper. Authenticates user session and renders `CheckoutForm`. |
| `app/orders/page.tsx` | 128 | `OrdersPage` (default) | Buyer order tracking page. Fetches order history for current user via `listBuyerOrders(user.id)` and renders colored status badges. |
| `app/orders/[id]/page.tsx` | 189 | `OrderDetailPage` (default) | Order invoice receipt. Shows item breakdown, delivery point, payment transaction ID, and renders `CancelOrderButton` if status is `PENDING`. |
| `app/seller/page.tsx` | 224 | `SellerDashboardPage` (default) | Seller Studio dashboard. Enforces `hasSellerAccount` permission, aggregates sales metrics (Active Listings, Orders, Gross Sales BDT), and displays inventory table. |
| `app/seller/orders/page.tsx` | 189 | `SellerOrdersPage` (default) | Seller order fulfillment interface. Lists incoming orders containing vendor's items via `listSellerOrders(user.id)` and provides status progression controls. |
| `app/seller/products/new/page.tsx` | 32 | `NewProductPage` (default) | Seller product creation page. Guards authorization and renders `ProductForm`. |
| `app/seller/products/[id]/page.tsx` | 58 | `EditProductPage` (default) | Seller product edit page. Enforces seller ownership (`product.seller_id === user.id`), loads existing values, and renders `ProductForm`. |
| `app/login/page.tsx` | 123 | `LoginPage` (default) | Authentication sign-in interface. Submits `FormData` to `loginAction` and redirects to destination URL. |
| `app/register/page.tsx` | 314 | `RegisterPage` (default) | User registration interface. Provides dual-role segmented selector (Buyer vs Seller vs Both) and calls `registerAction`. |
| `app/api/products/route.ts` | 33 | `GET` | REST API endpoint. Returns active products JSON array with optional category and search query parameters. |

---

### B. Core Business Logic & Infrastructure (`lib/`)

| File Path | Lines | Key Exports | Primary Responsibility & Evidence |
|---|---|---|---|
| `lib/db.ts` | 220 | `getDb()`, `cuid()`, `DbUser`, `DbProduct`, `DbOrder`, `DbOrderItem` | Manages SQLite database instance (`data/marketplace.db`), sets `PRAGMA foreign_keys = ON;`, executes migration DDL for `users`, `products`, `orders`, `order_items`, `reviews`. |
| `lib/auth.ts` | 114 | `hashPassword`, `verifyPassword`, `createSession`, `destroySession`, `getSession`, `requireUser` | Bcrypt password hashing (10 rounds), HS256 JWT creation and validation using `jose`, HTTP-only session cookie reading and writing, and role-based access control. |
| `lib/catalog.ts` | 605 | `listProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`, `createOrder`, `getOrder`, `listBuyerOrders`, `listSellerOrders`, `updateOrderStatus`, `cancelOrderByBuyer`, `addOrUpdateReview` | Core domain engine. Implements atomic concurrency transactions for order creation, stock decrements, cancellations, review averaging, and multi-vendor order routing. |
| `lib/actions/auth.ts` | 193 | `loginAction`, `registerAction`, `openSellerAccountAction`, `openBuyerAccountAction`, `updateUserProfileAction`, `logoutAction` | Next.js Server Actions for authentication, role elevation, and user profile updates with Zod schema validation. |
| `lib/actions/orders.ts` | 127 | `placeOrderAction`, `updateSellerOrderStatusAction`, `cancelBuyerOrderAction` | Next.js Server Actions for checkout order placement, seller status updates, and buyer cancellations. |
| `lib/actions/products.ts` | 163 | `createProductAction`, `updateProductAction`, `deleteProductAction`, `submitReviewAction` | Next.js Server Actions for product CRUD operations and customer review submissions. |
| `lib/seed.ts` | 138 | `ensureSeeded()` | Seeding utility populating default users (`admin@bupnest.com`, `buyer@example.com`, club sellers) and catalog products on cold start. |
| `lib/mock-data.ts` | 370 | `PRODUCTS`, `STALLS`, `CAMPUS_EVENTS`, `DEMO_USERS` | Canonical seed data arrays for campus products, lakeside stalls, and university club events. |
| `lib/types.ts` | 71 | `UserRole`, `UserProfile`, `Product`, `Stall`, `CartItem`, `CampusEvent` | TypeScript interfaces for client components and mock entities. |
| `lib/format.ts` | 21 | `formatBdt()`, `CATEGORIES`, `SELLER_TYPES` | Formats currency values in Bangladeshi Taka (`৳`) and defines standard category constants. |
| `lib/utils.ts` | 6 | `cn()` | Utility merging Tailwind CSS classes with `clsx` and `tailwind-merge`. |

---

### C. Reusable UI Components (`components/`)

| File Path | Lines | Key Exports | Primary Responsibility & Evidence |
|---|---|---|---|
| `components/marketplace/CartProvider.tsx` | 86 | `CartProvider`, `useCart` | Manages shopping cart state, lines, quantities, and `localStorage` persistence. |
| `components/marketplace/CheckoutForm.tsx` | 330 | `CheckoutForm` | Multi-step checkout form managing delivery point selection, verified student discounts, payment method toggles, and TrxID entry. |
| `components/marketplace/ProductForm.tsx` | 285 | `ProductForm` | Form for creating and editing products with image preset gallery and Zod error handling. |
| `components/marketplace/ProductReviews.tsx` | 165 | `ProductReviews` | Verified reviews display and star-rating submission form. |
| `components/marketplace/ProductCard.tsx` | 120 | `ProductCard` | Reusable product card with image hover zoom, rating stars, price in BDT, and add-to-bag button. |
| `components/marketplace/AddToCartButton.tsx` | 95 | `AddToCartButton`, `BuyNowButton` | Buttons for adding items to the cart or triggering direct checkout redirection. |
| `components/marketplace/CancelOrderButton.tsx`| 45 | `CancelOrderButton` | Button invoking `cancelBuyerOrderAction` with browser confirmation prompt. |
| `components/workspace/WorkspaceHeader.tsx` | 145 | `WorkspaceHeader` | Main top navigation bar with dynamic workspace switcher pills, cart badge, and user dropdown. |
| `components/workspace/WorkspaceContext.tsx` | 151 | `WorkspaceProvider`, `useWorkspace` | Manages multi-desktop workspace state (`hub`, `buyer`, `seller`) with URL synchronization. |
| `components/bup/BupArchitecturalMap.tsx` | 210 | `BupArchitecturalMap` | Vector SVG blueprint of BUP campus with interactive clickable hotspot nodes. |
| `components/bup/ExtravagantStallSection.tsx`| 280 | `ExtravagantStallSection` | Renders lakeside stall promenade with footfall ratings, daily rates, and booking modal triggers. |
| `components/bup/StallBookingModal.tsx` | 402 | `StallBookingModal` | Modal interface simulating physical stall booking with 15% student discount and pass code generation. |

---

### D. Testing & Quality Assurance Scripts (`scratch/`)

| File Path | Lines | Key Functionality | Evidence Summary |
|---|---|---|---|
| `scratch/test_suite.ts` | 146 | End-to-end TypeScript verification test suite | Tested and verified against Node.js runtime (`npx tsx scratch/test_suite.ts`). Confirmed atomic stock decrements, stock restoration on cancellation, duplicate TrxID rejection, and seller authorization barriers. |
| `scratch/test_suite.mjs` | 147 | ESM test harness | Standalone ECMAScript module test script. |

