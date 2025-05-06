/*
  # Working Hours Management
  
  1. New Tables
    - working_hours
      - id (uuid, primary key)
      - professional_id (uuid, references professionals)
      - day_of_week (integer, 0-6)
      - start_time (time)
      - end_time (time) 
      - is_working_day (boolean)
      - created_at (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for reading and managing working hours
    
  3. Automation
    - Add trigger to initialize default working hours for new professionals
*/

-- Create working_hours table
CREATE TABLE IF NOT EXISTS public.working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  is_working_day boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure day_of_week is between 0 and 6 (Sunday to Saturday)
  CONSTRAINT working_hours_day_of_week_check CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Ensure start_time and end_time are valid when is_working_day is true
  CONSTRAINT valid_times CHECK (
    NOT is_working_day OR (
      start_time IS NOT NULL AND 
      end_time IS NOT NULL AND 
      start_time < end_time
    )
  ),
  
  -- Ensure unique professional + day combination
  UNIQUE (professional_id, day_of_week)
);

-- Enable Row Level Security
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Users can read working hours" ON public.working_hours;

-- Create policy for users to manage working hours for their professionals
CREATE POLICY "Users can manage working hours"
  ON public.working_hours
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = working_hours.professional_id
      AND p.user_id = auth.uid()
    )
  );

-- Create policy for users to read working hours
CREATE POLICY "Users can read working hours"
  ON public.working_hours
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = working_hours.professional_id
      AND p.user_id = auth.uid()
    )
  );

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS initialize_working_hours() CASCADE;

-- Create trigger function to initialize working hours for new professionals
CREATE OR REPLACE FUNCTION initialize_working_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default working hours for weekdays (Monday-Friday)
  FOR day IN 1..5 LOOP
    INSERT INTO working_hours (professional_id, day_of_week, start_time, end_time, is_working_day)
    VALUES (NEW.id, day, '09:00', '17:00', true);
  END LOOP;
  
  -- Create weekend entries (Saturday-Sunday) as non-working days
  INSERT INTO working_hours (professional_id, day_of_week, is_working_day)
  VALUES 
    (NEW.id, 0, false), -- Sunday
    (NEW.id, 6, false); -- Saturday
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize working hours when a new professional is created
CREATE TRIGGER initialize_working_hours_trigger
  AFTER INSERT ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION initialize_working_hours();

-- Add comment to the table
COMMENT ON TABLE public.working_hours IS 'Stores working hours for professionals';