'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Store,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react'
import { Stall, UserProfile } from '@/lib/types'
import { createStallBookingAction } from '@/lib/actions/admin'

interface StallBookingModalProps {
  stall: Stall | null
  onClose: () => void
  currentUser: UserProfile | null
  onOpenAuth: () => void
  onBookingConfirmed: (stallId: string, bookingDetails: any) => void
}

export function StallBookingModal({
  stall,
  onClose,
  currentUser,
  onOpenAuth,
  onBookingConfirmed,
}: StallBookingModalProps) {
  const [step, setStep] = useState<'preview' | 'form' | 'success'>('preview')
  const [bookingDate, setBookingDate] = useState('2026-10-25')
  const [durationDays, setDurationDays] = useState(1)
  const [stallPurpose, setStallPurpose] = useState('Student Club Merch & Handmade Crafts')
  const [clubName, setClubName] = useState('')
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+880 17')
  const [studentId, setStudentId] = useState(currentUser?.studentId || '')
  const [bookingPassCode, setBookingPassCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (stall) {
      setStep('preview')
      if (currentUser) {
        if (currentUser.studentId) setStudentId(currentUser.studentId)
        if (currentUser.phone) setContactPhone(currentUser.phone)
      }
    }
  }, [stall, currentUser])

  if (!stall) return null

  const totalCost = stall.dailyRate * durationDays
  const discountedCost = currentUser?.isBupVerified ? Math.round(totalCost * 0.85) : totalCost // 15% discount for BUP students

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const fd = new FormData()
    fd.append('stallId', stall.id)
    fd.append('clubName', clubName || 'Independent Student Enterprise')
    fd.append('purpose', stallPurpose)
    fd.append('bookingDate', bookingDate)
    fd.append('durationDays', String(durationDays))
    fd.append('dailyRate', String(stall.dailyRate))

    const res = await createStallBookingAction(fd)
    const code = res.ok && res.data ? res.data.passCode : `STALL-${stall.id}-${Math.floor(1000 + Math.random() * 9000)}`

    setBookingPassCode(code)
    setIsSubmitting(false)
    setStep('success')
    onBookingConfirmed(stall.id, {
      code,
      date: bookingDate,
      duration: durationDays,
      clubName: clubName || 'Independent Student Enterprise',
      totalCost: discountedCost,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stall-modal-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#FAF5E9] shadow-2xl text-[#392525] border border-[#392525]/15">
        
        {/* STEP 1: INITIAL PREVIEW (UPGRADED VERSION OF ORIGINAL MODAL) */}
        {step === 'preview' && (
          <div>
            <div className="relative h-48 overflow-hidden bg-[#728383] p-6 text-[#FAF5E9]">
              {stall.image && (
                <img
                  src={stall.image}
                  alt={stall.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />

              <button
                onClick={onClose}
                className="relative z-10 float-right grid size-9 place-items-center rounded-full bg-white/80 text-[#392525] hover:bg-white transition-colors"
                aria-label="Close stall preview"
              >
                <X className="size-5" />
              </button>

              <div className="absolute bottom-5 left-6 right-6">
                <span className="rounded-full bg-[#E3E890] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#392525]">
                  {stall.status} Spot • ৳{stall.dailyRate}/day
                </span>
                <h2 id="stall-modal-title" className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-sm line-clamp-1">
                  {stall.name}
                </h2>
                <p className="text-xs text-white/90 flex items-center gap-1.5 mt-0.5 drop-shadow-sm">
                  <MapPin className="size-3.5 text-[#E3E890]" /> {stall.zone} ({stall.side})
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between border-b border-[#392525]/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#728383]">
                    Stall ID: {stall.id}
                  </p>
                  <h3 className="font-serif text-xl font-bold">{stall.zone}</h3>
                </div>
                <div className="text-right">
                  <p className="font-serif text-2xl font-bold text-[#B25D3E]">৳{stall.dailyRate}</p>
                  <p className="text-[11px] text-[#728383]">per campus day</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                  Included Amenities
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stall.features.map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#392525] border border-[#392525]/10"
                    >
                      <Zap className="size-3 text-[#B25D3E]" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#3E4734]/80 bg-white/60 p-3 rounded-xl border border-[#392525]/10">
                A flexible 2m × 2m footprint with power access, high student foot traffic, and dedicated security oversight by BUP Campus Security. Perfect for club pop-ups, crafts, book sales, or food tastings.
              </p>

              {currentUser?.isBupVerified && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                  <span>BUP Student Club privilege: 15% booking concession will apply.</span>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-[#392525]/20 px-5 py-3 text-sm font-semibold hover:bg-white/50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#392525] px-6 py-3.5 text-sm font-semibold text-[#FAF5E9] shadow-md hover:bg-[#201414]"
                >
                  <span>Continue with this space</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BOOKING DETAILS FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmitBooking} className="p-6">
            <div className="flex items-center justify-between border-b border-[#392525]/10 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B25D3E]">
                  Step 2 of 2
                </span>
                <h3 className="font-serif text-2xl font-bold">Reserve Stall {stall.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setStep('preview')}
                className="text-xs font-semibold text-[#728383] hover:underline"
              >
                Back to preview
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#392525]/20 bg-white p-2.5 text-xs font-semibold text-[#392525]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                    Duration
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[#392525]/20 bg-white p-2.5 text-xs font-semibold text-[#392525]"
                  >
                    <option value={1}>1 Day (৳{stall.dailyRate})</option>
                    <option value={2}>2 Days (৳{stall.dailyRate * 2})</option>
                    <option value={3}>3 Days - Full Fest (৳{stall.dailyRate * 3})</option>
                    <option value={5}>5 Days - Weekly (৳{stall.dailyRate * 5})</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                  Student Club / Enterprise Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BUP Robotics Club / Batch '24 Bake Sale"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#392525]/20 bg-white p-2.5 text-xs font-medium text-[#392525]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                    Student / Applicant ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 22041108"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#392525]/20 bg-white p-2.5 text-xs font-medium text-[#392525]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+880 17xxxxxxxx"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#392525]/20 bg-white p-2.5 text-xs font-medium text-[#392525]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3E4734]">
                  What will you sell or showcase?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handmade ceramic mugs, club pins & stickers"
                  value={stallPurpose}
                  onChange={(e) => setStallPurpose(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#392525]/20 bg-white p-2.5 text-xs font-medium text-[#392525]"
                  required
                />
              </div>

              {/* Price summary */}
              <div className="rounded-2xl border border-[#392525]/15 bg-white/70 p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#3E4734]">
                  <span>Total Base Rent ({durationDays} days)</span>
                  <span className="font-bold">৳{totalCost}</span>
                </div>
                {currentUser?.isBupVerified && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>BUP Verified Student Discount (15%)</span>
                    <span>-৳{totalCost - discountedCost}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#392525] pt-1.5 border-t border-[#392525]/10">
                  <span>Payable Stall Fee</span>
                  <span className="font-serif text-lg text-[#B25D3E]">৳{discountedCost}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('preview')}
                className="rounded-full border border-[#392525]/20 px-5 py-3 text-sm font-semibold hover:bg-white/50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#213527] px-6 py-3.5 text-sm font-bold text-[#FAF5E9] shadow-md hover:bg-[#18261c] disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Confirming Stall Reservation...
                  </span>
                ) : (
                  <>
                    <span>Confirm & Generate Booking Pass</span>
                    <CheckCircle2 className="size-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: BOOKING CONFIRMATION PASS */}
        {step === 'success' && (
          <div className="p-6 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 shadow-md">
              <CheckCircle2 className="size-9" />
            </div>

            <span className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              Campus Stall Booked
            </span>

            <h3 className="mt-2 font-serif text-2xl font-bold">
              Space Reserved Successfully!
            </h3>
            <p className="mt-1 text-xs text-[#3E4734]/80">
              Your stall permit has been logged with the BUP Student Affairs & Campus Security office.
            </p>

            {/* Simulated Booking Pass */}
            <div className="mt-4 rounded-2xl border-2 border-dashed border-[#2d4734] bg-white p-5 text-left shadow-sm">
              <div className="flex items-center justify-between border-b border-[#392525]/10 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#728383]">
                    BUP Campus Pass
                  </p>
                  <p className="font-mono text-sm font-bold text-[#2d4734]">#{bookingPassCode}</p>
                </div>
                <div className="rounded-lg bg-[#E3E890] px-2.5 py-1 text-xs font-black text-[#211515]">
                  STALL {stall.id}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#728383] text-[10px] block">Location:</span>
                  <span className="font-bold text-[#392525]">{stall.name}</span>
                </div>
                <div>
                  <span className="text-[#728383] text-[10px] block">Date:</span>
                  <span className="font-bold text-[#392525]">{bookingDate} ({durationDays} days)</span>
                </div>
                <div>
                  <span className="text-[#728383] text-[10px] block">Reserved By:</span>
                  <span className="font-bold text-[#392525]">{clubName || 'Student Club'}</span>
                </div>
                <div>
                  <span className="text-[#728383] text-[10px] block">Fee Paid:</span>
                  <span className="font-bold text-[#B25D3E]">৳{discountedCost}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-[#392525] py-3.5 text-sm font-bold text-[#FAF5E9] hover:bg-[#201414]"
            >
              Done & Return to Map
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
