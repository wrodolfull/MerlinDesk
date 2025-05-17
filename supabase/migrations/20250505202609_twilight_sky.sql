-- Add API key columns to user_settings
ALTER TABLE user_settings
ADD COLUMN openai_key text,
ADD COLUMN deepseek_key text;