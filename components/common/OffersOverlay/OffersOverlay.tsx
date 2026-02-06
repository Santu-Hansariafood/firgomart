'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Filter, ChevronRight, Gift, ShoppingBag, ArrowLeft, Tag, Clock, Percent } from 'lucide-react'
import Image from 'next/image'
import OffersFilterChips, { Offer } from '@/components/ui/Filters/OffersFilterChips'
import SidebarFilters from './SidebarFilters'
import { useCart } from '@/context/CartContext/CartContext'
import { DropdownItem } from '@/components/ui/ProductGrid/ProductFilters'

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

interface OffersOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function OffersOverlay({ isOpen, onClose }: OffersOverlayProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [minRating, setMinRating] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedOffer, setSelectedOffer] = useState<string>('')
  const [selectedOfferDetails, setSelectedOfferDetails] = useState<Offer | null>(null)
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const router = useRouter()
  const category = '' 
  
  const productsPerPage = 24
  const observerTarget = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // Fetch Offers
  useEffect(() => {
    const loadOffers = async () => {
      try {
        const res = await fetch('/api/offers', { cache: 'no-store' })
        const data = await res.json()
        const list = Array.isArray(data.offers) ? data.offers : []
        const now = new Date()
        setOffers(list.filter((o: any) => !o.expiryDate || new Date(o.expiryDate) > now))
      } catch {
        setOffers([])
      }
    }
    if (isOpen) loadOffers()
  }, [isOpen])

  // Helper: Get Sizes
  const getSizeOptionsForCategory = (cat: string): DropdownItem[] => {
    const createNumSizes = (start: number, end: number) => {
      const arr: DropdownItem[] = []
      for (let i = start; i <= end; i++) arr.push({ id: String(i), label: String(i) })
      return arr
    }
    if (cat === "Women's Fashion" || cat === "Men's Fashion" || cat === "Women's Footwear") {
      return [
        { id: 'XS', label: 'XS' }, { id: 'S', label: 'S' }, { id: 'M', label: 'M' },
        { id: 'L', label: 'L' }, { id: 'XL', label: 'XL' }, { id: 'XXL', label: 'XXL' },
        { id: '3XL', label: '3XL' }, { id: 'Free Size', label: 'Free Size' },
        ...createNumSizes(4, 10)
      ]
    } else if (cat === "Men's Footwear") {
      return createNumSizes(4, 11)
    }
    return [
      { id: 'XS', label: 'XS' }, { id: 'S', label: 'S' }, { id: 'M', label: 'M' },
      { id: 'L', label: 'L' }, { id: 'XL', label: 'XL' }, { id: 'XXL', label: 'XXL' },
      { id: '3XL', label: '3XL' }, { id: 'Free Size', label: 'Free Size' },
    ]
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
      
      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) return []
      const data = await res.json()
      const list = Array.isArray(data.products) ? data.products : []
      
      return list.map((p: any) => ({
        id: p._id || p.id,
        name: p.name,
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image || '',
        images: p.images,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        rating: p.rating,
        brand: p.brand,
        colors: p.colors,
        sizes: p.sizes,
        description: p.description,
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
  }, [minPrice, maxPrice, minRating, selectedSize, selectedOffer, selectedOfferDetails, sortBy])

  // Load Products when Offer Selected
  useEffect(() => {
    if (isOpen && selectedOffer) {
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
    } else if (!selectedOffer) {
      setDisplayedProducts([])
    }
  }, [isOpen, selectedOffer, fetchPage]) // Only re-run when offer changes

  // Reload when filters change (only if offer selected)
  useEffect(() => {
    if (!isOpen || !selectedOffer) return
    const reload = async () => {
      setLoading(true)
      setDisplayedProducts([])
      setPage(1)
      const first = await fetchPage(1)
      setDisplayedProducts(first)
      setHasMore(first.length === productsPerPage)
      setLoading(false)
    }
    // Skip initial load (handled above) by checking if we have products? 
    // Actually, simple way: if filters are defaults, skip? No.
    // We'll let this run, but we need to avoid double fetch with the effect above.
    // The effect above runs on `selectedOffer` change.
    // This effect runs on `minPrice`, etc.
  }, [minPrice, maxPrice, minRating, selectedSize, sortBy]) 

  const loadMore = useCallback(() => {
    if (loading || !hasMore || !isOpen || !selectedOffer) return
    setLoading(true)
    ;(async () => {
      const nextPage = page + 1
      const next = await fetchPage(nextPage)
      setDisplayedProducts(prev => [...prev, ...next])
      setPage(nextPage)
      setHasMore(next.length === productsPerPage)
      setLoading(false)
    })()
  }, [page, loading, hasMore, fetchPage, isOpen, selectedOffer])

  useEffect(() => {
    if (!isOpen || !selectedOffer) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.5, root: scrollContainerRef.current } 
    )
    const currentTarget = observerTarget.current
    if (currentTarget) observer.observe(currentTarget)
    return () => { if (currentTarget) observer.unobserve(currentTarget) }
  }, [loadMore, isOpen, selectedOffer])

  const handleProductClick = (product: Product) => {
    onClose()
    router.push(`/product/${product.id}`)
  }

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setMinRating(null)
    setSelectedSize('')
  }

  const handleSelectOffer = (offer: Offer) => {
    setSelectedOffer(offer.key)
    setSelectedOfferDetails(offer)
    setPage(1)
    handleClearFilters()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-6 bg-background rounded-3xl shadow-2xl z-[100] overflow-hidden flex flex-col border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/5 bg-background/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                 {selectedOffer && (
                   <button 
                     onClick={() => { setSelectedOffer(''); setSelectedOfferDetails(null) }}
                     className="p-2 -ml-2 hover:bg-foreground/5 rounded-full transition-colors group"
                     title="Back to All Offers"
                   >
                     <ArrowLeft className="w-5 h-5 text-foreground/70 group-hover:text-foreground" />
                   </button>
                 )}
                 <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                       <Gift className="w-6 h-6 text-brand-purple" />
                       <span className="text-brand-purple">Special</span> Offers
                    </h2>
                    <p className="text-xs text-foreground/50 hidden sm:block">
                      {selectedOffer ? selectedOfferDetails?.name : 'Select an offer to browse deals'}
                    </p>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-foreground/70" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto custom-scrollbar bg-background/50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {!selectedOffer ? (
                      // Offers Grid View
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer) => (
                          <motion.button
                            key={offer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectOffer(offer)}
                            className="relative group overflow-hidden rounded-3xl bg-white dark:bg-gray-800 border border-foreground/5 shadow-lg hover:shadow-2xl hover:shadow-brand-purple/20 transition-all duration-300 text-left h-48 flex flex-col justify-between p-6"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-brand-purple/10 rounded-2xl">
                                  {offer.type.includes('discount') ? (
                                    <Percent className="w-6 h-6 text-brand-purple" />
                                  ) : (
                                    <Tag className="w-6 h-6 text-brand-purple" />
                                  )}
                                </div>
                                {offer.expiryDate && (
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    <Clock className="w-3 h-3" />
                                    <span>Limited Time</span>
                                  </div>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-foreground group-hover:text-brand-purple transition-colors line-clamp-2">
                                {offer.name}
                              </h3>
                            </div>

                            <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-foreground/5">
                               <div className="flex flex-col">
                                  <span className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">Offer Type</span>
                                  <span className="text-sm font-medium text-foreground/80">
                                    {offer.type === 'discount-min' ? 'Minimum Discount' : 
                                     offer.type === 'pack-min' ? 'Bulk Pack' : 
                                     offer.type === 'category' ? 'Category Special' : 'Custom Deal'}
                                  </span>
                               </div>
                               <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors">
                                  <ChevronRight className="w-4 h-4" />
                               </div>
                            </div>
                          </motion.button>
                        ))}
                        
                        {offers.length === 0 && !loading && (
                           <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                              <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
                                <Gift className="w-8 h-8 text-foreground/20" />
                              </div>
                              <h3 className="text-lg font-bold text-foreground/60">No Active Offers</h3>
                              <p className="text-sm text-foreground/40 mt-1">Check back later for special deals!</p>
                           </div>
                        )}
                      </div>
                    ) : (
                      // Product Grid View
                      <div className="flex flex-col lg:flex-row gap-8">
                        <aside className="hidden lg:block w-64 shrink-0">
                            <div className="sticky top-0 space-y-6">
                                <SidebarFilters 
                                minPrice={minPrice} setMinPrice={setMinPrice}
                                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                                minRating={minRating} setMinRating={setMinRating}
                                selectedSize={selectedSize} setSelectedSize={setSelectedSize}
                                setPage={setPage}
                                onClearFilters={handleClearFilters}
                                category={category}
                                getSizeOptionsForCategory={getSizeOptionsForCategory}
                                allSizes={allSizes}
                                />
                            </div>
                        </aside>

                        <main className="flex-1">
                            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="lg:hidden flex items-center gap-2">
                                <button 
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-full font-medium text-sm hover:bg-foreground/10 transition-colors"
                                >
                                    <Filter className="w-4 h-4" /> Filters
                                </button>
                                <span className="text-xs text-foreground/50">{displayedProducts.length} Items</span>
                                </div>

                                <div className="hidden lg:block text-sm text-foreground/60 font-medium">
                                Showing {displayedProducts.length} Results
                                </div>

                                <div className="relative z-20 self-end sm:self-auto">
                                <button 
                                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-background border border-foreground/10 rounded-full text-sm font-medium hover:bg-foreground/5 transition-all"
                                >
                                    <span className="text-foreground/50">Sort by:</span>
                                    <span className="text-foreground">
                                    {sortBy === 'relevance' ? 'Relevance' : 
                                        sortBy === 'price-asc' ? 'Price: Low to High' : 
                                        sortBy === 'price-desc' ? 'Price: High to Low' : 'Rating'}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 text-foreground/40 transition-transform ${isSortDropdownOpen ? 'rotate-90' : ''}`} />
                                </button>
                                
                                {isSortDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-background border border-foreground/10 rounded-xl shadow-xl overflow-hidden py-1 z-30">
                                        {[
                                        { id: 'relevance', label: 'Relevance' },
                                        { id: 'price-asc', label: 'Price: Low to High' },
                                        { id: 'price-desc', label: 'Price: High to Low' },
                                        { id: 'rating', label: 'Top Rated' },
                                        ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => { setSortBy(opt.id); setIsSortDropdownOpen(false); setPage(1) }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-foreground/5 transition-colors ${sortBy === opt.id ? 'text-brand-purple font-semibold bg-brand-purple/5' : 'text-foreground/80'}`}
                                        >
                                            {opt.label}
                                        </button>
                                        ))}
                                    </div>
                                )}
                                </div>
                            </div>

                            {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {displayedProducts.map((product) => (
                                    <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="group bg-background rounded-2xl overflow-hidden border border-foreground/5 hover:border-brand-purple/20 hover:shadow-xl hover:shadow-brand-purple/5 transition-all duration-300"
                                    >
                                    <div 
                                        className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-900/50 cursor-pointer"
                                        onClick={() => handleProductClick(product)}
                                    >
                                        {product.image ? (
                                            <Image 
                                            src={product.image} 
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-foreground/20">
                                            <ShoppingBag className="w-8 h-8" />
                                            </div>
                                        )}
                                        
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {product.discount && product.discount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                                {product.discount}% OFF
                                            </span>
                                            )}
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                                            <button className="w-full py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg hover:bg-gray-100 transition-colors">
                                            Quick View
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 
                                            className="font-medium text-foreground/90 text-sm mb-1 truncate cursor-pointer hover:text-brand-purple transition-colors"
                                            onClick={() => handleProductClick(product)}
                                        >
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-lg">₹{new Intl.NumberFormat('en-IN').format(product.price)}</span>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="text-xs text-foreground/40 line-through">₹{new Intl.NumberFormat('en-IN').format(product.originalPrice)}</span>
                                            )}
                                        </div>
                                        {product.rating && (
                                            <div className="flex items-center gap-1 mb-3">
                                            <div className="flex text-yellow-400 text-xs">
                                                {"★".repeat(Math.round(product.rating))}
                                                <span className="text-gray-300">{"★".repeat(5 - Math.round(product.rating))}</span>
                                            </div>
                                            <span className="text-[10px] text-foreground/40">({product.reviews || 0})</span>
                                            </div>
                                        )}
                                    </div>
                                    </motion.div>
                                ))}
                            </div>
                            ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
                                <Filter className="w-8 h-8 text-foreground/20" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground/60">No products found</h3>
                                <p className="text-sm text-foreground/40 mt-1 max-w-xs mx-auto">Try adjusting your filters or selecting a different offer category.</p>
                                <button 
                                onClick={handleClearFilters}
                                className="mt-6 px-6 py-2 bg-brand-purple text-white rounded-full text-sm font-medium hover:bg-brand-purple/90 transition-colors"
                                >
                                Clear Filters
                                </button>
                            </div>
                            )}

                            <div ref={observerTarget} className="py-10 flex justify-center">
                                {loading && (
                                <div className="w-8 h-8 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
                                )}
                            </div>

                        </main>
                      </div>
                    )}
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isMobileFilterOpen && selectedOffer && (
                    <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[110]"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute bottom-0 left-0 right-0 h-[85vh] bg-background rounded-t-3xl shadow-2xl z-[120] flex flex-col border-t border-white/10"
                    >
                        <div className="p-4 border-b border-foreground/5 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Filters</h3>
                            <button 
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="p-2 hover:bg-foreground/5 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <SidebarFilters 
                                minPrice={minPrice} setMinPrice={setMinPrice}
                                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                                minRating={minRating} setMinRating={setMinRating}
                                selectedSize={selectedSize} setSelectedSize={setSelectedSize}
                                setPage={setPage}
                                onClearFilters={handleClearFilters}
                                category={category}
                                getSizeOptionsForCategory={getSizeOptionsForCategory}
                                allSizes={allSizes}
                            />
                        </div>
                        <div className="p-4 border-t border-foreground/5">
                            <button 
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full py-3 bg-brand-purple text-white font-bold rounded-xl shadow-lg shadow-brand-purple/20 active:scale-95 transition-all"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                    </>
                )}
            </AnimatePresence>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
