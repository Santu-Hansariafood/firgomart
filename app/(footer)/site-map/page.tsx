"use client";

import dynamic from "next/dynamic";
import React, { Suspense, useEffect } from "react";
import policies from "@/data/policies.json";
import Loading from "@/app/loading";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));

const SitemapPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const sections = policies.sitemap || [];
  const header = sections.find((s: any) => s.effectiveDate) || null;

  return (
    <Suspense fallback={<Loading />}>
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 sm:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Title level={1} className="text-center mb-6">
          Sitemap – FirgoMart.com
        </Title>
        {header?.effectiveDate && (
          <Paragraph className="text-center text-[var(--foreground)/60]">
            Effective Date: <span className="text-[var(--foreground)]">{header.effectiveDate}</span>
          </Paragraph>
        )}
        <div className="bg-[var(--foreground)/10] p-6 sm:p-8 rounded-2xl shadow-lg space-y-6 border border-[var(--foreground)/20]">
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
