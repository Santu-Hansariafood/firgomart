import { useState } from 'react'
import { CartItem, safeJson } from '@/types/checkout'

interface UseDeliveryValidationProps {
  cartItems: CartItem[]
}

export const useDeliveryValidation = ({ cartItems }: UseDeliveryValidationProps) => {
  const [invalidItems, setInvalidItems] = useState<Array<{ id: number; name: string }>>([])
  const [validating, setValidating] = useState<boolean>(false)

  async function validateDelivery(stateVal: string) {
    if (!stateVal) {
      setInvalidItems([])
      return true
    }
    setValidating(true)
    try {
      const res = await fetch('/api/cart/validate-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverToState: stateVal,
          items: cartItems.map(ci => ({ id: ci.id })),
        }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(data?.error || 'Validation failed')
      const results: Array<{ id: string; deliverable: boolean }> = Array.isArray(data?.results) ? data.results : []
      const badIds = new Set(results.filter(r => !r.deliverable).map(r => String(r.id)))
      const invalid = cartItems
        .filter(ci => badIds.has(String(ci.id)))
        .map(ci => ({ id: ci.id as number, name: ci.name }))
      setInvalidItems(invalid)
      return invalid.length === 0
    } catch {
      setInvalidItems([])
      return true
    } finally {
      setValidating(false)
    }
  }

  return {
    invalidItems,
    setInvalidItems,
    validating,
    validateDelivery
  }
}
