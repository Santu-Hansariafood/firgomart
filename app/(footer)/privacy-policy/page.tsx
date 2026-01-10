"use client";
import { useEffect } from "react";
import Loading from "@/app/loading";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import policies from "@/data/policies.json";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const header = policies.privacyPolicy[0];
  const sections = policies.privacyPolicy.slice(1);

  return (
    <Suspense fallback={<Loading />}>
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 sm:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Title level={1} className="text-center mb-6">
          {header?.title || "Privacy Policy"}
        </Title>
        {header?.effectiveDate && (
          <Paragraph className="text-center text-[var(--foreground)/60]">
            Effective Date: <span className="text-[var(--foreground)]">{header.effectiveDate}</span>
          </Paragraph>
        )}
        <div className="bg-[var(--foreground)/10] p-6 sm:p-8 rounded-2xl shadow-lg space-y-6 border border-[var(--foreground)/20]">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              {section.title && <Title level={3}>{section.title}</Title>}
              {section.content && (
                <Paragraph className="whitespace-pre-line">
                  {section.content}
                </Paragraph>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </Suspense>
  );
};

export default PrivacyPolicyPage;
