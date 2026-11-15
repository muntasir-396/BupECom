import React from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Filter,
  GraduationCap
} from 'lucide-react'
import { listAdminUsers } from '@/lib/actions/admin'
import { getSession } from '@/lib/auth'
import { UserActionButtons } from '@/components/admin/UserActionButtons'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; verified?: string; status?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const role = params.role || 'ALL'
  const verified = params.verified || 'ALL'
  const status = params.status || 'ALL'

  const currentAdmin = await getSession()
  const users = await listAdminUsers({ q, role, verified, status })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-black/10 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#728383]">
            Identity &amp; Access Control
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">
            User &amp; Student Verification Directory
          </h1>
          <p className="mt-1 text-xs text-[#3E4734]">
            Approve institutional student discounts, manage seller privileges, and monitor campus accounts.
          </p>
        </div>
        <span className="rounded-full bg-[#E3E890]/60 px-3.5 py-1 text-xs font-bold text-[#392525]">
          {users.length} Registered {users.length === 1 ? 'User' : 'Users'}
        </span>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white/70 p-4 rounded-2xl border border-black/10 shadow-xs">
        {/* Search Input Form */}
        <form action="/admin/users" method="GET" className="relative flex-1 max-w-md">
          {role !== 'ALL' && <input type="hidden" name="role" value={role} />}
          {verified !== 'ALL' && <input type="hidden" name="verified" value={verified} />}
          {status !== 'ALL' && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, email, student ID, or store..."
            className="w-full rounded-xl border border-black/15 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-[#B25D3E]"
          />
          <Search className="absolute left-3 top-2.5 size-3.5 text-[#728383]" />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Role Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 border border-black/5">
            {['ALL', 'BUYER', 'SELLER', 'ADMIN'].map((r) => {
              const active = role === r
              return (
                <Link
                  key={r}
                  href={`/admin/users?role=${r}${verified !== 'ALL' ? `&verified=${verified}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    active ? 'bg-white text-[#392525] shadow-xs' : 'text-[#728383] hover:text-[#392525]'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r}
                </Link>
              )
            })}
          </div>

          {/* Verification Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 border border-black/5">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'VERIFIED', label: 'Verified' },
              { id: 'UNVERIFIED', label: 'Unverified' },
            ].map((v) => {
              const active = verified === v.id
              return (
                <Link
                  key={v.id}
                  href={`/admin/users?verified=${v.id}${role !== 'ALL' ? `&role=${role}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    active ? 'bg-white text-[#392525] shadow-xs' : 'text-[#728383] hover:text-[#392525]'
                  }`}
                >
                  {v.label}
                </Link>
              )
            })}
          </div>

          {(q || role !== 'ALL' || verified !== 'ALL') && (
            <Link
              href="/admin/users"
              className="text-xs text-rose-700 hover:underline px-2 py-1 font-semibold"
            >
              Reset
            </Link>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-black/10 bg-white/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5E9] border-b border-black/10 text-[#728383] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">User &amp; Contact</th>
                <th className="py-3.5 px-4">Student ID / Dept</th>
                <th className="py-3.5 px-4">Account Type</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#728383]">
                    No users match the search and filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isBoth = Boolean(u.has_buyer_account && u.has_seller_account)
                  const isSuspended = Boolean(u.is_suspended)
                  const isSelf = currentAdmin?.id === u.id

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-black/[0.02] transition ${
                        isSuspended ? 'bg-rose-50/50 opacity-80' : ''
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-[#392525]/10 text-[#392525] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#392525]">{u.name}</span>
                              {isSelf && (
                                <span className="rounded bg-black/10 px-1 text-[9px] font-bold text-[#392525]">
                                  YOU
                                </span>
                              )}
                              {isSuspended && (
                                <span className="rounded bg-rose-200 text-rose-900 px-1.5 text-[9px] font-bold">
                                  SUSPENDED
                                </span>
                              )}
                            </div>
                            <span className="text-[#728383] block">{u.email}</span>
                            {u.phone && <span className="text-[11px] text-[#728383] block">{u.phone}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Student ID / Dept */}
                      <td className="py-3.5 px-4">
                        {u.student_id ? (
                          <div>
                            <span className="font-mono font-bold text-[#392525]">{u.student_id}</span>
                            <span className="text-[11px] text-[#728383] block">{u.department || 'BUP Student'}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">None Provided</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-900 border-purple-300'
                                : u.role === 'SELLER'
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            {u.role}
                          </span>
                          {isBoth && (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                              Connected
                            </span>
                          )}
                        </div>
                        {u.store_name && (
                          <span className="text-[11px] text-[#728383] block mt-0.5 truncate max-w-[140px]">
                            {u.store_name}
                          </span>
                        )}
                      </td>

                      {/* BUP Verification */}
                      <td className="py-3.5 px-4">
                        {u.is_bup_verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <ShieldCheck className="size-3.5 text-emerald-600" />
                            <span>BUP Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#728383]">
                            <ShieldAlert className="size-3.5 text-amber-600" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      {/* Activity */}
                      <td className="py-3.5 px-4 text-[#728383]">
                        <span>{u.buyer_orders_count} orders</span>
                        {u.seller_products_count > 0 && (
                          <span className="block text-[11px]">&bull; {u.seller_products_count} listings</span>
                        )}
                      </td>

                      {/* Actions Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <UserActionButtons
                          userId={u.id}
                          userName={u.name}
                          isBupVerified={Boolean(u.is_bup_verified)}
                          role={u.role}
                          isSuspended={isSuspended}
                          isSelf={isSelf}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

