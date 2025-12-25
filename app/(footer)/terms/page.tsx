"use client";

import Title from "@/components/common/Title/Title";
import Paragraph from "@/components/common/Paragraph/Paragraph";

const page = () => {
  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Title level={1} className="text-center mb-6">
          Terms & Conditions – FirgoMart.com
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
            These Terms & Conditions (&quot;Terms&quot;) govern your access to and use of
            FirgoMart.com, owned and operated by FirgoMart 24Logistics Private Limited.
            By using our website or mobile application, you agree to these Terms.
          </Paragraph>

          <Paragraph>
            These Terms comply with:
            <br />• Information Technology Act, 2000
            <br />• Consumer Protection (E-Commerce) Rules, 2020
            <br />• Indian Contract Act, 1872
          </Paragraph>

          <Title level={3}>2. Eligibility</Title>
          <Paragraph>
            To use FirgoMart, you must:
            <br />• Be 18 years or older
            <br />• Have a valid mobile number and email
            <br />• Use the platform only for lawful purchases
          </Paragraph>

          <Title level={3}>3. Account Registration</Title>
          <Paragraph>
            By creating an account, you agree to:
            <br />• Provide accurate and updated information
            <br />• Maintain confidentiality of login credentials
            <br />• Take responsibility for all activities under your account
          </Paragraph>

          <Paragraph>
            FirgoMart may suspend or terminate accounts involved in fraud, misuse,
            or violation of any policy.
          </Paragraph>

          <Title level={3}>4. Products & Services</Title>
          <Paragraph>
            All products listed on FirgoMart are:
            <br />• Subject to availability
            <br />• Described as accurately as possible
            <br />• Provided by verified sellers or FirgoMart itself
          </Paragraph>

          <Paragraph>
            FirgoMart reserves the right to update, modify, or discontinue product
            listings at any time.
          </Paragraph>

          <Title level={3}>5. Pricing & Payment</Title>
          <Paragraph>
            Prices may include or exclude applicable taxes. Payments can be made via:
            <br />• UPI
            <br />• Credit/Debit Cards
            <br />• Net Banking
            <br />• Wallets
            <br />• Other approved gateways
          </Paragraph>

          <Paragraph>
            FirgoMart reserves the right to cancel suspicious or high-risk transactions.
          </Paragraph>

          <Title level={3}>6. Order Acceptance & Cancellation</Title>
          <Paragraph>
            An order is confirmed only after successful payment and verification.
            FirgoMart may cancel an order due to:
            <br />• Out-of-stock items
            <br />• Pricing errors
            <br />• Suspected fraud
            <br />• Legal or operational restrictions
          </Paragraph>

          <Paragraph>
            Refunds (if applicable) will be processed as per our Refund Policy.
          </Paragraph>

          <Title level={3}>7. Shipping & Delivery</Title>
          <Paragraph>
            Delivery timelines are estimates and may vary due to logistics,
            weather, or operational challenges. More details are available in our
            Shipping Policy.
          </Paragraph>
          <Title level={3}>8. Returns, Refunds & Replacement</Title>
          <Paragraph>
            Returns and refunds are governed by the Refund & Return Policy, which
            varies depending on product category.
          </Paragraph>
          <Title level={3}>9. Intellectual Property</Title>
          <Paragraph>
            All content on FirgoMart—including logos, images, text, and software—is the
            exclusive property of FirgoMart 24Logistics Private Limited.
            Unauthorized reproduction or distribution is prohibited.
          </Paragraph>
          <Title level={3}>10. User Responsibilities</Title>
          <Paragraph>
            Users agree NOT to:
            <br />• Misuse the platform
            <br />• Upload harmful or illegal content
            <br />• Engage in fraudulent activity
            <br />• Violate intellectual property rights
            <br />• Attempt to hack or bypass systems
          </Paragraph>
          <Title level={3}>11. Limitation of Liability</Title>
          <Paragraph>
            FirgoMart is not responsible for:
            <br />• Delays caused by third-party logistics providers
            <br />• Losses from unauthorized access to your account
            <br />• Quality issues with third-party seller products (handled via return policy)
          </Paragraph>

          <Paragraph>
            Our liability is limited to the value of the product purchased.
          </Paragraph>
          <Title level={3}>12. Governing Law</Title>
          <Paragraph>
            These Terms are governed by Indian law. Any disputes will fall under
            the jurisdiction of courts in Kolkata, West Bengal.
          </Paragraph>
          <Title level={3}>13. Changes to Terms</Title>
          <Paragraph>
            FirgoMart may update these Terms anytime as required. A revised version
            for 2026 will be issued after policy review.
          </Paragraph>
          <Title level={3}>14. Contact Information</Title>
          <Paragraph>
            <strong>Support Email:</strong> support@firgomart.com <br />
            <strong>Help Email:</strong> help@firgomart.com <br />
            <strong>Company:</strong> FirgoMart 24Logistics Private Limited <br />
            <strong>Address:</strong> 48/2B, Radhanath Chowdhury Road, Kolkata – 700015,
            West Bengal, India.
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default page;
