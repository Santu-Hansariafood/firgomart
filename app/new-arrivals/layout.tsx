import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Arrivals – FirgoMart",
  description: "Explore the latest arrivals in fashion, beauty and home essentials with fast delivery.",
  alternates: { canonical: "https://firgomart.com/new-arrivals" },
  openGraph: {
    title: "New Arrivals – FirgoMart",
    description: "Fresh styles and new collections added regularly.",
    url: "https://firgomart.com/new-arrivals",
    type: "website",
  },
  robots: { index: true, follow: true },
}

export default function NewArrivalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
