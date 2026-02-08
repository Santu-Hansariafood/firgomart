import { useState, ChangeEvent, FormEvent } from "react";
import { useSellerLocation } from "./seller-registration/useSellerLocation";
import { useSellerFiles } from "./seller-registration/useSellerFiles";
import { useSellerOTP } from "./seller-registration/useSellerOTP";
import { useSellerValidation } from "./seller-registration/useSellerValidation";
import { useSellerAgreement } from "./seller-registration/useSellerAgreement";
import { useSellerSubmission } from "./seller-registration/useSellerSubmission";
import { SellerFormData } from "../types/seller";

export const useSellerRegistration = () => {
  const [formData, setFormData] = useState<SellerFormData>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    country: "India",
    state: "",
    district: "",
    city: "",
    pincode: "",
    gstNumber: "",
    panNumber: "",
    hasGST: true,
    businessLogo: null,
  });

  const { states, districts, setDistricts, handleStateChange } = useSellerLocation(formData.country);
  
  const { 
    uploadingLogo, bankDocSrc, setBankDocSrc, croppingBankDoc, setCroppingBankDoc, 
    handleLogoUpload: handleFileChange, handleBankDocSelect 
  } = useSellerFiles(setFormData);
  
  const { 
    emailOtp, setEmailOtp, emailOtpSent, emailOtpVerified, 
    emailOtpLoading, emailOtpError, requestEmailOtp: requestOtp, verifyEmailOtp: verifyOtp,
    resetOTP 
  } = useSellerOTP();

  const { errors, setErrors, checking, checkExists, validateField } = useSellerValidation();

  const {
    showAgreementPopup, setShowAgreementPopup,
    agreedToTerms, setAgreedToTerms,
    pendingSubmit, setPendingSubmit
  } = useSellerAgreement();

  const {
    submitted, serverError, isSubmitting, submitRegistration: performSubmission
  } = useSellerSubmission();

  const requestEmailOtp = async () => {
     await requestOtp(formData.email, errors);
  }

  const verifyEmailOtp = async () => {
    const result = await verifyOtp(formData.email);
    if (result.success) {
        setErrors(prev => {
            const next = { ...prev };
            delete next.email;
            return next;
        });
    }
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    let val = value;

    if (name === "panNumber" || name === "gstNumber" || name === "bankIfsc") {
      val = val.toUpperCase();
    }
    if (name === "pincode" || name === "aadhaar" || name === "phone") {
      val = val.replace(/\D/g, "");
    }
    if (name === "email") {
      val = val.trim();
      resetOTP();
    }

    if (name === "country" && val !== "India") {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ?? false) : val,
    }));

    const err = validateField(name, val);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[name] = err;
      else delete next[name];

      if (name === "hasGST") {
        delete next.gstNumber;
        delete next.panNumber;
        delete next.aadhaar;
      }
      return next;
    });

    if (name === "state") {
      handleStateChange(value);
      setFormData((prev) => ({
        ...prev,
        district: "",
        [name]: value,
      }));
    }
  };

  const submitRegistration = async () => {
    return await performSubmission(formData, setErrors);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;
    if (!emailOtpVerified) {
      setErrors((prev) => ({
        ...prev,
        email: "Please verify your email with OTP",
      }));
      return;
    }
    if (!agreedToTerms) {
      setErrors((prev) => ({
        ...prev,
        agreement: "Please agree to the terms and conditions",
      }));
      setPendingSubmit(true);
      setShowAgreementPopup(true);
      return;
    }
    await submitRegistration();
  };

  return {
    formData,
    setFormData,
    states,
    districts,
    errors,
    checking,
    uploadingLogo,
    submitted,
    bankDocSrc,
    setBankDocSrc,
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
  };
};
