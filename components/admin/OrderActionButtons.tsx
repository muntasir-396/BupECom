'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  DollarSign,
  Package,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import {
  adminVerifyOrderPaymentAction,
  adminUpdateOrderStatusAction,
  adminSettleOrderPayoutAction
} from '@/lib/actions/admin'
import { OrderStatus, PaymentStatus } from '@/lib/db'

interface OrderActionButtonsProps {
  orderId: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  payoutStatus: 'UNSETTLED' | 'SETTLED' | 'HELD'
}

export function OrderActionButtons({
  orderId,
  orderNumber,
  status,
  paymentStatus,
  paymentMethod,
  payoutStatus
}: OrderActionButtonsProps) {
  const [isPending, startTransition] = useTransition()

  const handleVerifyPayment = () => {
    if (!confirm(`Mark payment as VERIFIED (PAID) for order ${orderNumber}?`)) return
    startTransition(async () => {
      const res = await adminVerifyOrderPaymentAction(orderId)
      if (!res.ok) alert(res.error)
    })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    if (newStatus === status) return
    if (!confirm(`Are you sure you want to change order ${orderNumber} status to ${newStatus}?`)) return
    startTransition(async () => {
      const res = await adminUpdateOrderStatusAction(orderId, newStatus)
      if (!res.ok) alert(res.error)
    })
  }

  const handleSettlePayout = () => {
    const notes = prompt(`Enter payout settlement reference notes for ${orderNumber}:`, 'MFS B2C Bank Transfer Complete')
    if (notes === null) return
    startTransition(async () => {
      const res = await adminSettleOrderPayoutAction(orderId, notes)
      if (!res.ok) alert(res.error)
    })
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Verify Payment Button (if Pending) */}
      {paymentStatus === 'PENDING' && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleVerifyPayment}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 text-xs font-semibold transition cursor-pointer"
          title="Mark Payment as Received/Paid"
        >
          {isPending ? <RefreshCw className="size-3 animate-spin" /> : <ShieldCheck className="size-3 text-blue-700" />}
          <span>Verify Paid</span>
        </button>
      )}

      {/* Fulfillment Status Selector */}
      <select
        disabled={isPending}
        value={status}
        onChange={handleStatusChange}
        className="px-2 py-1 rounded-lg border border-black/15 bg-white text-xs font-medium text-[#392525] focus:outline-none focus:border-[#B25D3E] cursor-pointer"
        title="Change Fulfillment Status"
      >
        <option value="PENDING">PENDING</option>
        <option value="CONFIRMED">CONFIRMED</option>
        <option value="SHIPPED">SHIPPED</option>
        <option value="DELIVERED">DELIVERED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>

      {/* Settle Payout Button */}
      {status !== 'CANCELLED' && (
        <button
          type="button"
          disabled={isPending || payoutStatus === 'SETTLED'}
          onClick={handleSettlePayout}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition ${
            payoutStatus === 'SETTLED'
              ? 'bg-stone-100 text-stone-500 border border-stone-200 cursor-default'
              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300 cursor-pointer'
          }`}
          title={payoutStatus === 'SETTLED' ? "Escrow Payout Settled" : "Settle Vendor Escrow Payout"}
        >
          <DollarSign className="size-3 text-emerald-700" />
          <span>{payoutStatus === 'SETTLED' ? 'Settled' : 'Settle Payout'}</span>
        </button>
      )}

      {/* View Full Receipt */}
      <Link
        href={`/orders/${orderId}`}
        target="_blank"
        className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-[#392525] transition"
        title="View Order Invoice"
      >
        <ExternalLink className="size-3.5" />
      </Link>
    </div>
  )
}

