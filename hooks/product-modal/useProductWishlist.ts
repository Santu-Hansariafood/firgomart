import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface UseProductWishlistProps {
  productId: string | number
}

export function useProductWishlist({ productId }: UseProductWishlistProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (session?.user) {
      // Record history
      fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      }).catch(() => {})

      // Check wishlist
      fetch('/api/user/wishlist')
        .then(res => res.json())
        .then(data => {
          if (data.wishlist) {
            const exists = data.wishlist.some((p: any) => String(p._id || p.id) === String(productId))
            setIsSaved(exists)
          }
        })
        .catch(() => {})
    }
  }, [productId, session])

  const toggleSave = useCallback(async (e: React.MouseEvent) => {
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
        body: JSON.stringify({ productId })
      })
      if (res.ok) {
        setIsSaved(!isSaved)
        toast.success(isSaved ? 'Removed from wishlist' : 'Added to wishlist')
      }
    } catch (error) {
        console.error('Error toggling wishlist:', error)
        toast.error('Failed to update wishlist')
    }
    setSaving(false)
  }, [session, isSaved, productId, router])

  return {
    isSaved,
    saving,
    toggleSave
  }
}
