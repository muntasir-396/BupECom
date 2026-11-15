'use client'

import Link from 'next/link'
import { useCart } from '@/components/marketplace/CartProvider'
import { formatBdt } from '@/lib/format'
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react'

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto size-16 rounded-full bg-[#E3E890]/40 flex items-center justify-center text-[#392525] mb-4">
          <ShoppingBag className="size-8 text-[#B25D3E]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#392525]">Your Cart is Empty</h1>
        <p className="mt-2 text-sm text-[#3E4734] leading-relaxed">
          Looks like you haven&apos;t added any campus merchandise, books, or canteen food yet.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#392525] px-6 py-3 text-sm font-semibold text-[#FAF5E9] shadow-md hover:bg-[#213527] transition"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/buyer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#392525]/20 bg-white/70 px-6 py-3 text-sm font-semibold text-[#392525] hover:bg-white transition"
          >
            <span>Buyer Market</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[rgba(57,37,37,0.1)] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#728383]">
            Shopping Bag
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">Your Selected Items</h1>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-rose-700 hover:underline cursor-pointer"
        >
          Clear entire cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Items List */}
        <ul className="divide-y divide-[rgba(57,37,37,0.08)] rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/70 p-6 shadow-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-5 first:pt-0 last:pb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-20 rounded-xl object-cover border border-black/5 shrink-0"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/product/${item.productId}`}
                      className="font-medium text-[#392525] hover:text-[#B25D3E] transition"
                    >
                      {item.name}
                    </Link>
                    <p className="font-serif text-base font-bold text-[#392525]">
                      {formatBdt(item.price * item.quantity)}
                    </p>
                  </div>
                  {item.sellerName && (
                    <p className="text-xs text-[#728383] mt-0.5">Sold by {item.sellerName}</p>
                  )}
                  <p className="text-xs text-[#3E4734] mt-1">{formatBdt(item.price)} each</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#728383]">Qty:</span>
                    <div className="flex items-center rounded-lg border border-[rgba(57,37,37,0.18)] bg-white">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, Math.max(1, item.quantity - 1))}
                        className="px-2.5 py-1 text-xs text-[#392525] hover:bg-black/5 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs text-[#392525] hover:bg-black/5 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Order Summary Box */}
        <div className="h-fit rounded-3xl border border-[rgba(57,37,37,0.15)] bg-white/80 p-6 shadow-sm">
          <h2 className="font-serif text-xl text-[#392525]">Order Summary</h2>

          <div className="mt-4 space-y-2.5 text-sm text-[#3E4734] border-b border-[rgba(57,37,37,0.08)] pb-4">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[#392525]">{formatBdt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#728383]">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 rounded-xl p-2.5 border border-emerald-200">
              <Sparkles className="size-3.5 shrink-0 text-emerald-600" />
              <span>5% BUP Student discount verified at checkout</span>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-baseline">
            <span className="font-medium text-[#392525]">Subtotal</span>
            <span className="font-serif text-2xl font-bold text-[#B25D3E]">{formatBdt(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#392525] py-3.5 text-sm font-semibold text-[#FAF5E9] shadow-md transition hover:bg-[#213527] cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/shop"
            className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-[#728383] hover:text-[#392525] transition"
          >
            <ArrowLeft className="size-3" />
            <span>Continue Shopping</span>
          </Link>

          <div className="mt-5 flex items-center gap-2 border-t border-[rgba(57,37,37,0.08)] pt-4 text-[11px] text-[#728383]">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>Secure campus transaction with seller pickup &amp; delivery verification</span>
          </div>
        </div>
      </div>
    </div>
  )
}
