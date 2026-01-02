"use client"

import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import dynamic from "next/dynamic"
import { Suspense } from "react"
const SellerLogin = dynamic(() => import("@/components/ui/SellerLogin/SellerLogin"))

export default function SellerLoginPageClient() {
  return (
    <Suspense fallback={<BeautifulLoader />}>
      <SellerLogin />
    </Suspense>
  )
}

