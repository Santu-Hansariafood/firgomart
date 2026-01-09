"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Suspense } from "react";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
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
  return (
    <Suspense fallback={<BeautifulLoader />}>
      <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
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
              const Icon = iconMap[section.icon];
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
    </Suspense>
  );
};

export default ReturnsPage;
