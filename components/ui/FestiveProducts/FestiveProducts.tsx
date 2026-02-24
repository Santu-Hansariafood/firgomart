'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Product } from '@/types/product'
import ProductCard from '@/components/ui/ProductCard/ProductCard'
import { useCart } from '@/context/CartContext/CartContext'
import { getProductPath } from '@/utils/productUtils'
import { useGeolocation } from '@/hooks/product-grid/useGeolocation'
import SectionHeader from '@/components/common/SectionHeader/SectionHeader'

type Offer = {
  id: string
  key: string
  name: string
  type: string
  value?: number | string
  backgroundClassName?: string
  isFestive?: boolean
}

interface FestiveProductsProps {
  onProductClick?: (product: Product) => void
  backgroundClassName?: string
}

export default function FestiveProducts({ onProductClick, backgroundClassName }: FestiveProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [festiveOffer, setFestiveOffer] = useState<Offer | null>(null)
  const router = useRouter()
  const { addToCart, setShowCart } = useCart()
  const { countryCode } = useGeolocation()

  useEffect(() => {
    let cancelled = false

    async function loadFestiveProducts() {
      setLoading(true)
      try {
        const offerParams = new URLSearchParams()
        if (countryCode) offerParams.set('country', countryCode)

        const offersRes = await fetch(`/api/offers?${offerParams.toString()}`)
        const offersData = await offersRes.json()
        const offersList: Offer[] = Array.isArray(offersData.offers) ? offersData.offers : []

        const festive = offersList.find(o => o.key.toLowerCase() === 'festive')
        if (!festive) {
          if (!cancelled) {
            setFestiveOffer(null)
            setProducts([])
          }
          return
        }

        if (cancelled) return

        setFestiveOffer(festive)

        const productParams = new URLSearchParams()
        productParams.set('limit', '10')
        productParams.set('offer', festive.key)
        if (countryCode) productParams.set('country', countryCode)

        const res = await fetch(`/api/products?${productParams.toString()}`)
        if (!res.ok) {
          if (!cancelled) {
            setProducts([])
          }
          return
        }
        const data = await res.json()
        const list = Array.isArray(data.products) ? data.products : []
        const mapped = list.map((p: any) => ({
          ...p,
          id: p._id || p.id
        }))

        if (!cancelled) {
          setProducts(mapped)
        }
      } catch {
        if (!cancelled) {
          setFestiveOffer(null)
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFestiveProducts()

    return () => {
      cancelled = true
    }
  }, [countryCode])

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product)
      return
    }
    router.push(getProductPath(product.name, product._id || product.id))
  }

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 })
    setShowCart(true)
  }

  if (!loading && (!festiveOffer || products.length === 0)) return null

  const containerBg =
    backgroundClassName ||
    festiveOffer?.backgroundClassName ||
    'bg-gradient-to-r from-amber-100 via-red-100 to-pink-100 dark:from-[#2b1a1a] dark:via-[#311a2c] dark:to-[#261a33]'

  return (
    <section className="pt-4 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
      <div className={`${containerBg} rounded-3xl p-5 md:p-7 shadow-sm border border-white/40 dark:border-white/5`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <SectionHeader
              titlePrimary="Festive"
              titleSecondary="Offers"
              primaryClassName="text-amber-700 dark:text-amber-300"
              secondaryClassName="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-pink-500 to-orange-500"
              showAction
              actionLabel="View All Festive Deals"
              actionHref="/festive-products"
              actionIcon={<ArrowRight className="w-4 h-4" />}
              hideActionOnMobile
              containerClassName="mb-0"
            />
            {festiveOffer && (
              <p className="mt-2 text-sm sm:text-base text-amber-900/80 dark:text-amber-100/80">
                {festiveOffer.name}
                {festiveOffer.value ? ' • ' : ''}
                {festiveOffer.value && typeof festiveOffer.value === 'number' && festiveOffer.type.includes('discount')
                  ? `Extra ${festiveOffer.value}% savings on selected items`
                  : festiveOffer.value && typeof festiveOffer.value === 'string'
                  ? festiveOffer.value
                  : ''}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] aspect-[4/5] bg-white/60 dark:bg-gray-800/60 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {products.map(product => (
              <div key={product._id || product.id} className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px]">
                <ProductCard
                  product={product}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 sm:hidden flex justify-end">
          <button
            onClick={() => router.push('/festive-products')}
            className="inline-flex items-center gap-2 text-amber-800 dark:text-amber-200 hover:underline font-medium text-sm"
          >
            View All Festive Deals <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
