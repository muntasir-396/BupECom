'use client'

import React, { useTransition } from 'react'
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react'
import { adminUpdateStallBookingStatusAction } from '@/lib/actions/admin'

interface StallBookingActionButtonsProps {
  bookingId: string
  passCode: string
  currentStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
}

export function StallBookingActionButtons({
  bookingId,
  passCode,
  currentStatus
}: StallBookingActionButtonsProps) {
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (newStatus: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    const notes = prompt(`Optional admin notes for ${newStatus.toLowerCase()} booking ${passCode}:`, '')
    startTransition(async () => {
      const res = await adminUpdateStallBookingStatusAction(bookingId, newStatus, notes || undefined)
      if (!res.ok) alert(res.error)
    })
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {currentStatus === 'PENDING_APPROVAL' && (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleUpdate('APPROVED')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 text-xs font-semibold transition cursor-pointer"
            title="Approve Stall Reservation"
          >
            {isPending ? <RefreshCw className="size-3 animate-spin" /> : <CheckCircle2 className="size-3 text-emerald-700" />}
            <span>Approve</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleUpdate('REJECTED')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-900 text-xs font-semibold transition cursor-pointer"
            title="Reject Stall Reservation"
          >
            <XCircle className="size-3 text-rose-700" />
            <span>Reject</span>
          </button>
        </>
      )}

      {currentStatus === 'APPROVED' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleUpdate('COMPLETED')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 text-xs font-semibold transition cursor-pointer"
          title="Mark Stall Use Completed"
        >
          <Sparkles className="size-3 text-blue-700" />
          <span>Mark Completed</span>
        </button>
      )}

      {currentStatus === 'COMPLETED' && (
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Completed
        </span>
      )}

      {currentStatus === 'REJECTED' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleUpdate('APPROVED')}
          className="text-xs text-amber-700 hover:underline cursor-pointer"
        >
          Re-approve
        </button>
      )}
    </div>
  )
}

