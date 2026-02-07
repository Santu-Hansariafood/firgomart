import { useState, useCallback } from 'react'
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
}

export function useProductReviews({ productId }: UseProductReviewsProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [userRating, setUserRating] = useState(5)
  const [userComment, setUserComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

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

  const handleSubmitReview = useCallback(async () => {
    if (!session) {
        toast.error('Please login to submit a review')
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
        toast.error('Failed to submit review')
      }
    } catch (error) {
        console.error('Error submitting review:', error)
        toast.error('Something went wrong')
    }
    setSubmittingReview(false)
  }, [session, productId, userRating, userComment, fetchReviews])

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
    fetchReviews,
    handleSubmitReview
  }
}
