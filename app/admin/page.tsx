import React from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  Store,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { getAdminDashboardStats } from '@/lib/actions/admin'
import { formatBdt } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-black/10 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#728383]">
            Executive Overview
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">
            Campus Operations Dashboard
          </h1>
          <p className="mt-1 text-xs text-[#3E4734]">
            Monitor platform-wide GMV, escrow liabilities, student verifications, and multi-vendor orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/users?verified=UNVERIFIED"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#392525] px-4 py-2 text-xs font-semibold text-[#FAF5E9] shadow-sm hover:bg-[#213527] transition"
          >
            <ShieldCheck className="size-3.5 text-[#E3E890]" />
            <span>Verify Students ({stats.pendingVerifications})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* GMV */}
        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#728383]">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales (GMV)</span>
            <div className="size-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <DollarSign className="size-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#392525]">
            {formatBdt(stats.gmv)}
          </p>
          <p className="mt-1 text-xs text-[#728383]">Total orders minus cancellations</p>
        </div>

        {/* Escrow Liability */}
        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#728383]">
            <span className="text-xs font-bold uppercase tracking-wider">Escrow Liability</span>
            <div className="size-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#B25D3E]">
            {formatBdt(stats.unsettledLiability)}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-[#728383]">Unsettled vendor earnings</span>
            <Link href="/admin/payouts" className="text-[11px] font-bold text-amber-800 hover:underline">
              Settle &rarr;
            </Link>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#728383]">
            <span className="text-xs font-bold uppercase tracking-wider">Campus Orders</span>
            <div className="size-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
              <Package className="size-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#392525]">
            {stats.totalOrders}
          </p>
          <p className="mt-1 text-xs text-[#728383]">
            {stats.pendingOrders} awaiting fulfillment
          </p>
        </div>

        {/* Community Members */}
        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
          <div className="flex items-center justify-between text-[#728383]">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
            <div className="size-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-800">
              <Users className="size-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-[#392525]">
            {stats.totalUsers}
          </p>
          <p className="mt-1 text-xs text-emerald-700 font-medium">
            {stats.verifiedStudents} verified BUP students
          </p>
        </div>
      </div>

      {/* Action Banners for Pending Tasks */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Pending Verifications */}
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-900">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">Student Verifications</p>
              <p className="text-xs text-amber-800">
                {stats.pendingVerifications} students waiting for verification
              </p>
            </div>
          </div>
          <Link
            href="/admin/users?verified=UNVERIFIED"
            className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition"
          >
            Review
          </Link>
        </div>

        {/* Pending Stall Bookings */}
        <div className="rounded-2xl border border-purple-300 bg-purple-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-purple-200/80 flex items-center justify-center text-purple-900">
              <Store className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-950">Lakeside Stall Bookings</p>
              <p className="text-xs text-purple-800">
                {stats.pendingStallBookings} reservations awaiting approval
              </p>
            </div>
          </div>
          <Link
            href="/admin/stalls"
            className="text-xs font-bold text-purple-900 bg-purple-200/80 hover:bg-purple-300 px-3 py-1.5 rounded-lg transition"
          >
            Manage
          </Link>
        </div>

        {/* Pending MFS Payments */}
        <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-200/80 flex items-center justify-center text-blue-900">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950">Pending MFS Payments</p>
              <p className="text-xs text-blue-800">
                {stats.pendingMfsPayments} bKash/Nagad TrxIDs to verify
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-blue-900 bg-blue-200/80 hover:bg-blue-300 px-3 py-1.5 rounded-lg transition"
          >
            Verify
          </Link>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Recent Audit Trail */}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        {/* Recent Orders Table */}
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#392525]">Recent Campus Orders</h2>
              <p className="text-xs text-[#728383]">Latest transactions across all student stalls</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#B25D3E] hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-black/5 overflow-x-auto">
            {stats.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#728383]">No orders placed yet.</p>
            ) : (
              stats.recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#392525]">{o.order_number}</span>
                      <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-medium text-[#728383]">
                        {o.payment_method}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#728383] mt-0.5">
                      By {o.buyer_name} &bull; {o.item_count} items
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-serif font-bold text-[#392525]">{formatBdt(o.total)}</p>
                    <span
                      className={`inline-block mt-0.5 rounded-full px-2 py-0.2 text-[10px] font-bold ${
                        o.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#392525]">Administrative Log</h2>
              <p className="text-xs text-[#728383]">Live audit trail of admin actions</p>
            </div>
            <Link
              href="/admin/settings"
              className="text-xs font-bold text-[#B25D3E] hover:underline flex items-center gap-1"
            >
              <span>Settings & Logs</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {stats.recentAuditLogs.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#728383]">No audit logs recorded.</p>
            ) : (
              stats.recentAuditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-stone-50 border border-black/5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#392525] text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-[#728383]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3E4734] mt-1 leading-snug">
                    {log.details || `Modified ${log.target_entity} ID: ${log.target_id}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

