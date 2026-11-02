'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { createProduct, deleteProduct, updateProduct, addOrUpdateReview } from '@/lib/catalog'

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  price: z.coerce.number().positive(),
  originalPrice: z.coerce.number().positive().optional().nullable(),
  image: z.string().url(),
  stock: z.coerce.number().int().min(0),
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

    const parsed = productSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: formData.get('price'),
      originalPrice: formData.get('originalPrice') || null,
      image: formData.get('image'),
      stock: formData.get('stock'),
      tag: formData.get('tag') || null,
      deliveryTime: formData.get('deliveryTime') || '2-4 days',
    })
    if (!parsed.success) return { ok: false, error: 'Please check product fields' }

    const product = createProduct({
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
  } catch {
    return { ok: false, error: 'You must be a seller to list products' }
  }
}

export async function updateProductAction(productId: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(['SELLER', 'ADMIN'])
    if (!user.hasSellerAccount && user.role !== 'ADMIN') {
      return { ok: false, error: 'You must activate a seller account first' }
    }

    const parsed = productSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: formData.get('price'),
      originalPrice: formData.get('originalPrice') || null,
      image: formData.get('image'),
      stock: formData.get('stock'),
      tag: formData.get('tag') || null,
      deliveryTime: formData.get('deliveryTime') || '2-4 days',
    })
    if (!parsed.success) return { ok: false, error: 'Please check product fields' }

    const updated = updateProduct(productId, user.id, {
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
  } catch {
    return { ok: false, error: 'Unable to update product' }
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const user = await requireUser(['SELLER', 'ADMIN'])
    if (!user.hasSellerAccount && user.role !== 'ADMIN') {
      return { ok: false, error: 'You must activate a seller account first' }
    }

    const ok = deleteProduct(productId, user.id, user.role === 'ADMIN')
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

    addOrUpdateReview({
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

