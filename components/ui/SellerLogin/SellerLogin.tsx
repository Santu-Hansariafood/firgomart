'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Phone, ShieldCheck, RefreshCw } from 'lucide-react'
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
      } else {
        const s = data?.seller
        const user: Parameters<typeof login>[0] = {
          id: s?.id || Date.now(),
          email: s?.email || `${mobile}@seller.local`,
          name: s?.name || 'Seller',
          role: 'seller',
        }
        await login(user)
        router.push(next)
      }
    } catch {
      setError('Network error')
    } finally {
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
    </div>
  )
}

export default SellerLogin
