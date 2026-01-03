"use client";

import dynamic from "next/dynamic";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { Suspense, useState } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", text: data?.error || "Submission failed" });
      } else {
        setResult({ type: "success", text: "Message sent successfully" });
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (err: any) {
      setResult({ type: "error", text: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Suspense fallback={<BeautifulLoader />}>
    <div className="bg-gray-50 min-h-screen">
      <section className="relative py-20 bg-brand-purple overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Title level={1} className="mb-6">
              Contact Us
            </Title>
            <Paragraph className="max-w-2xl mx-auto text-purple-100 text-lg sm:text-xl">
              We’re here to help you. Whether you have questions about orders,
              deliveries, payments, or selling on FirgoMart, our team is always
              ready to assist you.
            </Paragraph>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 font-heading mb-6">
                Get in Touch
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
                    <p className="text-gray-600 mb-1">Our dedicated support team ensures quick and reliable assistance.</p>
                    <a href="mailto:support@firgomart.com" className="text-brand-purple hover:underline font-medium">
                      support@firgomart.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone Support</h4>
                    <p className="text-gray-600 mb-1">Speak directly with our customer service representatives.</p>
                    <a href="tel:+918100660080" className="text-brand-purple hover:underline font-medium">
                      +91 81006 60080
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Support Hours</h4>
                    <p className="text-gray-600">
                      9:00 AM – 9:00 PM
                      <br />
                      (All Days)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Corporate Office</h4>
                    <p className="text-gray-600">
                      Firgomart 24Logistics Private Limited
                      <br />
                      Kolkata, West Bengal
                      <br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-2xl">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-purple" />
                Global Reach
              </h4>
              <p className="text-sm text-gray-600">
                FirgoMart serves customers and sellers across regions. For international queries or partnerships, please contact us via email, and our team will respond promptly.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
              <h3 className="text-2xl font-bold text-gray-900 font-heading mb-6">
                Send us a Message
              </h3>
              {result && (
                <div className={result.type === "success" ? "mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-3" : "mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3"}>
                  {result.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Type your message here..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full sm:w-auto px-8 py-3 ${submitting ? "bg-purple-300" : "bg-brand-purple"} text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2`}
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </Suspense>
  );
};

export default ContactPage;
