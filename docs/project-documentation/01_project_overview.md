# Project Overview: BUP Nest — Multi-Vendor Campus Marketplace

## 1. Project Title
**BUP Nest — Multi-Vendor Campus Marketplace**  
*(Course: Web Technology Lab, Department of Information and Communication Engineering / Computer Science and Engineering, Bangladesh University of Professionals - BUP)*

---

## 2. Project Purpose
BUP Nest is a specialized, multi-vendor electronic commerce, food catering, and campus life management platform engineered exclusively for the Bangladesh University of Professionals (BUP) community in Mirpur Cantonment, Dhaka. The platform bridges the gap between student buyers, student entrepreneurs, official university clubs, faculty societies, campus dining operators (such as Central Canteen and Lake Promenade Cafe), and university administrative moderators.

The primary objective is to formalize, digitize, and secure campus commerce within a hyper-localized ecosystem where verified BUP members enjoy tailored benefits (such as automated student discounts, verified badge privileges, and designated campus delivery zones), student vendors manage digital storefronts, and administrators oversee platform compliance, escrow settlements, and event spaces.

---

## 3. Problem Being Addressed
Prior to BUP Nest, commerce and campus activities at BUP relied on fragmented, informal channels:
1. **Unorganized Campus Trade:** Buying and selling textbooks, calculators, engineering drafting tools, and batch merchandise occurred over disparate social media groups (Facebook groups, WhatsApp chats), leading to lost orders, scam risks, and payment disputes.
2. **Dining Congestion & Queuing:** Central canteen and lakeside cafeteria lines during 15-minute lecture breaks resulted in extreme overcrowding, uncollected food, and cash-handling bottlenecks.
3. **Lack of Inventory & Payout Accountability:** Student vendors and club welfare stalls had no centralized tooling to control live stock, prevent overselling, manage order fulfillment, or track payouts.
4. **Physical Stall Allocation Inefficiencies:** During campus festivals, tech syndicate expos, and cultural weeks, physical stall reservation along the BUP Lake Promenade required manual paperwork, coordination delays, and spatial ambiguity.
5. **Absence of Centralized Administration:** Campus authorities had no visibility into student entrepreneurship metrics, MFS transaction fraud, or club reservation approvals.

---

## 4. Target Users & Stakeholders
1. **BUP Student Buyers:** Students across faculties (Faculty of Science and Technology - FST, Faculty of Business Studies - FBS, Faculty of Arts and Social Sciences - FASS, Faculty of Security and Strategic Studies - FSSS) seeking varsity apparel, coursebooks, cafeteria pre-orders, and tech supplies with verified student discounts.
2. **Student Entrepreneurs & Campus Clubs:** Independent student vendors, BUP Robotics Syndicate, Cultural Forum, and Business Clubs running temporary pop-ups or permanent shops.
3. **Campus Dining Facilities:** Formal food concessionaires (Central Canteen, Lake Promenade Cafe) requiring order management and pre-ordered pickup.
4. **Alumni & External Partners:** BUP alumni associations and trusted outside partners providing campus merchandise or tech accessories.
5. **System Administrators & Faculty Moderators:** Platform administrators managing catalog integrity, student ID verification, escrow payouts, and physical stall permits.

---

## 5. Main Objectives
- **Centralized Campus Catalog:** Provide a searchable, filterable catalog of goods categorized into Merch, Textbooks, Dining & Canteen, Electronics, and Stationery & Arts.
- **Dual-Role Account Architecture:** Allow users to operate as Buyers, Sellers, or Connected Accounts (both roles under a single login) without forcing dual enrollment upon initial registration.
- **Transactional Integrity & Concurrency Control:** Enforce atomic SQLite transactions for inventory deduction, order placement, and automatic stock restoration upon cancellation to eliminate overselling.
- **Secure Financial Reconciliation:** Support Cash on Delivery (COD) and mobile financial services (bKash, Nagad) with duplicate Transaction ID (TrxID) validation and platform escrow/payout separation.
- **Spatial Campus Integration:** Offer an interactive architectural masterplan of the BUP Mirpur Cantonment campus, showcasing key zones (Lake Promenade, FST/FBS buildings, Vista Hall) and real database-driven stall booking.
- **Executive Administration Suite:** Comprehensive management dashboard for user verification, catalog moderation, order fulfillment override, vendor escrow settlements, and audit logging.

---

