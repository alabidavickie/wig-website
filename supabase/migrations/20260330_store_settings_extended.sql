-- Extends the store_settings table with additional profile and social fields.
-- Run this in Supabase Dashboard → SQL Editor.

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS store_name TEXT,
  ADD COLUMN IF NOT EXISTS store_email TEXT,
  ADD COLUMN IF NOT EXISTS store_phone TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT;
