-- Add category to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Allow sales reps to update product stock when recording sales
DROP POLICY IF EXISTS "Users can update product stock" ON public.products;

CREATE POLICY "Users can update product stock"
  ON public.products
  FOR UPDATE
  USING (owner_id = get_user_owner_id(auth.uid()))
  WITH CHECK (owner_id = get_user_owner_id(auth.uid()));