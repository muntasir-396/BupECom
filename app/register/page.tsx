'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition, useEffect } from 'react'
import { registerAction } from '@/lib/actions/auth'
import { SELLER_TYPES } from '@/lib/format'
import { Eye, EyeOff, ArrowRight, ShoppingBag, Store, Sparkles, Check } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectUrl = params.get('redirect')
  const initialRole = params.get('role') === 'SELLER' ? 'SELLER' : 'BUYER'

  const [accountType, setAccountType] = useState<'BUYER' | 'SELLER'>(initialRole)
  const [connectBoth, setConnectBoth] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (params.get('role') === 'SELLER') {
      setAccountType('SELLER')
    }
  }, [params])

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-lg flex-col justify-center px-4 py-12">
      {/* Account Type Segmented Selector */}
      <div className="mb-6">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-stone-200/60 border border-[#392525]/15 px-3 py-1 text-xs font-semibold text-[#392525] mb-3">
          <span>🛡️ Choose Your Account Type</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#392525]">Join BUP Nest</h1>
        <p className="mt-2 text-sm text-[#3E4734]">
          Buyer and Seller accounts are kept separate. You can connect both accounts whenever you choose to open both.
        </p>

        {/* Dual Account Toggle */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-stone-200/80 p-1.5 border border-[#392525]/10">
          <button
            type="button"
            onClick={() => setAccountType('BUYER')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              accountType === 'BUYER'
                ? 'bg-[#B25D3E] text-white shadow-md'
                : 'text-[#392525]/75 hover:text-[#392525] hover:bg-black/5'
            }`}
          >
            <ShoppingBag className="size-4" />
            <span>Buyer Account</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('SELLER')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              accountType === 'SELLER'
                ? 'bg-[#0e1711] text-[#FAF5E9] shadow-md border border-[#E3E890]/40'
                : 'text-[#392525]/75 hover:text-[#392525] hover:bg-black/5'
            }`}
          >
            <Store className="size-4 text-[#E3E890]" />
            <span>Seller Account</span>
          </button>
        </div>
      </div>

      {/* Account Type Highlights */}
      <div className="mb-4 rounded-2xl border border-[rgba(57,37,37,0.12)] bg-white/50 p-4 text-xs text-[#3E4734]">
        {accountType === 'BUYER' ? (
          <div>
            <p className="font-semibold text-[#392525] flex items-center gap-1.5">
              <ShoppingBag className="size-3.5 text-[#B25D3E]" />
              <span>Buyer Account Features</span>
            </p>
            <p className="mt-1 leading-relaxed text-[#728383]">
              Browse campus merchandise, pre-order meals from central canteens, enjoy automatic 5% verified student discount with your BUP ID, and track orders.
            </p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-[#392525] flex items-center gap-1.5">
              <Store className="size-3.5 text-emerald-700" />
              <span>Seller Account Features</span>
            </p>
            <p className="mt-1 leading-relaxed text-[#728383]">
              Set up your campus stall, list varsity merch or study guides, manage product inventory, and book lakefront Monpura booths.
            </p>
          </div>
        )}
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError('')
          const formData = new FormData(e.currentTarget)
          formData.set('role', accountType)
          formData.set('connectBoth', connectBoth ? 'true' : 'false')

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

            const destination = redirectUrl || (accountType === 'SELLER' ? '/?tab=seller' : '/?tab=buyer')
            router.push(destination)
            router.refresh()
          })
        }}
      >
        <input type="hidden" name="role" value={accountType} />

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
          <span className="mb-1 block font-medium text-[#3E4734]">
            Phone number {accountType === 'SELLER' ? '*' : '(optional)'}
          </span>
          <input
            name="phone"
            required={accountType === 'SELLER'}
            placeholder="+880 1711 000000"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>

        {accountType === 'BUYER' && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[#3E4734]">BUP Student ID (optional)</span>
            <input
              name="studentId"
              placeholder="e.g. 22041108"
              className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
            />
          </label>
        )}

        {/* Seller Specific Fields */}
        {(accountType === 'SELLER' || connectBoth) && (
          <div className="rounded-2xl border border-[rgba(57,37,37,0.15)] bg-white/70 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#392525]">
              <Store className="size-4 text-emerald-700" />
              <span>Seller Store Profile</span>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#3E4734]">Store / Stall Name *</span>
              <input
                name="storeName"
                required={accountType === 'SELLER' || connectBoth}
                placeholder="e.g. ICE Tech Corner, BUP Hoodie Co."
                className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#3E4734]">Seller Category</span>
              <select
                name="sellerType"
                defaultValue="Student Vendor"
                className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
              >
                {SELLER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#3E4734]">Short Store Bio (optional)</span>
              <input
                name="storeDescription"
                placeholder="What will your store offer on campus?"
                className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
              />
            </label>
          </div>
        )}

        {/* Dual Connect Checkbox Option */}
        <div className="rounded-xl border border-[rgba(57,37,37,0.12)] bg-stone-100/70 p-3.5">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={connectBoth}
              onChange={(e) => setConnectBoth(e.target.checked)}
              className="mt-0.5 size-4 rounded text-[#B25D3E] focus:ring-[#B25D3E]"
            />
            <div className="text-xs">
              <span className="font-bold text-[#392525] block">
                {accountType === 'BUYER'
                  ? '✨ Also open a Seller Account (Connect both now)'
                  : '✨ Also open a Buyer Account (Connect both now)'}
              </span>
              <span className="text-[#728383] block mt-0.5">
                {accountType === 'BUYER'
                  ? 'Check this to immediately unlock Seller Studio and list products alongside your buyer profile.'
                  : 'Check this to be able to order food, books, and merchandise with this same login.'}
              </span>
            </div>
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
          <span>
            {pending
              ? 'Creating account…'
              : connectBoth
              ? 'Create Connected Account (Buyer & Seller)'
              : accountType === 'SELLER'
              ? 'Create Seller Account'
              : 'Create Buyer Account'}
          </span>
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
