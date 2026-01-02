import dynamic from "next/dynamic"
import { Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"

const SellerLoginPageClient = dynamic(() => import("./SellerLoginPageClient"))

export default function SellerLoginPage() {
  return (
    <Suspense fallback={<BeautifulLoader />}>
      <SellerLoginPageClient />
    </Suspense>
  )
}
