"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, ChevronRight, Mail } from "lucide-react";

interface Career {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

interface JobCardProps {
  career: Career;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}

const JobCard: React.FC<JobCardProps> = ({ career, expandedId, setExpandedId }) => {
  const isExpanded = expandedId === career._id;

  return (
    <div className="bg-[var(--background)] border border-[var(--foreground)/10] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div
        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setExpandedId(isExpanded ? null : career._id)}
      >
        <div>
          <h3 className="text-xl font-bold text-[color:var(--foreground)] flex items-center gap-2 group-hover:text-brand-purple transition-colors">
            {career.title}
            <span
              className={`px-3 py-1 text-xs rounded-full border ${
                career.type === "Full-time"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-blue-100 text-blue-700 border-blue-200"
              }`}
            >
              {career.type}
            </span>
          </h3>
          <div className="flex items-center gap-4 mt-3 text-sm text-[var(--foreground)/60]">
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" /> {career.department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {career.location}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-brand-purple font-medium bg-brand-purple/5 px-4 py-2 rounded-lg group-hover:bg-brand-purple/10 transition-colors">
          {isExpanded ? "Close Details" : "View Details"}{" "}
          <ChevronRight
            className={`w-5 h-5 transition-transform duration-300 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-[var(--foreground)/5]"
          >
            <div className="p-6 border-t border-[var(--foreground)/10]">
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-[color:var(--foreground)] text-lg">
                  Description
                </h4>
                <p className="text-[var(--foreground)/80] whitespace-pre-wrap leading-relaxed">
                  {career.description}
                </p>
              </div>

              {career.requirements && career.requirements.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-[color:var(--foreground)] text-lg">
                    Requirements
                  </h4>
                  <ul className="list-disc list-inside text-[var(--foreground)/80] space-y-2">
                    {career.requirements.map((req, i) => (
                      <li key={i} className="leading-relaxed pl-2 marker:text-brand-purple">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {career.benefits && career.benefits.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-semibold mb-3 text-[color:var(--foreground)] text-lg">
                    Benefits
                  </h4>
                  <ul className="list-disc list-inside text-[var(--foreground)/80] space-y-2">
                    {career.benefits.map((ben, i) => (
                      <li key={i} className="leading-relaxed pl-2 marker:text-brand-purple">
                        {ben}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a
                href={`mailto:careers@firgomart.com?subject=Application for ${career.title}`}
                className="inline-flex items-center gap-2 px-8 py-3 bg-brand-purple text-white rounded-xl hover:bg-purple-700 transition-all hover:shadow-lg hover:-translate-y-0.5 font-medium text-lg"
              >
                Apply for this Position <Mail className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobCard;
