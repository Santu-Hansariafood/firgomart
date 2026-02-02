import React from "react";
import { Metadata } from "next";
import PolicyContent from "@/components/common/PolicyContent/PolicyContent";

export const metadata: Metadata = {
  title: "Disclaimer - FirgoMart | Legal Information",
  description: "Read the FirgoMart Disclaimer regarding product information, liability, and third-party links.",
  alternates: {
    canonical: "/disclaimer",
  },
  openGraph: {
    title: "Disclaimer - FirgoMart",
    description: "Read the FirgoMart Disclaimer regarding product information, liability, and third-party links.",
    url: "/disclaimer",
    type: "website",
  },
};

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 sm:px-8 py-12">
      <PolicyContent policy="disclaimer" />
    </div>
  );
};

export default DisclaimerPage;
