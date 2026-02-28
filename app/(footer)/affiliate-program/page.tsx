import Loading from "@/app/loading";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const PolicyContent = dynamic(() => import("@/components/common/PolicyContent/PolicyContent"));

export const metadata: Metadata = {
  title: "Affiliate Program - FirgoMart | Join Our Network",
  description: "Join the FirgoMart Affiliate Program and earn commissions by promoting our high-quality products. Learn more about terms and benefits.",
  alternates: {
    canonical: "/affiliate-program",
  },
  openGraph: {
    title: "Affiliate Program - FirgoMart",
    description: "Join the FirgoMart Affiliate Program and earn commissions by promoting our high-quality products. Learn more about terms and benefits.",
    url: "/affiliate-program",
    type: "website",
  },
};

const AffiliateProgramPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 sm:px-8 py-12">
        <PolicyContent policy="affiliate" />
      </div>
    </Suspense>
  );
};

export default AffiliateProgramPage;
