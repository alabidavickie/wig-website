-- ============================================================
-- reviews table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id      TEXT NOT NULL,
  product_name    TEXT NOT NULL,
  product_image   TEXT,
  review_title    TEXT NOT NULL,
  description     TEXT NOT NULL,
  product_rating  INTEGER NOT NULL CHECK (product_rating BETWEEN 1 AND 5),
  delivery_rating INTEGER NOT NULL CHECK (delivery_rating BETWEEN 1 AND 5),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate reviews for the same order + product + user
CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_order_product_user
  ON reviews (order_id, product_id, user_id);

-- Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can see reviews (for product pages)
CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can insert only their own reviews
CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the review owner can delete their own review
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_reviews_updated_at();
