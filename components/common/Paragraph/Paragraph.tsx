"use client";

import React from "react";
import clsx from "clsx";

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
  return (
    <p
      className={clsx(
        "text-sm sm:text-base leading-relaxed text-[color:var(--foreground)]",
        className
      )}
    >
      {children}
    </p>
  );
};

export default Paragraph;
