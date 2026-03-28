"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Incorrect credentials or access denied.");
      setLoading(false);
      return;
    }

    // Verify role
    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
        router.refresh();
      } else {
        await supabase.auth.signOut();
        setError("Unauthorized access. This area is for administrators only.");
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-card p-8 border border-border rounded-sm shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5A754] to-transparent"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-6 h-6 text-[#D5A754]" />
          </div>
          <h1 className="text-2xl font-serif text-foreground tracking-[0.2em] uppercase italic mb-2">Silk Haus Admin</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Secure Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-950/20 text-red-400 text-[11px] p-4 uppercase tracking-widest font-bold border border-red-900/50 text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold ml-1" htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-none border-border h-14 text-[13px] text-foreground focus-visible:ring-[#D5A754]/50 bg-background placeholder:text-muted-foreground/50 transition-all border-l-2 focus:border-l-[#D5A754]"
              placeholder="admin@silkhaus.com"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold" htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-none border-border h-14 text-[13px] text-foreground focus-visible:ring-[#D5A754]/50 bg-background placeholder:text-muted-foreground/50 transition-all border-l-2 focus:border-l-[#D5A754]"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D5A754] text-black hover:bg-[#E6B964] py-8 rounded-none text-[12px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-black animate-spin rounded-full"></div>
                Authenticating...
              </>
            ) : (
              <>
                Log In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-4 text-muted-foreground/50 pt-8 border-t border-border">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-[9px] uppercase tracking-[0.4em]">Protected Route</span>
        </div>
      </div>
    </div>
  );
}
