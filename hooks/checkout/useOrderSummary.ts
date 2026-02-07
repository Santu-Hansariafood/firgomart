import { useState, useEffect } from 'react'
import { CartItem, OrderSummary, CheckoutFormData, safeJson } from '@/types/checkout'

interface UseOrderSummaryProps {
  cartItems: CartItem[]
  formData: CheckoutFormData
}

export const useOrderSummary = ({ cartItems, formData }: UseOrderSummaryProps) => {
  const [deliveryFee, setDeliveryFee] = useState<number>(0)
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({ 
    subtotal: 0, 
    tax: 0, 
    total: 0, 
    items: [],
    taxBreakdown: { cgst: 0, sgst: 0, igst: 0 }
  })

  useEffect(() => {
    const fetchFee = async () => {
      const valid = cartItems.filter(item => (item.stock ?? 0) > 0)
      if (valid.length === 0) {
        setDeliveryFee(0)
        return
      }
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            items: valid.map(ci => ({ 
              id: ci.id, 
              quantity: ci.quantity ?? 1,
              appliedOffer: ci.appliedOffer 
            })),
            dryRun: true,
            state: formData.state,
            country: formData.country
          }),
        })
        const data = await safeJson(res)
        if (res.ok) {
          setDeliveryFee(data.deliveryFee || 0)
          setOrderSummary({
            subtotal: data.subtotal || 0,
            tax: data.tax || 0,
            total: data.total || 0,
            items: data.items || [],
            taxBreakdown: data.taxBreakdown || { cgst: 0, sgst: 0, igst: 0 }
          })
        }
      } catch {}
    }
    const timer = setTimeout(fetchFee, 500)
    return () => clearTimeout(timer)
  }, [cartItems, formData.state, formData.country])

  return {
    deliveryFee,
    orderSummary,
    subtotal: orderSummary.subtotal,
    tax: orderSummary.tax,
    total: orderSummary.total
  }
}
