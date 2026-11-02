import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getOrder } from '@/lib/catalog'
import { ensureSeeded } from '@/lib/seed'
import { formatBdt } from '@/lib/format'
import { CancelOrderButton } from '@/components/marketplace/CancelOrderButton'
import { CheckCircle2, Clock, MapPin, Package, Phone, Sparkles, Truck, ArrowLeft, ShieldCheck } from 'lucide-react'

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ placed?: string }>
}) {
  const { id } = await params
  const { placed } = await searchParams
  const user = await getSession()
  if (!user) redirect(`/login?redirect=/orders/${id}`)
  const order = getOrder(id)
  if (!order || (order.buyer_id !== user.id && user.role !== 'ADMIN')) notFound()

  const statusConfig: Record<string, { label: string; color: string; desc: string }> = {
    PENDING: {
      label: 'Order Placed · Awaiting Seller Confirmation',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
      desc: 'The seller has received your order request and will confirm shortly.',
    },
    CONFIRMED: {
      label: 'Confirmed by Seller',
      color: 'bg-blue-100 text-blue-900 border-blue-300',
      desc: 'Your items are being prepared for campus handover.',
    },
    SHIPPED: {
      label: 'Dispatched to Campus Point',
      color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      desc: 'The order is en route to your specified campus delivery point.',
    },
    DELIVERED: {
      label: 'Delivered & Completed',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      desc: 'Handover complete. Thank you for supporting campus entrepreneurs!',
    },
    CANCELLED: {
      label: 'Order Cancelled',
      color: 'bg-rose-100 text-rose-900 border-rose-300',
      desc: 'This order was cancelled and inventory has been returned.',
    },
  }

  const currentStatus = statusConfig[order.status] || {
    label: order.status,
    color: 'bg-gray-100 text-gray-900 border-gray-300',
    desc: 'Order status updated.',
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B25D3E] hover:underline mb-4">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Order History</span>
      </Link>

      {placed && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900 shadow-sm animate-in fade-in">
          <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Order placed successfully!</p>
            <p className="mt-0.5 text-xs text-emerald-800">
              The product sellers have been notified on their dashboard. You can track updates here.
            </p>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(57,37,37,0.1)] pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#728383]">BUP Nest Order Receipt</p>
          <h1 className="mt-1 font-serif text-3xl text-[#392525] sm:text-4xl">{order.order_number}</h1>
          <p className="mt-1 text-xs text-[#728383]">
            Placed on {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold ${currentStatus.color}`}>
            <Clock className="h-3.5 w-3.5" />
            <span>{order.status}</span>
          </span>
          <span className="text-xs text-[#728383]">
            Payment: <strong>{order.payment_method}</strong> ({order.payment_status})
          </span>
          {order.payment_trx_id && (
            <span className="text-[11px] font-mono text-[#392525] bg-stone-100 px-2 py-0.5 rounded border border-black/10">
              TrxID: {order.payment_trx_id}
            </span>
          )}
        </div>
      </div>

      {/* Status Notice Banner */}
      <div className="mt-6 rounded-2xl border border-[rgba(57,37,37,0.12)] bg-white/70 p-4 text-xs text-[#3E4734]">
        <p className="font-semibold text-[#392525]">{currentStatus.label}</p>
        <p className="mt-0.5 text-[#728383]">{currentStatus.desc}</p>
      </div>

      {/* Items List */}
      <div className="mt-8 rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/60 p-6 shadow-sm">
        <h2 className="font-serif text-xl text-[#392525]">Items in this order</h2>
        <ul className="mt-4 divide-y divide-[rgba(57,37,37,0.08)]">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4 first:pt-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="h-20 w-16 rounded-xl object-cover shrink-0 border border-black/5" />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product_id}`}
                  className="font-medium text-[#392525] hover:text-[#B25D3E] transition truncate block"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-[#728383]">
                  Quantity: {item.quantity} × {formatBdt(item.price)}
                </p>
              </div>
              <p className="text-sm font-semibold text-[#392525]">{formatBdt(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>

        {/* Financial Breakdown */}
        <div className="mt-6 space-y-2 border-t border-[rgba(57,37,37,0.1)] pt-4 text-sm text-[#3E4734]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatBdt(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between font-medium text-emerald-700">
              <span>Campus Student Discount</span>
              <span>-{formatBdt(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Campus Delivery</span>
            <span>{order.delivery_fee === 0 ? 'Free' : formatBdt(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#392525] pt-2 border-t border-[rgba(57,37,37,0.08)]">
            <span>Total Paid / Payable</span>
            <span className="font-serif text-xl text-[#B25D3E]">{formatBdt(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery & Logistics Details */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[rgba(57,37,37,0.12)] bg-white/60 p-5 text-xs text-[#3E4734]">
          <div className="flex items-center gap-2 font-semibold text-[#392525]">
            <MapPin className="h-4 w-4 text-[#B25D3E]" />
            <span>Campus Delivery Point</span>
          </div>
          <p className="mt-2 font-medium text-[#392525]">{order.delivery_campus || 'Central Library Point'}</p>
          {order.delivery_address && (
            <p className="mt-1 text-[#728383]">Room / Landmark: {order.delivery_address}</p>
          )}
        </div>

        <div className="rounded-2xl border border-[rgba(57,37,37,0.12)] bg-white/60 p-5 text-xs text-[#3E4734]">
          <div className="flex items-center gap-2 font-semibold text-[#392525]">
            <Phone className="h-4 w-4 text-[#213527]" />
            <span>Buyer Contact &amp; Notes</span>
          </div>
          <p className="mt-2 text-[#392525]">Contact: <strong>{order.phone || 'Not provided'}</strong></p>
          {order.notes && (
            <p className="mt-1 text-[#728383]">Order Notes: {order.notes}</p>
          )}
        </div>
      </div>

      {/* Cancellation Option (Only for Pending orders) */}
      {order.status === 'PENDING' && (
        <div className="mt-8">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  )
}
