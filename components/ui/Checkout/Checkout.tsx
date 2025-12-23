'use client'

import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  MapPin,
  CheckCircle,
  QrCode,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fadeInUp } from '@/utils/animations/animations'
import FallbackImage from '@/components/common/Image/FallbackImage'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/common/BackButton/BackButton'

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  originalPrice?: number
  quantity?: number
}

interface CheckoutProps {
  cartItems: CartItem[]
  onUpdateQuantity?: (id: number, quantity: number) => void
  onRemoveItem?: (id: number) => void
}

interface FormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('card')
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })
  const [invalidItems, setInvalidItems] = useState<Array<{ id: number; name: string }>>([])
  const [validating, setValidating] = useState<boolean>(false)

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
      }))
    } catch {}
  }, [])
  useEffect(() => {
    if (!user) return
    setFormData(prev => ({
      ...prev,
      fullName: user.name || prev.fullName,
      email: user.email || prev.email,
      phone: user.mobile || prev.phone,
      address: user.address || prev.address,
      city: user.city || prev.city,
      state: user.state || prev.state,
      pincode: user.pincode || prev.pincode,
    }))
    try {
      if (user.state) localStorage.setItem('deliverToState', user.state)
    } catch {}
  }, [user])

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
      const data = await res.json()
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity ?? 1),
    0
  )
  const tax = subtotal * 0.18
  const total = subtotal + tax

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const payload = {
        buyerEmail: formData.email,
        buyerName: formData.fullName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: "IN",
        items: cartItems.map(ci => ({ id: ci.id, quantity: ci.quantity ?? 1 })),
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.productId) {
          const pid = Number(data.productId)
          if (onRemoveItem) onRemoveItem(pid)
        }
        return
      }
      setOrderPlaced(true)
      setLastOrder({ id: String(data?.order?.id || ""), orderNumber: String(data?.order?.orderNumber || "") })
      if (onRemoveItem) {
        cartItems.forEach(ci => onRemoveItem(ci.id))
      }
    } catch {}
  }

  // ORDER SUCCESS PAGE
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-2">
            Order ID: {lastOrder?.orderNumber || lastOrder?.id || ""}
          </p>
          <p className="text-gray-600 mb-6">
            Your order will be delivered within 3-5 business days.
          </p>
          {lastOrder?.id && (
            <a
              href={`/api/orders/${encodeURIComponent(lastOrder.id)}/receipt?download=true`}
              className="inline-block mb-4 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Download Receipt
            </a>
          )}
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <BackButton href="/" className="mb-6" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Section */}
          <div className="lg:col-span-2">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              className="bg-white border rounded-xl p-6"
            >
              {/* Progress Bar */}
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 h-1 bg-gray-200">
                  <div
                    className={`h-full bg-blue-600 transition-all ${
                      step >= 2 ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= 2
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              {/* Step 1: Address */}
              {step === 1 && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const ok = await validateDelivery(formData.state)
                    if (ok) setStep(2)
                  }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                    Delivery Address
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name *"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <textarea
                    name="address"
                    placeholder="Address *"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City *"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State *"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode *"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{6}"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all"
                  >
                    {validating ? 'Checking delivery...' : 'Continue to Payment'}
                  </button>

                  {invalidItems.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50">
                      <p className="text-sm text-red-700 mb-2">
                        Some items cannot be delivered to <strong>{formData.state}</strong>.
                        Remove them or change the delivery state.
                      </p>
                      <ul className="space-y-2">
                        {invalidItems.map(item => (
                          <li key={String(item.id)} className="flex items-center justify-between">
                            <span className="text-sm text-red-800">{item.name}</span>
                            {onRemoveItem && (
                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Remove
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </form>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                    Payment Details
                  </h2>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                      Select Payment Method
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'card'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard
                          className={`w-6 h-6 mx-auto mb-2 ${
                            paymentMethod === 'card'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <p
                          className={`text-sm font-medium ${
                            paymentMethod === 'card'
                              ? 'text-blue-600'
                              : 'text-gray-600'
                          }`}
                        >
                          Card Payment
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('qr')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'qr'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <QrCode
                          className={`w-6 h-6 mx-auto mb-2 ${
                            paymentMethod === 'qr'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <p
                          className={`text-sm font-medium ${
                            paymentMethod === 'qr'
                              ? 'text-blue-600'
                              : 'text-gray-600'
                          }`}
                        >
                          QR Code
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Conditional Payment UI */}
                  {paymentMethod === 'card' ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="Card Number *"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{16}"
                        maxLength={16}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <input
                        type="text"
                        name="cardName"
                        placeholder="Cardholder Name *"
                        value={formData.cardName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY *"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          required
                          pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                          maxLength={5}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          name="cvv"
                          placeholder="CVV *"
                          value={formData.cvv}
                          onChange={handleChange}
                          required
                          pattern="[0-9]{3}"
                          maxLength={3}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="bg-white inline-block p-4 rounded-lg shadow-md mb-4">
                          <div className="w-48 h-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <QrCode className="w-32 h-32 text-white" />
                          </div>
                        </div>
                        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                          Scan QR Code to Pay
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Use any UPI app to scan and complete payment
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          ₹{total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-4">
                          Order ID: #ORD{Math.floor(Math.random() * 1000000)}
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 text-center">
                          <strong>Note:</strong> After successful payment, click
                          &quot;Place Order&quot; to confirm your purchase.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 inline-flex items-center justify-center rounded-lg border bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-linear-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all"
                    >
                      Place Order
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              className="bg-white border rounded-xl p-6 sticky top-24"
            >
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex space-x-3">
                    <FallbackImage
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-cover rounded-lg w-16 h-16"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity ?? 1}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        ₹{item.price * (item.quantity ?? 1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Delivery</span>
                  <span className="font-medium">FREE</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="font-heading font-bold text-gray-900">
                    Total
                  </span>
                  <span className="font-heading font-bold text-gray-900 text-xl">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
