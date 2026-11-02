'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { createOrder, getProduct, updateOrderStatus, cancelOrderByBuyer } from '@/lib/catalog'

const checkoutSchema = z.object({
  paymentMethod: z.enum(['COD', 'BKASH', 'NAGAD', 'CARD']),
  deliveryCampus: z.string().optional(),
  deliveryAddress: z.string().optional(),
  phone: z.string().min(6),
  notes: z.string().optional(),
  trxId: z.string().optional(),
  senderPhone: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
})

export type CheckoutResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string }

export async function placeOrderAction(payload: unknown): Promise<CheckoutResult> {
  try {
    const user = await requireUser(['BUYER', 'ADMIN'])
    const parsed = checkoutSchema.safeParse(payload)
    if (!parsed.success) return { ok: false, error: 'Invalid checkout data' }

    if ((parsed.data.paymentMethod === 'BKASH' || parsed.data.paymentMethod === 'NAGAD')) {
      if (!parsed.data.trxId || parsed.data.trxId.trim().length < 4) {
        return { ok: false, error: `Valid Transaction ID (TrxID) is required for ${parsed.data.paymentMethod} payment.` }
      }
    }

    const lineItems = []
    let subtotal = 0

    for (const item of parsed.data.items) {
      const product = getProduct(item.productId)
      if (!product || !product.is_active) {
        return { ok: false, error: 'One or more products are unavailable or deactivated' }
      }
      if (product.stock < item.quantity) {
        return { ok: false, error: `Not enough stock for ${product.name} (Available: ${product.stock})` }
      }
      subtotal += product.price * item.quantity
      lineItems.push({
        productId: product.id,
        sellerId: product.seller_id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      })
    }

    const discount = user.isBupVerified ? Math.round(subtotal * 0.05) : 0
    const deliveryFee = user.isBupVerified || subtotal > 1000 ? 0 : 60
    const total = subtotal - discount + deliveryFee

    const paymentNote = parsed.data.senderPhone
      ? `Sender Phone: ${parsed.data.senderPhone}. ${parsed.data.notes || ''}`.trim()
      : parsed.data.notes

    const order = createOrder({
      buyerId: user.id,
      paymentMethod: parsed.data.paymentMethod,
      paymentStatus: 'PENDING',
      paymentTrxId: parsed.data.trxId,
      subtotal,
      deliveryFee,
      discount,
      total,
      deliveryCampus: parsed.data.deliveryCampus,
      deliveryAddress: parsed.data.deliveryAddress,
      phone: parsed.data.phone,
      notes: paymentNote,
      items: lineItems,
    })

    revalidatePath('/')
    revalidatePath('/buyer')
    revalidatePath('/seller')
    return { ok: true, orderId: order.id, orderNumber: order.order_number }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Checkout failed'
    if (message === 'Unauthorized') return { ok: false, error: 'Please sign in to place an order' }
    return { ok: false, error: message }
  }
}

export async function updateSellerOrderStatusAction(orderId: string, status: string) {
  try {
    const user = await requireUser(['SELLER', 'ADMIN'])
    const allowed = ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!allowed.includes(status)) return { ok: false as const, error: 'Invalid status' }
    const ok = updateOrderStatus(orderId, user.id, status)
    if (!ok) return { ok: false as const, error: 'Order not found' }
    revalidatePath('/seller')
    revalidatePath('/')
    return { ok: true as const }
  } catch {
    return { ok: false as const, error: 'Unable to update order' }
  }
}

export async function cancelBuyerOrderAction(orderId: string) {
  try {
    const user = await requireUser(['BUYER', 'SELLER', 'ADMIN'])
    const ok = cancelOrderByBuyer(orderId, user.id)
    if (!ok) return { ok: false as const, error: 'Order cannot be cancelled' }
    revalidatePath('/')
    revalidatePath('/buyer')
    revalidatePath('/seller')
    return { ok: true as const }
  } catch {
    return { ok: false as const, error: 'Failed to cancel order' }
  }
}

