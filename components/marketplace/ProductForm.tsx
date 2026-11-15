'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createProductAction, updateProductAction } from '@/lib/actions/products'
import { CATEGORIES } from '@/lib/format'
import { Image as ImageIcon, Sparkles, Check, ArrowRight } from 'lucide-react'

type ProductFormValues = {
  id?: string
  name?: string
  description?: string
  category?: string
  price?: number
  originalPrice?: number | null
  image?: string
  stock?: number
  tag?: string | null
  deliveryTime?: string
  isActive?: boolean
}

const PRESET_IMAGES = [
  {
    label: 'Mocha Wool Shawl',
    category: 'Merch',
    url: '/images/products/mens-paisley-wool-shawl.jpg',
  },
  {
    label: 'Striped Rugby Polo',
    category: 'Merch',
    url: '/images/products/varsity-striped-rugby-polo.jpg',
  },
  {
    label: 'Corduroy Shacket',
    category: 'Merch',
    url: '/images/products/slate-blue-corduroy-shacket.jpg',
  },
  {
    label: 'Emerald Green Shawl',
    category: 'Merch',
    url: '/images/products/womens-emerald-woven-shawl.jpg',
  },
  {
    label: 'Varsity Hoodie',
    category: 'Merch',
    url: '/images/products/bup-varsity-hoodie.jpg',
  },
  {
    label: 'Canteen Khichuri & Ilish',
    category: 'Dining & Canteen',
    url: '/images/products/khichuri-ilish-platter.jpg',
  },
  {
    label: 'Calculus & Notes',
    category: 'Textbooks',
    url: '/images/products/calculus-textbook-notes.jpg',
  },
  {
    label: 'Tuition & Study Media',
    category: 'Merch',
    url: '/images/products/tuition-media.jpg',
  },
  {
    label: 'Tech / Gadget',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Notebook & Stationery',
    category: 'Stationery & Arts',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  },
]

export function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const isEdit = !!initial?.id

  const defaultImageUrl =
    initial?.image ||
    '/images/products/bup-varsity-hoodie.jpg'

  const [imageUrl, setImageUrl] = useState(defaultImageUrl)
  const [imgLoadError, setImgLoadError] = useState(false)

  return (
    <form
      className="mx-auto max-w-xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        setError('')
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
          const result = isEdit
            ? await updateProductAction(initial!.id!, formData)
            : await createProductAction(formData)
          if (!result.ok) {
            setError(result.error)
            return
          }
          router.push('/seller')
          router.refresh()
        })
      }}
    >
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[#392525]">Product Title *</span>
        <input
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="e.g. Official BUP Navy Blue Varsity Hoodie"
          className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[#392525]">Detailed Description *</span>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={initial?.description}
          placeholder="Specify sizing, condition, author edition, materials, or pickup timing..."
          className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[#392525]">Campus Category *</span>
        <select
          name="category"
          defaultValue={initial?.category || 'Merch'}
          className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
        >
          {CATEGORIES.filter((c) => c !== 'All').map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#392525]">Selling Price (BDT) *</span>
          <input
            name="price"
            type="number"
            min={1}
            step="1"
            required
            defaultValue={initial?.price}
            placeholder="e.g. 850"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#392525]">Compare-at Original Price</span>
          <input
            name="originalPrice"
            type="number"
            min={1}
            step="1"
            defaultValue={initial?.originalPrice ?? undefined}
            placeholder="e.g. 1000 (shows strike-through)"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>
      </div>

      {/* Image Preview & URL section */}
      <div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#392525]">Product Image URL or Path *</span>
          <div className="flex gap-2">
            <input
              name="image"
              type="text"
              required
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                setImgLoadError(false)
              }}
              placeholder="/images/products/... or https://..."
              className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
            />
            <label className="cursor-pointer shrink-0 rounded-xl border border-[rgba(57,37,37,0.18)] bg-white px-3 py-2.5 text-xs font-semibold text-[#392525] hover:bg-stone-50 transition flex items-center gap-1">
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (evt) => {
                      if (evt.target?.result) {
                        setImageUrl(evt.target.result as string)
                        setImgLoadError(false)
                      }
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </label>
          </div>
        </label>

        {/* Quick image preset chips */}
        <div className="mt-2">
          <span className="text-[11px] font-medium text-[#728383]">
            Or choose a sample campus preset:
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setImageUrl(preset.url)
                  setImgLoadError(false)
                }}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                  imageUrl === preset.url
                    ? 'border-[#392525] bg-[#392525] text-white'
                    : 'border-[rgba(57,37,37,0.14)] bg-white/60 text-[#3E4734] hover:bg-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="mt-3 flex items-center gap-4 rounded-2xl border border-[rgba(57,37,37,0.12)] bg-white/50 p-3">
          <div className="relative h-20 w-16 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
            {imageUrl && !imgLoadError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Product preview"
                className="h-full w-full object-cover"
                onError={() => setImgLoadError(true)}
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="text-xs">
            <p className="font-semibold text-[#392525]">
              {imgLoadError ? 'Image failed to load' : 'Live Image Preview'}
            </p>
            <p className="mt-0.5 text-[#728383]">
              {imgLoadError
                ? 'Check the image URL format or choose a preset above.'
                : 'This is how your product will appear on shop cards and the detail page.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#392525]">Available Inventory Stock *</span>
          <input
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={initial?.stock ?? 10}
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#392525]">Promotional Tag</span>
          <input
            name="tag"
            defaultValue={initial?.tag ?? undefined}
            placeholder="e.g. Official, Trending, Best Value"
            className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[#392525]">Estimated Handover / Delivery Time</span>
        <input
          name="deliveryTime"
          defaultValue={initial?.deliveryTime || 'Same-day on campus'}
          placeholder="e.g. Same-day on campus, 1-2 days, Instant at Vista Cafe"
          className="w-full rounded-xl border border-[rgba(57,37,37,0.18)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[#B25D3E]"
        />
      </label>

      {isEdit && (
        <label className="flex items-center gap-2.5 rounded-xl border border-[rgba(57,37,37,0.12)] bg-white/60 p-3 text-sm">
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={initial?.isActive !== false}
            className="h-4 w-4 rounded border-gray-300 text-[#392525]"
          />
          <span className="font-medium text-[#392525]">Active listing (visible to campus buyers)</span>
        </label>
      )}

      {error && <p className="text-sm font-semibold text-[#B25D3E]">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#392525] py-3.5 text-sm font-semibold text-[#FAF5E9] shadow-md transition hover:bg-[#213527] disabled:opacity-60"
      >
        <span>{pending ? 'Saving listing…' : isEdit ? 'Save Changes' : 'Publish Product to Campus'}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}
