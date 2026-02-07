'use client'

import { motion } from 'framer-motion'
import { 
  Upload, CheckCircle, User, Building2, Mail, Phone, MapPin, 
  CreditCard, FileText, Landmark, Map, Flag, Globe, Hash
} from 'lucide-react'
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
            <div className="relative bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 p-6 sm:p-8">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-purple/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-4">
                  <Link href="/" className="block relative w-48 h-14 transition-opacity hover:opacity-80">
                    <Image
                      src="/logo/firgomart.png"
                      alt="Firgomart"
                      fill
                      priority
                      className="object-contain object-left"
                      sizes="(max-width: 768px) 192px, 256px"
                    />
                  </Link>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--foreground)] tracking-tight">
                      Partner with Firgomart
                    </h1>
                    <p className="text-sm text-[var(--foreground)/60] mt-1">
                      Join our global marketplace and reach millions of customers.
                    </p>
                  </div>
                </div>

                <Link 
                  href="/"
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/80 hover:text-brand-purple transition-all duration-300 font-medium text-sm"
                >
                  <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                  <span>Back to Home</span>
                </Link>
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
              className="space-y-6"
            >
              <div className="flex items-center gap-3 pb-2 border-b border-[var(--foreground)/10]">
                <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple">
                  <Building2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-heading font-bold">
                  Business Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Business Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                        errors.businessName 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[var(--foreground)/15] focus:border-brand-purple'
                      } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                      placeholder="Enter business name"
                    />
                  </div>
                  {errors.businessName && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.businessName}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Owner Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      required
                      className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                        errors.ownerName 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[var(--foreground)/15] focus:border-brand-purple'
                      } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                      placeholder="Enter owner's full name"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Email Address <span className="text-red-500">*</span></label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative group flex-1">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => checkExists('email', formData.email)}
                          required
                          className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                            errors.email 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-[var(--foreground)/15] focus:border-brand-purple'
                          } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                          placeholder="Enter email address"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={requestEmailOtp}
                        disabled={emailOtpLoading || !formData.email || !!errors.email}
                        className="px-4 py-2 font-medium rounded-xl bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-brand-purple/20 transition-all whitespace-nowrap"
                      >
                        {emailOtpLoading ? 'Sending...' : emailOtpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    </div>
                    
                    {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
                    {checking === 'email' && <p className="text-brand-purple text-xs ml-1 animate-pulse">Checking availability...</p>}
                    
                    {emailOtpVerified && !emailOtpError && (
                      <div className="flex items-center gap-2 text-green-600 text-xs bg-green-500/10 p-2 rounded-lg ml-1 border border-green-500/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Email verified successfully
                      </div>
                    )}
                    
                    {emailOtpError && <p className="text-red-500 text-xs ml-1">{emailOtpError}</p>}
                    
                    {emailOtpSent && !emailOtpVerified && (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                        <div className="relative group flex-1">
                          <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                          <input
                            type="text"
                            value={emailOtp}
                            onChange={e => setEmailOtp(e.target.value)}
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={verifyEmailOtp}
                          disabled={emailOtpLoading || emailOtp.length < 6}
                          className="px-6 py-2 font-medium rounded-xl bg-green-600/10 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-green-600/20 transition-all whitespace-nowrap"
                        >
                          {emailOtpLoading ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => checkExists('phone', formData.phone)}
                      required
                      pattern="[0-9]{10}"
                      className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                        errors.phone 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[var(--foreground)/15] focus:border-brand-purple'
                      } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.phone}</p>}
                  {checking === 'phone' && <p className="text-brand-purple text-xs mt-1.5 ml-1 animate-pulse">Checking availability...</p>}
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-6 pt-6 border-t border-[var(--foreground)/10]"
            >
              <div className="flex items-center gap-3 pb-2 border-b border-[var(--foreground)/10]">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Landmark className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-heading font-bold">Bank Account Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Account Number <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input 
                      type="text" 
                      name="bankAccount" 
                      value={formData.bankAccount ?? ''} 
                      onChange={handleChange} 
                      required 
                      className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all duration-200 text-[color:var(--foreground)] placeholder-[var(--foreground)/40]" 
                      placeholder="Enter bank account number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">IFSC Code <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input 
                      type="text" 
                      name="bankIfsc" 
                      value={formData.bankIfsc ?? ''} 
                      onChange={handleChange} 
                      required 
                      className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${errors.bankIfsc ? 'border-red-500 focus:border-red-500' : 'border-[var(--foreground)/15] focus:border-brand-purple'} text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                  {errors.bankIfsc && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.bankIfsc}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Bank Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input 
                      type="text" 
                      name="bankName" 
                      value={formData.bankName ?? ''} 
                      onChange={handleChange} 
                      required 
                      className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all duration-200 text-[color:var(--foreground)] placeholder-[var(--foreground)/40]" 
                      placeholder="Enter bank name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Branch Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input 
                      type="text" 
                      name="bankBranch" 
                      value={formData.bankBranch ?? ''} 
                      onChange={handleChange} 
                      required 
                      className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all duration-200 text-[color:var(--foreground)] placeholder-[var(--foreground)/40]" 
                      placeholder="Enter branch name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Business Address <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all duration-200 text-[color:var(--foreground)] placeholder-[var(--foreground)/40] resize-none"
                    placeholder="Enter full business address"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pb-2 pt-4 border-b border-[var(--foreground)/10]">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-heading font-bold">Location Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Country <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Flag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40]" />
                    <input
                      type="text"
                      name="country"
                      value="India"
                      readOnly
                      className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] cursor-not-allowed opacity-70 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">State <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      disabled={!states.length}
                      className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all duration-200 appearance-none"
                    >
                      <option value="">Select State</option>
                      {states.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-[var(--foreground)/40]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">District <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      disabled={!districts.length}
                      className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all duration-200 appearance-none"
                    >
                      <option value="">Select District</option>
                      {districts.map(dc => (
                        <option key={dc} value={dc}>
                          {dc}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-[var(--foreground)/40]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">City <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] placeholder-[var(--foreground)/40] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all duration-200"
                      placeholder="Enter city"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Pincode <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    minLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    pattern="[0-9]{6}"
                    required
                    className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl text-[color:var(--foreground)] placeholder-[var(--foreground)/40] focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${errors.pincode ? 'border-red-500 focus:border-red-500' : 'border-[var(--foreground)/15] focus:border-brand-purple'}`}
                    placeholder="Enter 6-digit pincode"
                  />
                </div>
                {errors.pincode && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.pincode}</p>}
              </div>
            </motion.div>
            <div className="pt-8 border-t border-[var(--foreground)/10]">
              <div className="flex items-center gap-3 pb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-heading font-bold">Tax Information</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)/10] hover:bg-[var(--foreground)]/10 transition-colors">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="hasGST"
                      name="hasGST"
                      checked={formData.hasGST}
                      onChange={handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-[var(--foreground)/30] bg-[var(--background)] checked:border-brand-purple checked:bg-brand-purple transition-all"
                    />
                    <CheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <label htmlFor="hasGST" className="text-sm font-medium text-[color:var(--foreground)] cursor-pointer select-none flex-1">
                    I have a GST Number
                  </label>
                </div>

                {formData.hasGST ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">GST Number <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        onBlur={() => checkExists('gstNumber', formData.gstNumber)}
                        pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                        required
                        className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                          errors.gstNumber 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-[var(--foreground)/15] focus:border-brand-purple'
                        } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                        placeholder="Enter 15-digit GST number"
                      />
                    </div>
                    {errors.gstNumber && <p className="text-red-500 text-xs ml-1">{errors.gstNumber}</p>}
                    {checking === 'gstNumber' && <p className="text-brand-purple text-xs ml-1 animate-pulse">Checking availability...</p>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">PAN Number <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                        <input
                          type="text"
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleChange}
                          onBlur={() => checkExists('panNumber', formData.panNumber)}
                          pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                          required
                          className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                            errors.panNumber 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-[var(--foreground)/15] focus:border-brand-purple'
                          } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                          placeholder="Enter 10-digit PAN number"
                        />
                      </div>
                      {errors.panNumber && <p className="text-red-500 text-xs ml-1">{errors.panNumber}</p>}
                      {checking === 'panNumber' && <p className="text-brand-purple text-xs ml-1 animate-pulse">Checking availability...</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">Aadhaar Number <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                        <input
                          type="text"
                          name="aadhaar"
                          value={formData.aadhaar ?? ''}
                          onChange={handleChange}
                          pattern="[0-9]{12}"
                          maxLength={12}
                          minLength={12}
                          required
                          className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                            errors.aadhaar 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-[var(--foreground)/15] focus:border-brand-purple'
                          } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                          placeholder="Enter 12-digit Aadhaar number"
                        />
                      </div>
                      {errors.aadhaar && <p className="text-red-500 text-xs ml-1">{errors.aadhaar}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-[var(--foreground)/10]">
              <div className="flex items-center gap-3 pb-6">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <Upload className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-heading font-bold">Documents</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Logo Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">Business Logo</label>
                  <div className="group relative">
                    <div className={`border-2 border-dashed p-6 text-center rounded-xl transition-all duration-300 ${
                      formData.businessLogoUrl 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : 'border-[var(--foreground)/20] bg-[var(--background)] hover:border-brand-purple/50 hover:bg-brand-purple/5'
                    }`}>
                      {formData.businessLogoUrl ? (
                        <div className="relative z-10">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <p className="text-green-600 font-medium">Logo Uploaded</p>
                          <div className="mt-4 relative w-32 h-32 mx-auto rounded-lg overflow-hidden border border-green-200 shadow-sm">
                            <Image
                              src={formData.businessLogoUrl}
                              alt="Business Logo"
                              fill
                              sizes="128px"
                              className="object-contain bg-white"
                            />
                          </div>
                          <label className="cursor-pointer text-xs text-brand-purple hover:underline mt-2 block">
                            Change Logo
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-7 h-7" />
                          </div>
                          <label className="cursor-pointer">
                            <span className="text-brand-purple font-bold text-lg hover:underline decoration-2 underline-offset-4">Click to upload</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                          <p className="mt-2 text-sm text-[var(--foreground)/60]">
                            PNG or JPG (Max 2MB)
                          </p>
                          {uploadingLogo && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-brand-purple text-sm font-medium">
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Uploading...
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bank Document Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">Bank Proof</label>
                  <div className="group relative">
                    <label className={`block border-2 border-dashed p-6 text-center rounded-xl transition-all duration-300 cursor-pointer ${
                      formData.bankDocumentImage 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : 'border-[var(--foreground)/20] bg-[var(--background)] hover:border-brand-purple/50 hover:bg-brand-purple/5'
                    }`}>
                      {formData.bankDocumentImage ? (
                        <div className="relative z-10">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <p className="text-green-600 font-medium">Document Selected</p>
                          <div className="mt-4 relative h-32 mx-auto rounded-lg overflow-hidden border border-green-200 shadow-sm bg-white">
                            <img
                              src={formData.bankDocumentImage}
                              alt="Bank Document"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <span className="text-xs text-brand-purple hover:underline mt-2 block">Change Document</span>
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-7 h-7" />
                          </div>
                          <span className="text-brand-purple font-bold text-lg group-hover:underline decoration-2 underline-offset-4">
                            Upload Cheque/Passbook
                          </span>
                          <p className="mt-2 text-sm text-[var(--foreground)/60]">
                              PNG or JPG (Max 2MB)
                          </p>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleBankDocSelect} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-purple/90 text-white rounded-xl shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-bold text-lg flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Registration...
                  </>
                ) : (
                  <>
                    Submit Registration
                    <CheckCircle className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>
              
              <div className="mt-8 text-center">
                <p className="text-[var(--foreground)/60]">
                  Already have a seller account? 
                  <Link href="/seller-login" className="text-brand-purple font-semibold hover:underline ml-1 decoration-2 underline-offset-4">
                    Log in here
                  </Link>
                </p>
              </div>
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
