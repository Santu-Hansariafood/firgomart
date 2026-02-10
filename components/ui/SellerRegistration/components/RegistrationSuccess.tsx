import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export const RegistrationSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 text-[color:var(--foreground)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--background)] rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-[var(--foreground)/20]"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-heading font-bold mb-2 text-[color:var(--foreground)]">
          Registration Successful!
        </h2>
        <p className="mb-6 text-[var(--foreground)/70]">
          Thank you for registering as a seller. Please wait for admin verification. You can login to check your status after verification.
        </p>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors font-medium"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
};
