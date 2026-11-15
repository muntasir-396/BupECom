import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { UserModel } from '../lib/db/mongodb/models/User'
import { ProductModel } from '../lib/db/mongodb/models/Product'
import { StallModel } from '../lib/db/mongodb/models/Stall'
import { PRODUCTS, STALLS } from '../lib/mock-data'

function cuid() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

async function runSeed() {
  let uri = process.env.MONGODB_URI?.trim()

  if (!uri) {
    console.error('❌ Error: MONGODB_URI is not set in .env.local')
    process.exit(1)
  }

  if (uri.endsWith('.mongodb.net/')) {
    uri = `${uri}bup_nest?retryWrites=true&w=majority`
  } else if (uri.endsWith('.mongodb.net')) {
    uri = `${uri}/bup_nest?retryWrites=true&w=majority`
  } else if (!uri.includes('?') && !uri.split('.mongodb.net')[1]?.includes('/')) {
    uri = `${uri}/bup_nest?retryWrites=true&w=majority`
  }

  console.log('🔄 Connecting to MongoDB Atlas...')
  await mongoose.connect(uri)
  console.log('✅ Connected to MongoDB Atlas!')
  console.log(`📁 Database: ${mongoose.connection.name || 'bup_nest'}`)

  // 1. Seed Users
  console.log('\n👤 Seeding users...')
  const password = await bcrypt.hash('password123', 10)

  const defaultUsers = [
    {
      customId: 'user_admin',
      email: 'admin@bupnest.com',
      passwordHash: password,
      name: 'BUP Nest Admin',
      role: 'ADMIN',
      phone: '+880 1700 000000',
      isBupVerified: true,
      storeName: 'BUP Administration',
      sellerType: 'BUP Official',
    },
    {
      customId: 'user_tanvir_22041108',
      email: 'buyer@example.com',
      passwordHash: password,
      name: 'Tanvir Ahmed',
      role: 'SELLER',
      studentId: '22041108',
      department: 'ICE / FST',
      phone: '+880 1711 234567',
      isBupVerified: true,
      storeName: "Tanvir's Campus Stall",
      storeDescription: "Tanvir's campus corner on BUP Nest",
      sellerType: 'Student Vendor',
    },
    {
      customId: 'user_alumni',
      email: 'alumni@bupnest.com',
      passwordHash: password,
      name: 'Alumni Welfare Club',
      role: 'SELLER',
      phone: '+880 1800 000001',
      isBupVerified: true,
      storeName: 'BUP Alumni & Student Welfare Club',
      sellerType: 'BUP Official',
    },
    {
      customId: 'user_canteen_central',
      email: 'canteen@bupnest.com',
      passwordHash: password,
      name: 'Central Canteen',
      role: 'SELLER',
      phone: '+880 1800 000002',
      isBupVerified: true,
      storeName: 'Central Canteen (Mirpur Cantonment)',
      sellerType: 'Campus Canteen',
    },
    {
      customId: 'user_fst_society',
      email: 'fst@bupnest.com',
      passwordHash: password,
      name: 'FST Exchange Society',
      role: 'SELLER',
      phone: '+880 1800 000003',
      isBupVerified: true,
      storeName: 'FST Academic Exchange Society',
      sellerType: 'Student Society',
    },
    {
      customId: 'user_robotics',
      email: 'robotics@bupnest.com',
      passwordHash: password,
      name: 'Robotics Syndicate',
      role: 'SELLER',
      phone: '+880 1800 000004',
      isBupVerified: true,
      storeName: 'BUP Robotics & Tech Syndicate',
      sellerType: 'Student Vendor',
    },
    {
      customId: 'user_cultural',
      email: 'culture@bupnest.com',
      passwordHash: password,
      name: 'Cultural Forum',
      role: 'SELLER',
      phone: '+880 1800 000005',
      isBupVerified: true,
      storeName: 'BUP Cultural Forum Craft Stall',
      sellerType: 'Student Society',
    },
    {
      customId: 'user_lake_cafe',
      email: 'lake@bupnest.com',
      passwordHash: password,
      name: 'Lake Cafe',
      role: 'SELLER',
      phone: '+880 1800 000006',
      isBupVerified: true,
      storeName: 'Lake Promenade Cafe',
      sellerType: 'Campus Canteen',
    },
    {
      customId: 'user_bcc',
      email: 'bcc@bupnest.com',
      passwordHash: password,
      name: 'BCC Club',
      role: 'SELLER',
      phone: '+880 1800 000007',
      isBupVerified: true,
      storeName: 'BUP Business & Communication Club (BCC)',
      sellerType: 'Student Society',
    },
    {
      customId: 'user_techhub',
      email: 'techhub@bupnest.com',
      passwordHash: password,
      name: 'Campus Tech Hub',
      role: 'SELLER',
      phone: '+880 1800 000008',
      isBupVerified: true,
      storeName: 'Campus Tech Hub (Mirpur DOHS)',
      sellerType: 'Outside Partner',
    },
  ]

  for (const u of defaultUsers) {
    await UserModel.findOneAndUpdate(
      { email: u.email },
      { $setOnInsert: u },
      { upsert: true, new: true }
    )
  }
  const totalUsers = await UserModel.countDocuments()
  console.log(`✅ Users collection ready: ${totalUsers} accounts in Atlas.`)

  // 2. Map sellers
  const allUsers = await UserModel.find().exec()
  const sellerMap = new Map<string, string>()
  for (const u of allUsers) {
    if (u.storeName) sellerMap.set(u.storeName, u.customId)
  }
  const defaultCanteenId = sellerMap.get('Central Canteen (Mirpur Cantonment)') || allUsers[0]?.customId

  // 3. Seed Products (including all 16 requested breakfast, lunch, and snack canteen items)
  console.log('\n📦 Seeding products collection...')
  let prodInserted = 0
  for (const p of PRODUCTS) {
    const existing = await ProductModel.findOne({
      $or: [{ customId: p.id }, { name: p.name }],
    }).exec()

    if (!existing) {
      const sellerId = sellerMap.get(p.seller) || defaultCanteenId
      await ProductModel.create({
        customId: p.id,
        sellerId,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        image: p.image,
        stock: 50,
        inStock: p.inStock,
        tag: p.tag ?? null,
        deliveryTime: p.deliveryTime,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        isActive: true,
        mealType: p.mealType ?? null,
      })
      prodInserted++
    }
  }
  const totalProducts = await ProductModel.countDocuments()
  console.log(`✅ Products collection ready: ${totalProducts} total catalog items (${prodInserted} new).`)

  // 4. Seed Stalls
  console.log('\n🎪 Seeding lake stalls collection...')
  for (const s of STALLS) {
    await StallModel.findOneAndUpdate(
      { stallId: s.id },
      {
        $setOnInsert: {
          stallId: s.id,
          name: s.name,
          zone: s.zone,
          side: s.side,
          status: s.status,
          position: s.position,
          tone: s.tone,
          dailyRate: s.dailyRate,
          features: s.features,
          coordinates: s.coordinates,
          footfall: s.footfall,
          peakHours: s.peakHours,
          ambience: s.ambience,
          image: s.image,
          dimensions: s.dimensions,
          powerGrid: s.powerGrid,
          recommendedFor: s.recommendedFor,
          description: s.description,
          reservedBy: s.reservedBy ?? null,
        },
      },
      { upsert: true }
    )
  }
  const totalStalls = await StallModel.countDocuments()
  console.log(`✅ Stalls collection ready: ${totalStalls} stalls in Atlas.`)

  console.log('\n🎉 SUCCESS! MongoDB Atlas database "bup_nest" is fully populated!')
  console.log('👉 Go to MongoDB Atlas -> Database -> "Browse Collections" to view your data.')

  await mongoose.disconnect()
  process.exit(0)
}

runSeed().catch((err) => {
  console.error('\n❌ Seeding failed:', err)
  process.exit(1)
})

