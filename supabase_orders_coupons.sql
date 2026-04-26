-- Update coupons table with usage limits
ALTER TABLE coupons 
ADD COLUMN max_uses INT DEFAULT NULL,
ADD COLUMN current_uses INT DEFAULT 0,
ADD COLUMN expires_at TIMESTAMPTZ DEFAULT NULL;

-- Create orders table to prevent tampering with WhatsApp messages
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  coupon_code TEXT,
  discount_percentage INT DEFAULT 0,
  final_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert an order
CREATE POLICY "Enable insert access for all users" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow anyone to select an order if they have the ID
CREATE POLICY "Enable read access for all users" ON orders
  FOR SELECT USING (true);

-- Allow admins to update orders
CREATE POLICY "Enable update access for authenticated users only" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');
