'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, ShoppingCart, Star, ChevronLeft, ChevronRight, User, ZoomIn, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import FallbackImage from '@/components/common/Image/FallbackImage'
import Script from 'next/script'
import { useCart } from '@/context/CartContext/CartContext'
import toast from 'react-hot-toast'
import { getMaxQuantity } from '@/utils/productUtils'

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
  appliedOffer?: {
    name: string
    type: string
    value?: string | number
  }
}

interface Review {
  _id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

interface ProductPageClientProps {
  product: Product
}

const ProductPageClient: React.FC<ProductPageClientProps> = ({ product }) => {
  const { data: session } = useSession()
  const { addToCart, showCart, setShowCart } = useCart()
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
  
  const [reviewEligibility, setReviewEligibility] = useState<{ canReview: boolean; reason?: string; returnPeriodEnds?: string } | null>(null)
  
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      // Check review eligibility
      fetch(`/api/reviews/eligibility?productId=${product.id}`)
        .then(res => res.json())
        .then(data => setReviewEligibility(data))
        .catch(() => {})

      fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      }).catch(() => {})

      fetch('/api/user/wishlist')
        .then(res => res.json())
        .then(data => {
          if (data.wishlist) {
            const exists = data.wishlist.some((p: any) => String(p._id || p.id) === String(product.id))
            setIsSaved(exists)
          }
        })
        .catch(() => {})
    }
  }, [product.id, session])

  const toggleSave = async () => {
    if (!session) {
      toast.error("Please login to save products")
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      })
      const data = await res.json()
      if (data.success) {
        if (typeof data.added === 'boolean') setIsSaved(data.added)
        else setIsSaved(!isSaved)
      }
    } catch {}
    setSaving(false)
  }

  const validateSelection = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return false
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color')
      return false
    }
    return true
  }

  const images: string[] = (product.images && product.images.length > 0)
    ? product.images
    : [product.image]

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)

  const calculatePrice = () => {
    let price = product.price
    if (product.appliedOffer && product.appliedOffer.value) {
      const val = Number(product.appliedOffer.value)
      if (!isNaN(val) && val > 0 && val <= 100) {
         if (String(product.appliedOffer.type).includes('discount')) {
            const discountAmount = Math.round((price * val) / 100)
            price = price - discountAmount
         }
      }
    }
    return price
  }

  const currentPrice = calculatePrice()
  const hasOffer = product.appliedOffer && product.appliedOffer.value

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

      const data = await res.json()

      if (res.ok) {
        toast.success('Review submitted successfully')
        setUserComment('')
        setReviewFormOpen(false)
        fetchReviews()
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch {
      toast.error('Something went wrong')
    }
    setSubmittingReview(false)
  }, [session, product.id, userRating, userComment, fetchReviews])

  const handleBuyNow = () => {
    if ((product.stock ?? 0) > 0) {
      if (!validateSelection()) return
      addToCart({ 
        ...product, 
        quantity,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined
      })
      router.push('/checkout')
    }
  }

  const handleAddToCart = () => {
    if ((product.stock ?? 0) > 0) {
      if (!validateSelection()) return
      addToCart({
        ...product,
        quantity,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
      })
      setShowCart(true)
    }
  }

  const maxQty = getMaxQuantity(product.price)

  return (
    <div className="bg-background text-foreground min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-foreground/10">
            <div className="flex items-center justify-between mb-4">
               <div />
               <button
                  onClick={toggleSave}
                  disabled={saving}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors shrink-0"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
                </button>
            </div>

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
                
                {((typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo')) && (
                  <div className="absolute top-12 left-2 bg-purple-600 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-lg shadow-lg z-10 animate-pulse">
                    {product.name.toLowerCase().includes('combo') ? 'COMBO OFFER' : `PACK OF ${product.unitsPerPack}`}
                  </div>
                )}

                {product.rating && (
                  <div className="absolute bottom-2 left-2 bg-linear-to-br from-brand-purple-500/70 to-transparent backdrop-blur-sm text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-lg shadow-lg flex items-center">
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2 leading-tight">
                    {product.name}
                  </h1>
                </div>
                
                <div className="flex items-baseline space-x-3 mb-2">
                  <span className="text-2xl sm:text-3xl font-bold">₹{currentPrice}</span>
                  {(product.originalPrice || hasOffer) && (
                    <>
                      <span className="text-xl text-red-500 line-through">
                        ₹{product.originalPrice || product.price}
                      </span>
                    </>
                  )}
                  {((typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo')) && (
                    <span className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      {product.name.toLowerCase().includes('combo') ? 'Combo Offer' : `Pack of ${product.unitsPerPack}`}
                    </span>
                  )}
                </div>

                {hasOffer && (
                   <div className="mb-6 inline-block">
                     <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 flex items-center gap-2">
                       <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">OFFER</span>
                       <span className="text-sm font-medium text-green-700 dark:text-green-300">
                         {product.appliedOffer?.name}: Get {product.appliedOffer?.value}% Extra Discount
                       </span>
                     </div>
                   </div>
                )}

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
                      onClick={() => setQuantity(Math.min(maxQty, product.stock || 10, quantity + 1))}
                      disabled={quantity >= Math.min(maxQty, product.stock || 10)}
                      className={`w-10 h-10 border border-foreground/20 rounded-lg flex items-center justify-center transition-colors ${
                        quantity >= Math.min(maxQty, product.stock || 10) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-foreground/10'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleAddToCart}
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
                                    reviewEligibility?.canReview ? (
                                        <button onClick={() => setReviewFormOpen(!reviewFormOpen)} className="text-brand-purple font-medium hover:underline">
                                            {reviewFormOpen ? 'Cancel Review' : 'Write a Review'}
                                        </button>
                                    ) : (
                                        <div className="text-sm text-foreground/60 italic px-3 py-1 bg-foreground/5 rounded-lg border border-foreground/10">
                                            {reviewEligibility?.reason === 'Return period active' 
                                                ? `Review available after ${new Date(reviewEligibility.returnPeriodEnds!).toLocaleDateString()}`
                                                : reviewEligibility?.reason === 'Not delivered yet'
                                                ? 'Review available after delivery'
                                                : reviewEligibility?.reason === 'Already reviewed'
                                                ? 'You have already reviewed this product'
                                                : 'Purchase and receive product to review'}
                                        </div>
                                    )
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
                                                 <Star className={`w-6 h-6 ${star <= userRating ? 'fill-brand-purple-400 text-brand-purple-400' : 'text-foreground/30'}`} />
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
                                                     <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-brand-purple-400 text-brand-purple-400' : 'text-foreground/30'}`} />
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
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
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
        </div>
    </div>
  )
}

export default ProductPageClient