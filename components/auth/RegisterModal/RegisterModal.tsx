'use client'

import { useState, useRef, ChangeEvent, FormEvent, KeyboardEvent, ClipboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, CheckCircle 
} from 'lucide-react'
import { signIn } from 'next-auth/react'
import dynamic from 'next/dynamic'
const Title = dynamic(() => import('@/components/common/Title/Title'))
const Paragraph = dynamic(() => import('@/components/common/Paragraph/Paragraph'))
interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

interface RegisterFormData {
  name: string
  email: string
  mobile: string
  password: string
  confirmPassword: string
  address: string
  city: string
  state: string
  pincode: string
  dateOfBirth: string
  gender: string
}

interface FormErrors {
  [key: string]: string
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin
}) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    gender: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [emailOtp, setEmailOtp] = useState<string[]>(new Array(6).fill(''))
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpVerified, setEmailOtpVerified] = useState(false)
  const [emailOtpLoading, setEmailOtpLoading] = useState(false)
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null)
  const [checking, setChecking] = useState<string | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)
  const isMobile = (val: string) => /^\d{10}$/.test(val.replace(/\D/g, ''))

  const checkExists = async (field: string, value: string) => {
    if (!value) return
    setChecking(field)
    try {
      const res = await fetch('/api/auth/check-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      const data = await res.json()
      if (data.exists) {
        let msg = ''
        if (field === 'email') msg = 'Email already registered'
        else if (field === 'mobile') msg = 'Phone number already registered'
        else msg = 'Already registered'
        
        setErrors(prev => ({ ...prev, [field]: msg }))
      } else {
        setErrors(prev => {
           const next = { ...prev }
           delete next[field]
           return next
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setChecking(null)
    }
  }

  const validateStep1 = () => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = 'First name is required'
    else if (!/^[A-Za-z\s]+$/.test(formData.name.trim()))
      newErrors.name = 'Only letters and spaces are allowed'

    if (!formData.email) newErrors.email = 'Email is required'
    else if (!isEmail(formData.email))
      newErrors.email = 'Invalid email format'
    if (!emailOtpVerified) newErrors.email = newErrors.email || 'Please verify your email with OTP'

    if (!formData.mobile) newErrors.mobile = 'Mobile number is required'
    else if (!isMobile(formData.mobile))
      newErrors.mobile = 'Invalid mobile number'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: FormErrors = {}
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = 'Invalid pincode'
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = 'Date of birth is required'
    else {
      const dob = new Date(formData.dateOfBirth)
      if (isNaN(dob.getTime())) {
        newErrors.dateOfBirth = 'Invalid date of birth'
      } else {
        const today = new Date()
        let age = today.getFullYear() - dob.getFullYear()
        const monthDiff = today.getMonth() - dob.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--
        }
        if (age < 18) {
          newErrors.dateOfBirth = 'You must be at least 18 years old'
        }
      }
    }
    if (!formData.gender) newErrors.gender = 'Gender is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const requestEmailOtp = async () => {
    const email = formData.email.trim()
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }))
      return
    }
    if (!isEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }))
      return
    }
    setEmailOtpError(null)
    setEmailOtpLoading(true)
    setEmailOtpSent(false)
    setEmailOtpVerified(false)
    try {
      const res = await fetch('/api/auth/register/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (data && typeof data.error === 'string' && data.error) || 'Failed to send OTP'
        setEmailOtpError(msg)
        setEmailOtpSent(false)
      } else {
        setEmailOtpSent(true)
      }
    } catch {
      setEmailOtpError('Network error while sending OTP')
      setEmailOtpSent(false)
    } finally {
      setEmailOtpLoading(false)
    }
  }

  const verifyEmailOtp = async () => {
    const code = emailOtp.join('')
    if (!/^\d{6}$/.test(code)) {
      setEmailOtpError('Enter the 6-digit OTP sent to your email')
      return
    }
    const email = formData.email.trim()
    if (!email) {
      setEmailOtpError('Email is required for OTP verification')
      return
    }
    setEmailOtpLoading(true)
    setEmailOtpError(null)
    try {
      const res = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (data && typeof data.error === 'string' && data.error) || 'Invalid or expired OTP'
        setEmailOtpError(msg)
        setEmailOtpVerified(false)
      } else {
        setEmailOtpVerified(true)
        setErrors(prev => {
          const next = { ...prev }
          delete next.email
          return next
        })
      }
    } catch {
      setEmailOtpError('Network error while verifying OTP')
      setEmailOtpVerified(false)
    } finally {
      setEmailOtpLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]
    if (!/^\d*$/.test(value)) return

    const newOtp = [...emailOtp]
    newOtp[index] = value
    setEmailOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '')
    if (pastedData) {
      const newOtp = [...emailOtp]
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setEmailOtp(newOtp)
      const nextIndex = Math.min(pastedData.length, 5)
      otpRefs.current[nextIndex]?.focus()
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    if (!emailOtpVerified) {
      setErrors(prev => ({ ...prev, email: prev.email || 'Please verify your email with OTP' }))
      setStep(1)
      return
    }

    setLoading(true)
    const payload = {
      ...formData,
      country: 'IN',
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      try {
        const addr = {
          fullName: formData.name,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('deliveryAddress', JSON.stringify(addr))
          if (addr.state) localStorage.setItem('deliverToState', addr.state)
        }
      } catch {}
      const loginRes = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })
      if (loginRes?.ok) onClose()
      else {
        const msg =
          typeof loginRes?.error === 'string' && loginRes.error.length > 0
            ? loginRes.error
            : 'Auto login failed'
        setErrors(prev => ({ ...prev, submit: msg }))
      }
    } else {
      const data = await res.json().catch(() => ({}))
      setErrors(prev => ({ ...prev, submit: (data as any)?.error || 'Registration failed' }))
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex sm:items-center sm:justify-center bg-[var(--background)] sm:bg-black/50 p-0 sm:p-4 overflow-y-auto sm:overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--background)] text-[color:var(--foreground)] sm:rounded-2xl shadow-none sm:shadow-2xl w-full min-h-full sm:min-h-0 sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col border-0 sm:border border-[var(--foreground)/10]"
        >
          <div className="p-4 sm:p-5 pb-0 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--foreground)/50] hover:text-[color:var(--foreground)] hover:bg-[var(--foreground)/5] rounded-full p-2 transition-colors z-10"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5" />
            </button>
            
            <div className="space-y-1 mb-4 mt-2 sm:mt-0">
              <Title level={2} className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-purple to-brand-red">
                Create Account
              </Title>
              <Paragraph className="text-sm sm:text-base text-[var(--foreground)/60]">
                Join us to start your shopping journey
              </Paragraph>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-[var(--foreground)/5] -translate-y-1/2 rounded-full"></div>
              <div className="relative flex justify-between items-center max-w-xs mx-auto">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step >= 1 
                      ? 'bg-linear-to-r from-brand-purple to-brand-red text-white shadow-lg shadow-brand-purple/20 scale-110' 
                      : 'bg-[var(--foreground)/10] text-[var(--foreground)/40]'
                  }`}>1</div>
                  <span className={`text-xs font-medium transition-colors duration-300 ${
                    step >= 1 ? 'text-brand-purple' : 'text-[var(--foreground)/40]'
                  }`}>Account</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${
                    step >= 2 ? 'bg-brand-purple' : 'bg-[var(--foreground)/10]'
                  }`}></div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step >= 2 
                      ? 'bg-linear-to-r from-brand-purple to-brand-red text-white shadow-lg shadow-brand-purple/20 scale-110' 
                      : 'bg-[var(--foreground)/10] text-[var(--foreground)/40]'
                  }`}>2</div>
                  <span className={`text-xs font-medium transition-colors duration-300 ${
                    step >= 2 ? 'text-brand-purple' : 'text-[var(--foreground)/40]'
                  }`}>Personal</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 pb-32 sm:pb-8 space-y-4 sm:space-y-4 overflow-y-auto flex-1">
            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={e => {
                        const v = e.target.value.replace(/[^A-Za-z\s]/g, '')
                        setFormData(prev => ({ ...prev, name: v }))
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                      }}
                      placeholder="Enter your first name"
                      className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] ${
                        errors.name 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-[var(--foreground)/10] focus:border-brand-purple'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={e => {
                          const val = e.target.value
                          setFormData(prev => ({ ...prev, email: val }))
                          if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                        }}
                        placeholder="you@example.com"
                        onBlur={() => checkExists('email', formData.email)}
                        className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] ${
                          errors.email 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : 'border-[var(--foreground)/10] focus:border-brand-purple'
                        }`}
                      />
                    </div>
                    {checking === 'email' && (
                      <p className="text-brand-purple text-xs mt-1 animate-pulse ml-1">Checking availability...</p>
                    )}
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2 justify-between max-w-sm w-full">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            ref={(el) => {
                                if (el) otpRefs.current[index] = el
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={emailOtp[index] || ''}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            className="w-9 h-11 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border rounded-xl bg-[var(--background)] text-[color:var(--foreground)] border-[var(--foreground)/10] focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all p-0"
                          />
                        ))}
                      </div>
                      
                      <div className="flex gap-3">
                         <button
                          type="button"
                          onClick={verifyEmailOtp}
                          disabled={emailOtpLoading || emailOtp.join('').length < 6}
                          className="flex-1 px-6 py-2.5 text-sm font-medium rounded-xl bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-brand-purple/20"
                        >
                          {emailOtpLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                          type="button"
                          onClick={requestEmailOtp}
                          disabled={emailOtpLoading || !formData.email}
                          className="flex-1 px-6 py-2.5 text-sm font-medium rounded-xl bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-brand-purple/20 whitespace-nowrap"
                        >
                          {emailOtpLoading ? 'Sending...' : emailOtpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      </div>
                    </div>
                    {emailOtpVerified && !emailOtpError && (
                      <div className="flex items-center gap-2 text-green-600 text-sm bg-green-500/10 p-2 rounded-lg ml-1">
                        <CheckCircle className="w-4 h-4" />
                        Email verified successfully
                      </div>
                    )}
                    {emailOtpError && <p className="text-red-500 text-sm ml-1">{emailOtpError}</p>}
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setFormData(prev => ({ ...prev, mobile: val }))
                        if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }))
                      }}
                      onBlur={() => checkExists('mobile', formData.mobile)}
                      placeholder="10-digit mobile number"
                      className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] ${
                        errors.mobile 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-[var(--foreground)/10] focus:border-brand-purple'
                      }`}
                    />
                  </div>
                  {checking === 'mobile' && (
                    <p className="text-brand-purple text-xs mt-1 animate-pulse ml-1">Checking availability...</p>
                  )}
                  {errors.mobile && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.mobile}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[{
                    label: 'Password',
                    name: 'password',
                    show: showPassword,
                    toggle: () => setShowPassword(!showPassword),
                    placeholder: 'Min 6 chars'
                  }, {
                    label: 'Confirm Password',
                    name: 'confirmPassword',
                    show: showConfirmPassword,
                    toggle: () => setShowConfirmPassword(!showConfirmPassword),
                    placeholder: 'Re-enter password'
                  }].map(({ label, name, show, toggle, placeholder }) => (
                    <div key={name}>
                      <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                        <input
                          type={show ? 'text' : 'password'}
                          name={name}
                          value={formData[name as 'password' | 'confirmPassword']}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className={`w-full pl-11 pr-12 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] ${
                            errors[name] 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                              : 'border-[var(--foreground)/10] focus:border-brand-purple'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={toggle}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)/40] hover:text-[color:var(--foreground)] transition-colors"
                        >
                          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors[name] && (
                        <p className="text-red-500 text-sm mt-1.5 ml-1">{errors[name]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-linear-to-r from-brand-purple to-brand-red text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                >
                  Next Step
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Street address, apartment, suite, etc."
                      className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] ${
                        errors.address 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-[var(--foreground)/10] focus:border-brand-purple'
                      }`}
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {(['city', 'state', 'pincode'] as Array<keyof Pick<RegisterFormData, 'city' | 'state' | 'pincode'>>).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1 capitalize">
                        {field} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        placeholder={field === 'pincode' ? '6-digit pincode' : field}
                        className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] ${
                          errors[field] 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : 'border-[var(--foreground)/10] focus:border-brand-purple'
                        }`}
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-sm mt-1.5 ml-1">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] ${
                        errors.dateOfBirth 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-[var(--foreground)/10] focus:border-brand-purple'
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] appearance-none ${
                          errors.gender 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : 'border-[var(--foreground)/10] focus:border-brand-purple'
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[var(--foreground)/40]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.gender}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-4 rounded-xl font-medium border border-[var(--foreground)/10] hover:bg-[var(--foreground)/5] transition-colors text-[color:var(--foreground)]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-linear-to-r from-brand-purple to-brand-red text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : 'Create Account'}
                  </button>
                </div>
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--foreground)/10]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[var(--background)] text-[var(--foreground)/50]">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="text-center pb-2">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-brand-purple hover:text-brand-red font-semibold transition-colors hover:underline decoration-2 underline-offset-4"
              >
                Sign in instead
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default RegisterModal
