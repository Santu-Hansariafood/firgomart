"use client"

import { motion } from "framer-motion"
import Image from "next/image"

type Props = { label?: string }

export default function BeautifulLoader({ label = "Loading" }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-24 h-24">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-600"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-3 rounded-full bg-linear-to-tr from-blue-600 to-blue-400"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src="/logo/firgomart.png" alt="Firgomart" width={36} height={36} className="rounded" />
          </div>
        </div>
        <motion.div
          className="text-sm font-medium text-gray-700"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          {label}…
        </motion.div>
      </div>
    </div>
  )
}

