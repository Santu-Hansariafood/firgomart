"use client";
import React from "react";
import Title from "@/components/common/Title/Title";
import Paragraph from "@/components/common/Paragraph/Paragraph";
import { motion } from "framer-motion";
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

const ReturnsPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="relative py-20 bg-brand-purple overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <RotateCcw className="w-7 h-7 text-white" />
              <Title level={1}>Returns & Refunds – FirgoMart</Title>
            </div>
            <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
              We offer a simple, transparent, and hassle-free return and refund
              process to ensure a smooth shopping experience.
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
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <PackageX className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Return Eligibility
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Damaged, defective, or incorrect products</li>
              <li>Product does not match the description</li>
              <li>Unused, unworn, and in original condition</li>
              <li>Request made within the specified return period</li>
              <li className="text-gray-600">
                Some products may not be eligible due to hygiene, customization,
                or seller policies
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                How to Request a Return
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Log in to your FirgoMart account</li>
              <li>Go to My Orders</li>
              <li>Select the order and product</li>
              <li>Click Request Return and choose a reason</li>
              <li>Submit the request for approval</li>
              <li>Pickup or return instructions will be shared</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Return Pickup & Shipping
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Eligible products may be picked up</li>
              <li>In some cases, customers ship the product back</li>
              <li>Pack securely in original packaging</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Refund Process</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Refunds initiated after product inspection</li>
              <li>Processed within 5–7 business days after approval</li>
              <li>Credited to the original payment method</li>
              <li>
                COD refunds via bank transfer or wallet, where applicable
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                International Orders
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Policies for international orders may vary</li>
              <li>
                Customs duties, shipping fees, and taxes may not be refundable
              </li>
              <li>Review product-specific policies before purchase</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Ban className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Non-Returnable Items
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Perishable goods</li>
              <li>Personalized or customized products</li>
              <li>Items marked “Non-Returnable”</li>
              <li>Used or damaged products not caused during delivery</li>
            </ul>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3">Need Help?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-purple" /> Email:
                support@firgomart.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-purple" /> Phone: +91 81006
                60080
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-2xl border border-gray-100 bg-purple-50 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Handshake className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">Our Promise</h3>
            </div>
            <Paragraph className="text-gray-700">
              FirgoMart is committed to fair policies, quick resolutions, and
              customer satisfaction. We continuously improve our return and
              refund process to make your experience stress-free.
            </Paragraph>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
