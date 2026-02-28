import React, { Suspense } from "react";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import Loading from "@/app/loading";
const PolicyContent = dynamic(() => import("@/components/common/PolicyContent/PolicyContent"));

export const metadata: Metadata = {
  title: "Privacy Policy - FirgoMart | Your Data Security Matters",
  description: "Read FirgoMart's Privacy Policy to understand how we collect, use, and protect your personal data and information.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy - FirgoMart",
    description: "Read FirgoMart's Privacy Policy to understand how we collect, use, and protect your personal data and information.",
    url: "/privacy-policy",
    type: "website",
  },
};

const PrivacyPolicyPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 sm:px-8 py-12">
        <PolicyContent policy="privacy" />
      </div>
    </Suspense>
  );
};

export default PrivacyPolicyPage;
