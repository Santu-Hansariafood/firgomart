"use client";
import React, { Suspense } from "react";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
import Title from "@/components/common/Title/Title";
import Paragraph from "@/components/common/Paragraph/Paragraph";
import { motion } from "framer-motion";
import {
  Users,
  Monitor,
  Package,
  Store,
  Headphones,
  Megaphone,
  BarChart3,
  Wallet,
  Target,
  Sparkles,
} from "lucide-react";

const TeamsPage = () => {
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
              <Users className="w-7 h-7 text-white" />
              <Title level={1}>Our Teams – FirgoMart</Title>
            </div>
            <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
              At FirgoMart, our strength lies in our people. Our teams work
              together across technology, logistics, operations, and customer
              service to deliver a reliable and seamless e-commerce experience
              worldwide.
            </Paragraph>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <Paragraph className="text-gray-700">
            We believe in collaboration, innovation, accountability, and
            continuous improvement. Every team at FirgoMart plays a vital role
            in ensuring quality service and customer satisfaction.
          </Paragraph>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Technology & Product Team
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Develops and maintains the FirgoMart website and platforms</li>
              <li>Ensures smooth performance, security, and scalability</li>
              <li>Implements new features to improve user experience</li>
              <li>Manages data, integrations, and platform reliability</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Logistics & Operations Team
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Manages order fulfillment and delivery processes</li>
              <li>Coordinates warehouses and shipping partners</li>
              <li>Ensures safe handling and timely delivery</li>
              <li>Oversees domestic and cross-border operations</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Seller Management Team
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Supports seller onboarding and verification</li>
              <li>Assists with listings and order management</li>
              <li>Ensures compliance with quality standards</li>
              <li>Builds strong relationships with partners</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Headphones className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Customer Support Team
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Handles customer queries and feedback</li>
              <li>Assists with orders, payments, and returns</li>
              <li>Provides clear and timely communication</li>
              <li>Ensures high customer satisfaction</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Marketing & Growth Team
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Drives brand awareness and global growth</li>
              <li>Manages digital marketing and campaigns</li>
              <li>Analyzes customer behavior and trends</li>
              <li>Builds long-term engagement</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Finance & Administration Team
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Manages secure payments and settlements</li>
              <li>Handles compliance and financial reporting</li>
              <li>Oversees vendor payments and expenses</li>
              <li>Ensures transparency and integrity</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Leadership & Strategy Team
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Defines vision, mission, and long-term goals</li>
              <li>Oversees business growth and expansion</li>
              <li>Ensures ethical practices and governance</li>
              <li>Guides teams toward innovation and excellence</li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-brand-purple" />
            <h3 className="text-xl font-bold text-gray-900">Our Work Culture</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-purple-50 text-gray-800">
              Team-driven and collaborative environment
            </div>
            <div className="p-4 rounded-xl bg-purple-50 text-gray-800">
              Focus on learning and growth
            </div>
            <div className="p-4 rounded-xl bg-purple-50 text-gray-800">
              Respect, transparency, and accountability
            </div>
            <div className="p-4 rounded-xl bg-purple-50 text-gray-800">
              Innovation-oriented mindset
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </Suspense>
  );
};

export default TeamsPage;
