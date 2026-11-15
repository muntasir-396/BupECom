'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Sparkles, CheckCircle2 } from 'lucide-react'
import { upgradeToSellerAction } from '@/lib/actions/auth'
import { SELLER_TYPES } from '@/lib/format'

type UpgradeFormProps = {
  userName: string
  userPhone?: string | null
}

export function UpgradeToSellerForm({ userName, userPhone }: UpgradeFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  return (
    <div className="rounded-3xl border border-[rgba(57,37,37,0.15)] bg-white/95 p-6 shadow-2xl backdrop-blur-md md:p-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B25D3E]">
        <Sparkles className="h-4 w-4" />
        <span>Connect Seller Account</span>
      </div>
      <h2 className="mt-2 font-serif text-2xl text-[#392525] sm:text-3xl">
        Open Seller Account, {userName}
      </h2>
      <p className="mt-2 text-sm text-[#3E4734]">
        Buyer and Seller accounts are kept separate. You currently hold an active Buyer account. Open your seller store below to connect both accounts and switch freely between Buyer Market and Seller Studio anytime.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError('')
          const formData = new FormData(e.currentTarget)
          startTransition(async () => {
            const res = await upgradeToSellerAction(formData)
            if (!res.ok) {
              setError(res.error)
              return
            }
            window.location.href = '/?tab=seller'
          })
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#392525]">Store / Brand Name *</span>
          <input
            name="storeName"
            required
            placeholder="e.g. ICE Batch 22 Merch, Vista Cafe, Dhaka Tech Hub"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.2)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#392525]">Seller Category</span>
          <select
            name="sellerType"
            defaultValue="Student Vendor"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.2)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          >
            {SELLER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#392525]">Contact Phone</span>
          <input
            name="phone"
            defaultValue={userPhone || ''}
            placeholder="+880 1700 000000"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.2)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#392525]">Short Store Bio / Description (optional)</span>
          <textarea
            name="storeDescription"
            rows={2}
            placeholder="What will you be offering to the campus community?"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.2)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>

        {error && <p className="text-sm font-medium text-[#B25D3E]">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#392525] py-3.5 text-sm font-semibold text-[#FAF5E9] shadow-md transition hover:bg-[#213527] disabled:opacity-60"
        >
          <Store className="h-4 w-4" />
          <span>{pending ? 'Opening store…' : 'Activate Seller Account & Open Store'}</span>
        </button>

        <div className="flex items-center gap-2 pt-2 text-xs text-[#728383]">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Instant activation — start listing products in seconds without creating a separate login.</span>
        </div>
      </form>
    </div>
  )
}
