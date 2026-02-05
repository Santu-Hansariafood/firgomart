"use client";

import React from "react";
import Image from "next/image";
import policies from "@/data/policies.json";
import { X } from "lucide-react";
import { motion } from "framer-motion";

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
            className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line"
          >
            {line}
          </p>
        ))}

        {listLines.length > 0 && (
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
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
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          className="relative w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] text-gray-900 dark:text-gray-100"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-brand-purple/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full bg-brand-red/20 blur-3xl" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple via-brand-red to-brand-purple opacity-70" />
          <div className="bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 dark:border-white/10 shrink-0">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {titleMap[policy]}
              </h3>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {data.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  {section.title && (
                    <h4
                      className={`font-semibold text-gray-900 dark:text-white ${
                        idx === 0 ? "text-xl" : "text-lg mt-4"
                      }`}
                    >
                      {section.title}
                    </h4>
                  )}

                  {(section.effectiveDate || section.lastUpdated) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {section.effectiveDate && (
                        <>
                          Effective Date:{" "}
                          <span className="text-gray-900 dark:text-white font-medium">
                            {section.effectiveDate}
                          </span>
                        </>
                      )}
                      {section.lastUpdated && (
                        <>
                          {section.effectiveDate ? "  ·  " : ""}
                          Last Updated:{" "}
                          <span className="text-gray-900 dark:text-white font-medium">
                            {section.lastUpdated}
                          </span>
                        </>
                      )}
                    </p>
                  )}

                  {section.intro && renderContent(section.intro)}

                  {section.content && renderContent(section.content)}

                  {section.points && section.points.length > 0 && (
                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
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

                  {section.subSections &&
                    section.subSections.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="ml-2 mt-4 space-y-2 pl-4 border-l-2 border-gray-200 dark:border-white/10"
                      >
                        {sub.title && (
                          <h5 className="text-base font-medium text-gray-900 dark:text-white">
                            {sub.title}
                          </h5>
                        )}

                        {sub.content && renderContent(sub.content)}

                        {sub.points && sub.points.length > 0 && (
                          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
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
        </motion.div>
      </div>
    </div>
  );
};

export default PolicyModal;
