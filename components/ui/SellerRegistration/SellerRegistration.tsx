'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Store, Upload, CheckCircle } from 'lucide-react'
import { fadeInUp } from '@/utils/animations/animations'
import Link from 'next/link'
import locationData from '@/data/country.json'

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
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false)
  const sortedCountries = [...locationData.countries]
    .map(c => c.country)
    .sort()

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload = {
      ...formData,
      businessLogoUrl: formData.businessLogoUrl,
      documentUrls: [],
      country: formData.country,
      state: formData.state,
    }
    const res = await fetch('/api/seller/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for registering as a seller.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-linear-to-r from-blue-600 to-blue-400 p-8 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <Store className="w-8 h-8" />
              <h1 className="text-3xl font-heading font-bold">Become a Seller</h1>
            </div>
            <p className="text-blue-100">Grow your business with us</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-bold text-gray-900">
                Business Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-700 text-sm">Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 text-sm">Owner Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-700 text-sm">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 text-sm">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-gray-700 text-sm">Business Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900">Location</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-700 text-sm">Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg bg-white"
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
                  <label className="block mb-1 text-gray-700 text-sm">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    disabled={!states.length}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
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
                  <label className="block mb-1 text-gray-700 text-sm">District *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    disabled={!districts.length}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
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
                  <label className="block mb-1 text-gray-700 text-sm">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-gray-700 text-sm">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  minLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  pattern="[0-9]{6}"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-4 pt-6 border-t border-gray-300">
              <h2 className="text-xl font-heading font-bold">Tax Information</h2>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasGST"
                  checked={formData.hasGST}
                  onChange={handleChange}
                />
                <label>I have GST Number</label>
              </div>

              {formData.hasGST ? (
                <>
                  <label className="block mb-1 text-gray-700 text-sm">GST Number *</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-gray-700 text-sm">PAN Number *</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-700 text-sm">Aadhaar Number *</label>
                    <input
                      type="text"
                      name="aadhaar"
                      value={formData.aadhaar ?? ''}
                      onChange={handleChange}
                      pattern="[0-9]{12}"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-gray-300 space-y-3">
              <h2 className="text-xl font-heading font-bold">Business Logo</h2>

              <div className="border-2 border-dashed p-6 text-center rounded-lg">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />

                <label className="cursor-pointer text-blue-600 font-medium">
                  Upload Logo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                {formData.businessLogo && (
                  <p className="text-sm text-green-600 mt-2">✓ {formData.businessLogo.name}</p>
                )}
                {uploadingLogo && (
                  <p className="text-sm text-blue-600 mt-2">Uploading logo...</p>
                )}
                {formData.businessLogoUrl && (
                  <p className="text-sm text-green-700 mt-2">Uploaded</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Registration
            </button>
            <div className="pt-4 text-center border-t">
              <p className="text-sm">
                Already have an account?{' '}
                <Link href="/seller-login" className="text-blue-600">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default SellerRegistration
