'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Check, Zap } from 'lucide-react'
import { useCart, type CartLine } from '@/components/marketplace/CartProvider'

export function AddToCartButton({
  product,
  label = 'Add',
  className = '',
}: {
  product: Omit<CartLine, 'quantity'>
  label?: string
  className?: string
}) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product)
        setAdded(true)
        setTimeout(() => setAdded(false), 1200)
      }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#392525] px-4 py-2 text-xs font-semibold text-[#FAF5E9] shadow-sm transition hover:bg-[#B25D3E] cursor-pointer ${className}`}
    >
      {added ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Plus className="h-3.5 w-3.5" />}
      <span>{added ? 'Added to Cart' : label}</span>
    </button>
  )
}

export function BuyNowButton({
  product,
  label = 'Buy Now',
  className = '',
}: {
  product: Omit<CartLine, 'quantity'>
  label?: string
  className?: string
}) {
  const { addItem } = useCart()
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product)
        router.push('/checkout')
      }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[#B25D3E] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#96462c] active:scale-95 cursor-pointer ${className}`}
    >
      <Zap className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}
