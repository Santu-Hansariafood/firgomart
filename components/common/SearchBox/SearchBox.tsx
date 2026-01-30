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
  const recognitionRef = useRef<unknown>(null);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        if (typeof onSearch === "function") {
          onSearch(t);
          setShowSuggestions(false);
        }
      }
    };
    rec.onend = () => {
      setIsListening(false);
    };
    rec.onerror = () => {
      setIsListening(false);
    };
    recognitionRef.current = rec;
  }, [onChange, onSearch]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (!enableSuggestions || !value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(value)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products)) {
            setSuggestions(data.products);
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, enableSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleListen = () => {
    if (!voiceSupported) return;
    const rec = recognitionRef.current as any;
    if (!rec) return;
    if (!isListening) {
      setIsListening(true);
      try {
        rec.start();
      } catch (e) {
        console.error("Voice start error", e);
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      try {
        rec.stop();
      } catch {}
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('search')) {
        url.searchParams.delete('search');
        router.push(url.pathname + url.search);
      }
    }
  };

  return (
    <div ref={wrapperRef} className={clsx("relative w-full transition-all duration-300", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[color:color-mix(in oklab,var(--foreground) 60%, transparent)] pointer-events-none" />
      
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
        {voiceSupported && (
          <button
            type="button"
            aria-label="Voice search"
            onClick={toggleListen}
            className={clsx(
              "p-1.5 rounded-full transition-all duration-200",
              isListening 
                ? "bg-red-50 text-brand-red animate-pulse ring-2 ring-brand-red/20" 
                : "text-[color:color-mix(in oklab,var(--foreground) 70%, transparent)] hover:bg-gray-100 hover:text-[var(--foreground)]"
            )}
          >
            {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        placeholder={placeholder}
        rows={1}
        onChange={(e) => {
          const newVal = e.target.value;
          onChange(newVal);
          if (newVal === "" && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.has('search')) {
              url.searchParams.delete('search');
              router.push(url.pathname + url.search);
            }
          }
          if (enableSuggestions) setShowSuggestions(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleKeyDown(e);
          }
        }}
        onFocus={() => {
          if (enableSuggestions && value.trim().length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        className="w-full pl-9 sm:pl-10 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple bg-[var(--background)] text-[var(--foreground)] resize-none overflow-hidden min-h-[40px] sm:min-h-[44px] leading-6 shadow-sm hover:shadow-md transition-shadow"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--background)] border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
          {suggestions.map((product) => (
            <div
              key={product._id || product.id}
              onClick={() => {
                onChange(product.name);
                if (onSearch) onSearch(product.name);
                setShowSuggestions(false);
              }}
              className="flex items-center gap-3 p-3 hover:bg-[var(--foreground)]/5 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
            >
              <div className="relative w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                {(product.image || (product.images && product.images[0])) ? (
                  <Image
                    src={product.image || product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{product.name}</p>
                <p className="text-xs text-gray-500 truncate">{product.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
