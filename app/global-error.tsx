"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Trash2 } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  const handleClearAndReload = () => {
    try {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Failed to clear storage", e);
    }
    window.location.href = "/";
  };

  return (
    <html>
      <body className="bg-gray-50 flex items-center justify-center min-h-screen p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong!
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We encountered an unexpected error. This might be due to outdated browser data or a temporary glitch.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={handleClearAndReload}
              className="w-full py-3 px-4 bg-white text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache & Reload
            </button>
          </div>
          
          <p className="mt-6 text-xs text-gray-400">
            Error Code: {error.digest || "Unknown"}
          </p>
        </div>
      </body>
    </html>
  );
}
