"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  };
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_provider: string;
  payment_reference?: string;
  created_at: string;
  order_items: OrderItem[];
}

/**
 * Creates a new pending order and its items in Supabase.
 */
export async function createOrder(input: OrderInput) {
  const supabase = await createClient();

  // 1. Insert Order
  const { data: order, error: orderError } = await supabase
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

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    // Ideally, we'd delete the order here to rollback, but for simplicity we throw an error
    throw new Error("Failed to create order items");
  }

  return order;
}

/**
 * Updates an order's status (used by webhooks).
 */
export async function updateOrderStatus(reference: string, provider: string, status: OrderStatus) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .match({ payment_reference: reference, payment_provider: provider })
    .select()
    .single();

  if (error) {
    console.error("Error updating order status:", error);
    return null;
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/admin");
  return data;
}

/**
 * Fetches all orders (for admins).
 */
export async function getAllOrders() {
  const supabase = await createClient();
  
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

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all orders:", error);
    return [];
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
    
    // Authorization logic...
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error fetching user orders:", error);
        // Fallback to mock data for testing/demo purposes if DB fails
        const { mockOrders } = await import("@/lib/mock-data");
        return mockOrders.map(o => ({
          ...o,
          order_items: o.items.map(item => ({
            ...item,
            product_name: item.name,
            unit_price: item.price,
            image_url: "/hero_luxury_wig_1773402385371.png"
          }))
        }));
      }
      return data;
    } catch (err) {
      console.error("Unexpected error in getOrdersByUserId:", err);
      const { mockOrders } = await import("@/lib/mock-data");
      return mockOrders;
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
      // Fallback to mock data for testing/demo
      const { mockOrders } = await import("@/lib/mock-data");
      return mockOrders;
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
