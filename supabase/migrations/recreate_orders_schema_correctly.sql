-- ==============================================================================
-- 🚀 RE-ALIGN ORDERS SCHEMA MIGRATION 🚀
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
--
-- This script completely drops the mismatched current `orders` and `order_items`
-- tables and recreates them strictly according to your application's TypeScript
-- models (`OrderInput` & `OrderItem`), resolving the silent insert failures during checkout.
-- ==============================================================================

-- 1. DROP EXISTING CONFLICTING TABLES & POLICIES (Make sure your orders table is empty!)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- 2. RECREATE ORDERS TABLE
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional (for logged-in users)
    email VARCHAR(255) NOT NULL, -- Matched to input.email
    shipping_info JSONB NOT NULL, -- Matched to input.shipping_info
    total_amount DECIMAL(10, 2) NOT NULL, -- Matched to input.total_amount
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP', -- 'GBP' or 'NGN'
    payment_provider VARCHAR(50) NOT NULL, -- 'stripe' or 'paystack'
    payment_reference VARCHAR(255), -- Stripe Session ID or Paystack Reference
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
    is_guest BOOLEAN DEFAULT false, -- Matched to input.is_guest
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    is_refunded BOOLEAN DEFAULT false,
    refund_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RECREATE ORDER ITEMS TABLE
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    product_name TEXT NOT NULL, -- Matched to item.product_name
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL, -- Matched to item.unit_price 
    image_url TEXT, -- Matched to item.image_url
    attributes JSONB DEFAULT '{}'::jsonb, -- Options like size/length/color
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ENABLE RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. RE-APPLY SECURE RLS POLICIES

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- Anyone can insert an order (Guest & Auth Checkouts handled by Admin role via code bypass)
CREATE POLICY "Anyone can insert an order (Checkout)" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Admins can manage all orders (Fallback logic)
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Users can view their own order_items through the parent order relation
CREATE POLICY "Users can view their own order items" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- Anyone can insert an order item
CREATE POLICY "Anyone can insert order items (Checkout)" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

-- Admins can manage all order items
CREATE POLICY "Admins can view all order items" 
ON public.order_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 6. RE-ADD DROPPED CONSTRAINTS
-- Dropping orders CASCADE removes foreign key constraints from other tables that reference it.
-- We must add back the reviews table's foreign key so that functionality doesn't break.
ALTER TABLE public.reviews 
  ADD CONSTRAINT reviews_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
