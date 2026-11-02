'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition } from 'react'
import { loginAction } from '@/lib/actions/auth'
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'

  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-serif text-4xl text-[#392525]">Sign in</h1>
      <p className="mt-2 text-sm text-[#3E4734]">
        Sign in to your Buyer Account, Seller Account, or Connected Accounts.
      </p>

      {redirectUrl && redirectUrl !== '/' && (
        <div className="mt-4 rounded-xl border border-[#B25D3E]/30 bg-[#B25D3E]/10 p-3 text-xs text-[#392525]">
          Please sign in to continue to your requested page.
        </div>
      )}

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError('')
          const formData = new FormData(e.currentTarget)
          startTransition(async () => {
            const result = await loginAction(formData)
            if (!result.ok) {
              setError(result.error)
              return
            }
            router.push(redirectUrl)
            router.refresh()
          })
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#3E4734]">Email</span>
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#B25D3E]"
              placeholder="buyer@example.com"
            />
            <Mail className="absolute left-3 top-3 h-4 w-4 text-[#728383]" />
          </div>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#3E4734]">Password</span>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/70 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-[#B25D3E]"
              placeholder="••••••••"
            />
            <Lock className="absolute left-3 top-3 h-4 w-4 text-[#728383]" />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-[#728383] hover:text-[#392525]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {error && <p className="text-sm font-medium text-[#B25D3E]">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#392525] py-3 text-sm font-semibold text-[#FAF5E9] shadow-md transition hover:bg-[#213527] disabled:opacity-60"
        >
          <span>{pending ? 'Signing in…' : 'Sign in'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-[rgba(57,37,37,0.1)] bg-[#E3E890]/40 p-4 text-xs text-[#3E4734]">
        <p className="font-semibold text-[#392525]">Demo credentials (password: password123):</p>
        <p className="mt-1">🛍️ Buyer Account: <code className="font-mono text-[#392525]">buyer@example.com</code></p>
        <p>🏪 Seller Account: <code className="font-mono text-[#392525]">alumni@bupnest.com</code></p>
        <p>✨ Connected (Both): <code className="font-mono text-[#392525]">admin@bupnest.com</code></p>
      </div>

      <p className="mt-6 text-center text-sm text-[#3E4734]">
        Don&apos;t have an account yet?{' '}
        <Link
          href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
          className="font-medium text-[#B25D3E] underline"
        >
          Create one now
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#728383]">Loading sign in…</div>}>
      <LoginForm />
    </Suspense>
  )
}
