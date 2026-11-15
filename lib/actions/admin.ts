'use server'

import { revalidatePath } from 'next/cache'
import { getDb, cuid, type Role, type DbUser, type DbProduct, type DbOrder, type DbOrderItem, type DbStallBooking, type DbAuditLog } from '@/lib/db'
import { requireAdmin, getSession } from '@/lib/auth'
import { deleteProduct, updateOrderStatus } from '@/lib/catalog'

export type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string }

// Helper to log audit trail
export async function logAudit(action: string, targetEntity: string, targetId: string, details?: string) {
  try {
    const admin = await getSession()
    if (!admin || admin.role !== 'ADMIN') return
    const db = getDb()
    db.prepare(
      `INSERT INTO audit_logs (id, admin_id, admin_name, action, target_entity, target_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).run(cuid(), admin.id, admin.name, action, targetEntity, targetId, details || null)
  } catch {}
}

// -------------------------------------------------------------
// 1. DASHBOARD METRICS & OVERVIEW
// -------------------------------------------------------------
export async function getAdminDashboardStats() {
  await requireAdmin()
  const db = getDb()

  const gmvRow = db.prepare(
    "SELECT COALESCE(SUM(total), 0) as gmv FROM orders WHERE status != 'CANCELLED'"
  ).get() as { gmv: number }

  const unsettledRow = db.prepare(
    "SELECT COALESCE(SUM(subtotal), 0) as unsettled FROM orders WHERE seller_payout_status = 'UNSETTLED' AND status != 'CANCELLED'"
  ).get() as { unsettled: number }

  const totalUsersRow = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }
  const totalVerifiedRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_bup_verified = 1").get() as { count: number }
  const totalSellersRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE has_seller_account = 1").get() as { count: number }

  const totalProductsRow = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number }
  const activeProductsRow = db.prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1").get() as { count: number }

  const totalOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number }
  const pendingOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'PENDING'").get() as { count: number }
  const pendingPaymentRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'PENDING' AND payment_method IN ('BKASH', 'NAGAD')").get() as { count: number }
  const pendingVerificationsRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_bup_verified = 0 AND (student_id IS NOT NULL AND student_id != '')").get() as { count: number }

  const pendingStallRow = db.prepare("SELECT COUNT(*) as count FROM stall_bookings WHERE status = 'PENDING_APPROVAL'").get() as { count: number }

  const ordersByStatus = db.prepare(
    "SELECT status, COUNT(*) as count FROM orders GROUP BY status"
  ).all() as { status: string; count: number }[]

  const recentOrders = db.prepare(
    `SELECT o.*, u.name as buyer_name, u.email as buyer_email,
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
     FROM orders o
     JOIN users u ON u.id = o.buyer_id
     ORDER BY o.created_at DESC LIMIT 6`
  ).all() as (DbOrder & { buyer_name: string; buyer_email: string; item_count: number })[]

  const recentAuditLogs = db.prepare(
    "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 6"
  ).all() as DbAuditLog[]

  return {
    gmv: gmvRow.gmv,
    unsettledLiability: unsettledRow.unsettled,
    totalUsers: totalUsersRow.count,
    verifiedStudents: totalVerifiedRow.count,
    totalSellers: totalSellersRow.count,
    totalProducts: totalProductsRow.count,
    activeProducts: activeProductsRow.count,
    totalOrders: totalOrdersRow.count,
    pendingOrders: pendingOrdersRow.count,
    pendingMfsPayments: pendingPaymentRow.count,
    pendingVerifications: pendingVerificationsRow.count,
    pendingStallBookings: pendingStallRow.count,
    ordersByStatus,
    recentOrders,
    recentAuditLogs,
  }
}

// -------------------------------------------------------------
// 2. USER MANAGEMENT
// -------------------------------------------------------------
export async function listAdminUsers(opts?: { q?: string; role?: string; verified?: string; status?: string }) {
  await requireAdmin()
  const db = getDb()
  const clauses: string[] = []
  const params: (string | number)[] = []

  if (opts?.q) {
    clauses.push("(name LIKE ? OR email LIKE ? OR student_id LIKE ? OR store_name LIKE ?)")
    const like = `%${opts.q}%`
    params.push(like, like, like, like)
  }
  if (opts?.role && opts.role !== 'ALL') {
    clauses.push("role = ?")
    params.push(opts.role)
  }
  if (opts?.verified === 'VERIFIED') {
    clauses.push("is_bup_verified = 1")
  } else if (opts?.verified === 'UNVERIFIED') {
    clauses.push("is_bup_verified = 0")
  }
  if (opts?.status === 'SUSPENDED') {
    clauses.push("is_suspended = 1")
  } else if (opts?.status === 'ACTIVE') {
    clauses.push("(is_suspended = 0 OR is_suspended IS NULL)")
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const users = db.prepare(
    `SELECT u.*,
            (SELECT COUNT(*) FROM orders WHERE buyer_id = u.id) as buyer_orders_count,
            (SELECT COUNT(*) FROM products WHERE seller_id = u.id) as seller_products_count
     FROM users u
     ${where}
     ORDER BY u.created_at DESC`
  ).all(...params) as (DbUser & { buyer_orders_count: number; seller_products_count: number })[]

  return users
}

export async function adminToggleStudentVerificationAction(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as DbUser | undefined
    if (!user) return { ok: false, error: 'User not found' }

    const newStatus = user.is_bup_verified ? 0 : 1
    db.prepare("UPDATE users SET is_bup_verified = ?, updated_at = datetime('now') WHERE id = ?").run(newStatus, userId)

    await logAudit(
      newStatus ? 'VERIFY_STUDENT' : 'REVOKE_STUDENT_VERIFICATION',
      'USER',
      userId,
      `${admin.name} ${newStatus ? 'verified' : 'revoked verification for'} ${user.name} (${user.email})`
    )

    revalidatePath('/admin')
    revalidatePath('/admin/users')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

export async function adminUpdateUserRoleAction(userId: string, newRole: Role): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as DbUser | undefined
    if (!user) return { ok: false, error: 'User not found' }

    let hasBuyer = 1
    let hasSeller = 0
    let storeName = user.store_name

    if (newRole === 'SELLER') {
      hasSeller = 1
      if (!storeName) storeName = `${user.name}'s Campus Store`
    } else if (newRole === 'ADMIN') {
      hasBuyer = 1
      hasSeller = 1
    }

    db.prepare(
      `UPDATE users SET role = ?, has_buyer_account = ?, has_seller_account = ?, store_name = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(newRole, hasBuyer, hasSeller, storeName, userId)

    await logAudit('CHANGE_USER_ROLE', 'USER', userId, `Changed role of ${user.name} to ${newRole}`)

    revalidatePath('/admin')
    revalidatePath('/admin/users')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

export async function adminToggleUserSuspensionAction(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    if (admin.id === userId) return { ok: false, error: 'You cannot suspend your own admin account' }

    const db = getDb()
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as DbUser | undefined
    if (!user) return { ok: false, error: 'User not found' }

    const newSuspended = user.is_suspended ? 0 : 1
    db.prepare("UPDATE users SET is_suspended = ?, updated_at = datetime('now') WHERE id = ?").run(newSuspended, userId)

    await logAudit(
      newSuspended ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
      'USER',
      userId,
      `${newSuspended ? 'Suspended' : 'Reactivated'} account for ${user.name}`
    )

    revalidatePath('/admin/users')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

export async function adminDeleteUserAction(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    if (admin.id === userId) return { ok: false, error: 'You cannot delete your own admin account' }

    const db = getDb()
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as DbUser | undefined
    if (!user) return { ok: false, error: 'User not found' }

    db.prepare("DELETE FROM users WHERE id = ?").run(userId)

    await logAudit('DELETE_USER', 'USER', userId, `Deleted user account: ${user.name} (${user.email})`)

    revalidatePath('/admin')
    revalidatePath('/admin/users')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

// -------------------------------------------------------------
// 3. PRODUCT CATALOG MODERATION
// -------------------------------------------------------------
export async function listAdminProducts(opts?: { q?: string; category?: string; status?: string; sellerId?: string }) {
  await requireAdmin()
  const db = getDb()
  const clauses: string[] = []
  const params: (string | number)[] = []

  if (opts?.q) {
    clauses.push("(p.name LIKE ? OR p.description LIKE ? OR u.store_name LIKE ? OR u.name LIKE ?)")
    const like = `%${opts.q}%`
    params.push(like, like, like, like)
  }
  if (opts?.category && opts.category !== 'All') {
    clauses.push("p.category = ?")
    params.push(opts.category)
  }
  if (opts?.status === 'ACTIVE') {
    clauses.push("p.is_active = 1")
  } else if (opts?.status === 'INACTIVE') {
    clauses.push("p.is_active = 0")
  }
  if (opts?.sellerId) {
    clauses.push("p.seller_id = ?")
    params.push(opts.sellerId)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const products = db.prepare(
    `SELECT p.*, u.name as seller_name, u.store_name, u.seller_type, u.email as seller_email
     FROM products p
     JOIN users u ON u.id = p.seller_id
     ${where}
     ORDER BY p.created_at DESC`
  ).all(...params) as (DbProduct & { seller_name: string; store_name: string | null; seller_type: string | null; seller_email: string })[]

  return products
}

export async function adminToggleProductStatusAction(productId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId) as DbProduct | undefined
    if (!product) return { ok: false, error: 'Product not found' }

    const newActive = product.is_active ? 0 : 1
    db.prepare("UPDATE products SET is_active = ?, updated_at = datetime('now') WHERE id = ?").run(newActive, productId)

    await logAudit(
      newActive ? 'ACTIVATE_PRODUCT' : 'DEACTIVATE_PRODUCT',
      'PRODUCT',
      productId,
      `${newActive ? 'Activated' : 'Delisted'} product: "${product.name}"`
    )

    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
    revalidatePath(`/product/${productId}`)
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

export async function adminDeleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId) as DbProduct | undefined
    if (!product) return { ok: false, error: 'Product not found' }

    deleteProduct(productId, admin.id, true)

    await logAudit('DELETE_PRODUCT', 'PRODUCT', productId, `Deleted product listing: "${product.name}"`)

    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath('/shop')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

export async function adminSetProductTagAction(productId: string, tag: string | null): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    db.prepare("UPDATE products SET tag = ?, updated_at = datetime('now') WHERE id = ?").run(tag || null, productId)

    await logAudit('SET_PRODUCT_TAG', 'PRODUCT', productId, `Set tag to "${tag || 'None'}"`)

    revalidatePath('/admin/products')
    revalidatePath('/shop')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

// -------------------------------------------------------------
// 4. ORDER OVERSIGHT & ESCROW SETTLEMENT
// -------------------------------------------------------------
export async function listAdminOrders(opts?: { q?: string; status?: string; paymentMethod?: string; payoutStatus?: string }) {
  await requireAdmin()
  const db = getDb()
  const clauses: string[] = []
  const params: (string | number)[] = []

  if (opts?.q) {
    clauses.push("(o.order_number LIKE ? OR o.payment_trx_id LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR o.phone LIKE ?)")
    const like = `%${opts.q}%`
    params.push(like, like, like, like, like)
  }
  if (opts?.status && opts.status !== 'ALL') {
    clauses.push("o.status = ?")
    params.push(opts.status)
  }
  if (opts?.paymentMethod && opts.paymentMethod !== 'ALL') {
    clauses.push("o.payment_method = ?")
    params.push(opts.paymentMethod)
  }
  if (opts?.payoutStatus && opts.payoutStatus !== 'ALL') {
    clauses.push("o.seller_payout_status = ?")
    params.push(opts.payoutStatus)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const orders = db.prepare(
    `SELECT o.*, u.name as buyer_name, u.email as buyer_email, u.student_id as buyer_student_id
     FROM orders o
     JOIN users u ON u.id = o.buyer_id
     ${where}
     ORDER BY o.created_at DESC`
  ).all(...params) as (DbOrder & { buyer_name: string; buyer_email: string; buyer_student_id: string | null })[]

  return orders.map((o) => {
    const items = db.prepare(
      `SELECT oi.*, u.store_name, u.name as seller_name
       FROM order_items oi
       JOIN users u ON u.id = oi.seller_id
       WHERE oi.order_id = ?`
    ).all(o.id) as (DbOrderItem & { store_name: string | null; seller_name: string })[]
    return { ...o, items }
  })
}

export async function adminVerifyOrderPaymentAction(orderId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as DbOrder | undefined
    if (!order) return { ok: false, error: 'Order not found' }

    db.prepare("UPDATE orders SET payment_status = 'PAID', updated_at = datetime('now') WHERE id = ?").run(orderId)

    await logAudit(
      'VERIFY_PAYMENT',
      'ORDER',
      orderId,
      `Verified payment for order ${order.order_number} (${order.payment_method}, TrxID: ${order.payment_trx_id || 'N/A'})`
    )

    revalidatePath('/admin')
    revalidatePath('/admin/orders')
    revalidatePath(`/orders/${orderId}`)
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

export async function adminUpdateOrderStatusAction(orderId: string, newStatus: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const allowed = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!allowed.includes(newStatus)) return { ok: false, error: 'Invalid status' }

    const ok = updateOrderStatus(orderId, admin.id, newStatus)
    if (!ok) return { ok: false, error: 'Failed to update order status' }

    await logAudit('UPDATE_ORDER_STATUS', 'ORDER', orderId, `Admin transitioned status to ${newStatus}`)

    revalidatePath('/admin')
    revalidatePath('/admin/orders')
    revalidatePath('/admin/payouts')
    revalidatePath(`/orders/${orderId}`)
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

export async function adminSettleOrderPayoutAction(orderId: string, notes?: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as DbOrder | undefined
    if (!order) return { ok: false, error: 'Order not found' }

    const payoutNotes = notes ? `Admin settled: ${notes}` : `Disbursed by Admin ${admin.name}`
    db.prepare(
      "UPDATE orders SET seller_payout_status = 'SETTLED', payout_notes = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(payoutNotes, orderId)

    await logAudit('SETTLE_PAYOUT', 'ORDER', orderId, `Settled escrow payout for order ${order.order_number}`)

    revalidatePath('/admin')
    revalidatePath('/admin/orders')
    revalidatePath('/admin/payouts')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

export async function getVendorPayoutSummary() {
  await requireAdmin()
  const db = getDb()

  const sellers = db.prepare(
    `SELECT u.id as seller_id, u.name as seller_name, u.store_name, u.phone, u.email,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(CASE WHEN o.status != 'CANCELLED' THEN oi.price * oi.quantity ELSE 0 END), 0) as gross_sales,
            COALESCE(SUM(CASE WHEN o.seller_payout_status = 'UNSETTLED' AND o.status != 'CANCELLED' THEN oi.price * oi.quantity ELSE 0 END), 0) as unsettled_amount,
            COALESCE(SUM(CASE WHEN o.seller_payout_status = 'SETTLED' AND o.status != 'CANCELLED' THEN oi.price * oi.quantity ELSE 0 END), 0) as settled_amount
     FROM users u
     JOIN order_items oi ON oi.seller_id = u.id
     JOIN orders o ON o.id = oi.order_id
     GROUP BY u.id
     ORDER BY unsettled_amount DESC`
  ).all() as {
    seller_id: string
    seller_name: string
    store_name: string | null
    phone: string | null
    email: string
    total_orders: number
    gross_sales: number
    unsettled_amount: number
    settled_amount: number
  }[]

  return sellers
}

export async function adminBulkSettleSellerPayoutsAction(sellerId: string, notes?: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()

    const orderRows = db.prepare(
      `SELECT DISTINCT o.id
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE oi.seller_id = ? AND o.seller_payout_status = 'UNSETTLED' AND o.status != 'CANCELLED'`
    ).all(sellerId) as { id: string }[]

    if (orderRows.length === 0) {
      return { ok: false, error: 'No unsettled orders found for this vendor' }
    }

    const note = notes ? `Bulk settled: ${notes}` : `Bulk settlement by Admin ${admin.name}`
    const updateStmt = db.prepare(
      "UPDATE orders SET seller_payout_status = 'SETTLED', payout_notes = ?, updated_at = datetime('now') WHERE id = ?"
    )

    db.exec('BEGIN')
    try {
      for (const row of orderRows) {
        updateStmt.run(note, row.id)
      }
      db.exec('COMMIT')
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }

    await logAudit('BULK_SETTLE_PAYOUTS', 'SELLER', sellerId, `Bulk settled ${orderRows.length} orders for vendor ID: ${sellerId}`)

    revalidatePath('/admin')
    revalidatePath('/admin/orders')
    revalidatePath('/admin/payouts')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

// -------------------------------------------------------------
// 5. STALL BOOKINGS & SPATIAL RESERVATIONS
// -------------------------------------------------------------
export async function listAdminStallBookings(opts?: { status?: string }) {
  await requireAdmin()
  const db = getDb()
  const clauses: string[] = []
  const params: string[] = []

  if (opts?.status && opts.status !== 'ALL') {
    clauses.push("sb.status = ?")
    params.push(opts.status)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const bookings = db.prepare(
    `SELECT sb.*, u.name as user_name, u.email as user_email, u.phone as user_phone, u.student_id
     FROM stall_bookings sb
     JOIN users u ON u.id = sb.user_id
     ${where}
     ORDER BY sb.created_at DESC`
  ).all(...params) as (DbStallBooking & { user_name: string; user_email: string; user_phone: string | null; student_id: string | null })[]

  return bookings
}

export async function adminUpdateStallBookingStatusAction(
  bookingId: string,
  newStatus: 'APPROVED' | 'REJECTED' | 'COMPLETED',
  notes?: string
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()
    const booking = db.prepare("SELECT * FROM stall_bookings WHERE id = ?").get(bookingId) as DbStallBooking | undefined
    if (!booking) return { ok: false, error: 'Stall booking not found' }

    db.prepare(
      "UPDATE stall_bookings SET status = ?, admin_notes = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(newStatus, notes || null, bookingId)

    await logAudit('UPDATE_STALL_BOOKING', 'STALL', bookingId, `Updated booking (${booking.pass_code}) status to ${newStatus}`)

    revalidatePath('/admin')
    revalidatePath('/admin/stalls')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Operation failed' }
  }
}

export async function createStallBookingAction(formData: FormData): Promise<ActionResult<{ passCode: string }>> {
  try {
    const user = await getSession()
    if (!user) return { ok: false, error: 'Please sign in to book a stall' }

    const stallId = String(formData.get('stallId') || 'stall-1').trim()
    const clubName = String(formData.get('clubName') || user.storeName || `${user.name}'s Enterprise`).trim()
    const purpose = String(formData.get('purpose') || 'Student Club Merch & Handmade Crafts').trim()
    const bookingDate = String(formData.get('bookingDate') || '2026-11-20').trim()
    const durationDays = Math.max(1, Number(formData.get('durationDays') || 1))
    const dailyRate = Number(formData.get('dailyRate') || 1000)

    const rawTotal = dailyRate * durationDays
    const totalCost = user.isBupVerified ? Math.round(rawTotal * 0.85) : rawTotal
    const passCode = `STALL-${stallId}-${Math.floor(1000 + Math.random() * 9000)}`

    const db = getDb()
    const id = cuid()

    db.prepare(
      `INSERT INTO stall_bookings
        (id, stall_id, user_id, club_name, purpose, booking_date, duration_days, total_cost, pass_code, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_APPROVAL', datetime('now'), datetime('now'))`
    ).run(id, stallId, user.id, clubName, purpose, bookingDate, durationDays, totalCost, passCode)

    revalidatePath('/admin')
    revalidatePath('/admin/stalls')
    return { ok: true, data: { passCode } }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to submit stall booking' }
  }
}

