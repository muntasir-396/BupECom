# Configuration and Deployment Guide: BUP Nest Platform

This document outlines the system requirements, runtime prerequisites, environment variable specifications, build procedures, and deployment workflows for the BUP Nest platform.

---

## 1. System Requirements & Runtime Prerequisites

### Minimum Hardware Specifications
- **Processor:** Dual-core 64-bit CPU (Apple Silicon, Intel x86_64, or AMD64).
- **RAM:** Minimum 2 GB (4 GB recommended for Turbopack compilation).
- **Disk Storage:** Minimum 500 MB free storage for `node_modules`, Next.js build cache, and SQLite file (`data/marketplace.db`).

### Software & Runtime Dependencies
- **Node.js:** Version `20.x` or higher (Tested and verified on Node.js `v24.16.0`).
- **Package Manager:** `pnpm` (v12.x recommended; configured via `pnpm@12.3.4`) or `npm` (v10+).
- **Operating System:** macOS (Darwin arm64/x64), Linux (Ubuntu, Debian, Alpine), or Windows 10/11 (WSL2 recommended).

---

## 2. Environment Variables Specification

All environment variables must be defined in `.env.local` for local development or within the deployment platform's environment settings.

> [!IMPORTANT]
> **Security Notice:** In strict compliance with security protocols, only environment variable **names** and their functional descriptions are documented below. Secret keys and connection values are never exposed.

| Environment Variable Name | Required | Default / Fallback | Description & Security Purpose |
|---|---|---|---|
| `AUTH_SECRET` | **YES** | Local dev fallback string | Cryptographic symmetric key used by `jose` to sign and verify HS256 JWT session tokens. Must be a secure random 32+ character string in production. |
| `MONGODB_URI` | OPTIONAL | None | Optional MongoDB connection URI for hybrid or external document storage. *(Note: Not required for core SQLite operations).* |
| `NEXT_PUBLIC_APP_URL` | OPTIONAL | `http://localhost:3000` | Fully qualified base domain URL for constructing absolute links and canonical metadata. |
| `NODE_ENV` | AUTOMATIC | `'development'` | Runtime environment mode (`development`, `production`, `test`). Determines whether session cookies require the `secure` (HTTPS) attribute. |

---

## 3. Installation & Local Development Setup

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd E-Commerce
```

### Step 2: Install Project Dependencies
Using pnpm (recommended):
```bash
pnpm install
```
Or using npm:
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
touch .env.local
```
Add the necessary configuration keys:
```env
AUTH_SECRET=your-secure-random-32-character-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Run the Development Server
```bash
pnpm run dev
# or: npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Step 5: Database Seeding & Reset Commands
The database file (`data/marketplace.db`) automatically initializes and seeds default demo accounts, products, and categories on first launch.

To perform a clean reset of the database:
```bash
pnpm run db:reset
# or: npm run db:reset
```
*Script Definition in `package.json`:*
```json
"db:reset": "rm -f data/marketplace.db && echo 'Database cleared. Restart the app to reseed.'"
```

---

## 4. Production Build & Execution

### Building for Production
Next.js compiles static pages, bundles client scripts, and optimizes server actions:
```bash
pnpm run build
# or: npm run build
```

### Starting the Production Server
```bash
pnpm run start
# or: npm run start
```
The server binds to port `3000` by default (`http://0.0.0.0:3000`).

---

## 5. Deployment Architectures

### A. Deployment on Node.js VPS / Virtual Machine (DigitalOcean, AWS EC2, Linode)
Because BUP Nest uses SQLite (`DatabaseSync`) stored on disk at `./data/marketplace.db`, running on a persistent virtual machine or container with mounted persistent volumes ensures zero database connection overhead and reliable local persistence.

**Process Management with PM2:**
```bash
# Install PM2 globally
npm install -g pm2

# Build application
pnpm run build

# Start process with PM2
pm2 start npm --name "bup-nest" -- start

# Configure startup persistence
pm2 save
pm2 startup
```

**Reverse Proxy Configuration (Nginx with HTTPS):**
```nginx
server {
    server_name bupnest.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### B. Deployment on Vercel Serverless
- Next.js is natively supported on Vercel (`@vercel/analytics` is already included).
- **Important Persistence Consideration:** Vercel functions are stateless and ephemeral; the local `./data/marketplace.db` file will reset on redeployments or serverless cold starts. For persistent multi-user production on Vercel, the database layer should be connected to a remote database service (e.g. Turso libSQL, Supabase Postgres, or MongoDB Atlas using the configured `MONGODB_URI`).

---

## 6. Pre-Configured Demo Accounts for Evaluation

| Role / Persona | Registered Email | Default Password | Initial Configuration | Primary Use Case |
|---|---|---|---|---|
| **Student Buyer** | `buyer@example.com` | `password123` | `has_buyer: 1`, `has_seller: 0`, Verified BUP Student (`22041108`, ICE/FST) | Test purchasing, 5% student discount, cart checkout, order history tracking, and cancellation. |
| **Official Seller**| `alumni@bupnest.com`| `password123` | `has_buyer: 0`, `has_seller: 1`, Store: *BUP Alumni & Student Welfare Club* | Test Seller Studio, product listing creation, pricing updates, and order fulfillment. |
| **Campus Canteen**| `canteen@bupnest.com`| `password123`| `has_buyer: 0`, `has_seller: 1`, Store: *Central Canteen (Mirpur)* | Test dining food listings, lunch pre-orders, and canteen pickup. |
| **Platform Admin** | `admin@bupnest.com` | `password123` | `has_buyer: 1`, `has_seller: 1`, Connected Account, Role: `ADMIN` | Test administrative catalog overrides, order status progression across all stores. |

