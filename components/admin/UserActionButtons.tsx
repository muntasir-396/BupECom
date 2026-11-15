'use client'

import React, { useTransition } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Trash2,
  UserCheck,
  Ban,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import {
  adminToggleStudentVerificationAction,
  adminUpdateUserRoleAction,
  adminToggleUserSuspensionAction,
  adminDeleteUserAction
} from '@/lib/actions/admin'
import { Role } from '@/lib/db'

interface UserActionButtonsProps {
  userId: string
  userName: string
  isBupVerified: boolean
  role: Role
  isSuspended: boolean
  isSelf: boolean
}

export function UserActionButtons({
  userId,
  userName,
  isBupVerified,
  role,
  isSuspended,
  isSelf
}: UserActionButtonsProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggleVerification = () => {
    startTransition(async () => {
      const res = await adminToggleStudentVerificationAction(userId)
      if (!res.ok) alert(res.error)
    })
  }

  const handleChangeRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role
    if (newRole === role) return
    if (!confirm(`Are you sure you want to change ${userName}'s role to ${newRole}?`)) return
    startTransition(async () => {
      const res = await adminUpdateUserRoleAction(userId, newRole)
      if (!res.ok) alert(res.error)
    })
  }

  const handleToggleSuspension = () => {
    const actionName = isSuspended ? 'reactivate' : 'suspend'
    if (!confirm(`Are you sure you want to ${actionName} account for ${userName}?`)) return
    startTransition(async () => {
      const res = await adminToggleUserSuspensionAction(userId)
      if (!res.ok) alert(res.error)
    })
  }

  const handleDeleteUser = () => {
    if (!confirm(`CAUTION: Are you sure you want to PERMANENTLY DELETE user ${userName}? All associated products, orders, and reviews will be removed.`)) return
    startTransition(async () => {
      const res = await adminDeleteUserAction(userId)
      if (!res.ok) alert(res.error)
    })
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Verify / Revoke Button */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggleVerification}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
          isBupVerified
            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
            : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
        }`}
        title={isBupVerified ? "Click to Revoke Verification" : "Click to Approve BUP Student Verification"}
      >
        {isPending ? (
          <RefreshCw className="size-3 animate-spin" />
        ) : isBupVerified ? (
          <ShieldCheck className="size-3 text-emerald-700" />
        ) : (
          <ShieldAlert className="size-3 text-amber-700" />
        )}
        <span>{isBupVerified ? 'Verified' : 'Verify'}</span>
      </button>

      {/* Role Selector */}
      <select
        disabled={isPending || isSelf}
        value={role}
        onChange={handleChangeRole}
        className="px-2 py-1 rounded-lg border border-black/15 bg-white text-xs font-medium text-[#392525] focus:outline-none focus:border-[#B25D3E] cursor-pointer disabled:opacity-50"
        title="Change User Role"
      >
        <option value="BUYER">Role: Buyer</option>
        <option value="SELLER">Role: Seller</option>
        <option value="ADMIN">Role: Admin</option>
      </select>

      {/* Suspend / Unsuspend */}
      {!isSelf && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleToggleSuspension}
          className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
            isSuspended
              ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
              : 'border-black/10 text-stone-600 hover:text-stone-900 hover:bg-black/5'
          }`}
          title={isSuspended ? "Reactivate Account" : "Suspend User Account"}
        >
          <Ban className="size-3.5" />
        </button>
      )}

      {/* Delete User */}
      {!isSelf && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleDeleteUser}
          className="p-1.5 rounded-lg border border-transparent hover:border-rose-300 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
          title="Delete User Permanently"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  )
}

