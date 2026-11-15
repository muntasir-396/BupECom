'use client'

import React, { useTransition } from 'react'
import { DollarSign, RefreshCw, CheckCircle2 } from 'lucide-react'
import { adminBulkSettleSellerPayoutsAction } from '@/lib/actions/admin'

interface VendorPayoutButtonProps {
  sellerId: string
  sellerName: string
  unsettledAmount: number
}

export function VendorPayoutButton({
  sellerId,
  sellerName,
  unsettledAmount
}: VendorPayoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleBulkSettle = () => {
    if (unsettledAmount <= 0) return
    const notes = prompt(`Confirm settlement of ৳${unsettledAmount.toLocaleString()} to ${sellerName}.\nEnter bank / MFS reference notes:`, 'Disbursed via bKash B2C Payroll')
    if (notes === null) return

    startTransition(async () => {
      const res = await adminBulkSettleSellerPayoutsAction(sellerId, notes)
      if (!res.ok) alert(res.error)
      else alert(`Successfully settled ৳${unsettledAmount.toLocaleString()} for ${sellerName}!`)
    })
  }

  if (unsettledAmount <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200">
        <CheckCircle2 className="size-3 text-emerald-600" />
        <span>All Settled</span>
      </span>
    )
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleBulkSettle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
      title={`Disburse ৳${unsettledAmount.toLocaleString()} to ${sellerName}`}
    >
      {isPending ? (
        <RefreshCw className="size-3.5 animate-spin" />
      ) : (
        <DollarSign className="size-3.5 text-[#E3E890]" />
      )}
      <span>Settle ৳{Math.round(unsettledAmount).toLocaleString()}</span>
    </button>
  )
}

