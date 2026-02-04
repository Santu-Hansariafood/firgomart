"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Percent, RotateCcw, Truck } from "lucide-react"

const items = [
  {
    icon: ShieldCheck,
    text: "Secure Payment",
    color: "text-brand-purple",
    glow: "shadow-[0_0_20px_rgba(120,0,200,0.35)]",
  },
  {
    icon: Percent,
    text: "Up to 50% Off",
    color: "text-green-500",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.35)]",
  },
  {
    icon: RotateCcw,
    text: "Easy Returns",
    color: "text-blue-500",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.35)]",
  },
  {
    icon: Truck,
    text: "Quick Delivery",
    color: "text-orange-500",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.35)]",
  },
]

export default function MarqueeBanner() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-foreground/10 bg-background/70 backdrop-blur-md shadow-lg">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 via-transparent to-brand-purple/10"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="relative flex w-max whitespace-nowrap py-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[1, 2].map((loop) => (
          <div key={loop} className="flex items-center">
            {items.map((item, idx) => (
              <motion.div
                key={`${loop}-${idx}`}
                className="mx-4 sm:mx-6 md:mx-10 flex items-center gap-3 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-background/80 border border-foreground/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                }}
              >
                <motion.div
                  className={`p-2 rounded-full ${item.glow}`}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 0.4,
                  }}
                >
                  <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
                </motion.div>

                <span className="text-xs sm:text-sm md:text-base font-semibold tracking-wide text-foreground/80 uppercase">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 sm:w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 sm:w-20 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}
