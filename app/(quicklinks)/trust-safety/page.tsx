"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Shield,
  Lock,
  CreditCard,
  CheckCircle2,
  Handshake,
  AlertTriangle,
  BadgeCheck,
  FileWarning,
  LifeBuoy,
  Globe,
} from "lucide-react";
const BeautifulLoader = dynamic(() => import("@/components/common/Loader/BeautifulLoader"));
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));

const TrustSafetyPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <Suspense fallback={<BeautifulLoader />}>
      <div className="bg-[var(--background)] text-[color:var(--foreground)] min-h-screen">
        <section className="relative py-20 bg-brand-purple overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <ShieldCheck className="w-7 h-7 text-white" />
                <Title level={1}>Trust & Safety – FirgoMart</Title>
              </div>
              <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
                We are committed to safe shopping, secure payments, and a transparent marketplace.
                Explore how we protect buyers and sellers, and the steps you can take to shop confidently.
              </Paragraph>
              <Paragraph className="max-w-2xl mx-auto text-purple-100">
                Need help? Visit the Help Center or contact Customer Support anytime.
              </Paragraph>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Secure Payments</h3>
              </div>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li>Transactions handled by verified gateways</li>
                <li>Encrypted payment flows and tokenized cards</li>
                <li>Never share OTPs or passwords with anyone</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <BadgeCheck className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Verified Sellers & Reviews</h3>
              </div>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li>Seller onboarding and compliance checks</li>
                <li>Product ratings and genuine customer feedback</li>
                <li>Report suspicious listings or fake reviews</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Buyer Protection</h3>
              </div>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li>Delivery guarantee or refund as per policy</li>
                <li>Easy returns and replacement for eligible items</li>
                <li>Dedicated support during disputes</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Account Security</h3>
              </div>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li>Use strong passwords and enable device security</li>
                <li>Avoid phishing links; access FirgoMart directly</li>
                <li>Update personal info only inside your account</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <Handshake className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Dispute Resolution</h3>
              </div>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li>Open a support ticket with order details</li>
                <li>Our team investigates and mediates fairly</li>
                <li>Resolution aligned with policies and law</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <LifeBuoy className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Report & Support</h3>
              </div>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li>Report fraud, counterfeit, or policy violations</li>
                <li>Contact support: support@firgomart.com</li>
                <li>Help Center for guides and FAQs</li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[var(--foreground)/10] bg-brand-purple/10 p-8 mb-16"
          >
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Policies & Compliance</h3>
            </div>
            <Paragraph className="text-[var(--foreground)/70]">
              Learn how we protect your data and govern marketplace behavior.
              Review our policies for complete details and updates.
            </Paragraph>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/privacy-policy" className="px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--foreground)/20] hover:border-brand-purple transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--foreground)/20] hover:border-brand-purple transition-colors">
                Terms of Service
              </Link>
              <Link href="/help" className="px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--foreground)/20] hover:border-brand-purple transition-colors">
                Help Center
              </Link>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Safety Tips</h3>
              </div>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li>Shop only on FirgoMart official website or app</li>
                <li>Do not pay outside FirgoMart checkout</li>
                <li>Verify sellers and read reviews before purchase</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Authenticity & Quality</h3>
              </div>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li>Focus on genuine products and clear descriptions</li>
                <li>Flag misleading or counterfeit listings</li>
                <li>Eligible issues covered under return/refund policy</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <FileWarning className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Report a Concern</h3>
              </div>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li>Use Support to report fraud or violations</li>
                <li>Share order ID, product link, and details</li>
                <li>We review and take appropriate action</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default TrustSafetyPage;
