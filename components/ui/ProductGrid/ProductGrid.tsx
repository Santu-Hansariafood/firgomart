'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye } from 'lucide-react'
import FallbackImage from '@/components/common/Image/FallbackImage'
import { fadeInUp, staggerContainer } from '@/utils/animations/animations'
import locationData from '@/data/country.json'
// import { products } from '@/data/mockData'

// ✅ Type definitions
interface Product {
  id: string | number
  name: string
  image: string
  images?: string[]
  category: string
  price: number
  originalPrice?: number
  discount?: number
  rating?: number
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
  const isNextImageAllowed = (src: string) => {
    try {
      const u = new URL(src)
      return u.hostname === 'res.cloudinary.com' || u.hostname === 'images.pexels.com'
    } catch {
      return false
    }
  }
  const formatPrice = (v: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v)

  type ApiProduct = {
    _id?: string | number
    id?: string | number
    name: string
    image?: string
    images?: string[]
    category: string
    price: number
    originalPrice?: number
    discount?: number
    rating?: number
  }

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      const stateParam = deliverToState ? `&deliverToState=${encodeURIComponent(deliverToState)}` : ''
      const adminParam = !deliverToState ? `&adminOnly=true` : ''
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
      const res = await fetch(`/api/products?limit=${productsPerPage}&page=${pageNum}${stateParam}${adminParam}${searchParam}`)
      if (!res.ok) return []
      const data = await res.json()
      const list = Array.isArray(data.products) ? data.products : []
      // Map API product to grid product shape
      return list.map((p: ApiProduct) => ({
        id: p._id || p.id,
        name: p.name,
        image: sanitizeImageUrl(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image || ''),
        images: Array.isArray(p.images) ? p.images : undefined,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        rating: p.rating,
      })) as Product[]
    } catch {
      return []
    }
  }, [deliverToState, search])

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      const [first, second] = await Promise.all([fetchPage(1), fetchPage(2)])
      const initial = [...first, ...second]
      setDisplayedProducts(initial)
      setPage(2)
      setHasMore(second.length === productsPerPage)
      setLoading(false)
    }
    loadInitial()
  }, [fetchPage])

  // Initial deliverToState is loaded lazily from localStorage via useState initializer

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

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900">Featured Products</h2>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <label className="text-sm text-gray-600">Deliver to</label>
            <select
              value={deliverToState}
              onChange={(e) => {
                const val = e.target.value
                setDeliverToState(val)
                try { localStorage.setItem('deliverToState', val) } catch {}
                // Reset paging when state changes
                setPage(1)
              }}
              className="px-3 py-2 border rounded-lg bg-white text-sm w-40 sm:w-48"
            >
              <option value="">Select State</option>
              {locationData.countries.find(c => c.country === 'India')?.states.map(s => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>
            <p className="text-gray-600 hidden md:block whitespace-nowrap">
              {displayedProducts.length} products
            </p>
          </div>
        </div>

        {displayedProducts.length === 0 && loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-center text-gray-600">No products available</div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6"
          >
            {displayedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer group"
                  onClick={() => onProductClick(product)}
                >
                  <FallbackImage
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 20vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {product.discount && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">₹{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">₹{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onProductClick(product)}
                      className="flex-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddToCart(product)
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Infinite Scroll Loader */}
        {hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-8">
            {loading && (
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
