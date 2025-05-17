/*
  # Add AI Configurations Table
  
  1. New Tables
    - ai_configurations (store AI training configurations)
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - model (text)
      - temperature (numeric)
      - max_tokens (integer)
      - training_data (text)
      - prompt (text)
      - created_at (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create ai_configurations table
CREATE TABLE ai_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  model text NOT NULL,
  temperature numeric NOT NULL,
  max_tokens integer NOT NULL,
  training_data text NOT NULL,
  prompt text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own configurations"
  ON ai_configurations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create index for user_id
CREATE INDEX idx_ai_configurations_user_id ON ai_configurations(user_id);