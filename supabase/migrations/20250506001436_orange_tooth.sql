/*
  # Add ElevenLabs API Key Support
  
  1. Changes
    - Add elevenlabs_key column to user_settings table
    - Add working_hours column to ai_configurations table
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add ElevenLabs API key to user_settings if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' 
    AND column_name = 'elevenlabs_key'
  ) THEN
    ALTER TABLE user_settings
    ADD COLUMN elevenlabs_key text;
  END IF;
END $$;

-- Add working_hours to ai_configurations if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_configurations' 
    AND column_name = 'working_hours'
  ) THEN
    ALTER TABLE ai_configurations
    ADD COLUMN working_hours jsonb DEFAULT '{"is24h": false, "schedule": {}}'::jsonb;
  END IF;
END $$;