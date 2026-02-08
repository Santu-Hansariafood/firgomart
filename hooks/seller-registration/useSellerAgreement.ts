import { useState } from 'react';

export const useSellerAgreement = () => {
  const [showAgreementPopup, setShowAgreementPopup] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  return {
    showAgreementPopup,
    setShowAgreementPopup,
    agreedToTerms,
    setAgreedToTerms,
    pendingSubmit,
    setPendingSubmit,
  };
};
