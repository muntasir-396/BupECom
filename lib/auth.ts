import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { getDb, type DbUser, type Role } from '@/lib/db'

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
  hasBuyerAccount: boolean
  hasSellerAccount: boolean
  isBothConnected: boolean
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

function toSession(user: DbUser): SessionUser {
  const hasBuyer = user.role === 'ADMIN' || Boolean(user.has_buyer_account ?? (user.role === 'BUYER' ? 1 : 0))
  const hasSeller = user.role === 'ADMIN' || Boolean(user.has_seller_account ?? (user.role === 'SELLER' ? 1 : 0))
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    studentId: user.student_id,
    isBupVerified: !!user.is_bup_verified,
    storeName: user.store_name,
    hasBuyerAccount: hasBuyer,
    hasSellerAccount: hasSeller,
    isBothConnected: hasBuyer && hasSeller,
  }
}

export async function createSession(user: DbUser) {
  const sessionUser = toSession(user)
  const token = await new SignJWT({
    sub: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name,
    role: sessionUser.role,
    hasBuyerAccount: sessionUser.hasBuyerAccount,
    hasSellerAccount: sessionUser.hasSellerAccount,
    isBothConnected: sessionUser.isBothConnected,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret())

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
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
  if (roles) {
    if (user.role === 'ADMIN') return user
    const isAllowed = roles.some((r) => {
      if (r === 'BUYER') return user.hasBuyerAccount
      if (r === 'SELLER') return user.hasSellerAccount
      return user.role === r
    })
    if (!isAllowed) throw new Error('Forbidden')
  }
  return user
}

export { toSession }
