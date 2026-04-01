"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// PCI DSS Req 8.2.8: 15-minute idle timeout for admin sessions
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
// Show warning 2 minutes before logout
const WARNING_BEFORE_MS = 2 * 60 * 1000;

export function AdminSessionTimeout() {
  const router = useRouter();
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    clearAllTimers();

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.auth.signOut();
    toast.error("Admin session expired due to inactivity.", {
      duration: 5000,
    });
    router.push("/admin/login");
  }, [router]);

  const clearAllTimers = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setCountdown(120);

    // Show warning dialog 2 minutes before timeout
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(120);

      // Start the visible countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Hard logout at full timeout
    idleTimerRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT_MS);
  }, [handleLogout]);

  const handleStayActive = () => {
    resetTimer();
    toast.success("Session extended.", { duration: 2000 });
  };

  useEffect(() => {
    resetTimer();

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

    const handleActivity = () => {
      // Only reset if warning is NOT showing (so the dialog stays visible)
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearAllTimers();
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, showWarning]);

  if (!showWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-sm max-w-md w-full p-8 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-red-400">
            Session Expiring
          </h2>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Your admin session will expire due to inactivity. For security, you
            will be automatically logged out.
          </p>
        </div>

        <div className="flex items-center justify-center py-4">
          <div className="text-4xl font-mono font-bold text-red-400 tabular-nums">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleStayActive}
            className="flex-1 h-10 bg-[#D5A754] text-black text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#E6B964] transition-colors rounded-sm cursor-pointer"
          >
            Stay Logged In
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 h-10 border border-border text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-red-400 hover:border-red-400/50 transition-colors rounded-sm cursor-pointer"
          >
            Log Out Now
          </button>
        </div>

        <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest text-center">
          PCI DSS Compliant • 15-Minute Idle Timeout
        </p>
      </div>
    </div>
  );
}
