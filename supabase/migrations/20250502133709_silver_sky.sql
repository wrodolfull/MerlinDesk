/*
  # Fix RLS policies for calendars table

  1. Changes
    - Drop existing RLS policies for calendars table
    - Create new, properly configured RLS policies that:
      - Allow authenticated users to read all calendars
      - Allow authenticated users to create calendars
      - Allow authenticated users to update their own calendars
      - Allow authenticated users to delete their own calendars
  
  2. Security
    - Enable RLS on calendars table (already enabled)
    - Add policies for all CRUD operations with proper security checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read calendars" ON calendars;
DROP POLICY IF EXISTS "Authenticated users can create calendars" ON calendars;
DROP POLICY IF EXISTS "Authenticated users can delete calendars" ON calendars;
DROP POLICY IF EXISTS "Authenticated users can update calendars" ON calendars;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON calendars FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON calendars FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON calendars FOR UPDATE
TO authenticated
USING (auth.uid() IN (
  SELECT p.id 
  FROM professionals p 
  WHERE p.calendar_id = calendars.id
))
WITH CHECK (auth.uid() IN (
  SELECT p.id 
  FROM professionals p 
  WHERE p.calendar_id = calendars.id
));

CREATE POLICY "Enable delete access for authenticated users"
ON calendars FOR DELETE
TO authenticated
USING (auth.uid() IN (
  SELECT p.id 
  FROM professionals p 
  WHERE p.calendar_id = calendars.id
));