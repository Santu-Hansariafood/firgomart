import React from 'react';
import sellerAgreementContent from '@/data/sellerAgreement.json';

interface AgreementPopupProps {
  agreedToTerms: boolean;
  setAgreedToTerms: (value: boolean) => void;
  errors: Record<string, string>;
  setShowAgreementPopup: (value: boolean) => void;
  pendingSubmit: boolean;
  setPendingSubmit: (value: boolean) => void;
  submitRegistration: () => Promise<boolean>;
}

export const AgreementPopup: React.FC<AgreementPopupProps> = ({
  agreedToTerms,
  setAgreedToTerms,
  errors,
  setShowAgreementPopup,
  pendingSubmit,
  setPendingSubmit,
  submitRegistration,
}) => {
  const agreementTitle = (sellerAgreementContent as { title?: string }).title || 'Seller Agreement';
  const agreementIntro = (sellerAgreementContent as { intro?: string[] }).intro || [];
  const agreementSections = (sellerAgreementContent as {
    sections?: { heading?: string; points?: string[] }[]
  }).sections || [];

  return (
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
              if (!agreedToTerms) return;
              setShowAgreementPopup(false);
              if (pendingSubmit) {
                setPendingSubmit(false);
                await submitRegistration();
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
  );
};
