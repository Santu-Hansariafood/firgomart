import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CartItem, CheckoutFormData, safeJson } from '@/types/checkout'

interface UsePaymentProps {
  cartItems: CartItem[]
  formData: CheckoutFormData
  total: number
  onRemoveItem?: (id: number | string) => void
  promoCode?: string
}

export const usePayment = ({ cartItems, formData, total, onRemoveItem, promoCode }: UsePaymentProps) => {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<'cashfree' | 'razorpay'>('cashfree')
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false)
  const [lastOrder, setLastOrder] = useState<{ id?: string; orderNumber?: string } | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    setCheckoutError(null)
    setIsSubmitting(true)
    try {
      const payload = {
        buyerEmail: formData.email,
        buyerName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        promoCode: promoCode,
        items: cartItems.map(ci => ({ 
          id: ci.id, 
          quantity: ci.quantity ?? 1,
          selectedSize: ci.selectedSize,
          selectedColor: ci.selectedColor,
          appliedOffer: ci.appliedOffer
        })),
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await safeJson(res)
      if (!res.ok) {
        if (data?.productId) {
          const pid = Number(data.productId)
          const item = cartItems.find(ci => ci.id === pid)
          setCheckoutError(`Sorry, "${item?.name || 'Product'}" is out of stock and has been removed from your cart.`)
          if (onRemoveItem) onRemoveItem(pid)
        } else {
          setCheckoutError(data?.error || "Failed to place order")
        }
        setIsSubmitting(false)
        return
      }

      if (paymentMethod === 'cashfree') {
        try {
          const orderId = data.order._id || data.order.id
          const initRes = await fetch('/api/payment/cashfree/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          })
          const initData = await safeJson(initRes)
          if (!initRes.ok) {
            setCheckoutError(initData?.errorText || initData?.error || "Failed to initiate Cashfree payment")
            setIsSubmitting(false)
            return
          }
          const ensureScript = async () => {
            const src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
            if (document.querySelector(`script[src="${src}"]`)) return
            await new Promise<void>((resolve, reject) => {
              const s = document.createElement('script')
              s.src = src
              s.onload = () => resolve()
              s.onerror = () => reject(new Error('Failed to load Cashfree'))
              document.body.appendChild(s)
            })
          }
          await ensureScript()
          const cf = (window as any).Cashfree({ mode: (initData.mode === 'production' ? 'production' : 'sandbox') })
          cf.checkout({ paymentSessionId: String(initData.paymentSessionId || ''), redirectTarget: '_self' })
          return
        } catch {
          setCheckoutError("Failed to connect to payment gateway")
          setIsSubmitting(false)
          return
        }
      }

      if (paymentMethod === 'razorpay') {
        try {
          const orderId = data.order._id || data.order.id
          const initRes = await fetch('/api/payment/razorpay/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          })
          const initData = await safeJson(initRes)
          if (!initRes.ok) {
            setCheckoutError(initData?.error || initData?.errorText || "Failed to initiate Razorpay payment")
            setIsSubmitting(false)
            return
          }
          const ensureScript = async () => {
            const src = 'https://checkout.razorpay.com/v1/checkout.js'
            if (document.querySelector(`script[src="${src}"]`)) return
            await new Promise<void>((resolve, reject) => {
              const s = document.createElement('script')
              s.src = src
              s.onload = () => resolve()
              s.onerror = () => reject(new Error('Failed to load Razorpay'))
              document.body.appendChild(s)
            })
          }
          await ensureScript()
          const opts: any = {
            key: initData.keyId,
            amount: initData.amount,
            currency: initData.currency || 'INR',
            name: 'FirgoMart',
            order_id: initData.rpOrderId,
            prefill: {
              name: initData.buyerName || formData.fullName,
              email: initData.buyerEmail || formData.email,
              contact: formData.phone,
            },
            notes: { orderNumber: initData.orderNumber || '' },
            handler: async function (resp: any) {
              try {
                const verifyRes = await fetch('/api/payment/razorpay/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId,
                    razorpay_payment_id: resp.razorpay_payment_id,
                    razorpay_order_id: resp.razorpay_order_id,
                    razorpay_signature: resp.razorpay_signature,
                  }),
                })
                const verifyData = await safeJson(verifyRes)
                if (verifyRes.ok && verifyData.status === 'confirmed') {
                  setOrderPlaced(true)
                  setLastOrder({ id: String(orderId), orderNumber: String(verifyData?.order?.orderNumber || '') })
                  if (onRemoveItem) {
                    cartItems.forEach(ci => onRemoveItem(ci.id))
                  }
                } else {
                  setCheckoutError(verifyData?.error || "Payment verification failed")
                }
              } catch {
                setCheckoutError("Failed to verify payment")
              }
            },
            theme: { color: '#7800c8' },
            modal: {
              ondismiss: function() {
                setIsSubmitting(false);
              }
            }
          }
          const rzp = new (window as any).Razorpay(opts)
          rzp.open()
          return
        } catch {
          setCheckoutError("Failed to connect to payment gateway")
          setIsSubmitting(false)
          return
        }
      }

      setOrderPlaced(true)
      setLastOrder({ id: String(data?.order?.id || ""), orderNumber: String(data?.order?.orderNumber || "") })
      if (onRemoveItem) {
        cartItems.forEach(ci => onRemoveItem(ci.id))
      }
    } catch {
      setIsSubmitting(false)
      setCheckoutError("An unexpected error occurred. Please try again.")
    }
  }

  return {
    paymentMethod,
    setPaymentMethod,
    orderPlaced,
    lastOrder,
    checkoutError,
    isSubmitting,
    handlePlaceOrder,
    router
  }
}
