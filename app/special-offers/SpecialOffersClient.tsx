'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Filter, ChevronRight, Gift, ArrowLeft, Tag, Clock, Percent, Home } from 'lucide-react'
import Link from 'next/link'
import SidebarFilters from '@/components/common/OffersOverlay/SidebarFilters'
import { useCart } from '@/context/CartContext/CartContext'
import { useGeolocation } from '@/hooks/product-grid/useGeolocation'
import { DropdownItem } from '@/components/ui/ProductGrid/ProductFilters'
import { Product } from '@/types/product'
import ProductCard from '@/components/ui/ProductCard/ProductCard'
import { getProductPath } from '@/utils/productUtils'
import { Offer } from '@/components/ui/Filters/OffersFilterChips'

export default function SpecialOffersClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" /></div>}>
      <SpecialOffersContent />
    </Suspense>
  )
}

function SpecialOffersContent() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [hasMore, setHasMore] = useState<boolean>(true)
  
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [minRating, setMinRating] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedOffer = searchParams.get('offer') || ''
  const [selectedOfferDetails, setSelectedOfferDetails] = useState<Offer | null>(null)

  const productsPerPage = 24
  const observerTarget = useRef<HTMLDivElement | null>(null)
  const { addToCart, setShowCart } = useCart()
  const { countryCode } = useGeolocation()

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const params = new URLSearchParams()
        if (countryCode) params.set('country', countryCode)
        const res = await fetch(`/api/offers?${params.toString()}`, { cache: 'no-store' })
        const data = await res.json()
        const list = Array.isArray(data.offers) ? data.offers : []
        const now = new Date()
        const activeOffers = list.filter((o: any) => !o.expiryDate || new Date(o.expiryDate) > now)
        setOffers(activeOffers)
        
        if (selectedOffer) {
          const details = activeOffers.find((o: Offer) => o.key === selectedOffer)
          if (details) setSelectedOfferDetails(details)
        }
      } catch {
        setOffers([])
      } finally {
        if (!selectedOffer) setLoading(false)
      }
    }
    loadOffers()
  }, [countryCode, selectedOffer])

  const getSizeOptionsForCategory = (cat: string): DropdownItem[] => {
    const createNumSizes = (start: number, end: number) => {
      const arr: DropdownItem[] = []
      for (let i = start; i <= end; i++) arr.push({ id: String(i), label: String(i) })
      return arr
    }
    const standardSizes = [
      { id: 'XS', label: 'XS' }, { id: 'S', label: 'S' }, { id: 'M', label: 'M' },
      { id: 'L', label: 'L' }, { id: 'XL', label: 'XL' }, { id: 'XXL', label: 'XXL' },
      { id: '3XL', label: '3XL' }, { id: 'Free Size', label: 'Free Size' }
    ]
    if (cat === "Women's Fashion" || cat === "Men's Fashion" || cat === "Women's Footwear") {
      return [...standardSizes, ...createNumSizes(4, 10)]
    } else if (cat === "Men's Footwear") {
      return createNumSizes(4, 11)
    }
    return standardSizes
  }

  const allSizes: DropdownItem[] = [
    { id: 'XS', label: 'XS' }, { id: 'S', label: 'S' }, { id: 'M', label: 'M' },
    { id: 'L', label: 'L' }, { id: 'XL', label: 'XL' }, { id: 'XXL', label: 'XXL' },
    { id: '3XL', label: '3XL' }, { id: 'Free Size', label: 'Free Size' },
    ...Array.from({ length: 8 }, (_, i) => ({ id: String(4 + i), label: String(4 + i) })),
  ]

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      const params = new URLSearchParams()
      params.set('limit', String(productsPerPage))
      params.set('page', String(pageNum))
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (minRating) params.set('minRating', String(minRating))
      if (selectedSize) params.set('size', selectedSize)
      if (selectedOffer) params.set('offer', selectedOffer)
      if (sortBy) params.set('sortBy', sortBy)
      if (countryCode) params.set('country', countryCode)
      
      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) return []
      const data = await res.json()
      const list = Array.isArray(data.products) ? data.products : []
      
      return list.map((p: any) => ({
        ...p,
        id: p._id || p.id,
        _id: p._id || p.id,
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image || '',
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
  }, [minPrice, maxPrice, minRating, selectedSize, selectedOffer, selectedOfferDetails, sortBy, countryCode])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [selectedOffer])

  useEffect(() => {
    if (selectedOffer) {
      const loadInitial = async () => {
        setLoading(true)
        setDisplayedProducts([]) 
        const [first, second] = await Promise.all([fetchPage(1), fetchPage(2)])
        setDisplayedProducts([...first, ...second])
        setPage(2)
        setHasMore(second.length === productsPerPage)
        setLoading(false)
      }
      loadInitial()
    } else {
      setDisplayedProducts([])
    }
  }, [selectedOffer, fetchPage])

  const loadMore = useCallback(() => {
    if (loading || !hasMore || !selectedOffer) return
    setLoading(true)
    ;(async () => {
      const nextPage = page + 1
      const next = await fetchPage(nextPage)
      setDisplayedProducts(prev => [...prev, ...next])
      setPage(nextPage)
      setHasMore(next.length === productsPerPage)
      setLoading(false)
    })()
  }, [page, loading, hasMore, fetchPage, selectedOffer])

  useEffect(() => {
    if (!selectedOffer) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 } 
    )
    const currentTarget = observerTarget.current
    if (currentTarget) observer.observe(currentTarget)
    return () => { if (currentTarget) observer.unobserve(currentTarget) }
  }, [loadMore, selectedOffer])

  const handleProductClick = (product: Product) => {
    router.push(getProductPath(product.name, product._id || product.id))
  }

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 })
    setShowCart(true)
  }

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setMinRating(null)
    setSelectedSize('')
  }

  const handleSelectOffer = (offer: Offer) => {
    router.push(`/special-offers?offer=${offer.key}`)
  }

  const toCamelCase = (str: string) => {
    return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-16 pb-12">
      <div className="container mx-auto px-2 sm:px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-sm font-medium mb-1 sm:mb-2 overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-hide">
          <Link href="/" className="flex items-center gap-1 text-foreground/60 hover:text-brand-purple shrink-0">
            <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground/30 shrink-0" />
          {selectedOffer ? (
            <>
              <Link href="/special-offers" className="text-foreground/60 hover:text-brand-purple shrink-0">
                Special Offers
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground/30 shrink-0" />
              <span className="text-brand-purple font-bold truncate shrink-0 max-w-[150px] sm:max-w-none">
                {toCamelCase(selectedOfferDetails?.name || selectedOffer)}
              </span>
            </>
          ) : (
            <span className="text-brand-purple font-bold shrink-0">Special Offers</span>
          )}
        </nav>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-foreground/10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-brand-purple" />
                <span className="text-brand-purple">Special</span> Offers
              </h1>
              <p className="text-xs sm:text-sm text-foreground/50 mt-1">
                {selectedOfferDetails ? selectedOfferDetails.name : 'Exclusive deals and discounts just for you'}
              </p>
            </div>
            {selectedOffer && (
              <button 
                onClick={() => router.push('/special-offers')}
                className="p-2 hover:bg-foreground/5 rounded-full transition-colors flex items-center gap-2 text-sm font-medium text-foreground/70"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">All Offers</span>
              </button>
            )}
          </div>

          {!selectedOffer ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {offers.map((offer) => (
                <motion.button
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => handleSelectOffer(offer)}
                  className="relative group overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-foreground/5 shadow-sm hover:shadow-xl hover:shadow-brand-purple/10 transition-all duration-300 text-left h-40 sm:h-48 flex flex-col justify-between p-4 sm:p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-brand-purple/10 rounded-xl sm:rounded-2xl">
                        {offer.type.includes('discount') ? <Percent className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple" /> : <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple" />}
                      </div>
                      {offer.expiryDate && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[8px] sm:text-[10px] font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          <span>Limited</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-brand-purple transition-colors line-clamp-2">
                      {offer.name}
                    </h3>
                  </div>
                  <div className="relative z-10 flex items-center justify-between mt-auto pt-3 border-t border-foreground/5">
                     <span className="text-[10px] sm:text-xs font-medium text-foreground/60 uppercase tracking-wider">
                       {offer.type.replace('-', ' ')}
                     </span>
                     <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                     </div>
                  </div>
                </motion.button>
              ))}
              {loading && <div className="col-span-full py-20 flex justify-center"><div className="w-8 h-8 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" /></div>}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24 space-y-6">
                  <SidebarFilters 
                    minPrice={minPrice} setMinPrice={setMinPrice}
                    maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                    minRating={minRating} setMinRating={setMinRating}
                    selectedSize={selectedSize} setSelectedSize={setSelectedSize}
                    setPage={setPage}
                    onClearFilters={handleClearFilters}
                    category=""
                    getSizeOptionsForCategory={getSizeOptionsForCategory}
                    allSizes={allSizes}
                  />
                </div>
              </aside>

              <main className="flex-1">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-foreground/60 font-medium">
                    Showing {displayedProducts.length} Results
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-1.5 bg-background border border-foreground/10 rounded-full text-xs sm:text-sm font-medium hover:bg-foreground/5 transition-all"
                    >
                      <span className="text-foreground/50">Sort:</span>
                      <span className="text-foreground">{sortBy === 'relevance' ? 'Relevance' : sortBy === 'price-asc' ? 'Low to High' : sortBy === 'price-desc' ? 'High to Low' : 'Rating'}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isSortDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-background border border-foreground/10 rounded-xl shadow-xl overflow-hidden py-1 z-30">
                        {['relevance', 'price-asc', 'price-desc', 'rating'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => { setSortBy(opt); setIsSortDropdownOpen(false); setPage(1) }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-foreground/5 ${sortBy === opt ? 'text-brand-purple bg-brand-purple/5 font-bold' : ''}`}
                          >
                            {opt.charAt(0).toUpperCase() + opt.slice(1).replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {displayedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={handleProductClick}
                      onAddToCart={handleAddToCart}
                      compact
                    />
                  ))}
                </div>

                {displayedProducts.length === 0 && !loading && (
                  <div className="py-20 text-center">
                    <Filter className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-foreground/60">No products found</h3>
                    <button onClick={handleClearFilters} className="mt-4 text-brand-purple font-medium underline">Clear Filters</button>
                  </div>
                )}

                <div ref={observerTarget} className="py-10 flex justify-center">
                  {loading && <div className="w-8 h-8 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />}
                </div>
              </main>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
