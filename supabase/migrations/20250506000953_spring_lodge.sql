-- Add ElevenLabs API key column to user_settings
ALTER TABLE user_settings
ADD COLUMN elevenlabs_key text;