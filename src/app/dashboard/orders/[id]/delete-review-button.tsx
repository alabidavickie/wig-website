"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteReview } from "@/lib/actions/reviews";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review? This cannot be undone.")) return;
    setLoading(true);
    try {
      await deleteReview(reviewId);
      toast.success("Review deleted.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-shrink-0 p-2 border border-red-900 text-red-500 hover:bg-red-950/40 transition-colors rounded-sm disabled:opacity-50"
      title="Delete review"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
