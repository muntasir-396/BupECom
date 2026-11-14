'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  Store,
  Settings,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  GraduationCap
} from 'lucide-react'
import { SessionUser } from '@/lib/auth'
import { logoutAction } from '@/lib/actions/auth'

interface AdminSidebarProps {
  user: SessionUser
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users & Verification', icon: Users },
  { href: '/admin/products', label: 'Catalog Moderation', icon: ShoppingBag },
  { href: '/admin/orders', label: 'Master Orders', icon: Package },
  { href: '/admin/payouts', label: 'Vendor Payouts', icon: DollarSign },
  { href: '/admin/stalls', label: 'Lakeside Stalls', icon: Store },
  { href: '/admin/settings', label: 'Settings & Logs', icon: Settings },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 bg-[#0c1610] text-[#FAF5E9] flex flex-col min-h-screen border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <span className="grid size-9 place-items-center rounded-xl bg-[#213527] border border-[#E3E890]/40 text-[#E3E890] shadow-sm group-hover:scale-105 transition">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-white block leading-tight">
              BUP Nest
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#E3E890] uppercase block">
              Administration
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#728383]">
          Management Console
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#213527] text-white border border-[#E3E890]/30 shadow-sm'
                  : 'text-[#FAF5E9]/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`size-4 shrink-0 ${isActive ? 'text-[#E3E890]' : 'text-[#728383]'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Return to Store & Profile Footer */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#FAF5E9]/80 hover:text-white transition"
        >
          <ArrowLeft className="size-3.5 text-[#E3E890]" />
          <span>Back to Campus Store</span>
        </Link>

        <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-emerald-400 font-mono truncate">Role: Platform Admin</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#FAF5E9]/60 hover:text-rose-400 transition cursor-pointer"
              title="Sign out of Admin"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

