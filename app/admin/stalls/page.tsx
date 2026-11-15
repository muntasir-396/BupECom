import React from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Calendar,
  Clock,
  Building,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter
} from 'lucide-react'
import { listAdminStallBookings } from '@/lib/actions/admin'
import { formatBdt } from '@/lib/format'
import { StallBookingActionButtons } from '@/components/admin/StallBookingActionButtons'

export const dynamic = 'force-dynamic'

export default async function AdminStallsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = params.status || 'ALL'

  const bookings = await listAdminStallBookings({ status })

  const statusBadge: Record<string, string> = {
    PENDING_APPROVAL: 'bg-amber-100 text-amber-900 border-amber-300',
    APPROVED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    REJECTED: 'bg-rose-100 text-rose-900 border-rose-300',
    COMPLETED: 'bg-blue-100 text-blue-900 border-blue-300',
  }

  // Summary counts
  const totalCount = bookings.length
  const pendingCount = bookings.filter((b) => b.status === 'PENDING_APPROVAL').length
  const approvedCount = bookings.filter((b) => b.status === 'APPROVED').length
  const totalRevenue = bookings
    .filter((b) => b.status === 'APPROVED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.total_cost || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-black/10 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#728383]">
            Campus Spaces &amp; Club Events
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">
            Lakeside Stall Allocations
          </h1>
          <p className="mt-1 text-sm text-[#728383]">
            Moderate and authorize physical pop-up stall space near the BUP Lake Promenade for registered student clubs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/#lakeside-stalls"
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold text-[#392525] shadow-xs hover:bg-white transition"
          >
            <Sparkles className="size-4 text-emerald-700" />
            <span>Public Stall Map</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-xs">
          <p className="text-xs font-medium text-[#728383]">Total Bookings</p>
          <p className="mt-1 text-2xl font-bold text-[#392525]">{totalCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-800">Pending Review</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-800">Approved Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{approvedCount}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-xs">
          <p className="text-xs font-medium text-[#728383]">Total Stall Fees</p>
          <p className="mt-1 text-2xl font-bold text-[#213527]">{formatBdt(totalRevenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-[#728383] flex items-center gap-1 mr-1">
          <Filter className="size-3.5" /> Filter:
        </span>
        {[
          { label: 'All', value: 'ALL' },
          { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Rejected', value: 'REJECTED' },
        ].map((pill) => {
          const isActive = status === pill.value
          return (
            <Link
              key={pill.value}
              href={`/admin/stalls${pill.value === 'ALL' ? '' : `?status=${pill.value}`}`}
              className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#213527] text-[#FAF5E9] shadow-xs'
                  : 'bg-white/70 text-[#392525] border border-black/10 hover:bg-white'
              }`}
            >
              {pill.label}
            </Link>
          )
        })}
      </div>

      {/* Bookings Table / Cards */}
      <div className="rounded-2xl border border-black/10 bg-white/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#392525]">
            <thead className="bg-[#FAF5E9] text-[11px] font-bold uppercase tracking-wider text-[#728383] border-b border-black/10">
              <tr>
                <th className="px-4 py-3">Pass &amp; Stall</th>
                <th className="px-4 py-3">Club &amp; Purpose</th>
                <th className="px-4 py-3">Representative</th>
                <th className="px-4 py-3">Date &amp; Duration</th>
                <th className="px-4 py-3">Fee (BDT)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#728383]">
                    <Sparkles className="mx-auto size-8 text-[#728383]/40" />
                    <p className="mt-2 font-medium">No stall booking records match your criteria.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-black/[0.015] transition">
                    {/* Pass Code & Stall Location */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-[#213527] bg-[#E3E890]/40 px-2 py-0.5 rounded border border-[#213527]/20">
                        {b.pass_code}
                      </span>
                      <p className="mt-1 text-xs font-semibold text-[#392525]">
                        Stall ID: <span className="uppercase">{b.stall_id}</span>
                      </p>
                    </td>

                    {/* Club Name & Purpose */}
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <p className="font-bold text-[#392525] truncate">{b.club_name}</p>
                      <p className="text-xs text-[#728383] line-clamp-2 mt-0.5">{b.purpose}</p>
                    </td>

                    {/* Student Rep Details */}
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#392525]">{b.user_name}</p>
                      <p className="text-xs font-mono text-[#728383]">
                        ID: {b.student_id || 'N/A'}
                      </p>
                      <p className="text-[11px] text-[#728383]">{b.user_phone || b.user_email}</p>
                    </td>

                    {/* Booking Date & Duration */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-[#392525]">
                        <Calendar className="size-3.5 text-[#728383]" />
                        <span>{b.booking_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#728383] mt-0.5">
                        <Clock className="size-3 text-[#728383]" />
                        <span>{b.duration_days} day{b.duration_days > 1 ? 's' : ''}</span>
                      </div>
                    </td>

                    {/* Fee */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-[#392525]">{formatBdt(b.total_cost)}</p>
                      <span className="inline-block text-[10px] font-bold text-emerald-800 uppercase">
                        PAID (ESCROW)
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          statusBadge[b.status] || 'bg-neutral-100 text-neutral-800 border-neutral-300'
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.admin_notes && (
                        <p className="text-[10px] text-[#728383] mt-1 italic max-w-[150px] truncate" title={b.admin_notes}>
                          {b.admin_notes}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <StallBookingActionButtons
                        bookingId={b.id}
                        passCode={b.pass_code}
                        currentStatus={b.status}
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
