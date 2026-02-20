import React, { ChangeEvent } from 'react';
import { Mail, CheckCircle, Hash, Phone } from 'lucide-react';
import { SellerFormData } from '@/types/seller';

interface ContactSectionProps {
  formData: SellerFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  checkExists: (field: string, value: string) => Promise<void>;
  errors: Record<string, string>;
  requestEmailOtp: () => Promise<void>;
  emailOtpLoading: boolean;
  emailOtpSent: boolean;
  checking: string | null;
  emailOtpVerified: boolean;
  emailOtpError: string | null;
  emailOtp: string;
  setEmailOtp: (value: string) => void;
  verifyEmailOtp: () => Promise<void>;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  formData,
  handleChange,
  checkExists,
  errors,
  requestEmailOtp,
  emailOtpLoading,
  emailOtpSent,
  checking,
  emailOtpVerified,
  emailOtpError,
  emailOtp,
  setEmailOtp,
  verifyEmailOtp,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Email Address <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative group flex-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => checkExists('email', formData.email)}
                required
                className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[var(--foreground)/15] focus:border-brand-purple'
                } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
                placeholder="Enter email address"
              />
            </div>
            <button
              type="button"
              onClick={requestEmailOtp}
              disabled={emailOtpLoading || !formData.email || !!errors.email}
              className="px-4 py-2 font-medium rounded-xl bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-brand-purple/20 transition-all whitespace-nowrap"
            >
              {emailOtpLoading ? 'Sending...' : emailOtpSent ? 'Resend' : 'Send OTP'}
            </button>
          </div>
          
          {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
          {checking === 'email' && <p className="text-brand-purple text-xs ml-1 animate-pulse">Checking availability...</p>}
          
          {emailOtpVerified && !emailOtpError && (
            <div className="flex items-center gap-2 text-green-600 text-xs bg-green-500/10 p-2 rounded-lg ml-1 border border-green-500/20">
              <CheckCircle className="w-3.5 h-3.5" />
              Email verified successfully
            </div>
          )}
          
          {emailOtpError && <p className="text-red-500 text-xs ml-1">{emailOtpError}</p>}
          
          {emailOtpSent && !emailOtpVerified && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="relative group flex-1">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                <input
                  type="text"
                  value={emailOtp}
                  onChange={e => setEmailOtp(e.target.value)}
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={verifyEmailOtp}
                disabled={emailOtpLoading || emailOtp.length < 6}
                className="px-6 py-2 font-medium rounded-xl bg-green-600/10 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-green-600/20 transition-all whitespace-nowrap"
              >
                {emailOtpLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Phone Number <span className="text-red-500">*</span></label>
        <div className="relative group">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={() => checkExists('phone', formData.phone)}
            required
            pattern="[6-9][0-9]{9}"
            className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${
              errors.phone 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-[var(--foreground)/15] focus:border-brand-purple'
            } text-[color:var(--foreground)] placeholder-[var(--foreground)/40]`}
            placeholder="Enter 10-digit mobile number"
          />
        </div>
        {errors.phone && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.phone}</p>}
        {checking === 'phone' && <p className="text-brand-purple text-xs mt-1.5 ml-1 animate-pulse">Checking availability...</p>}
      </div>
    </div>
  );
};
