"use client";
import React, { useState, useEffect } from "react";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
import Title from "@/components/common/Title/Title";
import Paragraph from "@/components/common/Paragraph/Paragraph";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Heart, Zap, Globe, Coffee, Smile } from "lucide-react";
import JobCard from "@/components/ui/Careers/JobCard";

interface Career {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

const CareersPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await fetch("/api/careers");
        const data = await res.json();
        if (data.careers) {
          setCareers(data.careers);
        }
      } catch (error) {
        console.error("Failed to fetch careers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const benefits = [
    {
      icon: <Heart className="w-6 h-6 text-brand-purple" />,
      title: "Health & Wellness",
      desc: "Comprehensive medical, dental, and vision coverage for you and your family.",
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-purple" />,
      title: "Growth & Learning",
      desc: "Annual learning budget, mentorship programs, and career development paths.",
    },
    {
      icon: <Globe className="w-6 h-6 text-brand-purple" />,
      title: "Remote Friendly",
      desc: "Flexible work arrangements and support for remote collaboration.",
    },
    {
      icon: <Coffee className="w-6 h-6 text-brand-purple" />,
      title: "Work-Life Balance",
      desc: "Generous PTO, parental leave, and mental health days.",
    },
    {
      icon: <Smile className="w-6 h-6 text-brand-purple" />,
      title: "Team Culture",
      desc: "Regular team retreats, virtual events, and a supportive environment.",
    },
    {
      icon: <Rocket className="w-6 h-6 text-brand-purple" />,
      title: "Impact",
      desc: "Work on projects that reach millions of users worldwide.",
    },
  ];

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
                <Rocket className="w-7 h-7 text-white" />
                <Title level={1}>Join Our Mission</Title>
              </div>
              <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
                Build the future of e-commerce with us. We're looking for
                passionate individuals who want to make a difference.
              </Paragraph>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-[color:var(--foreground)]">
                Why FirgoMart?
              </h2>
              <Paragraph className="text-[var(--foreground)/70] max-w-2xl mx-auto">
                We take care of our people so they can take care of our
                customers.
              </Paragraph>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--foreground)/10] hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 bg-brand-purple/10 w-12 h-12 flex items-center justify-center rounded-xl">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[color:var(--foreground)]">
                    {benefit.title}
                  </h3>
                  <p className="text-[var(--foreground)/70] leading-relaxed">
                    {benefit.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div id="open-positions" className="scroll-mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-[color:var(--foreground)]">
                Open Positions
              </h2>
              <Paragraph className="text-[var(--foreground)/70] max-w-2xl mx-auto">
                Find your next role and help us shape the future of shopping.
              </Paragraph>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <BeautifulLoader />
              </div>
            ) : careers.length > 0 ? (
              <div className="grid gap-6 max-w-4xl mx-auto">
                {careers.map((career) => (
                  <JobCard
                    key={career._id}
                    career={career}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[var(--foreground)/5] rounded-2xl border border-[var(--foreground)/10]">
                <p className="text-[var(--foreground)/60] text-lg">
                  No open positions at the moment. Please check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default CareersPage;
