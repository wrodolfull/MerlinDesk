/*
  # Add Subscription Plans and User Settings
  
  1. New Tables
    - subscription_plans (available plans)
    - user_subscriptions (user's active subscription)
    - user_settings (user preferences and settings)
  
  2. Changes
    - Add subscription_id to clients table
    - Add owner_id to calendars table for user-specific calendars
  
  3. Security
    - Enable RLS on all new tables
    - Update existing RLS policies
*/

-- Create subscription_plans table
CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2),
  features jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id),
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_settings table
CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  timezone text DEFAULT 'America/Sao_Paulo',
  language text DEFAULT 'pt',
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add owner_id to calendars
ALTER TABLE calendars 
ADD COLUMN owner_id uuid REFERENCES clients(id) ON DELETE CASCADE;

-- Update calendars RLS policies
DROP POLICY IF EXISTS "Anyone can read calendars" ON calendars;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON calendars;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON calendars;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON calendars;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON calendars;

CREATE POLICY "Users can read own calendars"
  ON calendars FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create calendars"
  ON calendars FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_subscriptions us
      WHERE us.user_id = auth.uid()
      AND us.status = 'active'
    )
  );

CREATE POLICY "Users can update own calendars"
  ON calendars FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own calendars"
  ON calendars FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, features) VALUES
  (
    'Free',
    'Perfect for personal use',
    0,
    '{
      "calendars": 1,
      "professionals": 1,
      "appointments_per_month": 50,
      "analytics": false,
      "custom_branding": false,
      "email_notifications": true,
      "sms_notifications": false
    }'
  ),
  (
    'Business',
    'For growing businesses',
    29.99,
    '{
      "calendars": -1,
      "professionals": -1,
      "appointments_per_month": -1,
      "analytics": true,
      "custom_branding": true,
      "email_notifications": true,
      "sms_notifications": true
    }'
  );

-- Function to create default user settings
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default user settings on client creation
CREATE TRIGGER create_user_settings_trigger
AFTER INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION create_default_user_settings();

-- Function to create free subscription for new users
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  )
  SELECT
    NEW.id,
    id,
    'active',
    now(),
    now() + interval '1 month'
  FROM subscription_plans
  WHERE name = 'Free'
  LIMIT 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create free subscription on client creation
CREATE TRIGGER create_free_subscription_trigger
AFTER INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION create_free_subscription();