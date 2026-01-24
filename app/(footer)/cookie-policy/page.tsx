import React from "react";
import { Metadata } from "next";
import PolicyContent from "@/components/common/PolicyContent/PolicyContent";

export const metadata: Metadata = {
  title: "Cookie Policy - FirgoMart | How We Use Cookies",
  description: "Learn about how FirgoMart uses cookies to improve your shopping experience and deliver personalized content.",
  alternates: {
    canonical: "/cookie-policy",
  },
  openGraph: {
    title: "Cookie Policy - FirgoMart",
    description: "Learn about how FirgoMart uses cookies to improve your shopping experience and deliver personalized content.",
    url: "/cookie-policy",
    type: "website",
  },
};

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 sm:px-8 py-12">
      <PolicyContent policy="cookies" />
    </div>
  );
};

export default CookiePolicyPage;
