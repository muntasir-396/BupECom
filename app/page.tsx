'use client'

import React, { useState, useEffect } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Fish,
  Leaf,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
  Star,
  CheckCircle2,
  Building2,
  Zap,
  Tag,
  Eye,
  Plus,
  Layers,
  ChevronRight
} from 'lucide-react'

import Link from 'next/link'
import { Product, Stall, CampusEvent } from '@/lib/types'
import { PRODUCTS, STALLS, CAMPUS_EVENTS } from '@/lib/mock-data'
import { BottomDock } from '@/components/bup/BottomDock'
import { SearchModal } from '@/components/bup/SearchModal'
import { StallBookingModal } from '@/components/bup/StallBookingModal'
import { ProductQuickViewModal } from '@/components/bup/ProductQuickViewModal'
import { CampusEventsModal } from '@/components/bup/CampusEventsModal'
import { CampusMapModal } from '@/components/bup/CampusMapModal'
import { CartDrawer } from '@/components/bup/CartDrawer'
import { useCart } from '@/components/marketplace/CartProvider'
import { useWorkspace } from '@/components/workspace/WorkspaceContext'
import { BuyerWorkspace } from '@/components/workspace/BuyerWorkspace'
import { SellerWorkspace } from '@/components/workspace/SellerWorkspace'

