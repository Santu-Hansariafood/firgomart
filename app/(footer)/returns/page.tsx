"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect } from "react";
import policy from "@/data/returnsPolicy.json";

import {
  RotateCcw,
  PackageX,
  ClipboardList,
  Truck,
  Wallet,
  Globe,
  Ban,
  Phone,
  Mail,
  Handshake,
} from "lucide-react";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));

const iconMap = {
  RotateCcw,
  PackageX,
  ClipboardList,
  Truck,
  Wallet,
  Globe,
  Ban,
};

const ReturnsPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
      <div className="bg-[var(--background)] text-[color:var(--foreground)] min-h-screen">
        <section className="relative py-20 bg-brand-purple">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <Title level={1}>{policy.meta.title}</Title>
              <Paragraph className="mt-4 text-purple-100 max-w-3xl mx-auto">
                {policy.intro}
              </Paragraph>
              <p className="text-sm text-purple-200 mt-2">
                Effective Date: {policy.meta.effectiveDate}
              </p>
            </motion.div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {policy.sections.map((section, index) => {
              const Icon = iconMap[section.icon as keyof typeof iconMap] || iconMap.RotateCcw;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-2xl border border-[var(--foreground)/10] p-6 bg-[var(--background)]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6 text-brand-purple" />
                    <h3 className="text-xl font-bold">{section.title}</h3>
                  </div>
                  <ul className="space-y-2 text-[var(--foreground)/70]">
                    {section.points.map((point, i) => (
                      <li key={i}>• {point}</li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 rounded-2xl border border-[var(--foreground)/10] p-6 sm:p-8 bg-[var(--background)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold">International Orders – Return & Refund Policy</h3>
            </div>
            
            <div className="space-y-4 text-[var(--foreground)/80] leading-relaxed">
              <p>
                Orders shipped outside India are classified as international orders. Due to cross-border logistics, customs regulations, and high international return costs, <strong>international orders are not eligible for standard returns or exchanges.</strong>
              </p>

              <div>
                <p className="font-semibold mb-2">Refunds for international orders will be considered only in the following cases:</p>
                <ul className="list-disc pl-5 space-y-1 text-[var(--foreground)/70]">
                  <li>Product received is damaged</li>
                  <li>Product received is defective</li>
                  <li>Wrong product delivered</li>
                </ul>
                <p className="mt-2 text-sm text-[var(--foreground)/60]">
                  All such requests must be raised within 48 hours of delivery, along with clear images or videos as proof for verification.
                </p>
              </div>

              <p>
                For approved international refund cases, physical return of the product to India may not be required. FirgoMart reserves the right to process refunds after internal verification without requesting the customer to return the product, depending on the nature of the issue.
              </p>

              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 text-sm">
                <span className="font-semibold text-red-600 dark:text-red-400">Important Note:</span> Customs duties, import taxes, international shipping charges, and any local fees paid in the destination country are strictly non-refundable under all circumstances.
              </div>

              <p>
                <strong>Cash on Delivery (COD) is available only for orders shipped within India.</strong> All international orders must be prepaid using supported online payment methods.
              </p>

              <p>
                Approved refunds for international prepaid orders will be processed to the original payment method only. Refund timelines may vary based on payment gateway processing, bank policies, and foreign exchange regulations.
              </p>

              <p className="text-sm text-[var(--foreground)/60] italic">
                If an international order is rejected, delayed, returned, or confiscated by customs authorities due to import restrictions, prohibited items, or local regulations of the destination country, FirgoMart shall not be liable for refunds or replacements.
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="rounded-2xl border p-6">
              <h3 className="font-bold mb-3">Help & Support</h3>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-purple" />
                {policy.support.email}
              </p>
              <p className="flex items-center gap-2 mt-2">
                <Phone className="w-4 h-4 text-brand-purple" />
                {policy.support.phone}
              </p>
            </div>
            <div className="rounded-2xl border bg-brand-purple/10 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="w-6 h-6 text-brand-purple" />
                <h3 className="font-bold">Our Promise</h3>
              </div>
              <Paragraph>
                FirgoMart is committed to fair policies, transparent processes,
                and quick resolution of return and refund requests.
              </Paragraph>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ReturnsPage;
