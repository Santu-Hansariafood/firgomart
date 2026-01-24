import React from "react";
import { Metadata } from "next";
import PolicyContent from "@/components/common/PolicyContent/PolicyContent";

export const metadata: Metadata = {
  title: "Terms & Conditions - FirgoMart | Usage Guidelines",
  description: "Review the Terms and Conditions for using FirgoMart. Understand your rights and obligations as a user of our platform.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms & Conditions - FirgoMart",
    description: "Review the Terms and Conditions for using FirgoMart. Understand your rights and obligations as a user of our platform.",
    url: "/terms",
    type: "website",
  },
};

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 sm:px-8 py-12">
      <PolicyContent policy="terms" />
    </div>
  );
};

export default TermsPage;
