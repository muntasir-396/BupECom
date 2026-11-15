'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition } from 'react'
import { registerAction } from '@/lib/actions/auth'
import { SELLER_TYPES } from '@/lib/format'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectUrl = params.get('redirect')

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#E3E890]/40 border border-[#392525]/15 px-3 py-1 text-xs font-semibold text-[#392525]">
        <span>✨ One Account for Buying &amp; Selling</span>
      </div>
      <h1 className="mt-3 font-serif text-4xl text-[#392525]">Join BUP Nest</h1>
      <p className="mt-2 text-sm text-[#3E4734]">
        One unified account for the campus community. Buy essentials, book Monpura stalls, and sell your own listings anytime.
      </p>

      {/* Unified Features Pill Strip */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-lg bg-[rgba(57,37,37,0.06)] px-2.5 py-1 font-medium text-[#392525]">
          🛍️ Buyer Market Access
        </span>
        <span className="rounded-lg bg-[rgba(57,37,37,0.06)] px-2.5 py-1 font-medium text-[#392525]">
          🏪 Seller Studio Access
        </span>
        <span className="rounded-lg bg-[rgba(57,37,37,0.06)] px-2.5 py-1 font-medium text-[#392525]">
          🎓 Campus Discounts
        </span>
      </div>

      <form
        method="POST"
        action="#"
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError('')
          const formData = new FormData(e.currentTarget)
          formData.set('role', 'SELLER')

          const pass = formData.get('password')
          const confirmPass = formData.get('confirmPassword')
          if (pass !== confirmPass) {
            setError('Passwords do not match. Please re-enter.')
            return
          }

          startTransition(async () => {
            const result = await registerAction(formData)
            if (!result.ok) {
              setError(result.error)
              return
            }

            const destination = redirectUrl || '/'
            router.push(destination)
            router.refresh()
          })
        }}
      >
        <input type="hidden" name="role" value="SELLER" />

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#3E4734]">Full name *</span>
          <input
            name="name"
            required
            placeholder="Tanvir Ahmed"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#3E4734]">Email *</span>
          <input
            name="email"
            type="email"
            required
            placeholder="name@bup.edu.bd or personal email"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
          <span className="mt-1 block text-[11px] text-[#728383]">
            @bup.edu.bd emails automatically receive a 5% verified student discount.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#3E4734]">Phone number</span>
          <input
            name="phone"
            placeholder="+880 1711 000000"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#3E4734]">BUP Student ID (optional)</span>
          <input
            name="studentId"
            placeholder="e.g. 22041108"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>

        <div className="rounded-2xl border border-[rgba(57,37,37,0.12)] bg-white/40 p-3.5 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[#3E4734]">Store / Stall Name (optional)</span>
            <input
              name="storeName"
              placeholder="e.g. FST Tech Store, BUP Hoodie Co. (leave blank to use your name)"
              className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
            />
            <span className="mt-1 block text-[11px] text-[#728383]">
              You can list products anytime in Seller Studio with this name.
            </span>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[#3E4734]">Seller Category</span>
            <select
              name="sellerType"
              defaultValue="Student Vendor"
              className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
            >
              {SELLER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#3E4734]">Password * (min 6 characters)</span>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 py-2.5 pl-3.5 pr-10 text-sm outline-none focus:border-[#B25D3E]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-2.5 text-[#728383] hover:text-[#392525]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#3E4734]">Confirm Password *</span>
          <input
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>

        {error && <p className="text-sm font-medium text-[#B25D3E]">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#392525] py-3.5 text-sm font-semibold text-[#FAF5E9] shadow-md transition hover:bg-[#213527] disabled:opacity-60 cursor-pointer"
        >
          <span>{pending ? 'Creating account…' : 'Create Unified Account'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#3E4734]">
        Already have an account?{' '}
        <Link
          href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
          className="font-medium text-[#B25D3E] underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#728383]">Loading registration…</div>}>
      <RegisterForm />
    </Suspense>
  )
}
