-- Add attributes to order_items to store variant info (length, color, etc.)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS attributes JSONB;

-- Fix RLS Policies for Orders Table
-- Previous policy was "Anyone can insert", now we restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can insert an order (Checkout)" ON public.orders;
CREATE POLICY "Authenticated users can insert their own orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Fix RLS Policies for Order Items Table
-- Previous policy was "Anyone can insert", now we restrict to items corresponding to user's orders
DROP POLICY IF EXISTS "Anyone can insert order items (Checkout)" ON public.order_items;
CREATE POLICY "Authenticated users can insert their own order items" 
ON public.order_items FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);
