'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Star, ChevronLeft, ChevronRight, User, ZoomIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import FallbackImage from '@/components/common/Image/FallbackImage'

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
  reviews?: number
  description?: string
  brand?: string
  colors?: string[]
  sizes?: string[]
  about?: string
  additionalInfo?: string
  stock?: number
}

interface Review {
  _id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

interface ProductModalProps {
  product: Product
  onClose: () => void
  onAddToCart: (product: Product & { quantity: number }) => void
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const { data: session } = useSession()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'info' | 'reviews'>('desc')
  
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [userRating, setUserRating] = useState(5)
  const [userComment, setUserComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const images: string[] = (product.images && product.images.length > 0)
    ? product.images
    : [product.image]

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, product.id])

  const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
      const res = await fetch(`/api/reviews?productId=${product.id}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch {}
    setLoadingReviews(false)
  }

  const handleSubmitReview = async () => {
    if (!session) return
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: userRating,
          comment: userComment
        })
      })
      if (res.ok) {
        setUserComment('')
        setReviewFormOpen(false)
        fetchReviews()
      }
    } catch {}
    setSubmittingReview(false)
  }

  const handleBuyNow = () => {
    onAddToCart({ ...product, quantity })
    onClose()
    router.push('/checkout')
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--background)] text-[var(--foreground)] rounded-xl sm:rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col border border-[var(--foreground)/20]"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[var(--background)] border-b border-[var(--foreground)/20] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-20">
            <h2 className="text-xl font-heading font-bold truncate pr-4">{product.name}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--foreground)/10] transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 sm:mb-8">
              {/* Image Section */}
              <div>
              <div
                className="relative aspect-square rounded-xl overflow-hidden bg-[var(--foreground)/10] mb-4 cursor-pointer"
                onClick={(e) => {
                  if (images.length > 1) {
                    e.stopPropagation()
                    nextImage()
                  } else {
                    setLightboxOpen(true)
                  }
                }}
              >
                <FallbackImage
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxOpen(true) }}
                  className="absolute top-2 right-2 w-8 h-8 bg-[var(--background)/80] rounded-full flex items-center justify-center shadow hover:bg-[var(--background)] transition-colors z-10"
                  aria-label="Open lightbox"
                >
                  <ZoomIn className="w-4 h-4 text-[var(--foreground)]" />
                </button>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage() }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--background)/90] rounded-full flex items-center justify-center shadow-lg hover:bg-[var(--background)] transition-colors z-10"
                      >
                        <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage() }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--background)/90] rounded-full flex items-center justify-center shadow-lg hover:bg-[var(--background)] transition-colors z-10"
                      >
                        <ChevronRight className="w-5 h-5 text-[var(--foreground)]" />
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === idx
                            ? 'border-brand-purple'
                            : 'border-[var(--foreground)/20] hover:border-brand-purple/50'
                        }`}
                      >
                        <FallbackImage
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-4">
                  {product.brand && (
                    <span className="text-sm font-medium text-brand-purple mb-1 block">{product.brand}</span>
                  )}
                  <h1 className="text-xl sm:text-2xl font-heading font-bold mb-2">
                    {product.name}
                  </h1>
                  <p className="text-sm text-[var(--foreground)/60]">{product.category}</p>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded">
                    <span className="text-sm font-medium">{product.rating || 0}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-sm text-[var(--foreground)/60] hover:text-brand-purple cursor-pointer" onClick={() => setActiveTab('reviews')}>
                    ({product.reviews ?? 0} reviews)
                  </span>
                </div>

