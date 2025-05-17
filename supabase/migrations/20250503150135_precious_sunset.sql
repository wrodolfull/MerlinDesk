/*
  # Add user_id to tables and update RLS policies

  1. Changes
    - Add user_id column to tables if not exists
    - Create indexes for user_id columns
    - Update RLS policies to filter by user_id
    
  2. Security
    - Ensure proper RLS policies for data isolation
    - Link data to authenticated users
*/

-- Add user_id to appointments if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE appointments
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

-- Add user_id to specialties if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'specialties' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE specialties
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_specialties_user_id ON specialties(user_id);

-- Add user_id to professionals if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE professionals
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);

-- Update RLS policies for appointments
DROP POLICY IF EXISTS "Anyone can read appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;

CREATE POLICY "Users can read own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Update RLS policies for specialties
DROP POLICY IF EXISTS "Anyone can read specialties" ON specialties;
DROP POLICY IF EXISTS "Authenticated users can create specialties" ON specialties;
DROP POLICY IF EXISTS "Authenticated users can update specialties" ON specialties;
DROP POLICY IF EXISTS "Authenticated users can delete specialties" ON specialties;

CREATE POLICY "Users can read own specialties"
  ON specialties FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create specialties"
  ON specialties FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own specialties"
  ON specialties FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own specialties"
  ON specialties FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Update RLS policies for professionals
DROP POLICY IF EXISTS "Anyone can read professionals" ON professionals;
DROP POLICY IF EXISTS "Authenticated users can create professionals" ON professionals;
DROP POLICY IF EXISTS "Authenticated users can update professionals" ON professionals;
DROP POLICY IF EXISTS "Authenticated users can delete professionals" ON professionals;

CREATE POLICY "Users can read own professionals"
  ON professionals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create professionals"
  ON professionals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own professionals"
  ON professionals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own professionals"
  ON professionals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());