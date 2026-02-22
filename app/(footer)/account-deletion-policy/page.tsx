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
            This Account Deletion &amp; Data Erasure Policy (“Policy”) is issued in compliance with applicable laws of India, including but not limited to the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000, the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the Consumer Protection (E-Commerce) Rules, 2020, the Goods and Services Tax Act, 2017, and applicable Income Tax laws of India. For users accessing services from outside India, this Policy is implemented in alignment with internationally recognized data protection standards, including GDPR principles where applicable.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            1. Legal Basis
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            This Policy sets out the legal basis and framework under which FirgoMart processes account deletion and associated data erasure requests in compliance with the above-mentioned laws and regulations.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            2. Scope and Applicability
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            This Policy applies to Buyers / Customers, Sellers / Vendors / Merchants, and international users accessing the platform. It governs the procedure for requesting account deletion and explains how associated personal data is processed, erased, or retained in accordance with statutory obligations.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            3. Right to Withdraw Consent and Request Deletion
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            In accordance with the Digital Personal Data Protection Act, 2023, users have the right to withdraw previously granted consent, request deletion of their personal data, and seek grievance redressal.
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            Users may request deletion through either of the following methods:
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            <span className="font-semibold">Option 1 – In-App / Website:</span> Login → Profile Settings → Select “Delete Account” → Confirm via OTP or registered email verification.
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            <span className="font-semibold">Option 2 – Email Request:</span> Send a deletion request from the registered email address to support@firgomart.com.
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            The Company reserves the right to verify user identity before processing any deletion request to prevent unauthorized access or fraudulent activity.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            4. Deletion Process and Timeline
          </h2>
          <h3 className="text-base font-bold text-foreground mt-2">
            4.1 Submission of Request
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            The deletion request is recorded on the date of submission (“Day 0”).
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            4.2 Identity Verification (Within 48 Hours)
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            The Company may verify the request through OTP authentication, email confirmation, or supporting documentation where necessary.
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            4.3 Account Deactivation
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            Upon successful verification, the account will be immediately deactivated.
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            4.4 Permanent Deletion (Within 7 Calendar Days)
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            Subject to statutory retention requirements, personal data will be permanently deleted within seven (7) calendar days from successful verification. Users will receive an acknowledgment confirming receipt of the deletion request and a final confirmation once permanent deletion is completed.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            5. Data Subject to Deletion
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Subject to applicable legal exceptions, the following information will be permanently deleted: profile information, contact details, authentication credentials, saved addresses, wishlist and cart data, marketing preferences, and uploaded non-financial documents.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            6. Statutory Data Retention Obligations
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Notwithstanding any deletion request, certain data may be retained to comply with legal, tax, and regulatory obligations.
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            6.1 Financial and Tax Records
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            In accordance with GST and Income Tax laws, the Company is required to retain tax invoices, transaction records, seller commission statements, and payment and settlement records for the legally mandated period (generally 6–8 years or as required by law).
          </p>
          <h3 className="text-base font-bold text-foreground mt-2">
            6.2 Legal and Regulatory Requirements
          </h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            Data may also be retained where necessary for fraud detection and prevention, chargeback or payment disputes, ongoing investigations, court orders or government directives, or enforcement of contractual rights.
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            Retained data shall be securely stored with restricted access, not be used for marketing or promotional purposes, and be accessed strictly for compliance or legal necessity.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            7. Seller-Specific Conditions
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Seller account deletion shall be processed only upon satisfaction of the following conditions: completion of all pending orders, settlement of refunds and returns, clearance of outstanding platform fees or dues, resolution of active disputes, and compliance with GST and statutory filing requirements. The Company reserves the right to defer permanent deletion until all contractual and regulatory obligations are fulfilled.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            8. International Users
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            For users located outside India, deletion requests shall be processed under applicable Indian law. Where GDPR or equivalent data protection regulations apply, requests shall be handled in accordance with recognized “Right to Erasure” standards. Cross-border data transfers shall comply with applicable Indian government notifications and lawful data transfer mechanisms.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            9. Grounds for Refusal or Delay
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            The Company may refuse or delay deletion where retention is mandated by applicable law, required by regulatory or governmental authority, necessary for dispute resolution or legal proceedings, required to protect platform security and integrity, or necessary to prevent fraud or misuse. Users will be informed where deletion cannot be completed due to statutory or regulatory obligations.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            10. Grievance Redressal Mechanism
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            In compliance with applicable laws, complaints shall be acknowledged within 48 hours and resolution shall be provided within 15 days from receipt of complaint. Users may contact the Company for grievance redressal through the contact details provided below.
          </p>

          <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
            11. Amendments
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            The Company reserves the right to amend or update this Policy to ensure continued legal and regulatory compliance. Updated versions shall be published on the official website with a revised effective date.
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
