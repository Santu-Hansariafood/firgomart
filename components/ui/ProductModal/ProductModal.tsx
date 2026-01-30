'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Star, ChevronLeft, ChevronRight, User, ZoomIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import FallbackImage from '@/components/common/Image/FallbackImage'
import Script from 'next/script'

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
  unitsPerPack?: number
  height?: number
  width?: number
  weight?: number
  dimensionUnit?: string
  weightUnit?: string
  hsnCode?: string
  selectedSize?: string
  selectedColor?: string
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
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '')
  const router = useRouter()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'info' | 'reviews'>('desc')
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [userRating, setUserRating] = useState(5)
  const [userComment, setUserComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const validateSelection = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size')
      return false
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color')
      return false
    }
    return true
  }

  const images: string[] = (product.images && product.images.length > 0)
    ? product.images
    : [product.image]

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)


  useEffect(() => {
    const prevTitle = document.title
    const descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const keysTag = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null
    const prevDesc = descTag?.content || ''
    const prevKeys = keysTag?.content || ''
    const words = String(product.name || '').split(/\s+/).filter(Boolean)
    const colorKeys = (product.colors || []).map(String)
    const sizeKeys = (product.sizes || []).map(String)
    const cat = String(product.category || '')
    const brand = String(product.brand || '')
    const ratingWord = (product.rating && product.rating >= 4.5) ? 'top rated' : ''
    const discountWord = (product.discount && product.discount >= 25) ? 'best deal' : ''
    const trendWord = 'trending'
    const keywords = [
      ...words,
      brand,
      cat,
      ...colorKeys,
      ...sizeKeys,
      ratingWord,
      discountWord,
      trendWord,
    ].filter(Boolean).join(', ')
    const shortDesc = String(product.description || `${brand ? brand + ' ' : ''}${product.name}` || '').slice(0, 240)
    document.title = `${product.name} | FirgoMart`
    if (descTag) descTag.content = shortDesc
    if (keysTag) keysTag.content = keywords
    return () => {
      document.title = prevTitle
      if (descTag) descTag.content = prevDesc
      if (keysTag) keysTag.content = prevKeys
    }
  }, [product])

  const productSchema = (() => {
    const imageUrls = images.map((src) => String(src))
    const offers = {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: Number(product.price || 0),
      availability: (product.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: typeof window !== 'undefined' ? window.location.href : 'https://firgomart.com',
    }
    const aggregateRating = (typeof product.rating === 'number' && product.rating > 0)
      ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: Number(product.reviews || 0) }
      : undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: imageUrls,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      category: product.category,
      color: (product.colors || []).join(', '),
      size: (product.sizes || []).join(', '),
      description: product.description || undefined,
      offers,
      aggregateRating,
    }
  })()

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true)
    try {
      const res = await fetch(`/api/reviews?productId=${product.id}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch {}
    setLoadingReviews(false)
  }, [product.id])

  const handleSubmitReview = useCallback(async () => {
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
  }, [session, product.id, userRating, userComment, fetchReviews])


  const handleBuyNow = () => {
    if ((product.stock ?? 0) > 0) {
      if (!validateSelection()) return
      onAddToCart({ 
        ...product, 
        quantity,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined
      })
      onClose()
      router.push('/checkout')
    }
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
          className="bg-background text-foreground rounded-xl sm:rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col border border-foreground/20"
        >
          <div className="sticky top-0 bg-background border-b border-foreground/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-20">
            <h2 className="text-xl font-heading font-bold truncate pr-4">{product.name}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto">
            <Script
              id={`schema-product-${String(product.id)}`}
              type="application/ld+json"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 sm:mb-8">
              <div>
                <div
                className="relative aspect-square rounded-xl overflow-hidden bg-foreground/10 mb-4 cursor-pointer"
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
                {product.discount && (
                  <div className="absolute top-2 left-2 bg-linear-to-br from-brand-red/70 to-transparent backdrop-blur-sm text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-lg shadow-lg">
                    {product.discount}% OFF
                  </div>
                )}
                {product.rating && (
                  <div className="absolute bottom-2 left-2 bg-linear-to-br from-yellow-500/70 to-transparent backdrop-blur-sm text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-lg shadow-lg flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current" /> {product.rating} ({product.reviews ?? 0} reviews)
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxOpen(true) }}
                  className="absolute top-2 right-2 w-8 h-8 bg-background/80 rounded-full flex items-center justify-center shadow hover:bg-background transition-colors z-10"
                  aria-label="Open lightbox"
                >
                  <ZoomIn className="w-4 h-4 text-foreground" />
                </button>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage() }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/90 rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-colors z-10"
                      >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage() }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/90 rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-colors z-10"
                      >
                        <ChevronRight className="w-5 h-5 text-foreground" />
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
                            : 'border-foreground/20 hover:border-brand-purple/50'
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
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.brand && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20 text-xs">
                        {product.brand}
                      </span>
                    )}
                    {product.category && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-xs">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-heading font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-brand-purple to-brand-red">
                    {product.name}
                  </h1>
                </div>
                

                <div className="flex items-baseline space-x-3 mb-6">
                  <span className="text-2xl sm:text-3xl font-bold">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-[var(--foreground)/50] line-through">
                        ₹{product.originalPrice}
                      </span>
                    </>
                  )}
                  {((typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo')) && (
                    <span className="ml-2 bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      {product.name.toLowerCase().includes('combo') ? 'Combo Offer' : `Pack of ${product.unitsPerPack}`}
                    </span>
                  )}
                </div>

                {(product.colors && product.colors.length > 0) && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Color:</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.colors.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedColor(c)}
                                    className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                                        selectedColor === c
                                            ? 'border-brand-purple text-brand-purple bg-brand-purple/10'
                                            : 'border-foreground/20 hover:border-brand-purple/50'
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {product.colors.map((c, i) => (
                            <button
                              key={`sw-${i}`}
                              title={c}
                              style={{ background: c }}
                              onClick={() => setSelectedColor(c)}
                              className={`w-5 h-5 rounded-full border-2 transition-colors ${
                                selectedColor === c ? 'border-brand-purple scale-110' : 'border-foreground/20 hover:scale-105'
                              }`}
                            />
                          ))}
                        </div>
                    </div>
                )}
                {(product.sizes && product.sizes.length > 0) && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Size:</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedSize(s)}
                                    className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                                        selectedSize === s
                                            ? 'border-brand-purple text-brand-purple bg-brand-purple/10'
                                            : 'border-foreground/20 hover:border-brand-purple/50'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {product.about && (
                    <div className="mb-6 p-4 bg-foreground/10 rounded-lg">
                        <h3 className="font-medium mb-2">About this item</h3>
                        <ul className="space-y-1 text-sm text-foreground/70 list-disc list-inside">
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
                      className="w-10 h-10 border border-foreground/20 rounded-lg flex items-center justify-center hover:bg-foreground/10 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(3, quantity + 1))}
                      className="w-10 h-10 border border-foreground/20 rounded-lg flex items-center justify-center hover:bg-foreground/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if ((product.stock ?? 0) > 0) {
                        if (!validateSelection()) return
                        onAddToCart({
                          ...product,
                          quantity,
                          selectedSize: selectedSize || undefined,
                          selectedColor: selectedColor || undefined,
                        })
                        onClose()
                      }
                    }}
                    disabled={(product.stock ?? 0) <= 0}
                    className={`flex-1 px-3 py-2 border rounded-md transition-colors font-medium text-sm flex items-center justify-center space-x-1 ${
                      (product.stock ?? 0) > 0
                        ? 'border-brand-purple text-brand-purple hover:bg-brand-purple/10'
                        : 'border-foreground/20 text-foreground/40 cursor-not-allowed'
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
                        : 'bg-foreground/10 text-foreground/40 cursor-not-allowed'
                    }`}
                  >
                    {(product.stock ?? 0) > 0 ? 'Buy Now' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-foreground/20 pt-6">
                <div className="flex gap-6 border-b border-foreground/20 mb-6">
                    <button onClick={() => setActiveTab('desc')} className={`pb-2 font-medium transition-colors ${activeTab === 'desc' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-foreground/60'}`}>Description</button>
                    <button onClick={() => setActiveTab('info')} className={`pb-2 font-medium transition-colors ${activeTab === 'info' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-foreground/60'}`}>Additional Info</button>
                    <button onClick={() => setActiveTab('reviews')} className={`pb-2 font-medium transition-colors ${activeTab === 'reviews' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-foreground/60'}`}>Reviews ({product.reviews ?? 0})</button>
                  </div>

                <div className="min-h-[200px]">
                    {activeTab === 'desc' && (
                      <div className="rounded-xl p-4 bg-linear-to-br from-brand-purple/5 to-transparent border border-foreground/15 shadow-sm">
                        <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {product.description || 'No description available.'}
                        </div>
                      </div>
                    )}
                    {activeTab === 'info' && (
                      <div className="rounded-xl p-4 bg-linear-to-br from-brand-red/5 to-transparent border border-foreground/15 shadow-sm">
                        <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-4">
                          {product.additionalInfo || 'No additional information available.'}
                        </div>
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
                                    <p className="text-sm text-foreground/60">Log in to write a review</p>
                                )}
                             </div>

                             {reviewFormOpen && session && (
                                 <div className="bg-foreground/10 p-4 rounded-lg mb-6">
                                     <div className="mb-4">
                                         <label className="block text-sm font-medium mb-1">Rating</label>
                                         <div className="flex gap-1">
                                             {[1, 2, 3, 4, 5].map(star => (
                                                 <button key={star} onClick={() => setUserRating(star)}>
                                                     <Star className={`w-6 h-6 ${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-foreground/30'}`} />
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                     <div className="mb-4">
                                         <label className="block text-sm font-medium mb-1">Review</label>
                                         <textarea
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                            className="w-full border border-foreground/20 bg-background text-foreground rounded-lg p-2"
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
                                 <div className="text-center py-8 text-foreground/60">No reviews yet. Be the first to review!</div>
                             ) : (
                                 <div className="space-y-4">
                                     {reviews.map((review) => (
                                         <div key={review._id} className="border-b border-foreground/20 pb-4 last:border-0">
                                             <div className="flex items-center justify-between mb-2">
                                                 <div className="flex items-center gap-2">
                                                     <div className="w-8 h-8 bg-foreground/10 rounded-full flex items-center justify-center">
                                                         <User className="w-4 h-4 text-foreground/60" />
                                                     </div>
                                                     <span className="font-medium">{review.userName}</span>
                                                 </div>
                                                 <span className="text-xs text-foreground/60">{new Date(review.createdAt).toLocaleDateString()}</span>
                                             </div>
                                             <div className="flex gap-1 mb-2">
                                                 {[...Array(5)].map((_, i) => (
                                                     <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-foreground/30'}`} />
                                                 ))}
                                             </div>
                                             <p className="text-foreground/70 text-sm">{review.comment}</p>
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
              className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center"
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
                  className="absolute top-4 right-4 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center z-10"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
                {images.length > 1 && (
                    <>
                        <button
                        onClick={(e) => { e.stopPropagation(); prevImage() }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center z-10"
                        >
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                        </button>
                        <button
                        onClick={(e) => { e.stopPropagation(); nextImage() }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center z-10"
                        >
                        <ChevronRight className="w-6 h-6 text-foreground" />
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
