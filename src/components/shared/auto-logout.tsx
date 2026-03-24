"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// 30 minutes in milliseconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; 

export function AutoLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    const supabase = createClient();
    
    // Check if there is an active session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return; // Ignore if not logged in

    await supabase.auth.signOut();
    toast.error("You have been logged out due to inactivity.");
    
    // Redirect to login
    router.push("/login");
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only track inactivity if the user is on a protected route or we want it globally
    // We'll run it globally but `handleLogout` only triggers if there's a session
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Wait until mounted
    resetTimer();

    // Event listeners for activity
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [pathname]);

  return null; // This component has no UI
}
