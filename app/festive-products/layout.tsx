import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Festive Deals – FirgoMart",
  description: "Discover limited-time festive offers on fashion, beauty, home essentials and more at FirgoMart.",
  alternates: { canonical: "https://firgomart.com/festive-products" },
  openGraph: {
    title: "Festive Deals – FirgoMart",
    description: "Limited-time festive offers on trending products across categories.",
    url: "https://firgomart.com/festive-products",
    type: "website",
  },
  robots: { index: true, follow: true },
}

export default function FestiveProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
