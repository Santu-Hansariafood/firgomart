'use client'

import { motion } from 'framer-motion'
import { Upload, CheckCircle } from 'lucide-react'
import { fadeInUp } from '@/utils/animations/animations'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import BackButton from '@/components/common/BackButton/BackButton'
import { useSellerRegistration } from '@/hooks/useSellerRegistration'
import sellerAgreementContent from '@/data/sellerAgreement.json'

const ImageCropper = dynamic(() => import('@/components/common/ImageCropper/ImageCropper'))

const SellerRegistration: React.FC = () => {
  const {
    formData,
    setFormData,
    states,
    districts,
    errors,
    checking,
    uploadingLogo,
    submitted,
    bankDocSrc,
    croppingBankDoc,
    setCroppingBankDoc,
    showAgreementPopup,
    setShowAgreementPopup,
    agreedToTerms,
    setAgreedToTerms,
    pendingSubmit,
    setPendingSubmit,
    handleChange,
    handleFileChange,
    handleBankDocSelect,
    handleSubmit,
    checkExists,
    submitRegistration,
    emailOtp,
    setEmailOtp,
    emailOtpSent,
    emailOtpVerified,
    emailOtpLoading,
    emailOtpError,
    requestEmailOtp,
    verifyEmailOtp,
    serverError,
    isSubmitting
  } = useSellerRegistration()

  const agreementTitle = (sellerAgreementContent as { title?: string }).title || 'Seller Agreement'
  const agreementIntro =
    (sellerAgreementContent as { intro?: string[] }).intro || []
  const agreementSections =
    (sellerAgreementContent as {
      sections?: { heading?: string; points?: string[] }[]
    }).sections || []

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 text-[color:var(--foreground)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--background)] rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-[var(--foreground)/20]"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2 text-[color:var(--foreground)]">
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
    <div className="min-h-screen bg-[var(--background)] text-[color:var(--foreground)] pt-24 pb-10 sm:pt-28 sm:pb-14">
      <div className="max-w-3xl mx-auto px-4 space-y-4 sm:space-y-6">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="bg-[var(--background)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--foreground)/15]"
        >
            <div className="relative bg-gradient-to-br from-brand-purple to-brand-red p-4 sm:p-6 text-white overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-10">
                <svg className="absolute inset-0 h-full w-full stroke-white/[0.05] [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                  <defs>
                    <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse" x="-1" y="-1">
                      <path d="M.5 32V.5H32" fill="none"></path>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)"></rect>
                </svg>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                <div className="relative w-40 h-14 sm:w-48 sm:h-16 bg-white backdrop-blur-lg rounded-2xl p-3 shadow-2xl border border-white/50 flex items-center justify-center transition-transform hover:scale-105 duration-300">
                  <Image
                    src="/logo/firgomart.png"
                    alt="Firgomart"
                    fill
                    priority
                    sizes="160px"
                    className="object-contain"
                  />
                </div>
                <BackButton
                  href="/"
                  label="Back to Home"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white border border-white/20 shadow-sm">
                    Seller Registration
                  </span>
                  <div className="h-px w-8 bg-white/30 hidden sm:block" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold leading-tight tracking-tight drop-shadow-md">
                  Start Selling on Firgomart
                </h1>
              </div>
          </div>
          {showAgreementPopup && !submitted && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
              <div className="bg-[var(--background)] text-[color:var(--foreground)] rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-xl border border-[var(--foreground)/20] max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-heading font-bold mb-2 shrink-0">{agreementTitle}</h3>
                <div className="text-xs text-[var(--foreground)/70] mb-3 shrink-0">
                  <p>By continuing, you confirm that all details provided are accurate and may be used for verification and compliance with marketplace policies.</p>
                  <p>Your access will be enabled after admin verification is complete.</p>
                </div>
                <div className="mb-4 border border-[var(--foreground)/15] rounded-lg bg-[var(--background)]/80 overflow-y-auto p-3 text-xs leading-relaxed space-y-2 grow">
                  {agreementIntro.map((para, idx) => (
                    <p key={`intro-${idx}`}>{para}</p>
                  ))}
                  {agreementSections.map((section, sIdx) => (
                    <div key={`sec-${sIdx}`} className="mt-2">
                      {section.heading && (
                        <p className="font-semibold text-[color:var(--foreground)] mb-1">
                          {section.heading}
                        </p>
                      )}
                      {Array.isArray(section.points) &&
                        section.points.map((pt, pIdx) => (
                          <p key={`sec-${sIdx}-pt-${pIdx}`}>{pt}</p>
                        ))}
                    </div>
                  ))}
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
                    onClick={async () => {
                      if (!agreedToTerms) return
                      setShowAgreementPopup(false)
                      if (pendingSubmit) {
                        setPendingSubmit(false)
                        await submitRegistration()
                      }
                    }}
                    disabled={!agreedToTerms}
                    className={`px-4 py-2 rounded-lg font-medium ${agreedToTerms ? 'bg-brand-purple text-white hover:bg-brand-purple/90' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 space-y-8">
            {serverError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-heading font-bold">
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200 ${errors.businessName ? 'border-red-500' : ''}`}
                    placeholder="Enter business name"
                  />
                  {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Owner Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200 ${errors.ownerName ? 'border-red-500' : ''}`}
                    placeholder="Enter owner's full name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Email *</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 items-stretch">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => checkExists('email', formData.email)}
                        required
                        className="flex-1 min-w-0 px-3 sm:px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200 text-sm flex-grow basis-[65%] sm:basis-auto ${errors.email ? 'border-red-500' : ''}"
                        placeholder="Enter email address"
                      />
                      <button
                        type="button"
                        onClick={requestEmailOtp}
                        disabled={emailOtpLoading || !formData.email || !!errors.email}
                        className="px-2 sm:px-3 py-2 h-full text-xs sm:text-sm font-medium rounded-lg bg-brand-purple text-white hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] flex-shrink-0 whitespace-nowrap"
                      >
                        {emailOtpLoading ? 'Sending...' : emailOtpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    {checking === 'email' && <p className="text-brand-purple text-xs">Checking...</p>}
                    {emailOtpVerified && !emailOtpError && (
                      <p className="text-green-600 text-xs">Email verified via OTP.</p>
                    )}
                    {emailOtpError && <p className="text-red-500 text-xs">{emailOtpError}</p>}
                    {emailOtpSent && !emailOtpVerified && (
                      <div className="flex flex-wrap gap-2 items-stretch">
                        <input
                          type="text"
                          value={emailOtp}
                          onChange={e => setEmailOtp(e.target.value)}
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          className="flex-1 px-3 py-2 border rounded-lg bg-[var(--background)] text-[color:var(--foreground)] border-[var(--foreground)/20] text-sm min-w-0"
                        />
                        <button
                          type="button"
                          onClick={verifyEmailOtp}
                          disabled={emailOtpLoading || emailOtp.length < 6}
                          className="px-2 sm:px-3 py-2 h-full text-xs sm:text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] flex-shrink-0"
                        >
                          {emailOtpLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => checkExists('phone', formData.phone)}
                    required
                    pattern="[0-9]{10}"
                    className={`w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  {checking === 'phone' && <p className="text-brand-purple text-xs mt-1">Checking...</p>}
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-heading font-bold">Bank Account Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Account Number *</label>
                  <input type="text" name="bankAccount" value={formData.bankAccount ?? ''} onChange={handleChange} required className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200" placeholder="Enter bank account number"/>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">IFSC *</label>
                  <input type="text" name="bankIfsc" value={formData.bankIfsc ?? ''} onChange={handleChange} required className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200" placeholder="Enter IFSC code"/>
                  {errors.bankIfsc && <p className="text-red-500 text-xs mt-1">{errors.bankIfsc}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Bank Name *</label>
                  <input type="text" name="bankName" value={formData.bankName ?? ''} onChange={handleChange} required className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200" placeholder="Enter bank name"/>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Branch Name *</label>
                  <input type="text" name="bankBranch" value={formData.bankBranch ?? ''} onChange={handleChange} required className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200" placeholder="Enter branch name"/>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Business Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200"
                  placeholder="Enter full business address"
                />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-bold">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value="India"
                    readOnly
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] cursor-not-allowed opacity-70"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    disabled={!states.length}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">District *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    disabled={!districts.length}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200"
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
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200"
                    placeholder="Enter city"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  minLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  pattern="[0-9]{6}"
                  required
                  className={`w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200 ${errors.pincode ? 'border-red-500' : ''}`}
                  placeholder="Enter 6-digit pincode"
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
            </motion.div>
            <div className="space-y-4 pt-8 border-t border-[var(--foreground)/20]">
              <h2 className="text-lg sm:text-xl font-heading font-bold">Tax Information</h2>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasGST"
                  name="hasGST"
                  checked={formData.hasGST}
                  onChange={handleChange}
                  className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                />
                <label htmlFor="hasGST" className="text-sm font-medium text-[color:var(--foreground)]">I have GST Number</label>
              </div>

              {formData.hasGST ? (
                <>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">GST Number *</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    onBlur={() => checkExists('gstNumber', formData.gstNumber)}
                    pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                    required
                    className={`w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200 ${errors.gstNumber ? 'border-red-500' : ''}`}
                    placeholder="Enter 15-digit GST number"
                  />
                  {errors.gstNumber && <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>}
                  {checking === 'gstNumber' && <p className="text-brand-purple text-xs mt-1">Checking...</p>}
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">PAN Number *</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      onBlur={() => checkExists('panNumber', formData.panNumber)}
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      required
                      className={`w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200 ${errors.panNumber ? 'border-red-500' : ''}`}
                      placeholder="Enter 10-digit PAN number"
                    />
                    {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
                    {checking === 'panNumber' && <p className="text-brand-purple text-xs mt-1">Checking...</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)]">Aadhaar Number *</label>
                    <input
                      type="text"
                      name="aadhaar"
                      value={formData.aadhaar ?? ''}
                      onChange={handleChange}
                      pattern="[0-9]{12}"
                      maxLength={12}
                      minLength={12}
                      required
                      className={`w-full px-4 py-2 bg-[var(--background)] border border-[var(--foreground)/20] rounded-lg text-[color:var(--foreground)] placeholder-[var(--foreground)/50] focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all duration-200 ${errors.aadhaar ? 'border-red-500' : ''}`}
                      placeholder="Enter 12-digit Aadhaar number"
                    />
                    {errors.aadhaar && <p className="text-red-500 text-xs mt-1">{errors.aadhaar}</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[var(--foreground)/20]">
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-bold mb-4">Business Logo</h2>
                <div className="group border-2 border-dashed p-4 sm:p-6 text-center rounded-xl border-[var(--foreground)/20] bg-[var(--background)]/70 transition-all duration-200 hover:border-brand-purple/60 hover:bg-brand-purple/5 hover:-translate-y-0.5">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-colors duration-200">
                    <Upload className="w-6 h-6" />
                  </div>
                  <label className="cursor-pointer text-brand-purple font-semibold">
                    Upload Logo
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  <p className="mt-1 text-xs text-[var(--foreground)/60]">
                    PNG or JPG, up to 2MB
                  </p>
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
                {formData.businessLogoUrl && (
                  <div className="mt-4 p-3 border rounded-lg bg-[var(--background)] flex flex-col items-center">
                    <p className="text-xs text-[var(--foreground)/70] mb-2">Preview</p>
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                      <Image
                        src={formData.businessLogoUrl}
                        alt="Business Logo"
                        fill
                        sizes="112px"
                        className="object-contain rounded-md border border-[var(--foreground)/20] bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-heading font-bold mb-4">Bank Document</h2>
                <label className="group border-2 border-dashed p-4 sm:p-6 text-center rounded-xl border-[var(--foreground)/20] bg-[var(--background)]/70 transition-all duration-200 hover:border-brand-purple/60 hover:bg-brand-purple/5 hover:-translate-y-0.5 block cursor-pointer">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-colors duration-200">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-brand-purple font-semibold">
                    Cancel Cheque or Passbook
                  </span>
                  <input type="file" accept="image/*" onChange={handleBankDocSelect} className="hidden" />
                  <p className="mt-1 text-xs text-[var(--foreground)/60]">
                    cheque leaf or first page of passbook
                  </p>
                </label>
                {formData.bankDocumentImage && (
                  <div className="mt-4 p-3 border rounded-lg bg-[var(--background)] flex flex-col items-center">
                    <p className="text-xs text-[var(--foreground)/70] mb-2">Preview</p>
                    <img
                      src={formData.bankDocumentImage}
                      alt="Bank Document"
                      className="max-h-28 sm:max-h-32 rounded-md border border-[var(--foreground)/20] bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 focus:ring-4 focus:ring-brand-purple/50 focus:outline-none transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-lg mt-8"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
            <div className="pt-6 text-center border-t border-[var(--foreground)/20] mt-8">
              <p className="text-sm text-[var(--foreground)/80]">
                Already have an account? 
                <Link href="/seller-login" className="text-brand-purple hover:underline ml-1">
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
