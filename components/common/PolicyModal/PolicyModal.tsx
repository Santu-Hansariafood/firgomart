"use client";

import React from "react";
import Image from "next/image";
import policies from "@/data/policies.json";
import { X } from "lucide-react";

type PolicyType = "privacy" | "terms" | "cookies" | "sitemap" | "disclaimer" | "affiliate";

interface PolicyModalProps {
  open: boolean;
  onClose: () => void;
  policy: PolicyType | null;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ open, onClose, policy }) => {
  if (!open || !policy) return null;

  const datasetMap: Record<PolicyType, any[]> = {
    privacy: policies.privacyPolicy,
    terms: policies.termsOfService,
    cookies: policies.cookiesPolicy,
    sitemap: policies.sitemap,
    disclaimer: policies.disclaimer,
    affiliate: policies.affiliateProgram,
  };
  const titleMap: Record<PolicyType, string> = {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
    sitemap: "Sitemap",
    disclaimer: "Disclaimer",
    affiliate: "Affiliate Program",
  };
  const data = datasetMap[policy];

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image src="/logo/firgomart.png" alt="FirgoMart" fill sizes="32px" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{titleMap[policy]}</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
            {data.map((section, idx) => (
              <div key={idx} className="space-y-2">
                {section.title && (
                  <h4 className="text-base font-semibold text-gray-900">
                    {section.title}
                  </h4>
                )}
                {section.effectiveDate && (
                  <p className="text-sm text-gray-500">
                    Effective Date: <span className="text-gray-700">{section.effectiveDate}</span>
                  </p>
                )}
                {section.content && (
                  <p className="text-sm leading-6 text-gray-700 whitespace-pre-line">
                    {section.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