export default function Page() {
  const { items: cartItems, addItem, updateQty, removeItem, clear: clearCart, count: totalCartCount } = useCart()
  const { activeTab, setActiveTab, tabIndex, isTransitioning, user } = useWorkspace()

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS)
  const [stallsList, setStallsList] = useState<Stall[]>(STALLS)
  const [eventsList] = useState<CampusEvent[]>(CAMPUS_EVENTS)

  const [selectedStall, setSelectedStall] = useState<Stall | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeSection, setActiveSection] = useState<string>('top')
  const [sellerSubTab, setSellerSubTab] = useState<'overview' | 'listings' | 'stalls' | 'guidelines'>('overview')

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isEventsOpen, setIsEventsOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => setProductsList(data))
      .catch(() => setProductsList([]))
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['stalls', 'market', 'top']
      const scrollPos = window.scrollY + 180
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          const top = rect.top + window.scrollY
          if (scrollPos >= top) {
            setActiveSection(id)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        sellerName: product.seller,
      },
      quantity
    )
    showToast(`Added "${product.name.slice(0, 24)}..." to your campus bag!`)
  }

  // Seller management handlers
  const handleAddNewProduct = (newProduct: Product) => {
    setProductsList((prev) => [newProduct, ...prev])
    showToast(`Listing "${newProduct.name.slice(0, 24)}..." published to Buyer Market!`)
  }

  const handleDeleteProduct = (productId: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== productId))
    showToast(`Listing removed from campus catalog.`)
  }

  const handleToggleStock = (productId: string) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    )
    showToast(`Item stock status updated.`)
  }

  // Stall Booking Confirmation
  const handleBookingConfirmed = (stallId: string, bookingDetails: any) => {
    setStallsList((prev) =>
      prev.map((s) =>
        s.id === stallId
          ? { ...s, status: 'Reserved', reservedBy: bookingDetails.clubName }
          : s
      )
    )
    showToast(`Stall ${stallId} successfully reserved for ${bookingDetails.clubName}!`)
  }

  // 4 Curated Spotlight Products for the Homepage Quick View
  const spotlightProducts = productsList.slice(0, 4)

  // 3 Featured Lakeside Stalls for the Homepage Quick View
  const featuredStalls = stallsList.slice(0, 3)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAF5E9] text-[#392525]">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#213527]/20 bg-[#213527] px-5 py-3 text-xs font-semibold text-[#FAF5E9] shadow-2xl animate-in fade-in slide-in-from-top-4">
          <Sparkles className="size-4 text-[#E3E890]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HORIZONTAL WORKSPACE CANVAS (Windows-style desktop sliding container) */}
      <div className="relative w-full overflow-hidden">
        <div
          className="flex w-[300vw] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: `translateX(-${tabIndex * 100}vw)`,
            alignItems: 'flex-start',
          }}
        >

          {/* ======================================================== */}
          {/* DESKTOP 1: CAMPUS HUB (Landing Page Overview & Stalls)   */}
          {/* ======================================================== */}
          <div
            className={`w-[100vw] min-w-[100vw] max-w-[100vw] shrink-0 transition-opacity duration-300 pb-20 ${
              activeTab === 'hub'
                ? 'opacity-100'
                : isTransitioning
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none h-0 max-h-0 overflow-hidden'
            }`}
          >
            {/* HERO SECTION */}
            <section
              id="top"
              className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-10 lg:pb-24 lg:pt-12"
            >
              <div>
                <h1 className="max-w-2xl font-serif text-5xl leading-[1.02] tracking-[-.05em] text-[#392525] sm:text-7xl">
                  Everything we share,{' '}
                  <em className="text-[#B25D3E] not-italic underline decoration-[#E3E890] decoration-wavy decoration-2">
                    in one place.
                  </em>
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[#3E4734]/85">
                  The official campus marketplace for varsity apparel, academic materials, lake pop-up stalls, and canteen dining.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {/* Slides to Buyer Market */}
                  <button
                    onClick={() => setActiveTab('buyer')}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#213527] px-6 py-4 text-sm font-semibold text-[#FAF5E9] shadow-lg transition-all hover:bg-[#16241a] hover:shadow-xl active:scale-95"
                  >
                    <ShoppingBag className="size-4 text-[#E3E890]" />
                    <span>Open Buyer Market</span>
                    <ArrowRight className="size-4" />
                  </button>

                  {/* Slides to Seller Studio */}
                  <button
                    onClick={() => setActiveTab('seller')}
                    className="inline-flex items-center gap-2 rounded-full border border-[#392525]/25 bg-white/70 px-6 py-4 text-sm font-semibold hover:bg-white transition-all shadow-sm text-[#392525] active:scale-95"
                  >
                    <Store className="size-4 text-[#B25D3E]" />
                    <span>Seller Studio</span>
                  </button>

                  <a
                    href="#stalls"
                    className="rounded-full border border-[#392525]/25 bg-white/70 px-6 py-4 text-sm font-semibold hover:bg-white transition-all shadow-sm text-[#392525]"
                  >
                    Book a Stall Space
                  </a>
                </div>

                <div className="mt-10 flex items-center gap-3 text-xs font-medium text-[#3E4734]/80">
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Serving 8,000+ Students, Faculty &amp; Mirpur Cantonment Visitors</span>
                </div>
              </div>

              {/* Hero Showcase Card - BUP Lake & Waterfront */}
              <div className="group relative min-h-[420px] overflow-hidden rounded-[2.5rem] bg-[#0c1510] shadow-[0_24px_70px_rgba(0,0,0,.3)] sm:min-h-[460px] flex flex-col justify-between text-white border border-[#213527]/30">
                <img
                  src="/images/Bup_Lake.jfif"
                  alt="BUP Lake and Iconic Campus Arch Bridge"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50" />

                <div className="relative flex items-center justify-between p-6 sm:p-7">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#E3E890] shadow-sm">
                    <MapPin className="size-3 text-[#E3E890]" />
                    Monpura 
                  </span>
                  <span className="rounded-full bg-black/50 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-medium text-white/85">
                    Mirpur Cantonment
                  </span>
                </div>

                <div className="relative p-6 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-[#E3E890]">
                    BUP Lakefront
                  </p>
                  <h3 className="mt-1 font-serif text-3xl sm:text-4xl font-bold leading-tight text-white">
                    Arch Bridge Area
                  </h3>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a
                      href="#stalls"
                      className="inline-flex items-center gap-2 rounded-full bg-[#E3E890] px-5 py-2.5 text-xs font-bold text-[#141f17] shadow-lg hover:bg-white transition-all"
                    >
                      <span>View Lake Stalls</span>
                      <ArrowRight className="size-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        const canteenItem = productsList.find((p) => p.category === 'Dining & Canteen')
                        if (canteenItem) setSelectedProduct(canteenItem)
                      }}
                      className="rounded-full bg-white/20 backdrop-blur-md border border-white/25 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/30 transition-all"
                    >
                      Lakeside Menu
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center justify-between text-xs font-medium text-white/80 border-t border-white/15 px-6 py-3.5 sm:px-7 bg-black/50 backdrop-blur-md">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    Promenade Active
                  </span>
                </div>
              </div>
            </section>

            {/* FEATURED SERVICES HIGHLIGHT BAR */}
            <section className="mx-auto max-w-7xl px-5 py-4 lg:px-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => {
                    const hoodie = productsList.find((p) => p.category === 'Merch')
                    if (hoodie) setSelectedProduct(hoodie)
                  }}
                  className="flex items-center gap-4 rounded-3xl border border-[#392525]/10 bg-white/70 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#E3E890] text-[#213527] shrink-0">
                    <ShoppingBag className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#392525]">Varsity Apparel</h3>
                    <p className="text-xs text-[#3E4734]/70">Official hoodies &amp; crests</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    const book = productsList.find((p) => p.category === 'Textbooks')
                    if (book) setSelectedProduct(book)
                  }}
                  className="flex items-center gap-4 rounded-3xl border border-[#392525]/10 bg-white/70 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#FAF5E9] border border-[#392525]/15 text-[#B25D3E] shrink-0">
                    <BookOpen className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#392525]">Course Books</h3>
                    <p className="text-xs text-[#3E4734]/70">Textbooks &amp; past papers</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    const food = productsList.find((p) => p.category === 'Dining & Canteen')
                    if (food) setSelectedProduct(food)
                  }}
                  className="flex items-center gap-4 rounded-3xl border border-[#392525]/10 bg-white/70 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#213527] text-[#FAF5E9] shrink-0">
                    <UtensilsCrossed className="size-5 text-[#E3E890]" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#392525]">Campus Dining</h3>
                    <p className="text-xs text-[#3E4734]/70">Cafeteria specials &amp; snacks</p>
                  </div>
                </div>
              </div>
            </section>

            {/* MARKETPLACE QUICK VIEW (Curated Campus Spotlight) */}
            <section id="market" className="scroll-mt-24 bg-[#211515] px-5 py-16 text-[#FAF5E9] lg:px-10 lg:py-24 mt-12">
              <div className="mx-auto max-w-7xl">
                
                {/* Header */}
                <div className="mb-10">
                  <h2 className="font-serif text-3xl tracking-[-.04em] sm:text-5xl text-white">
                    Daily Campus <em className="text-[#B25D3E] not-italic">Spotlight &amp; Drops</em>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-white/70 max-w-xl">
                    Top curated varsity apparel, canteen favorites, and textbook highlights.
                  </p>
                </div>

                {/* 4 Spotlight Product Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {spotlightProducts.map((product) => (
                    <article
                      key={product.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#FAF5E9] text-[#392525] shadow-lg transition-transform duration-300 hover:-translate-y-1.5"
                    >
                      <div>
                        {/* Image container */}
                        <div className="relative h-56 overflow-hidden bg-stone-200">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {product.tag && (
                            <span className="absolute left-3.5 top-3.5 rounded-full bg-[#213527] px-3 py-1 text-[11px] font-bold text-[#FAF5E9] shadow-md">
                              {product.tag}
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="absolute right-3.5 top-3.5 grid size-9 place-items-center rounded-full bg-white/90 text-[#392525] shadow-md hover:bg-white transition-colors"
                            title="Quick preview"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>

                        {/* Content details */}
                        <div className="p-5">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#728383]">
                            <span>{product.category}</span>
                            <span className="flex items-center gap-1 text-amber-700">
                              <Star className="size-3 fill-current" /> {product.rating}
                            </span>
                          </div>

                          <h3
                            onClick={() => setSelectedProduct(product)}
                            className="mt-2.5 font-serif text-base font-bold leading-snug line-clamp-2 hover:text-[#B25D3E] cursor-pointer min-h-[2.5rem]"
                          >
                            {product.name}
                          </h3>
                        </div>
                      </div>

                      {/* Footer with Price and Add to Bag */}
                      <div className="border-t border-[#392525]/10 p-5 pt-3 flex items-center justify-between">
                        <div>
                          <span className="font-serif text-xl font-bold text-[#B25D3E]">
                            ৳{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="ml-2 text-xs line-through text-[#728383]">
                              ৳{product.originalPrice}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddToCart(product, 1)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#392525] px-4 py-2 text-xs font-bold text-[#FAF5E9] transition-all hover:bg-[#B25D3E] active:scale-95 shadow-sm"
                        >
                          <Plus className="size-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Gateway Banner into Full Buyer Market */}
                <div className="mt-12 rounded-3xl border border-white/15 bg-gradient-to-r from-black/60 via-[#213527]/70 to-black/60 p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-2xl">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3E890] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#211515]">
                      <ShoppingBag className="size-3.5" />
                      Dedicated Buyer Space
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                      Want to search all 50+ campus products &amp; cafeteria menus?
                    </h3>
                    <p className="mt-1 text-xs text-white/80 max-w-xl">
                      Switch to Buyer Market for comprehensive category filters, price sorting, student reviews, and verified seller profiles.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('buyer')}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#E3E890] px-6 py-3.5 text-xs font-bold text-[#211515] shadow-lg hover:bg-white transition-all shrink-0 active:scale-95"
                  >
                    <span>Launch Buyer Market</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>

              </div>
            </section>

            {/* CAMPUS STALLS QUICK VIEW (Concise Preview on Desktop 1) */}
            <section id="stalls" className="scroll-mt-24 bg-[#0e1711] text-[#FAF5E9] px-5 py-16 lg:px-10 lg:py-20 mt-12 relative overflow-hidden">
              {/* Ambient lighting effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-emerald-900/20 blur-3xl" />
                <div className="absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
              </div>

              <div className="relative mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-10">
                  <h2 className="font-serif text-3xl tracking-[-.04em] sm:text-5xl text-white">
                    Monpura Lakefront <em className="text-[#E3E890] not-italic">Pop-up Spaces</em>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-white/70 max-w-xl">
                    Prime promenade plots for varsity student ventures, club exhibitions, and dining pop-ups.
                  </p>
                </div>

                {/* 3 Featured Lakeside Stalls */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredStalls.map((stall) => (
                    <div
                      key={stall.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#E3E890]/40 hover:bg-white/[0.07] shadow-xl"
                    >
                      <div>
                        {/* Image box with status badge */}
                        <div className="relative h-44 overflow-hidden rounded-2xl bg-black/40">
                          <img
                            src={stall.image}
                            alt={stall.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-mono font-bold text-[#E3E890] backdrop-blur-md border border-white/10">
                            {stall.id}
                          </span>
                          <span
                            className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${
                              stall.status === 'Open'
                                ? 'bg-emerald-500/90 text-white'
                                : stall.status === 'Popular'
                                ? 'bg-amber-400 text-stone-900 font-black'
                                : 'bg-stone-500 text-white'
                            }`}
                          >
                            {stall.status === 'Popular' ? '★ Prime Spot' : stall.status}
                          </span>

                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-300">
                              <MapPin className="size-3" /> {stall.zone}
                            </span>
                            <span className="font-mono text-[11px] text-white/70">
                              {stall.dimensions}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="mt-4">
                          <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#E3E890] transition-colors">
                            {stall.name}
                          </h3>
                          <p className="mt-1 text-xs text-white/70 line-clamp-2">
                            {stall.description}
                          </p>

                          <div className="mt-3 flex items-center gap-3 text-[11px] text-white/60">
                            <span>Footfall: <strong className="text-white/90">{stall.footfall}</strong></span>
                            <span>•</span>
                            <span>Power: <strong className="text-white/90">{stall.powerGrid}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Footer with rate and reserve */}
                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-white/50">Daily Rate</span>
                          <p className="font-serif text-lg font-bold text-[#E3E890]">
                            ৳{stall.dailyRate} <span className="text-xs font-normal text-white/60">/ day</span>
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedStall(stall)}
                          disabled={stall.status === 'Reserved'}
                          className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 ${
                            stall.status === 'Reserved'
                              ? 'bg-stone-600 text-stone-400 cursor-not-allowed'
                              : 'bg-[#E3E890] text-[#141f17] hover:bg-white'
                          }`}
                        >
                          {stall.status === 'Reserved' ? 'Reserved' : 'Reserve Space'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gateway to Full Stalls Hub in Seller Studio */}
                <div className="mt-12 rounded-3xl border border-white/15 bg-gradient-to-r from-black/80 via-[#213527]/80 to-black/80 p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-2xl">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3E890] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#211515]">
                      <Store className="size-3.5" />
                      Campus Pop-up Headquarters
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                      Looking for all 9 zones, interactive blueprints &amp; night mode?
                    </h3>
                    <p className="mt-1 text-xs text-white/80 max-w-xl">
                      Explore the Library concourse, Academic Wing (FST/FBS), Auditorium Plaza, and full spatial blueprint in the dedicated Seller Studio.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSellerSubTab('stalls')
                      setActiveTab('seller')
                    }}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#E3E890] px-6 py-3.5 text-xs font-bold text-[#211515] shadow-lg hover:bg-white transition-all shrink-0 active:scale-95"
                  >
                    <span>Open Stalls Manager</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* CAMPUS SERVICES & EVENTS BANNER */}
            <section id="services" className="border-t border-[#392525]/10 px-5 py-14 lg:px-10">
              <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2.5rem] bg-[#E3E890] p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between shadow-xl">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-[#213527]">
                    Campus Life
                  </p>
                  <h2 className="mt-2 max-w-xl font-serif text-3xl sm:text-4xl leading-tight tracking-[-.03em] text-[#211515]">
                    More than a marketplace.<br />
                    <em className="text-[#B25D3E] not-italic">The rhythm of BUP life.</em>
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsEventsOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#213527] px-6 py-3.5 text-xs font-bold text-[#FAF5E9] shadow-md hover:bg-[#16241a] transition-all"
                  >
                    <CalendarDays className="size-4 text-[#E3E890]" />
                    <span>Campus Notices</span>
                  </button>

                  <button
                    onClick={() => setIsMapOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#213527]/30 bg-white/70 px-6 py-3.5 text-xs font-bold text-[#211515] shadow-sm hover:bg-white transition-all"
                  >
                    <MapPin className="size-4 text-[#B25D3E]" />
                    <span>Campus Map</span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* ======================================================== */}
          {/* DESKTOP 2: DEDICATED BUYER MARKETPLACE                   */}
          {/* ======================================================== */}
          <div
            className={`w-[100vw] min-w-[100vw] max-w-[100vw] shrink-0 transition-opacity duration-300 pb-20 ${
              activeTab === 'buyer'
                ? 'opacity-100'
                : isTransitioning
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none h-0 max-h-0 overflow-hidden'
            }`}
          >
            <BuyerWorkspace
              products={productsList}
              onAddToCart={handleAddToCart}
              onQuickView={(p) => setSelectedProduct(p)}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={totalCartCount}
            />
          </div>

          {/* ======================================================== */}
          {/* DESKTOP 3: DEDICATED SELLER STUDIO                       */}
          {/* ======================================================== */}
          <div
            className={`w-[100vw] min-w-[100vw] max-w-[100vw] shrink-0 transition-opacity duration-300 pb-20 ${
              activeTab === 'seller'
                ? 'opacity-100'
                : isTransitioning
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none h-0 max-h-0 overflow-hidden'
            }`}
          >
            <SellerWorkspace
              products={productsList}
              stalls={stallsList}
              currentUser={user}
              onAddNewProduct={handleAddNewProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleStock={handleToggleStock}
              onSelectStallForBooking={(s) => setSelectedStall(s)}
              activeSubTab={sellerSubTab}
              onSubTabChange={(t) => setSellerSubTab(t)}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={totalCartCount}
            />
          </div>

        </div>
      </div>

      {/* BOTTOM PERSISTENT NAVIGATION DOCK (ONLY ON CAMPUS HUB / HOMEPAGE) */}
      {activeTab === 'hub' && (
        <BottomDock
          cartCount={totalCartCount}
          currentUser={user as any}
          onOpenCart={() => {
            setIsCartOpen(true)
          }}
          onOpenAuth={() => {
            window.location.href = '/login'
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          activeSection={activeSection}
        />
      )}

      {/* MODALS */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={productsList}
        stalls={stallsList}
        events={eventsList}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onSelectStall={(stall) => setSelectedStall(stall)}
        onAddToCart={(product) => handleAddToCart(product, 1)}
      />

      <StallBookingModal
        stall={selectedStall}
        onClose={() => setSelectedStall(null)}
        currentUser={user as any}
        onOpenAuth={() => {
          window.location.href = '/login'
        }}
        onBookingConfirmed={handleBookingConfirmed}
      />

      <ProductQuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CampusEventsModal
        isOpen={isEventsOpen}
        onClose={() => setIsEventsOpen(false)}
        events={eventsList}
      />

      <CampusMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />

      {/* IN-APP CART DRAWER (Replaces standalone /cart and /checkout) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        currentUser={user as any}
        items={cartItems.map((line) => {
          const match = productsList.find((p) => p.id === line.productId)
          return {
            product: match || {
              id: line.productId,
              name: line.name,
              price: line.price,
              image: line.image,
              seller: line.sellerName,
              rating: 5.0,
              reviewsCount: 1,
              category: 'Merch',
              sellerType: 'Student Vendor',
              description: 'Campus marketplace product',
              inStock: true,
              deliveryTime: 'Campus Delivery',
            },
            quantity: line.quantity,
          }
        })}
        onUpdateQuantity={(pid, delta) => {
          const current = cartItems.find((i) => i.productId === pid)?.quantity || 1
          const next = current + delta
          if (next <= 0) removeItem(pid)
          else updateQty(pid, next)
        }}
        onRemoveItem={(pid) => removeItem(pid)}
        onClearCart={() => clearCart()}
        onOpenAuth={() => {
          window.location.href = '/login'
        }}
      />

    </div>
  )
}
