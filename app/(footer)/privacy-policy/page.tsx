"use client";

import dynamic from "next/dynamic";
import React from "react";
const Title = dynamic(() => import("@/components/common/Title/Title"));
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"));

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Title level={1} className="text-center mb-6">
          Privacy Policy – FirgoMart.com
        </Title>
        <Paragraph className="text-center text-gray-400">
          Effective Date: <span className="text-white">01 January 2025</span>
        </Paragraph>
        <div className="bg-gray-800/60 p-6 sm:p-8 rounded-2xl shadow-lg space-y-6 border border-gray-700">
          <Paragraph>
            <strong>Owned & Operated By:</strong> FirgoMart 24Logistics Private Limited <br />
            <strong>Brand:</strong> FirgoMart <br />
            <strong>Website:</strong> https://www.firgomart.com
          </Paragraph>
          <Title level={3}>1. Introduction</Title>
          <Paragraph>
            This Privacy Policy explains how FirgoMart 24Logistics Private Limited (&quot;FirgoMart&quot;,
            &quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, &quot;Our&quot;) collects, uses, stores, protects, and shares your information
            when you use our website FirgoMart.com and mobile applications.
          </Paragraph>
          <Paragraph>
            This Policy is fully compliant with:
            <br />• Information Technology Act, 2000 (India)
            <br />• Information Technology (Reasonable Security Practices and Procedures and
            Sensitive Personal Data or Information) Rules, 2011
            <br />• Consumer Protection (E-Commerce) Rules, 2020
          </Paragraph>
          <Paragraph>
            By accessing or using FirgoMart.com, you agree to the terms of this Privacy Policy.
          </Paragraph>
          <Title level={3}>2. Information We Collect</Title>
          <Title level={5}>2.1 Personal Information</Title>
          <Paragraph>
            • Full Name <br />
            • Phone Number <br />
            • Email Address <br />
            • Billing & Shipping Address <br />
            • Date of Birth (optional) <br />
            • Identity details for KYC (only if required)
          </Paragraph>
          <Title level={5}>2.2 Payment & Financial Information</Title>
          <Paragraph>
            • UPI details (masked) <br />
            • Payment transaction IDs <br />
            • Card details (processed by gateway, not stored by us)
          </Paragraph>
          <Title level={5}>2.3 Technical Information</Title>
          <Paragraph>
            • IP address <br />
            • Device information <br />
            • Browser type <br />
            • Cookies & session data <br />
            • Location (if permitted)
          </Paragraph>
          <Title level={3}>3. How We Use Your Information</Title>
          <Paragraph>
            We use your information for:
            <br />• Processing orders & deliveries
            <br />• Customer support & communication
            <br />• Fraud detection & security monitoring
            <br />• Improving website & app performance
            <br />• Sending offers, updates, and notifications (opt-out available)
            <br />• Legal and regulatory compliance
          </Paragraph>
          <Paragraph className="font-semibold text-white">
            We never sell your personal data.
          </Paragraph>
          <Title level={3}>4. Sharing of Information</Title>
          <Paragraph>
            Your data may be shared only with:
            <br />• Verified delivery partners
            <br />• Payment gateway providers
            <br />• IT service providers
            <br />• Government authorities (only when legally required)
          </Paragraph>
          <Paragraph>
            We do not share information with unauthorized third parties.
          </Paragraph>
          <Title level={3}>5. Cookies & Tracking</Title>
          <Paragraph>
            FirgoMart uses cookies to enhance user experience. You may disable cookies via browser
            settings.
          </Paragraph>
          <Title level={3}>6. Data Storage & Security</Title>
          <Paragraph>
            We follow ISO/IEC 27001 aligned security standards. Your data is stored securely on
            servers located in India, as per legal compliance.
          </Paragraph>
          <Title level={3}>7. User Rights</Title>
          <Paragraph>
            Under Indian IT Rules, you may request:
            <br />• Access to your data
            <br />• Correction of information
            <br />• Deletion of non-essential data
            <br />• Withdrawal from marketing communications
          </Paragraph>
          <Paragraph>
            You may submit requests via our support email.
          </Paragraph>
          <Title level={3}>8. Children’s Privacy</Title>
          <Paragraph>
            FirgoMart does not knowingly collect data from individuals under 18. Such data may be
            deleted upon request.
          </Paragraph>
          <Title level={3}>9. Third-Party Links</Title>
          <Paragraph>
            Our website may contain links to external sites. We are not responsible for their
            privacy practices.
          </Paragraph>
          <Title level={3}>10. Updates to Privacy Policy</Title>
          <Paragraph>
            This Policy may be updated as required. A revised version for 2026 will be issued 45 days
            after policy review.
          </Paragraph>
          <Title level={3}>11. Contact Information</Title>
          <Paragraph>
            <strong>Email (Support):</strong> support@firgomart.com <br />
            <strong>Email (Help):</strong> help@firgomart.com <br />
            <strong>Company:</strong> FirgoMart 24Logistics Private Limited <br />
            <strong>Address:</strong> 48/2B, Radhanath Chowdhury Road, Kolkata – 700015,
            West Bengal, India.
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
