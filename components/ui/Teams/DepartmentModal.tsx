"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import TeamMemberCard from "./TeamMemberCard";

interface TeamMember {
  name: string;
  image: string;
  bio?: string;
  links?: {
    linkedin?: string;
    twitter?: string;
    x?: string;
    instagram?: string;
    facebook?: string;
  };
}

interface TeamData {
  logo?: string;
  description?: string;
  members?: TeamMember[];
}

interface DepartmentModalProps {
  activeTitle: string | null;
  teamData: Record<string, TeamData>;
  onClose: () => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ activeTitle, teamData, onClose }) => {
  const renderIcon = (iconName: string, className: string) => {
    const Icon = (LucideIcons as any)[iconName] || Package;
    return <Icon className={className} />;
  };

  return (
    <AnimatePresence>
      {activeTitle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--background)] text-[color:var(--foreground)] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--foreground)/10]"
          >
             <div className="p-6 border-b border-[var(--foreground)/10] flex items-center justify-between sticky top-0 bg-[var(--background)] z-10">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-2 bg-brand-purple/10 rounded-lg"
                  >
                     <div className="relative w-8 h-8 flex items-center justify-center">
                        {renderIcon(teamData[activeTitle]?.logo || "Package", "w-8 h-8 text-brand-purple")}
                     </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[color:var(--foreground)]">
                    {activeTitle}
                  </h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--foreground)/10] rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-[var(--foreground)/70]" />
                </button>
             </div>

            <div className="p-6 overflow-y-auto overscroll-contain flex-1">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[var(--foreground)/70] text-lg mb-8 leading-relaxed max-w-3xl"
              >
                {activeTitle
                  ? teamData[activeTitle]?.description ||
                    "Team details coming soon."
                  : "Team details coming soon."}
              </motion.p>
              
              <div className="mb-4 flex items-center gap-2">
                 <div className="h-px bg-[var(--foreground)/10] flex-1"></div>
                 <span className="text-sm font-medium text-[var(--foreground)/40] uppercase tracking-wider">Team Members</span>
                 <div className="h-px bg-[var(--foreground)/10] flex-1"></div>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-6
                "
              >
                {(activeTitle
                  ? teamData[activeTitle]?.members || []
                  : []
                ).map((m, idx) => (
                  <TeamMemberCard 
                    key={`${activeTitle}-${m.name}-${idx}`} 
                    member={m} 
                    idx={idx} 
                    activeTitle={activeTitle} 
                  />
                ))}
              </div>
              
              {(!teamData[activeTitle]?.members || teamData[activeTitle]?.members?.length === 0) && (
                 <div className="text-center py-12 text-[var(--foreground)/40] italic">
                    No members listed for this department yet.
                 </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DepartmentModal;
