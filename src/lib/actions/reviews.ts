"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface Review {
  id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  review_title: string;
  description: string;
  product_rating: number;
  delivery_rating: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface CreateReviewInput {
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  review_title: string;
  description: string;
  product_rating: number;
  delivery_rating: number;
}

/**
 * Submits a product review for a delivered order.
 * Only authenticated users who own the order can submit.
 */
export async function createReview(input: CreateReviewInput) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to submit a review.");

  // Verify the user owns this order and it is delivered
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, user_id")
    .eq("id", input.order_id)
    .single();

  if (orderError || !order) throw new Error("Order not found.");
  if (order.user_id !== user.id) throw new Error("You can only review your own orders.");
  if (order.status !== "delivered") throw new Error("You can only review delivered orders.");

  // Prevent duplicate reviews for same order+product
  const { data: existing } = await adminClient
    .from("reviews")
    .select("id")
    .eq("order_id", input.order_id)
    .eq("product_id", input.product_id)
    .eq("user_id", user.id)
    .single();

  if (existing) throw new Error("You have already reviewed this product for this order.");

  // Validate ratings
  if (input.product_rating < 1 || input.product_rating > 5) throw new Error("Product rating must be between 1 and 5.");
  if (input.delivery_rating < 1 || input.delivery_rating > 5) throw new Error("Delivery rating must be between 1 and 5.");

  const { data: review, error } = await adminClient
    .from("reviews")
    .insert([{
      order_id: input.order_id,
      user_id: user.id,
      product_id: input.product_id,
      product_name: input.product_name,
      product_image: input.product_image || null,
      review_title: input.review_title.trim(),
      description: input.description.trim(),
      product_rating: input.product_rating,
      delivery_rating: input.delivery_rating,
    }])
    .select()
    .single();

  if (error) {
    console.error("[CREATE_REVIEW_ERROR]", error);
    throw new Error("Failed to submit review. Please try again.");
  }

  // Notify all admins about the new review
  await notifyAdminsOfReview(user.id, input.product_name, review.id);

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${input.order_id}`);
  revalidatePath("/admin/reviews");

  return review;
}

/**
 * Deletes a review. Only the review owner can delete their own review.
 */
export async function deleteReview(reviewId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized.");

  // Verify ownership
  const { data: review } = await adminClient
    .from("reviews")
    .select("user_id, order_id, product_name")
    .eq("id", reviewId)
    .single();

  if (!review) throw new Error("Review not found.");
  if (review.user_id !== user.id) throw new Error("You can only delete your own reviews.");

  const { error } = await adminClient
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) throw new Error("Failed to delete review.");

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${review.order_id}`);
  revalidatePath("/admin/reviews");

  return { success: true };
}

/**
 * Fetches all reviews for a specific order.
 */
export async function getReviewsByOrderId(orderId: string) {
  if (!orderId) return [];
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("reviews")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET_REVIEWS_BY_ORDER]", error);
    return [];
  }
  return data as Review[];
}

/**
 * Fetches all reviews for a specific product (public — for product pages).
 */
export async function getReviewsByProductId(productId: string) {
  if (!productId) return [];
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("reviews")
    .select(`
      *,
      profiles (first_name, last_name)
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET_REVIEWS_BY_PRODUCT]", error);
    return [];
  }
  return data as Review[];
}

/**
 * Fetches ALL reviews (admin only).
 */
export async function getAllReviews() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return [];

  const { data, error } = await adminClient
    .from("reviews")
    .select(`
      *,
      profiles (first_name, last_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET_ALL_REVIEWS]", error);
    return [];
  }
  return data as Review[];
}

/**
 * Admin-only: delete any review (e.g. for moderation).
 */
export async function adminDeleteReview(reviewId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized.");

  const { error } = await adminClient.from("reviews").delete().eq("id", reviewId);
  if (error) throw new Error("Failed to delete review.");

  revalidatePath("/admin/reviews");
  return { success: true };
}

/**
 * Checks if the current user has already reviewed a specific product for a given order.
 */
export async function hasUserReviewedOrder(orderId: string, productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("reviews")
    .select("id")
    .eq("order_id", orderId)
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .single();

  return !!data;
}

/**
 * Notifies all admin users when a new review is submitted.
 */
async function notifyAdminsOfReview(reviewerId: string, productName: string, reviewId: string) {
  const adminClient = createAdminClient();

  const { data: admins } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!admins || admins.length === 0) return;

  const notifications = admins.map((admin: { id: string }) => ({
    user_id: admin.id,
    title: "New Product Review",
    message: `A customer submitted a review for "${productName}".`,
    link: "/admin/reviews",
    read: false,
  }));

  await adminClient.from("notifications").insert(notifications);
}
