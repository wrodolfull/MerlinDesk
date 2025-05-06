/*
  # Initial schema setup
  
  1. New Tables
    - clients (user profiles)
    - calendars (business locations)
    - specialties (services offered)
    - professionals (service providers)
    - appointments (bookings)
    
  2. Security
    - Enable RLS on all tables
    - Set up appropriate access policies
    
  3. Performance
    - Add indexes for frequently queried columns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS professionals;
DROP TABLE IF EXISTS specialties;
DROP TABLE IF EXISTS calendars;
DROP TABLE IF EXISTS clients;

-- Clients table
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can update own data"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Calendars table
CREATE TABLE calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read calendars"
  ON calendars
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create calendars"
  ON calendars
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update calendars"
  ON calendars
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete calendars"
  ON calendars
  FOR DELETE
  TO authenticated
  USING (true);

-- Specialties table
CREATE TABLE specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,
  duration integer NOT NULL,
  price decimal(10,2),
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read specialties"
  ON specialties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify specialties"
  ON specialties
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Professionals table
CREATE TABLE professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,
  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,
  email text,
  phone text,
  avatar text,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read professionals"
  ON professionals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify professionals"
  ON professionals
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,
  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('confirmed', 'pending', 'completed', 'canceled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    professional_id = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Clients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    professional_id = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Clients can delete own appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    professional_id = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create indexes for better query performance
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX idx_appointments_calendar_id ON appointments(calendar_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_professionals_specialty_id ON professionals(specialty_id);
CREATE INDEX idx_professionals_calendar_id ON professionals(calendar_id);

CREATE INDEX idx_specialties_calendar_id ON specialties(calendar_id);