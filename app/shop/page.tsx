import Link from 'next/link'
import { listProducts } from '@/lib/catalog'
import { ensureSeeded } from '@/lib/seed'
import { CATEGORIES } from '@/lib/format'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { Search, X, Sparkles, ShoppingBag } from 'lucide-react'

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>
}) {
  await ensureSeeded()
  const params = await searchParams
  const category = params.category || 'All'
  const q = params.q || ''
  const sort = params.sort || 'newest'

  let products = listProducts({ category, q, activeOnly: true })

  if (sort === 'price-low') {
    products = [...products].sort((a, b) => a.price - b.price)
  } else if (sort === 'price-high') {
    products = [...products].sort((a, b) => b.price - a.price)
  } else if (sort === 'rating') {
    products = [...products].sort((a, b) => b.rating - a.rating)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header & Search */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="rounded-full bg-[#E3E890]/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#392525]">
            Public Campus Catalog
          </span>
          <h1 className="mt-2 font-serif text-4xl text-[#392525] sm:text-5xl">Shop the Nest</h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#3E4734]">
            Browse official merch, textbooks, cafeteria dining, tech gear, and lake pop-up stalls. No login required to browse.
          </p>
        </div>

        <form action="/shop" method="GET" className="relative flex w-full max-w-md gap-2">
          {category !== 'All' && <input type="hidden" name="category" value={category} />}
          <div className="relative flex-1">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products, hoodies, clubs..."
              className="w-full rounded-full border border-[rgba(57,37,37,0.2)] bg-white/80 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#B25D3E]"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#728383]" />
          </div>
          <button
            type="submit"
            className="rounded-full bg-[#392525] px-5 py-2.5 text-xs font-semibold text-[#FAF5E9] shadow-sm hover:bg-[#213527] transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills & Active Filter Bar */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => {
          const href = c === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(c)}`
          const active = category === c
          const finalHref = q ? `${href}${c === 'All' ? '?' : '&'}q=${encodeURIComponent(q)}` : href
          return (
            <Link
              key={c}
              href={finalHref}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'bg-[#392525] text-[#FAF5E9] shadow-sm'
                  : 'border border-[rgba(57,37,37,0.14)] bg-white/50 text-[#3E4734] hover:bg-white'
              }`}
            >
              {c}
            </Link>
          )
        })}

        {(category !== 'All' || q) && (
          <Link
            href="/shop"
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#B25D3E] hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </Link>
        )}
      </div>

      {/* Count & Status */}
      <div className="mt-6 flex items-center justify-between text-xs text-[#728383] border-b border-[rgba(57,37,37,0.08)] pb-3">
        <span>
          Showing <strong>{products.length}</strong> available {products.length === 1 ? 'item' : 'items'}
          {category !== 'All' ? ` in "${category}"` : ''}
          {q ? ` matching "${q}"` : ''}
        </span>
        <span className="hidden sm:inline">5% discount on campus checkout for verified students</span>
      </div>

      {/* Products Grid */}
      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="mt-16 rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/60 p-16 text-center text-xs text-[#728383]">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#728383]/40 mb-3" />
          <p className="font-serif text-2xl text-[#392525]">No products found</p>
          <p className="mt-2 text-sm text-[#3E4734]">
            We could not find any active items matching your filters. Try another keyword or browse all categories.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-[#392525] px-6 py-2.5 text-xs font-semibold text-[#FAF5E9]"
          >
            Clear Search &amp; View All
          </Link>
        </div>
      )}
    </div>
  )
}
