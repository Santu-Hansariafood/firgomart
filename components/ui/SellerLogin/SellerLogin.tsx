'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Phone, ShieldCheck, RefreshCw, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const SellerLogin: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/seller/profile'
  const { login } = useAuth()

  const [mobile, setMobile] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Consent Popup State
  const [showConsent, setShowConsent] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [pendingSeller, setPendingSeller] = useState<any>(null)

  const requestOtp = async () => {
    setError('')
    if (!/^\d{10}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/seller/login/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Request failed')
      } else {
        if (typeof data?.otp === 'string') setGeneratedOtp(data.otp)
        setOtpSent(true)
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setError('')
    if (!/^\d{6}$/.test(enteredOtp)) {
      setError('Enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/seller/login/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, otp: enteredOtp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Verification failed')
        setLoading(false)
      } else {
        // Instead of logging in immediately, show consent popup
        setPendingSeller(data.seller)
        setLoading(false)
        setShowConsent(true)
      }
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  const completeLogin = async () => {
    if (!pendingSeller) return
    
    setLoading(true)
    try {
      const s = pendingSeller
      const user: Parameters<typeof login>[0] = {
        id: s?.id || Date.now(),
        email: s?.email || `${mobile}@seller.local`,
        name: s?.name || 'Seller',
        role: 'seller',
      }
      await login(user)
      router.push(next)
    } catch (err) {
      console.error(err)
      setError('Login failed during final step')
      setLoading(false)
    }
  }

  const resendOtp = () => {
    setEnteredOtp('')
    requestOtp()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-linear-to-r from-brand-purple to-brand-red p-6 text-white">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6" />
              <h1 className="text-2xl font-heading font-bold">Seller Login (OTP)</h1>
            </div>
            <p className="text-white/80 mt-1">Secure login using your mobile number</p>
          </div>

          <div className="p-6 space-y-5">
            {!otpSent ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  onClick={requestOtp}
                  disabled={loading}
                  className="w-full bg-linear-to-r from-brand-purple to-brand-red text-white py-3 rounded-lg font-medium hover:from-brand-purple/90 hover:to-brand-red/90 transition disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Request OTP'}
                </button>
                <p className="text-xs text-gray-500">
                  Demo note: No SMS is sent. A sample OTP will be shown.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedOtp && (
                  <div className="bg-brand-purple/10 border border-brand-purple/30 text-brand-purple px-4 py-3 rounded-lg text-sm">
                    Your OTP: <span className="font-semibold">{generatedOtp}</span>
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                <input
                  type="tel"
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={verifyOtp}
                    disabled={loading}
                    className="flex-1 bg-linear-to-r from-brand-purple to-brand-red text-white py-3 rounded-lg font-medium hover:from-brand-purple/90 hover:to-brand-red/90 transition disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="flex items-center justify-center gap-2 flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Resend OTP
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mandatory Consent Popup */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3 text-brand-red">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-lg font-bold text-gray-900">Mandatory Action Required</h2>
              </div>
              <button 
                onClick={() => setShowConsent(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 leading-relaxed">
                <p>
                  To proceed with your seller login, you must acknowledge and agree to the following terms regarding platform usage and compliance.
                </p>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-transparent hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setConsentChecked(!consentChecked)}>
                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${consentChecked ? 'bg-brand-purple border-brand-purple' : 'border-gray-300 bg-white'}`}>
                  {consentChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed select-none">
                  I confirm that I have read and agree to all <span className="font-semibold text-gray-900">FirgoMart policies</span>, acknowledge that all platform ownership and rights are exclusively reserved with FirgoMart, and understand that my seller account may be suspended or permanently terminated in case of any violation of applicable laws or platform rules.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConsent(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={completeLogin}
                  disabled={!consentChecked || loading}
                  className="flex-1 px-4 py-3 bg-brand-purple text-white font-medium rounded-xl hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'I Agree & Login'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default SellerLogin
