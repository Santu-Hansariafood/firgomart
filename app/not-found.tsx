import Link from "next/link"
import { Search, Home as HomeIcon } from "lucide-react"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-white border rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-heading font-bold">Page Not Found</h1>
        <p className="mt-2 text-gray-600">We couldn’t find the page you’re looking for.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
            <HomeIcon className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-500">
          <div className="relative w-8 h-8">
            <Image src="/logo/firgomart.png" alt="FirgoMart" fill className="object-contain" />
          </div>
          <span>FirgoMart</span>
        </div>
      </div>
    </div>
  )
}

