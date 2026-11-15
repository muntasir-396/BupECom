import React from 'react'
import Link from 'next/link'
import {
  Package,
  Search,
  Filter,
  DollarSign,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Phone
} from 'lucide-react'
import { listAdminOrders } from '@/lib/actions/admin'
import { formatBdt } from '@/lib/format'
import { OrderActionButtons } from '@/components/admin/OrderActionButtons'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; paymentMethod?: string; payoutStatus?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const status = params.status || 'ALL'
  const paymentMethod = params.paymentMethod || 'ALL'
  const payoutStatus = params.payoutStatus || 'ALL'

  const orders = await listAdminOrders({ q, status, paymentMethod, payoutStatus })

  const statusBadge: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-900 border-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-300',
    SHIPPED: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-900 border-rose-300',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-black/10 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#728383]">
            Fulfillment &amp; Transaction Ledger
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">
            Master Orders Directory
          </h1>
          <p className="mt-1 text-xs text-[#3E4734]">
            Monitor campus orders across all vendors, verify digital payments, and progress fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/payouts"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#392525] px-4 py-2 text-xs font-semibold text-[#FAF5E9] shadow-sm hover:bg-[#213527] transition"
          >
            <DollarSign className="size-3.5 text-[#E3E890]" />
            <span>Vendor Escrow Settlements</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 bg-white/70 p-4 rounded-2xl border border-black/10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search Input */}
          <form action="/admin/orders" method="GET" className="relative flex-1 max-w-md">
            {status !== 'ALL' && <input type="hidden" name="status" value={status} />}
            {paymentMethod !== 'ALL' && <input type="hidden" name="paymentMethod" value={paymentMethod} />}
            {payoutStatus !== 'ALL' && <input type="hidden" name="payoutStatus" value={payoutStatus} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by order number (e.g. BUP-...), TrxID, buyer, phone..."
              className="w-full rounded-xl border border-black/15 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-[#B25D3E]"
            />
            <Search className="absolute left-3 top-2.5 size-3.5 text-[#728383]" />
          </form>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 border border-black/5">
              {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => {
                const active = status === st
                return (
                  <Link
                    key={st}
                    href={`/admin/orders?status=${st}${paymentMethod !== 'ALL' ? `&paymentMethod=${paymentMethod}` : ''}${payoutStatus !== 'ALL' ? `&payoutStatus=${payoutStatus}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                    className={`px-2 py-0.5 rounded-lg font-semibold transition ${
                      active ? 'bg-white text-[#392525] shadow-xs' : 'text-[#728383] hover:text-[#392525]'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st}
                  </Link>
                )
              })}
            </div>

            {(q || status !== 'ALL' || paymentMethod !== 'ALL' || payoutStatus !== 'ALL') && (
              <Link
                href="/admin/orders"
                className="text-xs text-rose-700 hover:underline px-2 py-1 font-semibold"
              >
                Reset
              </Link>
            )}
          </div>
        </div>

        {/* Secondary Filter Line */}
        <div className="flex items-center gap-3 pt-2 border-t border-black/5 text-xs">
          <span className="text-[#728383] font-semibold text-[11px]">Payment Filters:</span>
          {['ALL', 'COD', 'BKASH', 'NAGAD'].map((pm) => (
            <Link
              key={pm}
              href={`/admin/orders?paymentMethod=${pm}${status !== 'ALL' ? `&status=${status}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`px-2 py-0.5 rounded-md font-medium ${
                paymentMethod === pm ? 'bg-[#392525] text-white' : 'text-stone-600 hover:text-black'
              }`}
            >
              {pm}
            </Link>
          ))}

          <span className="text-[#728383] font-semibold text-[11px] ml-4">Escrow:</span>
          {['ALL', 'UNSETTLED', 'SETTLED'].map((po) => (
            <Link
              key={po}
              href={`/admin/orders?payoutStatus=${po}${status !== 'ALL' ? `&status=${status}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`px-2 py-0.5 rounded-md font-medium ${
                payoutStatus === po ? 'bg-[#392525] text-white' : 'text-stone-600 hover:text-black'
              }`}
            >
              {po}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-white/70 p-12 text-center text-xs text-[#728383]">
            No orders match the specified filters.
          </div>
        ) : (
          orders.map((o) => (
            <div
              key={o.id}
              className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-xs transition hover:border-[#B25D3E]"
            >
              {/* Top Row: Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-[#392525]">
                    {o.order_number}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                      statusBadge[o.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {o.status}
                  </span>
                  <span className="text-[11px] text-[#728383]">
                    Placed {new Date(o.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                {/* Right: Payment Status & Payout Status */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-medium text-[#728383]">
                    Method: <strong className="text-[#392525]">{o.payment_method}</strong>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      o.payment_status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    Payment: {o.payment_status}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      o.seller_payout_status === 'SETTLED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    Payout: {o.seller_payout_status}
                  </span>
                </div>
              </div>

              {/* Middle Row: Buyer details & Items */}
              <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1fr] text-xs">
                {/* Buyer & Drop-off info */}
                <div className="space-y-1">
                  <p className="text-[#392525] font-semibold">
                    Buyer: {o.buyer_name} <span className="text-[#728383] font-normal">({o.buyer_email})</span>
                  </p>
                  {o.buyer_student_id && (
                    <p className="text-[11px] text-[#728383]">
                      BUP Student ID: <strong className="text-[#392525] font-mono">{o.buyer_student_id}</strong>
                    </p>
                  )}
                  {o.delivery_campus && (
                    <p className="text-[11px] text-[#3E4734] flex items-center gap-1">
                      <MapPin className="size-3 text-[#B25D3E]" />
                      <span>Drop-off: <strong>{o.delivery_campus}</strong></span>
                    </p>
                  )}
                  {o.phone && (
                    <p className="text-[11px] text-[#728383] flex items-center gap-1">
                      <Phone className="size-3 text-stone-500" />
                      <span>Contact: {o.phone}</span>
                    </p>
                  )}
                  {o.payment_trx_id && (
                    <p className="text-[11px] font-mono bg-stone-100 px-2 py-0.5 rounded border border-black/10 w-fit text-[#392525]">
                      TrxID: {o.payment_trx_id}
                    </p>
                  )}
                  {o.notes && (
                    <p className="text-[11px] italic text-[#728383]">Notes: {o.notes}</p>
                  )}
                </div>

                {/* Items & Financial Breakdown */}
                <div className="space-y-1.5 border-t lg:border-t-0 lg:border-l lg:border-black/5 lg:pl-4">
                  <p className="font-semibold text-[#728383] text-[11px] uppercase tracking-wider">
                    Purchased Items ({o.items.length}):
                  </p>
                  <ul className="space-y-1">
                    {o.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between text-[11px]">
                        <span className="truncate max-w-[240px]">
                          <strong>{item.quantity}×</strong> {item.name}{' '}
                          <span className="text-[#728383]">({item.store_name || item.seller_name})</span>
                        </span>
                        <span className="font-medium text-[#392525]">
                          {formatBdt(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-black/5 flex items-center justify-between font-bold">
                    <span className="text-[#728383]">Total Amount:</span>
                    <span className="font-serif text-sm text-[#392525]">{formatBdt(o.total)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="mt-4 pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-[#728383]">
                  {o.payout_notes ? `Audit note: ${o.payout_notes}` : 'No audit notes attached'}
                </span>
                <OrderActionButtons
                  orderId={o.id}
                  orderNumber={o.order_number}
                  status={o.status}
                  paymentStatus={o.payment_status}
                  paymentMethod={o.payment_method}
                  payoutStatus={o.seller_payout_status}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

