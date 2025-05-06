/*
  # Add Working Hours Support
  
  1. New Tables
    - working_hours
      - id (uuid, primary key)
      - professional_id (uuid, references professionals)
      - day_of_week (integer, 0-6 where 0 is Sunday)
      - start_time (time)
      - end_time (time)
      - is_working_day (boolean)
      - created_at (timestamp)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create working_hours table
CREATE TABLE working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time,
  end_time time,
  is_working_day boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_times CHECK (
    (NOT is_working_day) OR 
    (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  ),
  UNIQUE (professional_id, day_of_week)
);

-- Enable RLS
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read working hours"
  ON working_hours FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = working_hours.professional_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage working hours"
  ON working_hours FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = working_hours.professional_id
      AND p.user_id = auth.uid()
    )
  );

-- Create function to initialize default working hours
CREATE OR REPLACE FUNCTION initialize_working_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default working hours (Mon-Fri, 9 AM to 5 PM)
  INSERT INTO working_hours (professional_id, day_of_week, start_time, end_time, is_working_day)
  VALUES
    (NEW.id, 0, NULL, NULL, false),  -- Sunday (not working)
    (NEW.id, 1, '09:00', '17:00', true),  -- Monday
    (NEW.id, 2, '09:00', '17:00', true),  -- Tuesday
    (NEW.id, 3, '09:00', '17:00', true),  -- Wednesday
    (NEW.id, 4, '09:00', '17:00', true),  -- Thursday
    (NEW.id, 5, '09:00', '17:00', true),  -- Friday
    (NEW.id, 6, NULL, NULL, false);  -- Saturday (not working)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize working hours for new professionals
CREATE TRIGGER initialize_working_hours_trigger
AFTER INSERT ON professionals
FOR EACH ROW
EXECUTE FUNCTION initialize_working_hours();