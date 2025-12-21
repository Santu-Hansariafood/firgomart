"use client";

import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Wallet,
  Landmark,
  Linkedin,
  ArrowUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
const PolicyModal = dynamic(() => import("@/components/common/PolicyModal/PolicyModal"), { ssr: false });
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));

const Footer: React.FC = () => {
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyType, setPolicyType] = useState<"privacy" | "terms" | "cookies" | "sitemap" | "disclaimer" | "affiliate" | null>(null);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openPolicy = (type: "privacy" | "terms" | "cookies" | "sitemap" | "disclaimer" | "affiliate") => {
    setPolicyType(type);
    setPolicyOpen(true);
  };

  const closePolicy = () => {
    setPolicyOpen(false);
    setPolicyType(null);
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <Title level={3} className="mb-4">Firgomart</Title>
            <Paragraph className="mb-4">
              Your one-stop destination for groceries, fashion, electronics, and
              home essentials — all at unbeatable prices. Shop smart, live
              better with Firgomart!
            </Paragraph>
            <div className="flex flex-wrap gap-3">
              <Link
                href="https://facebook.com/firgomart"
                aria-label="Facebook"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </Link>
              <Link
                href="https://twitter.com/firgomart"
                aria-label="Twitter"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="https://instagram.com/firgomart"
                aria-label="Instagram"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link
                href="https://linkedin.com/company/firgomart-24logistics-private-limited/"
                aria-label="LinkedIn"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div>
            <Title level={4} className="mb-4">Quick Links</Title>
            <ul className="space-y-2 text-sm">
              {[
                ["Home", "/"],
                ["About Us", "/about"],
                ["Become a Seller", "/seller-registration"],
                ["Careers", "/careers"],
                ["Blog", "/blog"],
              ].map(([label, link]) => (
                <li key={label}>
                  <Link href={link} className="hover:text-white transition-colors block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Title level={4} className="mb-4">Customer Service</Title>
            <ul className="space-y-2 text-sm">
              {[
                ["Help Center", "/help"],
                ["Track Order", "/track-order"],
                ["Returns & Refunds", "/returns"],
                ["Shipping Info", "/shipping"],
                ["FAQs", "/faq"],
              ].map(([label, link]) => (
                <li key={label}>
                  <Link href={link} className="hover:text-white transition-colors block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Title level={4} className="mb-4">Contact Us</Title>
            <ul className="space-y-3 text-sm">

              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 shrink-0" />
                <Link
                  href="https://www.google.com/maps/dir/?api=1&destination=48/2B+Radhanath+Chowdhury+Road+Tangra+Kolkata+West+Bengal+700015"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  48/2B Radhanath Chowdhury Road, Tangra, Kolkata, West Bengal – 700015
                </Link>
              </li>

              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+918100660080" className="hover:text-white transition-colors">
                  +91 81006 60080
                </a>
              </li>

              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:support@firgomart.com" className="hover:text-white transition-colors">
                  support@firgomart.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:info@firgomart.com" className="hover:text-white transition-colors">
                  info@firgomart.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Title level={5}>We Accept Payments</Title>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Credit / Debit Cards</span>
              </div>

              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-gray-400" />
                <span className="text-sm">UPI / Wallets (GPay, Paytm, PhonePe)</span>
              </div>

              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Net Banking</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <Paragraph className="text-center md:text-left">
              © {new Date().getFullYear() } Firgomart. All Rights Reserved.
            </Paragraph>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button onClick={() => openPolicy("privacy")} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => openPolicy("terms")} className="hover:text-white transition-colors">Terms of Service</button>
              <button onClick={() => openPolicy("cookies")} className="hover:text-white transition-colors">Cookie Policy</button>
              <button onClick={() => openPolicy("sitemap")} className="hover:text-white transition-colors">Sitemap</button>
              <button onClick={() => openPolicy("disclaimer")} className="hover:text-white transition-colors">Disclaimer</button>
              <button onClick={() => openPolicy("affiliate")} className="hover:text-white transition-colors">Affiliate Program</button>
            </div>

          </div>
        </div>
      </div>
      {policyOpen && (
        <PolicyModal open={policyOpen} onClose={closePolicy} policy={policyType} />
      )}
      {showTop && (
        <button
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors p-3 sm:p-4"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
    </footer>
  );
};

export default Footer;
