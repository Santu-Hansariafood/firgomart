'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext/CartContext'
import ProductGrid from '@/components/ui/ProductGrid/ProductGrid'
import { getProductPath } from '@/utils/productUtils'

interface CategoryClientProps {
  categoryName: string
}

export default function CategoryClient({ categoryName }: CategoryClientProps) {
  const router = useRouter()
  const { addToCart, setShowCart } = useCart()

  const handleProductClick = (product: any) => {
    router.push(getProductPath(product.name, product.id || product._id))
  }

  const handleAddToCart = (product: any) => {
    addToCart({ ...product, quantity: 1 })
    setShowCart(true)
  }

  return (
    <div className="min-h-screen bg-background pt-4 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <ProductGrid 
          initialCategory={categoryName}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  )
}
