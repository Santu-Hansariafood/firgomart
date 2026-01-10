"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));
import { motion } from "framer-motion";
import { Globe, Users, TrendingUp, ShieldCheck, Rocket, Package } from "lucide-react";
import { Suspense } from "react";

const AboutPage = () => {

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const features = [
    {
      icon: <Globe className="w-8 h-8 text-brand-purple" />,
      title: "Global Marketplace",
      desc: "Connecting customers and sellers across regions through a trusted digital platform.",
    },
    {
      icon: <Package className="w-8 h-8 text-brand-purple" />,
      title: "End-to-End Logistics",
      desc: "Seamless order management, real-time tracking, and reliable doorstep delivery.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand-purple" />,
      title: "Secure Transactions",
      desc: "Multiple secure payment options and transparent refund policies.",
    },
    {
      icon: <Users className="w-8 h-8 text-brand-purple" />,
      title: "Seller Empowerment",
      desc: "Helping local and international sellers reach a broader global audience.",
    },
  ];

  return (
    <Suspense fallback={<BeautifulLoader />}>
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <section className="relative py-20 bg-brand-purple overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Title level={1} className="mb-6">
              About FirgoMart
            </Title>
            <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
              FirgoMart is a global e-commerce and logistics platform operated by
              Firgomart 24Logistics Private Limited, built to connect customers and
              sellers through a trusted, technology-driven digital marketplace.
            </Paragraph>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          <motion.div
            variants={fadeInUp}
            className="bg-[var(--background)] p-8 rounded-2xl shadow-sm border border-[var(--foreground)/10] hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
              <Rocket className="w-6 h-6 text-brand-purple" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4 font-heading">
              Our Mission
            </h3>
            <p className="text-[var(--foreground)/70] leading-relaxed">
              Our mission is to build a trusted global e-commerce ecosystem that
              empowers sellers, delights customers, and delivers products
              efficiently through advanced logistics solutions.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-[var(--background)] p-8 rounded-2xl shadow-sm border border-[var(--foreground)/10] hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-brand-purple" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4 font-heading">
              Our Vision
            </h3>
            <p className="text-[var(--foreground)/70] leading-relaxed">
              To become a globally recognized e-commerce and logistics brand that
              connects businesses and consumers beyond borders, driven by
              innovation, quality, and trust.
            </p>
          </motion.div>
        </motion.div>

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] font-heading mb-4">
              What We Do
            </h2>
            <p className="text-[var(--foreground)/70] max-w-2xl mx-auto">
              We combine innovative technology with efficient logistics to create a
              smooth and reliable shopping experience across regions.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-[var(--background)] p-6 rounded-xl border border-[var(--foreground)/10] text-center hover:border-brand-purple/30 transition-colors"
              >
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2 font-heading">
                  {feature.title}
                </h4>
                <p className="text-sm text-[var(--foreground)/70]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-[var(--background)] rounded-3xl p-8 sm:p-12 border border-[var(--foreground)/10]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--foreground)] font-heading">
              Our Core Values
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Customer First",
                desc: "Every decision is made with customer satisfaction in mind.",
              },
              {
                title: "Trust & Transparency",
                desc: "Clear communication and honest practices in everything we do.",
              },
              {
                title: "Innovation",
                desc: "Continuous improvement through technology and smart solutions.",
              },
              {
                title: "Reliability",
                desc: "Consistent service and dependable delivery you can count on.",
              },
              {
                title: "Growth Together",
                desc: "Supporting sellers, partners, and communities to grow with us.",
              },
            ].map((value, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-2 h-2 mt-2.5 rounded-full bg-brand-purple shrink-0" />
                <div>
                  <h4 className="font-bold text-[var(--foreground)] mb-1">{value.title}</h4>
                  <p className="text-sm text-[var(--foreground)/70]">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold text-[var(--foreground)] font-heading mb-6">
              Logistics & Technology
            </h2>
            <div className="space-y-4 text-[var(--foreground)/70] leading-relaxed">
              <p>
                FirgoMart operates with a strong logistics backbone that supports
                timely deliveries and efficient order fulfillment.
              </p>
              <p>
                Our technology-enabled systems allow real-time tracking, inventory
                management, and seamless coordination between sellers, warehouses,
                and delivery partners.
              </p>
              <p>
                We continuously enhance our systems to meet international
                standards in e-commerce and logistics services.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2 bg-brand-purple/10 rounded-2xl p-8 h-64 flex items-center justify-center">
            {/* Placeholder for an image or illustration */}
            <div className="text-center">
              <Package className="w-16 h-16 text-brand-purple mx-auto mb-4 opacity-50" />
              <span className="text-brand-purple font-medium">
                Advanced Logistics Network
              </span>
            </div>
          </div>
        </motion.section>

        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--foreground)] font-heading mb-4">
            Our Commitment
          </h2>
          <p className="text-[var(--foreground)/70]">
            FirgoMart is committed to delivering quality products, reliable
            services, and exceptional customer experiences. As we continue to grow
            globally, we remain focused on building long-term trust with our
            customers, sellers, and partners.
          </p>
        </section>
      </div>
    </div>
    </Suspense>
  );
};

export default AboutPage;
