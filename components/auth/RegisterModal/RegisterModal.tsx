'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff 
} from 'lucide-react'
import { signIn } from 'next-auth/react'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

interface RegisterFormData {
  registrationType: 'email' | 'mobile'
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
    registrationType: 'email',
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

  const validateStep1 = () => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = 'First name is required'
    else if (!/^[A-Za-z\s]+$/.test(formData.name.trim()))
      newErrors.name = 'Only letters and spaces are allowed'

    if (formData.registrationType === 'email') {
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email))
        newErrors.email = 'Invalid email format'
    } else {
      if (!formData.mobile) newErrors.mobile = 'Mobile number is required'
      else if (!/^[6-9]\d{9}$/.test(formData.mobile))
        newErrors.mobile = 'Invalid mobile number'
    }

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return

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
          phone: formData.mobile,
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
        const msg = typeof loginRes?.error === 'string' && loginRes.error.length > 0 ? loginRes.error : 'Auto login failed'
        setErrors(prev => ({ ...prev, submit: msg }))
      }
    } else {
      const data = await res.json().catch(() => ({}))
      setErrors(prev => ({ ...prev, submit: data?.error || 'Registration failed' }))
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-heading font-bold text-white">
              Create Account
            </h2>
            <p className="text-blue-100 mt-1">
              Step {step} of 2 — {step === 1 ? 'Account Details' : 'Personal Information'}
            </p>
            <div className="flex mt-4 space-x-2">
              <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-blue-300'}`} />
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-blue-300'}`} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Type
                  </label>
                  <div className="flex space-x-4">
                    {['email', 'mobile'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="registrationType"
                          value={type}
                          checked={formData.registrationType === type}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {formData.registrationType === 'email' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={e => {
                          const val = e.target.value
                          setFormData(prev => ({ ...prev, email: val }))
                          if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                        }}
                        placeholder="your@email.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.mobile ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[{
                    label: 'Password *',
                    name: 'password',
                    show: showPassword,
                    toggle: () => setShowPassword(!showPassword),
                    placeholder: 'Min 6 characters'
                  }, {
                    label: 'Confirm Password *',
                    name: 'confirmPassword',
                    show: showConfirmPassword,
                    toggle: () => setShowConfirmPassword(!showConfirmPassword),
                    placeholder: 'Re-enter password'
                  }].map(({ label, name, show, toggle, placeholder }) => (
                    <div key={name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={show ? 'text' : 'password'}
                          name={name}
                          value={formData[name as 'password' | 'confirmPassword']}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors[name] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={toggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors[name] && (
                        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-linear-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all"
                >
                  Next Step
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Street address, apartment, suite, etc."
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['city', 'state', 'pincode'] as Array<keyof Pick<RegisterFormData, 'city' | 'state' | 'pincode'>>).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {field} *
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        placeholder={field === 'pincode' ? '6-digit pincode' : field}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[field] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-linear-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default RegisterModal
