import { getDb, cuid, type DbProduct, type DbUser, type DbOrder, type DbOrderItem } from '@/lib/db'

export type ProductCard = DbProduct & {
  seller_name: string
  store_name: string | null
  seller_type: string | null
}

export function listProducts(opts?: {
  category?: string
  q?: string
  sellerId?: string
  activeOnly?: boolean
}) {
  const db = getDb()
  const clauses: string[] = []
  const params: (string | number)[] = []

  if (opts?.activeOnly !== false) {
    clauses.push('p.is_active = 1')
  }
  if (opts?.category && opts.category !== 'All') {
    clauses.push('p.category = ?')
    params.push(opts.category)
  }
  if (opts?.sellerId) {
    clauses.push('p.seller_id = ?')
    params.push(opts.sellerId)
  }
  if (opts?.q) {
    clauses.push('(p.name LIKE ? OR p.description LIKE ? OR u.store_name LIKE ? OR u.name LIKE ?)')
    const like = `%${opts.q}%`
    params.push(like, like, like, like)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  return db
    .prepare(
      `SELECT p.*, u.name as seller_name, u.store_name, u.seller_type
       FROM products p
       JOIN users u ON u.id = p.seller_id
       ${where}
       ORDER BY p.created_at DESC`
    )
    .all(...params) as ProductCard[]
}

export function getProduct(id: string) {
  const db = getDb()
  return db
    .prepare(
      `SELECT p.*, u.name as seller_name, u.store_name, u.seller_type, u.id as seller_user_id
       FROM products p
       JOIN users u ON u.id = p.seller_id
       WHERE p.id = ?`
    )
    .get(id) as (ProductCard & { seller_user_id: string }) | undefined
}

export function createProduct(input: {
  sellerId: string
  name: string
  description: string
  category: string
  price: number
  originalPrice?: number | null
  image: string
  stock: number
  tag?: string | null
  deliveryTime?: string
}) {
  const db = getDb()
  const id = cuid()
  db.prepare(
    `INSERT INTO products
      (id, seller_id, name, description, category, price, original_price, image, stock, in_stock, tag, delivery_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.sellerId,
    input.name,
    input.description,
    input.category,
    input.price,
    input.originalPrice ?? null,
    input.image,
    input.stock,
    input.stock > 0 ? 1 : 0,
    input.tag ?? null,
    input.deliveryTime ?? '2-4 days'
  )
  return getProduct(id)!
}

export function updateProduct(
  id: string,
  sellerId: string,
  input: Partial<{
    name: string
    description: string
    category: string
    price: number
    originalPrice: number | null
    image: string
    stock: number
    tag: string | null
    deliveryTime: string
    isActive: boolean
  }>
) {
  return updateProductWithOptions(id, sellerId, input, false)
}

export function updateProductWithOptions(
  id: string,
  sellerId: string,
  input: Partial<{
    name: string
    description: string
    category: string
    price: number
    originalPrice: number | null
    image: string
    stock: number
    tag: string | null
    deliveryTime: string
    isActive: boolean
  }>,
  isAdmin = false
) {
  const existing = getProduct(id)
  if (!existing) return null
  if (!isAdmin && existing.seller_id !== sellerId) return null

  const name = input.name ?? existing.name
  const description = input.description ?? existing.description
  const category = input.category ?? existing.category
  const price = input.price ?? existing.price
  const originalPrice = input.originalPrice !== undefined ? input.originalPrice : existing.original_price
  const image = input.image ?? existing.image
  const stock = input.stock ?? existing.stock
  const tag = input.tag !== undefined ? input.tag : existing.tag
  const deliveryTime = input.deliveryTime ?? existing.delivery_time
  const isActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : existing.is_active

  const db = getDb()
  if (isAdmin) {
    db.prepare(
      `UPDATE products SET
        name = ?, description = ?, category = ?, price = ?, original_price = ?,
        image = ?, stock = ?, in_stock = ?, tag = ?, delivery_time = ?, is_active = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      name,
      description,
      category,
      price,
      originalPrice,
      image,
      stock,
      stock > 0 ? 1 : 0,
      tag,
      deliveryTime,
      isActive,
      id
    )
  } else {
    db.prepare(
      `UPDATE products SET
        name = ?, description = ?, category = ?, price = ?, original_price = ?,
        image = ?, stock = ?, in_stock = ?, tag = ?, delivery_time = ?, is_active = ?,
        updated_at = datetime('now')
       WHERE id = ? AND seller_id = ?`
    ).run(
      name,
      description,
      category,
      price,
      originalPrice,
      image,
      stock,
      stock > 0 ? 1 : 0,
      tag,
      deliveryTime,
      isActive,
      id,
      sellerId
    )
  }
  return getProduct(id)
}

