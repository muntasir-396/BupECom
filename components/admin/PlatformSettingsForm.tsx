'use client'

import React, { useTransition, useState } from 'react'
import { Save, RefreshCw, CheckCircle2, Megaphone, Percent, Truck } from 'lucide-react'
import { adminSavePlatformSettingsAction } from '@/lib/actions/admin'

interface PlatformSettingsFormProps {
  initialSettings: {
    announcement_banner: string
    student_discount_pct: string
    delivery_fee_bdt: string
  }
}

export function PlatformSettingsForm({ initialSettings }: PlatformSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSaved(false)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await adminSavePlatformSettingsAction(formData)
      if (!res.ok) {
        setError(res.error || 'Failed to save settings')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-semibold text-emerald-900">
          <CheckCircle2 className="size-4 text-emerald-700" />
          <span>Platform configuration updated successfully. Changes are now live campus-wide.</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-300 p-3 text-xs font-semibold text-rose-900">
          {error}
        </div>
      )}

      {/* Broadcast Announcement Banner */}
      <div className="space-y-2">
        <label
          htmlFor="announcement_banner"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#392525]"
        >
          <Megaphone className="size-4 text-amber-600" />
          <span>Campus Announcement Banner</span>
        </label>
        <p className="text-xs text-[#728383]">
          Broadcast a top-of-page alert message to all students, buyers, and sellers across BUP Nest. Leave blank to disable.
        </p>
        <input
          id="announcement_banner"
          name="announcement_banner"
          type="text"
          defaultValue={initialSettings.announcement_banner}
          placeholder="e.g. 🎓 Semester Final Project Showcase this Thursday at BUP Multipurpose Hall!"
          className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[#392525] placeholder:text-[#728383]/50 focus:border-[#213527] focus:outline-none focus:ring-1 focus:ring-[#213527]"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Student Verification Discount */}
        <div className="space-y-2">
          <label
            htmlFor="student_discount_pct"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#392525]"
          >
            <Percent className="size-4 text-[#213527]" />
            <span>Verified Student Discount (%)</span>
          </label>
          <p className="text-xs text-[#728383]">
            Default promotional discount rate automatically applied to verified BUP students upon checkout.
          </p>
          <div className="relative">
            <input
              id="student_discount_pct"
              name="student_discount_pct"
              type="number"
              min="0"
              max="50"
              step="1"
              defaultValue={initialSettings.student_discount_pct}
              className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[#392525] focus:border-[#213527] focus:outline-none focus:ring-1 focus:ring-[#213527]"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#728383]">%</span>
          </div>
        </div>

        {/* Standard Campus Delivery Fee */}
        <div className="space-y-2">
          <label
            htmlFor="delivery_fee_bdt"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#392525]"
          >
            <Truck className="size-4 text-[#B25D3E]" />
            <span>Campus Courier Base Fee (BDT)</span>
          </label>
          <p className="text-xs text-[#728383]">
            Standard hand-delivery fee for campus drop-offs (FST, FBS, FASS, Hall gates).
          </p>
          <div className="relative">
            <input
              id="delivery_fee_bdt"
              name="delivery_fee_bdt"
              type="number"
              min="0"
              max="500"
              step="5"
              defaultValue={initialSettings.delivery_fee_bdt}
              className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[#392525] focus:border-[#213527] focus:outline-none focus:ring-1 focus:ring-[#213527]"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#728383]">৳ BDT</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#213527] px-5 py-2.5 text-sm font-semibold text-[#FAF5E9] shadow-sm hover:bg-[#16241a] transition cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <RefreshCw className="size-4 animate-spin text-[#E3E890]" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="size-4 text-[#E3E890]" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

