import React from "react";
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
            className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line text-left"
          >
            {line}
          </p>
        ))}

        {listLines.length > 0 && (
          <div className="space-y-1 text-sm text-foreground/80">
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
      <div className="w-full max-w-[210mm] mx-auto bg-background text-foreground shadow-none sm:shadow-2xl min-h-screen sm:min-h-[297mm] p-4 sm:p-10 my-0 sm:my-8 relative border-0 sm:border border-foreground/20 rounded-lg">
        <div className="space-y-5 font-serif text-foreground/80">
        {data.map((section, idx) => (
          <div key={idx} className="space-y-2">
            {section.title && idx === 0 ? (
               <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold text-foreground uppercase underline decoration-2 underline-offset-4 decoration-brand-purple">
                    {section.title}
                 </h2>
                 {(section.effectiveDate || section.lastUpdated) && (
                    <div className="mt-1 text-sm text-foreground/60 italic">
                        {section.effectiveDate && <span>Effective Date: {section.effectiveDate}</span>}
                        {section.lastUpdated && <span> · Last Updated: {section.lastUpdated}</span>}
                    </div>
                 )}
               </div>
            ) : section.title ? (
               <h2 className="font-bold text-foreground text-base mt-4 uppercase border-b border-foreground/20 pb-1">
                 {section.title}
               </h2>
            ) : null}
            {section.intro && renderContent(section.intro)}
            {section.content && renderContent(section.content)}
            {section.points && section.points.length > 0 && (
              <div className="space-y-1 text-sm text-foreground/80 ml-4">
                {section.points.map((point, pIdx) => (
                  <p key={pIdx} className="leading-relaxed text-left">
                    <span className="mr-2 font-medium">
                      {toRoman(pIdx)}.
                    </span>
                    {point}
                  </p>
                ))}
              </div>
            )}

            {section.items && section.items.length > 0 && (
              <ul className="list-disc space-y-1 text-sm text-foreground/80 ml-8">
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
                  className="ml-4 mt-3 space-y-2 pl-4 border-l border-brand-purple/50"
                >
                  {sub.title && (
                    <h3 className="text-base font-bold text-foreground">
                      {sub.title}
                    </h3>
                  )}

                  {sub.content && renderContent(sub.content)}

                  {sub.points && sub.points.length > 0 && (
                    <div className="space-y-1 text-sm text-foreground/80 ml-2">
                      {sub.points.map((p, i) => (
                        <p key={i} className="leading-relaxed text-left">
                          <span className="mr-2 font-medium">
                            {toRoman(i)}.
                          </span>
                          {p}
                        </p>
                      ))}
                    </div>
                  )}

                  {sub.items && sub.items.length > 0 && (
                    <ul className="list-disc space-y-1 text-sm text-foreground/80 ml-6">
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
    </div>
  );
};

export default PolicyContent;
