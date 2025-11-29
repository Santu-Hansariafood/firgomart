import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar/Navbar";
import Footer from "@/components/common/Footer/Footer";
import CategorySubHeader from "@/components/common/CategorySubHeader/CategorySubHeader";
import Providers from "@/app/providers";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "FirgoMart – Shop Fashion, Beauty & Essentials Globally",
  description:
    "Shop women’s & men’s fashion, footwear, jewellery, beauty products, home essentials, and daily-use items on FirgoMart. Fast and reliable delivery from India to Saudi Arabia, Dubai, Qatar, USA & worldwide. Trusted global e-commerce platform powered by FirgoMart 24Logistics Pvt. Ltd.",
  keywords: [
    "FirgoMart online shopping",
    "global fashion store",
    "women’s wear",
    "men’s wear",
    "footwear",
    "jewellery", 
    "beauty products",
    "home essentials",
    "India to Saudi delivery",
    "India to Dubai shopping",
    "India to Qatar",
    "India to USA",
    "international e-commerce"
  ],
  authors: [{ name: "Developed by Santu De", url: "https://www.linkedin.com/in/santu-de-812571158/" }],
  openGraph: {
    title: "Firgomart - Shop Smarter, Live Better",
    description:
      "Discover exclusive deals and quality products at Firgomart – your trusted online shopping destination for everything from groceries to gadgets.",
    url: "https://firgomart.com",
    siteName: "Firgomart",
    images: [
      {
        url: "https://firgomart.com/assets/seo/firgomart-og-image.png",
        width: 1200,
        height: 630,
        alt: "Firgomart - Online Shopping Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Firgomart - Shop Smarter, Live Better",
    description:
      "Shop online for the latest products at unbeatable prices. Firgomart brings you everything from groceries to gadgets.",
    images: ["https://firgomart.com/assets/seo/firgomart-og-image.png"],
    creator: "@firgomart",
  },
  metadataBase: new URL("https://firgomart.com"),
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
  category: "shopping",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://firgomart.com" />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Firgomart",
              url: "https://firgomart.com",
              logo: "https://firgomart.com/assets/seo/firgomart-logo.png",
              image: "https://firgomart.com/assets/seo/firgomart-og-image.png",
              description:
                "Firgomart is India's leading online shopping destination offering groceries, electronics, fashion, and more at unbeatable prices.",
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
        className={`${inter.variable} ${poppins.variable} bg-white text-gray-900 antialiased`}
      >
        <Providers>
          <Navbar />
          <CategorySubHeader />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
