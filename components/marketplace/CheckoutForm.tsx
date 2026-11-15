'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useCart } from '@/components/marketplace/CartProvider'
import { placeOrderAction } from '@/lib/actions/orders'
import { formatBdt } from '@/lib/format'
import { AlertCircle, CheckCircle2, CreditCard, DollarSign, LogIn, ShieldAlert, Sparkles, Truck } from 'lucide-react'

type UserProp = {
  id: string
  name: string
  email: string
  phone: string | null
  studentId: string | null
  isBupVerified: boolean
} | null

export function CheckoutForm({ user }: { user: UserProp }) {
  const { items, subtotal, clear } = useCart()
  const router = useRouter()
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'CARD'>('COD')
  const [senderPhone, setSenderPhone] = useState('')
  const [trxId, setTrxId] = useState('')
  const [pending, startTransition] = useTransition()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-[#392525]">Your bag is empty</h1>
        <p className="mt-2 text-sm text-[#3E4734]">Add items from the campus catalog to proceed with checkout.</p>
        <Link
          href="/buyer"
          className="mt-6 inline-block rounded-full bg-[#392525] px-6 py-3 text-sm font-semibold text-[#FAF5E9]"
        >
          Explore Buyer Market
        </Link>
      </div>
    )
  }

  const isBupStudent = !!user?.isBupVerified
  const discount = isBupStudent ? Math.round(subtotal * 0.05) : 0
  const deliveryFee = isBupStudent || subtotal > 1000 ? 0 : 60
  const total = subtotal - discount + deliveryFee

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#728383]">Checkout</p>
            <h1 className="mt-1 font-serif text-4xl text-[#392525]">Confirm Your Order</h1>
          </div>
          {user && (
            <span className="rounded-full bg-[#E3E890]/60 px-3 py-1 text-xs font-medium text-[#392525]">
              Signed in as {user.name}
            </span>
          )}
        </div>

        {!user && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#B25D3E]/30 bg-[#B25D3E]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-[#392525]">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#B25D3E]" />
              <span>Sign in required before placing your order to link tracking and student discounts.</span>
            </div>
            <Link
              href="/login?redirect=/checkout"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#392525] px-4 py-1.5 text-xs font-semibold text-[#FAF5E9] shadow-sm hover:bg-[#213527]"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign in now</span>
            </Link>
          </div>
        )}

        {isBupStudent && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-medium text-emerald-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>5% verified BUP student discount &amp; free campus delivery applied!</span>
          </div>
        )}

        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            setError('')

            if (!user) {
              setError('Please sign in to place your order.')
              router.push('/login?redirect=/checkout')
              return
            }

            if ((paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') && (!trxId.trim() || !senderPhone.trim())) {
              setError(`Please provide your ${paymentMethod} sender number and Transaction ID (TrxID).`)
              return
            }

            const fd = new FormData(e.currentTarget)
            const rawNotes = String(fd.get('notes') || '')
            const mobilePayInfo =
              paymentMethod === 'BKASH' || paymentMethod === 'NAGAD'
                ? ` [Payment: ${paymentMethod} | Sender: ${senderPhone} | TrxID: ${trxId}]`
                : ''

            startTransition(async () => {
              const result = await placeOrderAction({
                paymentMethod,
                deliveryCampus: String(fd.get('deliveryCampus') || 'Central Library'),
                deliveryAddress: String(fd.get('deliveryAddress') || ''),
                phone: String(fd.get('phone') || ''),
                notes: `${rawNotes}${mobilePayInfo}`.trim(),
                trxId: trxId.trim() || undefined,
                senderPhone: senderPhone.trim() || undefined,
                items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
              })

              if (!result.ok) {
                setError(result.error)
                if (result.error.toLowerCase().includes('sign in')) {
                  router.push('/login?redirect=/checkout')
                }
                return
              }

              clear()
              router.push(`/orders/${result.orderId}?placed=1`)
              router.refresh()
            })
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#392525]">Contact Phone *</span>
              <input
                name="phone"
                required
                defaultValue={user?.phone || ''}
                placeholder="+880 1711 000000"
                className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#392525]">Campus Pickup / Delivery Point *</span>
              <select
                name="deliveryCampus"
                defaultValue="Central Library"
                className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
              >
                <option value="Central Library">Central Library Plaza</option>
                <option value="FST Atrium">FST Faculty Atrium</option>
                <option value="FBS Concourse">FBS Ground Concourse</option>
                <option value="Vista Cafeteria">Vista Cafeteria / Canteen</option>
                <option value="Lake Pavilion">Lake Promenade Pavilion</option>
                <option value="Bijoy Auditorium Plaza">Bijoy 71 Auditorium Plaza</option>
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[#392525]">Detailed Address / Room / Department Notes</span>
            <input
              name="deliveryAddress"
              placeholder="e.g. Room 402, FST Building or Lake Bench side"
              className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[#392525]">Special Instructions for Sellers</span>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. Please call upon arrival; preferred delivery between 1:00 PM and 2:00 PM"
              className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
            />
          </label>

          {/* Payment Method Selector */}
          <div>
            <p className="mb-2 text-sm font-semibold text-[#392525]">Choose Payment Method</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { id: 'COD', label: 'Cash on Delivery', icon: DollarSign },
                  { id: 'BKASH', label: 'bKash', icon: CreditCard },
                  { id: 'NAGAD', label: 'Nagad', icon: CreditCard },
                  { id: 'CARD', label: 'Card / POS', icon: CreditCard },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-xs font-semibold transition ${
                    paymentMethod === m.id
                      ? 'border-[#392525] bg-[#392525] text-[#FAF5E9] shadow-md'
                      : 'border-[rgba(57,37,37,0.18)] bg-white/50 text-[#392525] hover:bg-white'
                  }`}
                >
                  <m.icon className="h-4 w-4" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Banking Instructions & TrxID Input */}
            {(paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') && (
              <div className="mt-4 rounded-2xl border border-[rgba(57,37,37,0.15)] bg-white/80 p-4 text-xs text-[#392525]">
                <p className="font-semibold text-[#B25D3E]">
                  {paymentMethod} Payment Instructions:
                </p>
                <p className="mt-1 leading-relaxed text-[#3E4734]">
                  Send <strong>{formatBdt(total)}</strong> to BUP Nest Official Merchant account:
                  <span className="ml-1 font-mono font-bold text-[#392525]">01700-000000</span> (Personal / Merchant).
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-medium text-[#3E4734] mb-1">
                      Sender {paymentMethod} Number *
                    </label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="e.g. 017xxxxxxxx"
                      className="w-full rounded-xl border border-[rgba(57,37,37,0.2)] bg-white px-3 py-2 text-xs outline-none focus:border-[#B25D3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#3E4734] mb-1">
                      Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. BL9A8BC2K1"
                      className="w-full rounded-xl border border-[rgba(57,37,37,0.2)] bg-white px-3 py-2 text-xs outline-none focus:border-[#B25D3E]"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <p className="mt-2 text-xs text-[#728383]">
                Pay safely in cash directly when picking up your package from the campus coordinator.
              </p>
            )}

            {paymentMethod === 'CARD' && (
              <p className="mt-2 text-xs text-[#728383]">
                Card payment recorded. You may swipe with card machine upon parcel collection.
              </p>
            )}
          </div>

          {error && <p className="text-sm font-semibold text-[#B25D3E]">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B25D3E] py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#974d32] disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{pending ? 'Processing order…' : `Confirm Order · ${formatBdt(total)}`}</span>
          </button>
        </form>
      </div>

      {/* Order Summary Sidebar */}
      <aside className="h-fit rounded-3xl border border-[rgba(57,37,37,0.14)] bg-white/70 p-6 shadow-sm">
        <h2 className="font-serif text-2xl text-[#392525]">Order Summary</h2>
        <ul className="mt-4 divide-y divide-[rgba(57,37,37,0.08)]">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image} alt="" className="h-12 w-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-[#392525]">{i.name}</p>
                <p className="text-[11px] text-[#728383]">{i.sellerName}</p>
                <p className="text-xs text-[#3E4734]">Qty: {i.quantity}</p>
              </div>
              <p className="text-xs font-medium text-[#392525]">{formatBdt(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2 border-t border-[rgba(57,37,37,0.12)] pt-4 text-sm">
          <div className="flex justify-between text-[#3E4734]">
            <span>Items Subtotal</span>
            <span>{formatBdt(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between font-medium text-emerald-700">
              <span>BUP Student Discount (5%)</span>
              <span>-{formatBdt(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-[#3E4734]">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[#728383]" />
              <span>Campus Delivery</span>
            </span>
            <span>{deliveryFee === 0 ? 'Free' : formatBdt(deliveryFee)}</span>
          </div>

          <div className="flex justify-between border-t border-[rgba(57,37,37,0.1)] pt-3 text-lg font-bold text-[#392525]">
            <span>Total Payable</span>
            <span>{formatBdt(total)}</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#E3E890]/30 p-3 text-xs text-[#3E4734] leading-relaxed">
          <p className="font-semibold text-[#392525]">BUP Nest Guarantee:</p>
          Verified student exchange. Sellers notify you as soon as parcels are ready at your chosen pickup point.
        </div>
      </aside>
    </div>
  )
}
