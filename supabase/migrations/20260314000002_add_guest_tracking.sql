-- Add is_guest to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- Update RLS Policies to allow guest checkout
-- Step 1: Drop old policies that might conflict
DROP POLICY IF EXISTS "Anyone can insert an order (Checkout)" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can insert their own orders" ON public.orders;

-- Step 2: New Policy - Authenticated users can insert their own orders
CREATE POLICY "Authenticated users can insert their own orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id AND is_guest = FALSE);

-- Step 3: New Policy - Anonymous users can insert guest orders
CREATE POLICY "Anonymous users can insert guest orders" 
ON public.orders FOR INSERT 
TO anon
WITH CHECK (is_guest = TRUE AND user_id IS NULL);

-- Step 4: Update Order Items RLS to support guests
DROP POLICY IF EXISTS "Anyone can insert order items (Checkout)" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can insert their own order items" ON public.order_items;

CREATE POLICY "Authenticated users can insert their own order items" 
ON public.order_items FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Anonymous users can insert guest order items" 
ON public.order_items FOR INSERT 
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.is_guest = TRUE
  )
);

-- Ensure anon users can see categories and products (already public usually, but for completeness)
DROP POLICY IF EXISTS "Anyone can select categories" ON public.categories;
CREATE POLICY "Anyone can select categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can select products" ON public.products;
CREATE POLICY "Anyone can select products" ON public.products FOR SELECT USING (true);
