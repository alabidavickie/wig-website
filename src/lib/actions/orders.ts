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
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    image_url: string;
    attributes?: Record<string, any>;
  }[];
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
      user_id: input.user_id,
      email: input.email,
      shipping_info: input.shipping_info,
      total_amount: input.total_amount,
      currency: input.currency,
      payment_provider: input.payment_provider,
      payment_reference: input.payment_reference,
      status: "pending"
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
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
  return data;
}

/**
 * Fetches orders for a specific user email.
 */
export async function getOrdersByEmail(email: string) {
  if (!email) return [];
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
  return data;
}

/**
 * Fetches a single order by ID.
 */
export async function getOrderById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
