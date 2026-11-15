'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Tag,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import {
  adminToggleProductStatusAction,
  adminDeleteProductAction,
  adminSetProductTagAction
} from '@/lib/actions/admin'

interface ProductActionButtonsProps {
  productId: string
  productName: string
  isActive: boolean
  currentTag: string | null
}

const TAG_OPTIONS = [
  { value: '', label: 'No Tag' },
  { value: 'Official Merch', label: 'Official Merch' },
  { value: 'Winter Drop', label: 'Winter Drop' },
  { value: 'Featured', label: 'Featured' },
  { value: 'Hot Item', label: 'Hot Item' },
  { value: 'Special Discount', label: 'Special Discount' },
]

export function ProductActionButtons({
  productId,
  productName,
  isActive,
  currentTag
}: ProductActionButtonsProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggleStatus = () => {
    startTransition(async () => {
      const res = await adminToggleProductStatusAction(productId)
      if (!res.ok) alert(res.error)
    })
  }

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTag = e.target.value ? e.target.value : null
    startTransition(async () => {
      const res = await adminSetProductTagAction(productId, newTag)
      if (!res.ok) alert(res.error)
    })
  }

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE product: "${productName}"?`)) return
    startTransition(async () => {
      const res = await adminDeleteProductAction(productId)
      if (!res.ok) alert(res.error)
    })
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Activate / Delist Button */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggleStatus}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
          isActive
            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
            : 'bg-stone-200 text-stone-700 hover:bg-stone-300 border border-stone-300'
        }`}
        title={isActive ? "Click to Deactivate/Delist" : "Click to Activate in Public Store"}
      >
        {isPending ? (
          <RefreshCw className="size-3 animate-spin" />
        ) : isActive ? (
          <Eye className="size-3 text-emerald-700" />
        ) : (
          <EyeOff className="size-3 text-stone-500" />
        )}
        <span>{isActive ? 'Active' : 'Hidden'}</span>
      </button>

      {/* Tag Selector */}
      <select
        disabled={isPending}
        value={currentTag || ''}
        onChange={handleTagChange}
        className="px-2 py-1 rounded-lg border border-black/15 bg-white text-xs font-medium text-[#392525] focus:outline-none focus:border-[#B25D3E] cursor-pointer"
        title="Assign Product Badge Tag"
      >
        {TAG_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Edit Product Link */}
      <Link
        href={`/seller/products/${productId}`}
        className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-[#392525] transition"
        title="Edit Product Details"
      >
        <Edit className="size-3.5" />
      </Link>

      {/* View in Public Store */}
      <Link
        href={`/product/${productId}`}
        target="_blank"
        className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-[#392525] transition"
        title="View in Store"
      >
        <ExternalLink className="size-3.5" />
      </Link>

      {/* Delete Product */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="p-1.5 rounded-lg border border-transparent hover:border-rose-300 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
        title="Delete Product Listing"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

