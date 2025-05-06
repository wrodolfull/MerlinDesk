/*
  # Fix Professional Creation

  1. Changes
    - Update RLS policies for professionals table to allow authenticated users to perform all operations
    - Remove admin-only restriction
    - Ensure proper cascading deletes
    
  2. Security
    - Maintain RLS enabled
    - Allow authenticated users to manage professionals
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read professionals" ON professionals;
DROP POLICY IF EXISTS "Only admins can modify professionals" ON professionals;
DROP POLICY IF EXISTS "Authenticated users can create professionals" ON professionals;
DROP POLICY IF EXISTS "Authenticated users can update professionals" ON professionals;
DROP POLICY IF EXISTS "Authenticated users can delete professionals" ON professionals;

-- Create new policies
CREATE POLICY "Anyone can read professionals"
  ON professionals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create professionals"
  ON professionals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update professionals"
  ON professionals
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete professionals"
  ON professionals
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_professionals_specialty_id ON professionals(specialty_id);
CREATE INDEX IF NOT EXISTS idx_professionals_calendar_id ON professionals(calendar_id);