'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  SlidersHorizontal,
  Star,
  Plus,
  Eye,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  Store,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Utensils,
  Coffee,
  Sun,
  Flame,
  Clock,
  Layers,
  Check
} from 'lucide-react'
import { Product } from '@/lib/types'
import { useWorkspace } from './WorkspaceContext'
import { openBuyerAccountAction } from '@/lib/actions/auth'

interface BuyerWorkspaceProps {
  products: Product[]
  onAddToCart: (product: Product, quantity?: number) => void
  onQuickView: (product: Product) => void
  onOpenCart?: () => void
  cartCount?: number
}

const CATEGORIES = [
  'All',
  'Dining & Canteen',
  'Merch',
  'Textbooks',
  'Electronics',
  'Stationery & Arts',
] as const

type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating'
type MealFilter = 'All' | 'Breakfast' | 'Lunch' | 'Snacks'

export function getProductMealType(p: Product): 'Breakfast' | 'Lunch' | 'Snacks' | undefined {
  if (p.mealType) return p.mealType
  const lower = (p.name + ' ' + (p.tag || '')).toLowerCase()
  if (
    lower.includes('paratha') ||
    lower.includes('shobji') ||
    lower.includes('daal') ||
    lower.includes('letka') ||
    lower.includes('breakfast') ||
    lower.includes('dim') ||
    lower.includes('egg')
  ) {
    return 'Breakfast'
  }
  if (
    lower.includes('tehari') ||
    lower.includes('roast') ||
    lower.includes('chicken fry') ||
    lower.includes('fried rice') ||
    lower.includes('khichuri') ||
    lower.includes('shada bhaat') ||
    lower.includes('steamed plain rice') ||
    (lower.includes('rice') && !lower.includes('fried'))
  ) {
    return 'Lunch'
  }
  if (
    lower.includes('sandwich') ||
    lower.includes('sandwhich') ||
    lower.includes('wedges') ||
    lower.includes('burger') ||
    lower.includes('pizza') ||
    lower.includes('hotdog') ||
    lower.includes('cinnamon') ||
    lower.includes('cold brew') ||
    lower.includes('snack')
  ) {
    return 'Snacks'
  }
  return undefined
}

