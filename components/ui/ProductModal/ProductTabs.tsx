'use client'

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Star, User } from 'lucide-react'
import { Product } from '@/types/product'

export interface Review {
  _id: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

interface ProductTabsProps {
  product: Product
  activeTab: 'desc' | 'info' | 'reviews'
  setActiveTab: (tab: 'desc' | 'info' | 'reviews') => void
  reviews: Review[]
  loadingReviews: boolean
  reviewFormOpen: boolean
  setReviewFormOpen: (open: boolean) => void
  userRating: number
  setUserRating: (rating: number) => void
  userComment: string
  setUserComment: (comment: string) => void
  submittingReview: boolean
  handleSubmitReview: () => void
  session: any
}

const ProductTabs = memo(({
  product,
  activeTab,
  setActiveTab,
  reviews,
  loadingReviews,
  reviewFormOpen,
  setReviewFormOpen,
  userRating,
  setUserRating,
  userComment,
  setUserComment,
  submittingReview,
  handleSubmitReview,
  session
}: ProductTabsProps) => {
  return (
    <div className="mt-8 sm:mt-12">
      <div className="flex gap-6 border-b border-foreground/10 mb-6 overflow-x-auto custom-scrollbar">
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
  )
})

ProductTabs.displayName = 'ProductTabs'

export default ProductTabs
