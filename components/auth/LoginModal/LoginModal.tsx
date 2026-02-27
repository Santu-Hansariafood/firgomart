'use client'

import React, { useState, ChangeEvent, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import dynamic from "next/dynamic";
const Title = dynamic(() => import('@/components/common/Title/Title'))
const Paragraph = dynamic(() => import('@/components/common/Paragraph/Paragraph'))

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onSwitchToForgot: () => void
}

interface FormData {
  email: string
  password: string
}

interface Errors {
  email?: string
  password?: string
  submit?: string
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgot,
}) => {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Errors = {}

    if (!formData.email) {
      newErrors.email = 'Email or Mobile Number is required'
    } else {
      const isEmail = /\S+@\S+\.\S+/.test(formData.email)
      const isMobile = /^\d{10}$/.test(formData.email.replace(/\D/g, ''))
      if (!isEmail && !isMobile) {
        newErrors.email = 'Invalid email or mobile number'
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof Errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const chk = await fetch('/api/auth/exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await chk.json().catch(() => ({}))
      if (!chk.ok) {
        const msg = typeof data?.error === 'string' && data.error.length > 0 ? data.error : 'Unable to verify email'
        setErrors({ submit: msg })
        setLoading(false)
        return
      }
      if (!data?.exists) {
        setErrors({ submit: 'Email not registered' })
        setLoading(false)
        return
      }
    } catch {
      setErrors({ submit: 'Network error while verifying email' })
      setLoading(false)
      return
    }

    const res = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    })
    if (res?.ok) {
      onClose()
    } else {
      let msg = typeof res?.error === 'string' && res.error.length > 0 ? res.error : 'Invalid email or password'
      if (msg === "CredentialsSignin") msg = "Invalid user"
      setErrors({ submit: msg })
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex sm:items-center sm:justify-center bg-[var(--background)] sm:bg-black/50 p-0 sm:p-4 overflow-y-auto sm:overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full min-h-full sm:min-h-0 sm:h-auto sm:max-w-md bg-[var(--background)] text-[color:var(--foreground)] sm:rounded-2xl shadow-none sm:shadow-2xl flex flex-col justify-center sm:justify-start border-0 sm:border border-[var(--foreground)/10]"
        >
          <div className="p-6 sm:p-8 pb-0 relative shrink-0">
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-[var(--foreground)/50] hover:text-[color:var(--foreground)] hover:bg-[var(--foreground)/5] rounded-full p-2 transition z-10"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5" />
            </button>

            <div className="text-center space-y-2">
              <Title level={2} className="text-3xl font-bold bg-clip-text text-transparent bg-brand-purple">
                Welcome Back
              </Title>
              <Paragraph className="text-[var(--foreground)/60]">
                Sign in to continue your shopping journey
              </Paragraph>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {errors.submit}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                  Email or Mobile Number
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-[var(--foreground)/10] focus:border-brand-purple'
                    }`}
                    placeholder="Enter your email or mobile"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-12 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-[var(--foreground)/10] focus:border-brand-purple'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)/40] hover:text-[color:var(--foreground)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-[var(--foreground)/20] rounded transition-all peer-checked:bg-brand-purple peer-checked:border-brand-purple group-hover:border-brand-purple/50"></div>
                  <svg className="absolute w-3.5 h-3.5 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-[var(--foreground)/70] group-hover:text-[color:var(--foreground)] transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                onClick={onSwitchToForgot}
                className="text-sm font-medium text-brand-purple hover:text-brand-red transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-purple text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--foreground)/10]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[var(--background)] text-[var(--foreground)/50]">
                  New to our platform?
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-brand-purple hover:text-brand-red font-semibold transition-colors hover:underline decoration-2 underline-offset-4"
              >
                Create an account
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default LoginModal
