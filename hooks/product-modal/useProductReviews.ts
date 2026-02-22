import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface Review {
  _id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

interface UseProductReviewsProps {
  productId: string | number
  enabled?: boolean
}

export function useProductReviews({ productId, enabled = true }: UseProductReviewsProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [userRating, setUserRating] = useState(5)
  const [userComment, setUserComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewEligibility, setReviewEligibility] = useState<{ canReview: boolean; reason?: string; returnPeriodEnds?: string } | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true)
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
    setLoadingReviews(false)
  }, [productId])

  useEffect(() => {
    if (!enabled || !session?.user || !productId) {
      setReviewEligibility(null)
      return
    }
    let cancelled = false
    const run = async () => {
      setCheckingEligibility(true)
      try {
        const res = await fetch(`/api/reviews/eligibility?productId=${productId}`)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setReviewEligibility(data)
        } else if (!cancelled) {
          setReviewEligibility(null)
        }
      } catch {
        if (!cancelled) setReviewEligibility(null)
      } finally {
        if (!cancelled) setCheckingEligibility(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [productId, session, enabled])

  const handleSubmitReview = useCallback(async () => {
    if (!session) {
        toast.error('Please login to submit a review')
        return
    }
    if (reviewEligibility && !reviewEligibility.canReview) {
      toast.error('You can only review products you have purchased and received')
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: userRating,
          comment: userComment
        })
      })
      if (res.ok) {
        setUserComment('')
        setReviewFormOpen(false)
        fetchReviews()
        toast.success('Review submitted successfully!')
      } else {
        try {
          const data = await res.json()
          toast.error(data?.error || 'Failed to submit review')
        } catch {
          toast.error('Failed to submit review')
        }
      }
    } catch (error) {
        console.error('Error submitting review:', error)
        toast.error('Something went wrong')
    }
    setSubmittingReview(false)
  }, [session, productId, userRating, userComment, fetchReviews, reviewEligibility])

  return {
    reviews,
    loadingReviews,
    reviewFormOpen,
    setReviewFormOpen,
    userRating,
    setUserRating,
    userComment,
    setUserComment,
    submittingReview,
    reviewEligibility,
    checkingEligibility,
    fetchReviews,
    handleSubmitReview
  }
}
