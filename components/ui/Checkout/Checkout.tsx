'use client'

import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  MapPin,
  CheckCircle,
  Plus,
  Edit2,
  ChevronRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  X,
  Wallet,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fadeInUp } from '@/utils/animations/animations'
import FallbackImage from '@/components/common/Image/FallbackImage'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/common/BackButton/BackButton'
import countryData from '@/data/country.json'

const Rupee: React.FC<{ className?: string }> = ({ className }) => (
  <span className={className} style={{ fontFamily: 'system-ui, "Segoe UI Symbol", "Noto Sans", "Arial Unicode MS", sans-serif' }}>
    {"\u20B9"}
  </span>
)

interface CartItem {
  id: number | string
  name: string
  price: number
  image: string
  originalPrice?: number
  quantity?: number
  stock?: number
  unitsPerPack?: number
  selectedSize?: string
  selectedColor?: string
  _uniqueId?: string
  appliedOffer?: {
    name: string
    type: string
    value?: string | number
  }
}

interface CheckoutProps {
  cartItems: CartItem[]
  onUpdateQuantity?: (id: number | string, quantity: number) => void
  onRemoveItem?: (id: number | string) => void
}

interface FormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

const Checkout: React.FC<CheckoutProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState<number>(1)
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false)
  const [lastOrder, setLastOrder] = useState<{ id?: string; orderNumber?: string } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cashfree' | 'razorpay'>('cashfree')
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })
  const [invalidItems, setInvalidItems] = useState<Array<{ id: number; name: string }>>([])
  const [validating, setValidating] = useState<boolean>(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [deliveryFee, setDeliveryFee] = useState<number>(0)
  const [orderSummary, setOrderSummary] = useState({ 
    subtotal: 0, 
    tax: 0, 
    total: 0, 
    items: [] as any[],
    taxBreakdown: { cgst: 0, sgst: 0, igst: 0 }
  })
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false)

  async function safeJson(res: Response) {
    try {
      return await res.json()
    } catch {
      try {
        const t = await res.text()
        return { errorText: t }
      } catch {
        return {}
      }
    }
  }

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('deliverToState') || '' : ''
      if (saved) setFormData(prev => ({ ...prev, state: saved }))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('deliveryAddress') || '' : ''
      if (!raw) return
      const obj = JSON.parse(raw || '{}') as Partial<FormData>
      setFormData(prev => ({
        ...prev,
        fullName: obj.fullName || prev.fullName,
        email: obj.email || prev.email,
        phone: obj.phone || prev.phone,
        address: obj.address || prev.address,
        city: obj.city || prev.city,
        state: obj.state || prev.state,
        pincode: obj.pincode || prev.pincode,
        country: obj.country || prev.country,
      }))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      if (formData.email || formData.fullName) {
        localStorage.setItem('deliveryAddress', JSON.stringify(formData))
      }
    } catch {}
  }, [formData])

  useEffect(() => {
    if (!user) return
    const u = user as any
    const addresses = Array.isArray(u.addresses) ? u.addresses : []
    
    let defaultAddr = addresses.find((a: any) => a.isDefault === true || String(a.isDefault) === 'true')
    
    if (!defaultAddr && addresses.length > 0) {
      defaultAddr = addresses[0]
    }
    
    setFormData(prev => {
      const newAddress = defaultAddr?.address || u.address || prev.address
      const newCity = defaultAddr?.city || u.city || prev.city
      const newState = defaultAddr?.state || u.state || prev.state
      const newPincode = defaultAddr?.pincode || u.pincode || prev.pincode
      const newCountry = defaultAddr?.country || u.country || prev.country
      
      return {
        ...prev,
        fullName: u.name || prev.fullName,
        email: u.email || prev.email,
        phone: u.mobile || u.phone || prev.phone,
        address: newAddress,
        city: newCity,
        state: newState,
        pincode: newPincode,
        country: newCountry,
      }
    })
    try {
      const st = defaultAddr?.state || u.state
      if (st) localStorage.setItem('deliverToState', st)
    } catch {}
  }, [user])

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
  }, [cartItems, formData.state])

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

  const validItems = cartItems.filter(item => (item.stock ?? 0) > 0)
  const { subtotal, tax, total } = orderSummary

  const indianStates = countryData.countries.find(c => c.country === "India")?.states || []
  const availableCountries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Other"]

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectAddress = (addr: any) => {
    const u = user as any
    setFormData(prev => ({
      ...prev,
      fullName: u?.name || prev.fullName,
      email: u?.email || prev.email,
      phone: u?.mobile || u?.phone || prev.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || 'India',
    }))
    setShowAddressModal(false)
  }

  const handleAddNewAddress = () => {
    const u = user as any
    setFormData({
      fullName: u?.name || '',
      email: u?.email || '',
      phone: u?.mobile || u?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    })
    setShowAddressModal(false)
  }

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

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative z-10"
        >
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              transition={{ delay: 0.4, duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0 border-2 border-green-500/30 rounded-full"
            />
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-[var(--foreground)] mb-3">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          
          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-zinc-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Order ID</p>
            <p className="text-xl font-mono font-bold text-[var(--foreground)] tracking-wide">
              {lastOrder?.orderNumber || lastOrder?.id || ""}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {lastOrder?.id && (
              <a
                href={`/api/orders/${encodeURIComponent(lastOrder.id)}/receipt?download=true`}
                className="flex-1 px-6 py-3.5 border border-gray-200 dark:border-zinc-700 text-[var(--foreground)] rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all font-medium flex items-center justify-center gap-2"
              >
                Download Receipt
              </a>
            )}
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3.5 bg-brand-purple text-white rounded-xl font-medium hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/25 flex items-center justify-center gap-2 group"
            >
              Continue Shopping
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => router.push('/cart')} className="p-2 hover:bg-[var(--foreground)]/5 rounded-full transition-colors">
               <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
             </button>
             <h1 className="text-2xl font-bold font-heading text-[var(--foreground)]">Checkout</h1>
          </div>
          
          {/* Progress Stepper */}
          <div className="hidden md:flex items-center space-x-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-purple font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-brand-purple bg-brand-purple text-white' : 'border-gray-300 text-gray-400'}`}>
                <MapPin className="w-4 h-4" />
              </div>
              <span>Address</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700 relative">
               <div className={`absolute top-0 left-0 h-full bg-brand-purple transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-purple font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-brand-purple bg-brand-purple text-white' : 'border-gray-300 text-gray-400'}`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Form */}
          <div className="lg:col-span-8">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Step Header for Mobile */}
              <div className="md:hidden p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="font-bold text-[var(--foreground)]">
                  {step === 1 ? 'Shipping Address' : 'Payment Method'}
                </span>
                <span className="text-xs font-medium px-2 py-1 bg-[var(--foreground)]/10 rounded text-[var(--foreground)]">
                  Step {step} of 2
                </span>
              </div>

              <div className="p-6 md:p-8">
                {step === 1 && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const ok = await validateDelivery(formData.state)
                      if (ok) setStep(2)
                    }}
                    className="space-y-6"
                  >
                    {(user as any)?.addresses?.length > 0 && (
                      <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 text-base">
                             <ShieldCheck className="w-4 h-4 text-brand-purple" />
                             Saved Addresses
                           </h3>
                           <div className="flex gap-2">
                             <button 
                               type="button"
                               onClick={handleAddNewAddress}
                               className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-gray-400 hover:border-brand-purple hover:text-brand-purple transition-colors flex items-center gap-1"
                             >
                               <Plus className="w-3 h-3" /> Add New
                             </button>
                             <button 
                               type="button"
                               onClick={() => setShowAddressModal(true)}
                               className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-purple text-white shadow-lg shadow-brand-purple/20 hover:bg-brand-purple/90 transition-all flex items-center gap-1"
                             >
                               Change <ChevronRight className="w-3 h-3" />
                             </button>
                           </div>
                        </div>
                        
                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-blue-200 dark:border-blue-800/30 flex items-start gap-4 relative overflow-hidden shadow-sm">
                          <div className="absolute top-0 right-0 px-3 py-1 bg-brand-purple text-white text-[10px] font-bold rounded-bl-xl shadow-sm">
                            SELECTED
                          </div>
                          <div className="mt-1 p-2 bg-brand-purple/10 rounded-full text-brand-purple shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-[var(--foreground)] text-sm mb-1">{formData.fullName || "Recipient Name"}</p>
                            <p className="font-medium text-[var(--foreground)]/80 text-sm">{formData.address || "Enter address details below"}</p>
                            <p className="text-xs text-[var(--foreground)]/60 mt-1">
                              {formData.city} {formData.state ? `, ${formData.state}` : ''} {formData.pincode ? `- ${formData.pincode}` : ''}
                            </p>
                            <p className="text-xs text-[var(--foreground)]/60 uppercase tracking-wider mt-1 font-semibold">{formData.country}</p>
                            <p className="text-xs text-[var(--foreground)]/70 mt-2 flex items-center gap-1">
                               <span className="font-semibold">Phone:</span> {formData.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-heading font-bold text-[color:var(--foreground)] mb-6 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-gray-400" />
                        Delivery Details
                      </h2>
                      
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                           <label className="text-xs font-medium text-[var(--foreground)]/70 ml-1">Full Name</label>
                           <input
                            type="text"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-medium text-[var(--foreground)]/70 ml-1">Email Address</label>
                           <input
                            type="email"
                            name="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                           <label className="text-xs font-medium text-[var(--foreground)]/70 ml-1">Phone Number</label>
                           <input
                            type="tel"
                            name="phone"
                            placeholder="10-digit mobile number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{10}"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                           <label className="text-xs font-medium text-[var(--foreground)]/70 ml-1">Address (Area and Street)</label>
                           <textarea
                            name="address"
                            placeholder="Flat / House No / Floor / Building"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all resize-none"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[var(--foreground)]/70 ml-1">Country</label>
                          <div className="relative">
                            <select
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] appearance-none transition-all"
                            >
                              {availableCountries.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                              <ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs font-medium text-[var(--foreground)]/70 ml-1">State</label>
                           {formData.country === 'India' ? (
                            <div className="relative">
                              <select
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] appearance-none transition-all"
                              >
                                <option value="">Select State</option>
                                {indianStates.map((s) => (
                                  <option key={s.state} value={s.state}>
                                    {s.state}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <ChevronRight className="w-4 h-4 rotate-90" />
                              </div>
                            </div>
                          ) : (
                            <input
                              type="text"
                              name="state"
                              placeholder="State/Province"
                              value={formData.state}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all"
                            />
                          )}
                        </div>

                        <div className="space-y-1">
                           <label className="text-xs font-medium text-[var(--foreground)]/70 ml-1">City</label>
                           <input
                            type="text"
                            name="city"
                            placeholder="City / District / Town"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all"
                          />
                        </div>
                      
                        <div className="space-y-1">
                           <label className="text-xs font-medium text-[var(--foreground)]/70 ml-1">Pincode</label>
                           <input
                            type="text"
                            name="pincode"
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-brand-purple text-white rounded-xl font-bold text-lg shadow-xl shadow-brand-purple/20 hover:bg-brand-purple/90 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-8"
                    >
                      {validating ? (
                        <>Checking delivery area...</>
                      ) : (
                         <>Continue to Payment <ChevronRight className="w-5 h-5" /></>
                      )}
                    </button>

                    {invalidItems.length > 0 && (
                      <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/50 flex gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full h-fit text-red-600">
                           <X className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">
                            Some items cannot be delivered to {formData.state}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400/80 mb-3">
                            Please remove them to proceed or change the delivery address.
                          </p>
                          <ul className="space-y-2">
                            {invalidItems.map(item => (
                              <li key={String(item.id)} className="flex items-center justify-between text-sm bg-white dark:bg-zinc-900 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                                <span className="text-red-800 dark:text-red-200 font-medium">{item.name}</span>
                                {onRemoveItem && (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.id)}
                                    className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-bold transition-colors"
                                  >
                                    Remove
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handlePlaceOrder} className="space-y-6">
                    <h2 className="text-xl font-heading font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                       <Wallet className="w-5 h-5 text-gray-400" />
                       Payment Method
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        type="button"
                        onClick={() => setPaymentMethod('cashfree')}
                        className={`p-5 border-2 rounded-2xl transition-all relative overflow-hidden group text-left ${
                          paymentMethod === 'cashfree'
                            ? 'border-brand-purple bg-brand-purple/5 ring-1 ring-brand-purple shadow-lg shadow-brand-purple/10'
                            : 'border-gray-200 dark:border-zinc-700 hover:border-brand-purple/50 hover:bg-gray-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {paymentMethod === 'cashfree' && (
                           <div className="absolute top-3 right-3 text-brand-purple">
                             <CheckCircle2 className="w-5 h-5" />
                           </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                          paymentMethod === 'cashfree' ? 'bg-brand-purple text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                        }`}>
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <p className={`font-bold text-lg mb-1 ${paymentMethod === 'cashfree' ? 'text-brand-purple' : 'text-[var(--foreground)]'}`}>
                          Cashfree
                        </p>
                        <p className="text-xs text-[var(--foreground)]/60">
                          Cards, UPI, NetBanking, Wallets
                        </p>
                      </motion.button>

                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        type="button"
                        onClick={() => setPaymentMethod('razorpay')}
                        className={`p-5 border-2 rounded-2xl transition-all relative overflow-hidden group text-left ${
                          paymentMethod === 'razorpay'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10 ring-1 ring-blue-600 shadow-lg shadow-blue-600/10'
                            : 'border-gray-200 dark:border-zinc-700 hover:border-blue-400/50 hover:bg-gray-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                         {paymentMethod === 'razorpay' && (
                           <div className="absolute top-3 right-3 text-blue-600">
                             <CheckCircle2 className="w-5 h-5" />
                           </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                          paymentMethod === 'razorpay' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                        }`}>
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <p className={`font-bold text-lg mb-1 ${paymentMethod === 'razorpay' ? 'text-blue-600' : 'text-[var(--foreground)]'}`}>
                          Razorpay
                        </p>
                        <p className="text-xs text-[var(--foreground)]/60">
                          Secure Payment Gateway
                        </p>
                      </motion.button>
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 text-center border border-gray-100 dark:border-zinc-700">
                       <p className="text-sm text-[var(--foreground)]/70 mb-2">
                         You will be redirected to the secure payment gateway to complete your purchase of
                       </p>
                       <p className="text-3xl font-bold text-brand-purple font-heading">
                         <Rupee />{total.toFixed(2)}
                       </p>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-bold"
                      >
                        Back to Address
                      </button>
                      <button
                        type="submit"
                        disabled={validItems.length === 0 || isSubmitting}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                          validItems.length === 0 || isSubmitting
                            ? 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-brand-purple text-white hover:bg-brand-purple/90 shadow-brand-purple/25 hover:scale-[1.02]'
                        }`}
                      >
                        {isSubmitting ? (
                          <>Processing...</>
                        ) : (
                          <>Pay Now <ChevronRight className="w-5 h-5" /></>
                        )}
                      </button>
                    </div>

                    {checkoutError && (
                      <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-center font-medium">
                        {checkoutError}
                      </div>
                    )}
                  </form>
                )}
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 lg:sticky lg:top-24 shadow-sm"
            >
              <h2 className="text-xl font-heading font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-400" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => {
                  const summaryItem = orderSummary.items.find(si => String(si.productId) === String(item.id))
                  return (
                  <div key={item._uniqueId || item.id} className="flex gap-4 group">
                    <div className="relative shrink-0">
                      <FallbackImage
                        src={item.image}
                        alt={item.name}
                        width={72}
                        height={72}
                        className="object-cover rounded-xl w-[72px] h-[72px] border border-gray-100 dark:border-zinc-800"
                      />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                         {item.quantity ?? 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[var(--foreground)] line-clamp-2 leading-tight mb-1 group-hover:text-brand-purple transition-colors">
                        {item.name}
                      </h3>
                      
                      {item.appliedOffer && (
                        <div className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded w-fit font-bold mb-1">
                          {item.appliedOffer.name} 
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-xs text-[var(--foreground)]/60 mb-1">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedColor && (
                            <span className="flex items-center gap-1">
                              Color: <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ background: item.selectedColor }} />
                            </span>
                          )}
                      </div>

                      <p className={`text-sm font-bold ${ (item.stock ?? 0) <= 0 ? 'text-gray-400 line-through' : 'text-[var(--foreground)]' }`}>
                        <Rupee />{(item.price * (item.quantity ?? 1)).toFixed(2)}
                      </p>
                      {(item.stock ?? 0) <= 0 && (
                        <span className="text-xs text-red-600 font-bold">Out of Stock</span>
                      )}
                    </div>
                  </div>
                )})}
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-zinc-700 pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/70">Subtotal</span>
                  <span className="font-bold text-[var(--foreground)]"><Rupee />{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Platform Fees</span>
                  <span className="font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Packaging Fees</span>
                  <span className="font-bold">FREE</span>
                </div>

                {formData.country === 'India' && (
                  orderSummary.taxBreakdown.igst > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--foreground)]/70">IGST</span>
                      <span className="font-bold text-[var(--foreground)]"><Rupee />{orderSummary.taxBreakdown.igst.toFixed(2)}</span>
                    </div>
                  ) : (orderSummary.taxBreakdown.cgst > 0 || orderSummary.taxBreakdown.sgst > 0) ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--foreground)]/70">CGST</span>
                        <span className="font-bold text-[var(--foreground)]"><Rupee />{orderSummary.taxBreakdown.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--foreground)]/70">SGST</span>
                        <span className="font-bold text-[var(--foreground)]"><Rupee />{orderSummary.taxBreakdown.sgst.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--foreground)]/70">Tax</span>
                      <span className="font-bold text-[var(--foreground)]"><Rupee />{tax.toFixed(2)}</span>
                    </div>
                  )
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/70">Delivery Fee</span>
                  <span className={`font-bold ${deliveryFee > 0 ? 'text-[var(--foreground)]' : 'text-green-600'}`}>
                    {deliveryFee > 0 ? <><Rupee />{deliveryFee}</> : 'FREE'}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-end">
                  <span className="font-heading font-bold text-[var(--foreground)] text-lg">
                    Total Pay
                  </span>
                  <span className="font-heading font-bold text-brand-purple text-2xl">
                    <Rupee />{total.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-sm text-[var(--foreground)]">Safe & Secure Payment</span>
                </div>
                <p className="text-xs text-[var(--foreground)]/60 ml-8">
                  Your payment information is encrypted and processed securely.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--background)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-5 border-b border-[var(--foreground)]/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-purple" />
                  Select Delivery Address
                </h3>
                <button 
                  onClick={() => setShowAddressModal(false)}
                  className="p-2 hover:bg-[var(--foreground)]/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <button
                  onClick={handleAddNewAddress}
                  className="w-full p-4 border-2 border-dashed border-[var(--foreground)]/20 rounded-2xl flex items-center gap-4 hover:border-brand-purple hover:bg-brand-purple/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold block group-hover:text-brand-purple transition-colors text-lg">Add New Address</span>
                    <span className="text-sm text-[var(--foreground)]/60">Enter a new delivery location</span>
                  </div>
                </button>

                {(user as any)?.addresses?.map((addr: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAddress(addr)}
                    className={`w-full p-4 border rounded-2xl flex items-start gap-4 transition-all text-left relative overflow-hidden group ${
                      formData.address === addr.address
                        ? 'border-brand-purple bg-brand-purple/5 ring-1 ring-brand-purple' 
                        : 'border-[var(--foreground)]/10 hover:border-brand-purple/50 hover:bg-[var(--foreground)]/5'
                    }`}
                  >
                    {formData.address === addr.address && (
                      <div className="absolute top-0 right-0 p-2 bg-brand-purple rounded-bl-2xl">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`mt-1 p-2 rounded-full shrink-0 ${formData.address === addr.address ? 'bg-brand-purple text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--foreground)] mb-1 flex items-center gap-2 text-base">
                        {addr.type || "Home"}
                        {addr.isDefault && <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700">Default</span>}
                      </div>
                      <p className="text-sm text-[var(--foreground)]/80 line-clamp-2 mb-1">{addr.address}</p>
                      <p className="text-sm text-[var(--foreground)]/60 font-medium">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-[var(--foreground)]/40 mt-1 uppercase tracking-wider font-bold">{addr.country || 'India'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Checkout
