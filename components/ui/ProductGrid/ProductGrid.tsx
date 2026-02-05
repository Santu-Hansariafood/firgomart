'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Eye, X, ChevronDown } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/utils/animations/animations'
import categoriesData from '@/data/categories.json'
import dynamic from 'next/dynamic'
import BeautifulLoader from '@/components/common/Loader/BeautifulLoader'
import OffersFilterChips, { Offer } from '@/components/ui/Filters/OffersFilterChips'
const MarqueeBanner = dynamic(() => import('@/components/ui/MarqueeBanner/MarqueeBanner'))
const PriceCategoryBanner = dynamic(() => import('@/components/ui/PriceCategoryBanner/PriceCategoryBanner'))
const ProductImageSlider = dynamic(() => import('@/components/common/ProductImageSlider/ProductImageSlider'))
import { FilterControls, FilterPanel } from './ProductFilters'

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
  appliedOffer?: {
    name: string
    type: string
    value?: string | number
  }
}

interface ProductGridProps {
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product) => void
  initialCategory?: string
}

const ProductGrid: React.FC<ProductGridProps> = ({ onProductClick, onAddToCart, initialCategory }) => {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const search = (searchParams.get('search') || '').trim()
  const category = initialCategory || (searchParams.get('category') || '').trim()
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
  const [selectedOffer, setSelectedOffer] = useState<string>('')
  const [selectedOfferDetails, setSelectedOfferDetails] = useState<Offer | null>(null)
  
  const handlePriceCategorySelect = (min: number, max: number, type?: string) => {
    setMinRating(null)
    setSelectedSize('')
    setSelectedOffer('')
    setSelectedOfferDetails(null)
    
    if (type === 'discount') {
      setMinPrice('')
      setMaxPrice('')
      setSortBy('price-asc')
    } else if (type === 'special') {
      setMinPrice('')
      setMaxPrice('')
      setSortBy('relevance')
    } else {
      setMinPrice(String(min))
      setMaxPrice(String(max))
      setSortBy('price-asc')
    }
    setPage(1)
  }

  type DropdownItem = { id: string | number; label: string }
  const getSizeOptionsForCategory = (cat: string): DropdownItem[] => {
    const createNumSizes = (start: number, end: number) => {
      const arr: DropdownItem[] = []
      for (let i = start; i <= end; i++) arr.push({ id: String(i), label: String(i) })
      return arr
    }
    let newSizes: DropdownItem[] = []
    if (cat === "Women's Fashion" || cat === "Men's Fashion" || cat === "Women's Footwear") {
      newSizes = createNumSizes(4, 10)
      newSizes = [
        { id: 'XS', label: 'XS' },
        { id: 'S', label: 'S' },
        { id: 'M', label: 'M' },
        { id: 'L', label: 'L' },
        { id: 'XL', label: 'XL' },
        { id: 'XXL', label: 'XXL' },
        { id: '3XL', label: '3XL' },
        { id: 'Free Size', label: 'Free Size' },
        ...newSizes,
      ]
    } else if (cat === "Men's Footwear") {
      newSizes = createNumSizes(4, 11)
    } else if (cat === "Beauty & Skincare" || cat === "Home & Kitchen" || cat === "Mobiles & Accessories" || cat === "Jewellery & Accessories") {
      newSizes = []
    } else {
      newSizes = [
        { id: 'XS', label: 'XS' },
        { id: 'S', label: 'S' },
        { id: 'M', label: 'M' },
        { id: 'L', label: 'L' },
        { id: 'XL', label: 'XL' },
        { id: 'XXL', label: 'XXL' },
        { id: '3XL', label: '3XL' },
        { id: 'Free Size', label: 'Free Size' },
      ]
    }
    return newSizes
  }
  const allSizes: DropdownItem[] = [
    { id: 'XS', label: 'XS' },
    { id: 'S', label: 'S' },
    { id: 'M', label: 'M' },
    { id: 'L', label: 'L' },
    { id: 'XL', label: 'XL' },
    { id: 'XXL', label: 'XXL' },
    { id: '3XL', label: '3XL' },
    { id: 'Free Size', label: 'Free Size' },
    ...Array.from({ length: 8 }, (_, i) => ({ id: String(4 + i), label: String(4 + i) })), // 4-11
  ]

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

  type JsonCategory = { name: string; subcategories?: string[] }
  const subcategoryOptionsFor = useCallback((cat: string): DropdownItem[] => {
    const entry = ((categoriesData as { categories: JsonCategory[] }).categories || []).find((c) => c.name === cat)
    const subs: string[] = Array.isArray(entry?.subcategories) ? entry!.subcategories : []
    return subs.map((s) => ({ id: s, label: s }))
  }, [])

  const shuffleArray = (array: Product[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

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
      const offerParam = selectedOffer ? `&offer=${encodeURIComponent(selectedOffer)}` : ''
      const res = await fetch(`/api/products?limit=${productsPerPage}&page=${pageNum}${stateParam}${adminParam}${searchParam}${categoryParam}${subcategoryParam}${sortParam}${priceParam}${ratingParam}${sizeParam}${offerParam}`)
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
        appliedOffer: (selectedOfferDetails && (
          (!selectedOfferDetails.category || selectedOfferDetails.category === p.category) &&
          (!selectedOfferDetails.subcategory || selectedOfferDetails.subcategory === p.subcategory)
        )) ? {
          name: selectedOfferDetails.name,
          type: selectedOfferDetails.type,
          value: selectedOfferDetails.value
        } : undefined
      })) as Product[]
    } catch {
      return []
    }
  }, [deliverToState, search, category, subcategory, sortBy, minPrice, maxPrice, minRating, selectedSize, selectedOffer, selectedOfferDetails])

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      setDisplayedProducts([]) 
      const [first, second] = await Promise.all([fetchPage(1), fetchPage(2)])
      let initial = [...first, ...second]
      
      if (sortBy === 'relevance' && !search) {
        initial = shuffleArray(initial)
      }
      
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
        <MarqueeBanner />
        <PriceCategoryBanner onSelectCategory={handlePriceCategorySelect} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground drop-shadow-md">FirgoMart Products</h2>
          <p className="text-foreground/60 hidden md:block whitespace-nowrap">
            {displayedProducts.length} Available Products
          </p>
          <FilterControls
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            isSortDropdownOpen={isSortDropdownOpen}
            setIsSortDropdownOpen={setIsSortDropdownOpen}
            sortBy={sortBy}
            setSortBy={setSortBy}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minRating={minRating}
            selectedSize={selectedSize}
            setPage={setPage}
          />
        </div>

        <AnimatePresence>
          {selectedOfferDetails && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-6 rounded-2xl bg-linear-to-r from-brand-purple to-indigo-600 p-6 text-white shadow-lg overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider">
                    Active Offer
                  </span>
                  <span className="text-white/60 text-sm">{selectedOfferDetails.type}</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{selectedOfferDetails.name}</h3>
                {selectedOfferDetails.value && (
                  <p className="text-white/90 text-lg">
                    {selectedOfferDetails.type.includes('discount') 
                      ? `Get ${selectedOfferDetails.value}% Off` 
                      : selectedOfferDetails.value}
                  </p>
                )}
              </div>
              
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <OffersFilterChips
            selectedOffer={selectedOffer || undefined}
            onChange={(next, offer) => { 
              setSelectedOffer(next || '')
              setSelectedOfferDetails(offer || null)
              setPage(1) 
            }}
          />
        </div>

        {isFilterOpen && (
          <FilterPanel
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            minRating={minRating}
            setMinRating={setMinRating}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            setPage={setPage}
            onClearFilters={() => {
              setMinPrice('')
              setMaxPrice('')
              setMinRating(null)
              setSelectedSize('')
              setSelectedOffer('')
              setSelectedOfferDetails(null)
              setPage(1)
            }}
            category={category}
            getSizeOptionsForCategory={getSizeOptionsForCategory}
            allSizes={allSizes}
          />
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
                  onClick={() => onProductClick({
                    ...product,
                    appliedOffer: selectedOfferDetails ? {
                      name: selectedOfferDetails.name,
                      type: selectedOfferDetails.type,
                      value: selectedOfferDetails.value
                    } : undefined
                  })}
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

                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[8px] sm:text-[10px] font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-brand-purple/50 glow-effect glow-sm z-20">
                    FirgoMart Product
                  </span>

                  {(typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo') ? (
                    <span className="absolute top-7 sm:top-8 left-2 bg-purple-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg z-10 animate-pulse">
                      {product.name.toLowerCase().includes('combo') ? 'COMBO OFFER' : `PACK OF ${product.unitsPerPack}`}
                    </span>
                  ) : null}

                  {product.discount && (
                    <span className="absolute top-2 right-2 bg-brand-red text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-red-500/50 glow-effect z-20">
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
