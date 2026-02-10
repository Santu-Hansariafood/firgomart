import { useState, ChangeEvent, FormEvent } from "react";
import { useSellerLocation } from "./seller-registration/useSellerLocation";
import { useSellerFiles } from "./seller-registration/useSellerFiles";
import { useSellerOTP } from "./seller-registration/useSellerOTP";
import { useSellerValidation } from "./seller-registration/useSellerValidation";
import { useSellerAgreement } from "./seller-registration/useSellerAgreement";
import { useSellerSubmission } from "./seller-registration/useSellerSubmission";
import { useSellerVerification } from "./seller-registration/useSellerVerification";
import { SellerFormData } from "../types/seller";

export const useSellerRegistration = () => {
  const [formData, setFormData] = useState<SellerFormData>({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
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

  const {
    gstVerified, gstVerifying, gstError, gstData, verifyGst,
    bankVerified, bankVerifying, bankError, bankData, verifyBank,
    ifscVerified, ifscVerifying, ifscError, ifscData, verifyIfsc,
    setGstVerified, setBankVerified
  } = useSellerVerification();

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

  const handleVerifyGst = async () => {
    if (!formData.gstNumber) return;
    const success = await verifyGst(formData.gstNumber);
    if (success) {
       // Auto-fill address if possible, but Cashfree GST verification result structure varies
       // For now, just mark verified
    }
  };

  const handleVerifyIfsc = async (code: string) => {
    const data = await verifyIfsc(code);
    if (data) {
        setFormData(prev => ({
            ...prev,
            bankName: data.BANK,
            bankBranch: data.BRANCH
        }));
    }
  };

  const handleVerifyBank = async () => {
    const newErrors: Partial<Record<keyof SellerFormData, string>> = {};
    if (!formData.bankAccount) newErrors.bankAccount = "Bank Account is required";
    if (!formData.bankIfsc) newErrors.bankIfsc = "IFSC Code is required";
    if (!formData.ownerName) newErrors.ownerName = "Owner Name is required";
    if (!formData.phone) newErrors.phone = "Phone Number is required";

    if (Object.keys(newErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...newErrors }));
        return;
    }

    const success = await verifyBank(
      formData.bankAccount || "", 
      formData.bankIfsc || "", 
      formData.ownerName || "", 
      formData.phone || ""
    );
    
    if (success) {
        // Verification successful
    }
  };

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
    if (name === "bankIfsc" && val.length === 11) {
      handleVerifyIfsc(val);
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

    if (name === "gstNumber") setGstVerified(false);
    if (["bankAccount", "bankIfsc", "ownerName", "phone"].includes(name)) setBankVerified(false);

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
    if (formData.hasGST && !gstVerified) {
      setErrors((prev) => ({
        ...prev,
        gstNumber: "Please verify GST Number",
      }));
      return;
    }
    if (!formData.bankAccount || !formData.bankIfsc || !formData.ownerName || !formData.phone) {
      setErrors((prev) => ({
        ...prev,
        bankAccount: !formData.bankAccount ? "Bank Account is required" : prev.bankAccount,
        bankIfsc: !formData.bankIfsc ? "IFSC Code is required" : prev.bankIfsc,
        ownerName: !formData.ownerName ? "Account Holder Name is required" : prev.ownerName,
        phone: !formData.phone ? "Phone Number is required" : prev.phone,
      }));
      return;
    }
    if (!ifscVerified) {
      setErrors((prev) => ({
        ...prev,
        bankIfsc: "Please verify IFSC Code",
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
    gstVerified, gstVerifying, gstError, gstData, handleVerifyGst,
    bankVerified, bankVerifying, bankError, bankData, handleVerifyBank,
    ifscVerified, ifscVerifying, ifscError, ifscData, handleVerifyIfsc,
    handleStateChange,
  };
};
