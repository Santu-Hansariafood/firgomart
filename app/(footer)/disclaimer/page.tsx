import Loading from "@/app/loading";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const PolicyContent = dynamic(() => import("@/components/common/PolicyContent/PolicyContent"));

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
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 sm:px-8 py-12">
        <PolicyContent policy="disclaimer" />
      </div>
    </Suspense>
  );
};

export default DisclaimerPage;
