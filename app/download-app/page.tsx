
"use client"

import { motion } from "framer-motion"
import { Smartphone, Globe, ArrowRight, Apple, Play } from "lucide-react"
import Link from "next/link"
import AnimatedButton from "@/components/ui/AnimatedButton/AnimatedButton"

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-red/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full mx-auto text-center z-10 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-brand-purple/10 to-brand-red/10 mb-4">
            <Smartphone className="w-12 h-12 text-brand-purple" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Mobile App
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-red">
              Coming Soon
            </span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            We are working hard to bring the Firgomart experience to your fingertips.
            Our iOS and Android apps are currently in development.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8"
        >
          <div className="group relative w-full max-w-xs p-6 rounded-3xl bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                <Play className="w-8 h-8 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Google Play</h3>
                <p className="text-sm text-foreground/50">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="group relative w-full max-w-xs p-6 rounded-3xl bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Apple className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">App Store</h3>
                <p className="text-sm text-foreground/50">Coming Soon</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative mt-12 p-8 rounded-3xl bg-foreground/5 backdrop-blur-sm border border-foreground/10"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Globe className="w-6 h-6 text-brand-purple" />
                No App? No Problem!
              </h2>
              <p className="text-foreground/70">
                You can download from your browser also that way. Our website is fully optimized for mobile devices.
                Add it to your home screen for an app-like experience.
              </p>
            </div>
            
            <Link href="/">
              <AnimatedButton
                variant="primary"
                className="!py-3 !px-8 text-lg shadow-lg shadow-brand-purple/20"
              >
                <span>Continue in Web View</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </AnimatedButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
