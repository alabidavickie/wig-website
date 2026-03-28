"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setShow(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-card border-t border-border text-foreground p-4 md:p-6 animate-in slide-in-from-bottom-10 shadow-2xl">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 pr-4">
          <p className="text-[13px] md:text-sm leading-relaxed text-zinc-300">
            We use cookies to improve your experience. By continuing to use this site, you agree to our{" "}
            <Link href="/cookie-policy" className="text-[#D5A754] hover:underline underline-offset-4 font-medium transition-all">
              Cookie Policy
            </Link>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleReject}
            className="flex-1 md:flex-none px-4 py-2 border border-border hover:bg-[#2A2A2D] text-muted-foreground hover:text-foreground text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all"
          >
            Reject
          </button>
          <Link
            href="/cookie-policy"
            className="flex-1 md:flex-none text-center px-4 py-2 border border-border hover:bg-[#2A2A2D] text-muted-foreground hover:text-foreground text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all"
          >
            Settings
          </Link>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2 bg-[#D5A754] hover:bg-[#E6B964] text-[#141414] text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-lg"
          >
            Accept
          </button>
        </div>
        
        <button 
          onClick={handleReject}
          className="absolute top-4 right-4 md:hidden text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
