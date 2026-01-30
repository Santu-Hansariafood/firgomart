'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye, X, ChevronDown } from 'lucide-react'
import ProductImageSlider from '@/components/common/ProductImageSlider/ProductImageSlider'
import { fadeInUp, staggerContainer } from '@/utils/animations/animations'
import categoriesData from '@/data/categories.json'
import BeautifulLoader from '@/components/common/Loader/BeautifulLoader'

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
  unitsPerPack?: number
  isAdminProduct?: boolean
  hsnCode?: string
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
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [minRating, setMinRating] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')

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
    unitsPerPack?: number
    isAdminProduct?: boolean
    hsnCode?: string
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
      const sortParam = sortBy !== 'relevance' ? `&sortBy=${encodeURIComponent(sortBy)}` : ''
      const priceParam = minPrice || maxPrice ? `&minPrice=${minPrice}&maxPrice=${maxPrice}` : ''
      const ratingParam = minRating ? `&minRating=${minRating}` : ''
      const sizeParam = selectedSize ? `&size=${encodeURIComponent(selectedSize)}` : ''
      const res = await fetch(`/api/products?limit=${productsPerPage}&page=${pageNum}${stateParam}${adminParam}${searchParam}${categoryParam}${subcategoryParam}${sortParam}${priceParam}${ratingParam}${sizeParam}`)
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
        unitsPerPack: p.unitsPerPack,
        isAdminProduct: p.isAdminProduct,
        hsnCode: p.hsnCode,
      })) as Product[]
    } catch {
      return []
    }
  }, [deliverToState, search, category, subcategory, sortBy, minPrice, maxPrice, minRating, selectedSize])

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
    <section className="py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground drop-shadow-md">FirgoMart Products</h2>
          <p className="text-foreground/60 hidden md:block whitespace-nowrap">
            {displayedProducts.length} Available Products
          </p>
          <div className="flex items-center gap-2 relative">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isFilterOpen || minPrice || maxPrice || minRating || selectedSize
                  ? 'bg-brand-purple text-white border-brand-purple'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
              onClick={() => setIsFilterOpen((prev) => !prev)}
            >
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filters</span>
              {(minPrice || maxPrice || minRating || selectedSize) && (
                <span className="bg-white text-brand-purple text-[10px] font-bold px-1.5 rounded-full">!</span>
              )}
            </button>
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/20 text-sm font-medium hover:bg-foreground/5 transition-colors"
                onClick={() => setIsSortDropdownOpen((prev) => !prev)}
              >
                Sort: {sortBy === 'relevance' ? 'Relevance' : sortBy === 'price-asc' ? 'Price: Low to High' : sortBy === 'price-desc' ? 'Price: High to Low' : 'Rating'}
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background border border-foreground/20 rounded-lg shadow-lg z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/10"
                    onClick={() => { setSortBy('relevance'); setIsSortDropdownOpen(false); setPage(1) }}
                  >
                    Relevance
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/10"
                    onClick={() => { setSortBy('price-asc'); setIsSortDropdownOpen(false); setPage(1) }}
                  >
                    Price: Low to High
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/10"
                    onClick={() => { setSortBy('price-desc'); setIsSortDropdownOpen(false); setPage(1) }}
                  >
                    Price: High to Low
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/10"
                    onClick={() => { setSortBy('rating'); setIsSortDropdownOpen(false); setPage(1) }}
                  >
                    Rating
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border border-foreground/10 rounded-xl bg-foreground/5 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Price Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-foreground/20 text-sm bg-background"
                  />
                  <span className="text-foreground/40">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-foreground/20 text-sm bg-background"
                  />
                </div>
              </div>

              {/* Size Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Size</label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                      className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                        selectedSize === size
                          ? 'bg-brand-purple text-white border-brand-purple'
                          : 'bg-background border-foreground/20 hover:border-brand-purple/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Rating</label>
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(minRating === rating ? null : rating)}
                        onClick={(e) => {
                          if (minRating === rating) {
                            e.preventDefault()
                            setMinRating(null)
                          }
                        }}
                        className="w-4 h-4 text-brand-purple focus:ring-brand-purple"
                      />
                      <div className="flex items-center text-sm text-foreground/70 group-hover:text-foreground">
                        <span className="flex text-yellow-500 mr-1">
                          {Array.from({ length: rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                          {Array.from({ length: 5 - rating }).map((_, i) => (
                            <span key={i} className="text-gray-300">★</span>
                          ))}
                        </span>
                        & Up
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-end gap-2">
                <button
                  onClick={() => {
                    setPage(1)
                    // Trigger refetch by updating a dependency is handled by useEffect, 
                    // but we might want to force it if needed. 
                    // Actually dependencies [minPrice, maxPrice...] will trigger it automatically.
                    // But we want to apply ONLY when user is done? 
                    // The current implementation triggers on every change. 
                    // For better UX on inputs, maybe debounce or "Apply" button?
                    // Given the code structure, it's auto-fetching.
                    // Let's add a "Clear Filters" button.
                  }}
                  className="w-full py-2 bg-brand-purple text-white rounded-lg text-sm font-medium hover:bg-brand-purple/90 transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setMinPrice('')
                    setMaxPrice('')
                    setMinRating(null)
                    setSelectedSize('')
                    setPage(1)
                  }}
                  className="w-full py-2 bg-background border border-foreground/20 text-foreground/70 rounded-lg text-sm font-medium hover:bg-foreground/5 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
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
                        ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                        : 'bg-background text-foreground/70 border-foreground/20 hover:border-brand-purple/40 hover:text-brand-purple/80'
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 md:gap-4 lg:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-background rounded-xl overflow-hidden shadow-sm border border-[var(--foreground)/10]">
                <div className="aspect-square bg-foreground/10 animate-pulse" />
                <div className="p-2 sm:p-4 space-y-2">
                  <div className="h-3 sm:h-4 bg-foreground/10 rounded w-3/4 animate-pulse" />
                  <div className="h-2.5 sm:h-3 bg-foreground/10 rounded w-1/2 animate-pulse" />
                  <div className="h-6 sm:h-8 bg-foreground/10 rounded w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-background border border-foreground/20 rounded-xl p-6 text-center text-foreground/60">No products available</div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 md:gap-4 lg:gap-6"
          >
            {displayedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                className="bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-[var(--foreground)/10]"
              >
                <div 
                  className="relative aspect-square sm:aspect-3/4 overflow-hidden bg-gray-100 group cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  <ProductImageSlider
                  images={
                    product.images && product.images.length > 0
                      ? product.images.map(sanitizeImageUrl)
                      : [sanitizeImageUrl(product.image)]
                  }
                  name={product.name}
                  interval={1800}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                    <Eye className="w-5 h-5 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] sm:text-[10px] font-semibold px-2 py-1 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-brand-purple/50 glow-effect glow-sm">
                    FirgoMart Product
                  </span>

                  {(typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo') ? (
                    <span className="absolute top-8 left-2 bg-purple-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                      {product.name.toLowerCase().includes('combo') ? 'COMBO OFFER' : `PACK OF ${product.unitsPerPack}`}
                    </span>
                  ) : null}

                  {product.discount && (
                    <span className="absolute top-2 right-2 bg-brand-red text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-red-500/50 glow-effect">
                    {product.discount}% OFF
                  </span>
                  )}
                </div>
                <div className="p-2 sm:p-4">
                  <h3 
                    className="text-[11px] sm:text-sm font-semibold text-foreground group-hover/card:text-brand-purple active:text-purple-700 transition-colors mb-1 leading-snug line-clamp-2 cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="hidden sm:block text-xs text-foreground/60 mb-2">
                    {product.category}
                    {typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1 ? ` • Pack of ${product.unitsPerPack}` : ''}
                  </p>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div>
                      <span className="text-sm sm:text-lg font-bold text-foreground">₹{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <>
                          <span className="text-[11px] sm:text-sm text-foreground/50 line-through ml-2">₹{formatPrice(product.originalPrice)}</span>
                      {product.discount && (
                        <span className="text-[10px] sm:text-xs text-green-600 font-bold ml-2">
                            {product.discount}% OFF
                        </span>
                      )}
                        </>
                      )}
                    </div>
                    {typeof product.rating === "number" && (
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-[10px] sm:text-sm text-foreground/60">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 sm:gap-1.5">
                    <button
                      onClick={() => onProductClick(product)}
                      className="hidden sm:inline-flex flex-1 px-3 py-2 border border-brand-purple text-brand-purple rounded-lg hover:bg-brand-purple/10 transition-colors text-sm font-medium items-center justify-center"
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
                      className={`flex-1 px-2 py-2 sm:px-3 sm:py-2 rounded-lg transition-colors text-[11px] sm:text-sm font-medium flex items-center justify-center space-x-1 ${
                        (product.stock ?? 0) > 0
                          ? 'bg-brand-purple text-white hover:bg-brand-purple/90'
                          : 'bg-foreground/10 text-foreground/40 cursor-not-allowed'
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
              <div className="flex items-center space-x-2 text-foreground/60">
                <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                <BeautifulLoader />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductGrid
