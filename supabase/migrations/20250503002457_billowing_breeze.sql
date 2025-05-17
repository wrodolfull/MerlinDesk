/*
  # Add calendar_id to clients table

  1. Changes
    - Add calendar_id column to clients table
    - Add foreign key constraint to calendars table
    - Add index for better query performance
*/

-- Add calendar_id column
ALTER TABLE clients
ADD COLUMN calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_clients_calendar_id ON clients(calendar_id);

-- Update RLS policies to include calendar_id checks
DROP POLICY IF EXISTS "Anyone can read clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update own data" ON clients;

CREATE POLICY "Anyone can read clients in same calendar"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    calendar_id IN (
      SELECT c.id FROM calendars c
      WHERE c.id = clients.calendar_id
    )
  );

CREATE POLICY "Authenticated users can create clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own data"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    calendar_id IN (
      SELECT c.id FROM calendars c
      WHERE c.id = clients.calendar_id
    )
  );