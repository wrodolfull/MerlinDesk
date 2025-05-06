/*
  # Fix Specialties Functionality

  1. Changes
    - Drop existing restrictive policies
    - Add new policies for authenticated users
    - Ensure proper indexing
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read specialties" ON specialties;
DROP POLICY IF EXISTS "Only admins can modify specialties" ON specialties;
DROP POLICY IF EXISTS "Authenticated users can create specialties" ON specialties;
DROP POLICY IF EXISTS "Authenticated users can update specialties" ON specialties;
DROP POLICY IF EXISTS "Authenticated users can delete specialties" ON specialties;

-- Create new policies
CREATE POLICY "Anyone can read specialties"
  ON specialties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create specialties"
  ON specialties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update specialties"
  ON specialties
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete specialties"
  ON specialties
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_specialties_calendar_id ON specialties(calendar_id);
CREATE INDEX IF NOT EXISTS idx_specialties_name ON specialties(name);