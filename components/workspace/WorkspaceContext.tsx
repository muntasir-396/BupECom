'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { SessionUser } from '@/lib/auth'

export type WorkspaceTab = 'hub' | 'buyer' | 'seller'

interface WorkspaceContextType {
  user: SessionUser | null
  activeTab: WorkspaceTab
  setActiveTab: (tab: WorkspaceTab) => void
  tabIndex: number
  isTransitioning: boolean
  slideNext: () => void
  slidePrev: () => void
  hasBuyerAccount: boolean
  hasSellerAccount: boolean
  isBothConnected: boolean
}

const TABS: WorkspaceTab[] = ['hub', 'buyer', 'seller']

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

export function WorkspaceProvider({
  children,
  user = null,
}: {
  children: React.ReactNode
  user?: SessionUser | null
}) {
  const [activeTab, setActiveTabState] = useState<WorkspaceTab>('hub')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const hasBuyerAccount = Boolean(user?.hasBuyerAccount)
  const hasSellerAccount = Boolean(user?.hasSellerAccount)
  const isBothConnected = Boolean(user?.isBothConnected)

  // Initialize from URL search param if present (?tab=buyer or ?tab=seller)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab') as WorkspaceTab
    if (tabParam && TABS.includes(tabParam)) {
      setActiveTabState(tabParam)
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search)
      const t = p.get('tab') as WorkspaceTab
      if (t && TABS.includes(t)) {
        setActiveTabState(t)
      } else {
        setActiveTabState('hub')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const setActiveTab = useCallback((tab: WorkspaceTab) => {
    if (tab === activeTab) {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    setIsTransitioning(true)
    setActiveTabState(tab)

    // Update URL query string without reloading page
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (tab === 'hub') {
        url.searchParams.delete('tab')
      } else {
        url.searchParams.set('tab', tab)
      }
      window.history.pushState({}, '', url.toString())
      window.scrollTo(0, 0)
    }

    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [activeTab])

  // Slide helpers
  const tabIndex = TABS.indexOf(activeTab)

  const slideNext = useCallback(() => {
    const nextIndex = Math.min(tabIndex + 1, TABS.length - 1)
    setActiveTab(TABS[nextIndex])
  }, [tabIndex, setActiveTab])

  const slidePrev = useCallback(() => {
    const prevIndex = Math.max(tabIndex - 1, 0)
    setActiveTab(TABS[prevIndex])
  }, [tabIndex, setActiveTab])

  // Keyboard navigation shortcuts: Alt+1 (Hub), Alt+2 (Buyer), Alt+3 (Seller)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault()
          setActiveTab('hub')
        } else if (e.key === '2') {
          e.preventDefault()
          setActiveTab('buyer')
        } else if (e.key === '3') {
          e.preventDefault()
          setActiveTab('seller')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveTab])

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        tabIndex,
        isTransitioning,
        slideNext,
        slidePrev,
        hasBuyerAccount,
        hasSellerAccount,
        isBothConnected,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
