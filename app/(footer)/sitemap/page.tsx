"use client";

import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import policies from "@/data/policies.json";
import Loading from "@/app/loading";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));

const SitemapPage = () => {
  const sections = policies.sitemap || [];
  const header = sections.find((s: any) => s.effectiveDate) || null;

  return (
    <Suspense fallback={<Loading />}>
    <div className="min-h-screen bg-gray-900 px-4 sm:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Title level={1} className="text-center mb-6">
          Sitemap – FirgoMart.com
        </Title>
        {header?.effectiveDate && (
          <Paragraph className="text-center text-gray-400">
            Effective Date: <span className="text-white">{header.effectiveDate}</span>
          </Paragraph>
        )}
        <div className="bg-gray-800/60 p-6 sm:p-8 rounded-2xl shadow-lg space-y-6 border border-gray-700">
          {sections.map((section: any, idx: number) => (
            <div key={idx} className="space-y-2">
              {section.title && <Title level={3}>{section.title}</Title>}
              {section.content && <Paragraph>{section.content}</Paragraph>}
            </div>
          ))}
        </div>
      </div>
    </div>
    </Suspense>
  );
};

export default SitemapPage;
