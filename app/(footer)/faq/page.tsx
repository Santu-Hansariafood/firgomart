"use client";
import dynamic from "next/dynamic";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));
import { motion } from "framer-motion";
import {
  HelpCircle,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  Store,
  Shield,
  Mail,
  Phone,
  Handshake,
} from "lucide-react";
import { Suspense } from "react";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";

const FaqPage = () => {
  return (
    <Suspense fallback={<BeautifulLoader />}>
    <div className="bg-gray-50 min-h-screen">
      <section className="relative py-20 bg-brand-purple overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="w-7 h-7 text-white" />
              <Title level={1}>Frequently Asked Questions (FAQs) – FirgoMart</Title>
            </div>
            <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
              Find quick answers to common questions about shopping, orders,
              payments, shipping, returns, and selling on FirgoMart.
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
            <div className="flex items-center gap-3 mb-3">
              <ShoppingCart className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Shopping</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>How to search and compare products</li>
              <li>Placing orders and applying coupons</li>
              <li>Understanding product availability</li>
              <li>Trusted sellers and product reviews</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Payments</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Supported payment methods</li>
              <li>Payment failures and retries</li>
              <li>Invoices and billing information</li>
              <li>Refund timelines and methods</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Shipping</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Delivery timelines and coverage</li>
              <li>Shipping charges and policies</li>
              <li>Real-time order tracking</li>
              <li>International shipping and customs</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <RotateCcw className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Returns & Refunds</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Return eligibility and conditions</li>
              <li>How to request a return</li>
              <li>Refund processing and timelines</li>
              <li>Non-returnable items</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Store className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Seller Support</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Seller registration and onboarding</li>
              <li>Product listing guidelines</li>
              <li>Order management support</li>
              <li>Settlement queries and policies</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Account & Security</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Creating and managing your account</li>
              <li>Updating personal details</li>
              <li>Password and login assistance</li>
              <li>Privacy and account deactivation</li>
            </ul>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-6 h-6 text-brand-purple" />
            <h3 className="text-xl font-bold text-gray-900">Seller FAQs</h3>
          </div>
          <div className="space-y-4 text-gray-800">
            <div>
              <p className="font-semibold">Q13. How can I sell on FirgoMart?</p>
              <p className="text-gray-700">
                Register as a seller by contacting{" "}
                <span className="text-brand-purple font-medium">seller@firgomart.com</span>.
              </p>
            </div>
            <div>
              <p className="font-semibold">Q14. How are seller payments processed?</p>
              <p className="text-gray-700">
                Payments are settled securely and on time as per the seller agreement.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            <div className="rounded-xl border border-gray-100 p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Still Have Questions?</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-purple" /> Email: support@firgomart.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-purple" /> Phone: +91 81006 60080
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-100 p-6 bg-purple-50">
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="w-5 h-5 text-brand-purple" />
                <h4 className="text-lg font-bold text-gray-900">Our Goal</h4>
              </div>
              <p className="text-gray-700">
                FirgoMart aims to make your shopping and selling experience simple, transparent,
                and reliable.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </Suspense>
  );
};

export default FaqPage;
