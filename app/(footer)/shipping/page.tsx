"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));
import { motion } from "framer-motion";
import {
  Truck,
  Globe,
  Clock,
  DollarSign,
  ClipboardCheck,
  MapPin,
  Shield,
  AlertTriangle,
} from "lucide-react";

const ShippingPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div className="bg-[var(--background)] text-[color:var(--foreground)] min-h-screen">
      <section className="relative py-20 bg-brand-purple overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Truck className="w-7 h-7 text-white" />
              <Title level={1}>Shipping Information – FirgoMart</Title>
            </div>
            <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
              We deliver your orders safely, efficiently, and on time. Our
              network supports both domestic and international deliveries.
            </Paragraph>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Shipping Coverage</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
              <li>Delivers to multiple locations across regions</li>
              <li>Domestic and international options</li>
              <li>Availability depends on product and destination</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Delivery Timelines</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
              <li>Standard: 2–7 business days</li>
              <li>Express: 1–3 business days (where available)</li>
              <li>International: 5–15 business days</li>
              <li className="text-[var(--foreground)/60]">
                Timelines may vary due to customs, weather, or operations
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Shipping Charges</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
              <li>Calculated by product weight, size, and destination</li>
              <li>Shown clearly at checkout</li>
              <li>Promotions may offer free or discounted shipping</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <ClipboardCheck className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Order Processing</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
              <li>Processed within 24–48 hours after confirmation</li>
              <li>Weekend or holiday orders processed next business day</li>
              <li>Confirmation sent once shipped</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Order Tracking</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
              <li>Real-time tracking available</li>
              <li>Details shared via email and SMS</li>
              <li>Track from your FirgoMart account</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">
                International Shipping & Customs
              </h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
              <li>Customs duties and taxes may apply</li>
              <li>Clearance time varies by country</li>
              <li>Import charges are customer responsibility unless stated</li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 rounded-2xl border border-[var(--foreground)/10] bg-brand-purple/10 p-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-brand-purple" />
            <h3 className="text-xl font-bold text-[color:var(--foreground)]">Delivery Exceptions</h3>
          </div>
          <Paragraph className="text-[var(--foreground)/70]">
            Delays may occur due to natural events, customs clearance, or
            operational issues. We will notify you in case of unexpected delays
            and work proactively to minimize disruptions.
          </Paragraph>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPage;
