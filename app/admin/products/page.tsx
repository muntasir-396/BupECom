import React from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  Eye,
  EyeOff,
  Store,
  Plus
} from 'lucide-react'
import { listAdminProducts } from '@/lib/actions/admin'
import { CATEGORIES, formatBdt } from '@/lib/format'
import { ProductActionButtons } from '@/components/admin/ProductActionButtons'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const category = params.category || 'All'
  const status = params.status || 'ALL'

  const products = await listAdminProducts({ q, category, status })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-black/10 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#728383]">
            Content Moderation &amp; Inventory
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">
            Campus Catalog Management
          </h1>
          <p className="mt-1 text-xs text-[#3E4734]">
            Review all items across campus clubs, vendors, and canteens. Delist or tag items directly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#392525] px-4 py-2 text-xs font-semibold text-[#FAF5E9] shadow-sm hover:bg-[#213527] transition"
          >
            <Plus className="size-3.5" />
            <span>Add Campus Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white/70 p-4 rounded-2xl border border-black/10 shadow-xs">
        {/* Search */}
        <form action="/admin/products" method="GET" className="relative flex-1 max-w-md">
          {category !== 'All' && <input type="hidden" name="category" value={category} />}
          {status !== 'ALL' && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by product name, description, or seller..."
            className="w-full rounded-xl border border-black/15 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-[#B25D3E]"
          />
          <Search className="absolute left-3 top-2.5 size-3.5 text-[#728383]" />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 border border-black/5">
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'ACTIVE', label: 'Active Only' },
              { id: 'INACTIVE', label: 'Delisted Only' },
            ].map((s) => {
              const active = status === s.id
              return (
                <Link
                  key={s.id}
                  href={`/admin/products?status=${s.id}${category !== 'All' ? `&category=${encodeURIComponent(category)}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    active ? 'bg-white text-[#392525] shadow-xs' : 'text-[#728383] hover:text-[#392525]'
                  }`}
                >
                  {s.label}
                </Link>
              )
            })}
          </div>

          {(q || category !== 'All' || status !== 'ALL') && (
            <Link
              href="/admin/products"
              className="text-xs text-rose-700 hover:underline px-2 py-1 font-semibold"
            >
              Reset
            </Link>
          )}
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {CATEGORIES.map((cat) => {
          const active = category === cat
          return (
            <Link
              key={cat}
              href={`/admin/products?category=${encodeURIComponent(cat)}${status !== 'ALL' ? `&status=${status}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition ${
                active
                  ? 'bg-[#392525] text-white border-[#392525]'
                  : 'bg-white/60 border-black/10 text-[#392525] hover:bg-white'
              }`}
            >
              {cat}
            </Link>
          )
        })}
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-black/10 bg-white/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5E9] border-b border-black/10 text-[#728383] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Vendor Store</th>
                <th className="py-3.5 px-4">Price &amp; Stock</th>
                <th className="py-3.5 px-4">Status &amp; Tag</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#728383]">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-black/[0.02] transition ${
                      !p.is_active ? 'bg-stone-50/70 opacity-75' : ''
                    }`}
                  >
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          alt={p.name}
                          className="size-11 rounded-xl object-cover border border-black/10 shrink-0"
                        />
                        <div className="min-w-0 max-w-[220px]">
                          <span className="font-semibold text-[#392525] block truncate" title={p.name}>
                            {p.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#728383] mt-0.5">
                            <Star className="size-3 text-amber-500 fill-current" />
                            <span>{p.rating.toFixed(1)}</span>
                            <span>({p.reviews_count} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-semibold text-[#392525]">
                        {p.category}
                      </span>
                    </td>

                    {/* Vendor */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Store className="size-3.5 text-emerald-700 shrink-0" />
                        <span className="font-medium text-[#392525] truncate max-w-[140px]">
                          {p.store_name || p.seller_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#728383] block truncate">
                        {p.seller_type || 'Student Vendor'}
                      </span>
                    </td>

                    {/* Price & Stock */}
                    <td className="py-3 px-4">
                      <span className="font-serif font-bold text-[#392525] block">
                        {formatBdt(p.price)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold block mt-0.5 ${
                          p.stock <= 5 ? 'text-rose-700 font-bold' : 'text-emerald-700'
                        }`}
                      >
                        {p.stock} units available
                      </span>
                    </td>

                    {/* Status & Tag */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.is_active
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-stone-200 text-stone-700 border-stone-300'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Delisted'}
                        </span>
                        {p.tag && (
                          <span className="block text-[10px] font-semibold text-[#B25D3E] truncate max-w-[110px]">
                            Tag: {p.tag}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <ProductActionButtons
                        productId={p.id}
                        productName={p.name}
                        isActive={Boolean(p.is_active)}
                        currentTag={p.tag}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

