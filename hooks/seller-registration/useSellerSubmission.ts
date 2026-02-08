import { useState } from 'react';
import { SellerFormData } from '../../types/seller';

export const useSellerSubmission = () => {
  const [submitted, setSubmitted] = useState<boolean>(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        localStorage.getItem('sellerRegSubmitted') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitRegistration = async (
    formData: SellerFormData,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    setServerError(null);

    const payload: any = {
      ...formData,
      businessName: formData.businessName.trim(),
      ownerName: formData.ownerName.trim(),
      businessLogoUrl: formData.businessLogoUrl,
      documentUrls: [],
      country: formData.country,
      state: formData.state,
    };

    if (payload.hasGST) {
      payload.panNumber = '';
      payload.aadhaar = '';
    } else {
      payload.gstNumber = '';
    }

    if (formData.bankDocumentImage) {
      try {
        const up = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

    const res = await fetch('/api/seller/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        localStorage.setItem('sellerRegSubmitted', 'true');
      } catch {}
      setIsSubmitting(false);
      return true;
    } else {
      const msg =
        data && typeof data.error === 'string' && data.error
          ? data.error
          : 'Registration failed';
      setServerError(msg);
      if (msg === 'Email already registered') {
        setErrors((prev) => ({ ...prev, email: msg }));
      }
      if (msg === 'Phone already registered') {
        setErrors((prev) => ({ ...prev, phone: msg }));
      }
      if (msg === 'GST Number already registered') {
        setErrors((prev) => ({ ...prev, gstNumber: msg }));
      }
      if (msg === 'PAN Number already registered') {
        setErrors((prev) => ({ ...prev, panNumber: msg }));
      }
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    submitted,
    serverError,
    isSubmitting,
    submitRegistration,
  };
};
