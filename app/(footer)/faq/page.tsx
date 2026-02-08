"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));
import { motion, AnimatePresence } from "framer-motion";
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
  Globe,
  ChevronDown,
} from "lucide-react";
import { Suspense } from "react";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
import { useState } from "react";

const INTERNATIONAL_FAQS = [
  {
    id: 1,
    question: "Does FirgoMart deliver internationally?",
    answer: "Yes. FirgoMart delivers selected products to multiple countries. All international orders are shipped directly from India using international logistics partners."
  },
  {
    id: 2,
    question: "Are customs duties and import taxes included in the product price?",
    answer: "No. For international orders, customs duties, import taxes, VAT, or any local charges imposed by the destination country are not included in the product price. These charges, if applicable, must be paid by the customer at the time of delivery or customs clearance."
  },
  {
    id: 3,
    question: "Is Cash on Delivery (COD) available for international orders?",
    answer: "No. Cash on Delivery (COD) is available only for orders shipped within India. All international orders must be prepaid using supported online payment methods."
  },
  {
    id: 4,
    question: "What is the return policy for international orders?",
    answer: "International orders are not eligible for standard returns or exchanges due to cross-border logistics and customs regulations. Refunds are considered only if the product is damaged, defective, or incorrectly delivered, subject to verification."
  },
  {
    id: 5,
    question: "Do I need to return the product for an international refund?",
    answer: "In most approved international refund cases, physical return of the product to India is not required. FirgoMart reserves the right to decide the refund method after verification."
  },
  {
    id: 6,
    question: "How long does an international refund take?",
    answer: "Approved refunds for international prepaid orders are processed to the original payment method. Refund timelines may vary depending on the payment gateway, bank processing time, and foreign exchange regulations."
  },
  {
    id: 7,
    question: "What if my order is delayed or stopped by customs?",
    answer: "International delivery timelines may vary due to customs clearance and regulatory checks. If an order is delayed, rejected, seized, or returned by customs due to import restrictions or local regulations of the destination country, FirgoMart is not liable for refunds or replacements."
  },
  {
    id: 8,
    question: "Are all products eligible for international shipping?",
    answer: "Not all products may be eligible for delivery to every country. Buyers are responsible for ensuring that the products ordered comply with the import laws and regulations of their destination country."
  }
];

const FaqItem = ({ item, isOpen, onClick }: { item: typeof INTERNATIONAL_FAQS[0], isOpen: boolean, onClick: () => void }) => {
  return (
    <div className={`border rounded-xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-brand-purple bg-brand-purple/5' : 'border-[var(--foreground)]/10 hover:border-brand-purple/50'}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors"
      >
        <span className={`font-semibold text-sm sm:text-base ${isOpen ? 'text-brand-purple' : 'text-[var(--foreground)]'}`}>
          {item.id}. {item.question}
        </span>
        <ChevronDown className={`w-5 h-5 text-brand-purple transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-[var(--foreground)]/70 text-sm leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FaqPage = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

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
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <ShoppingCart className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Shopping</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
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
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Payments</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
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
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Shipping</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
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
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <RotateCcw className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Returns & Refunds</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
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
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Store className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Seller Support</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
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
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-[color:var(--foreground)]">Account & Security</h3>
            </div>
            <ul className="space-y-2 text-[var(--foreground)/70]">
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
          className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-brand-purple" />
            <h3 className="text-xl font-bold text-[color:var(--foreground)]">International Orders – FAQs</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {INTERNATIONAL_FAQS.map((faq) => (
              <FaqItem
                key={faq.id}
                item={faq}
                isOpen={openId === faq.id}
                onClick={() => toggleFaq(faq.id)}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--foreground)/10] p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-6 h-6 text-brand-purple" />
            <h3 className="text-xl font-bold text-[color:var(--foreground)]">Seller FAQs</h3>
          </div>
          <div className="space-y-4 text-[var(--foreground)/80]">
            <div>
              <p className="font-semibold">How can I sell on FirgoMart?</p>
              <p className="text-[var(--foreground)/70]">
                Register as a seller by contacting{" "}
                <span className="text-brand-purple font-medium">seller@firgomart.com</span>.
              </p>
            </div>
            <div>
              <p className="font-semibold">How are seller payments processed?</p>
              <p className="text-[var(--foreground)/70]">
                Payments are settled securely and on time as per the seller agreement.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            <div className="rounded-xl border border-[var(--foreground)/10] p-6">
              <h4 className="text-lg font-bold text-[color:var(--foreground)] mb-3">Still Have Questions?</h4>
              <ul className="space-y-2 text-[var(--foreground)/70]">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-purple" /> Email: support@firgomart.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-purple" /> Phone: +91 81006 60080
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--foreground)/10] p-6 bg-brand-purple/10">
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="w-5 h-5 text-brand-purple" />
                <h4 className="text-lg font-bold text-[color:var(--foreground)]">Our Goal</h4>
              </div>
              <p className="text-[var(--foreground)/70]">
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
