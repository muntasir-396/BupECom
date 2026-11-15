import mongoose from 'mongoose'
import dns from 'node:dns'

// Ensure DNS SRV lookups work reliably on Windows/local ISP resolvers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

let cached = global.mongooseCache

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null }
}

let hasConnectionFailed = false

export function isMongoConfigured(): boolean {
  if (hasConnectionFailed) return false
  const uri = process.env.MONGODB_URI
  if (!uri || uri.trim() === '') return false
  if (
    uri.includes('<db_username>') ||
    uri.includes('<db_password>') ||
    uri.includes('<username>') ||
    uri.includes('<password>')
  ) {
    return false
  }
  return true
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  let uri = process.env.MONGODB_URI?.trim()

  if (!uri) {
    throw new Error(
      'Missing MONGODB_URI environment variable. Please add it to your .env.local file.'
    )
  }

  // Format URI with database name and retry parameters if missing
  if (uri.endsWith('.mongodb.net/')) {
    uri = `${uri}bup_nest?retryWrites=true&w=majority`
  } else if (uri.endsWith('.mongodb.net')) {
    uri = `${uri}/bup_nest?retryWrites=true&w=majority`
  } else if (!uri.includes('?') && !uri.split('.mongodb.net')[1]?.includes('/')) {
    uri = `${uri}/bup_nest?retryWrites=true&w=majority`
  }

  if (cached!.conn) {
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }

    cached!.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log('✅ Successfully connected to MongoDB Atlas (database: bup_nest)')
        hasConnectionFailed = false
        return mongooseInstance
      })
      .catch((err) => {
        cached!.promise = null
        hasConnectionFailed = true
        console.warn('⚠️ [MongoDB Atlas Connection Warning]:', err.message)
        console.warn('👉 Tip: Check MongoDB Atlas Network Access and ensure IP 0.0.0.0/0 is whitelisted.')
        throw err
      })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    hasConnectionFailed = true
    throw e
  }

  return cached!.conn
}

