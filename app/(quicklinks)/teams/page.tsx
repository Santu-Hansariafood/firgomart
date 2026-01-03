"use client";
import React, { Suspense, useState, useMemo } from "react";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
import Title from "@/components/common/Title/Title";
import Paragraph from "@/components/common/Paragraph/Paragraph";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Monitor,
  Package,
  Store,
  Headphones,
  Megaphone,
  Wallet,
  Target,
  Sparkles,
  Eye,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
} from "lucide-react";
import FallbackImage from "@/components/common/Image/FallbackImage";
import teamsJson from "@/data/teams.json";

const TeamsPage = () => {
  const [activeTitle, setActiveTitle] = useState<string | null>(null)
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
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setActiveTitle("Technology & Product Team")}
                className="px-4 py-2 rounded-lg bg-brand-purple text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Click to View
              </button>
            </div>
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
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setActiveTitle("Logistics & Operations Team")}
                className="px-4 py-2 rounded-lg bg-brand-purple text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Click to View
              </button>
            </div>
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
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setActiveTitle("Seller Management Team")}
                className="px-4 py-2 rounded-lg bg-brand-purple text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Click to View
              </button>
            </div>
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
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setActiveTitle("Customer Support Team")}
                className="px-4 py-2 rounded-lg bg-brand-purple text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Click to View
              </button>
            </div>
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
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setActiveTitle("Marketing & Growth Team")}
                className="px-4 py-2 rounded-lg bg-brand-purple text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Click to View
              </button>
            </div>
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
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setActiveTitle("Finance & Administration Team")}
                className="px-4 py-2 rounded-lg bg-brand-purple text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Click to View
              </button>
            </div>
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
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setActiveTitle("Leadership & Strategy Team")}
                className="px-4 py-2 rounded-lg bg-brand-purple text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Click to View
              </button>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {activeTitle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setActiveTitle(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                      <div className="relative w-10 h-10">
                        <FallbackImage
                          src={(teamsJson as any)?.[activeTitle]?.logo || "/globe.svg"}
                          alt="logo"
                          fill
                          sizes="40px"
                          unoptimized={false}
                          priority
                          className="object-contain"
                        />
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900">{activeTitle}</h3>
                  </div>
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-gray-700">
                    {(teamsJson as any)?.[activeTitle]?.description || "Team details coming soon."}
                  </motion.p>
                  <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(((teamsJson as any)?.[activeTitle]?.members) || []).map((m: any, idx: number) => (
                      <motion.div key={m.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="border rounded-xl overflow-hidden">
                        <div className="relative w-full aspect-[4/3]">
                          <FallbackImage
                            src={m.image}
                            alt={m.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized={false}
                            priority
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="font-semibold text-gray-900">{m.name}</div>
                          {m?.bio && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{m.bio}</p>}
                          <div className="mt-3 flex items-center gap-3">
                            {m?.links?.linkedin && (
                              <a href={m.links.linkedin} target="_blank" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center">
                                <Linkedin className="w-4 h-4 text-gray-700" />
                              </a>
                            )}
                            {m?.links?.instagram && (
                              <a href={m.links.instagram} target="_blank" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center">
                                <Instagram className="w-4 h-4 text-gray-700" />
                              </a>
                            )}
                            {m?.links?.x && (
                              <a href={m.links.x} target="_blank" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center">
                                <Twitter className="w-4 h-4 text-gray-700" />
                              </a>
                            )}
                            {m?.links?.facebook && (
                              <a href={m.links.facebook} target="_blank" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center">
                                <Facebook className="w-4 h-4 text-gray-700" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setActiveTitle(null)}
                      className="px-4 py-2 rounded-lg bg-brand-purple text-white hover:bg-purple-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
