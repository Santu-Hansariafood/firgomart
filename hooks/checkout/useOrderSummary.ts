import { useState, useEffect } from 'react'
import { CartItem, OrderSummary, CheckoutFormData, safeJson } from '@/types/checkout'

interface UseOrderSummaryProps {
  cartItems: CartItem[]
  formData: CheckoutFormData
  promoCode?: string
}

export const useOrderSummary = ({ cartItems, formData, promoCode }: UseOrderSummaryProps) => {
  const [deliveryFee, setDeliveryFee] = useState<number>(0)
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({ 
    subtotal: 0, 
    tax: 0, 
    total: 0, 
    items: [],
    taxBreakdown: { cgst: 0, sgst: 0, igst: 0 },
    totalBeforeDiscount: 0,
    promo: null
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
            country: formData.country,
            promoCode: promoCode
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
            taxBreakdown: data.taxBreakdown || { cgst: 0, sgst: 0, igst: 0 },
            totalBeforeDiscount: data.totalBeforeDiscount || data.total || 0,
            promo: data.promo || null
          })
        }
      } catch {}
    }
    const timer = setTimeout(fetchFee, 500)
    return () => clearTimeout(timer)
  }, [cartItems, formData.state, formData.country, promoCode])

  return {
    deliveryFee,
    orderSummary,
    subtotal: orderSummary.subtotal,
    tax: orderSummary.tax,
    total: orderSummary.total
  }
}
