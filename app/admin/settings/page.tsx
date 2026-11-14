import React from 'react'
import {
  Sliders,
  Shield,
  Database,
  History,
  Lock,
  Server,
  FileCode,
  HardDrive
} from 'lucide-react'
import { getPlatformSettings, listAdminAuditLogs } from '@/lib/actions/admin'
import { PlatformSettingsForm } from '@/components/admin/PlatformSettingsForm'
import { ClearAuditLogsButton } from '@/components/admin/ClearAuditLogsButton'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const [settings, auditLogs] = await Promise.all([
    getPlatformSettings(),
    listAdminAuditLogs(100),
  ])

  const actionColorMap: Record<string, string> = {
    VERIFY_STUDENT: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    REVOKE_STUDENT_VERIFICATION: 'bg-amber-100 text-amber-900 border-amber-300',
    UPDATE_ROLE: 'bg-purple-100 text-purple-900 border-purple-300',
    SUSPEND_USER: 'bg-rose-100 text-rose-900 border-rose-300',
    UNSUSPEND_USER: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    DELETE_USER: 'bg-rose-100 text-rose-900 border-rose-300',
    TOGGLE_PRODUCT_STATUS: 'bg-blue-100 text-blue-900 border-blue-300',
    SET_PRODUCT_TAG: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    DELETE_PRODUCT: 'bg-rose-100 text-rose-900 border-rose-300',
    VERIFY_ORDER_PAYMENT: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    UPDATE_ORDER_STATUS: 'bg-blue-100 text-blue-900 border-blue-300',
    SETTLE_PAYOUT: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    BULK_SETTLE_PAYOUTS: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    UPDATE_STALL_STATUS: 'bg-amber-100 text-amber-900 border-amber-300',
    UPDATE_SETTINGS: 'bg-neutral-100 text-neutral-900 border-neutral-300',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-black/10 pb-5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#728383]">
          Platform Administration
        </span>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-[#392525]">
          System Settings &amp; Audit Trail
        </h1>
        <p className="mt-1 text-sm text-[#728383]">
          Manage campus-wide banner announcements, pricing rules, environment variables, and review immutable audit logs.
        </p>
      </div>

      {/* Grid: Settings Form & System Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Settings Form (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-white/80 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-6 border-b border-black/5 pb-4">
            <div className="rounded-xl bg-[#213527]/10 p-2 text-[#213527]">
              <Sliders className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#392525]">
                Campus Configuration
              </h2>
              <p className="text-xs text-[#728383]">
                Adjust campus broadcast messaging and marketplace calculation parameters.
              </p>
            </div>
          </div>

          <PlatformSettingsForm
            initialSettings={{
              announcement_banner: settings.announcement_banner || '',
              student_discount_pct: settings.student_discount_pct || '5',
              delivery_fee_bdt: settings.delivery_fee_bdt || '60',
            }}
          />
        </div>

        {/* System Environment Info (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-black/5 pb-3">
              <div className="rounded-xl bg-[#B25D3E]/10 p-2 text-[#B25D3E]">
                <Server className="size-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#392525]">
                System Architecture
              </h3>
            </div>

            <div className="space-y-3 text-xs text-[#392525]">
              <div className="flex items-center justify-between py-1 border-b border-black/5">
                <span className="text-[#728383] flex items-center gap-1.5">
                  <Database className="size-3.5" /> Database Engine
                </span>
                <span className="font-mono font-bold text-[#213527]">Native node:sqlite</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5">
                <span className="text-[#728383] flex items-center gap-1.5">
                  <HardDrive className="size-3.5" /> Database Storage
                </span>
                <span className="font-mono text-[11px] text-[#392525]">data/marketplace.db</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5">
                <span className="text-[#728383] flex items-center gap-1.5">
                  <FileCode className="size-3.5" /> Framework
                </span>
                <span className="font-mono font-bold">Next.js 16.4.0 (Turbopack)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5">
                <span className="text-[#728383] flex items-center gap-1.5">
                  <Lock className="size-3.5" /> Session Auth
                </span>
                <span className="font-mono text-emerald-800 font-bold">HTTP-Only HMAC Signed</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#728383] flex items-center gap-1.5">
                  <Shield className="size-3.5" /> Admin Privilege
                </span>
                <span className="rounded-md bg-purple-100 text-purple-900 border border-purple-200 px-1.5 py-0.5 text-[10px] font-bold">
                  ROLE = &apos;ADMIN&apos;
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-xs text-emerald-950">
            <p className="font-bold">Automated Database Health</p>
            <p className="mt-1 text-emerald-900 leading-relaxed">
              All tables, migrations, indexes, and full-text foreign constraints are automatically executed and preserved across server restarts.
            </p>
          </div>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-black/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#213527]/10 p-2 text-[#213527]">
              <History className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#392525]">
                System Audit Trail ({auditLogs.length})
              </h2>
              <p className="text-xs text-[#728383]">
                Immutable chronicle of administrative actions, user verifications, moderations, and settlements.
              </p>
            </div>
          </div>

          <ClearAuditLogsButton />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#392525]">
            <thead className="bg-[#FAF5E9] text-[11px] font-bold uppercase tracking-wider text-[#728383] border-b border-black/10">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Target ID</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#728383]">
                    No audit records currently stored in database.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/[0.015] transition">
                    <td className="px-4 py-3 text-[#728383] whitespace-nowrap font-mono text-[11px]">
                      {log.created_at}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#392525] whitespace-nowrap">
                      {log.admin_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          actionColorMap[log.action] || 'bg-neutral-100 text-neutral-800 border-neutral-300'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#728383] whitespace-nowrap uppercase">
                      {log.target_entity}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#728383] max-w-[120px] truncate" title={log.target_id || ''}>
                      {log.target_id || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#392525] max-w-sm truncate" title={log.details || ''}>
                      {log.details || '—'}
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

