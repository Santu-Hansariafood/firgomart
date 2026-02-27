'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  CreditCard,
  MapPin,
  Plus,
  Minus,
  ChevronRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  X,
  Wallet,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react'
import { fadeInUp } from '@/utils/animations/animations'
import FallbackImage from '@/components/common/Image/FallbackImage'
import BackButton from '@/components/common/BackButton/BackButton'
import countryData from '@/data/country.json'
import { CartItem } from '@/types/checkout'
import { useCheckoutForm } from '@/hooks/checkout/useCheckoutForm'
import { useOrderSummary } from '@/hooks/checkout/useOrderSummary'
import { useDeliveryValidation } from '@/hooks/checkout/useDeliveryValidation'
import { usePayment } from '@/hooks/checkout/usePayment'
import { useGeolocation } from '@/hooks/product-grid/useGeolocation'
import { getCurrencyForCountry, getMaxQuantity } from '@/utils/productUtils'

type PaymentProvider = 'cashfree' | 'razorpay'

const usePaymentGatewayMeta = (paymentMethod: PaymentProvider) => {
  const label = paymentMethod === 'razorpay' ? 'Razorpay' : 'Cashfree'
  return { label }
}

const useCheckoutDerivedState = (cartItems: CartItem[], paymentMethod: PaymentProvider) => {
  const validItems = cartItems.filter(item => (item.stock ?? 0) > 0)
  const gatewayMeta = usePaymentGatewayMeta(paymentMethod)
  const indianStates = countryData.countries.find(c => c.country === "India")?.states || []
  const availableCountries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Other"]
  return { validItems, gatewayMeta, indianStates, availableCountries }
}

interface PaymentGatewayOptionsProps {
  paymentMethod: PaymentProvider
  setPaymentMethod: (method: PaymentProvider) => void
}

