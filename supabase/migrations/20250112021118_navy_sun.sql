/*
  # Create stores table

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text)
      - `domain` (text)
      - `api_key` (text)
      - `api_secret` (text)
      - `access_token` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `stores` table
    - Add policies for authenticated users to manage their own stores
*/

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL,
  api_key text NOT NULL,
  api_secret text NOT NULL,
  access_token text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stores"
  ON stores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores"
  ON stores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores"
  ON stores
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);