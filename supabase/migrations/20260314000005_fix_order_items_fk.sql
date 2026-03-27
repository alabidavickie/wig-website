-- Ensure the foreign key from order_items → orders exists
-- This is required for Supabase to resolve the `order_items (*)` join in queries
DO $$
BEGIN
  -- Only add the constraint if the table exists and the constraint doesn't
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items' AND table_schema = 'public') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'order_items_order_id_fkey'
        AND table_name = 'order_items'
        AND table_schema = 'public'
    ) THEN
      ALTER TABLE public.order_items
        ADD CONSTRAINT order_items_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;