## 6. Key Functionalities
- **User Authentication & Session Management:** Cookie-based session tokens signed with HMAC-SHA256 JWT (`jose`) and bcrypt password hashing.
- **Role-Based Access Control (RBAC):** Three distinct roles (`BUYER`, `SELLER`, `ADMIN`) with dedicated middleware and server action guards (`requireAdmin`).
- **Catalog Browsing & Search:** Server-side search and category filtering with multi-criteria sorting and tag filters (`HOT`, `NEW`, `POPULAR`, `SALE`).
- **Cart & Multi-Vendor Checkout:** Client-side persistent cart (`localStorage` synced) with automated student discount calculations and campus drop-off point selection.
- **Multi-Vendor Seller Studio:** Dashboard displaying active listings, incoming orders, gross revenue metrics, inventory editing, and fulfillment state transitions.
- **Order Tracking & Cancellation:** Buyer order dashboard with detailed invoice receipts and self-service cancellation with instant stock replenishment.
- **Product Reviews & Dynamic Rating Aggregation:** Verified student reviews with star ratings (1–5) and auto-computed arithmetic averages.
- **Lakeside Stall Reservation System:** Interactive pop-up stall booking interface storing applications in SQLite with unique alphanumeric pass codes.
- **Master Admin Panel (`/admin`):** Complete management portal covering KPI analytics, student ID verification, product moderation, order tracking, escrow disbursement, and audit trail logs.

---

## 7. Main Modules
1. **Authentication & Identity Module (`lib/auth.ts`, `lib/actions/auth.ts`, `app/login`, `app/register`):** Handles registration, login, role elevation, profile updates, and JWT session cookies.
2. **Product Catalog & Inventory Module (`lib/catalog.ts`, `lib/actions/products.ts`, `app/shop`, `app/product/[id]`):** Manages product schema, category taxonomy, search query execution, and inventory records.
3. **Cart & Checkout Module (`components/marketplace/CartProvider.tsx`, `app/cart`, `app/checkout`):** Local storage state, order subtotal calculation, discount rules, and form validation.
4. **Order Processing & Fulfillment Module (`lib/actions/orders.ts`, `app/orders`, `app/seller/orders`):** Atomic order placement, status lifecycle (`PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED` / `CANCELLED`), and payout state tracking.
5. **Seller Studio Module (`app/seller`, `app/seller/products/new`, `app/seller/products/[id]`):** Seller metrics, product listing creation, stock management, and store customization.
6. **BUP Campus Experience & Spatial Hub (`app/page.tsx`, `components/bup/*`):** Interactive campus blueprint, lakeside stall showcase, quick view modals, and events schedule.
7. **Master Administration Module (`lib/actions/admin.ts`, `app/admin/*`, `components/admin/*`):** Executive KPI dashboard, user directory, catalog moderation, orders ledger, vendor payouts, stall reservations, platform settings, and audit logs.

---

## 8. Technology Stack Summary

| Technology | Category | Purpose | Actual Usage |
|---|---|---|---|
| **Next.js 16.4.0** | Full-Stack Framework | App Router, Server Actions, API routes, Turbopack bundling | Core application architecture across all routes |
| **React 19.0.0** | UI Library | React Server Components (RSC), transitions, client hooks | Declarative frontend components |
| **Node.js SQLite (`node:sqlite`)** | Database Engine | Synchronous native embedded SQL storage with WAL mode | Complete persistent database (`data/marketplace.db`) |
| **Tailwind CSS v4.3.3** | Styling Framework | Utility-first CSS styling, custom color theme, modern responsive layout | Global application styling (`app/globals.css`) |
| **jose 6.2.13** | Cryptography / Auth | Compact JWS / HS256 HMAC session cookie signing | Stateless session management (`lib/auth.ts`) |
| **bcryptjs 3.0.3** | Security | Password hashing with salt rounds (10) | User credential protection during signup/login |
| **Lucide React 1.16.0** | UI Icons | Consistent SVG iconography | UI controls, status badges, and action buttons |
| **Zod 4.6.7** | Validation | Runtime schema validation | Data structure checking |
| **TypeScript 5.7.3** | Type Safety | Static typing across full stack | Enforces strict schema and action safety |

---

## 9. Justification of Technology Choices
- **Why Next.js 16 (App Router)?** Provides seamless co-location of Server Actions with React Server Components, eliminating unnecessary REST boilerplate for form submissions and mutations while retaining fast server-rendered initial page loads.
- **Why Native `node:sqlite`?** Node.js native SQLite requires zero external database servers (like MySQL or Postgres containers), guarantees deterministic local development, supports ACID-compliant multi-statement atomic transactions (`BEGIN` ... `COMMIT`), and simplifies deployment for academic evaluation.
- **Why Tailwind CSS v4?** The new CSS-first engine delivers zero-runtime styles with lightning-fast compilation, native CSS variables for theme colors (`#213527`, `#FAF5E9`, `#E3E890`, `#392525`), and intuitive responsive design.
- **Why `jose` instead of Express-Session?** Cryptographically signed HTTP-only cookies allow stateless, tamper-proof session verification that works reliably across Server Actions, Route Handlers, and Server Components without requiring in-memory session stores.
