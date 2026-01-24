import React from "react";
import { Metadata } from "next";
import PolicyContent from "@/components/common/PolicyContent/PolicyContent";

export const metadata: Metadata = {
  title: "Sitemap - FirgoMart | Navigate Our Store",
  description: "Explore the FirgoMart Sitemap to easily find products, categories, and important pages on our online store.",
  alternates: {
    canonical: "/site-map",
  },
  openGraph: {
    title: "Sitemap - FirgoMart",
    description: "Explore the FirgoMart Sitemap to easily find products, categories, and important pages on our online store.",
    url: "/site-map",
    type: "website",
  },
};

const SitemapPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 sm:px-8 py-12">
      <PolicyContent policy="sitemap" />
    </div>
  );
};

export default SitemapPage;