const PaymentGatewayOptions: React.FC<PaymentGatewayOptionsProps> = ({
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        type="button"
        onClick={() => setPaymentMethod('cashfree')}
        className={`relative flex flex-col items-center justify-center rounded-2xl py-3 sm:py-4 transition-all text-center border ${
          paymentMethod === 'cashfree'
            ? 'bg-white shadow-md shadow-brand-purple/20 scale-[1.02] border-brand-purple/40 ring-2 ring-brand-purple/30'
            : 'bg-gray-50 dark:bg-zinc-900 hover:bg-white hover:shadow-sm hover:scale-[1.01] border-gray-200 dark:border-zinc-800'
        }`}
      >
        {paymentMethod === 'cashfree' && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-purple text-white flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 shadow-sm">
          <Image
            src="/logo/cashfree.svg"
            alt="Cashfree"
            width={72}
            height={72}
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
          />
        </div>
        <span className="sr-only">Cashfree</span>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        type="button"
        onClick={() => setPaymentMethod('razorpay')}
        className={`relative flex flex-col items-center justify-center rounded-2xl py-3 sm:py-4 transition-all text-center border ${
          paymentMethod === 'razorpay'
            ? 'bg-white shadow-md shadow-brand-purple/20 scale-[1.02] border-brand-purple/40 ring-2 ring-brand-purple/30'
            : 'bg-gray-50 dark:bg-zinc-900 hover:bg-white hover:shadow-sm hover:scale-[1.01] border-gray-200 dark:border-zinc-800'
        }`}
      >
        {paymentMethod === 'razorpay' && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-purple text-white flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 shadow-sm">
          <Image
            src="/logo/razorpay.svg"
            alt="Razorpay"
            width={72}
            height={72}
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
          />
        </div>
        <span className="sr-only">Razorpay</span>
      </motion.button>
    </div>
  )
}

const Rupee: React.FC<{ className?: string }> = ({ className }) => {
  const { countryCode } = useGeolocation()
  const currency = getCurrencyForCountry(countryCode)
  return (
    <span
      className={className}
      style={{
        fontFamily:
          'system-ui, "Segoe UI Symbol", "Noto Sans", "Arial Unicode MS", sans-serif'
      }}
    >
      {currency.symbol}
    </span>
  )
}

interface CheckoutProps {
  cartItems: CartItem[]
  onUpdateQuantity?: (id: number | string, quantity: number) => void
  onRemoveItem?: (id: number | string) => void
}

const Checkout: React.FC<CheckoutProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [step, setStep] = useState<number>(1)
  
  const {
    formData,
    handleChange,
    handleSelectAddress,
    handleAddNewAddress,
    showAddressModal,
    setShowAddressModal,
    user
  } = useCheckoutForm()

  const [promoInput, setPromoInput] = useState<string>("")
  const [appliedPromo, setAppliedPromo] = useState<string>("")
  const [promoError, setPromoError] = useState<string>("")

  const {
    deliveryFee,
    orderSummary,
    subtotal,
    tax,
    total
  } = useOrderSummary({ cartItems, formData, promoCode: appliedPromo })

  const {
    invalidItems,
    validating,
    validateDelivery
  } = useDeliveryValidation({ cartItems })

  const {
    paymentMethod,
    setPaymentMethod,
    orderPlaced,
    lastOrder,
    checkoutError,
    isSubmitting,
    handlePlaceOrder,
    router
  } = usePayment({ cartItems, formData, total, onRemoveItem, promoCode: appliedPromo })

  const {
    validItems,
    gatewayMeta,
    indianStates,
    availableCountries
  } = useCheckoutDerivedState(cartItems, paymentMethod as PaymentProvider)

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
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative z-10"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              transition={{ delay: 0.4, duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0 border-2 border-green-500/30 rounded-full"
            />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--foreground)] mb-3">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          
          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-zinc-700/50">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Order ID</p>
            <p className="text-lg sm:text-xl font-mono font-bold text-[var(--foreground)] tracking-wide break-all">
              {lastOrder?.orderNumber || lastOrder?.id || ""}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {lastOrder?.id && (
              <a
                href={`/api/orders/${encodeURIComponent(lastOrder.id)}/receipt?download=true`}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 border border-gray-200 dark:border-zinc-700 text-[var(--foreground)] rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Download Receipt
              </a>
            )}
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-brand-purple text-white rounded-xl font-medium hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/25 flex items-center justify-center gap-2 group text-sm sm:text-base"
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
    <div className="min-h-screen bg-[var(--background)] pt-4 sm:pt-8 pb-24 sm:pb-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
             <button onClick={() => router.push('/cart')} className="p-2 hover:bg-[var(--foreground)]/5 rounded-full transition-colors">
               <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--foreground)]" />
             </button>
             <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--foreground)]">Checkout</h1>
          </div>
          
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

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-8 order-2 lg:order-1">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="md:hidden p-3 sm:p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="font-bold text-[var(--foreground)] text-sm sm:text-base">
                  {step === 1 ? 'Shipping Address' : 'Payment Method'}
                </span>
                <span className="text-[10px] sm:text-xs font-medium px-2 py-1 bg-[var(--foreground)]/10 rounded text-[var(--foreground)]">
                  Step {step} of 2
                </span>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                {step === 1 && (
                  <form
                    id="checkout-address-form"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const ok = await validateDelivery(formData.state)
                      if (ok) setStep(2)
                    }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {(user as any)?.addresses?.length > 0 && (
                      <div className="p-4 sm:p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                           <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 text-sm sm:text-base">
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
                        
                        <div className="p-3 sm:p-4 bg-white dark:bg-zinc-800 rounded-xl border border-blue-200 dark:border-blue-800/30 flex items-start gap-3 sm:gap-4 relative overflow-hidden shadow-sm">
                          <div className="absolute top-0 right-0 px-2 sm:px-3 py-1 bg-brand-purple text-white text-[10px] font-bold rounded-bl-xl shadow-sm">
                            SELECTED
                          </div>
                          <div className="mt-1 p-1.5 sm:p-2 bg-brand-purple/10 rounded-full text-brand-purple shrink-0">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-[var(--foreground)] text-sm mb-1">{formData.fullName || "Recipient Name"}</p>
                            <p className="font-medium text-[var(--foreground)]/80 text-xs sm:text-sm">{formData.address || "Enter address details below"}</p>
                            <p className="text-[10px] sm:text-xs text-[var(--foreground)]/60 mt-1">
                              {formData.city} {formData.state ? `, ${formData.state}` : ''} {formData.pincode ? `- ${formData.pincode}` : ''}
                            </p>
                            <p className="text-[10px] sm:text-xs text-[var(--foreground)]/60 uppercase tracking-wider mt-1 font-semibold">{formData.country}</p>
                            <p className="text-[10px] sm:text-xs text-[var(--foreground)]/70 mt-2 flex items-center gap-1">
                               <span className="font-semibold">Phone:</span> {formData.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(((user as any)?.addresses?.length ?? 0) === 0) && (
                    <div>
                      <h2 className="text-lg sm:text-xl font-heading font-bold text-[color:var(--foreground)] mb-4 sm:mb-6 flex items-center gap-2">
                        <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        Delivery Details
                      </h2>
                      
                      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-1">
                           <label className="text-xs font-medium text-[var(--foreground)]/70 ml-1">Full Name</label>
                           <input
                            type="text"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all text-sm sm:text-base"
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
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all text-sm sm:text-base"
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
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all text-sm sm:text-base"
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
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all resize-none text-sm sm:text-base"
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
                              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] appearance-none transition-all text-sm sm:text-base"
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
                          {formData.country !== 'India' && (
                            <div className="mt-2 p-3 bg-brand-purple/5 border border-brand-purple/10 rounded-xl">
                              <p className="text-[10px] sm:text-xs text-brand-purple font-medium flex items-center gap-1.5">
                                <Truck className="w-3 h-3" />
                                Estimated Delivery: 7-12 Working Days
                              </p>
                              <p className="text-[9px] sm:text-[10px] text-foreground/50 mt-1 leading-tight">
                                Timeline may vary based on destination and customs clearance.
                              </p>
                            </div>
                          )}
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
                                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] appearance-none transition-all text-sm sm:text-base"
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
                              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all text-sm sm:text-base"
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
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all text-sm sm:text-base"
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
                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 bg-gray-50 dark:bg-zinc-800 text-[var(--foreground)] transition-all text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>
                    )}

                    <button
                      type="submit"
                      className="hidden md:flex w-full py-3 sm:py-4 bg-brand-purple text-white rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-brand-purple/20 hover:bg-brand-purple/90 transition-all hover:scale-[1.01] active:scale-[0.99] items-center justify-center gap-2 mt-6 sm:mt-8"
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
                  <form onSubmit={handlePlaceOrder} className="space-y-4 sm:space-y-6">
                    <h2 className="text-lg sm:text-xl font-heading font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                       <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                       Payment Method
                    </h2>
                    
                    <PaymentGatewayOptions
                      paymentMethod={paymentMethod as PaymentProvider}
                      setPaymentMethod={setPaymentMethod as (method: PaymentProvider) => void}
                    />

                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 sm:p-6 text-center border border-gray-100 dark:border-zinc-700">
                       <p className="text-xs sm:text-sm text-[var(--foreground)]/70 mb-2">
                         You will be redirected to our secure payment gateway to complete your purchase of
                       </p>
                       <p className="text-2xl sm:text-3xl font-bold text-brand-purple font-heading">
                         <Rupee />{total.toFixed(2)}
                       </p>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 sm:py-4 inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-bold text-sm sm:text-base"
                      >
                        Back to Address
                      </button>
                      <button
                        type="submit"
                        disabled={validItems.length === 0 || isSubmitting}
                        className={`flex-1 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
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

          <div className="lg:col-span-4 order-1 lg:order-2">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-6 mb-6 lg:mb-0 lg:sticky lg:top-24 shadow-sm"
            >
              <h2 className="text-lg sm:text-xl font-heading font-bold text-[var(--foreground)] mb-4 sm:mb-6 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 pt-2 custom-scrollbar">
                {cartItems.map((item) => {
                  const summaryItem = orderSummary.items.find(si => String(si.productId) === String(item.id))
                  const quantity = item.quantity ?? 1
                  const stock = summaryItem?.stock ?? item.stock ?? 0
                  const maxQty = getMaxQuantity(item.price)
                  const effectiveMax = Math.min(maxQty, stock > 0 ? stock : maxQty)
                  const isOutOfStock = stock <= 0
                  const canIncrease = !!onUpdateQuantity && !isOutOfStock && quantity < effectiveMax

                  return (
                  <div key={item._uniqueId || item.id} className="flex gap-3 sm:gap-4 group">
                    <div className="relative shrink-0">
                      <FallbackImage
                        src={item.image}
                        alt={item.name}
                        width={72}
                        height={72}
                        className="object-cover rounded-xl w-14 h-14 sm:w-[72px] sm:h-[72px] border border-gray-100 dark:border-zinc-800"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-brand-purple text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                         {quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] line-clamp-2 leading-tight mb-1 group-hover:text-brand-purple transition-colors">
                        {item.name}
                      </h3>
                      
                      {item.appliedOffer && (
                        <div className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded w-fit font-bold mb-1">
                          {item.appliedOffer.name} 
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-[var(--foreground)]/60 mb-1">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedColor && (
                            <span className="flex items-center gap-1">
                              Color: <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ background: item.selectedColor }} />
                            </span>
                          )}
                          {summaryItem?.gstPercent !== undefined && (
                            <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700 font-medium">
                              GST: {summaryItem.gstPercent}%
                            </span>
                          )}
                      </div>

                      <p className={`text-xs sm:text-sm font-bold ${ (item.stock ?? 0) <= 0 ? 'text-gray-400 line-through' : 'text-[var(--foreground)]' }`}>
                        <Rupee />{(item.price * quantity).toFixed(2)}
                      </p>
                      {(item.stock ?? 0) <= 0 && (
                        <span className="text-[10px] sm:text-xs text-red-600 font-bold">Out of Stock</span>
                      )}

                      <div className="mt-2 inline-flex items-center bg-[var(--foreground)]/5 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (!onUpdateQuantity) return
                            const next = quantity - 1
                            const id = item._uniqueId || item.id
                            if (next <= 0) {
                              onUpdateQuantity(id, 0)
                            } else {
                              onUpdateQuantity(id, next)
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-black/20 text-[var(--foreground)] transition-shadow shadow-sm"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!onUpdateQuantity || !canIncrease) return
                            const id = item._uniqueId || item.id
                            const next = quantity + 1
                            onUpdateQuantity(id, Math.min(effectiveMax, next))
                          }}
                          disabled={!canIncrease}
                          className={`w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-black/20 text-[var(--foreground)] transition-shadow shadow-sm ${!canIncrease ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-zinc-700 pt-6 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError("") }}
                    placeholder="Enter 10-character promo code"
                    maxLength={10}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const code = (promoInput || "").trim().toUpperCase()
                      if (!/^[A-Z0-9]{10}$/.test(code)) {
                        setPromoError("Invalid code format")
                        return
                      }
                      setAppliedPromo(code)
                      setPromoError("")
                    }}
                    className="px-4 py-2 rounded-lg bg-brand-purple text-white font-bold text-sm hover:bg-brand-purple/90"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <div className="text-xs text-red-600 font-bold">{promoError}</div>
                )}
                {orderSummary.promo && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-700 dark:text-green-400">
                    <span>Promo ({orderSummary.promo.code})</span>
                    <span className="font-bold">-<Rupee />{orderSummary.promo.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[var(--foreground)]/70">Subtotal</span>
                  <span className="font-bold text-[var(--foreground)]"><Rupee />{subtotal.toFixed(2)}</span>
                </div>

                {formData.country === 'India' && (
                  <>
                    {orderSummary.taxBreakdown.cgst > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-[var(--foreground)]/70">
                          CGST {(() => {
                            const percents = Array.from(new Set(orderSummary.items.map(i => i.gstPercent || 0)))
                            return percents.length === 1 ? `(${percents[0] / 2}%)` : ''
                          })()}
                        </span>
                        <span className="font-bold text-[var(--foreground)]"><Rupee />{orderSummary.taxBreakdown.cgst.toFixed(2)}</span>
                      </div>
                    )}
                    {orderSummary.taxBreakdown.sgst > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-[var(--foreground)]/70">
                          SGST {(() => {
                            const percents = Array.from(new Set(orderSummary.items.map(i => i.gstPercent || 0)))
                            return percents.length === 1 ? `(${percents[0] / 2}%)` : ''
                          })()}
                        </span>
                        <span className="font-bold text-[var(--foreground)]"><Rupee />{orderSummary.taxBreakdown.sgst.toFixed(2)}</span>
                      </div>
                    )}
                    {orderSummary.taxBreakdown.igst > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-[var(--foreground)]/70">
                          IGST {(() => {
                            const percents = Array.from(new Set(orderSummary.items.map(i => i.gstPercent || 0)))
                            return percents.length === 1 ? `(${percents[0]}%)` : ''
                          })()}
                        </span>
                        <span className="font-bold text-[var(--foreground)]"><Rupee />{orderSummary.taxBreakdown.igst.toFixed(2)}</span>
                      </div>
                    )}
                    {orderSummary.taxBreakdown.igst === 0 && orderSummary.taxBreakdown.cgst === 0 && orderSummary.taxBreakdown.sgst === 0 && tax > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-[var(--foreground)]/70">Tax</span>
                        <span className="font-bold text-[var(--foreground)]"><Rupee />{tax.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[var(--foreground)]/70">Delivery Fee</span>
                  <span className={`font-bold ${deliveryFee > 0 ? 'text-[var(--foreground)]' : 'text-green-600'}`}>
                    {deliveryFee > 0 ? <><Rupee />{deliveryFee}</> : 'FREE'}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs sm:text-sm text-green-600 dark:text-green-400">
                  <span>Platform Fees</span>
                  <span className="font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-green-600 dark:text-green-400">
                  <span>Packaging Fees</span>
                  <span className="font-bold">FREE</span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-end">
                  <span className="font-heading font-bold text-[var(--foreground)] text-base sm:text-lg">
                    Total Pay
                  </span>
                  <span className="font-heading font-bold text-brand-purple text-xl sm:text-2xl">
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

        {step === 1 && (
          <div className="md:hidden mt-6 pb-6">
            <button
              type="submit"
              form="checkout-address-form"
              className="w-full py-3 sm:py-4 bg-brand-purple text-white rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-brand-purple/20 hover:bg-brand-purple/90 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {validating ? (
                <>Checking delivery area...</>
              ) : (
                 <>Continue to Payment <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--background)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-4 sm:p-5 border-b border-[var(--foreground)]/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
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
              
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                <button
                  onClick={handleAddNewAddress}
                  className="w-full p-3 sm:p-4 border-2 border-dashed border-[var(--foreground)]/20 rounded-2xl flex items-center gap-4 hover:border-brand-purple hover:bg-brand-purple/5 transition-all group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold block group-hover:text-brand-purple transition-colors text-base sm:text-lg">Add New Address</span>
                    <span className="text-xs sm:text-sm text-[var(--foreground)]/60">Enter a new delivery location</span>
                  </div>
                </button>

                {(user as any)?.addresses?.map((addr: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAddress(addr)}
                    className={`w-full p-3 sm:p-4 border rounded-2xl flex items-start gap-3 sm:gap-4 transition-all text-left relative overflow-hidden group ${
                      formData.address === addr.address
                        ? 'border-brand-purple bg-brand-purple/5 ring-1 ring-brand-purple' 
                        : 'border-[var(--foreground)]/10 hover:border-brand-purple/50 hover:bg-[var(--foreground)]/5'
                    }`}
                  >
                    {formData.address === addr.address && (
                      <div className="absolute top-0 right-0 p-1.5 sm:p-2 bg-brand-purple rounded-bl-2xl">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                    <div className={`mt-1 p-1.5 sm:p-2 rounded-full shrink-0 ${formData.address === addr.address ? 'bg-brand-purple text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--foreground)] mb-1 flex items-center gap-2 text-sm sm:text-base">
                        {addr.type || "Home"}
                        {addr.isDefault && <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700">Default</span>}
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--foreground)]/80 line-clamp-2 mb-1">{addr.address}</p>
                      <p className="text-xs sm:text-sm text-[var(--foreground)]/60 font-medium">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-[10px] sm:text-xs text-[var(--foreground)]/40 mt-1 uppercase tracking-wider font-bold">{addr.country || 'India'}</p>
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
