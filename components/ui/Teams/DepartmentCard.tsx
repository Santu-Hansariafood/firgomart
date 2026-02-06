"use client";
import React from "react";
import { motion } from "framer-motion";
import { Eye, Package } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Department {
  _id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

interface DepartmentCardProps {
  dept: Department;
  index: number;
  onViewClick: (name: string) => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ dept, index, onViewClick }) => {
  const renderIcon = (iconName: string, className: string) => {
    const Icon = (LucideIcons as any)[iconName] || Package;
    return <Icon className={className} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        {renderIcon(dept.icon, "w-6 h-6 text-brand-purple")}
        <h3 className="text-xl font-bold text-[color:var(--foreground)]">
          {dept.name}
        </h3>
      </div>
      <div className="text-[var(--foreground)/70] mb-4 line-clamp-4 min-h-[5rem]">
        {dept.description}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => onViewClick(dept.name)}
          className="px-4 py-2 rounded-lg bg-brand-purple text-white hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 duration-200"
        >
          <Eye className="w-4 h-4" />
          Click to View
        </button>
      </div>
    </motion.div>
  );
};

export default DepartmentCard;
