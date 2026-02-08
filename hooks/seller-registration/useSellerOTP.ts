import { useState } from 'react'

export const useSellerOTP = () => {
  const [emailOtp, setEmailOtp] = useState('')
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpVerified, setEmailOtpVerified] = useState(false)
  const [emailOtpLoading, setEmailOtpLoading] = useState(false)
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null)

  const requestEmailOtp = async (email: string, errors: Record<string, string>) => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      return { success: false, error: 'Email is required for OTP' }
    }
    if (errors.email) return { success: false }

    setEmailOtpError(null)
    setEmailOtpLoading(true)
    try {
      const res = await fetch('/api/seller/register/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = (data && typeof data.error === 'string' && data.error) || 'Failed to send OTP'
        setEmailOtpError(msg)
        setEmailOtpSent(false)
        return { success: false }
      } else {
        setEmailOtpSent(true)
        return { success: true }
      }
    } catch {
      setEmailOtpError('Network error while sending OTP')
      setEmailOtpSent(false)
      return { success: false }
    } finally {
      setEmailOtpLoading(false)
    }
  }

  const verifyEmailOtp = async (email: string) => {
    const code = emailOtp.trim()
    if (!/^\d{6}$/.test(code)) {
      setEmailOtpError('Enter the 6-digit OTP sent to your email')
      return { success: false }
    }
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setEmailOtpError('Email is required for OTP verification')
      return { success: false }
    }

    setEmailOtpLoading(true)
    setEmailOtpError(null)
    try {
      const res = await fetch('/api/seller/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = (data && typeof data.error === 'string' && data.error) || 'Invalid or expired OTP'
        setEmailOtpError(msg)
        setEmailOtpVerified(false)
        return { success: false }
      } else {
        setEmailOtpVerified(true)
        return { success: true }
      }
    } catch {
      setEmailOtpError('Network error while verifying OTP')
      setEmailOtpVerified(false)
      return { success: false }
    } finally {
      setEmailOtpLoading(false)
    }
  }

  const resetOTP = () => {
    setEmailOtp('')
    setEmailOtpSent(false)
    setEmailOtpVerified(false)
    setEmailOtpError(null)
  }

  return {
    emailOtp,
    setEmailOtp,
    emailOtpSent,
    emailOtpVerified,
    emailOtpLoading,
    emailOtpError,
    requestEmailOtp,
    verifyEmailOtp,
    resetOTP
  }
}
