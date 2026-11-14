'use client'

import React, { useTransition } from 'react'
import { Trash2, RefreshCw } from 'lucide-react'
import { adminClearAuditLogsAction } from '@/lib/actions/admin'

export function ClearAuditLogsButton() {
  const [isPending, startTransition] = useTransition()

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all audit log entries? This action cannot be undone.')) {
      startTransition(async () => {
        const res = await adminClearAuditLogsAction()
        if (!res.ok) {
          alert(res.error || 'Failed to clear logs')
        }
      })
    }
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClear}
      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-800 transition cursor-pointer disabled:opacity-50"
      title="Purge all audit logs"
    >
      {isPending ? (
        <RefreshCw className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5 text-rose-700" />
      )}
      <span>Clear Logs</span>
    </button>
  )
}

