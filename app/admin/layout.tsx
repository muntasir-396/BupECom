import React from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { ensureSeeded } from '@/lib/seed'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await ensureSeeded()
  const user = await getSession()

  // Guard: Must be logged in as an ADMIN
  if (!user) {
    redirect('/login?redirect=/admin')
  }
  if (user.role !== 'ADMIN') {
    redirect('/?error=forbidden_admin')
  }

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#392525]">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Minimal Admin Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-white/80 px-6 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900 tracking-wide">
              BUP Nest Central Authority
            </span>
            <span className="text-xs text-[#728383] hidden sm:inline-block">
              Logged in as <strong className="text-[#392525]">{user.name}</strong> ({user.email})
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden md:inline-flex items-center gap-1.5 text-stone-500">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACID Relational Sync Active</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

