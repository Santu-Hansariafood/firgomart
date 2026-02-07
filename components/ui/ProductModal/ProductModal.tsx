'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Share2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Script from 'next/script'
import { Product } from '@/types/product'
import { useProductModalState } from '@/hooks/product-modal/useProductModalState'
import { useProductReviews } from '@/hooks/product-modal/useProductReviews'
import { useProductWishlist } from '@/hooks/product-modal/useProductWishlist'
import { useProductMetadata } from '@/hooks/product-modal/useProductMetadata'
import { useProductActions } from '@/hooks/product-modal/useProductActions'
import ProductImageGallery from './ProductImageGallery'
import ProductInfo from './ProductInfo'
import ProductTabs from './ProductTabs'

interface ProductModalProps {
  product: Product
  onClose: () => void
  onAddToCart: (product: Product & { quantity: number; selectedSize?: string; selectedColor?: string }) => void
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const { data: session } = useSession()

  const {
    selectedImage,
    setSelectedImage,
    quantity,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    lightboxOpen,
    setLightboxOpen,
    activeTab,
    setActiveTab,
    images,
    nextImage,
    prevImage,
    handleQuantityChange,
    maxQty
  } = useProductModalState({ product })

  const {
    reviews,
    loadingReviews,
    reviewFormOpen,
    setReviewFormOpen,
    userRating,
    setUserRating,
    userComment,
    setUserComment,
    submittingReview,
    fetchReviews,
    handleSubmitReview
  } = useProductReviews({ productId: product.id })

  const { isSaved, saving, toggleSave } = useProductWishlist({ productId: product.id })
  
  const { productSchema } = useProductMetadata({ product })

  const { handleShare, handleBuyNow } = useProductActions({
    product,
    quantity,
    selectedSize,
    selectedColor,
    onAddToCart,
    onClose
  })

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews()
    }
  }, [activeTab, fetchReviews])

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background/95 backdrop-blur-2xl text-foreground rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col border border-foreground/10 shadow-2xl relative"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/10 dark:bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-foreground/5 px-6 py-4 flex items-center justify-between z-30">
            <h2 className="text-lg font-semibold truncate pr-4 text-gray-900 dark:text-gray-50">{product.name}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground/5 dark:bg-white/10 hover:bg-foreground/10 dark:hover:bg-white/20 transition-all hover:scale-105"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-foreground/70 dark:text-white/70" />
              </button>
              <button
                onClick={toggleSave}
                disabled={saving}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground/5 dark:bg-white/10 hover:bg-foreground/10 dark:hover:bg-white/20 transition-all hover:scale-105"
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-foreground/70 dark:text-white/70'}`} />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground/5 dark:bg-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all hover:scale-105 hover:rotate-90"
                title="Close"
              >
                <X className="w-5 h-5 text-foreground dark:text-white" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-20 left-10 w-[300px] h-[300px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-40 right-10 w-[250px] h-[250px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] -z-10" />

            <Script
              id={`schema-product-${String(product.id)}`}
              type="application/ld+json"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
              <ProductImageGallery
                images={images}
                product={product}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                nextImage={nextImage}
                prevImage={prevImage}
                lightboxOpen={lightboxOpen}
                setLightboxOpen={setLightboxOpen}
              />

              <ProductInfo
                product={product}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                quantity={quantity}
                handleQuantityChange={handleQuantityChange}
                handleBuyNow={handleBuyNow}
                maxQty={maxQty}
              />
            </div>

            <ProductTabs
              product={product}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              reviews={reviews}
              loadingReviews={loadingReviews}
              reviewFormOpen={reviewFormOpen}
              setReviewFormOpen={setReviewFormOpen}
              userRating={userRating}
              setUserRating={setUserRating}
              userComment={userComment}
              setUserComment={setUserComment}
              submittingReview={submittingReview}
              handleSubmitReview={handleSubmitReview}
              session={session}
            />

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ProductModal
