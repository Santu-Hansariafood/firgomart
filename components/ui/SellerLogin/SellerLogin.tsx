'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ShieldCheck, RefreshCw, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const SellerLogin: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/seller'
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [showConsent, setShowConsent] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  interface PendingSeller { id?: string | number; email?: string; name?: string }
  const [pendingSeller, setPendingSeller] = useState<PendingSeller | null>(null)

  const requestOtp = async () => {
    setError('')
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/seller/login/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
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
        body: JSON.stringify({ email: email.trim(), otp: enteredOtp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Verification failed')
        setLoading(false)
      } else {
        const s = data.seller as { id?: string | number; email?: string; name?: string }
        let details: unknown = null
        try {
          const res2 = await fetch(`/api/seller/me?email=${encodeURIComponent(String(s?.email || email.trim()))}`)
          const data2 = await res2.json()
          if (res2.ok) details = data2?.seller || null
        } catch {}
        await login({
          id: s?.id || Date.now(),
          email: s?.email || email.trim(),
          name: s?.name || 'Seller',
          role: 'seller',
          sellerDetails: details || undefined,
        })
        router.replace(next)
        setLoading(false)
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
      let details: unknown = null
      try {
        const res = await fetch(`/api/seller/me?email=${encodeURIComponent(String(s?.email || email.trim()))}`)
        const data = await res.json()
        if (res.ok) details = data?.seller || null
      } catch {}
      const user: Parameters<typeof login>[0] = {
        id: s?.id || Date.now(),
        email: s?.email || email.trim(),
        name: s?.name || 'Seller',
        role: 'seller',
        sellerDetails: details || undefined,
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12">
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--background)] rounded-2xl shadow-xl overflow-hidden border border-[var(--foreground)/20]"
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
                <label className="block text-sm font-medium text-[var(--foreground)/80] mb-2">Seller Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/50]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter registered seller email"
                    className="w-full pl-10 pr-4 py-3 border border-[var(--foreground)/20] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple bg-[var(--background)] text-[var(--foreground)]"
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
                <p className="text-xs text-[var(--foreground)/60]">
                  OTP will be sent to your registered seller email.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedOtp && (
                  <div className="bg-brand-purple/10 border border-brand-purple/30 text-brand-purple px-4 py-3 rounded-lg text-sm">
                    Your OTP: <span className="font-semibold">{generatedOtp}</span>
                  </div>
                )}
                <label className="block text-sm font-medium text-[var(--foreground)/80] mb-2">Enter OTP</label>
                <input
                  type="tel"
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 border border-[var(--foreground)/20] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple bg-[var(--background)] text-[var(--foreground)]"
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
                    className="flex items-center justify-center gap-2 flex-1 bg-[var(--foreground)/10] text-[var(--foreground)] py-3 rounded-lg font-medium hover:bg-[var(--foreground)/20] transition"
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
