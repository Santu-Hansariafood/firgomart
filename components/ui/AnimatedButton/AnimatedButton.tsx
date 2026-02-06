"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import clsx from "clsx";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  variant = "primary",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-linear-to-r from-brand-purple to-brand-red text-white shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 focus:ring-brand-purple",
    secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-gray-200",
    outline: "border-2 border-brand-purple text-brand-purple hover:bg-brand-purple/5 focus:ring-brand-purple",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
