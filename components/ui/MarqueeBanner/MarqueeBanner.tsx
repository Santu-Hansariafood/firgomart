"use client"

import { motion } from "framer-motion"
import { ShieldCheck, RotateCcw, Truck, Crown, Gem } from "lucide-react"

const items = [
  {
    icon: ShieldCheck,
    text: "Secure Payment",
    color: "text-violet-500 dark:text-violet-400",
    glow: "shadow-[0_0_18px_rgba(139,92,246,0.35)]",
  },
  {
    icon: Gem,
    text: "Exclusive Products",
    color: "text-pink-500 dark:text-pink-400",
    glow:
      "shadow-[0_0_30px_rgba(236,72,153,0.6)] shadow-pink-500/40",
    pulse: true,
  },
  {
    icon: Crown,
    text: "Premium Products",
    color: "text-yellow-500 dark:text-yellow-400",
    glow:
      "shadow-[0_0_32px_rgba(234,179,8,0.65)] shadow-yellow-400/40",
    pulse: true,
  },
  {
    icon: RotateCcw,
    text: "Easy Returns",
    color: "text-blue-500 dark:text-blue-400",
    glow: "shadow-[0_0_18px_rgba(59,130,246,0.35)]",
  },
  {
    icon: Truck,
    text: "Quick Delivery",
    color: "text-orange-500 dark:text-orange-400",
    glow: "shadow-[0_0_18px_rgba(249,115,22,0.35)]",
  },
]

export default function MarqueeBanner() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-background/70 backdrop-blur-md shadow-lg">
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
                transition={{ delay: idx * 0.15 }}
                whileHover={{
                  scale: 1.08,
                  boxShadow: "0 15px 40px rgba(0,0,0,0.18)",
                }}
              >
                <motion.div
                  className={`p-2 rounded-full ${item.glow}`}
                  animate={
                    item.pulse
                      ? {
                          scale: [1, 1.25, 1],
                          opacity: [1, 0.7, 1],
                        }
                      : {
                          scale: [1, 1.12, 1],
                        }
                  }
                  transition={{
                    duration: item.pulse ? 1.8 : 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 0.3,
                  }}
                  style={{
                    filter: item.pulse
                      ? "drop-shadow(0 0 14px currentColor)"
                      : undefined,
                  }}
                >
                  <item.icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`}
                  />
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
