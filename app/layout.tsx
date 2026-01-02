import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/common/Navbar/Navbar";
import Footer from "@/components/common/Footer/Footer";
import CategorySubHeader from "@/components/common/CategorySubHeader/CategorySubHeader";
import Providers from "@/app/providers";
import Script from "next/script";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://firgomart.com"),

  title: {
    default: "FirgoMart – Global Online Shopping from India",
    template: "%s | FirgoMart",
  },

  description:
    "FirgoMart is a global e-commerce platform offering fashion, beauty, footwear, jewellery, home essentials and daily-use products. Fast international delivery from India to Saudi Arabia, Dubai, Qatar, USA & more.",

  keywords: [
    "FirgoMart",
    "online shopping India",
    "global e commerce",
    "women fashion",
    "men fashion",
    "beauty products",
    "jewellery online",
    "home essentials",
    "India to Saudi delivery",
    "India to Dubai shopping",
    "India to Qatar",
    "India to USA",
  ],

  authors: [
    {
      name: "Santu De",
      url: "https://www.linkedin.com/in/santu-de-812571158/",
    },
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "https://firgomart.com",
  },

  openGraph: {
    title: "FirgoMart – Shop Smarter, Live Better",
    description:
      "Discover fashion, beauty, electronics & essentials with global delivery from India. FirgoMart – your trusted international shopping platform.",
    url: "https://firgomart.com",
    siteName: "FirgoMart",
    images: [
      {
        url: "https://firgomart.com/assets/seo/firgomart-og-image.png",
        width: 1200,
        height: 630,
        alt: "FirgoMart Online Shopping",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FirgoMart – Global Online Shopping",
    description:
      "Shop fashion, beauty & essentials with international delivery. FirgoMart brings India to the world.",
    images: ["https://firgomart.com/assets/seo/firgomart-og-image.png"],
    creator: "@firgomart",
  },

  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },

  category: "shopping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
        <Script
          id="firgomart-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "FirgoMart",
              url: "https://firgomart.com",
              logo: "https://firgomart.com/assets/seo/firgomart-logo.png",
              image:
                "https://firgomart.com/assets/seo/firgomart-og-image.png",
              description:
                "FirgoMart is a global online shopping platform delivering fashion, beauty, and essentials worldwide from India.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Kolkata",
                addressRegion: "West Bengal",
                addressCountry: "IN",
              },
              openingHours: "Mo-Su 00:00-23:59",
              sameAs: [
                "https://www.facebook.com/firgomart",
                "https://www.instagram.com/firgomart",
                "https://twitter.com/firgomart",
              ],
            }),
          }}
        />
      </head>

      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <Suspense fallback={null}>
            <CategorySubHeader />
          </Suspense>
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
