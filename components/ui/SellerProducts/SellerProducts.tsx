'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types/product'
import ProductCard from '@/components/ui/ProductCard/ProductCard'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext/CartContext'
import { ArrowRight } from 'lucide-react'
import { getProductPath } from '@/utils/productUtils'
import { useGeolocation } from '@/hooks/product-grid/useGeolocation'
import SectionHeader from '@/components/common/SectionHeader/SectionHeader'

interface SellerProductsProps {
  onProductClick?: (product: Product) => void
}

export default function SellerProducts({ onProductClick }: SellerProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [comboProducts, setComboProducts] = useState<Product[]>([])
  const [comboLoading, setComboLoading] = useState(true)
  const router = useRouter()
  const { addToCart, setShowCart } = useCart()
  const { countryCode } = useGeolocation()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setComboLoading(true)

      try {
        const countryParam = countryCode ? `&country=${encodeURIComponent(countryCode)}` : ''
        const res = await fetch(`/api/products?sortBy=-createdAt&limit=10&sellerOnly=true${countryParam}`)
        const data = await res.json()
        const mappedProducts = (data.products || []).map((p: any) => ({
          ...p,
          id: p._id || p.id
        }))
        setProducts(mappedProducts)
      } catch (error) {
        console.error('Failed to fetch seller products', error)
        setProducts([])
      } finally {
        setLoading(false)
      }

      try {
        const countryParam = countryCode ? `&country=${encodeURIComponent(countryCode)}` : ''
        const res = await fetch(`/api/products?sortBy=-createdAt&limit=10&comboOnly=true&adminOnly=true${countryParam}`)
        const data = await res.json()
        const mappedComboProducts = (data.products || []).map((p: any) => ({
          ...p,
          id: p._id || p.id
        }))
        setComboProducts(mappedComboProducts)
      } catch (error) {
        console.error('Failed to fetch combo products', error)
        setComboProducts([])
      } finally {
        setComboLoading(false)
      }
    }

    fetchData()
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

  if (!loading && products.length === 0 && !comboLoading && comboProducts.length === 0) return null

  return (
    <section className="pt-0 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
      <SectionHeader
        titlePrimary="Seller"
        titleSecondary="Products"
      />
      
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[50px] w-[50px] md:min-w-[240px] md:w-[240px] aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {products.map((product) => (
            <div key={product._id || product.id} className="min-w-[50px] w-[50px] md:min-w-[240px] md:w-[240px]">
              <ProductCard 
                product={product}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
                compact
              />
            </div>
          ))}
        </div>
      )}

      {comboLoading ? null : comboProducts.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-heading font-bold tracking-tight">
              <span className="text-brand-purple">
                Combo
              </span>
              <span className="bg-clip-text text-red-500 ml-2">
                Products
              </span>
            </h3>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {comboProducts.map((product) => (
              <div key={product._id || product.id} className="min-w-[50px] w-[50px] md:min-w-[240px] md:w-[240px]">
                <ProductCard 
                  product={product}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
