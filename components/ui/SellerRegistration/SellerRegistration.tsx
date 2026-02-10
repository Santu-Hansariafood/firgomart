'use client'

import React from 'react'
import { CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import BackButton from '@/components/common/BackButton/BackButton'
import { useSellerRegistration } from '@/hooks/useSellerRegistration'

import { RegistrationSuccess } from './components/RegistrationSuccess'
import { RegistrationHeader } from './components/RegistrationHeader'
import { BusinessSection } from './components/BusinessSection'
import { ContactSection } from './components/ContactSection'
import { AddressLocationSection } from './components/AddressLocationSection'
import { TaxSection } from './components/TaxSection'
import { BankSection } from './components/BankSection'
import { DocumentSection } from './components/DocumentSection'
import { AgreementPopup } from './components/AgreementPopup'

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
    isSubmitting,
    gstVerified,
    gstVerifying,
    gstError,
    gstData,
    handleVerifyGst,
    bankError,
    ifscVerified,
    ifscVerifying,
    ifscError,
    handleStateChange
  } = useSellerRegistration()

  if (submitted) {
    return <RegistrationSuccess />
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <BackButton />
        
        <div className="mt-4">
          <RegistrationHeader />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--background)] rounded-2xl shadow-xl border border-[var(--foreground)/15] overflow-hidden"
        >
          {serverError && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 m-6 mb-0 text-red-600 text-sm font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            <BusinessSection 
              formData={formData}
              handleChange={handleChange}
              errors={errors}
            />

            <ContactSection
              formData={formData}
              handleChange={handleChange}
              checkExists={checkExists}
              errors={errors}
              requestEmailOtp={requestEmailOtp}
              emailOtpLoading={emailOtpLoading}
              emailOtpSent={emailOtpSent}
              checking={checking}
              emailOtpVerified={emailOtpVerified}
              emailOtpError={emailOtpError}
              emailOtp={emailOtp}
              setEmailOtp={setEmailOtp}
              verifyEmailOtp={verifyEmailOtp}
            />

            <AddressLocationSection
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              handleStateChange={handleStateChange}
              errors={errors}
              states={states}
              districts={districts}
            />

            <TaxSection
              formData={formData}
              handleChange={handleChange}
              checkExists={checkExists}
              errors={errors}
              gstVerified={gstVerified}
              gstVerifying={gstVerifying}
              gstError={gstError}
              gstData={gstData}
              handleVerifyGst={handleVerifyGst}
              checking={checking}
            />

            <BankSection
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              bankError={bankError}
              ifscVerifying={ifscVerifying}
              ifscVerified={ifscVerified}
              ifscError={ifscError}
            />

            <DocumentSection
              formData={formData}
              handleFileChange={handleFileChange}
              handleBankDocSelect={handleBankDocSelect}
              uploadingLogo={uploadingLogo}
            />

            <div className="pt-6 border-t border-[var(--foreground)/10]">
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
      
      {showAgreementPopup && (
        <AgreementPopup
          agreedToTerms={agreedToTerms}
          setAgreedToTerms={setAgreedToTerms}
          errors={errors}
          setShowAgreementPopup={setShowAgreementPopup}
          pendingSubmit={pendingSubmit}
          setPendingSubmit={setPendingSubmit}
          submitRegistration={submitRegistration}
        />
      )}
    </div>
  )
}

export default SellerRegistration
