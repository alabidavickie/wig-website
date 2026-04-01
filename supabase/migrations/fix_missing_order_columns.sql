-- ============================================================
-- Fix missing columns for orders and order_items
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Add missing columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd',
ADD COLUMN IF NOT EXISTS payment_provider TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT,
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add missing columns to order_items table
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;
