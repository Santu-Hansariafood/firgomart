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
import Image from "@/components/common/Image/FallbackImage";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));

const Footer: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get('search');

  const [showTop, setShowTop] = useState(false);
  const addressText =
    "Plot No. 678 1st Floor, Majherpara, P.O. Hatiara, P.S. Newtown, near Chota Masjid, Baguiati, Kolkata, West Bengal 700157";
  const addressHref =
    "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(addressText + ", RF Manzil");
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [target, setTarget] = useState<"_blank" | "_self">("_blank");

  useEffect(() => {
    const checkMobile = () => {
      setTarget(window.innerWidth < 768 ? "_self" : "_blank");
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const hideOnPaths = ['/checkout', '/wishlist', '/cart', '/orders', '/profile'];
  if (hideOnPaths.some(path => pathname === path || pathname?.startsWith(`${path}/`))) return null;

  return (
    <footer className={`bg-brand-black text-gray-300 pb-24 md:pb-0 ${search ? 'hidden md:block' : ''}`}>
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 mb-8 sm:mb-10">
          <div>
            <Image src="/logo/firgomart.png" alt="FirgoMart Logo" width={100} height={20} className="mb-4 bg-transparent border-0" frameless />
            <Paragraph className="mb-4 text-gray-300">
              FirgoMart is a multi-category brand offering quality fashion footwear accessories and daily lifestyle products We focus on reliable quality fast delivery and a smooth shopping experience for every customer
            </Paragraph>
            <div className="flex flex-wrap gap-3">
              <Link
                href="https://facebook.com/firgomart"
                target="_blank"
                aria-label="Facebook"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-purple transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </Link>
              <Link
                href="https://twitter.com/firgomart"
                target="_blank"
                aria-label="Twitter"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-purple transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="https://instagram.com/firgomart"
                target="_blank"
                aria-label="Instagram"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-red transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link
                href="https://linkedin.com/company/firgomart-24logistics-private-limited/"
                target="_blank"
                aria-label="LinkedIn"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-purple transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div>
            <Title level={4} className="mb-4 text-white">Quick Links</Title>
            <ul className="space-y-2 text-sm">
              {[
                ["Home", "/"],
                ["About Us", "/about"],
                ["Contact Us", "/contact"],
                ["Teams", "/teams"],
                ["Sell on FirgoMart", "/seller-registration"],
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
            <Title level={4} className="mb-4 text-white">Customer Service</Title>
            <ul className="space-y-2 text-sm">
              {[
                ["Help Center", "/help"],
                ["Track Order", "/track-order"],
                ["Trust & Safety", "/trust-safety"],
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
            <Title level={4} className="mb-4 text-white">Company & Contact</Title>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Landmark className="w-4 h-4 mt-1 shrink-0" />
                <div>
                  <div className="font-medium text-white">FirgoMart 24Logistics Private Limited</div>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Landmark className="w-4 h-4 mt-1 shrink-0" />
                <div>
                  <span className="text-gray-400">CIN:</span> U47912WB2025PTC281316
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Landmark className="w-4 h-4 mt-1 shrink-0" />
                <div>
                  <span className="text-gray-400">GSTIN:</span> 19AAGCF5282L1Z3
                </div>
              </li>

              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 shrink-0" />
                <Link
                  href={addressHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <span className="block font-medium text-white">Communication Address</span>
                  <span className="block">{addressText}</span>
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+918100660080" className="hover:text-white transition-colors">
                  +91 8100660080
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
        <div className="border-t border-gray-800 pt-6 sm:pt-8 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Title level={5} className="text-white">We Accept Payments</Title>

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
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-sm">
              {[
                ["Privacy Policy", "/privacy-policy"],
                ["Terms of Service", "/terms"],
                ["Cookie Policy", "/cookie-policy"],
                ["Sitemap", "/site-map"],
                ["Disclaimer", "/disclaimer"],
                ["Affiliate Program", "/affiliate-program"],
              ].map(([label, link]) => (
                <Link
                  key={link}
                  href={link}
                  target={target}
                  rel={target === "_blank" ? "noopener noreferrer" : undefined}
                  className="hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>

            <Paragraph className="text-center md:text-right text-gray-300">
              © 2025 - {new Date().getFullYear() } FirgoMart. All Rights Reserved.
            </Paragraph>

          </div>
        </div>
      </div>
      {showTop && (
        <button
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-brand-purple text-white rounded-full shadow-lg hover:bg-brand-red transition-colors p-3 sm:p-4"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
    </footer>
  );
};

export default Footer;
