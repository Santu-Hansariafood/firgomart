'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types/product'
import ProductCard from '@/components/ui/ProductCard/ProductCard'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext/CartContext'
import { ArrowRight } from 'lucide-react'

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { addToCart, setShowCart } = useCart()

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const res = await fetch('/api/products?sortBy=-createdAt&limit=10&newArrivals=true')
        const data = await res.json()
        const mappedProducts = (data.products || []).map((p: any) => ({
          ...p,
          id: p._id || p.id
        }))
        setProducts(mappedProducts)
      } catch (error) {
        console.error('Failed to fetch new arrivals', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNewArrivals()
  }, [])

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product._id || product.id}`)
  }

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 })
    setShowCart(true)
  }

  if (!loading && products.length === 0) return null

  return (
    <section className="pt-0 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight">
          <span className="text-brand-purple">
            New
          </span>
          <span className="bg-clip-text text-red-500 ml-2">
            Arrivals
          </span>
        </h2>
        <button 
          onClick={() => router.push('/new-arrivals')}
          className="flex items-center gap-2 text-brand-purple hover:underline font-medium"
        >
          See All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {products.map((product) => (
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
    </section>
  )
}
