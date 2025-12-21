"use client"

import { motion } from "framer-motion"
import Image from "next/image"

type Props = { label?: string }

export default function BeautifulLoader({ label = "Loading" }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-100 backdrop-blur-sm">
      <div className="bg-white/80 border border-blue-100 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-5">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-600"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-4 border-b-transparent border-blue-400"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-3 rounded-full bg-linear-to-tr from-blue-600 to-blue-400"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src="/logo/firgomart.png" alt="Firgomart" width={40} height={40} className="rounded" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 w-64">
          <motion.div
            className="text-base sm:text-lg font-semibold text-gray-800"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            {label}…
          </motion.div>
          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-blue-400 via-blue-600 to-blue-400"
              initial={{ x: "-20%" }}
              animate={{ x: ["-20%", "100%", "-20%"] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              style={{ width: "35%" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              className="w-2 h-2 rounded-full bg-blue-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-blue-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-blue-600"
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

