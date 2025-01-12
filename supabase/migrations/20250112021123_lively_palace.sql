/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key)
      - `shopify_id` (text)
      - `title` (text)
      - `description` (text)
      - `generated_description` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to manage their store's products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  shopify_id text NOT NULL,
  title text NOT NULL,
  description text,
  generated_description text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their store's products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = products.store_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert products to their stores"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = store_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their store's products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = products.store_id
      AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = store_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their store's products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = products.store_id
      AND s.user_id = auth.uid()
    )
  );