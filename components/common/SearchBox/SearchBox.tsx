"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Mic, MicOff } from "lucide-react";
import clsx from "clsx";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className,
}) => {
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setVoiceSupported(true);
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = (navigator && (navigator as any).language) || "en-US";
    rec.onresult = (e: any) => {
      const t = e?.results?.[0]?.[0]?.transcript;
      if (typeof t === "string") {
        onChange(t);
        if (typeof onSearch === "function") onSearch(t);
      }
    };
    rec.onend = () => {
      setIsListening(false);
    };
    recognitionRef.current = rec;
  }, [onChange, onSearch]);

  const toggleListen = () => {
    if (!voiceSupported) return;
    const rec = recognitionRef.current as any;
    if (!rec) return;
    if (!isListening) {
      setIsListening(true);
      try {
        rec.start();
      } catch {}
    } else {
      setIsListening(false);
      try {
        rec.stop();
      } catch {}
    }
  };

  return (
    <div className={clsx("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      {voiceSupported && (
        <button
          type="button"
          aria-label="Voice search"
          onClick={toggleListen}
          className={clsx(
            "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md",
            isListening ? "text-brand-red" : "text-gray-500 hover:text-gray-700"
          )}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      )}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
      />
    </div>
  );
};

export default SearchBox;
