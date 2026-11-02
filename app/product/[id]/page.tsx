import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct, listProducts, listProductReviews } from '@/lib/catalog'
import { getSession } from '@/lib/auth'
import { ensureSeeded } from '@/lib/seed'
import { formatBdt } from '@/lib/format'
import { AddToCartButton, BuyNowButton } from '@/components/marketplace/AddToCartButton'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { ProductReviews } from '@/components/marketplace/ProductReviews'
import { ArrowLeft, CheckCircle2, ChevronRight, ShieldCheck, Star, Truck, Store } from 'lucide-react'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await ensureSeeded()
  const { id } = await params
  const product = getProduct(id)
  if (!product || !product.is_active) notFound()

  const user = await getSession()
  const reviews = listProductReviews(product.id)

  const related = listProducts({ category: product.category, activeOnly: true })
    .filter((p) => p.id !== product.id)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-[#728383]">
        <Link href="/" className="hover:text-[#392525] transition">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-[#392525] transition">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-[#392525] transition"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate max-w-[200px] text-[#392525] font-medium">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Product Media Display */}
        <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-[#E8E2D4] shadow-md border border-[rgba(57,37,37,0.1)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#E3E890]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#392525]">
                {product.category}
              </span>
              {product.tag && (
                <span className="rounded-full bg-[#B25D3E] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  {product.tag}
                </span>
              )}
            </div>

            <h1 className="mt-4 font-serif text-3xl leading-tight text-[#392525] sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-bold text-[#392525]">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-[#728383]">
                ({product.reviews_count} verified {product.reviews_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-[#3E4734]">
              <Store className="size-3.5 text-emerald-700" />
              <span>Sold by </span>
              <span className="font-semibold text-[#392525]">
                {product.store_name || product.seller_name}
              </span>
              {product.seller_type ? (
                <span className="rounded-full bg-stone-200/80 px-2 py-0.5 text-[10px] font-medium text-[#728383]">
                  {product.seller_type}
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-3xl font-bold text-[#392525]">{formatBdt(product.price)}</p>
              {product.original_price ? (
                <p className="text-base text-[#728383] line-through">
                  {formatBdt(product.original_price)}
                </p>
              ) : null}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-[#3E4734]">{product.description}</p>

            <div className="mt-6 space-y-2.5 rounded-2xl border border-[rgba(57,37,37,0.1)] bg-white/50 p-4 text-xs text-[#3E4734]">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#B25D3E]" />
                <span>
                  Delivery time: <strong>{product.delivery_time}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>
                  Stock status:{' '}
                  <strong>{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#213527]" />
                <span>Campus pickup points: Central Library, FST, FBS, Vista Cafeteria, Lake Promenade.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {product.stock > 0 ? (
              <>
                <BuyNowButton
                  product={{
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    sellerName: product.store_name || product.seller_name,
                  }}
                />
                <AddToCartButton
                  label="Add to Bag"
                  className="px-6 py-3.5 text-sm font-semibold"
                  product={{
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    sellerName: product.store_name || product.seller_name,
                  }}
                />
              </>
            ) : (
              <span className="rounded-full bg-stone-300 px-6 py-3.5 text-sm font-semibold text-stone-600">
                Currently Out of stock
              </span>
            )}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(57,37,37,0.2)] bg-white px-5 py-3.5 text-sm font-medium text-[#392525] hover:bg-black/5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Community Ratings & Reviews Section */}
      <ProductReviews
        productId={product.id}
        reviews={reviews}
        currentUser={user ? { id: user.id, name: user.name } : null}
      />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-[rgba(57,37,37,0.12)] pt-12">
          <h2 className="font-serif text-2xl text-[#392525]">More in {product.category}</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
