import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trending Products – FirgoMart",
  description: "Shop the most popular products on FirgoMart across fashion, beauty and home essentials.",
  alternates: { canonical: "https://firgomart.com/trending-products" },
  openGraph: {
    title: "Trending Products – FirgoMart",
    description: "Top-selling and highly rated picks updated frequently.",
    url: "https://firgomart.com/trending-products",
    type: "website",
  },
  robots: { index: true, follow: true },
}

export default function TrendingProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
