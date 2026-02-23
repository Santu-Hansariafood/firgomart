import React, { Suspense } from "react"
import type { Metadata } from "next"
import AdminLogin from "@/components/ui/AdminLogin/AdminLogin"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-snippet": -1,
      "max-image-preview": "none",
      "max-video-preview": -1,
    },
  },
}

export default function Page() {
  return (
    <Suspense fallback={<BeautifulLoader />}>
      <AdminLogin />
    </Suspense>
  )
}
