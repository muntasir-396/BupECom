import React from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Store,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Package,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { getVendorPayoutSummary } from '@/lib/actions/admin'
import { formatBdt } from '@/lib/format'
import { VendorPayoutButton } from '@/components/admin/VendorPayoutButton'

export const dynamic = 'force-dynamic'

export default async function AdminPayoutsPage() {
  const sellers = await getVendorPayoutSummary()

  const totalGross = sellers.reduce((s, v) => s + v.gross_sales, 0)
  const totalUnsettled = sellers.reduce((s, v) => s + v.unsettled_amount, 0)
  const totalSettled = sellers.reduce((s, v) => s + v.settled_amount, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-black/10 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#728383]">
            Multi-Vendor Escrow &amp; Reconciliation
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">
            Vendor Payout Settlements
          </h1>
          <p className="mt-1 text-xs text-[#3E4734]">
            Reconcile platform-level customer collections with campus seller disbursements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders?payoutStatus=UNSETTLED"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#392525] px-4 py-2 text-xs font-semibold text-[#FAF5E9] shadow-sm hover:bg-[#213527] transition"
          >
            <span>View Unsettled Orders</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#728383]">
            Total Marketplace Volume
          </span>
          <p className="mt-2 font-serif text-3xl font-bold text-[#392525]">
            {formatBdt(totalGross)}
          </p>
          <p className="mt-1 text-xs text-[#728383]">Aggregated completed sales across stalls</p>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#728383]">
            Unsettled Vendor Liability
          </span>
          <p className="mt-2 font-serif text-3xl font-bold text-[#B25D3E]">
            {formatBdt(totalUnsettled)}
          </p>
          <p className="mt-1 text-xs text-[#728383]">Held in platform escrow awaiting payout</p>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#728383]">
            Settled Disbursements
          </span>
          <p className="mt-2 font-serif text-3xl font-bold text-emerald-800">
            {formatBdt(totalSettled)}
          </p>
          <p className="mt-1 text-xs text-[#728383]">Transferred to student and canteen vendors</p>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="rounded-3xl border border-black/10 bg-white/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/10 flex items-center justify-between">
          <h2 className="font-serif text-base font-bold text-[#392525]">
            Campus Vendor Accounts ({sellers.length})
          </h2>
          <span className="text-xs text-[#728383]">Sorted by highest unsettled balance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5E9] border-b border-black/10 text-[#728383] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Vendor &amp; Store Name</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Gross Sales</th>
                <th className="py-3.5 px-4">Settled To Date</th>
                <th className="py-3.5 px-4">Unsettled Due</th>
                <th className="py-3.5 px-4 text-right">Disbursement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#728383]">
                    No vendor sales recorded yet.
                  </td>
                </tr>
              ) : (
                sellers.map((s) => (
                  <tr key={s.seller_id} className="hover:bg-black/[0.02] transition">
                    {/* Store & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs shrink-0">
                          <Store className="size-4 text-emerald-800" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#392525] block">
                            {s.store_name || s.seller_name}
                          </span>
                          <span className="text-[#728383] text-[11px] block">
                            {s.seller_name} &bull; {s.phone || s.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Orders count */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#392525]">{s.total_orders}</span> orders
                    </td>

                    {/* Gross */}
                    <td className="py-3.5 px-4 font-serif font-bold text-[#392525]">
                      {formatBdt(s.gross_sales)}
                    </td>

                    {/* Settled */}
                    <td className="py-3.5 px-4 text-emerald-800 font-semibold">
                      {formatBdt(s.settled_amount)}
                    </td>

                    {/* Unsettled */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-serif font-bold ${
                          s.unsettled_amount > 0 ? 'text-[#B25D3E] text-sm' : 'text-stone-400'
                        }`}
                      >
                        {formatBdt(s.unsettled_amount)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <VendorPayoutButton
                        sellerId={s.seller_id}
                        sellerName={s.store_name || s.seller_name}
                        unsettledAmount={s.unsettled_amount}
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

