"use client";

import React, { JSX } from "react";
import clsx from "clsx";

interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

const sizes = {
  1: "text-4xl sm:text-5xl font-bold",
  2: "text-3xl sm:text-4xl font-semibold",
  3: "text-2xl sm:text-3xl font-semibold",
  4: "text-xl sm:text-2xl font-semibold",
  5: "text-lg sm:text-xl font-medium",
  6: "text-base sm:text-lg font-medium",
};

const Title: React.FC<TitleProps> = ({ level = 1, children, className }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={clsx(sizes[level], "text-[color:var(--foreground)] font-heading", className)}>
      {children}
    </Tag>
  );
};

export default Title;
