"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sendOrderStatusUpdate, sendAdminPaymentReceived } from "@/lib/emails";
import { logAdminAction } from "@/lib/actions/audit";

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderInput {
  user_id?: string;
  email: string;
  shipping_info: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zip: string;
    shippingFee?: number;
    exchangeRate?: number;
  };
  total_amount: number;
  currency: string;
  payment_provider: string; // 'stripe' | 'paystack'
  payment_reference?: string;
  is_guest?: boolean;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    image_url: string;
    attributes?: Record<string, unknown>;
  }[];
}
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  image_url: string;
  attributes?: Record<string, unknown>;
  created_at: string;
}

export interface OrderWithItems {
  id: string;
  user_id?: string;
  email: string;
  shipping_info: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zip: string;
    shippingFee?: number;
    exchangeRate?: number;
  };
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_provider: string;
  payment_reference?: string;
  created_at: string;
  tracking_number?: string | null;
  tracking_url?: string | null;
  is_refunded?: boolean;
  refund_amount?: number | null;
  order_items: OrderItem[];
}

/**
 * Creates a new pending order and its items in Supabase.
 */
export async function createOrder(input: OrderInput) {
  const adminClient = createAdminClient();

  // 1. Insert Order
  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .insert([{
      user_id: input.user_id || null,
      email: input.email,
      shipping_info: input.shipping_info,
      total_amount: input.total_amount,
      currency: input.currency,
      payment_provider: input.payment_provider,
      payment_reference: input.payment_reference,
      status: "pending",
      is_guest: input.is_guest || false
    }])
    .select()
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    throw new Error("Failed to create order");
  }

  // 2. Insert Order Items
  const orderItems = input.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    image_url: item.image_url,
    attributes: item.attributes
  }));

  const { error: itemsError } = await adminClient
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    throw new Error("Failed to create order items");
  }

  return order;
}

/**
 * Creates a notification for a user.
 */
export async function createNotification(userId: string, title: string, message: string, link?: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("notifications")
    .insert([{
      user_id: userId,
      title,
      message,
      link,
      read: false
    }]);
    
  if (error) console.error("Error creating notification:", error);
}

/**
 * Updates an order's status (used by webhooks and verify routes).
 * Uses adminClient to bypass RLS — webhooks have no user session.
 */
export async function updateOrderStatus(reference: string, provider: string, status: OrderStatus) {
  // Must use admin client: this is called from webhooks (no user session) and verify API routes.
  // Regular createClient() fails silently when RLS blocks the update in those contexts.
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("orders")
    .update({ status })
    .match({ payment_reference: reference, payment_provider: provider })
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating order status:", error);
    return null;
  }

  // If a payment was successful, alert the admin via email and notify the user
  if (status === "paid" || status === "processing") {
    await sendAdminPaymentReceived(data.email, data.id, data.total_amount, data.currency);
    
    if (data.user_id) {
      await createNotification(
        data.user_id,
        "Payment Received",
        `Your order #SH-${data.id.slice(0,8)} has been confirmed and is being processed.`,
        "/dashboard/orders"
      );
    }
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return data;
}

/**
 * Updates an order's status (used by admin dashboard).
 */
export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Protect route
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized access");

  const { data: order, error } = await adminClient
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !order) {
    console.error(error);
    throw new Error("Failed to update order status");
  }

  // Send an automated order status update email to the customer
  await sendOrderStatusUpdate(order.email, order.shipping_info?.firstName || "Customer", order.id, status);

  // Notify the customer in their dashboard
  if (order.user_id) {
    const statusMessages: Partial<Record<OrderStatus, string>> = {
      processing: `Your order #SH-${order.id.slice(0, 8)} is now being processed.`,
      shipped: `Your order #SH-${order.id.slice(0, 8)} has been shipped! Check your email for tracking details.`,
      delivered: `Your order #SH-${order.id.slice(0, 8)} has been delivered. Enjoy your Silk Haus piece!`,
      cancelled: `Your order #SH-${order.id.slice(0, 8)} has been cancelled. Contact us if you have questions.`,
    };
    const message = statusMessages[status];
    if (message) {
      await createNotification(order.user_id, `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`, message, "/dashboard/orders");
    }
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/admin/orders");
  return order;
}

/**
 * Fetches all orders (for admins).
 */
