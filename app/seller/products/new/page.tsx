import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { ProductForm } from '@/components/marketplace/ProductForm'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const user = await getSession()
  if (!user) redirect('/login?redirect=/seller/products/new')
  if (!user.hasSellerAccount && user.role !== 'ADMIN') redirect('/?tab=seller')

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/seller"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B25D3E] hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to seller studio</span>
      </Link>
      <h1 className="mt-4 font-serif text-3xl sm:text-4xl text-[#392525]">Add New Product</h1>
      <p className="mt-2 text-xs text-[#3E4734]">
        List a new item for student buyers across the BUP campus marketplace.
      </p>
      <div className="mt-8 rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/70 p-6 sm:p-8 shadow-sm">
        <ProductForm />
      </div>
    </div>
  )
}