export function BuyerWorkspace({
  products,
  onAddToCart,
  onQuickView,
  onOpenCart,
  cartCount = 0,
}: BuyerWorkspaceProps) {
  const { user, hasBuyerAccount, isBothConnected, setActiveTab } = useWorkspace()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedMealType, setSelectedMealType] = useState<MealFilter>('All')
  const [sortBy, setSortBy] = useState<SortOption>('recommended')
  const [inStockOnly, setInStockOnly] = useState(false)

  // Dining counts
  const diningProducts = useMemo(() => {
    return products.filter((p) => p.category === 'Dining & Canteen')
  }, [products])

  const breakfastCount = useMemo(() => {
    return diningProducts.filter((p) => getProductMealType(p) === 'Breakfast').length
  }, [diningProducts])

  const lunchCount = useMemo(() => {
    return diningProducts.filter((p) => getProductMealType(p) === 'Lunch').length
  }, [diningProducts])

  const snacksCount = useMemo(() => {
    return diningProducts.filter((p) => getProductMealType(p) === 'Snacks').length
  }, [diningProducts])

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
        const matchesSearch =
          searchQuery.trim() === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.mealType && p.mealType.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStock = !inStockOnly || p.inStock

        const meal = getProductMealType(p)
        const matchesMeal =
          selectedCategory !== 'Dining & Canteen' ||
          selectedMealType === 'All' ||
          meal === selectedMealType

        return matchesCategory && matchesSearch && matchesStock && matchesMeal
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return b.rating - a.rating
        return 0 // default recommended
      })
  }, [products, selectedCategory, searchQuery, inStockOnly, sortBy, selectedMealType])

  // Grouped products when viewing Dining & Canteen with "All" meal filter & no search query
  const isDiningGroupedView =
    selectedCategory === 'Dining & Canteen' &&
    selectedMealType === 'All' &&
    searchQuery.trim() === '' &&
    sortBy === 'recommended'

  const breakfastProducts = useMemo(
    () => filteredProducts.filter((p) => getProductMealType(p) === 'Breakfast'),
    [filteredProducts]
  )
  const lunchProducts = useMemo(
    () => filteredProducts.filter((p) => getProductMealType(p) === 'Lunch'),
    [filteredProducts]
  )
  const snacksProducts = useMemo(
    () => filteredProducts.filter((p) => getProductMealType(p) === 'Snacks'),
    [filteredProducts]
  )

  const renderProductCard = (product: Product) => {
    const meal = getProductMealType(product)
    return (
      <article
        key={product.id}
        className="group flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#FAF5E9] text-[#392525] shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-stone-200"
      >
        <div>
          {/* Product Image Box */}
          <div className="relative h-56 overflow-hidden bg-stone-200">
            <img
              src={product.image}
              alt={product.name}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Tag Badge */}
            {product.tag && (
              <span className="absolute left-3.5 top-3.5 rounded-full bg-[#213527] px-3 py-1 text-[11px] font-bold text-[#FAF5E9] shadow-md">
                {product.tag}
              </span>
            )}

            {/* Meal Category Badge */}
            {meal && (
              <span
                className={`absolute left-3.5 bottom-3.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase shadow-sm ${
                  meal === 'Breakfast'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : meal === 'Lunch'
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-rose-600 text-white font-black'
                }`}
              >
                {meal === 'Breakfast' ? '🌅 Breakfast' : meal === 'Lunch' ? '🍲 Lunch' : '🍟 Snack'}
              </span>
            )}

            {/* Stock Status Badge */}
            {!product.inStock && (
              <span className="absolute right-3.5 bottom-3.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                Sold Out
              </span>
            )}

            {/* Quick Preview Button */}
            <button
              onClick={() => onQuickView(product)}
              className="absolute right-3.5 top-3.5 grid size-9 place-items-center rounded-full bg-white/90 text-[#392525] shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95 cursor-pointer"
              title="Quick Preview"
            >
              <Eye className="size-4" />
            </button>
          </div>

          {/* Card Content */}
          <div className="p-5">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#728383]">
              <span className="truncate">{product.category}</span>
              <span className="flex items-center gap-1 text-amber-700 shrink-0">
                <Star className="size-3 fill-current" />
                {product.rating} <span className="text-stone-400 font-normal">({product.reviewsCount})</span>
              </span>
            </div>

            {/* Title */}
            <h3
              onClick={() => onQuickView(product)}
              className="mt-2.5 font-serif text-base font-bold leading-snug line-clamp-2 hover:text-[#B25D3E] cursor-pointer min-h-[2.5rem]"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Seller details */}
            <p className="mt-2 flex items-center gap-1 text-[11px] text-[#3E4734]/80">
              <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
              <span className="truncate">{product.seller}</span>
            </p>

            {/* Delivery hint */}
            <p className="mt-1 text-[10px] text-[#728383] truncate flex items-center gap-1">
              <Clock className="size-3 shrink-0 text-amber-600" />
              <span>{product.deliveryTime}</span>
            </p>
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
            onClick={() => onAddToCart(product, 1)}
            disabled={!product.inStock}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
              product.inStock
                ? 'bg-[#392525] text-[#FAF5E9] hover:bg-[#B25D3E]'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            <Plus className="size-3.5" />
            <span>{product.inStock ? 'Add' : 'Out'}</span>
          </button>
        </div>
      </article>
    )
  }

  return (
    <div className="w-full bg-[#211515] text-[#FAF5E9] pb-24 min-h-screen">
      
      {/* Banner if user is currently Seller only */}
      {user && !hasBuyerAccount && (
        <div className="bg-amber-950/80 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
              <span>🛍️ <strong>Seller Account Active:</strong> You are signed in as a seller ({user.name}). Open your Buyer account to order campus items and connect both accounts.</span>
            </div>
            <form
              action={async () => {
                await openBuyerAccountAction()
                window.location.reload()
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-[#E3E890] px-3 py-1 text-xs font-bold text-[#141f17] shadow-sm hover:bg-white transition cursor-pointer"
              >
                + Open Buyer Account &amp; Connect Both
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BUYER HEADER & VALUE PROP BANNER */}
      <section className="border-b border-white/10 bg-gradient-to-b from-[#180f0f] via-[#211515] to-[#211515] px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B25D3E] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  <ShoppingBag className="size-3.5" />
                  Buyer Marketplace
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/80 border border-white/10">
                  {products.length} Items Available
                </span>
              </div>

              <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl">
                BUP Student &amp; <em className="text-[#B25D3E] not-italic">Campus Store</em>
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Discover canteen dining pre-orders, varsity hoodies, semester coursebooks, engineering calculators, and lakeside stall specialties.
              </p>
            </div>

            {/* Quick Switch to Seller Studio */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('seller')}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-white/20 active:scale-95 cursor-pointer"
              >
                <Store className="size-4 text-[#E3E890]" />
                <span>Want to Sell? Open Seller Studio</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Campus Perks Strip */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md shadow-sm">
              <div className="grid size-10 place-items-center rounded-xl bg-[#213527] text-[#E3E890] shrink-0">
                <Truck className="size-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Free Campus Handover</p>
                <p className="text-white/60">Central Canteen, Vista, FST, FBS &amp; Lake deck</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md shadow-sm">
              <div className="grid size-10 place-items-center rounded-xl bg-[#B25D3E] text-white shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Verified BUP Sellers</p>
                <p className="text-white/60">Campus canteens, student societies &amp; licensed stalls</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md shadow-sm">
              <div className="grid size-10 place-items-center rounded-xl bg-[#E3E890] text-[#213527] shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Student ID Discounts</p>
                <p className="text-white/60">Extra 5% off automatically for verified students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH, CATEGORIES & CONTROLS TOOLBAR */}
      <section className="sticky top-[58px] z-30 border-b border-white/10 bg-[#211515]/95 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paratha, tehari, burger, khichuri, hoodies, books..."
              className="w-full rounded-full border border-white/15 bg-white/10 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-white/50 focus:border-[#B25D3E] focus:outline-none focus:ring-1 focus:ring-[#B25D3E] focus:bg-white/15 shadow-inner"
            />
            <Search className="absolute left-3.5 top-3 size-4 text-white/50" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-xs font-bold text-white/50 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort & Stock Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* In-Stock Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white/90 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="size-4 rounded border-white/20 bg-white/10 accent-[#B25D3E]"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs shadow-sm">
              <SlidersHorizontal className="size-3.5 text-white/60" />
              <span className="text-white/60">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="recommended" className="bg-[#211515] text-white">Recommended</option>
                <option value="price-low" className="bg-[#211515] text-white">Price: Low to High</option>
                <option value="price-high" className="bg-[#211515] text-white">Price: High to Low</option>
                <option value="rating" className="bg-[#211515] text-white">Highest Rated</option>
              </select>
            </div>

            {/* Sticky Toolbar Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 rounded-full bg-[#B25D3E] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#9d4c31] active:scale-95 cursor-pointer"
              title="Open Shopping Cart"
            >
              <ShoppingCart className="size-3.5 sm:size-4 shrink-0" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="flex size-4.5 items-center justify-center rounded-full bg-[#FAF5E9] text-[10px] font-black text-[#B25D3E] shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="mx-auto max-w-7xl mt-3 flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  if (cat !== 'Dining & Canteen') setSelectedMealType('All')
                }}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#B25D3E] text-white shadow-md font-bold'
                    : 'bg-white/[0.06] border border-white/15 text-white/80 hover:bg-white/15 hover:border-white/30'
                }`}
              >
                {cat === 'Dining & Canteen' ? '🍽️ Dining & Canteen' : cat}
              </button>
            )
          })}
        </div>
      </section>

      {/* DEDICATED DINING & CANTEEN SHOWCASE BANNER */}
      {selectedCategory === 'Dining & Canteen' && (
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-r from-[#2c1710] via-[#221515] to-[#181d15] p-6 sm:p-8 shadow-2xl">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 size-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3E890] px-3.5 py-1 text-xs font-bold text-[#141f17] shadow-sm">
                    <Utensils className="size-3.5" />
                    BUP Canteen &amp; Dining Hall
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80 border border-white/10">
                    Live Kitchen Counter Pickup
                  </span>
                </div>

                <h2 className="mt-3 font-serif text-2xl font-bold text-white sm:text-4xl">
                  Campus Dining, Hot Meals &amp; Quick Canteen Snacks
                </h2>
                <p className="mt-2 max-w-2xl text-xs sm:text-sm text-white/80 leading-relaxed">
                  Pre-order breakfast before 8:30 AM lectures, grab hearty student lunches during mid-day break, or enjoy fresh snacks with lake views. Zero line waiting at Central Canteen and Lake Deck counters.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-xl bg-white/10 px-3 py-1.5 border border-white/15 text-white/90">
                    📍 Central Canteen Ground Floor
                  </span>
                  <span className="rounded-xl bg-white/10 px-3 py-1.5 border border-white/15 text-white/90">
                    📍 Vista Cafeteria Dining Deck
                  </span>
                  <span className="rounded-xl bg-white/10 px-3 py-1.5 border border-white/15 text-white/90">
                    📍 Lake Promenade Refreshment Kiosk
                  </span>
                </div>
              </div>

              {/* Meal Time Quick Summary Cards */}
              <div className="grid grid-cols-3 gap-2.5 rounded-2xl border border-white/10 bg-black/40 p-3 text-center text-xs shrink-0 backdrop-blur-md">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                  <span className="text-amber-300 font-bold block text-xs">🌅 Breakfast</span>
                  <span className="text-white/60 text-[10px]">7:30 - 11:00 AM</span>
                  <span className="mt-1 block text-white font-medium text-[11px]">Paratha, Khichuri</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                  <span className="text-emerald-300 font-bold block text-xs">🍲 Lunch</span>
                  <span className="text-white/60 text-[10px]">12:00 - 3:30 PM</span>
                  <span className="mt-1 block text-white font-medium text-[11px]">Tehari, Roast, Rice</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                  <span className="text-rose-300 font-bold block text-xs">🍟 Snacks</span>
                  <span className="text-white/60 text-[10px]">All Day</span>
                  <span className="mt-1 block text-white font-medium text-[11px]">Burger, Wedges</span>
                </div>
              </div>
            </div>

            {/* Meal Filter Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              <span className="text-xs font-bold text-white/70 mr-1">Meal Period:</span>
              <button
                onClick={() => setSelectedMealType('All')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedMealType === 'All'
                    ? 'bg-[#E3E890] text-[#141f17] shadow-md'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                }`}
              >
                All Foods ({diningProducts.length})
              </button>
              <button
                onClick={() => setSelectedMealType('Breakfast')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedMealType === 'Breakfast'
                    ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                }`}
              >
                <span>🌅 Breakfast ({breakfastCount})</span>
              </button>
              <button
                onClick={() => setSelectedMealType('Lunch')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedMealType === 'Lunch'
                    ? 'bg-emerald-400 text-stone-950 shadow-md font-black'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                }`}
              >
                <span>🍲 Lunch ({lunchCount})</span>
              </button>
              <button
                onClick={() => setSelectedMealType('Snacks')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedMealType === 'Snacks'
                    ? 'bg-rose-400 text-white shadow-md font-black'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                }`}
              >
                <span>🍟 Snacks ({snacksCount})</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTS SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        
        {/* Results Count Header */}
        <div className="mb-6 flex items-center justify-between text-xs font-medium text-white/60">
          <span>
            Showing <strong className="text-white">{filteredProducts.length}</strong> items in{' '}
            <strong className="text-[#E3E890]">
              {selectedCategory === 'Dining & Canteen' && selectedMealType !== 'All'
                ? `Dining & Canteen (${selectedMealType})`
                : selectedCategory}
            </strong>
          </span>
          {(searchQuery || selectedCategory !== 'All' || inStockOnly || selectedMealType !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedMealType('All')
                setInStockOnly(false)
              }}
              className="flex items-center gap-1 font-semibold text-[#E3E890] hover:underline cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/[0.04] p-12 text-center text-white">
            <div className="grid size-16 place-items-center rounded-full bg-[#B25D3E]/20 text-white">
              <Search className="size-8 text-[#B25D3E]" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-bold text-white">
              No campus items found
            </h3>
            <p className="mt-1.5 max-w-md text-xs text-white/60">
              We couldn&apos;t find anything matching &quot;{searchQuery || selectedCategory}&quot;. Try adjusting your keywords or browse other departments.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedMealType('All')
                setInStockOnly(false)
              }}
              className="mt-5 rounded-full bg-[#B25D3E] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#9d4c31] cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : isDiningGroupedView ? (
          /* GROUPED DINING & CANTEEN VIEW (Breakfast, Lunch, Snacks) */
          <div className="space-y-12">
            
            {/* Breakfast Section */}
            {breakfastProducts.length > 0 && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-amber-500/20 text-amber-300 font-bold">
                      🌅
                    </span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-white">
                        Breakfast Special (7:30 AM - 11:00 AM)
                      </h3>
                      <p className="text-xs text-white/60">
                        Paratha, Shobji, Daal, Letka khichuri, Farm Egg — fresh off the morning tawa.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/20">
                    {breakfastProducts.length} Breakfast Items
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {breakfastProducts.map(renderProductCard)}
                </div>
              </div>
            )}

            {/* Lunch Section */}
            {lunchProducts.length > 0 && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold">
                      🍲
                    </span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-white">
                        Warm Campus Lunch (12:00 PM - 3:30 PM)
                      </h3>
                      <p className="text-xs text-white/60">
                        Steamed Rice, Fried Rice, Bhuna Khichuri, Tehari, Chicken fry, Chicken Roast.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/20">
                    {lunchProducts.length} Lunch Items
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {lunchProducts.map(renderProductCard)}
                </div>
              </div>
            )}

            {/* Snacks Section */}
            {snacksProducts.length > 0 && (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between border-b border-rose-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-xl bg-rose-500/20 text-rose-300 font-bold">
                      🍟
                    </span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-white">
                        Snacks &amp; Fast Food (All Day)
                      </h3>
                      <p className="text-xs text-white/60">
                        Club Sandwich, Paprika Wedges, Crispy Burger, Pan Pizza, Grilled Hotdog.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/20">
                    {snacksProducts.length} Snack Items
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {snacksProducts.map(renderProductCard)}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD PRODUCTS GRID */
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(renderProductCard)}
          </div>
        )}
      </section>

      {/* CAMPUS PICKUP LOCATIONS INFO */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="rounded-[2.5rem] border border-white/15 bg-white/[0.04] p-6 text-white sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-[#B25D3E]/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FAF5E9] border border-[#B25D3E]/40">
                Campus Delivery &amp; Canteen Pickup Network
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                Where can I collect my BUP Nest orders?
              </h2>
              <p className="mt-2 max-w-xl text-xs text-white/80 sm:text-sm">
                Canteen dining pre-orders can be collected directly at Central Canteen counters, Vista Cafeteria, or Lake Deck. Society items and merchandise are handed over at library lounges or faculty atriums.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3.5 py-1.5 font-medium border border-white/15 text-white/90">
                📍 Central Canteen Fast Counter
              </span>
              <span className="rounded-full bg-white/10 px-3.5 py-1.5 font-medium border border-white/15 text-white/90">
                📍 Vista Cafeteria Main Deck
              </span>
              <span className="rounded-full bg-white/10 px-3.5 py-1.5 font-medium border border-white/15 text-white/90">
                📍 Monpura Lake Pavilion
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING ACTION CART PILL (Fixed Bottom-Right for Instant Access) */}
      <button
        type="button"
        onClick={onOpenCart}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-[#B25D3E] px-5 py-3.5 text-sm font-bold text-[#FAF5E9] shadow-2xl transition-all duration-300 hover:bg-[#9d4c31] hover:scale-105 active:scale-95 cursor-pointer border border-white/25"
        title="View Shopping Cart"
      >
        <div className="relative">
          <ShoppingCart className="size-5 shrink-0" />
          {cartCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#B25D3E] shadow-sm">
              {cartCount}
            </span>
          )}
        </div>
        <span>View Cart {cartCount > 0 ? `(${cartCount})` : ''}</span>
      </button>

    </div>
  )
}
