"use client";

import { useState } from "react";
import { Star, Search, Trash2, Package, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { adminDeleteReview, Review } from "@/lib/actions/reviews";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReviewsClient({ reviews }: { reviews: Review[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = reviews.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.product_name.toLowerCase().includes(q) ||
      r.review_title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.profiles?.email || "").toLowerCase().includes(q)
    );
  });

  const handleDelete = async (reviewId: string, productName: string) => {
    if (!confirm(`Delete review for "${productName}"? This cannot be undone.`)) return;
    setDeletingId(reviewId);
    try {
      await adminDeleteReview(reviewId);
      toast.success("Review deleted.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  const avgProductRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.product_rating, 0) / reviews.length).toFixed(1)
    : "—";

  const avgDeliveryRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.delivery_rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-foreground pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Reviews</h1>
          <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest font-bold opacity-80">
            Customer reviews submitted for delivered orders.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            {reviews.length} total review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Reviews", value: reviews.length.toString().padStart(2, "0") },
          { label: "Avg Product Rating", value: `${avgProductRating} / 5` },
          { label: "Avg Delivery Rating", value: `${avgDeliveryRating} / 5` },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-6 flex items-center gap-4 rounded-sm">
            <Star className="w-5 h-5 text-[#D5A754]" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-sm">
        <div className="p-6 border-b border-border">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#D5A754] transition-colors" />
            <input
              type="text"
              placeholder="Search by product, reviewer, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-[12px] font-bold uppercase tracking-widest border-border focus:border-[#D5A754] focus:ring-0 transition-colors bg-background placeholder:text-muted-foreground/50 outline-none"
            />
          </div>
        </div>

        {/* Reviews List */}
        {filtered.length === 0 ? (
          <div className="px-8 py-24 text-center text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
            {searchQuery ? "No reviews match your search." : "No reviews submitted yet."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((review) => (
              <div key={review.id} className="p-6 hover:bg-[#2A2A2D]/20 transition-colors">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-16 h-20 bg-background border border-border rounded-sm overflow-hidden flex-shrink-0">
                    {review.product_image ? (
                      <Image src={review.product_image} alt={review.product_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          {review.product_name}
                        </p>
                        <h3 className="text-[13px] font-bold uppercase tracking-wide">{review.review_title}</h3>
                      </div>
                      <button
                        onClick={() => handleDelete(review.id, review.product_name)}
                        disabled={deletingId === review.id}
                        className="p-2 border border-red-900 text-red-500 hover:bg-red-950/40 transition-colors rounded-sm flex-shrink-0 disabled:opacity-50"
                        title="Delete Review"
                      >
                        {deletingId === review.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.product_rating ? "fill-[#D5A754] text-[#D5A754]" : "text-border"}`}
                          />
                        ))}
                        <span className="text-[9px] text-muted-foreground ml-1 uppercase tracking-widest font-bold">Product</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.delivery_rating ? "fill-blue-400 text-blue-400" : "text-border"}`}
                          />
                        ))}
                        <span className="text-[9px] text-muted-foreground ml-1 uppercase tracking-widest font-bold">Delivery</span>
                      </div>
                    </div>

                    <p className="text-[12px] text-zinc-400 mt-2 leading-relaxed">{review.description}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        By: {review.profiles?.first_name
                          ? `${review.profiles.first_name} ${review.profiles.last_name || ""}`.trim()
                          : review.profiles?.email || "Unknown"}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        {format(new Date(review.created_at), "MMM dd, yyyy")}
                      </span>
                      <Link
                        href={`/admin/orders/${review.order_id}`}
                        className="text-[9px] font-bold text-[#D5A754] uppercase tracking-widest hover:underline"
                      >
                        View Order →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
