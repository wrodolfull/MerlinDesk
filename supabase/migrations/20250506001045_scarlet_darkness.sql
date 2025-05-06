/*
  # Add ElevenLabs API Key Support
  
  1. Changes
    - Add elevenlabs_key column to user_settings table
    - Allow NULL values for optional API key storage
    
  2. Security
    - Maintain existing RLS policies
    - No additional security needed as user_settings table already has proper RLS
*/

-- Add ElevenLabs API key column to user_settings
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