                <div className="flex items-baseline space-x-3 mb-6">
                  <span className="text-2xl sm:text-3xl font-bold">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-[var(--foreground)/50] line-through">
                        ₹{product.originalPrice}
                      </span>
                      {product.discount && (
                        <span className="text-green-600 font-medium">
                          {product.discount}% off
                        </span>
                      )}
                    </>
                  )}
                </div>

                {(product.colors && product.colors.length > 0) && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Color:</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.colors.map((c, i) => (
                                <span key={i} className="px-3 py-1 border border-[var(--foreground)/20] rounded-full text-sm hover:border-brand-purple cursor-pointer">{c}</span>
                            ))}
                        </div>
                    </div>
                )}
                {(product.sizes && product.sizes.length > 0) && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Size:</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((s, i) => (
                                <span key={i} className="px-3 py-1 border border-[var(--foreground)/20] rounded-full text-sm hover:border-brand-purple cursor-pointer">{s}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* About Product */}
                {product.about && (
                    <div className="mb-6 p-4 bg-[var(--foreground)/10] rounded-lg">
                        <h3 className="font-medium mb-2">About this item</h3>
                        <ul className="space-y-1 text-sm text-[var(--foreground)/70] list-disc list-inside">
                            {product.about.split('\n').map((line, i) => (
                                <li key={i}>{line.replace(/^•\s*/, '')}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-6">
                  <h3 className="font-medium mb-3">Quantity</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-[var(--foreground)/20] rounded-lg flex items-center justify-center hover:bg-[var(--foreground)/10] transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(3, quantity + 1))}
                      className="w-10 h-10 border border-[var(--foreground)/20] rounded-lg flex items-center justify-center hover:bg-[var(--foreground)/10] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if ((product.stock ?? 0) > 0) {
                        onAddToCart({ ...product, quantity })
                        onClose()
                      }
                    }}
                    disabled={(product.stock ?? 0) <= 0}
                    className={`flex-1 px-3 py-2 border rounded-md transition-colors font-medium text-sm flex items-center justify-center space-x-1 ${
                      (product.stock ?? 0) > 0
                        ? 'border-brand-purple text-brand-purple hover:bg-brand-purple/10'
                        : 'border-[var(--foreground)/20] text-[var(--foreground)/40] cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={(product.stock ?? 0) <= 0}
                    className={`flex-1 px-3 py-2 rounded-md transition-colors font-medium text-sm ${
                      (product.stock ?? 0) > 0
                        ? 'bg-linear-to-r from-brand-purple to-brand-red text-white hover:from-brand-purple/90 hover:to-brand-red/90'
                        : 'bg-[var(--foreground)/10] text-[var(--foreground)/40] cursor-not-allowed'
                    }`}
                  >
                    {(product.stock ?? 0) > 0 ? 'Buy Now' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--foreground)/20] pt-6">
                <div className="flex gap-6 border-b border-[var(--foreground)/20] mb-6">
                    <button onClick={() => setActiveTab('desc')} className={`pb-2 font-medium transition-colors ${activeTab === 'desc' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-[var(--foreground)/60]'}`}>Description</button>
                    <button onClick={() => setActiveTab('info')} className={`pb-2 font-medium transition-colors ${activeTab === 'info' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-[var(--foreground)/60]'}`}>Additional Info</button>
                    <button onClick={() => setActiveTab('reviews')} className={`pb-2 font-medium transition-colors ${activeTab === 'reviews' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-[var(--foreground)/60]'}`}>Reviews ({product.reviews ?? 0})</button>
                  </div>

                <div className="min-h-[200px]">
                    {activeTab === 'desc' && (
                        <div className="text-[var(--foreground)/70] leading-relaxed whitespace-pre-wrap">
                            {product.description || 'No description available.'}
                        </div>
                    )}
                    {activeTab === 'info' && (
                        <div className="text-[var(--foreground)/70] leading-relaxed whitespace-pre-wrap">
                             {product.additionalInfo || 'No additional information available.'}
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div>
                             <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Customer Reviews</h3>
                                {session ? (
                                    <button onClick={() => setReviewFormOpen(!reviewFormOpen)} className="text-brand-purple font-medium hover:underline">
                                        {reviewFormOpen ? 'Cancel Review' : 'Write a Review'}
                                    </button>
                                ) : (
                                    <p className="text-sm text-[var(--foreground)/60]">Log in to write a review</p>
                                )}
                             </div>

                             {reviewFormOpen && session && (
                                 <div className="bg-[var(--foreground)/10] p-4 rounded-lg mb-6">
                                     <div className="mb-4">
                                         <label className="block text-sm font-medium mb-1">Rating</label>
                                         <div className="flex gap-1">
                                             {[1, 2, 3, 4, 5].map(star => (
                                                 <button key={star} onClick={() => setUserRating(star)}>
                                                     <Star className={`w-6 h-6 ${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--foreground)/30]'}`} />
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                     <div className="mb-4">
                                         <label className="block text-sm font-medium mb-1">Review</label>
                                         <textarea
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                            className="w-full border border-[var(--foreground)/20] bg-[var(--background)] text-[var(--foreground)] rounded-lg p-2"
                                            rows={3}
                                            placeholder="Share your thoughts..."
                                         />
                                     </div>
                                     <button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview || !userComment.trim()}
                                        className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-purple/90 disabled:opacity-50"
                                     >
                                         {submittingReview ? 'Submitting...' : 'Submit Review'}
                                     </button>
                                 </div>
                             )}

                             {loadingReviews ? (
                                 <div className="text-center py-8">Loading reviews...</div>
                             ) : reviews.length === 0 ? (
                                 <div className="text-center py-8 text-[var(--foreground)/60]">No reviews yet. Be the first to review!</div>
                             ) : (
                                 <div className="space-y-4">
                                     {reviews.map((review) => (
                                         <div key={review._id} className="border-b border-[var(--foreground)/20] pb-4 last:border-0">
                                             <div className="flex items-center justify-between mb-2">
                                                 <div className="flex items-center gap-2">
                                                     <div className="w-8 h-8 bg-[var(--foreground)/10] rounded-full flex items-center justify-center">
                                                         <User className="w-4 h-4 text-[var(--foreground)/60]" />
                                                     </div>
                                                     <span className="font-medium">{review.userName}</span>
                                                 </div>
                                                 <span className="text-xs text-[var(--foreground)/60]">{new Date(review.createdAt).toLocaleDateString()}</span>
                                             </div>
                                             <div className="flex gap-1 mb-2">
                                                 {[...Array(5)].map((_, i) => (
                                                     <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--foreground)/30]'}`} />
                                                 ))}
                                             </div>
                                             <p className="text-[var(--foreground)/70] text-sm">{review.comment}</p>
                                             </div>
                                         ))}
                                  </div>
                             )}
                        </div>
                    )}
                </div>
            </div>

          </div>

          {lightboxOpen && (
            <div
              className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
              onClick={() => setLightboxOpen(false)}
              role="dialog"
              aria-modal="true"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') nextImage()
                else if (e.key === 'ArrowLeft') prevImage()
                else if (e.key === 'Escape') setLightboxOpen(false)
              }}
            >
              <div
                className="relative w-full h-full md:w-[90vw] md:h-[90vh]"
                onClick={(e) => {
                  e.stopPropagation()
                  if (images.length > 1) nextImage()
                }}
              >
                <FallbackImage
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxOpen(false) }}
                  className="absolute top-4 right-4 w-10 h-10 bg-[var(--background)/80] rounded-full flex items-center justify-center z-10"
                >
                  <X className="w-5 h-5 text-[var(--foreground)]" />
                </button>
                {images.length > 1 && (
                    <>
                        <button
                        onClick={(e) => { e.stopPropagation(); prevImage() }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--background)/80] rounded-full flex items-center justify-center z-10"
                        >
                        <ChevronLeft className="w-6 h-6 text-[var(--foreground)]" />
                        </button>
                        <button
                        onClick={(e) => { e.stopPropagation(); nextImage() }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--background)/80] rounded-full flex items-center justify-center z-10"
                        >
                        <ChevronRight className="w-6 h-6 text-[var(--foreground)]" />
                        </button>
                    </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ProductModal
