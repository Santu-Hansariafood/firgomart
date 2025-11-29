"use client"

import { useAuth } from "@/context/AuthContext"
import Image from "next/image"

export default function SellerProfilePage() {
  const { user } = useAuth()
  const name = user?.name || "Seller"
  const email = user?.email || ""
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-blue-400 p-8 text-white">
            <h1 className="text-3xl font-heading font-bold">Seller Profile</h1>
            <p className="text-blue-100 mt-1">Account details</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                <Image src="/favicon.ico" alt="Logo" width={80} height={80} />
              </div>
              <div>
                <p className="text-xl font-semibold">{name}</p>
                <p className="text-gray-600">{email}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">Active</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">Seller</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
