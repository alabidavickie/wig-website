-- Fix Admin RLS policies (mismatched table name 'users' -> 'profiles')
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" 
ON public.order_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Allow guests to view their own success pages (optional, but keep for success.tsx)
-- Usually success page fetches via reference or session_id, but if fetching by DB ID, we need some access.
-- We'll allow selecting an order by reference/ID if it's a guest order.
DROP POLICY IF EXISTS "Anyone can select their guest order by reference" ON public.orders;
CREATE POLICY "Anyone can select their guest order by reference"
ON public.orders FOR SELECT
USING (is_guest = true);

DROP POLICY IF EXISTS "Anyone can select guest order items" ON public.order_items;
CREATE POLICY "Anyone can select guest order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.is_guest = true
  )
);
