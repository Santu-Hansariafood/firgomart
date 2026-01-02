import dynamic from "next/dynamic"
import { Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
const LoginPageClient = dynamic(() => import("./LoginPageClient"))

export default function Page() {
  return (
    <Suspense fallback={<BeautifulLoader />}>
      <LoginPageClient />
    </Suspense>
  )
}
