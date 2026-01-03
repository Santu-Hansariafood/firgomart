"use client";
import dynamic from "next/dynamic";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));
import { motion } from "framer-motion";
import {
  Search,
  ListChecks,
  Truck,
  Globe,
  LifeBuoy,
  ShieldCheck,
  Phone,
  Mail,
  ShoppingCart,
  RotateCcw,
  Store,
  Shield,
  Handshake,
  Clock,
  DollarSign,
  ClipboardCheck,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Suspense } from "react";

const HelpPage = () => {
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
              <ShieldCheck className="w-7 h-7 text-white" />
              <Title level={1}>Help Center – FirgoMart</Title>
            </div>
            <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
              Welcome to the FirgoMart Help Center. We are here to make your shopping and
              selling experience smooth, simple, and stress-free. This section provides quick
              answers, step-by-step guidance, and support for common questions and issues.
            </Paragraph>
            <Paragraph className="max-w-2xl mx-auto text-purple-100">
              If you need additional assistance, our customer support team is always available to help.
            </Paragraph>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <ShoppingCart className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Orders & Payments</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>How to place an order</li>
              <li>Order confirmation and status updates</li>
              <li>Payment methods and payment issues</li>
              <li>Invoice and billing information</li>
              <li>Order cancellation guidelines</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Shipping & Delivery</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Delivery timelines and coverage</li>
              <li>Shipping charges and policies</li>
              <li>Real-time order tracking</li>
              <li>Delivery delays and rescheduling</li>
              <li>Cross-border shipping support</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <RotateCcw className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Returns & Refunds</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Return eligibility and conditions</li>
              <li>How to request a return</li>
              <li>Refund processing timeline</li>
              <li>Replacement and exchange policy</li>
              <li>Refund status tracking</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Account & Security</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Creating and managing your account</li>
              <li>Updating personal details</li>
              <li>Password and login assistance</li>
              <li>Account security and privacy</li>
              <li>Deactivating your account</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Store className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Seller Support</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Seller registration and onboarding</li>
              <li>Product listing guidelines</li>
              <li>Order management support</li>
              <li>Payment settlement queries</li>
              <li>Seller policies and compliance</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <LifeBuoy className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">Still Need Help?</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-purple" /> Email: support@firgomart.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-purple" /> Phone: +91 81006 60080
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-purple" /> Support Hours: 9:00 AM – 9:00 PM (All Days)
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-gray-100 bg-purple-50 p-8 mb-16"
        >
          <div className="flex items-center gap-3 mb-2">
            <Handshake className="w-6 h-6 text-brand-purple" />
            <h3 className="text-xl font-bold text-gray-900">Our Promise</h3>
          </div>
          <Paragraph className="text-gray-700">
            At FirgoMart, customer satisfaction is our priority. We continuously improve our
            Help Center to ensure you receive fast, clear, and reliable assistance whenever you need it.
          </Paragraph>
        </motion.div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Your Order</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                How to Track Your Order
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Log in to your FirgoMart account</li>
              <li>Go to My Orders</li>
              <li>Select the order you want to track</li>
              <li>Click on Track Order to view live updates</li>
              <li>
                You can also track using your Order ID shared via email or SMS
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <ListChecks className="w-6 h-6 text-brand-purple" />
              <h3 className="text-xl font-bold text-gray-900">
                Order Status Updates
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Order Placed: Successfully placed</li>
              <li>Processing: Seller is preparing your order</li>
              <li>Shipped: Handed over to delivery partner</li>
              <li>Out for Delivery: On the way</li>
              <li>Delivered: Order delivered successfully</li>
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
                Real-Time Tracking
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Live delivery status and location updates</li>
              <li>Estimated delivery date</li>
              <li>Courier and logistics partner details</li>
              <li>Notifications via email and SMS</li>
            </ul>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">
                Domestic & International Tracking
              </h3>
            </div>
            <Paragraph className="text-gray-700">
              FirgoMart supports domestic and cross-border deliveries.
              International orders include customs and transit updates for better
              visibility.
            </Paragraph>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <LifeBuoy className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">
                Need Help With Tracking?
              </h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-purple" /> Email:
                support@firgomart.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-purple" /> Phone: +91 81006
                60080
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-12 rounded-2xl border border-gray-100 bg-purple-50 p-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Our Commitment</h3>
          <Paragraph className="text-gray-700">
            FirgoMart is committed to providing reliable deliveries and clear
            communication. Our order tracking system ensures you stay informed at every stage of
            your delivery journey.
          </Paragraph>
        </motion.div>

        <div className="mt-16 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">Shipping Coverage</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>FirgoMart delivers to multiple locations across regions</li>
              <li>Domestic and international shipping options are available</li>
              <li>Delivery availability depends on product type and destination</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">Delivery Timelines</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Standard Delivery: 2–7 business days</li>
              <li>Express Delivery: 1–3 business days (where available)</li>
              <li>International Shipping: 5–15 business days</li>
              <li className="text-gray-600">Timelines may vary due to customs, weather, or operational factors</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">Shipping Charges</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Calculated based on product weight, size, and destination</li>
              <li>Charges clearly displayed at checkout</li>
              <li>Promotions may include free or discounted shipping</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <ClipboardCheck className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">Order Processing</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Processed within 24–48 hours after confirmation</li>
              <li>Weekend or holiday orders processed next business day</li>
              <li>Customers receive confirmation once order is shipped</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">Order Tracking</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>Real-time order tracking available</li>
              <li>Tracking details shared via email and SMS</li>
              <li>Track orders from your FirgoMart account</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-brand-purple" />
              <h3 className="text-lg font-bold text-gray-900">International Shipping & Customs</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>International shipments may be subject to customs duties and taxes</li>
              <li>Customs clearance time may vary by country</li>
              <li>Customers are responsible for applicable import charges unless stated otherwise</li>
            </ul>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 rounded-2xl border border-gray-100 bg-purple-50 p-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-brand-purple" />
            <h3 className="text-lg font-bold text-gray-900">Delivery Exceptions</h3>
          </div>
          <Paragraph className="text-gray-700">
            Delays may occur due to natural events, customs clearance, or operational issues.
            Customers will be notified in case of unexpected delays. FirgoMart works proactively
            to minimize delivery disruptions.
          </Paragraph>
        </motion.div>
      </div>
    </div>
    </Suspense>
  );
};

export default HelpPage;
