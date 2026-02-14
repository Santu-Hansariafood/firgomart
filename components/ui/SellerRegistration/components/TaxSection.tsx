import React, { ChangeEvent } from 'react';
import { FileText, CheckCircle, CreditCard, Hash, ExternalLink, ArrowUpRight } from 'lucide-react';
import { SellerFormData } from '@/types/seller';

interface TaxSectionProps {
  formData: SellerFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  checkExists: (field: string, value: string) => Promise<void>;
  errors: Record<string, string>;
  gstVerified: boolean;
  gstVerifying: boolean;
  gstError: string | null;
  gstData: any;
  handleVerifyGst: () => Promise<void>;
  checking: string | null;
}

export const TaxSection: React.FC<TaxSectionProps> = ({
  formData,
  handleChange,
  checkExists,
  errors,
  gstVerified,
  gstVerifying,
  gstError,
  gstData,
  handleVerifyGst,
  checking,
}) => {
  return (
    <>
      <div className="flex items-center gap-3 pb-6">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="text-lg sm:text-xl font-heading font-bold">Tax Information</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--foreground)]/5 border border-[var(--foreground)/10] hover:bg-[var(--foreground)]/10 transition-colors">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id="hasGST"
              name="hasGST"
              checked={formData.hasGST}
              onChange={handleChange}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-[var(--foreground)/30] bg-[var(--background)] checked:border-brand-purple checked:bg-brand-purple transition-all"
            />
            <CheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <label htmlFor="hasGST" className="text-sm font-medium text-[color:var(--foreground)] cursor-pointer select-none flex-1">
            I have a GST Number
          </label>
        </div>

        {formData.hasGST ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">GST Number <span className="text-red-500">*</span></label>
            <div className="flex gap-2 items-start">
              <div className="relative group flex-1">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  onBlur={() => checkExists('gstNumber', formData.gstNumber)}
                  pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                  required
                  disabled={gstVerified}
                  className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                    errors.gstNumber || gstError
                      ? 'border-red-500 focus:border-red-500' 
                      : gstVerified
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-[var(--foreground)/15] focus:border-brand-purple'
                  } text-[color:var(--foreground)] placeholder-[var(--foreground)/40] disabled:opacity-70`}
                  placeholder="Enter 15-digit GST number"
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyGst}
                disabled={gstVerifying || gstVerified || !formData.gstNumber}
                className={`px-5 py-3.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-2 ${
                  gstVerified 
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20 cursor-default'
                    : 'bg-brand-purple text-white hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                }`}
              >
                {gstVerifying ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : gstVerified ? (
                  <>Verified <CheckCircle className="w-4 h-4" /></>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
            {gstError && <p className="text-red-500 text-xs ml-1">{gstError}</p>}
            {errors.gstNumber && <p className="text-red-500 text-xs ml-1">{errors.gstNumber}</p>}
            {checking === 'gstNumber' && <p className="text-brand-purple text-xs ml-1 animate-pulse">Checking availability...</p>}
            
            {gstVerified && gstData && (
              <div className="mt-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20 space-y-3 text-sm animate-in fade-in slide-in-from-top-2">
                 <div className="flex items-center gap-2 text-green-600 font-medium pb-2 border-b border-green-500/10">
                    <CheckCircle className="w-4 h-4" />
                    <span>GSTIN Verified Successfully</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="sm:col-span-2">
                      <p className="text-[var(--foreground)]/50 text-xs mb-1">Legal Name of Business</p>
                      <p className="font-semibold text-[color:var(--foreground)]">{gstData.legal_name_of_business || 'N/A'}</p>
                   </div>
                   <div>
                      <p className="text-[var(--foreground)]/50 text-xs mb-1">Trade Name</p>
                      <p className="font-medium text-[color:var(--foreground)]">{gstData.trade_name || 'N/A'}</p>
                   </div>
                   <div>
                      <p className="text-[var(--foreground)]/50 text-xs mb-1">Taxpayer Type</p>
                      <p className="font-medium text-[color:var(--foreground)]">{gstData.taxpayer_type || 'N/A'}</p>
                   </div>
                   <div>
                      <p className="text-[var(--foreground)]/50 text-xs mb-1">Registration Date</p>
                      <p className="font-medium text-[color:var(--foreground)]">{gstData.date_of_registration || 'N/A'}</p>
                   </div>
                   <div>
                      <p className="text-[var(--foreground)]/50 text-xs mb-1">Status</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        (gstData.gstin_status === 'Active' || !gstData.gstin_status) 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {gstData.gstin_status || 'Active'}
                      </span>
                   </div>
                   <div className="sm:col-span-2">
                      <p className="text-[var(--foreground)]/50 text-xs mb-1">Principal Place of Business</p>
                      <p className="font-medium text-[color:var(--foreground)] text-sm">{gstData.principal_place_of_business || 'N/A'}</p>
                   </div>
                   {gstData.nature_of_business_activity && (
                     <div className="sm:col-span-2">
                        <p className="text-[var(--foreground)]/50 text-xs mb-1">Nature of Business Activity</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(gstData.nature_of_business_activity) 
                            ? gstData.nature_of_business_activity.map((activity: string, i: number) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--foreground)]/5 text-[color:var(--foreground)]">
                                {activity}
                              </span>
                            ))
                            : <span className="text-sm text-[color:var(--foreground)]">{gstData.nature_of_business_activity}</span>
                          }
                        </div>
                     </div>
                   )}
                 </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">PAN Number <span className="text-red-500">*</span></label>
              <div className="relative group">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  onBlur={() => checkExists('panNumber', formData.panNumber)}
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  required
                  className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                    errors.panNumber 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[var(--foreground)/15] focus:border-brand-purple'
                  } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                  placeholder="Enter 10-digit PAN number"
                />
              </div>
              {errors.panNumber && <p className="text-red-500 text-xs ml-1">{errors.panNumber}</p>}
              {checking === 'panNumber' && <p className="text-brand-purple text-xs ml-1 animate-pulse">Checking availability...</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">Aadhaar Number <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                <input
                  type="text"
                  name="aadhaar"
                  value={formData.aadhaar ?? ''}
                  onChange={handleChange}
                  pattern="[0-9]{12}"
                  maxLength={12}
                  minLength={12}
                  required
                  className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                    errors.aadhaar 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[var(--foreground)/15] focus:border-brand-purple'
                  } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                  placeholder="Enter 12-digit Aadhaar number"
                />
              </div>
              {errors.aadhaar && <p className="text-red-500 text-xs ml-1">{errors.aadhaar}</p>}
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
              <ExternalLink className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Don't have a GST Number?</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                You can apply for GST registration online through the official government portal.
              </p>
              <a 
                href="https://reg.gst.gov.in/registration/generateuid" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Apply for GST <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
          </>
        )}
      </div>
    </>
  );
};
