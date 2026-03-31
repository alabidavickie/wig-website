"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Package, ArrowLeft, Loader2, Send } from "lucide-react";
import { createReview } from "@/lib/actions/reviews";
import { toast } from "sonner";
import Link from "next/link";

interface ReviewFormProps {
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  orderRef: string;
}

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const starVal = i + 1;
          const filled = starVal <= (hovered || value);
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHovered(starVal)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(starVal)}
              className="focus:outline-none"
              aria-label={`${starVal} star${starVal !== 1 ? "s" : ""}`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  filled ? "fill-[#D5A754] text-[#D5A754]" : "text-border hover:text-[#D5A754]/50"
                }`}
              />
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-[11px] font-bold text-muted-foreground self-center">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}

export function ReviewForm({ orderId, productId, productName, productImage, orderRef }: ReviewFormProps) {
  const router = useRouter();
  const [productRating, setProductRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (productRating === 0) { toast.error("Please rate the product."); return; }
    if (deliveryRating === 0) { toast.error("Please rate the delivery."); return; }
    if (!reviewTitle.trim()) { toast.error("Please enter a review title."); return; }
    if (!description.trim()) { toast.error("Please write your review."); return; }

    setSubmitting(true);
    try {
      await createReview({
        order_id: orderId,
        product_id: productId,
        product_name: productName,
        product_image: productImage,
        review_title: reviewTitle.trim(),
        description: description.trim(),
        product_rating: productRating,
        delivery_rating: deliveryRating,
      });
      toast.success("Review submitted! Thank you for your feedback.");
      router.push(`/dashboard/orders/${orderId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link
          href={`/dashboard/orders/${orderId}`}
          className="p-2 border border-border hover:bg-card transition-colors rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif uppercase tracking-widest">Leave a Review</h1>
          <p className="text-muted-foreground text-xs mt-1 uppercase tracking-widest font-bold">
            Order #SH-{orderRef}
          </p>
        </div>
      </div>

      {/* Product Preview */}
      <div className="bg-card border border-border rounded-sm p-6 flex gap-4 items-center">
        <div className="relative w-16 h-20 bg-background border border-border rounded-sm overflow-hidden flex-shrink-0">
          {productImage ? (
            <Image src={productImage} alt={productName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <Package className="w-5 h-5" />
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754] mb-1">Reviewing</p>
          <h2 className="text-[14px] font-bold uppercase tracking-wide">{productName}</h2>
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ratings */}
        <div className="bg-card border border-border rounded-sm p-6 space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754]">Ratings</h3>
          <StarRating label="Product Quality" value={productRating} onChange={setProductRating} />
          <StarRating label="Delivery Experience" value={deliveryRating} onChange={setDeliveryRating} />
        </div>

        {/* Review Text */}
        <div className="bg-card border border-border rounded-sm p-6 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754]">Your Review</h3>

          <div>
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Review Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="e.g. Absolutely stunning quality"
              maxLength={100}
              className="w-full bg-background border border-border px-4 py-3 text-[13px] focus:border-[#D5A754] outline-none transition-colors placeholder:text-muted-foreground/50"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share details about your experience — the look, feel, and quality of the product..."
              rows={5}
              maxLength={1000}
              className="w-full bg-background border border-border px-4 py-3 text-[13px] focus:border-[#D5A754] outline-none transition-colors resize-none placeholder:text-muted-foreground/50"
            />
            <p className="text-[9px] text-muted-foreground text-right mt-1 font-bold tracking-widest">
              {description.length}/1000
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#D5A754] text-black font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#E6B964] transition-colors disabled:opacity-60"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Review</>
          )}
        </button>
      </form>
    </>
  );
}
