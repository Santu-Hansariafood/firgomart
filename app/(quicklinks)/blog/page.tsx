"use client";
import React from "react";
import Title from "@/components/common/Title/Title";
import Paragraph from "@/components/common/Paragraph/Paragraph";
import { motion } from "framer-motion";
import {
  BookOpen,
  ShoppingCart,
  Store,
  Truck,
  Megaphone,
  TrendingUp,
  Shield,
} from "lucide-react";

const BlogPage = () => {
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
              <BookOpen className="w-7 h-7 text-white" />
              <Title level={1}>FirgoMart Blog</Title>
            </div>
            <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
              Welcome to the FirgoMart Blog, your destination for insights,
              updates, and knowledge from the world of e-commerce, logistics,
              and digital business.
            </Paragraph>
            <Paragraph className="max-w-3xl mx-auto text-purple-100">
              We inform, educate, and inspire customers, sellers, and partners
              with valuable content to help you make better decisions and stay
              updated with industry trends.
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
              <ShoppingCart className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Shopping Guides
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Product recommendations, buying tips, and comparisons</li>
              <li>Learn how to shop smart and safely online</li>
              <li>Discover new products and deals</li>
              <li>Get updates on policies and features</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Seller Insights</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Best practices for selling online</li>
              <li>Tips on product listings, pricing, and promotions</li>
              <li>Insights into logistics and fulfillment strategies</li>
              <li>Grow online businesses and improve sales</li>
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
                Logistics & Delivery
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Behind-the-scenes of supply chain and delivery</li>
              <li>How FirgoMart ensures timely deliveries</li>
              <li>Innovations in last-mile logistics</li>
              <li>Cross-border shipping updates and practices</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Company Updates</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Announcements and platform improvements</li>
              <li>New features and product launches</li>
              <li>Policy changes and service updates</li>
              <li>Community and partner programs</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Industry Trends</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Latest developments in e-commerce</li>
              <li>Global trade and market analysis</li>
              <li>Technology and innovation highlights</li>
              <li>Data-driven insights and reports</li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-brand-purple" />
            <h3 className="text-xl font-bold text-gray-900">Our Commitment</h3>
          </div>
          <Paragraph className="text-gray-700">
            We publish well-researched, easy-to-understand, and useful content.
            Our goal is to add value to our community and build trust through
            transparency and knowledge sharing.
          </Paragraph>
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Stay Connected
            </h4>
            <Paragraph className="text-gray-700">
              Check back regularly for new articles, updates, and insights from
              FirgoMart.
            </Paragraph>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPage;
