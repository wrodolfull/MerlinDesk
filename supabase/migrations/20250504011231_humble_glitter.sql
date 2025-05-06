/*
  # Add working hours table

  1. New Tables
    - `working_hours`
      - `id` (uuid, primary key)
      - `professional_id` (uuid, foreign key to professionals)
      - `day_of_week` (integer, 0-6 representing Sunday-Saturday)
      - `start_time` (time)
      - `end_time` (time)
      - `is_working_day` (boolean)
      - `created_at` (timestamp with time zone)

  2. Constraints
    - Primary key on id
    - Foreign key to professionals table
    - Check constraint for valid day_of_week values (0-6)
    - Check constraint for valid time ranges

  3. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Only allow access to working hours for professionals in calendars owned by the user
*/

-- Create the working_hours table
CREATE TABLE IF NOT EXISTS public.working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME,
    end_time TIME,
    is_working_day BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT valid_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT valid_time_range CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time)
);

-- Create index on professional_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_working_hours_professional_id ON public.working_hours(professional_id);

-- Create index on day_of_week for faster filtering
CREATE INDEX IF NOT EXISTS idx_working_hours_day_of_week ON public.working_hours(day_of_week);

-- Enable Row Level Security
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- Policy for selecting working hours
-- Users can read working hours for professionals in their calendars
CREATE POLICY "Users can read working hours for their calendars" ON public.working_hours
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM professionals p
            JOIN calendars c ON c.id = p.calendar_id
            WHERE p.id = working_hours.professional_id
            AND c.owner_id = auth.uid()
        )
    );

-- Policy for inserting working hours
CREATE POLICY "Users can create working hours for their professionals" ON public.working_hours
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM professionals p
            JOIN calendars c ON c.id = p.calendar_id
            WHERE p.id = working_hours.professional_id
            AND c.owner_id = auth.uid()
        )
    );

-- Policy for updating working hours
CREATE POLICY "Users can update working hours for their professionals" ON public.working_hours
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM professionals p
            JOIN calendars c ON c.id = p.calendar_id
            WHERE p.id = working_hours.professional_id
            AND c.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM professionals p
            JOIN calendars c ON c.id = p.calendar_id
            WHERE p.id = working_hours.professional_id
            AND c.owner_id = auth.uid()
        )
    );

-- Policy for deleting working hours
CREATE POLICY "Users can delete working hours for their professionals" ON public.working_hours
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM professionals p
            JOIN calendars c ON c.id = p.calendar_id
            WHERE p.id = working_hours.professional_id
            AND c.owner_id = auth.uid()
        )
    );