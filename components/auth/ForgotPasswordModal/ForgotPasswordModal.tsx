"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";
const Title = dynamic(() => import('@/components/common/Title/Title'));
const Paragraph = dynamic(() => import('@/components/common/Paragraph/Paragraph'));
interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      return;
    }

    setLoading(true);
    try {
      const chk = await fetch("/api/auth/exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const existsData = await chk.json().catch(() => ({}));
      if (!chk.ok) {
        setError(typeof existsData?.error === "string" ? existsData.error : "Unable to verify email");
        setLoading(false);
        return;
      }
      if (!existsData?.exists) {
        setError("Email not registered");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSwitchToLogin();
        }, 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Request failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex sm:items-center sm:justify-center bg-[var(--background)] sm:bg-black/50 p-0 sm:p-4 overflow-y-auto sm:overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full min-h-full sm:min-h-0 sm:h-auto sm:max-w-md bg-[var(--background)] text-[color:var(--foreground)] sm:rounded-2xl shadow-none sm:shadow-2xl flex flex-col justify-center sm:justify-start border-0 sm:border border-[var(--foreground)/10]"
        >
          <div className="p-6 sm:p-8 pb-0 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--foreground)/50] hover:text-[color:var(--foreground)] hover:bg-[var(--foreground)/5] rounded-full p-2 transition-colors z-10"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5" />
            </button>

            <div className="space-y-2">
              <Title level={2} className="text-3xl font-bold bg-clip-text text-transparent bg-brand-purple">
                Forgot Password
              </Title>
              <Paragraph className="text-[var(--foreground)/60]">
                We&apos;ll send you reset instructions
              </Paragraph>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/5">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <Title level={4} className="text-xl font-bold text-[color:var(--foreground)] mb-3">
                  Check Your Email
                </Title>

                <Paragraph className="text-[var(--foreground)/70] mb-8 leading-relaxed">
                  We&apos;ve sent password reset instructions to<br/>
                  <strong className="text-brand-purple">{email}</strong>
                </Paragraph>

                <div className="flex items-center justify-center gap-2 text-sm text-[var(--foreground)/50] bg-[var(--foreground)/5] py-2 rounded-lg">
                  <div className="w-4 h-4 border-2 border-[var(--foreground)/20] border-t-brand-purple rounded-full animate-spin"></div>
                  Redirecting to login...
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-brand-purple/5 border border-brand-purple/10 rounded-xl p-4">
                  <Paragraph className="text-[var(--foreground)/70] text-sm leading-relaxed">
                    Enter your email address associated with your account and we&apos;ll send you a link to reset your password.
                  </Paragraph>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] border-[var(--foreground)/10] focus:border-brand-purple"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-purple text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : "Send Reset Instructions"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-[var(--foreground)/60] hover:text-brand-purple font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>←</span> Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
