"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import clsx from "clsx";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-2 whitespace-nowrap active:scale-95";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  const variants = {
    primary: "bg-gradient-to-r from-brand-purple to-brand-red text-white shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:brightness-110 border border-transparent",
    secondary: "bg-white dark:bg-zinc-800 text-foreground border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 shadow-sm",
    outline: "bg-transparent border-2 border-brand-purple text-brand-purple hover:bg-brand-purple/5",
    ghost: "bg-transparent text-foreground/70 hover:text-foreground hover:bg-foreground/5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        baseStyles, 
        sizes[size], 
        variants[variant], 
        fullWidth ? "w-full" : "",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
