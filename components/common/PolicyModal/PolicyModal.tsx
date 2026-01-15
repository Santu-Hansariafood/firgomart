"use client";

import React from "react";
import Image from "next/image";
import policies from "@/data/policies.json";
import { X } from "lucide-react";

type PolicyType =
  | "privacy"
  | "terms"
  | "cookies"
  | "sitemap"
  | "disclaimer"
  | "affiliate";

interface PolicySection {
  title?: string;
  effectiveDate?: string;
  lastUpdated?: string;
  intro?: string;
  content?: string;
  points?: string[];
  subSections?: PolicySection[];
}

interface PolicyModalProps {
  open: boolean;
  onClose: () => void;
  policy: PolicyType | null;
}

/* ---------------- Roman Number Helper ---------------- */
const toRoman = (num: number) => {
  const romans = [
    "i","ii","iii","iv","v","vi","vii","viii","ix","x",
    "xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx",
  ];
  return romans[num] || `${num + 1}`;
};

const PolicyModal: React.FC<PolicyModalProps> = ({ open, onClose, policy }) => {
  if (!open || !policy) return null;

  const datasetMap: Record<PolicyType, PolicySection[]> = {
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

  /* -------- Render Content with Roman List -------- */
  const renderContent = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const listLines = lines.filter(
      (l) => l.startsWith("•") || l.startsWith("-")
    );

    const normalLines = lines.filter(
      (l) => !l.startsWith("•") && !l.startsWith("-")
    );

    return (
      <div className="space-y-2">
        {normalLines.map((line, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-line"
          >
            {line}
          </p>
        ))}

        {listLines.length > 0 && (
          <div className="space-y-1 text-sm text-[var(--foreground)]">
            {listLines.map((b, i) => (
              <p key={i} className="leading-relaxed">
                <span className="mr-2 font-medium">{toRoman(i)}.</span>
                {b.replace(/^[-•]/, "").trim()}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-[var(--background)] text-[var(--foreground)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--foreground)/20] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo/firgomart.png"
                  alt="FirgoMart"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {titleMap[policy]}
              </h3>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--foreground)/10] hover:bg-[var(--foreground)/20] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--foreground)]" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {data.map((section, idx) => (
              <div key={idx} className="space-y-3">
                
                {/* Title */}
                {section.title && (
                  <h4
                    className={`font-semibold text-[var(--foreground)] ${
                      idx === 0 ? "text-xl" : "text-lg mt-4"
                    }`}
                  >
                    {section.title}
                  </h4>
                )}

                {/* Effective / Last Updated */}
                {(section.effectiveDate || section.lastUpdated) && (
                  <p className="text-sm text-[var(--foreground)/60]">
                    {section.effectiveDate && (
                      <>
                        Effective Date:{" "}
                        <span className="text-[var(--foreground)] font-medium">
                          {section.effectiveDate}
                        </span>
                      </>
                    )}
                    {section.lastUpdated && (
                      <>
                        {section.effectiveDate ? "  ·  " : ""}
                        Last Updated:{" "}
                        <span className="text-[var(--foreground)] font-medium">
                          {section.lastUpdated}
                        </span>
                      </>
                    )}
                  </p>
                )}

                {/* Intro */}
                {section.intro && renderContent(section.intro)}

                {/* Content */}
                {section.content && renderContent(section.content)}

                {/* Points */}
                {section.points && section.points.length > 0 && (
                  <div className="space-y-1 text-sm text-[var(--foreground)]">
                    {section.points.map((point, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        <span className="mr-2 font-medium">
                          {toRoman(pIdx)}.
                        </span>
                        {point}
                      </p>
                    ))}
                  </div>
                )}

                {/* Sub Sections */}
                {section.subSections &&
                  section.subSections.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="ml-2 mt-4 space-y-2 pl-4 border-l-2 border-[var(--foreground)/10]"
                    >
                      {sub.title && (
                        <h5 className="text-base font-medium text-[var(--foreground)]">
                          {sub.title}
                        </h5>
                      )}

                      {sub.content && renderContent(sub.content)}

                      {sub.points && sub.points.length > 0 && (
                        <div className="space-y-1 text-sm text-[var(--foreground)]">
                          {sub.points.map((p, i) => (
                            <p key={i} className="leading-relaxed">
                              <span className="mr-2 font-medium">
                                {toRoman(i)}.
                              </span>
                              {p}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
