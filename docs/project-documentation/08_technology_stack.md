# Technology Stack Analysis: BUP Nest

This document provides a comprehensive inventory of all technologies, libraries, engines, and tools used in the development and operation of BUP Nest. All versions have been verified directly from `package.json` and lockfiles.

---

## 1. Core Runtime & Frameworks

| Technology | Verified Version | Purpose | Actual Usage in Codebase |
|---|---|---|---|
| **Next.js** | `16.4.0` | Full-stack web application framework | Drives App Router (`app/*`), Server Actions (`lib/actions/*`), React Server Components, and Turbopack compiler. |
| **React** | `19.0.0` | Declarative UI library | Core component rendering engine, React transitions (`useTransition`), and contexts. |
| **React DOM** | `19.0.0` | React web renderer | Document Object Model integration for React components. |
| **Node.js** | `^24` / `v22+` | Server runtime environment | Host runtime providing standard library modules (`node:sqlite`, `node:crypto`, `node:path`). |
| **TypeScript** | `5.7.3` | Static type checker | Enforces end-to-end type safety across schemas, actions, props, and database records. |

---

## 2. Database & Data Persistence

| Technology | Verified Version | Purpose | Actual Usage in Codebase |
|---|---|---|---|
| **`node:sqlite`** | Standard Library (`Node v22+`) | Embedded relational SQL database engine | Synchronous `DatabaseSync` driver powering `lib/db.ts` and `data/marketplace.db`. |
| **SQLite WAL Mode** | Native SQLite 3 | Concurrency architecture | Configured via `PRAGMA journal_mode = WAL;` to enable concurrent reads without blocking writes. |
| **Mongoose** | `^9.12.0` | ODM (Declared Dependency) | Declared in `package.json` for optional MongoDB hybrid configurations; primary persistent storage utilizes SQLite. |

---

## 3. Styling & User Interface

| Technology | Verified Version | Purpose | Actual Usage in Codebase |
|---|---|---|---|
| **Tailwind CSS** | `^4.3.3` | Utility-first CSS framework | Applied across all presentation components using modern CSS variables and color palettes. |
| **@tailwindcss/postcss**| `^4.3.3` | PostCSS plugin for Tailwind | Compiles utility classes during Next.js build. |
| **PostCSS** | `^8.5` | CSS transformation tool | Orchestrates CSS processing pipeline (`postcss.config.mjs`). |
| **Lucide React** | `^1.16.0` | Iconography library | Renders consistent vector icons across student, seller, and admin interfaces. |
| **clsx** | `^2.1.1` | Classname utility | Dynamically constructs conditional CSS class strings. |
| **tailwind-merge** | `^3.3.1` | Class conflict resolver | Merges Tailwind class strings safely without style collision. |
| **class-variance-authority**| `^0.7.1` | Component variant utility | Structures reusable UI components with type-safe variant props. |
| **tw-animate-css** | `^1.4.0` | Animation utilities | Powers transition animations and modals. |

---

## 4. Security, Cryptography & Validation

| Technology | Verified Version | Purpose | Actual Usage in Codebase |
|---|---|---|---|
| **jose** | `^6.2.13` | JavaScript Object Signing and Encryption | Signs and verifies compact JWS / HS256 authentication cookies (`bup_nest_session`) in `lib/auth.ts`. |
| **bcryptjs** | `^3.0.3` | Password hashing function | Hashes user passwords with 10 salt rounds during registration and verifies on sign-in. |
| **Zod** | `^4.6.7` | TypeScript-first schema declaration | Validates input formats and parameters. |

---

## 5. Development, Analytics & Package Management

| Technology | Verified Version | Purpose | Actual Usage in Codebase |
|---|---|---|---|
| **pnpm** | `12.3.4` | Package manager | Manages project dependencies with deterministic lockfiles. |
| **@vercel/analytics**| `1.6.1` | Performance & usage analytics | Embedded in root layout for client performance metrics. |
| **shadcn** | `^4.11.0` | Component scaffolding CLI | Used for scaffolding accessible Base UI component patterns. |
| **Turbopack** | Bundled with Next.js | High-performance bundler | Powers `next dev --turbopack` and `next build` compilation. |

---

## 6. Detailed Technical Rationale

1. **Why `node:sqlite` over external databases?**
   - Traditional academic projects often suffer from fragile Docker setups or external database connection failures. Node.js native SQLite is embedded directly into the Node process, requires zero external services, supports instant database resets via `npm run db:reset`, and guarantees deterministic testing.
2. **Why Server Actions over REST controllers?**
   - Next.js 16 Server Actions provide direct RPC invocation from client forms and buttons with built-in CSRF origin validation, cryptographic payload protection, and automatic page revalidation (`revalidatePath`).
3. **Why Tailwind CSS v4?**
   - The new Tailwind v4 engine eliminates the need for legacy `tailwind.config.js` files, allowing seamless CSS theme variables defined directly in `app/globals.css`.
