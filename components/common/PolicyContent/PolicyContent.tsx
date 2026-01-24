import React from "react";
import Image from "next/image";
import policies from "@/data/policies.json";

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
  items?: string[];
  subSections?: PolicySection[];
}

interface PolicyContentProps {
  policy: PolicyType;
}

const toRoman = (num: number) => {
  const romans = [
    "i","ii","iii","iv","v","vi","vii","viii","ix","x",
    "xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx",
  ];
  return romans[num] || `${num + 1}`;
};

const PolicyContent: React.FC<PolicyContentProps> = ({ policy }) => {
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
            className="text-sm leading-relaxed text-gray-800 whitespace-pre-line text-justify"
          >
            {line}
          </p>
        ))}

        {listLines.length > 0 && (
          <div className="space-y-1 text-sm text-gray-800">
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
    <div className="max-w-[210mm] mx-auto bg-white text-black shadow-2xl min-h-[297mm] p-8 md:p-12 my-8 relative border border-gray-200">
       <div className="border-b-2 border-gray-800 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
                <Image src="/logo/firgomart.png" alt="FirgoMart" fill className="object-contain" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">FirgoMart</h1>
                <p className="text-xs text-gray-600 font-medium tracking-wider">24Logistics Private Limited</p>
            </div>
         </div>
         <div className="text-xs text-gray-600 text-right space-y-1 font-medium font-sans">
            <p><span className="text-gray-900 font-bold">CIN:</span> U47912WB2025PTC281316</p>
            <p><span className="text-gray-900 font-bold">GSTIN:</span> 19AAGCF5282L1Z3</p>
            <p><span className="text-gray-900 font-bold">Email:</span> info@firgomart.com</p>
            <p><span className="text-gray-900 font-bold">Phone:</span> +91 8100660080</p>
            <p className="max-w-[250px] ml-auto leading-tight mt-1">Plot No. 678 1st Floor, Majherpara, Newtown, Kolkata, WB 700157</p>
         </div>
      </div>
      <div className="space-y-8 font-serif">
        {data.map((section, idx) => (
          <div key={idx} className="space-y-3">
            {section.title && idx === 0 ? (
               <div className="text-center mb-8">
                 <h2 className="text-3xl font-bold text-gray-900 uppercase underline decoration-2 underline-offset-4">
                    {section.title}
                 </h2>
                 {(section.effectiveDate || section.lastUpdated) && (
                    <div className="mt-2 text-sm text-gray-500 italic">
                        {section.effectiveDate && <span>Effective Date: {section.effectiveDate}</span>}
                        {section.lastUpdated && <span> · Last Updated: {section.lastUpdated}</span>}
                    </div>
                 )}
               </div>
            ) : section.title ? (
               <h2 className="font-bold text-gray-900 text-lg mt-6 uppercase border-b border-gray-200 pb-1">
                 {section.title}
               </h2>
            ) : null}
            {section.intro && renderContent(section.intro)}
            {section.content && renderContent(section.content)}
            {section.points && section.points.length > 0 && (
              <div className="space-y-1 text-sm text-gray-800 ml-4">
                {section.points.map((point, pIdx) => (
                  <p key={pIdx} className="leading-relaxed text-justify">
                    <span className="mr-2 font-medium">
                      {toRoman(pIdx)}.
                    </span>
                    {point}
                  </p>
                ))}
              </div>
            )}

            {section.items && section.items.length > 0 && (
              <ul className="list-disc space-y-1 text-sm text-gray-800 ml-8">
                {section.items.map((item, iIdx) => (
                  <li key={iIdx} className="leading-relaxed pl-2">
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {section.subSections &&
              section.subSections.map((sub, sIdx) => (
                <div
                  key={sIdx}
                  className="ml-4 mt-4 space-y-2 pl-4 border-l border-gray-300"
                >
                  {sub.title && (
                    <h3 className="text-base font-bold text-gray-800">
                      {sub.title}
                    </h3>
                  )}

                  {sub.content && renderContent(sub.content)}

                  {sub.points && sub.points.length > 0 && (
                    <div className="space-y-1 text-sm text-gray-800 ml-2">
                      {sub.points.map((p, i) => (
                        <p key={i} className="leading-relaxed text-justify">
                          <span className="mr-2 font-medium">
                            {toRoman(i)}.
                          </span>
                          {p}
                        </p>
                      ))}
                    </div>
                  )}

                  {sub.items && sub.items.length > 0 && (
                    <ul className="list-disc space-y-1 text-sm text-gray-800 ml-6">
                      {sub.items.map((item, i) => (
                        <li key={i} className="leading-relaxed pl-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
      <div className="mt-20 pt-6 border-t border-gray-300 flex justify-between text-[10px] text-gray-400 font-sans uppercase tracking-widest">
         <span>FirgoMart 24Logistics Pvt Ltd</span>
         <span>Confidential & Proprietary</span>
         <span>{titleMap[policy]}</span>
      </div>

    </div>
  );
};

export default PolicyContent;
