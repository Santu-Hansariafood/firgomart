import React, { ChangeEvent } from 'react';
import { Building2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations/animations';
import { SellerFormData } from '@/types/seller';

interface BusinessSectionProps {
  formData: SellerFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
}

export const BusinessSection: React.FC<BusinessSectionProps> = ({
  formData,
  handleChange,
  errors,
}) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 pb-2 border-b border-[var(--foreground)/10]">
        <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple">
          <Building2 className="w-5 h-5" />
        </div>
        <h2 className="text-lg sm:text-xl font-heading font-bold">
          Business Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Business Name <span className="text-red-500">*</span></label>
          <div className="relative group">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                errors.businessName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[var(--foreground)/15] focus:border-brand-purple'
              } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
              placeholder="Enter business name"
            />
          </div>
          {errors.businessName && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.businessName}</p>}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Owner Name <span className="text-red-500">*</span></label>
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                errors.ownerName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[var(--foreground)/15] focus:border-brand-purple'
              } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
              placeholder="Enter owner's full name"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
