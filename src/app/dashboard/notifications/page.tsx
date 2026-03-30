"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
  };

  const markAllAsRead = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl pb-20 p-8">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em] text-foreground flex items-center gap-3">
            <Bell className="w-6 h-6 text-[#D5A754]" />
            Notifications
          </h1>
          <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest font-bold opacity-80">
            Stay updated on new arrivals and account alerts.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754] hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#D5A754] animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 border border-border bg-card rounded-sm">
            <Bell className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-foreground font-bold tracking-widest uppercase text-sm">All caught up</h3>
            <p className="text-muted-foreground text-xs mt-2">You have no notifications yet.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 border transition-all rounded-sm flex gap-6 ${
                notification.read
                  ? "bg-card border-border opacity-70"
                  : "bg-secondary border-[#D5A754] shadow-[0_0_15px_rgba(213,167,84,0.1)]"
              }`}
            >
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    {notification.title}
                  </h3>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {notification.message}
                </p>
                <div className="flex items-center gap-4">
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-[11px] font-bold uppercase tracking-widest text-[#141414] bg-[#D5A754] px-4 py-2 hover:bg-[#E6B964] transition-colors rounded-sm"
                    >
                      View Details
                    </Link>
                  )}
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
