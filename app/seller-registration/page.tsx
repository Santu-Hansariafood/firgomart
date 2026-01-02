import dynamic from "next/dynamic"
import { Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"

const SellerRegistration = dynamic(() => import("@/components/ui/SellerRegistration/SellerRegistration"))

const page = () => {
  return (
    <Suspense fallback={<BeautifulLoader />}>
      <SellerRegistration />
    </Suspense>
  )
}

export default page