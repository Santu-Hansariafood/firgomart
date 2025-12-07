import React, { Suspense } from "react"
import SellerLoginPageClient from "./SellerLoginPageClient"

export default function SellerLoginPage() {
  return (
    <Suspense fallback={null}>
      <SellerLoginPageClient />
    </Suspense>
  )
}
