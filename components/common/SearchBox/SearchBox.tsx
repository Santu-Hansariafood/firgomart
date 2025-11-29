"use client";

import { Search } from "lucide-react";
import clsx from "clsx";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
}) => {
  return (
    <div className={clsx("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

export default SearchBox;
