# Supabase Manual Setup Guide

To ensure the new security and profile features work correctly, you need to run two SQL snippets in your Supabase Dashboard.

### Step-by-Step Instructions:

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (**Silk Haus** / **wig-website**).
3.  Click on the **SQL Editor** tab in the left sidebar.
4.  Click **New Query**.
5.  **Copy and Paste** the following SQL snippets one by one and click **Run**.

---

### 🛡️ 1. Security & Order Attributes
*Runs the migration to secure your orders and add variant tracking.*

```sql
-- Add attributes to order_items to store variant info (length, color, etc.)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS attributes JSONB;

-- Fix RLS Policies for Orders Table
DROP POLICY IF EXISTS "Anyone can insert an order (Checkout)" ON public.orders;
CREATE POLICY "Authenticated users can insert their own orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Fix RLS Policies for Order Items Table
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
```

---

### 👤 2. User Profiles & Auto-Sync
*Creates the profiles table and sets up the automatic data saver.*

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'first_name', 
        new.raw_user_meta_data->>'last_name',
        new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### ✅ Verification
After running these, your database will:
1.  **Block** anyone from injecting fake orders into your database.
2.  **Save** length/color details for every item sold.
3.  **Automatically** create a profile for every new user who signs up, saving their name and email for future use.
