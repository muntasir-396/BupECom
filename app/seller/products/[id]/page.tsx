import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getProduct } from '@/lib/catalog'
import { ensureSeeded } from '@/lib/seed'
import { ProductForm } from '@/components/marketplace/ProductForm'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureSeeded()
  const user = await getSession()
  if (!user) redirect('/login?redirect=/seller')
  if (!user.hasSellerAccount && user.role !== 'ADMIN') redirect('/?tab=seller')

  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()

  // Sellers can only edit their own products
  if (product.seller_id !== user.id && user.role !== 'ADMIN') {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/seller"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B25D3E] hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to seller studio</span>
      </Link>
      <h1 className="mt-4 font-serif text-3xl sm:text-4xl text-[#392525]">Edit Product</h1>
      <p className="mt-2 text-xs text-[#3E4734]">
        Update price, stock, active status, and descriptions for &quot;{product.name}&quot;.
      </p>
      <div className="mt-8 rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/70 p-6 sm:p-8 shadow-sm">
        <ProductForm
          initial={{
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            originalPrice: product.original_price,
            image: product.image,
            stock: product.stock,
            tag: product.tag,
            deliveryTime: product.delivery_time,
            isActive: !!product.is_active,
          }}
        />
      </div>
    </div>
  )
}
