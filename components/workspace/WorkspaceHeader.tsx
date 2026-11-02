'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap,
  ShoppingBag,
  Store,
  ShoppingCart,
  Package
} from 'lucide-react'
import { useWorkspace, WorkspaceTab } from './WorkspaceContext'
import { SessionUser } from '@/lib/auth'
import { logoutAction } from '@/lib/actions/auth'
import { useCart } from '@/components/marketplace/CartProvider'

interface WorkspaceHeaderProps {
  user: SessionUser | null
}

export function WorkspaceHeader({ user }: WorkspaceHeaderProps) {
  const { activeTab, setActiveTab } = useWorkspace()
  const { count: cartCount } = useCart()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogoClick = () => {
    setActiveTab('hub')
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    if (pathname !== '/') {
      router.push('/')
    } else {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('tab')
        window.history.pushState({}, '', url.pathname)
      }
    }
  }

  const handleTabClick = (tab: WorkspaceTab) => {
    setActiveTab(tab)
    if (pathname !== '/') {
      router.push(`/?tab=${tab}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#392525]/10 bg-[#FAF5E9]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
        
        {/* Left: Clean Brand Logo & Name - Always returns to Campus Hub */}
        <div className="flex items-center justify-start shrink-0">
          <button
            type="button"
            onClick={handleLogoClick}
            className="group flex items-center gap-2.5 text-left focus:outline-none cursor-pointer whitespace-nowrap"
            title="Return to Campus Hub Homepage"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#213527] text-[#FAF5E9] shadow-sm transition-transform group-hover:scale-105 shrink-0">
              <GraduationCap className="size-5 text-[#E3E890]" />
            </span>
            <span className="font-serif text-lg font-bold tracking-tight text-[#392525] sm:text-xl whitespace-nowrap">
              BUP Nest
            </span>
          </button>
        </div>

        {/* Center: Dedicated Windows-Style Desktop Switcher (Round pill dock, big writings with second word on next line) */}
        <div className="flex items-center justify-center shrink-0">
          <nav
            aria-label="Workspace Desktops"
            className="flex items-center rounded-full border border-[#392525]/15 bg-[#392525]/[0.06] p-1.5 shadow-inner backdrop-blur-sm gap-1 sm:gap-2"
          >
            {/* Desktop 1: Campus Hub */}
            <button
              type="button"
              onClick={() => handleTabClick('hub')}
              className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 transition-all duration-300 sm:px-4.5 sm:py-2 cursor-pointer ${
                activeTab === 'hub'
                  ? 'bg-[#213527] text-[#FAF5E9] shadow-md'
                  : 'text-[#392525]/75 hover:bg-black/5 hover:text-[#392525]'
              }`}
            >
              <GraduationCap className={`size-4 sm:size-5 shrink-0 ${activeTab === 'hub' ? 'text-[#E3E890]' : ''}`} />
              <div className="flex flex-col text-left leading-[1.15]">
                <span className="text-xs sm:text-[15px] font-bold tracking-tight">Campus</span>
                <span className="text-xs sm:text-[15px] font-bold tracking-tight">Hub</span>
              </div>
            </button>

            {/* Desktop 2: Buyer Market */}
            <button
              type="button"
              onClick={() => handleTabClick('buyer')}
              className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 transition-all duration-300 sm:px-4.5 sm:py-2 cursor-pointer ${
                activeTab === 'buyer'
                  ? 'bg-[#B25D3E] text-[#FAF5E9] shadow-md'
                  : 'text-[#392525]/75 hover:bg-black/5 hover:text-[#392525]'
              }`}
            >
              <ShoppingBag className="size-4 sm:size-5 shrink-0" />
              <div className="flex flex-col text-left leading-[1.15]">
                <span className="text-xs sm:text-[15px] font-bold tracking-tight">Buyer</span>
                <span className="text-xs sm:text-[15px] font-bold tracking-tight">Market</span>
              </div>
              {user && !user.hasBuyerAccount && (
                <span className="ml-1 rounded-full bg-amber-500/20 text-amber-900 border border-amber-600/30 px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider hidden sm:inline-block">
                  Connect
                </span>
              )}
            </button>

            {/* Desktop 3: Seller Studio */}
            <button
              type="button"
              onClick={() => handleTabClick('seller')}
              className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 transition-all duration-300 sm:px-4.5 sm:py-2 cursor-pointer ${
                activeTab === 'seller'
                  ? 'bg-[#0e1711] text-[#FAF5E9] shadow-md border border-[#E3E890]/30'
                  : 'text-[#392525]/75 hover:bg-black/5 hover:text-[#392525]'
              }`}
            >
              <Store className="size-4 sm:size-5 shrink-0 text-[#E3E890]" />
              <div className="flex flex-col text-left leading-[1.15]">
                <span className="text-xs sm:text-[15px] font-bold tracking-tight">Seller</span>
                <span className="text-xs sm:text-[15px] font-bold tracking-tight">Studio</span>
              </div>
              {user && !user.hasSellerAccount && (
                <span className="ml-1 rounded-full bg-[#E3E890]/40 text-[#392525] border border-[#392525]/20 px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider hidden sm:inline-block">
                  Open Stall
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right: Cart & Clean User Status / Auth */}
        <div className="flex items-center justify-end gap-2">
          {/* Quick Cart Link */}
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center rounded-full border border-[#392525]/15 bg-white/80 p-2 text-[#392525] hover:bg-white hover:text-[#B25D3E] transition shadow-xs"
            title="Shopping Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B25D3E] px-1 text-[10px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Quick links for desktop */}
              {user.hasBuyerAccount && (
                <Link
                  href="/orders"
                  className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-[#392525]/80 hover:text-[#B25D3E] transition px-2 py-1 rounded-full hover:bg-black/5"
                  title="My Orders"
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>Orders</span>
                </Link>
              )}
              {user.hasSellerAccount && (
                <Link
                  href="/seller"
                  className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-[#392525]/80 hover:text-[#213527] transition px-2 py-1 rounded-full hover:bg-black/5"
                  title="Seller Studio"
                >
                  <Store className="h-3.5 w-3.5 text-[#B25D3E]" />
                  <span>Studio</span>
                </Link>
              )}

              <div
                className="flex items-center gap-2 rounded-full border border-[#392525]/15 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#392525]"
                title={`Signed in as ${user.name} (${user.isBothConnected ? 'Connected: Buyer & Seller' : user.hasSellerAccount ? 'Seller Account' : 'Buyer Account'})`}
              >
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="max-w-[100px] truncate">{user.name}</span>
                {user.isBothConnected ? (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider hidden lg:inline-block">
                    Connected
                  </span>
                ) : user.hasSellerAccount ? (
                  <span className="rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider hidden lg:inline-block">
                    Seller
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider hidden lg:inline-block">
                    Buyer
                  </span>
                )}
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-[#392525]/15 bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-[#728383] hover:text-[#392525] transition cursor-pointer"
                  title="Sign out"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-[#392525] hover:text-[#B25D3E] transition"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#213527] px-3.5 py-1.5 text-xs font-semibold text-[#FAF5E9] shadow-sm transition hover:bg-[#16241a]"
              >
                Join Nest
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
