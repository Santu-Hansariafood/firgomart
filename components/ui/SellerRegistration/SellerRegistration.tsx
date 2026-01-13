'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Store, Upload, CheckCircle } from 'lucide-react'
import { fadeInUp } from '@/utils/animations/animations'
import Link from 'next/link'
import locationData from '@/data/country.json'
import dynamic from 'next/dynamic'
const ImageCropper = dynamic(() => import('@/components/common/ImageCropper/ImageCropper'))

interface SellerFormData {
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  country: string
  state: string
  district: string
  city: string
  pincode: string
  gstNumber: string
  panNumber: string
  aadhaar?: string
  hasGST: boolean
  businessLogo: File | null
  businessLogoUrl?: string
  bankAccount?: string
  bankIfsc?: string
  bankName?: string
  bankBranch?: string
  bankDocumentImage?: string
  bankDocumentUrl?: string
}

const SellerRegistration: React.FC = () => {
  const [formData, setFormData] = useState<SellerFormData>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    hasGST: true,
    businessLogo: null
  })

  const [states, setStates] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [submitted, setSubmitted] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('sellerRegSubmitted') === 'true'
    } catch {
      return false
    }
  })
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [checking, setChecking] = useState<string | null>(null)
  const [bankDocSrc, setBankDocSrc] = useState<string | null>(null)
  const [croppingBankDoc, setCroppingBankDoc] = useState<boolean>(false)
  const [showAgreementPopup, setShowAgreementPopup] = useState<boolean>(true)
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false)

  const sortedCountries = [...locationData.countries]
    .map(c => c.country)
    .sort()

  const checkExists = async (field: string, value: string) => {
    if (!value) return
    setChecking(field)
    try {
      const res = await fetch('/api/seller/check-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      const data = await res.json()
      if (data.exists) {
        let msg = ''
        switch (field) {
          case 'email': msg = 'Email already registered'; break;
          case 'phone': msg = 'Phone number already registered'; break;
          case 'gstNumber': msg = 'GST Number already registered'; break;
          case 'panNumber': msg = 'PAN Number already registered'; break;
          default: msg = 'Already registered';
        }
        setErrors(prev => ({ ...prev, [field]: msg }))
      } else {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setChecking(null)
    }
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      if (name === 'hasGST') {
        delete newErrors.gstNumber
        delete newErrors.panNumber
      }
      return newErrors
    })

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked ?? false : value
    }))
    if (name === 'country') {
      const countryObj = locationData.countries.find(
        item => item.country === value
      )

      const sortedStates =
        countryObj?.states.map(s => s.state).sort() ?? []

      setStates(sortedStates)
      setDistricts([])

      setFormData(prev => ({
        ...prev,
        state: '',
        district: ''
      }))
    }
    if (name === 'state') {
      const countryObj = locationData.countries.find(
        item => item.country === formData.country
      )

      const stateObj = countryObj?.states.find(s => s.state === value)

      const sortedDistricts = stateObj?.districts.sort() ?? []

      setDistricts(sortedDistricts)

      setFormData(prev => ({
        ...prev,
        district: ''
      }))
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, businessLogo: file }))
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
      if (cloudName && preset) {
        const form = new FormData()
        form.append('file', file)
        form.append('upload_preset', preset)
        setUploadingLogo(true)
        fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: form,
        })
          .then(res => res.json())
          .then(data => {
            if (data?.secure_url) {
              setFormData(prev => ({ ...prev, businessLogoUrl: data.secure_url }))
            }
          })
          .catch(() => {})
          .finally(() => setUploadingLogo(false))
      }
    }
  }

  const handleBankDocSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : ''
      setBankDocSrc(src)
      setCroppingBankDoc(true)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (Object.keys(errors).length > 0) {
      return
    }
    if (!agreedToTerms) {
      setErrors(prev => ({ ...prev, agreement: 'Please agree to the terms and conditions' }))
      setShowAgreementPopup(true)
      return
    }

    const payload = {
      ...formData,
      businessLogoUrl: formData.businessLogoUrl,
      documentUrls: [],
      country: formData.country,
      state: formData.state,
    }

  if (payload.hasGST) {
    payload.panNumber = ''
    payload.aadhaar = ''
  } else {
    payload.gstNumber = ''
  }

  if ((formData as any).bankDocumentImage) {
    try {
      const up = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [(formData as any).bankDocumentImage] }),
      })
      const upJson = await up.json()
      if (up.ok && Array.isArray(upJson.urls) && upJson.urls[0]) {
        ;(payload as any).bankDocumentUrl = upJson.urls[0]
      }
    } catch {}
  }

    const res = await fetch('/api/seller/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setSubmitted(true)
      try { localStorage.setItem('sellerRegSubmitted', 'true') } catch {}
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 text-[var(--foreground)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--background)] rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-[var(--foreground)/20]"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold mb-2 text-[var(--foreground)]">
            Registration Successful!
          </h2>
          <p className="mb-6 text-[var(--foreground)/70]">
            Thank you for registering as a seller. Please wait for admin verification. You can login to check your status after verification.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors font-medium"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="bg-[var(--background)] rounded-2xl shadow-xl overflow-hidden border border-[var(--foreground)/20]"
        >
          <div className="bg-linear-to-r from-brand-purple to-brand-red p-8 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <Store className="w-8 h-8" />
              <h1 className="text-3xl font-heading font-bold">Sell on Firgomart</h1>
            </div>
            <p className="text-white/80">Grow your business with Firgomart</p>
          </div>
          {showAgreementPopup && !submitted && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[var(--background)] text-[var(--foreground)] rounded-2xl p-6 w-full max-w-lg shadow-xl border border-[var(--foreground)/20]">
                <h3 className="text-xl font-heading font-bold mb-4">Seller Agreement</h3>
                <div className="space-y-3 mb-4 text-sm">
                  <p>By continuing, you confirm that all details provided are accurate and may be used for verification.</p>
                  <p>Your access will be enabled after admin verification is complete.</p>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="agree" className="text-sm">I have read and agree to the terms</label>
                </div>
                {errors.agreement && (
                  <p className="text-red-500 text-xs mb-3">{errors.agreement}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAgreementPopup(false)}
                    disabled={!agreedToTerms}
                    className={`px-4 py-2 rounded-lg font-medium ${agreedToTerms ? 'bg-brand-purple text-white hover:bg-brand-purple/90' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-bold">
                Business Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">Owner Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => checkExists('email', formData.email)}
                    required
                    className={`w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20] ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  {checking === 'email' && <p className="text-brand-purple text-xs mt-1">Checking...</p>}
                </div>

                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => checkExists('phone', formData.phone)}
                    required
                    pattern="[0-9]{10}"
                    className={`w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20] ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  {checking === 'phone' && <p className="text-brand-purple text-xs mt-1">Checking...</p>}
                </div>
              </div>
              <h2 className="text-xl font-heading font-bold">Bank Account Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">Account Number *</label>
                  <input type="text" name="bankAccount" value={(formData as any).bankAccount ?? ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]" />
                </div>
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">IFSC *</label>
                  <input type="text" name="bankIfsc" value={(formData as any).bankIfsc ?? ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">Bank Name *</label>
                  <input type="text" name="bankName" value={(formData as any).bankName ?? ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]" />
                </div>
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">Branch Name *</label>
                  <input type="text" name="bankBranch" value={(formData as any).bankBranch ?? ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[var(--foreground)/80] text-sm">Business Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]"
                />
              </div>
              <h2 className="text-xl font-heading font-bold">Location</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]"
                  >
                    <option value="">Select Country</option>
                    {sortedCountries.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    disabled={!states.length}
                    className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]"
                  >
                    <option value="">Select State</option>
                    {states.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">District *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    disabled={!districts.length}
                    className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]"
                  >
                    <option value="">Select District</option>
                    {districts.map(dc => (
                      <option key={dc} value={dc}>
                        {dc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[var(--foreground)/80] text-sm">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  minLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  pattern="[0-9]{6}"
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]"
                />
              </div>
            </div>
            <div className="space-y-4 pt-6 border-t border-[var(--foreground)/20]">
              <h2 className="text-xl font-heading font-bold">Tax Information</h2>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasGST"
                  checked={formData.hasGST}
                  onChange={handleChange}
                />
                <label className="text-[var(--foreground)/80]">I have GST Number</label>
              </div>

              {formData.hasGST ? (
                <>
                  <label className="block mb-1 text-[var(--foreground)/80] text-sm">GST Number *</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    onBlur={() => checkExists('gstNumber', formData.gstNumber)}
                    pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                    required
                    className={`w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20] ${errors.gstNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.gstNumber && <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>}
                  {checking === 'gstNumber' && <p className="text-brand-purple text-xs mt-1">Checking...</p>}
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-[var(--foreground)/80] text-sm">PAN Number *</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      onBlur={() => checkExists('panNumber', formData.panNumber)}
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      required
                      className={`w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20] ${errors.panNumber ? 'border-red-500' : ''}`}
                    />
                    {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
                    {checking === 'panNumber' && <p className="text-brand-purple text-xs mt-1">Checking...</p>}
                  </div>

                  <div>
                    <label className="block mb-1 text-[var(--foreground)/80] text-sm">Aadhaar Number *</label>
                    <input
                      type="text"
                      name="aadhaar"
                      value={formData.aadhaar ?? ''}
                      onChange={handleChange}
                      pattern="[0-9]{12}"
                      required
                      className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] border-[var(--foreground)/20]"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-[var(--foreground)/20] space-y-3">
              <h2 className="text-xl font-heading font-bold">Business Logo</h2>

              <div className="border-2 border-dashed p-6 text-center rounded-lg border-[var(--foreground)/30]">
                <Upload className="w-12 h-12 mx-auto text-[var(--foreground)/50] mb-2" />

                <label className="cursor-pointer text-brand-purple font-medium">
                  Upload Logo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                {formData.businessLogo && (
                  <p className="text-sm text-green-600 mt-2">✓ {formData.businessLogo.name}</p>
                )}
                {uploadingLogo && (
                  <p className="text-sm text-brand-purple mt-2">Uploading logo...</p>
                )}
                {formData.businessLogoUrl && (
                  <p className="text-sm text-green-700 mt-2">Uploaded</p>
                )}
              </div>
            </div>
            <div className="pt-6 border-t border-[var(--foreground)/20] space-y-3">
              <h2 className="text-xl font-heading font-bold">Bank Document</h2>
              <div className="border-2 border-dashed p-6 text-center rounded-lg border-[var(--foreground)/30]">
                <Upload className="w-12 h-12 mx-auto text-[var(--foreground)/50] mb-2" />
                <label className="cursor-pointer text-brand-purple font-medium">
                  Upload Bank Document
                  <input type="file" accept="image/*" onChange={handleBankDocSelect} className="hidden" />
                </label>
                {(formData as any).bankDocumentImage && (
                  <div className="mt-3 flex justify-center">
                    <img src={(formData as any).bankDocumentImage} alt="Bank Document" className="max-h-40 rounded border" />
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90"
            >
              Submit Registration
            </button>
            <div className="pt-4 text-center border-t border-[var(--foreground)/20]">
              <p className="text-sm">
                Already have an account?{' '}
                <Link href="/seller-login" className="text-brand-purple">
                  Log in
                </Link>
              </p>
            </div>
          </form>
          {croppingBankDoc && bankDocSrc && (
            <ImageCropper
              imageSrc={bankDocSrc}
              onCropComplete={(img: string) => {
                setFormData(prev => ({ ...prev, bankDocumentImage: img }))
                setCroppingBankDoc(false)
              }}
              onCancel={() => setCroppingBankDoc(false)}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default SellerRegistration
