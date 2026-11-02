import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { listBuyerOrders } from '@/lib/catalog'
import { ensureSeeded } from '@/lib/seed'
import { formatBdt } from '@/lib/format'
import { ShoppingBag, ArrowRight, Clock, PackageCheck, AlertCircle } from 'lucide-react'

export default async function OrdersPage() {
  await ensureSeeded()
  const user = await getSession()
  if (!user) redirect('/login?redirect=/orders')

  const orders = listBuyerOrders(user.id)

  const statusBadge: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-900 border-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-300',
    SHIPPED: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-900 border-rose-300',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[rgba(57,37,37,0.1)] pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#728383]">
            Buyer Dashboard
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">Your Order History</h1>
          <p className="mt-1 text-xs text-[#3E4734]">
            Track fulfillment, campus delivery points, payment verification, and receipts.
          </p>
        </div>
        <span className="rounded-full bg-[#E3E890]/60 px-3 py-1 text-xs font-semibold text-[#392525]">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="mt-14 rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/60 p-12 text-center text-xs text-[#728383]">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#728383]/40 mb-3" />
          <p className="font-serif text-2xl font-bold text-[#392525]">No orders placed yet</p>
          <p className="mt-2 max-w-sm mx-auto text-sm leading-relaxed text-[#3E4734]">
            Explore varsity apparel, academic coursebooks, cafeteria pre-orders, and tech items from campus sellers.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#392525] px-6 py-3 text-xs font-semibold text-[#FAF5E9] shadow-md transition hover:bg-[#213527]"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="group block rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/70 p-5 shadow-sm transition hover:border-[#B25D3E] hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(57,37,37,0.06)] pb-3">
                  <div>
                    <p className="font-serif text-base font-bold text-[#392525] group-hover:text-[#B25D3E] transition">
                      {order.order_number}
                    </p>
                    <p className="text-[11px] text-[#728383]">
                      Placed {new Date(order.created_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${
                        statusBadge[order.status] || 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  {/* Thumbnails */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    {order.items.slice(0, 3).map((item) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={item.id}
                        src={item.image}
                        alt=""
                        className="h-12 w-10 rounded-lg object-cover border border-gray-100 shrink-0"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <span className="flex h-12 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-[#728383]">
                        +{order.items.length - 3}
                      </span>
                    )}
                    <span className="text-xs text-[#3E4734] ml-1">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold text-[#392525]">{formatBdt(order.total)}</p>
                    <p className="text-[11px] text-[#728383]">
                      {order.payment_method} · <span className="uppercase">{order.payment_status}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[rgba(57,37,37,0.06)] pt-2.5 text-[11px] text-[#728383]">
                  <span>Delivery to: <strong>{order.delivery_campus || 'Central Library Point'}</strong></span>
                  <span className="font-semibold text-[#B25D3E] group-hover:underline">Track &amp; View Details →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