export async function getAllOrders() {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  // SECURE: Check if current user is an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== "admin") {
    console.warn(`Unauthorized access attempt to getAllOrders by user ${user.id}`);
    return [];
  }

  const { data, error } = await adminClient
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all orders (Primary):", JSON.stringify(error, null, 2));
    // Fallback: try fetching orders without the join in case the order_items relationship is missing
    const { data: ordersOnly, error: fallbackError } = await adminClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (fallbackError) {
      console.error("Error fetching all orders (Fallback):", JSON.stringify(fallbackError, null, 2));
      return [];
    }
    return (ordersOnly ?? []).map((order: any) => ({ ...order, order_items: [] }));
  }
  return data;
}

/**
 * Fetches orders for a specific user ID.
 */
export async function getOrdersByUserId(userId: string) {
  if (!userId) return [];

  const supabase = await createClient();

  // SECURE: Check if current user is the owner or an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Only allow access if the caller is the owner of the account or an admin
  if (user.id !== userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      console.warn(`Unauthorized access attempt to getOrdersByUserId: user ${user.id} requested orders for ${userId}`);
      return [] as OrderWithItems[];
    }
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .or(`user_id.eq.${userId},email.eq.${user.email || 'unknown'}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error fetching user orders:", error);
      return [] as OrderWithItems[];
    }
    return data;
  } catch (err) {
    console.error("Unexpected error in getOrdersByUserId:", err);
    return [] as OrderWithItems[];
  }
}

/**
 * Fetches orders for a specific user email.
 * This is primarily for guest order tracking.
 */
export async function getOrdersByEmail(email: string) {
  if (!email) return [];
  
  const supabase = await createClient();
  
  // SECURE: Check if caller is admin OR matches the requested email
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    if (user.email !== email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
        
      if (profile?.role !== "admin") {
         console.warn(`Unauthorized access attempt to getOrdersByEmail by user ${user.id} for email ${email}`);
         return [];
      }
    }
  }
  // For non-authenticated guests, we rely on email matching, 
  // though it's technically public if they know the email.

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error fetching orders by email:", error);
      return [] as OrderWithItems[];
    }
    return data;
  } catch (err) {
    console.error("Unexpected error in getOrdersByEmail:", err);
    return [];
  }
}

/**
 * Fetches a single order by ID.
 */
export async function getOrderById(id: string) {
  if (!id) return null;
  const supabase = await createClient();

  // SECURE: Check if caller is admin OR owner OR it's a guest order
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", id)
    .single();

  if (error || !order) return null;

  // Authorization logic
  const isOwner = user && order.user_id === user.id;
  const isGuestOrder = order.is_guest === true;
  
  if (isOwner || isGuestOrder) return order;

  // Final check for admin
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if (profile?.role === "admin") return order;
  }

  console.warn(`Unauthorized access attempt to getOrderById for order ${id}`);
  return null;
}

/**
 * Updates an order tracking information
 */
export async function updateOrderTracking(orderId: string, trackingInfo: { tracking_number: string; tracking_url?: string }) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await userClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ 
      tracking_number: trackingInfo.tracking_number, 
      tracking_url: trackingInfo.tracking_url,
      // Automatically status to shipped if tracking added
      status: "shipped" 
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error("Failed to update tracking");
  
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return data;
}

/**
 * Deducts inventory for all items in an order after payment is confirmed.
 * Matches order items to product variants by product_id and decrements inventory_count.
 * Runs best-effort — a single item failure does not block the others.
 */
export async function deductInventoryForOrder(orderId: string) {
  const adminClient = createAdminClient();

  const { data: order, error } = await adminClient
    .from("orders")
    .select("order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    console.error("[INVENTORY] Could not fetch order for deduction:", orderId, error);
    return;
  }

  const items: OrderItem[] = order.order_items ?? [];
  for (const item of items) {
    // Find matching variant(s) for this product
    const { data: variants } = await adminClient
      .from("product_variants")
      .select("id, inventory_count")
      .eq("product_id", item.product_id)
      .gt("inventory_count", 0)
      .limit(1);

    if (variants && variants.length > 0) {
      const variant = variants[0];
      const newCount = Math.max(0, (variant.inventory_count ?? 0) - item.quantity);
      await adminClient
        .from("product_variants")
        .update({ inventory_count: newCount })
        .eq("id", variant.id);
    }
  }
}

/**
 * Processes a refund for an order (Mock implementation)
 */
export async function processRefund(orderId: string, amount: number) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await userClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const supabase = createAdminClient();

  // In a real app, call Stripe or Paystack API here
  
  const { data, error } = await supabase
    .from("orders")
    .update({ 
      is_refunded: true, 
      refund_amount: amount,
      status: "cancelled" 
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error("Failed to process refund");
  
  await logAdminAction("process_refund", "order", orderId, {
    order_id: orderId,
    refund_amount: amount,
    currency: data?.currency || "GBP"
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return data;
}
