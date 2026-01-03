"use client";
import React from "react";
import Title from "@/components/common/Title/Title";
import Paragraph from "@/components/common/Paragraph/Paragraph";
import { motion } from "framer-motion";
import {
  Briefcase,
  Sparkles,
  Monitor,
  Package,
  Truck,
  Headphones,
  Megaphone,
  Wallet,
  Users,
  Target,
  Mail,
} from "lucide-react";

const CareersPage = () => {
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
              <Briefcase className="w-7 h-7 text-white" />
              <Title level={1}>Careers at FirgoMart</Title>
            </div>
            <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
              At FirgoMart, we believe people are the foundation of our success.
              We are building a global e-commerce and logistics platform, and we
              are always looking for passionate, talented, and motivated
              individuals to grow with us.
            </Paragraph>
            <Paragraph className="max-w-3xl mx-auto text-purple-100">
              If you are driven by innovation, teamwork, and the desire to
              create meaningful impact, FirgoMart is the place for you.
            </Paragraph>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">
                Why Work With FirgoMart?
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Fast-growing global e-commerce environment</li>
              <li>Learning, growth, and career development</li>
              <li>Collaborative and inclusive culture</li>
              <li>Exposure to logistics, technology, and digital commerce</li>
              <li>Performance-driven and people-focused organization</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">
                Career Opportunities
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2"><Monitor className="w-4 h-4 text-brand-purple" /> Technology & Software Development</li>
              <li className="flex items-center gap-2"><Package className="w-4 h-4 text-brand-purple" /> Logistics & Supply Chain Operations</li>
              <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-brand-purple" /> Warehouse & Delivery Operations</li>
              <li className="flex items-center gap-2"><Headphones className="w-4 h-4 text-brand-purple" /> Customer Support & Service</li>
              <li className="flex items-center gap-2"><Megaphone className="w-4 h-4 text-brand-purple" /> Sales, Marketing & Growth</li>
              <li className="flex items-center gap-2"><Wallet className="w-4 h-4 text-brand-purple" /> Finance, HR & Administration</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">
                Growth & Development
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Continuous learning and skill development</li>
              <li>Career progression opportunities</li>
              <li>On-the-job training and mentorship</li>
              <li>Performance recognition and rewards</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">Our Work Culture</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Respectful and supportive workplace</li>
              <li>Teamwork and open communication</li>
              <li>Innovation and problem-solving mindset</li>
              <li>Commitment to quality and customer satisfaction</li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-6 h-6 text-brand-purple" />
            <h3 className="text-xl font-bold text-gray-900">How to Apply</h3>
          </div>
          <div className="space-y-2 text-gray-700">
            <p>If you’re interested in joining FirgoMart, we’d love to hear from you.</p>
            <p>Send your resume to <span className="font-medium text-brand-purple">careers@firgomart.com</span></p>
            <p>Subject Line: <span className="font-medium">Position Name – Your Name</span></p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 rounded-2xl border border-gray-100 bg-purple-50 p-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Join Us</h3>
          <Paragraph className="text-gray-700">
            Be a part of FirgoMart’s journey to build a trusted global e-commerce and logistics platform.
            Together, let’s shape the future of online shopping and delivery.
          </Paragraph>
        </motion.div>
      </div>
    </div>
  );
};

export default CareersPage;
