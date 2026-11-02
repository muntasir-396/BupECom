import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { listSellerOrders } from '@/lib/catalog'
import { ensureSeeded } from '@/lib/seed'
import { formatBdt } from '@/lib/format'
import { updateSellerOrderStatusAction } from '@/lib/actions/orders'
import { ArrowLeft, Clock, MapPin, Package, Phone, CheckCircle2, DollarSign } from 'lucide-react'

export default async function SellerOrdersPage() {
  await ensureSeeded()
  const user = await getSession()
  if (!user) redirect('/login?redirect=/seller/orders')
  if (!user.hasSellerAccount && user.role !== 'ADMIN') redirect('/?tab=seller')

  const orders = listSellerOrders(user.id)

  const statusBadge: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-900 border-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-300',
    SHIPPED: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-900 border-rose-300',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/seller"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B25D3E] hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Seller Hub</span>
      </Link>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[rgba(57,37,37,0.1)] pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#728383]">
            Seller Studio
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">Customer Orders</h1>
          <p className="mt-1 text-xs text-[#3E4734]">
            Manage, confirm, ship, and deliver campus orders containing your store items.
          </p>
        </div>
        <span className="rounded-full bg-[#E3E890]/60 px-3.5 py-1 text-xs font-bold text-[#392525]">
          {orders.length} Total {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      <ul className="mt-8 space-y-6">
        {orders.map((order) => (
          <li
            key={order.id}
            className="rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/80 p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(57,37,37,0.08)] pb-4">
              <div>
                <p className="font-serif text-lg font-bold text-[#392525]">{order.order_number}</p>
                <p className="text-[11px] text-[#728383]">
                  Placed {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    statusBadge[order.status] || 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  {order.status}
                </span>
                <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-[#728383]">
                  Payout: {order.seller_payout_status || 'UNSETTLED'}
                </span>
              </div>
            </div>

            {/* Items for this seller */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-[#728383] uppercase tracking-wider mb-2">
                Your Store Items in this Order:
              </p>
              <ul className="divide-y divide-[rgba(57,37,37,0.06)]">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="h-10 w-8 rounded-lg object-cover border border-black/5" />
                      <div>
                        <span className="font-semibold text-[#392525]">{item.name}</span>
                        <span className="text-[#728383] block">Qty: {item.quantity} × {formatBdt(item.price)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#392525]">
                      {formatBdt(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Buyer Contact & Pickup Point */}
            <div className="mt-4 grid gap-3 rounded-2xl bg-[rgba(57,37,37,0.03)] p-4 text-xs sm:grid-cols-2">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 font-semibold text-[#392525]">
                  <Phone className="h-3.5 w-3.5 text-[#B25D3E]" />
                  <span>Buyer Contact:</span>
                </span>
                {order.phone ? (
                  <a href={`tel:${order.phone}`} className="text-[#B25D3E] underline font-medium block">
                    {order.phone}
                  </a>
                ) : (
                  <span className="text-[#728383]">Not provided</span>
                )}
                <span className="text-[#728383] block">
                  Payment: <strong>{order.payment_method}</strong> ({order.payment_status})
                </span>
                {order.payment_trx_id && (
                  <span className="text-[11px] font-mono text-[#392525] block">
                    TrxID: {order.payment_trx_id}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1.5 font-semibold text-[#392525]">
                  <MapPin className="h-3.5 w-3.5 text-[#213527]" />
                  <span>Delivery Campus Point:</span>
                </span>
                <span className="font-medium text-[#392525] block">
                  {order.delivery_campus || 'Central Library Point'}
                </span>
                {order.delivery_address && (
                  <span className="text-[#728383] block">Room/Notes: {order.delivery_address}</span>
                )}
                {order.notes && (
                  <span className="text-amber-800 block text-[11px] font-medium">Customer Note: {order.notes}</span>
                )}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="mt-5 border-t border-[rgba(57,37,37,0.08)] pt-4">
              <span className="block text-xs font-semibold text-[#728383] mb-2">
                Update Fulfillment Status:
              </span>
              <div className="flex flex-wrap gap-2">
                {(['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map((status) => {
                  const isCurrent = order.status === status
                  return (
                    <form
                      key={status}
                      action={async () => {
                        'use server'
                        await updateSellerOrderStatusAction(order.id, status)
                      }}
                    >
                      <button
                        type="submit"
                        disabled={isCurrent}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                          isCurrent
                            ? 'bg-[#392525] text-[#FAF5E9] cursor-default opacity-90'
                            : 'border border-[rgba(57,37,37,0.2)] bg-white text-[#392525] hover:bg-[rgba(57,37,37,0.06)]'
                        }`}
                      >
                        {isCurrent ? `✓ ${status}` : `Mark ${status.toLowerCase()}`}
                      </button>
                    </form>
                  )
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {orders.length === 0 && (
        <div className="mt-14 rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/60 p-12 text-center text-xs text-[#728383]">
          <Package className="mx-auto h-12 w-12 text-[#728383]/40 mb-2" />
          <p className="font-semibold text-base text-[#392525]">No customer orders yet</p>
          <p className="mt-1">When students or campus visitors purchase your items, their orders will appear here for you to fulfill.</p>
        </div>
      )}
    </div>
  )
}
