import React, { ChangeEvent } from 'react';
import { Landmark, CreditCard, FileText, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations/animations';
import { SellerFormData } from '@/types/seller';

interface BankSectionProps {
  formData: SellerFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
  bankError: string | null;
  ifscVerifying: boolean;
  ifscVerified: boolean;
  ifscError: string | null;
}

export const BankSection: React.FC<BankSectionProps> = ({
  formData,
  handleChange,
  errors,
  bankError,
  ifscVerifying,
  ifscVerified,
  ifscError,
}) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="space-y-6 pt-6 border-t border-[var(--foreground)/10]"
    >
      <div className="flex items-center gap-3 pb-2 border-b border-[var(--foreground)/10]">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
          <Landmark className="w-5 h-5" />
        </div>
        <h2 className="text-lg sm:text-xl font-heading font-bold">Bank Account Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Account Number <span className="text-red-500">*</span></label>
          <div className="relative group">
            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
            <input 
              type="text" 
              name="bankAccount" 
              value={formData.bankAccount ?? ''} 
              onChange={handleChange} 
              required 
              className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                errors.bankAccount || bankError
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[var(--foreground)/15] focus:border-brand-purple'
              } text-[color:var(--foreground)] placeholder-[var(--foreground)/40] disabled:opacity-70`}
              placeholder="Enter bank account number"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">IFSC Code <span className="text-red-500">*</span></label>
          <div className="relative group">
            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
            <input 
              type="text" 
              name="bankIfsc" 
              value={formData.bankIfsc ?? ''} 
              onChange={handleChange} 
              required 
              className={`w-full pl-11 pr-10 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                errors.bankIfsc || ifscError
                  ? 'border-red-500 focus:border-red-500' 
                  : ifscVerified
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-[var(--foreground)/15] focus:border-brand-purple'
              } text-[color:var(--foreground)] placeholder-[var(--foreground)/40] disabled:opacity-70`}
              placeholder="Enter IFSC code"
            />
            {ifscVerifying && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {(errors.bankIfsc || ifscError) && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.bankIfsc || ifscError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Bank Name <span className="text-red-500">*</span></label>
          <div className="relative group">
            <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
            <input 
              type="text" 
              name="bankName" 
              value={formData.bankName ?? ''} 
              onChange={handleChange} 
              required 
              className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                'border-[var(--foreground)/15] focus:border-brand-purple'
              } text-[color:var(--foreground)] placeholder-[var(--foreground)/40] disabled:opacity-70`}
              placeholder="Enter bank name"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Branch Name <span className="text-red-500">*</span></label>
          <div className="relative group">
            <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
            <input 
              type="text" 
              name="bankBranch" 
              value={formData.bankBranch ?? ''} 
              onChange={handleChange} 
              required 
              className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                'border-[var(--foreground)/15] focus:border-brand-purple'
              } text-[color:var(--foreground)] placeholder-[var(--foreground)/40] disabled:opacity-70`}
              placeholder="Enter branch name"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 mt-4 mb-6">
        {errors.bankAccount && <p className="text-red-500 text-sm">{errors.bankAccount}</p>}
      </div>
    </motion.div>
  );
};
