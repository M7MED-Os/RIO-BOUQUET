-- Allow admins to delete orders
CREATE POLICY "Enable delete access for authenticated users only" ON orders
  FOR DELETE USING (auth.role() = 'authenticated');
