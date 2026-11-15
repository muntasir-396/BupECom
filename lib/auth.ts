import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { getDb, type DbUser, type Role } from '@/lib/db'
import { isMongoConfigured, getUserRepository } from './db/index'

const COOKIE_NAME = 'bup_session'
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'bup-nest-dev-secret-change-in-production-32chars')

export type SessionUser = {
  id: string
  email: string
  name: string
  role: Role
  phone: string | null
  studentId: string | null
  isBupVerified: boolean
  storeName: string | null
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

function toSession(user: DbUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    studentId: user.student_id,
    isBupVerified: !!user.is_bup_verified,
    storeName: user.store_name,
  }
}

export async function createSession(user: DbUser | { id: string; email: string; name: string; role: Role }) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret())

  const cookieStore = await cookies()
  const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https') || false
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret())
    const userId = payload.sub
    if (!userId) return null

    if (isMongoConfigured()) {
      const user = await getUserRepository().findById(userId)
      if (!user) return null
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        studentId: user.studentId,
        isBupVerified: user.isBupVerified,
        storeName: user.storeName,
      }
    }

    const db = getDb()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as DbUser | undefined
    if (!user) return null
    return toSession(user)
  } catch {
    return null
  }
}

export async function requireUser(roles?: Role[]) {
  const user = await getSession()
  if (!user) throw new Error('Unauthorized')
  // Unified accounts: all authenticated users can buy and sell.
  // Allow any authenticated user unless a strict ADMIN-only role is specified.
  if (roles && !roles.includes(user.role) && user.role !== 'ADMIN') {
    if (roles.includes('SELLER') || roles.includes('BUYER')) {
      return user
    }
    throw new Error('Forbidden')
  }
  return user
}

export { toSession }
