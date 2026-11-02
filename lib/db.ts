import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'

const DB_PATH = path.join(process.cwd(), 'data', 'marketplace.db')

let dbInstance: DatabaseSync | null = null

function ensureDir() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function getDb() {
  if (dbInstance) return dbInstance
  ensureDir()
  dbInstance = new DatabaseSync(DB_PATH)
  dbInstance.exec('PRAGMA foreign_keys = ON;')
  migrate(dbInstance)
  return dbInstance
}

function migrate(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'BUYER',
      student_id TEXT,
      department TEXT,
      is_bup_verified INTEGER NOT NULL DEFAULT 0,
      store_name TEXT,
      store_description TEXT,
      seller_type TEXT,
      has_buyer_account INTEGER NOT NULL DEFAULT 1,
      has_seller_account INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      image TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      in_stock INTEGER NOT NULL DEFAULT 1,
      tag TEXT,
      delivery_time TEXT NOT NULL DEFAULT '2-4 days',
      rating REAL NOT NULL DEFAULT 0,
      reviews_count INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      meal_type TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      buyer_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      payment_method TEXT NOT NULL DEFAULT 'COD',
      payment_status TEXT NOT NULL DEFAULT 'PENDING',
      subtotal REAL NOT NULL,
      delivery_fee REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      delivery_campus TEXT,
      delivery_address TEXT,
      phone TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(product_id, user_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);

  `)

  try {
    db.exec('ALTER TABLE users ADD COLUMN has_buyer_account INTEGER NOT NULL DEFAULT 1;')
    db.exec('UPDATE users SET has_buyer_account = CASE WHEN role = "BUYER" OR role = "ADMIN" THEN 1 ELSE 0 END;')
  } catch {}
  try {
    db.exec('ALTER TABLE users ADD COLUMN has_seller_account INTEGER NOT NULL DEFAULT 0;')
    db.exec('UPDATE users SET has_seller_account = CASE WHEN role = "SELLER" OR role = "ADMIN" THEN 1 ELSE 0 END;')
  } catch {}
  try {
    db.exec('ALTER TABLE products ADD COLUMN meal_type TEXT;')
  } catch {}
  try {
    db.exec('ALTER TABLE orders ADD COLUMN payment_trx_id TEXT;')
  } catch {}
  try {
    db.exec("ALTER TABLE orders ADD COLUMN seller_payout_status TEXT NOT NULL DEFAULT 'UNSETTLED';")
  } catch {}
  try {
    db.exec('ALTER TABLE orders ADD COLUMN payout_notes TEXT;')
  } catch {}
}

export function cuid() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export type Role = 'BUYER' | 'SELLER' | 'ADMIN'
export type OrderStatus = 'PENDING' | 'PAID' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentMethod = 'COD' | 'BKASH' | 'NAGAD' | 'CARD'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type DbUser = {
  id: string
  email: string
  password_hash: string
  name: string
  phone: string | null
  role: Role
  student_id: string | null
  department: string | null
  is_bup_verified: number
  store_name: string | null
  store_description: string | null
  seller_type: string | null
  has_buyer_account: number
  has_seller_account: number
  created_at: string
  updated_at: string
}

export type DbProduct = {
  id: string
  seller_id: string
  name: string
  description: string
  category: string
  price: number
  original_price: number | null
  image: string
  stock: number
  in_stock: number
  tag: string | null
  delivery_time: string
  rating: number
  reviews_count: number
  is_active: number
  meal_type: string | null
  created_at: string
  updated_at: string
}

export type DbOrder = {
  id: string
  order_number: string
  buyer_id: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_trx_id: string | null
  seller_payout_status: 'UNSETTLED' | 'SETTLED' | 'HELD'
  payout_notes: string | null
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  delivery_campus: string | null
  delivery_address: string | null
  phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type DbOrderItem = {
  id: string
  order_id: string
  product_id: string
  seller_id: string
  name: string
  price: number
  quantity: number
  image: string
}
