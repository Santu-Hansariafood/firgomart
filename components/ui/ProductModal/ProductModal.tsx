'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Star, ChevronLeft, ChevronRight, User } from 'lucide-react'
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
          className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-20">
            <h2 className="text-xl font-heading font-bold text-gray-900 truncate pr-4">{product.name}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Image Section */}
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4 cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                  <FallbackImage
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage() }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage() }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
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
                        className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === idx
                            ? 'border-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
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

              {/* Product Info Section */}
              <div>
                <div className="mb-4">
                  {product.brand && (
                    <span className="text-sm font-medium text-blue-600 mb-1 block">{product.brand}</span>
                  )}
                  <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded">
                    <span className="text-sm font-medium">{product.rating || 0}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer" onClick={() => setActiveTab('reviews')}>
                    ({product.reviews ?? 0} reviews)
                  </span>
                </div>

                <div className="flex items-baseline space-x-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
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

                {/* Colors & Sizes */}
                {(product.colors && product.colors.length > 0) && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Color:</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.colors.map((c, i) => (
                                <span key={i} className="px-3 py-1 border rounded-full text-sm hover:border-black cursor-pointer">{c}</span>
                            ))}
                        </div>
                    </div>
                )}
                {(product.sizes && product.sizes.length > 0) && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Size:</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((s, i) => (
                                <span key={i} className="px-3 py-1 border rounded-full text-sm hover:border-black cursor-pointer">{s}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* About Product */}
                {product.about && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">About this item</h3>
                        <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                            {product.about.split('\n').map((line, i) => (
                                <li key={i}>{line.replace(/^•\s*/, '')}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Quantity</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(3, quantity + 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      if ((product.stock ?? 0) > 0) {
                        onAddToCart({ ...product, quantity })
                        onClose()
                      }
                    }}
                    disabled={(product.stock ?? 0) <= 0}
                    className={`flex-1 px-6 py-3 border-2 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                      (product.stock ?? 0) > 0
                        ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={(product.stock ?? 0) <= 0}
                    className={`flex-1 px-6 py-3 rounded-lg transition-colors font-medium ${
                      (product.stock ?? 0) > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {(product.stock ?? 0) > 0 ? 'Buy Now' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="border-t pt-6">
                <div className="flex gap-6 border-b mb-6">
                    <button onClick={() => setActiveTab('desc')} className={`pb-2 font-medium transition-colors ${activeTab === 'desc' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Description</button>
                    <button onClick={() => setActiveTab('info')} className={`pb-2 font-medium transition-colors ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Additional Info</button>
                    <button onClick={() => setActiveTab('reviews')} className={`pb-2 font-medium transition-colors ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Reviews ({product.reviews ?? 0})</button>
                </div>

                <div className="min-h-[200px]">
                    {activeTab === 'desc' && (
                        <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {product.description || 'No description available.'}
                        </div>
                    )}
                    {activeTab === 'info' && (
                        <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                             {product.additionalInfo || 'No additional information available.'}
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div>
                             <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Customer Reviews</h3>
                                {session ? (
                                    <button onClick={() => setReviewFormOpen(!reviewFormOpen)} className="text-blue-600 font-medium hover:underline">
                                        {reviewFormOpen ? 'Cancel Review' : 'Write a Review'}
                                    </button>
                                ) : (
                                    <p className="text-sm text-gray-500">Log in to write a review</p>
                                )}
                             </div>

                             {reviewFormOpen && session && (
                                 <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                     <div className="mb-4">
                                         <label className="block text-sm font-medium mb-1">Rating</label>
                                         <div className="flex gap-1">
                                             {[1, 2, 3, 4, 5].map(star => (
                                                 <button key={star} onClick={() => setUserRating(star)}>
                                                     <Star className={`w-6 h-6 ${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                     <div className="mb-4">
                                         <label className="block text-sm font-medium mb-1">Review</label>
                                         <textarea
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                            className="w-full border rounded-lg p-2"
                                            rows={3}
                                            placeholder="Share your thoughts..."
                                         />
                                     </div>
                                     <button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview || !userComment.trim()}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                     >
                                         {submittingReview ? 'Submitting...' : 'Submit Review'}
                                     </button>
                                 </div>
                             )}

                             {loadingReviews ? (
                                 <div className="text-center py-8">Loading reviews...</div>
                             ) : reviews.length === 0 ? (
                                 <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</div>
                             ) : (
                                 <div className="space-y-4">
                                     {reviews.map((review) => (
                                         <div key={review._id} className="border-b pb-4 last:border-0">
                                             <div className="flex items-center justify-between mb-2">
                                                 <div className="flex items-center gap-2">
                                                     <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                         <User className="w-4 h-4 text-gray-500" />
                                                     </div>
                                                     <span className="font-medium">{review.userName}</span>
                                                 </div>
                                                 <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                             </div>
                                             <div className="flex gap-1 mb-2">
                                                 {[...Array(5)].map((_, i) => (
                                                     <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                 ))}
                                             </div>
                                             <p className="text-gray-600 text-sm">{review.comment}</p>
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
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
              <div className="relative w-full h-full md:w-[90vw] md:h-[90vh]">
                <FallbackImage
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
                {images.length > 1 && (
                    <>
                        <button
                        onClick={(e) => { e.stopPropagation(); prevImage() }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center"
                        >
                        <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                        onClick={(e) => { e.stopPropagation(); nextImage() }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center"
                        >
                        <ChevronRight className="w-6 h-6" />
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
