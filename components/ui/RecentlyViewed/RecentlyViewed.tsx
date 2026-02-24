'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ProductCard from '@/components/ui/ProductCard/ProductCard'
import type { Product } from '@/types/product'
import { useGeolocation } from '@/hooks/product-grid/useGeolocation'
import SectionHeader from '@/components/common/SectionHeader/SectionHeader'

interface RecentlyViewedProps {
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product) => void
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onProductClick, onAddToCart }) => {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const { countryCode } = useGeolocation()

  const sanitizeImageUrl = (src: string) => (src || '').trim().replace(/[)]+$/g, '')

  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const params = new URLSearchParams()
        if (countryCode) params.set('country', countryCode)
        const res = await fetch(`/api/user/history?${params.toString()}`)
        const data = await res.json()
        if (cancelled) return
        if (Array.isArray(data.history)) {
          const mapped = (data.history as (Product & { _id?: string | number })[]).map((p) => ({
            ...p,
            id: p._id || p.id,
            image: sanitizeImageUrl(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image || ''),
            images: Array.isArray(p.images) ? p.images : p.images,
          }))
          setProducts(mapped)
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
  }, [session, countryCode])

  if (loading || products.length === 0) return null

  const visibleProducts = showAll ? products : products.slice(0, 15)

  return (
    <section className="pt-0 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      <SectionHeader
        titlePrimary="Recently"
        titleSecondary="Viewed"
        showAction={products.length > 15 && !showAll}
        actionLabel="See all"
        onActionClick={() => setShowAll(true)}
        actionClassName="text-sm font-medium text-brand-purple hover:text-brand-red transition-colors"
      />

      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {visibleProducts.map((product) => (
          <div key={product._id || product.id} className="min-w-[50px] w-[50px] md:min-w-[60px] md:w-[60px]">
            <ProductCard
              product={product}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
              compact
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default RecentlyViewed
