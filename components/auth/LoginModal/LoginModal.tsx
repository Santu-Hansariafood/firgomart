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
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
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
      const msg = typeof res?.error === 'string' && res.error.length > 0 ? res.error : 'Invalid email or password'
      setErrors({ submit: msg })
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="relative bg-linear-to-r from-brand-purple to-brand-red p-6">
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <Title level={2} className="text-white">
              Welcome Back
            </Title>

            <Paragraph className="text-white/80 mt-1 text-sm sm:text-base">
              Sign in to continue shopping
            </Paragraph>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4 sm:space-y-5">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-purple border-gray-300 rounded focus:ring-brand-purple"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={onSwitchToForgot}
                className="text-sm text-brand-purple hover:text-brand-red font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-brand-purple to-brand-red text-white py-3 rounded-lg font-medium hover:from-brand-red hover:to-brand-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <Paragraph className="text-sm text-gray-600">
                Don’t have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-brand-purple hover:text-brand-red font-medium"
                >
                  Sign up
                </button>
              </Paragraph>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default LoginModal
