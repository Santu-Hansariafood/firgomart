'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import { fadeInUp, staggerContainer } from '@/utils/animations/animations'
// Fetched from backend

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
  const [total, setTotal] = useState<number>(0)
  const observerTarget = useRef<HTMLDivElement | null>(null)
  const productsPerPage = 12

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?limit=${productsPerPage}&page=1`)
        const data = await res.json()
        if (res.ok) {
          const mapped: Product[] = (data.products || []).map((p: any) => ({
            id: p._id || p.id,
            name: p.name,
            image: p.image,
            images: p.images,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice,
            discount: p.discount,
            rating: p.rating,
          }))
          setDisplayedProducts(mapped)
          setTotal(data.total || mapped.length)
          setPage(1)
        }
      } catch {}
      setLoading(false)
    }
    fetchInitial()
  }, [])

  const loadMore = useCallback(async () => {
    if (loading || displayedProducts.length >= total) return
    setLoading(true)
    const nextPage = page + 1
    try {
      const res = await fetch(`/api/products?limit=${productsPerPage}&page=${nextPage}`)
      const data = await res.json()
      if (res.ok) {
        const mapped: Product[] = (data.products || []).map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          image: p.image,
          images: p.images,
          category: p.category,
          price: p.price,
          originalPrice: p.originalPrice,
          discount: p.discount,
          rating: p.rating,
        }))
        setDisplayedProducts(prev => [...prev, ...mapped])
        setTotal(data.total ?? total)
        setPage(nextPage)
      }
    } catch {}
    setLoading(false)
  }, [page, loading, displayedProducts.length, total])

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-gray-900">Featured Products</h2>
          <p className="text-gray-600">
            {displayedProducts.length} of {total} products
          </p>
        </div>

        {/* Product Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {displayedProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={fadeInUp}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div
                className="relative aspect-square overflow-hidden cursor-pointer group"
                onClick={() => onProductClick(product)}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
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

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{product.category}</p>

                {/* Price & Rating */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through ml-2">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>

                {/* Action Buttons */}
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

        {/* Infinite Scroll Loader */}
        {displayedProducts.length < total && (
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
