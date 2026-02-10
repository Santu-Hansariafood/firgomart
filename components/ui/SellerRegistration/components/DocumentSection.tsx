import React, { ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, CheckCircle } from 'lucide-react';
import { SellerFormData } from '@/types/seller';

interface DocumentSectionProps {
  formData: SellerFormData;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBankDocSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  uploadingLogo: boolean;
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  formData,
  handleFileChange,
  handleBankDocSelect,
  uploadingLogo,
}) => {
  return (
    <>
      <div className="flex items-center gap-3 pb-6">
        <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
          <Upload className="w-5 h-5" />
        </div>
        <h2 className="text-lg sm:text-xl font-heading font-bold">Documents</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Logo Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">Business Logo</label>
          <div className="group relative">
            <div className={`border-2 border-dashed p-6 text-center rounded-xl transition-all duration-300 ${
              formData.businessLogoUrl 
                ? 'border-green-500/50 bg-green-500/5' 
                : 'border-[var(--foreground)/20] bg-[var(--background)] hover:border-brand-purple/50 hover:bg-brand-purple/5'
            }`}>
              {formData.businessLogoUrl ? (
                <div className="relative z-10">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-green-600 font-medium">Logo Uploaded</p>
                  <div className="mt-4 relative w-32 h-32 mx-auto rounded-lg overflow-hidden border border-green-200 shadow-sm">
                    <Image
                      src={formData.businessLogoUrl}
                      alt="Business Logo"
                      fill
                      sizes="128px"
                      className="object-contain bg-white"
                    />
                  </div>
                  <label className="cursor-pointer text-xs text-brand-purple hover:underline mt-2 block">
                    Change Logo
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <>
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-7 h-7" />
                  </div>
                  <label className="cursor-pointer">
                    <span className="text-brand-purple font-bold text-lg hover:underline decoration-2 underline-offset-4">Click to upload</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  <p className="mt-2 text-sm text-[var(--foreground)/60]">
                    PNG or JPG (Max 2MB)
                  </p>
                  {uploadingLogo && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-brand-purple text-sm font-medium">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bank Document Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[color:var(--foreground)] ml-1">Bank Proof</label>
          <div className="group relative">
            <label className={`block border-2 border-dashed p-6 text-center rounded-xl transition-all duration-300 cursor-pointer ${
              formData.bankDocumentImage 
                ? 'border-green-500/50 bg-green-500/5' 
                : 'border-[var(--foreground)/20] bg-[var(--background)] hover:border-brand-purple/50 hover:bg-brand-purple/5'
            }`}>
              {formData.bankDocumentImage ? (
                <div className="relative z-10">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-green-600 font-medium">Document Selected</p>
                  <div className="mt-4 relative h-32 mx-auto rounded-lg overflow-hidden border border-green-200 shadow-sm bg-white">
                    <img
                      src={formData.bankDocumentImage}
                      alt="Bank Document"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-brand-purple hover:underline mt-2 block">Change Document</span>
                </div>
              ) : (
                <>
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-brand-purple font-bold text-lg group-hover:underline decoration-2 underline-offset-4">
                    Upload Cheque/Passbook
                  </span>
                  <p className="mt-2 text-sm text-[var(--foreground)/60]">
                      PNG or JPG (Max 2MB)
                  </p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleBankDocSelect} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
