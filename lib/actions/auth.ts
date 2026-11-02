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
import {
  createUser,
  findUserByEmail,
  upgradeUserToSeller,
  openSellerAccount,
  openBuyerAccount,
  updateUserProfile,
} from '@/lib/catalog'
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
  connectBoth: z.boolean().optional(),
  storeName: z.string().optional(),
  sellerType: z.string().optional(),
  storeDescription: z.string().optional(),
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

  const user = findUserByEmail(parsed.data.email)
  if (!user) return { ok: false, error: 'No account found with this email' }

  const valid = await verifyPassword(parsed.data.password, user.password_hash)
  if (!valid) return { ok: false, error: 'Incorrect password' }

  await createSession(user)
  return { ok: true }
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  await ensureSeeded()
  const accountType = (formData.get('role') as 'BUYER' | 'SELLER') || 'BUYER'
  const connectBoth = formData.get('connectBoth') === 'true' || formData.get('connectBoth') === 'on'

  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    password: formData.get('password'),
    role: accountType,
    connectBoth,
    storeName: formData.get('storeName') || undefined,
    sellerType: formData.get('sellerType') || undefined,
    storeDescription: formData.get('storeDescription') || undefined,
    studentId: formData.get('studentId') || undefined,
  })

  if (!parsed.success) return { ok: false, error: 'Please fill all required fields correctly' }

  if (findUserByEmail(parsed.data.email)) {
    return { ok: false, error: 'An account with this email already exists' }
  }

  const passwordHash = await hashPassword(parsed.data.password)
  const isBup = parsed.data.email.toLowerCase().endsWith('@bup.edu.bd') || !!parsed.data.studentId

  let hasBuyer = true
  let hasSeller = false
  let storeName: string | undefined = undefined

  if (accountType === 'BUYER') {
    hasBuyer = true
    hasSeller = connectBoth
    if (connectBoth) {
      storeName = parsed.data.storeName?.trim() || `${parsed.data.name}'s Stall`
    }
  } else {
    // SELLER
    hasSeller = true
    hasBuyer = connectBoth
    storeName = parsed.data.storeName?.trim() || `${parsed.data.name}'s Stall`
  }

  const user = createUser({
    email: parsed.data.email,
    passwordHash,
    name: parsed.data.name,
    phone: parsed.data.phone,
    role: accountType,
    hasBuyerAccount: hasBuyer,
    hasSellerAccount: hasSeller,
    studentId: parsed.data.studentId,
    isBupVerified: isBup,
    storeName: storeName,
    storeDescription: storeName ? (parsed.data.storeDescription || `${storeName} on BUP Nest`) : undefined,
    sellerType: hasSeller ? (parsed.data.sellerType || 'Student Vendor') : undefined,
  })

  await createSession(user)
  return { ok: true }
}

export async function openSellerAccountAction(formData: FormData): Promise<ActionResult> {
  await ensureSeeded()
  const user = await getSession()
  if (!user) return { ok: false, error: 'Please sign in first' }

  const storeName = String(formData.get('storeName') || '').trim()
  const sellerType = String(formData.get('sellerType') || 'Student Vendor').trim()
  const phone = String(formData.get('phone') || '').trim()
  const storeDescription = String(formData.get('storeDescription') || '').trim()

  if (!storeName || storeName.length < 2) {
    return { ok: false, error: 'Store name is required (at least 2 characters)' }
  }

  const updated = openSellerAccount(user.id, {
    storeName,
    sellerType,
    phone: phone || undefined,
    storeDescription: storeDescription || `${storeName} on BUP Nest`,
  })

  if (!updated) return { ok: false, error: 'Failed to open seller account' }

  await createSession(updated)
  return { ok: true }
}

export async function openBuyerAccountAction(): Promise<ActionResult> {
  await ensureSeeded()
  const user = await getSession()
  if (!user) return { ok: false, error: 'Please sign in first' }

  const updated = openBuyerAccount(user.id)
  if (!updated) return { ok: false, error: 'Failed to connect buyer account' }

  await createSession(updated)
  return { ok: true }
}

export async function upgradeToSellerAction(formData: FormData): Promise<ActionResult> {
  return openSellerAccountAction(formData)
}

export async function updateUserProfileAction(formData: FormData): Promise<ActionResult> {
  const user = await getSession()
  if (!user) return { ok: false, error: 'Please sign in first' }

  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const storeName = String(formData.get('storeName') || '').trim()
  const storeDescription = String(formData.get('storeDescription') || '').trim()

  const updated = updateUserProfile(user.id, {
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