// -------------------------------------------------------------
// 6. PLATFORM SETTINGS & ANNOUNCEMENTS
// -------------------------------------------------------------
export async function getPlatformSettings() {
  const db = getDb()
  const rows = db.prepare("SELECT * FROM platform_settings").all() as { key: string; value: string }[]
  const settings: Record<string, string> = {
    announcement_banner: '',
    student_discount_pct: '5',
    delivery_fee_bdt: '60',
  }
  for (const r of rows) {
    settings[r.key] = r.value
  }
  return settings
}

export async function adminSavePlatformSettingsAction(formData: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin()
    const db = getDb()

    const announcement = String(formData.get('announcement_banner') || '').trim()
    const discount = String(formData.get('student_discount_pct') || '5').trim()
    const delivery = String(formData.get('delivery_fee_bdt') || '60').trim()

    const upsert = db.prepare(
      `INSERT INTO platform_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    )

    db.exec('BEGIN')
    try {
      upsert.run('announcement_banner', announcement)
      upsert.run('student_discount_pct', discount)
      upsert.run('delivery_fee_bdt', delivery)
      db.exec('COMMIT')
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }

    await logAudit('UPDATE_SETTINGS', 'PLATFORM', 'CONFIG', `Updated platform settings and announcement banner`)

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/settings')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to save settings' }
  }
}

export async function listAdminAuditLogs(limit: number = 50) {
  await requireAdmin()
  const db = getDb()
  return db.prepare(
    "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?"
  ).all(limit) as DbAuditLog[]
}

export async function adminClearAuditLogsAction(): Promise<ActionResult> {
  try {
    await requireAdmin()
    const db = getDb()
    db.prepare("DELETE FROM audit_logs").run()
    revalidatePath('/admin')
    revalidatePath('/admin/settings')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to clear logs' }
  }
}