export function deleteProduct(id: string, sellerId: string, isAdmin = false) {
  const db = getDb()
  const result = isAdmin
    ? db.prepare('DELETE FROM products WHERE id = ?').run(id)
    : db.prepare('DELETE FROM products WHERE id = ? AND seller_id = ?').run(id, sellerId)
  return result.changes > 0
}

export function findUserByEmail(email: string) {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email) as DbUser | undefined
}

export function findUserById(id: string) {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined
}

export function createUser(input: {
  email: string
  passwordHash: string
  name: string
  phone?: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  studentId?: string
  department?: string
  isBupVerified?: boolean
  storeName?: string
  storeDescription?: string
  sellerType?: string
  hasBuyerAccount?: boolean
  hasSellerAccount?: boolean
}) {
  const db = getDb()
  const id = cuid()
  const hasBuyer = input.hasBuyerAccount !== undefined ? (input.hasBuyerAccount ? 1 : 0) : (input.role === 'SELLER' ? 0 : 1)
  const hasSeller = input.hasSellerAccount !== undefined ? (input.hasSellerAccount ? 1 : 0) : (input.role === 'SELLER' ? 1 : 0)

  db.prepare(
    `INSERT INTO users
      (id, email, password_hash, name, phone, role, student_id, department, is_bup_verified, store_name, store_description, seller_type, has_buyer_account, has_seller_account)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.email.toLowerCase(),
    input.passwordHash,
    input.name,
    input.phone ?? null,
    input.role,
    input.studentId ?? null,
    input.department ?? null,
    input.isBupVerified ? 1 : 0,
    input.storeName ?? null,
    input.storeDescription ?? null,
    input.sellerType ?? null,
    hasBuyer,
    hasSeller
  )
  return findUserById(id)!
}

export function createOrder(input: {
  buyerId: string
  paymentMethod: 'COD' | 'BKASH' | 'NAGAD' | 'CARD'
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentTrxId?: string
  subtotal?: number
  deliveryFee?: number
  discount?: number
  total?: number
  deliveryCampus?: string
  deliveryAddress?: string
  deliveryPoint?: string
  buyerPhone?: string
  deliveryNotes?: string
  phone?: string
  notes?: string
  items: { productId: string; sellerId: string; name: string; price: number; quantity: number; image?: string }[]
}) {
  const db = getDb()
  const id = cuid()
  const orderNumber = `BUP-${Math.floor(100000 + Math.random() * 900000)}`
  const paymentStatus = input.paymentStatus || 'PENDING'
  const status = 'PENDING'
  const trxId = input.paymentTrxId?.trim() || null

  const computedSubtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const subtotal = typeof input.subtotal === 'number' ? input.subtotal : computedSubtotal
  const deliveryFee = typeof input.deliveryFee === 'number' ? input.deliveryFee : 0
  const discount = typeof input.discount === 'number' ? input.discount : 0
  const total = typeof input.total === 'number' ? input.total : Math.max(0, subtotal + deliveryFee - discount)

  const deliveryCampus = input.deliveryCampus ?? input.deliveryPoint ?? null
  const deliveryAddress = input.deliveryAddress ?? input.deliveryPoint ?? null
  const phone = input.phone ?? input.buyerPhone ?? null
  const notes = input.notes ?? input.deliveryNotes ?? null

  if (trxId) {
    const existingTrx = db.prepare('SELECT 1 FROM orders WHERE payment_trx_id = ? LIMIT 1').get(trxId)
    if (existingTrx) {
      throw new Error('This Transaction ID (TrxID) has already been submitted for another order')
    }
  }

  const insertOrder = db.prepare(
    `INSERT INTO orders
      (id, order_number, buyer_id, status, payment_method, payment_status, payment_trx_id, seller_payout_status, subtotal, delivery_fee, discount, total, delivery_campus, delivery_address, phone, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'UNSETTLED', ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const insertItem = db.prepare(
    `INSERT INTO order_items (id, order_id, product_id, seller_id, name, price, quantity, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const decStock = db.prepare(
    `UPDATE products SET stock = stock - ?, in_stock = CASE WHEN stock - ? <= 0 THEN 0 ELSE 1 END, updated_at = datetime('now')
     WHERE id = ? AND stock >= ?`
  )

  db.exec('BEGIN')
  try {
    insertOrder.run(
      id,
      orderNumber,
      input.buyerId,
      status,
      input.paymentMethod,
      paymentStatus,
      trxId,
      subtotal,
      deliveryFee,
      discount,
      total,
      deliveryCampus,
      deliveryAddress,
      phone,
      notes
    )

    for (const item of input.items) {
      const stockResult = decStock.run(item.quantity, item.quantity, item.productId, item.quantity)
      if (stockResult.changes === 0) {
        throw new Error(`Insufficient stock for ${item.name}`)
      }
      insertItem.run(cuid(), id, item.productId, item.sellerId, item.name, item.price, item.quantity, item.image || '')
    }
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }

  return getOrder(id)!
}

export function getOrder(id: string) {
  const db = getDb()
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as DbOrder | undefined
  if (!order) return null
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id) as DbOrderItem[]
  return { ...order, items }
}

export function getOrderByNumber(orderNumber: string) {
  const db = getDb()
  const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as DbOrder | undefined
  if (!order) return null
  return getOrder(order.id)
}

export function listBuyerOrders(buyerId: string) {
  const db = getDb()
  const orders = db
    .prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC')
    .all(buyerId) as DbOrder[]
  return orders.map((o) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) as DbOrderItem[]
    return { ...o, items }
  })
}

export function listSellerOrders(sellerId: string) {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT DISTINCT o.*
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE oi.seller_id = ?
       ORDER BY o.created_at DESC`
    )
    .all(sellerId) as DbOrder[]

  return rows.map((o) => {
    const items = db
      .prepare('SELECT * FROM order_items WHERE order_id = ? AND seller_id = ?')
      .all(o.id, sellerId) as DbOrderItem[]
    return { ...o, items }
  })
}

export function updateOrderStatus(orderId: string, sellerId: string, status: string) {
  const db = getDb()
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as DbOrder | undefined
  if (!order) return false

  const sellerUser = db.prepare('SELECT role FROM users WHERE id = ?').get(sellerId) as { role: string } | undefined
  const isAdmin = sellerUser?.role === 'ADMIN'
  const owned = db
    .prepare('SELECT 1 FROM order_items WHERE order_id = ? AND seller_id = ? LIMIT 1')
    .get(orderId, sellerId)

  if (!owned && !isAdmin) return false

  // If cancelling order, restore inventory
  if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
    const items = db
      .prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?')
      .all(orderId) as { product_id: string; quantity: number }[]
    const incStock = db.prepare(
      'UPDATE products SET stock = stock + ?, in_stock = 1, updated_at = datetime("now") WHERE id = ?'
    )

    db.exec('BEGIN')
    try {
      db.prepare(`UPDATE orders SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?`).run(orderId)
      for (const item of items) {
        incStock.run(item.quantity, item.product_id)
      }
      db.exec('COMMIT')
      return true
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }
  }

  // If delivered, mark payment settled for COD if delivered or update payout status
  const payoutUpdate = status === 'DELIVERED' ? ", seller_payout_status = 'SETTLED', payment_status = 'PAID'" : ''
  db.prepare(`UPDATE orders SET status = ? ${payoutUpdate}, updated_at = datetime('now') WHERE id = ?`).run(status, orderId)
  return true
}

export function cancelOrderByBuyer(orderId: string, buyerId: string) {
  const db = getDb()
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND buyer_id = ?').get(orderId, buyerId) as DbOrder | undefined
  if (!order || order.status !== 'PENDING') return false

  const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(orderId) as { product_id: string; quantity: number }[]

  const incStock = db.prepare(
    `UPDATE products SET stock = stock + ?, in_stock = 1, updated_at = datetime('now') WHERE id = ?`
  )

  db.exec('BEGIN')
  try {
    db.prepare(`UPDATE orders SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?`).run(orderId)
    for (const item of items) {
      incStock.run(item.quantity, item.product_id)
    }
    db.exec('COMMIT')
    return true
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

export function upgradeUserToSeller(
  userId: string,
  input: { storeName: string; sellerType?: string; phone?: string; storeDescription?: string }
) {
  const db = getDb()
  db.prepare(
    `UPDATE users SET
      role = 'SELLER',
      has_seller_account = 1,
      store_name = ?,
      seller_type = ?,
      store_description = ?,
      phone = COALESCE(?, phone),
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    input.storeName,
    input.sellerType || 'Independent Seller',
    input.storeDescription || `${input.storeName} on BUP Nest`,
    input.phone ?? null,
    userId
  )
  return findUserById(userId)
}

export function openSellerAccount(
  userId: string,
  input: { storeName: string; sellerType?: string; phone?: string; storeDescription?: string }
) {
  const db = getDb()
  db.prepare(
    `UPDATE users SET
      role = CASE WHEN role = 'ADMIN' THEN 'ADMIN' ELSE 'SELLER' END,
      has_seller_account = 1,
      store_name = ?,
      seller_type = ?,
      store_description = ?,
      phone = COALESCE(?, phone),
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    input.storeName,
    input.sellerType || 'Independent Seller',
    input.storeDescription || `${input.storeName} on BUP Nest`,
    input.phone ?? null,
    userId
  )
  return findUserById(userId)
}

export function openBuyerAccount(userId: string) {
  const db = getDb()
  db.prepare(
    `UPDATE users SET
      has_buyer_account = 1,
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(userId)
  return findUserById(userId)
}

export function updateUserProfile(
  userId: string,
  input: { name?: string; phone?: string; storeName?: string; storeDescription?: string }
) {
  const db = getDb()
  db.prepare(
    `UPDATE users SET
      name = COALESCE(?, name),
      phone = COALESCE(?, phone),
      store_name = COALESCE(?, store_name),
      store_description = COALESCE(?, store_description),
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(input.name ?? null, input.phone ?? null, input.storeName ?? null, input.storeDescription ?? null, userId)
  return findUserById(userId)
}

export type ProductReview = {
  id: string
  product_id: string
  user_id: string
  user_name: string
  rating: number
  comment: string | null
  created_at: string
}

export function listProductReviews(productId: string): ProductReview[] {
  const db = getDb()
  return db
    .prepare(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`
    )
    .all(productId) as ProductReview[]
}

export function addOrUpdateReview(input: {
  productId: string
  userId: string
  rating: number
  comment?: string
}) {
  const db = getDb()
  const reviewId = cuid()

  db.exec('BEGIN')
  try {
    db.prepare(
      `INSERT INTO reviews (id, product_id, user_id, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(product_id, user_id) DO UPDATE SET
         rating = excluded.rating,
         comment = excluded.comment,
         created_at = datetime('now')`
    ).run(reviewId, input.productId, input.userId, input.rating, input.comment ?? null)

    const stats = db
      .prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as rev_count FROM reviews WHERE product_id = ?')
      .get(input.productId) as { avg_rating: number | null; rev_count: number }

    db.prepare('UPDATE products SET rating = ?, reviews_count = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
      stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0,
      stats.rev_count,
      input.productId
    )

    db.exec('COMMIT')
    return true
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

export function countUsers() {
  const db = getDb()
  const row = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }
  return row.c
}

