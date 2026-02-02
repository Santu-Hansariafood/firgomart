"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Mic, MicOff, X } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  enableSuggestions?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className,
  enableSuggestions = false,
}) => {
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const recognitionRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) return;

    setVoiceSupported(true);

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = navigator.language || "en-US";

    rec.onresult = (e: any) => {
      const text = e?.results?.[0]?.[0]?.transcript;
      if (typeof text === "string") {
        onChange(text);
        onSearch?.(text);
        setShowSuggestions(false);
      }
    };

    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;
  }, [onChange, onSearch]);

  useEffect(() => {
    if (!enableSuggestions || value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(value)}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products)) {
            setSuggestions(data.products);
            setShowSuggestions(true);
          }
        }
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, enableSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleListen = () => {
    if (!voiceSupported || !recognitionRef.current) return;

    if (!isListening) {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("search")) {
        url.searchParams.delete("search");
        router.push(url.pathname + url.search);
      }
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={clsx("relative w-full", className)}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {voiceSupported && (
          <button
            type="button"
            onClick={toggleListen}
            className={clsx(
              "p-1.5 rounded-full transition",
              isListening
                ? "bg-red-50 text-red-600 ring-2 ring-red-200 animate-pulse"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch(value);
            setShowSuggestions(false);
          }
        }}
        onFocus={() => {
          if (enableSuggestions && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        className="
          w-full h-[44px]
          pl-9 pr-24
          text-sm sm:text-base
          border border-gray-300
          rounded-full
          bg-[var(--background)]
          text-[color:var(--foreground)]
          focus:outline-none
          focus:ring-2 focus:ring-brand-purple/20
          focus:border-brand-purple
          shadow-sm hover:shadow-md
          transition-shadow
        "
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((product) => (
            <div
              key={product._id || product.id}
              onClick={() => {
                onChange(product.name);
                onSearch?.(product.name);
                setShowSuggestions(false);
              }}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
            >
              <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Search className="w-4 h-4 m-auto text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
