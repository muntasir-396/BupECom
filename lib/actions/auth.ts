'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import {
  createSession,
  destroySession,
  getSession,
  hashPassword,
  verifyPassword,
} from '@/lib/auth'
import { createUser, findUserByEmail, upgradeUserToSeller, updateUserProfile } from '@/lib/catalog'
import { ensureSeeded } from '@/lib/seed'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['BUYER', 'SELLER']).optional(),
  storeName: z.string().optional(),
  sellerType: z.string().optional(),
  studentId: z.string().optional(),
})

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function loginAction(formData: FormData): Promise<ActionResult> {
  await ensureSeeded()
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { ok: false, error: 'Invalid email or password' }

  let user = await findUserByEmail(parsed.data.email)
  if (!user) return { ok: false, error: 'No account found with this email' }

  const valid = await verifyPassword(parsed.data.password, user.password_hash)
  if (!valid) return { ok: false, error: 'Incorrect password' }

  // Unified account: ensure all accounts have full buying and selling privileges
  if (user.role === 'BUYER') {
    const upgraded = await upgradeUserToSeller(user.id, {
      storeName: user.store_name || `${user.name}'s Stall`,
      sellerType: user.seller_type || 'Student Vendor',
    })
    if (upgraded) user = upgraded
  }

  await createSession(user)
  return { ok: true }
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  await ensureSeeded()
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    password: formData.get('password'),
    role: (formData.get('role') as 'BUYER' | 'SELLER') || 'SELLER',
    storeName: formData.get('storeName') || undefined,
    sellerType: formData.get('sellerType') || undefined,
    studentId: formData.get('studentId') || undefined,
  })

  if (!parsed.success) return { ok: false, error: 'Please fill all required fields correctly' }

  if (await findUserByEmail(parsed.data.email)) {
    return { ok: false, error: 'An account with this email already exists' }
  }

  const passwordHash = await hashPassword(parsed.data.password)
  const isBup = parsed.data.email.toLowerCase().endsWith('@bup.edu.bd') || !!parsed.data.studentId
  const storeName = parsed.data.storeName?.trim() || `${parsed.data.name}'s Stall`

  // One unified account grants both buyer & seller capabilities
  const user = await createUser({
    email: parsed.data.email,
    passwordHash,
    name: parsed.data.name,
    phone: parsed.data.phone,
    role: 'SELLER',
    studentId: parsed.data.studentId,
    isBupVerified: isBup,
    storeName: storeName,
    storeDescription: `${storeName} on BUP Nest`,
    sellerType: parsed.data.sellerType || 'Student Vendor',
  })

  await createSession(user)
  return { ok: true }
}

export async function upgradeToSellerAction(formData: FormData): Promise<ActionResult> {
  await ensureSeeded()
  const user = await getSession()
  if (!user) return { ok: false, error: 'Please sign in first' }

  const storeName = String(formData.get('storeName') || '').trim()
  const sellerType = String(formData.get('sellerType') || 'Independent Seller').trim()
  const phone = String(formData.get('phone') || '').trim()
  const storeDescription = String(formData.get('storeDescription') || '').trim()

  if (!storeName || storeName.length < 2) {
    return { ok: false, error: 'Store name is required (at least 2 characters)' }
  }

  const updated = await upgradeUserToSeller(user.id, {
    storeName,
    sellerType,
    phone: phone || undefined,
    storeDescription: storeDescription || `${storeName} on BUP Nest`,
  })

  if (!updated) return { ok: false, error: 'Failed to upgrade account' }

  await createSession(updated)
  return { ok: true }
}

export async function updateUserProfileAction(formData: FormData): Promise<ActionResult> {
  const user = await getSession()
  if (!user) return { ok: false, error: 'Please sign in first' }

  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const storeName = String(formData.get('storeName') || '').trim()
  const storeDescription = String(formData.get('storeDescription') || '').trim()

  const updated = await updateUserProfile(user.id, {
    name: name || undefined,
    phone: phone || undefined,
    storeName: storeName || undefined,
    storeDescription: storeDescription || undefined,
  })

  if (!updated) return { ok: false, error: 'Failed to update profile' }

  await createSession(updated)
  return { ok: true }
}

export async function logoutAction() {
  await destroySession()
  redirect('/')
}

