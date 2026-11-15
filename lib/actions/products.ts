'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { createProduct, deleteProduct, updateProduct, addOrUpdateReview } from '@/lib/catalog'

const productSchema = z.object({
  name: z.string().min(3, 'Product title must be at least 3 characters'),
  description: z.string().min(3, 'Detailed description must be at least 3 characters'),
  category: z.string().min(2, 'Please select a category'),
  price: z.coerce.number().positive('Selling price must be greater than 0'),
  originalPrice: z.coerce.number().positive('Compare-at price must be greater than 0').optional().nullable(),
  image: z
    .string()
    .min(1, 'Product image is required')
    .refine(
      (val) =>
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('/') ||
        val.startsWith('data:image/'),
      'Product image must be a valid URL or path'
    ),
  stock: z.coerce.number().int().min(0, 'Available stock cannot be negative').default(10),
  tag: z.string().optional().nullable(),
  deliveryTime: z.string().optional(),
})

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(['SELLER', 'ADMIN'])
    if (!user.hasSellerAccount && user.role !== 'ADMIN') {
      return { ok: false, error: 'You must activate a seller account first' }
    }

    const originalPriceRaw = formData.get('originalPrice')
    const originalPrice = originalPriceRaw && String(originalPriceRaw).trim() !== '' ? originalPriceRaw : null

    const tagRaw = formData.get('tag')
    const tag = tagRaw && String(tagRaw).trim() !== '' ? String(tagRaw).trim() : null

    const parsed = productSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: formData.get('price'),
      originalPrice,
      image: formData.get('image') || '/images/products/bup-varsity-hoodie.jpg',
      stock: formData.get('stock') || 10,
      tag,
      deliveryTime: formData.get('deliveryTime') || '2-4 days',
    })
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { ok: false, error: firstIssue ? `${firstIssue.message}` : 'Please check product fields' }
    }

    const product = await createProduct({
      sellerId: user.id,
      ...parsed.data,
      originalPrice: parsed.data.originalPrice ?? null,
      tag: parsed.data.tag ?? null,
    })

    revalidatePath('/seller')
    revalidatePath('/shop')
    revalidatePath(`/product/${product.id}`)
    revalidatePath('/buyer')
    revalidatePath('/')
    return { ok: true, id: product.id }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'You must be a seller to list products' }
  }
}

export async function updateProductAction(productId: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(['SELLER', 'ADMIN'])
    if (!user.hasSellerAccount && user.role !== 'ADMIN') {
      return { ok: false, error: 'You must activate a seller account first' }
    }

    const originalPriceRaw = formData.get('originalPrice')
    const originalPrice = originalPriceRaw && String(originalPriceRaw).trim() !== '' ? originalPriceRaw : null

    const tagRaw = formData.get('tag')
    const tag = tagRaw && String(tagRaw).trim() !== '' ? String(tagRaw).trim() : null

    const parsed = productSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: formData.get('price'),
      originalPrice,
      image: formData.get('image'),
      stock: formData.get('stock'),
      tag,
      deliveryTime: formData.get('deliveryTime') || '2-4 days',
    })
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { ok: false, error: firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Please check product fields' }
    }

    const updated = await updateProduct(productId, user.id, {
      ...parsed.data,
      originalPrice: parsed.data.originalPrice ?? null,
      tag: parsed.data.tag ?? null,
      isActive: formData.has('isActive'),
    })
    if (!updated) return { ok: false, error: 'Product not found or unauthorized' }

    revalidatePath('/seller')
    revalidatePath('/shop')
    revalidatePath(`/product/${productId}`)
    revalidatePath('/buyer')
    revalidatePath('/')
    return { ok: true, id: productId }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Unable to update product' }
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const user = await requireUser(['SELLER', 'ADMIN'])
    if (!user.hasSellerAccount && user.role !== 'ADMIN') {
      return { ok: false, error: 'You must activate a seller account first' }
    }

    const ok = await deleteProduct(productId, user.id, user.role === 'ADMIN')
    if (!ok) return { ok: false, error: 'Product not found or unauthorized' }
    revalidatePath('/seller')
    revalidatePath('/shop')
    revalidatePath(`/product/${productId}`)
    revalidatePath('/buyer')
    revalidatePath('/')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Unable to delete product' }
  }
}

export async function submitReviewAction(productId: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(['BUYER', 'SELLER', 'ADMIN'])
    const rating = Number(formData.get('rating') || 5)
    const comment = String(formData.get('comment') || '').trim()

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { ok: false, error: 'Rating must be between 1 and 5 stars' }
    }

    await addOrUpdateReview({
      productId,
      userId: user.id,
      rating,
      comment: comment || undefined,
    })

    revalidatePath('/buyer')
    revalidatePath('/')
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unable to submit review'
    if (msg === 'Unauthorized') return { ok: false, error: 'Please sign in to leave a review' }
    return { ok: false, error: msg }
  }
}

