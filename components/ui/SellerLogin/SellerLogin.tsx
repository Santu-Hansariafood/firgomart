'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ShieldCheck, RefreshCw, ArrowRight, Lock, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

const SellerLogin: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/seller'
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [showConsent, setShowConsent] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  interface PendingSeller { id?: string | number; email?: string; name?: string }
  const [pendingSeller, setPendingSeller] = useState<PendingSeller | null>(null)

  useEffect(() => {
    if (otpSent && otpRefs.current[0]) {
      otpRefs.current[0].focus()
    }
  }, [otpSent])

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return
    
    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)
    setEnteredOtp(newOtpValues.join(''))

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
    const newOtpValues = [...otpValues]
    pastedData.forEach((value, index) => {
      if (index < 6 && !isNaN(Number(value))) {
        newOtpValues[index] = value
      }
    })
    setOtpValues(newOtpValues)
    setEnteredOtp(newOtpValues.join(''))
    if (pastedData.length > 0) {
      otpRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

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
        setOtpValues(['', '', '', '', '', ''])
        setEnteredOtp('')
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
    setOtpValues(['', '', '', '', '', ''])
    requestOtp()
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--background)] rounded-2xl shadow-xl border border-[var(--foreground)/10] overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-6 text-center border-b border-[var(--foreground)/10]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-[color:var(--foreground)]">Seller Login</h1>
            <p className="text-[var(--foreground)/60] mt-2 text-sm">
              Secure access to your seller dashboard
            </p>
          </div>

          <div className="p-8 pt-6">
            {!otpSent ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter registered seller email"
                      className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple text-[color:var(--foreground)] placeholder-[var(--foreground)/40] transition-all duration-200"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={requestOtp}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-brand-purple/90 text-white rounded-xl shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP <ArrowRight className="w-5 h-5 opacity-80" />
                    </>
                  )}
                </button>
                
                <div className="text-center pt-2">
                  <p className="text-sm text-[var(--foreground)/60]">
                    Don't have a seller account? 
                    <Link href="/seller-registration" className="text-brand-purple font-semibold hover:underline ml-1 decoration-2 underline-offset-4">
                      Register here
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedOtp && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-brand-purple/5 border border-brand-purple/20 text-brand-purple px-4 py-3 rounded-xl text-sm text-center"
                  >
                    <p className="text-[var(--foreground)/70] mb-1">Development Mode OTP</p>
                    <span className="font-mono text-xl font-bold tracking-wider">{generatedOtp}</span>
                  </motion.div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">Enter Verification Code</label>
                    <button 
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-brand-purple hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                  
                  <div className="flex gap-2 justify-between sm:gap-3">
                    {otpValues.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => otpRefs.current[index] = el}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple text-[color:var(--foreground)] transition-all duration-200"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-center text-[var(--foreground)/50]">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </motion.div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={verifyOtp}
                    disabled={loading || enteredOtp.length !== 6}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-brand-purple/90 text-white rounded-xl shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Login <LayoutDashboard className="w-5 h-5 opacity-80" />
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={loading}
                    className="w-full py-3.5 bg-[var(--foreground)/5] text-[color:var(--foreground)] rounded-xl hover:bg-[var(--foreground)/10] transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Resend OTP
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        <div className="mt-8 text-center text-sm text-[var(--foreground)/40]">
          <p>© {new Date().getFullYear()} FirgoMart. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default SellerLogin
