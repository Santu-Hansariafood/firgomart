'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Eye, X, ChevronDown, Gift, ShoppingBag } from 'lucide-react'
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
    <section className="min-h-screen py-12 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-brand-purple/5 -skew-y-3 transform origin-top-left -z-10" />
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[80px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 transform hover:scale-[1.01] transition-transform duration-500">
          <MarqueeBanner />
        </div>
        
        <div className="mb-12">
          <PriceCategoryBanner onSelectCategory={handlePriceCategorySelect} />
        </div>

        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-10">
          <div className="space-y-2 relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-purple via-indigo-500 to-brand-purple bg-[length:200%_auto] animate-gradient">
                FirgoMart Products
              </span>
            </h2>
            <div className="flex items-center gap-3 text-sm text-foreground/60 font-medium">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20 shadow-sm backdrop-blur-sm">
                {displayedProducts.length} Premium Items
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Inventory
              </span>
            </div>
          </div>
          <div className="w-full md:w-auto z-10">
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
        </div>

        <AnimatePresence>
          {selectedOfferDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="rounded-3xl p-[1px] bg-gradient-to-r from-brand-purple via-pink-500 to-indigo-600 shadow-2xl overflow-hidden"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-[23px] p-6 sm:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-purple/20 transition-colors duration-700" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -ml-12 -mb-12 group-hover:bg-indigo-500/20 transition-colors duration-700" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-brand-purple text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-purple/30">
                        Active Offer
                      </span>
                      <span className="text-foreground/60 text-sm font-medium border-l-2 border-foreground/10 pl-2">{selectedOfferDetails.type}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{selectedOfferDetails.name}</h3>
                    {selectedOfferDetails.value && (
                      <p className="text-brand-purple font-semibold text-lg flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        {selectedOfferDetails.type.includes('discount') 
                          ? `Get ${selectedOfferDetails.value}% Instant Discount` 
                          : selectedOfferDetails.value}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedOffer('')
                      setSelectedOfferDetails(null)
                      setPage(1)
                    }}
                    className="p-2 rounded-full hover:bg-foreground/5 transition-colors group/close"
                  >
                    <X className="w-6 h-6 text-foreground/40 group-hover/close:text-brand-red transition-colors" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-10">
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
          <div className="mb-8">
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
          </div>
        )}

        {category && subcategoryOptionsFor(category).length > 0 && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-wrap gap-3">
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
                    className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95 ${
                      active
                        ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30 ring-2 ring-brand-purple ring-offset-2 ring-offset-background'
                        : 'bg-background border border-foreground/10 text-foreground/70 hover:border-brand-purple/40 hover:text-brand-purple hover:shadow-md hover:-translate-y-0.5'
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
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-sm font-medium bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 transition-all duration-300"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {displayedProducts.length === 0 && loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 lg:gap-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-background rounded-3xl overflow-hidden shadow-sm border border-foreground/5 p-3">
                <div className="aspect-[4/5] bg-foreground/5 rounded-2xl animate-pulse mb-4" />
                <div className="space-y-3 px-1">
                  <div className="h-4 bg-foreground/5 rounded-full w-3/4 animate-pulse" />
                  <div className="h-3 bg-foreground/5 rounded-full w-1/2 animate-pulse" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-foreground/5 rounded-full w-1/3 animate-pulse" />
                    <div className="h-8 w-8 bg-foreground/5 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-foreground/20" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
            <p className="text-foreground/60 max-w-md mx-auto">
              We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
            </p>
            <button 
              onClick={() => {
                const params = new URLSearchParams()
                router.push(`/?${params.toString()}`, { scroll: false })
                window.location.href = '/'
              }}
              className="mt-6 px-6 py-2.5 bg-brand-purple text-white rounded-full font-medium hover:bg-brand-purple/90 transition-colors shadow-lg shadow-brand-purple/20"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 lg:gap-8"
          >
            {displayedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                className="group bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-purple/10 transition-all duration-500 border border-foreground/5 hover:-translate-y-1.5"
              >
                <div 
                  className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-900/50 cursor-pointer"
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
                    interval={2500}
                  />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none" />

                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xl border border-white/10 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    Quick View
                  </span>

                  {(typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo') ? (
                    <span className="absolute bottom-3 left-3 right-3 text-center bg-white/90 dark:bg-black/90 backdrop-blur-md text-foreground text-[10px] font-bold px-2 py-1.5 rounded-xl shadow-lg z-10 border border-foreground/5">
                      {product.name.toLowerCase().includes('combo') ? '✨ COMBO OFFER' : `📦 PACK OF ${product.unitsPerPack}`}
                    </span>
                  ) : null}

                  {product.discount && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg shadow-red-500/30 z-20">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-[10px] font-medium text-brand-purple mb-1 uppercase tracking-wider opacity-80">{product.category}</p>
                    <h3 
                      className="text-sm font-bold text-foreground leading-snug line-clamp-2 cursor-pointer hover:text-brand-purple transition-colors min-h-[2.5em]"
                      onClick={() => onProductClick(product)}
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-end justify-between gap-2 mb-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-extrabold text-foreground">₹{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-foreground/40 line-through font-medium">MRP ₹{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    {typeof product.rating === "number" && (
                      <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded-md border border-yellow-400/20">
                        <span className="text-yellow-500 text-[10px]">★</span>
                        <span className="text-xs font-bold text-yellow-600">{product.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onProductClick(product)}
                      className="hidden sm:inline-flex flex-1 py-2.5 border border-foreground/10 text-foreground/70 rounded-xl hover:bg-foreground/5 hover:text-foreground transition-all text-xs font-bold items-center justify-center uppercase tracking-wide"
                    >
                      Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if ((product.stock ?? 0) > 0) {
                          onAddToCart(product)
                        }
                      }}
                      disabled={(product.stock ?? 0) <= 0}
                      className={`flex-1 py-2.5 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
                        (product.stock ?? 0) > 0
                          ? 'bg-brand-purple text-white shadow-brand-purple/25 hover:bg-brand-purple/90'
                          : 'bg-foreground/5 text-foreground/30 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{(product.stock ?? 0) > 0 ? 'Add' : 'Sold'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {hasMore && (
          <div ref={observerTarget} className="flex flex-col items-center justify-center mt-12 mb-8 gap-4">
            {loading && (
              <>
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-purple/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-brand-purple animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-foreground/50 animate-pulse">Loading more products...</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductGrid
