import { getDb } from '@/lib/db'
import { countUsers, createUser, createProduct } from '@/lib/catalog'
import { hashPassword } from '@/lib/auth'
import { PRODUCTS } from '@/lib/mock-data'

export async function ensureSeeded() {
  const db = getDb()

  if (countUsers() === 0) {
    const password = await hashPassword('password123')

    createUser({
      email: 'admin@bupnest.com',
      passwordHash: password,
      name: 'BUP Nest Admin',
      role: 'ADMIN',
      phone: '+880 1700 000000',
      isBupVerified: true,
    })

    createUser({
      email: 'buyer@example.com',
      passwordHash: password,
      name: 'Tanvir Ahmed',
      role: 'BUYER',
      hasBuyerAccount: true,
      hasSellerAccount: false,
      studentId: '22041108',
      department: 'ICE / FST',
      phone: '+880 1711 234567',
      isBupVerified: true,
    })

    const sellers = [
      {
        email: 'alumni@bupnest.com',
        name: 'Alumni Welfare Club',
        storeName: 'BUP Alumni & Student Welfare Club',
        sellerType: 'BUP Official',
      },
      {
        email: 'canteen@bupnest.com',
        name: 'Central Canteen',
        storeName: 'Central Canteen (Mirpur Cantonment)',
        sellerType: 'Campus Canteen',
      },
      {
        email: 'fst@bupnest.com',
        name: 'FST Exchange Society',
        storeName: 'FST Academic Exchange Society',
        sellerType: 'Student Society',
      },
      {
        email: 'robotics@bupnest.com',
        name: 'Robotics Syndicate',
        storeName: 'BUP Robotics & Tech Syndicate',
        sellerType: 'Student Vendor',
      },
      {
        email: 'culture@bupnest.com',
        name: 'Cultural Forum',
        storeName: 'BUP Cultural Forum Craft Stall',
        sellerType: 'Student Society',
      },
      {
        email: 'lake@bupnest.com',
        name: 'Lake Cafe',
        storeName: 'Lake Promenade Cafe',
        sellerType: 'Campus Canteen',
      },
      {
        email: 'bcc@bupnest.com',
        name: 'BCC Club',
        storeName: 'BUP Business & Communication Club (BCC)',
        sellerType: 'Student Society',
      },
      {
        email: 'techhub@bupnest.com',
        name: 'Campus Tech Hub',
        storeName: 'Campus Tech Hub (Mirpur DOHS)',
        sellerType: 'Outside Partner',
      },
    ]

    for (const s of sellers) {
      createUser({
        email: s.email,
        passwordHash: password,
        name: s.name,
        role: 'SELLER',
        phone: '+880 1800 000000',
        isBupVerified: true,
        storeName: s.storeName,
        storeDescription: `${s.storeName} on BUP Nest marketplace`,
        sellerType: s.sellerType,
      })
    }
  }

  // Sync any products from PRODUCTS into the database
  const userRows = db.prepare('SELECT id, store_name FROM users WHERE store_name IS NOT NULL').all() as { id: string; store_name: string }[]
  const sellerIds: Record<string, string> = {}
  for (const u of userRows) {
    sellerIds[u.store_name] = u.id
  }
  const defaultCanteenId = sellerIds['Central Canteen (Mirpur Cantonment)'] || userRows[0]?.id

  for (const p of PRODUCTS) {
    const existing = db.prepare('SELECT id FROM products WHERE id = ? OR name = ?').get(p.id, p.name) as { id: string } | undefined
    if (!existing) {
      const sellerId = sellerIds[p.seller] || defaultCanteenId
      if (sellerId) {
        db.prepare(
          `INSERT INTO products (id, seller_id, name, description, category, price, original_price, image, stock, in_stock, tag, delivery_time, rating, reviews_count, meal_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          p.id,
          sellerId,
          p.name,
          p.description,
          p.category,
          p.price,
          p.originalPrice ?? null,
          p.image,
          50,
          p.inStock ? 1 : 0,
          p.tag ?? null,
          p.deliveryTime,
          p.rating,
          p.reviewsCount,
          p.mealType ?? null
        )
      }
    } else if (p.mealType) {
      db.prepare('UPDATE products SET meal_type = ? WHERE id = ?').run(p.mealType, existing.id)
    }
  }
}
