"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingBasket, Hammer, HardHat, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const GroceryPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/2 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="text-center relative z-10 px-4 max-w-2xl mx-auto">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 bg-brand-purple/10 rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="relative">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ShoppingBasket className="w-16 h-16 text-brand-purple" />
                </motion.div>
                
                <motion.div
                    className="absolute -top-4 -right-4 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-zinc-700"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Hammer className="w-5 h-5 text-orange-500" />
                </motion.div>
                
                <motion.div
                    className="absolute -bottom-2 -left-4 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-zinc-700"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <HardHat className="w-5 h-5 text-yellow-500" />
                </motion.div>
             </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            We're Building Something <span className="text-brand-purple">Fresh</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Our team is working hard to bring you the ultimate grocery shopping experience. 
            Fresh produce, daily essentials, and lightning-fast delivery are coming your way soon!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="px-8 py-3 bg-brand-purple text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center gap-2 group"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              className="px-8 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-2"
              onClick={() => alert("We'll notify you when it's ready!")}
            >
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Notify Me
            </button>
          </div>
        </motion.div>

        <motion.div 
            className="mt-12 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                <span>Construction in progress...</span>
                <span>85%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-gradient-to-r from-brand-purple to-blue-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GroceryPage;
