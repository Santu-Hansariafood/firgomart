"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle } from "lucide-react";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
            <p className="text-blue-100 mt-1">
              We&apos;ll send you reset instructions
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-600 mb-6">
                  We&apos;ve sent password reset instructions to{" "}
                  <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">Redirecting to login...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Enter your email address and we&apos;ll send you instructions to
                  reset your password.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Instructions"}
                </button>

                <div className="text-center pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Back to Login
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
