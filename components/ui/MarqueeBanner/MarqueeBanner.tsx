"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ShieldCheck, RotateCcw, Truck, Crown, Gem } from "lucide-react"

const items = [
  {
    icon: ShieldCheck,
    text: "Secure Payment",
    color: "text-violet-400",
    glow: "rgba(139,92,246,0.35)",
  },
  {
    icon: Gem,
    text: "Exclusive Products",
    color: "text-pink-400",
    glow: "rgba(236,72,153,0.45)",
    pulse: true,
  },
  {
    icon: Crown,
    text: "Premium Products",
    color: "text-brand-purple",
    glow: "rgba(124, 58, 237, 0.45)",
    pulse: true,
  },
  {
    icon: RotateCcw,
    text: "Easy Returns",
    color: "text-blue-400",
    glow: "rgba(59,130,246,0.35)",
  },
  {
    icon: Truck,
    text: "Quick Delivery",
    color: "text-orange-400",
    glow: "rgba(249,115,22,0.35)",
  },
]

export default function MarqueeBanner() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-background">
      <motion.div
        className="flex w-max items-center gap-6 py-4"
        animate={reduceMotion ? {} : { x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className="
              relative
              flex items-center gap-3
              rounded-xl
              border border-white/10
              bg-background/70
              px-4 py-2 sm:px-5 sm:py-3
              backdrop-blur-md
              overflow-hidden
            "
          >
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                boxShadow: `inset 0 0 18px ${item.glow}`,
              }}
            />

            <motion.div
              className="relative z-10 flex items-center justify-center rounded-full p-2"
              animate={
                item.pulse && !reduceMotion
                  ? { scale: [1, 1.15, 1] }
                  : undefined
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                boxShadow: `inset 0 0 12px ${item.glow}`,
              }}
            >
              <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
            </motion.div>

            <span className="relative z-10 text-xs font-semibold uppercase tracking-wide text-foreground/80 sm:text-sm md:text-base">
              {item.text}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 sm:w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 sm:w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}
