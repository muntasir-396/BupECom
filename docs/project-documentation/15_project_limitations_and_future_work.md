# Project Limitations and Future Work: BUP Nest Platform

This document presents a critical, objective evaluation of the current technical limitations of BUP Nest, distinguishing current architectural trade-offs from roadmap opportunities for future development.

---

## 1. Architectural & Database Limitations

### 1. Embedded SQLite In-Process Storage vs Distributed Relational DB
- **Current Reality:** BUP Nest relies on an embedded SQLite database (`data/marketplace.db`) managed via `DatabaseSync`.
- **Limitation:** While SQLite provides microsecond read performance and zero deployment overhead for local lab demonstrations, it does not support multi-instance horizontal scaling (e.g., containerized Kubernetes clusters or multi-region serverless deployments). Write operations lock the database file, creating a throughput ceiling under extreme concurrent write loads.
- **Future Roadmap:** Migrate the persistence driver to a distributed relational database engine (such as PostgreSQL with Prisma or Drizzle ORM, or Turso libSQL edge replication) to support horizontal cluster scaling.

### 2. Ephemeral Serverless Hosting Constraints
- **Current Reality:** Deploying to ephemeral serverless platforms (e.g., Vercel) results in local filesystem resets on container cold starts, which would wipe `marketplace.db`.
- **Future Roadmap:** Offload database storage to a managed database provider (PostgreSQL on Supabase or MongoDB Atlas using the placeholder `MONGODB_URI` already in configuration).

---

## 2. Feature Gaps: Vision vs Actual Implementation

### 1. Physical Lakeside Stall Reservation Persistence
- **Current Reality:** The interactive architectural campus map and stall booking modal (`StallBookingModal.tsx`) represent an innovative user interface demonstration, but bookings are handled purely in client React state. There is no `stalls` or `stall_bookings` table in the SQLite schema.
- **Limitation:** When a user books a stall, the generated pass code is displayed in the UI, but does not persist across page reloads or update a live stall availability calendar.
- **Future Roadmap:** Create dedicated `stalls` and `stall_bookings` relational tables, implement calendar collision detection to prevent double-booking of physical lakeside spots, and attach digital PDF receipt generation.

### 2. Campus Events Schedule Management
- **Current Reality:** Campus club events in `CampusEventsModal.tsx` are read from a static in-memory array (`CAMPUS_EVENTS` in `lib/mock-data.ts`).
- **Limitation:** Student clubs (Robotics Syndicate, Cultural Forum) cannot submit new events or sell event tickets through a dynamic administrative interface.
- **Future Roadmap:** Develop an administrative Event Management Module with ticket tiering, QR code pass generation, and event registration forms.

### 3. Image Storage via External URLs vs S3/Cloudinary Uploads
- **Current Reality:** The product creation form accepts external image URLs or selectable presets from Unsplash.
- **Limitation:** Student sellers cannot upload local image files directly from their smartphones or laptops without hosting them elsewhere first.
- **Future Roadmap:** Implement direct file uploads using AWS S3, Cloudinary, or Cloudflare R2 with automatic server-side image compression and WebP conversion.

---

## 3. Financial & Integration Limitations

### 1. Simulated Mobile Financial Services (bKash / Nagad)
- **Current Reality:** When buyers select bKash or Nagad, the platform validates transaction ID string length and prevents duplicate submissions within the database.
- **Limitation:** The platform cannot verify whether the funds were actually deposited into the seller or escrow account in real time.
- **Future Roadmap:** Integrate the official **bKash Tokenized Checkout API** and **Nagad Payment Gateway SDK**, handling asynchronous server webhooks (`POST /api/webhooks/bkash`) to cryptographically confirm payment capture before updating `payment_status = 'PAID'`.

### 2. Escrow Payout Automation
- **Current Reality:** The database schema introduces `seller_payout_status` (`UNSETTLED` vs `SETTLED`), but actual bank transfers to student vendors must be settled manually by the platform administrator.
- **Future Roadmap:** Implement automated vendor payout disbursement via bKash B2C (Business to Customer) disbursement APIs.

---

## 4. Security & Real-Time Communication Roadmap

### 1. Rate Limiting & Brute-Force Throttling
- **Current Reality:** Authentication actions (`loginAction`, `registerAction`) execute without IP-based rate limiting.
- **Future Roadmap:** Integrate sliding-window rate limiting using `@upstash/ratelimit` or Redis to protect against automated dictionary attacks.

### 2. Multi-Factor Authentication (MFA)
- **Current Reality:** Authentication relies exclusively on email/password credentials.
- **Future Roadmap:** Implement two-factor authentication (2FA) via university institutional email OTP verification or Time-based One-Time Passwords (TOTP via Google Authenticator).

### 3. Real-Time Order Tracking & WebSockets
- **Current Reality:** Order status progression (`CONFIRMED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`) requires manual browser page reloads or Next.js route transitions to view updates.
- **Future Roadmap:** Integrate Server-Sent Events (SSE) or WebSockets (via Pusher or Socket.io) to provide instant desktop/mobile push notifications to buyers when their food or apparel order is ready for campus collection.

