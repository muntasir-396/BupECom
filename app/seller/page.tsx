import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { listProducts, listSellerOrders, findUserById } from '@/lib/catalog'
import { ensureSeeded } from '@/lib/seed'
import { formatBdt } from '@/lib/format'
import { deleteProductAction } from '@/lib/actions/products'
import { SellerSettingsModal } from '@/components/marketplace/SellerSettingsModal'
import { Package, ShoppingBag, DollarSign, Plus, ExternalLink, Trash2, Edit, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SellerDashboardPage() {
  await ensureSeeded()
  const user = await getSession()
  if (!user) redirect('/login?redirect=/seller')
  
  // If user does not have a seller account yet, redirect to seller onboarding
  if (!user.hasSellerAccount && user.role !== 'ADMIN') {
    redirect('/?tab=seller')
  }

  const dbUser = findUserById(user.id)
  const products = listProducts({ sellerId: user.id, activeOnly: false })
  const orders = listSellerOrders(user.id)
  const revenue = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  )
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header with Title and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#E3E890]/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#392525]">
              Seller Studio &amp; Dashboard
            </span>
            {user.isBothConnected && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Connected Account
              </span>
            )}
          </div>
          <h1 className="mt-2 font-serif text-3xl text-[#392525] sm:text-4xl">
            {user.storeName || user.name}
          </h1>
          <p className="mt-1 text-xs text-[#3E4734]">
            {dbUser?.store_description || 'Manage product listings, inventory, and fulfill incoming campus orders.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SellerSettingsModal
            initial={{
              name: user.name,
              storeName: user.storeName,
              phone: user.phone,
              storeDescription: dbUser?.store_description,
            }}
          />
          <Link
            href="/seller/orders"
            className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(57,37,37,0.18)] bg-white/70 px-4 py-2 text-sm font-medium text-[#392525] hover:bg-white transition"
          >
            <Package className="h-4 w-4 text-[#B25D3E]" />
            <span>Orders ({orders.length})</span>
            {pendingOrders > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.2 text-[10px] font-bold text-white">
                {pendingOrders} new
              </span>
            )}
          </Link>
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#392525] px-4 py-2 text-sm font-semibold text-[#FAF5E9] shadow-sm hover:bg-[#213527] transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[rgba(57,37,37,0.1)] bg-white/60 p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#728383]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Listings</span>
            <ShoppingBag className="h-4 w-4 text-[#B25D3E]" />
          </div>
          <p className="mt-3 font-serif text-4xl text-[#392525]">{products.length}</p>
          <p className="mt-1 text-xs text-[#728383]">Total products in your store</p>
        </div>

        <div className="rounded-3xl border border-[rgba(57,37,37,0.1)] bg-white/60 p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#728383]">
            <span className="text-xs font-bold uppercase tracking-wider">Customer Orders</span>
            <Package className="h-4 w-4 text-[#213527]" />
          </div>
          <p className="mt-3 font-serif text-4xl text-[#392525]">{orders.length}</p>
          <p className="mt-1 text-xs text-[#728383]">
            {pendingOrders > 0 ? `${pendingOrders} order(s) awaiting fulfillment` : 'All orders up to date'}
          </p>
        </div>

        <div className="rounded-3xl border border-[rgba(57,37,37,0.1)] bg-white/60 p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#728383]">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 font-serif text-4xl text-[#392525]">{formatBdt(revenue)}</p>
          <p className="mt-1 text-xs text-[#728383]">Marketplace held — pending delivery settlement</p>
        </div>
      </div>

      {/* Product Listings Table */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#392525]">Your Products</h2>
          <span className="text-xs text-[#728383]">{products.length} listed</span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-3xl border border-[rgba(57,37,37,0.12)] bg-white/70 shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[rgba(57,37,37,0.1)] bg-[rgba(57,37,37,0.03)] text-xs uppercase tracking-wider text-[#728383]">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(57,37,37,0.06)]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" className="h-12 w-10 rounded-lg object-cover" />
                      <div>
                        <span className="font-semibold text-[#392525] block">{p.name}</span>
                        <Link
                          href={`/product/${p.id}`}
                          className="inline-flex items-center gap-1 text-[11px] text-[#B25D3E] hover:underline"
                        >
                          <span>View on campus store</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#3E4734]">{p.category}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-[#392525]">{formatBdt(p.price)}</td>
                  <td className="py-3 px-4 text-xs text-[#3E4734]">
                    {p.stock > 0 ? (
                      <span className="font-medium text-emerald-800">{p.stock} units</span>
                    ) : (
                      <span className="font-medium text-rose-700">Out of stock</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {p.is_active ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/seller/products/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#B25D3E] hover:underline"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Link>
                      <form
                        action={async () => {
                          'use server'
                          await deleteProductAction(p.id)
                        }}
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="py-16 text-center text-xs text-[#728383]">
              <ShoppingBag className="mx-auto h-10 w-10 text-[#728383]/50 mb-2" />
              <p className="font-semibold text-base text-[#392525]">You have no listings yet</p>
              <p className="mt-1">Start selling hoodies, textbooks, tech gear, or snacks to students.</p>
              <Link
                href="/seller/products/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#392525] px-5 py-2.5 text-xs font-semibold text-[#FAF5E9]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Your First Product</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
