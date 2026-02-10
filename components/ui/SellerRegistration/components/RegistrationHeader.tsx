import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/utils/animations/animations';

export const RegistrationHeader: React.FC = () => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="bg-[var(--background)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--foreground)/15]"
    >
      <div className="relative bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 p-6 sm:p-8">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link href="/" className="block relative w-48 h-14 transition-opacity hover:opacity-80">
              <Image
                src="/logo/firgomart.png"
                alt="Firgomart"
                fill
                priority
                className="object-contain object-left"
                sizes="(max-width: 768px) 192px, 256px"
              />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--foreground)] tracking-tight">
                Partner with Firgomart
              </h1>
              <p className="text-sm text-[var(--foreground)/60] mt-1">
                Join our global marketplace and reach millions of customers.
              </p>
            </div>
          </div>

          <Link 
            href="/"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/80 hover:text-brand-purple transition-all duration-300 font-medium text-sm"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
