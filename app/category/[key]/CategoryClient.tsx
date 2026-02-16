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
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-8 text-foreground/90">
          {categoryName}
        </h1>
        <ProductGrid 
          initialCategory={categoryName}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  )
}
