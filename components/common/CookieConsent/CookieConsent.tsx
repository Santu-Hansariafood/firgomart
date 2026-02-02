"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Check, X, Settings, Cookie } from "lucide-react";

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
      <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:w-[360px] z-50 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 transform transition-all duration-500 ease-out translate-y-0 opacity-100 ring-1 ring-black/5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-purple/10 rounded-xl shrink-0 text-brand-purple animate-pulse">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1 pt-0.5">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">Cookie Preferences</p>
              <p className="text-xs text-[var(--foreground)/70] leading-relaxed">
                We use cookies to ensure you get the best experience on our website.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="col-span-1 px-3 py-2 text-xs font-medium text-[var(--foreground)/70] hover:bg-[var(--foreground)/5] hover:text-[color:var(--foreground)] rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              Options
            </button>
            <button
              onClick={handleReject}
              className="col-span-1 px-3 py-2 text-xs font-medium text-[color:var(--foreground)] border border-[var(--foreground)/10] hover:bg-[var(--foreground)/5] rounded-lg transition-colors"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="col-span-1 px-3 py-2 text-xs font-semibold text-white bg-brand-purple hover:bg-brand-purple/90 rounded-lg shadow-sm shadow-brand-purple/20 transition-all hover:scale-105 active:scale-95"
            >
              Accept
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
