'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye, X } from 'lucide-react'
import FallbackImage from '@/components/common/Image/FallbackImage'
import { fadeInUp, staggerContainer } from '@/utils/animations/animations'
import categoriesData from '@/data/categories.json'

interface Product {
  id: string | number
  name: string
  image: string
  images?: string[]
  category: string
  subcategory?: string
  price: number
  originalPrice?: number
  discount?: number
  rating?: number
  brand?: string
  colors?: string[]
  sizes?: string[]
  about?: string
  additionalInfo?: string
  description?: string
  reviews?: number
  stock?: number
}

interface ProductGridProps {
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product) => void
}

const ProductGrid: React.FC<ProductGridProps> = ({ onProductClick, onAddToCart }) => {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const search = (searchParams.get('search') || '').trim()
  const category = (searchParams.get('category') || '').trim()
  const subcategory = (searchParams.get('subcategory') || '').trim()
  const [deliverToState, setDeliverToState] = useState<string>(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('deliverToState') || '' : ''
    } catch {
      return ''
    }
  })
  const observerTarget = useRef<HTMLDivElement | null>(null)
  const productsPerPage = 24
  const [geoAsked, setGeoAsked] = useState<boolean>(false)

  const sanitizeImageUrl = (src: string) => (src || '').trim().replace(/[)]+$/g, '')
  const formatPrice = (v: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v)

  type ApiProduct = {
    _id?: string | number
    id?: string | number
    name: string
    image?: string
    images?: string[]
    category: string
    subcategory?: string
    price: number
    originalPrice?: number
    discount?: number
    rating?: number
    brand?: string
    colors?: string[]
    sizes?: string[]
    about?: string
    additionalInfo?: string
    description?: string
    reviews?: number
    stock?: number
  }

  type DropdownItem = { id: string | number; label: string }
  type JsonCategory = { name: string; subcategories?: string[] }
  const subcategoryOptionsFor = useCallback((cat: string): DropdownItem[] => {
    const entry = ((categoriesData as { categories: JsonCategory[] }).categories || []).find((c) => c.name === cat)
    const subs: string[] = Array.isArray(entry?.subcategories) ? entry!.subcategories : []
    return subs.map((s) => ({ id: s, label: s }))
  }, [])

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      const stateParam = deliverToState ? `&deliverToState=${encodeURIComponent(deliverToState)}` : ''
      const adminParam = !deliverToState ? `&adminOnly=true` : ''
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
      const categoryParam = category ? `&category=${encodeURIComponent(category)}` : ''
      const subcategoryParam = subcategory ? `&subcategory=${encodeURIComponent(subcategory)}` : ''
      const res = await fetch(`/api/products?limit=${productsPerPage}&page=${pageNum}${stateParam}${adminParam}${searchParam}${categoryParam}${subcategoryParam}`)
      if (!res.ok) return []
      const data = await res.json()
      const list = Array.isArray(data.products) ? data.products : []
      return list.map((p: ApiProduct) => ({
        id: p._id || p.id,
        name: p.name,
        image: sanitizeImageUrl(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image || ''),
        images: Array.isArray(p.images) ? p.images : undefined,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        rating: p.rating,
        brand: p.brand,
        colors: p.colors,
        sizes: p.sizes,
        about: p.about,
        additionalInfo: p.additionalInfo,
        description: p.description,
        reviews: p.reviews,
        stock: p.stock,
      })) as Product[]
    } catch {
      return []
    }
  }, [deliverToState, search, category, subcategory])

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      setDisplayedProducts([]) 
      const [first, second] = await Promise.all([fetchPage(1), fetchPage(2)])
      const initial = [...first, ...second]
      setDisplayedProducts(initial)
      setPage(2)
      setHasMore(second.length === productsPerPage)
      setLoading(false)
    }
    loadInitial()
  }, [fetchPage])

  useEffect(() => {
    const save = (s: string | undefined, country?: string | undefined) => {
      const valid = typeof s === 'string' && s.trim().length > 0
      const inIndia = typeof country === 'string' ? country.trim().toLowerCase() === 'india' : true
      if (valid && inIndia) {
        setDeliverToState(s!.trim())
        try { localStorage.setItem('deliverToState', s!.trim()) } catch {}
      }
    }
    const geolocate = async () => {
      if (geoAsked || deliverToState) return
      setGeoAsked(true)
      try {
        await new Promise<void>((resolve) => {
          if (!('geolocation' in navigator)) { resolve(); return }
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const lat = pos.coords.latitude
                const lon = pos.coords.longitude
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
                const data = await res.json()
                const state = data?.principalSubdivision || ''
                const country = data?.countryName || ''
                save(state, country)
              } catch {}
              resolve()
            },
            () => resolve(),
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
          )
        })
      } catch {}
      try {
        if (!deliverToState) {
          const r = await fetch('https://ipapi.co/json/')
          const j = await r.json()
          const state = j?.region || ''
          const country = j?.country_name || ''
          save(state, country)
        }
      } catch {}
    }
    geolocate()
  }, [deliverToState, geoAsked])

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)
    ;(async () => {
      const nextPage = page + 1
      const next = await fetchPage(nextPage)
      setDisplayedProducts(prev => [...prev, ...next])
      setPage(nextPage)
      setHasMore(next.length === productsPerPage)
      setLoading(false)
    })()
  }, [page, loading, hasMore, fetchPage])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.5 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) observer.observe(currentTarget)

    return () => {
      if (currentTarget) observer.unobserve(currentTarget)
    }
  }, [loadMore])

  useEffect(() => {
    const opts = category ? subcategoryOptionsFor(category).map(o => o.label) : []
    if (!category && subcategory) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('subcategory')
      router.push(`/?${params.toString()}`, { scroll: false })
    } else if (subcategory && opts.length > 0 && !opts.includes(subcategory)) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('subcategory')
      router.push(`/?${params.toString()}`, { scroll: false })
    }
  }, [category, subcategory, searchParams, router, subcategoryOptionsFor])

  return (
    <section className="py-8 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--foreground)]">FirgoMart Products</h2>
          <p className="text-[var(--foreground)/60] hidden md:block whitespace-nowrap">
            {displayedProducts.length} products
          </p>
        </div>
        {category && subcategoryOptionsFor(category).length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {subcategoryOptionsFor(category).map((opt, idx) => {
                const active = subcategory === opt.label
                return (
                  <button
                    key={`${String(opt.id)}-${idx}`}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('subcategory', opt.label)
                      router.push(`/?${params.toString()}`, { scroll: false })
                      setPage(1)
                    }}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs sm:text-sm transition ${
                      active
                        ? 'bg-brand-purple text-white border-brand-purple'
                        : 'bg-[var(--background)] text-[var(--foreground)/70] border-[var(--foreground)/20] hover:border-brand-purple/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('subcategory')
                  router.push(`/?${params.toString()}`, { scroll: false })
                  setPage(1)
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs sm:text-sm bg-brand-red text-white border-brand-red hover:bg-brand-red/90"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {displayedProducts.length === 0 && loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 lg:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[var(--background)] rounded-xl overflow-hidden shadow-sm border border-[var(--foreground)/10]">
                <div className="aspect-square bg-[var(--foreground)/10] animate-pulse" />
                <div className="p-2 sm:p-4 space-y-2">
                  <div className="h-3 sm:h-4 bg-[var(--foreground)/10] rounded w-3/4 animate-pulse" />
                  <div className="h-2.5 sm:h-3 bg-[var(--foreground)/10] rounded w-1/2 animate-pulse" />
                  <div className="h-6 sm:h-8 bg-[var(--foreground)/10] rounded w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-[var(--background)] border border-[var(--foreground)/20] rounded-xl p-6 text-center text-[var(--foreground)/60]">No products available</div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 lg:gap-6"
          >
            {displayedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                className="bg-[var(--background)] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-[var(--foreground)/10]"
              >
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer group"
                  onClick={() => onProductClick(product)}
                >
                  <FallbackImage
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 20vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Eye className="w-5 h-5 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {product.discount && (
                    <span className="absolute top-2 right-2 bg-brand-red text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
                <div className="p-2 sm:p-4">
                  <h3 className="text-[11px] sm:text-sm font-medium text-[var(--foreground)] mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-[10px] sm:text-xs text-[var(--foreground)/60] mb-2">{product.category}</p>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div>
                      <span className="text-sm sm:text-lg font-bold text-[var(--foreground)]">₹{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-[11px] sm:text-sm text-[var(--foreground)/50] line-through ml-2">₹{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-[10px] sm:text-sm text-[var(--foreground)/60]">{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:space-x-1.5">
                    <button
                      onClick={() => onProductClick(product)}
                      className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-brand-purple text-brand-purple rounded-lg hover:bg-brand-purple/10 transition-colors text-[11px] sm:text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if ((product.stock ?? 0) > 0) {
                          onAddToCart(product)
                        }
                      }}
                      disabled={(product.stock ?? 0) <= 0}
                      className={`flex-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-colors text-[11px] sm:text-sm font-medium flex items-center justify-center space-x-1 ${
                        (product.stock ?? 0) > 0
                          ? 'bg-brand-purple text-white hover:bg-brand-purple/90'
                          : 'bg-[var(--foreground)/10] text-[var(--foreground)/40] cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{(product.stock ?? 0) > 0 ? 'Add' : 'Sold'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-8">
            {loading && (
              <div className="flex items-center space-x-2 text-[var(--foreground)/60]">
                <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                <span>Loading more products...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductGrid
