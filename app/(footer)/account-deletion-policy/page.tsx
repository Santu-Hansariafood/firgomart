import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Deletion & Data Erasure Policy - FirgoMart",
  description: "Learn how FirgoMart handles account deletion, data erasure, and statutory retention for buyers, sellers, and international users.",
  alternates: {
    canonical: "/account-deletion-policy",
  },
  openGraph: {
    title: "Account Deletion & Data Erasure Policy - FirgoMart",
    description: "Learn how FirgoMart handles account deletion, data erasure, and statutory retention for buyers, sellers, and international users.",
    url: "/account-deletion-policy",
    type: "website",
  },
};

const AccountDeletionPolicyPage = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 sm:px-8 py-12">
      <div className="w-full max-w-[210mm] mx-auto bg-background text-foreground shadow-none sm:shadow-2xl min-h-screen sm:min-h-[297mm] p-4 sm:p-10 my-0 sm:my-8 relative border-0 sm:border border-foreground/20 rounded-lg">
        <div className="space-y-4 font-serif text-foreground/80">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground uppercase underline decoration-2 underline-offset-4 decoration-brand-purple">
              Account Deletion &amp; Data Erasure Policy
            </h1>
            <div className="mt-1 text-sm text-foreground/60 italic">
              <span>Effective Date: 26 July 2025</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-foreground/80">
            This Account Deletion &amp; Data Erasure Policy (“Policy”) is issued in compliance with applicable Indian laws, including but not limited to the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000, the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the Consumer Protection (E-Commerce) Rules, 2020, the Goods and Services Tax Act, 2017, and applicable Income Tax laws of India. For users accessing services from outside India, this Policy is implemented in alignment with internationally recognized data protection principles, including GDPR standards where applicable.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            1. Legal Basis
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            This Policy sets out the legal basis and framework under which FirgoMart processes account deletion and associated data erasure requests in compliance with the above-mentioned laws and regulations.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            2. Applicability
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            This Policy applies to Buyers / Customers, Sellers / Vendors / Merchants, and international users accessing the platform. It governs the procedure for requesting account deletion and the handling, retention, and erasure of associated personal data.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            3. Right to Withdraw Consent and Request Deletion
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            In accordance with the Digital Personal Data Protection Act, 2023, users are entitled to withdraw previously granted consent, request deletion of personal data, and seek grievance redressal. Users may submit a deletion request through the in-product Account Settings → Delete Account flow (website or mobile application) or by written request to the designated support or grievance email. The Company reserves the right to verify identity prior to processing any deletion request.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            4. Deletion Process and Timeline
          </h2>
          <h3 className="text-base font-bold text-foreground mt-2">
            4.1 Submission of Request
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            The deletion request shall be recorded on the date of submission (“Day 0”).
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            4.2 Identity Verification (Within 48 Hours)
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            The Company may verify the request through OTP authentication, email confirmation, or documentation where necessary.
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            4.3 Account Deactivation
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            Upon successful verification, the account shall be deactivated.
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            4.4 Permanent Deletion (Within 7 Calendar Days)
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            Subject to legal retention obligations, personal data shall be permanently deleted within seven (7) calendar days from successful verification. Users shall receive an acknowledgment of the deletion request and confirmation upon completion of permanent deletion.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            5. Data Subject to Deletion
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Subject to statutory exceptions, the following data shall be erased: profile information, contact details, saved addresses, authentication credentials, wishlist and cart data, marketing preferences, and uploaded non-financial documents.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            6. Statutory Data Retention Obligations
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Notwithstanding any deletion request, certain information may be retained to comply with legal and regulatory requirements.
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            6.1 Financial and Tax Records
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            Under applicable GST and Income Tax laws, the Company is required to retain invoices, transaction records, seller commission statements, and payment and settlement records for the legally mandated period (typically 6–8 years).
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            6.2 Legal and Regulatory Compliance
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            Data may be retained where necessary for fraud prevention or investigation, chargeback disputes, legal proceedings, or government or regulatory authority directives. Retained data shall be securely stored, not used for marketing purposes, and accessed strictly on a need-to-know basis.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            7. Seller-Specific Conditions
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Seller account deletion shall be processed only upon completion of all pending orders, settlement of refunds and returns, clearance of outstanding platform dues, resolution of active disputes, and compliance with GST and other statutory filings. The Company reserves the right to defer permanent deletion until all contractual and statutory obligations are satisfied.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            8. International Users
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            For users located outside India, deletion requests shall be processed under applicable Indian law. Where GDPR or equivalent regulations apply, requests shall be handled in accordance with recognized “Right to Erasure” principles. Cross-border data transfers shall comply with applicable Indian government notifications and data protection regulations.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            9. Grounds for Refusal or Delay
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            The Company may refuse or delay deletion where retention is mandated by law, required by a regulatory authority, necessary for enforcement of contractual rights, necessary for dispute resolution, or required to protect platform integrity or prevent fraud. Users shall be informed where deletion is restricted due to statutory or regulatory obligations.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            10. Grievance Redressal Mechanism
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            In compliance with the IT Rules, 2021 and the Consumer Protection (E-Commerce) Rules, 2020, complaints shall be acknowledged within 48 hours and resolution shall be provided within 15 days from receipt of complaint. Users may contact the Company for grievance redressal as provided below.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            11. Amendments
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            The Company reserves the right to modify or update this Policy to ensure continued legal compliance. Updated versions shall be published on the official website with a revised effective date.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            Contact Information
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Email – support@firgomart.com
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            Website – www.firgomart.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionPolicyPage;

