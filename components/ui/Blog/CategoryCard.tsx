"use client";
import React from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface CategoryItem {
  icon: string;
  title: string;
  items: string[];
}

interface CategoryCardProps {
  category: CategoryItem;
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index }) => {
  const renderIcon = (iconName: string, className: string) => {
    const Icon = (LucideIcons as any)[iconName] || Package;
    return <Icon className={className} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-purple/10 rounded-xl">
           {renderIcon(category.icon, "w-6 h-6 text-brand-purple")}
        </div>
        <h3 className="text-xl font-bold text-[color:var(--foreground)]">
          {category.title}
        </h3>
      </div>
      <ul className="space-y-3 text-[var(--foreground)/70]">
        {category.items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed">
             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-purple shrink-0" />
             {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default CategoryCard;
