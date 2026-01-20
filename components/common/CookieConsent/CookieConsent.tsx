"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Check, X, Settings } from "lucide-react";

const PolicyModal = dynamic(
  () => import("@/components/common/PolicyModal/PolicyModal"),
  { ssr: false }
);

type ConsentStatus = "accepted" | "rejected" | null;

const COOKIE_STORAGE_KEY = "firgomart_cookie_consent";

const CookieConsent: React.FC = () => {
  const [status, setStatus] = useState<ConsentStatus>(null);
  const [initialized, setInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (stored === "accepted" || stored === "rejected") {
        setStatus(stored);
      }
    } catch (err) {
      console.error("Cookie consent read error:", err);
    }
    setInitialized(true);
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, "accepted");
    } catch {}
    setStatus("accepted");
    setShowSettings(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, "rejected");
    } catch {}
    setStatus("rejected");
    setShowSettings(false);
  };

  if (!initialized || status) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-[var(--background)] text-[var(--foreground)] shadow-xl border border-[var(--foreground)/10] p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm sm:text-base font-semibold">
              We use cookies to improve your experience 🍪
            </p>
            <p className="text-xs sm:text-sm text-[var(--foreground)/70] leading-relaxed">
              Cookies help us provide essential features, analyze traffic and
              personalize content. You can accept all cookies, reject
              non-essential ones, or review our cookie policy.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--foreground)/70] hover:text-[var(--foreground)] hover:bg-[var(--foreground)/5] transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow hover:bg-green-500 transition-colors"
            >
              <Check className="h-4 w-4" />
              Accept All
            </button>

          </div>
        </div>
      </div>
      {showSettings && (
        <PolicyModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
          policy="cookies"
        />
      )}
    </>
  );
};

export default CookieConsent;
