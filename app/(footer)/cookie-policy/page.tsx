import Loading from "@/app/loading";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const PolicyContent = dynamic(() => import("@/components/common/PolicyContent/PolicyContent"));

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
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 sm:px-8 py-12">
        <PolicyContent policy="cookies" />
      </div>
    </Suspense>
  );
};

export default CookiePolicyPage;
