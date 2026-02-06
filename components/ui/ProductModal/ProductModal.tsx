'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Star, ChevronLeft, ChevronRight, User, ZoomIn, Heart, Share2, Gift, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import FallbackImage from '@/components/common/Image/FallbackImage'
import Script from 'next/script'
import toast from 'react-hot-toast'

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
  
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
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

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user) {
      router.push('/login')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/user/wishlist', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      })
      if (res.ok) {
        setIsSaved(!isSaved)
        toast.success(isSaved ? 'Removed from wishlist' : 'Added to wishlist')
      }
    } catch {}
    setSaving(false)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/product/${product.id}`
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on FirgoMart!`,
      url
    }

    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Product link copied to clipboard!')
      } catch (err) {
        console.error('Error copying to clipboard:', err)
        toast.error('Failed to copy link')
      }
    }
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
        toast.success('Review submitted successfully!')
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
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/10 dark:bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-foreground/5 px-6 py-4 flex items-center justify-between z-30">
            <h2 className="text-xl font-heading font-bold truncate pr-4 text-foreground/90">{product.name}</h2>
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
              <div className="space-y-4">
                <div
                    className="relative aspect-square rounded-3xl overflow-hidden bg-white/50 dark:bg-black/50 border border-foreground/5 shadow-inner cursor-pointer group"
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
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.discount && (
                            <span className="bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20">
                                {product.discount}% OFF
                            </span>
                        )}
                        {((typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo')) && (
                            <span className="bg-white/95 dark:bg-violet-600/90 backdrop-blur-md text-violet-700 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-violet-500/20 border border-violet-200/50 dark:border-violet-500/50">
                                {product.name.toLowerCase().includes('combo') ? '✨ COMBO OFFER' : `📦 PACK OF ${product.unitsPerPack}`}
                            </span>
                        )}
                    </div>

                    {product.rating && (
                        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-brand-purple text-brand-purple" />
                  <span>{product.rating}</span>
                  <span className="text-white/60 font-normal ml-1">
                    ({product.reviews ?? 0})
                  </span>
                </div>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); setLightboxOpen(true) }}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>

                    {images.length > 1 && (
                        <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage() }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage() }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        </>
                    )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? 'border-brand-purple ring-2 ring-brand-purple/20'
                            : 'border-transparent hover:border-brand-purple/50'
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

              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.brand && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-purple/5 text-brand-purple border border-brand-purple/20 text-xs font-bold tracking-wide uppercase">
                        {product.brand}
                      </span>
                    )}
                    {product.category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-medium">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold mb-3 leading-tight text-foreground/90 dark:text-white">
                      {product.name}
                  </h2>
                </div>

                <div className="flex items-end gap-3 mb-6 p-4 rounded-2xl bg-foreground/5 border border-foreground/5 dark:bg-white/5 dark:border-white/10">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground dark:text-white">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-foreground/40 dark:text-white/40 line-through mb-1.5 font-medium">
                      ₹{product.originalPrice}
                    </span>
                  )}
                  {product.discount && (
                    <span className="ml-auto text-green-600 dark:text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                      {product.discount}% Save
                    </span>
                  )}
                </div>

                {product.appliedOffer && (
                  <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-purple via-pink-500 to-indigo-600 p-[1px] shadow-xl">
                     <div className="bg-white/95 dark:bg-black/90 backdrop-blur-xl rounded-[15px] p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="flex items-start gap-3 relative z-10">
                            <div className="p-2 bg-brand-purple text-white rounded-lg shadow-lg shadow-brand-purple/30 shrink-0">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-brand-purple dark:text-violet-300 uppercase tracking-wider mb-0.5">Special Offer Applied</p>
                                <p className="font-bold text-foreground dark:text-white text-lg">
                                    {product.appliedOffer.name}
                                </p>
                                {product.appliedOffer.value && (
                                    <p className="text-sm font-medium text-foreground/70 dark:text-white/70 mt-0.5">
                                        Get <span className="text-brand-purple dark:text-violet-300 font-bold">{product.appliedOffer.value}{product.appliedOffer.type.includes('discount') ? '% OFF' : ''}</span> instantly
                                    </p>
                                )}
                            </div>
                        </div>
                     </div>
                  </div>
                )}

                {(product.colors && product.colors.length > 0) && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-foreground/70 uppercase tracking-wide mb-3">Select Color</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.colors.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedColor(c)}
                                    className={`group relative px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        selectedColor === c
                                            ? 'bg-foreground text-background shadow-lg scale-105'
                                            : 'bg-background border border-foreground/20 hover:border-brand-purple'
                                    }`}
                                >
                                    {c}
                                    {selectedColor === c && (
                                        <motion.div layoutId="colorCheck" className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {(product.sizes && product.sizes.length > 0) && (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-foreground/70 uppercase tracking-wide mb-3">Select Size</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.sizes.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedSize(s)}
                                    className={`group relative min-w-[3rem] px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        selectedSize === s
                                            ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30 scale-105'
                                            : 'bg-background border border-foreground/20 hover:border-brand-purple'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
                    <div className="flex items-center bg-foreground/5 dark:bg-white/5 rounded-xl p-1 w-fit">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background shadow-sm transition-all text-foreground dark:text-white"
                    >
                        -
                    </button>
                    <span className="w-12 text-center font-bold text-foreground dark:text-white">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background shadow-sm transition-all text-foreground dark:text-white"
                    >
                        +
                    </button>
                </div>
                    
                    <button
                        onClick={handleBuyNow}
                        disabled={(product.stock ?? 0) <= 0}
                        className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                            (product.stock ?? 0) > 0
                            ? 'bg-gradient-to-r from-brand-purple to-indigo-600 shadow-brand-purple/25'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {(product.stock ?? 0) > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-foreground/5">
                    <div className="flex flex-col items-center text-center gap-2">
                        <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-foreground/60">Secure Payment</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                        <div className="p-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                            <Truck className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-foreground/60">Fast Delivery</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                        <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-foreground/60">Quality Assured</span>
                    </div>
                </div>

              </div>
            </div>

            <div className="border-t border-foreground/10 pt-8">
              <div className="flex gap-6 border-b border-foreground/10 mb-6">
                {['desc', 'info', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative ${
                      activeTab === tab ? 'text-brand-purple' : 'text-foreground/50 hover:text-foreground'
                    }`}
                  >
                    {tab === 'desc' ? 'Description' : tab === 'info' ? 'Specifications' : 'Reviews'}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[200px]">
                {activeTab === 'desc' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose dark:prose-invert max-w-none text-foreground/80 dark:text-gray-300 leading-relaxed">
                    <p>{product.description || product.about || 'No description available.'}</p>
                  </motion.div>
                )}
                
                {activeTab === 'info' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                    {[
                      ['Category', product.category],
                      ['Brand', product.brand],
                      ['Weight', product.weight ? `${product.weight} ${product.weightUnit}` : null],
                      ['Dimensions', (product.height && product.width) ? `${product.height}x${product.width} ${product.dimensionUnit}` : null],
                      ['HSN Code', product.hsnCode],
                      ['Stock Status', (product.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock'],
                    ].map(([label, value], i) => value && (
                      <div key={i} className="flex justify-between py-3 border-b border-foreground/5">
                        <span className="font-medium text-foreground/60 dark:text-gray-400">{label}</span>
                        <span className="font-bold text-foreground dark:text-gray-100">{value}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold">Customer Reviews ({reviews.length})</h3>
                      {session && !reviewFormOpen && (
                        <button
                          onClick={() => setReviewFormOpen(true)}
                          className="px-4 py-2 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                        >
                          Write a Review
                        </button>
                      )}
                    </div>

                    {reviewFormOpen && (
                      <div className="bg-foreground/5 dark:bg-white/5 p-6 rounded-2xl mb-8">
                        <h4 className="font-bold mb-4 text-foreground dark:text-white">Write your review</h4>
                        <div className="flex gap-2 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setUserRating(star)} className="focus:outline-none">
                              <Star className={`w-6 h-6 ${star <= userRating ? 'fill-brand-purple text-brand-purple' : 'text-foreground/20 dark:text-white/20'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={userComment}
                          onChange={(e) => setUserComment(e.target.value)}
                          placeholder="Tell us what you think..."
                          className="w-full bg-background border border-foreground/10 dark:border-white/10 rounded-xl p-4 min-h-[100px] mb-4 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none text-foreground dark:text-white placeholder:text-foreground/40 dark:placeholder:text-white/40"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleSubmitReview}
                            disabled={submittingReview}
                            className="px-6 py-2 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purple/90 transition-colors disabled:opacity-50"
                          >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                          </button>
                          <button
                            onClick={() => setReviewFormOpen(false)}
                            className="px-6 py-2 bg-transparent border border-foreground/20 rounded-xl font-bold hover:bg-foreground/5 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {loadingReviews ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple" />
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="grid gap-4">
                        {reviews.map((review) => (
                          <div key={review._id} className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 dark:bg-white/5 dark:border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-brand-purple" />
                                </div>
                                <span className="font-bold text-foreground dark:text-white">{review.userName}</span>
                              </div>
                              <span className="text-xs text-foreground/40 dark:text-white/40">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-brand-purple text-brand-purple' : 'text-foreground/20 dark:text-white/20'}`} />
                              ))}
                            </div>
                            <p className="text-foreground/80 dark:text-gray-300 text-sm">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-foreground/40">
                        No reviews yet. Be the first to review this product!
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <FallbackImage
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ProductModal