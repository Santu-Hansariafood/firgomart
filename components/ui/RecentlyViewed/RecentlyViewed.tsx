'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ProductCard from '@/components/ui/ProductCard/ProductCard'
import type { Product } from '@/types/product'

interface RecentlyViewedProps {
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product) => void
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onProductClick, onAddToCart }) => {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const sanitizeImageUrl = (src: string) => (src || '').trim().replace(/[)]+$/g, '')

  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/user/history')
        const data = await res.json()
        if (cancelled) return
        if (Array.isArray(data.history)) {
          const mapped = (data.history as (Product & { _id?: string | number })[]).map((p) => ({
            ...p,
            id: p._id || p.id,
            image: sanitizeImageUrl(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image || ''),
            images: Array.isArray(p.images) ? p.images : p.images,
          }))
          setProducts(mapped.slice(0, 15))
        }
      } catch {
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [session])

  if (loading || products.length === 0) return null

  return (
    <section className="pt-0 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight">
          <span className="text-brand-purple">
            FirgoMart
          </span>
          <span className="bg-clip-text text-red-500 ml-2">
            Products (Recently Viewed)
          </span>
        </h2>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {products.map((product) => (
          <div key={product._id || product.id} className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px]">
            <ProductCard
              product={product}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default RecentlyViewed
