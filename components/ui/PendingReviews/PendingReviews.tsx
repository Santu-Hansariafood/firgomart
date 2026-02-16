'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types/product'
import ProductCard from '@/components/ui/ProductCard/ProductCard'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext/CartContext'
import { useSession } from 'next-auth/react'
import { getProductPath } from '@/utils/productUtils'

export default function PendingReviews() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { addToCart, setShowCart } = useCart()

  useEffect(() => {
    async function fetchPendingReviews() {
      if (!session?.user) {
        setLoading(false)
        return
      }
      
      try {
        const res = await fetch('/api/user/pending-reviews')
        const data = await res.json()
        const mappedProducts = (data.products || []).map((p: any) => ({
          ...p,
          id: p._id || p.id
        }))
        setProducts(mappedProducts)
      } catch (error) {
        console.error('Failed to fetch pending reviews', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPendingReviews()
  }, [session])

  const handleProductClick = (product: Product) => {
    router.push(getProductPath(product.name, product._id || product.id))
  }

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 })
    setShowCart(true)
  }

  if (!loading && products.length === 0) return null

  // If loading but we don't know if we have products yet, we might show skeleton or nothing.
  // Usually NewArrivals shows skeleton.
  // But if user is not logged in, we shouldn't show skeleton.
  if (!session?.user && !loading) return null

  if (loading) {
     // Optional: show skeleton if we expect it might be there. 
     // But since this is conditional, maybe better to show nothing until loaded?
     // NewArrivals shows skeleton because it's always there.
     // Let's show skeleton only if session exists.
     if (!session) return null
  }

  return (
    <section className="pt-0 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight">
          <span className="text-brand-purple">
            Pending
          </span>
          <span className="bg-clip-text text-red-500 ml-2">
            Reviews
          </span>
        </h2>
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
