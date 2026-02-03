import { useState, ChangeEvent, FormEvent } from "react";
import locationData from "@/data/country.json";

export interface SellerFormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  aadhaar?: string;
  hasGST: boolean;
  businessLogo: File | null;
  businessLogoUrl?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankName?: string;
  bankBranch?: string;
  bankDocumentImage?: string;
  bankDocumentUrl?: string;
}

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

  const [states] = useState<string[]>(() => {
    const india = locationData.countries.find((c) => c.country === "India");
    return india ? india.states.map((s) => s.state).sort() : [];
  });
  const [districts, setDistricts] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(() => {
    try {
      return (
        typeof window !== "undefined" &&
        localStorage.getItem("sellerRegSubmitted") === "true"
      );
    } catch {
      return false;
    }
  });
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState<string | null>(null);
  const [bankDocSrc, setBankDocSrc] = useState<string | null>(null);
  const [croppingBankDoc, setCroppingBankDoc] = useState<boolean>(false);
  const [showAgreementPopup, setShowAgreementPopup] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [pendingSubmit, setPendingSubmit] = useState<boolean>(false);
  const [emailOtp, setEmailOtp] = useState<string>("");
  const [emailOtpSent, setEmailOtpSent] = useState<boolean>(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState<boolean>(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState<boolean>(false);
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const checkExists = async (field: string, value: string) => {
    if (!value) return;
    setChecking(field);
    try {
      const res = await fetch("/api/seller/check-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });
      const data = await res.json();
      if (data.exists) {
        let msg = "";
        switch (field) {
          case "email":
            msg = "Email already registered";
            break;
          case "phone":
            msg = "Phone number already registered";
            break;
          case "gstNumber":
            msg = "GST Number already registered";
            break;
          case "panNumber":
            msg = "PAN Number already registered";
            break;
          default:
            msg = "Already registered";
        }
        setErrors((prev) => ({ ...prev, [field]: msg }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChecking(null);
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
    if (name === "pincode" || name === "aadhaar" || name === "phone") {
      val = val.replace(/\D/g, "");
    }
    if (name === "email") {
      val = val.trim();
      setEmailOtp("");
      setEmailOtpSent(false);
      setEmailOtpVerified(false);
      setEmailOtpError(null);
    }

    if (name === "country" && val !== "India") {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ?? false) : val,
    }));

    const validateField = (n: string, v: string) => {
      if (n === "email")
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? ""
          : "Invalid email format";
      if (n === "pincode")
        return /^\d{6}$/.test(v) ? "" : "Pincode must be 6 digits";
      if (n === "aadhaar")
        return /^\d{12}$/.test(v) ? "" : "Aadhaar must be 12 digits";
      if (n === "panNumber")
        return /^[A-Z]{5}\d{4}[A-Z]$/.test(v) ? "" : "Invalid PAN format";
      if (n === "gstNumber")
        return /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(v)
          ? ""
          : "Invalid GST format";
      if (n === "bankIfsc")
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? "" : "Invalid IFSC format";
      if (n === "ownerName")
        return /^[A-Za-z ]{2,}$/.test(v) ? "" : "Enter a valid name";
      if (n === "businessName")
        return /^[-&.A-Za-z0-9 ]{2,}$/.test(v)
          ? ""
          : "Enter a valid business name";
      return "";
    };

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
      const countryObj = locationData.countries.find(
        (item) => item.country === formData.country,
      );
      const stateObj = countryObj?.states.find((s) => s.state === value);
      const sortedDistricts = stateObj?.districts.sort() ?? [];
      setDistricts(sortedDistricts);
      setFormData((prev) => ({
        ...prev,
        district: "",
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, businessLogo: file }));
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";
      if (cloudName && preset) {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", preset);
        setUploadingLogo(true);
        fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: form,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.secure_url) {
              setFormData((prev) => ({
                ...prev,
                businessLogoUrl: data.secure_url,
              }));
            }
          })
          .catch(() => {})
          .finally(() => setUploadingLogo(false));
      }
    }
  };

  const handleBankDocSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      setBankDocSrc(src);
      setCroppingBankDoc(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const requestEmailOtp = async () => {
    const email = formData.email.trim();
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required for OTP" }));
      return;
    }
    if (errors.email) return;
    setEmailOtpError(null);
    setEmailOtpLoading(true);
    try {
      const res = await fetch("/api/seller/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          (data && typeof data.error === "string" && data.error) ||
          "Failed to send OTP";
        setEmailOtpError(msg);
        setEmailOtpSent(false);
      } else {
        setEmailOtpSent(true);
      }
    } catch {
      setEmailOtpError("Network error while sending OTP");
      setEmailOtpSent(false);
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    const code = emailOtp.trim();
    if (!/^\d{6}$/.test(code)) {
      setEmailOtpError("Enter the 6-digit OTP sent to your email");
      return;
    }
    const email = formData.email.trim();
    if (!email) {
      setEmailOtpError("Email is required for OTP verification");
      return;
    }
    setEmailOtpLoading(true);
    setEmailOtpError(null);
    try {
      const res = await fetch("/api/seller/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          (data && typeof data.error === "string" && data.error) ||
          "Invalid or expired OTP";
        setEmailOtpError(msg);
        setEmailOtpVerified(false);
      } else {
        setEmailOtpVerified(true);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.email;
          return next;
        });
      }
    } catch {
      setEmailOtpError("Network error while verifying OTP");
      setEmailOtpVerified(false);
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const submitRegistration = async () => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    setServerError(null);
    const payload = {
      ...formData,
      businessName: formData.businessName.trim(),
      ownerName: formData.ownerName.trim(),
      businessLogoUrl: formData.businessLogoUrl,
      documentUrls: [],
      country: formData.country,
      state: formData.state,
    };

    if (payload.hasGST) {
      payload.panNumber = "";
      payload.aadhaar = "";
    } else {
      payload.gstNumber = "";
    }

    if (formData.bankDocumentImage) {
      try {
        const up = await fetch("/api/upload/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: [formData.bankDocumentImage],
          }),
        });
        const upJson = await up.json();
        if (up.ok && Array.isArray(upJson.urls) && upJson.urls[0]) {
          payload.bankDocumentUrl = upJson.urls[0];
        }
      } catch {}
    }

    const res = await fetch("/api/seller/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (res.ok) {
      setSubmitted(true);
      try {
        localStorage.setItem("sellerRegSubmitted", "true");
      } catch {}
      setIsSubmitting(false);
      return true;
    } else {
      const msg =
        data && typeof data.error === "string" && data.error
          ? data.error
          : "Registration failed";
      setServerError(msg);
      if (msg === "Email already registered") {
        setErrors((prev) => ({ ...prev, email: msg }));
      }
      if (msg === "Phone already registered") {
        setErrors((prev) => ({ ...prev, phone: msg }));
      }
      if (msg === "GST Number already registered") {
        setErrors((prev) => ({ ...prev, gstNumber: msg }));
      }
      if (msg === "PAN Number already registered") {
        setErrors((prev) => ({ ...prev, panNumber: msg }));
      }
      setIsSubmitting(false);
      return false;
    }
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
