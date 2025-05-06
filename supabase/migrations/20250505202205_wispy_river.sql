-- Add provider column to ai_configurations
ALTER TABLE ai_configurations 
ADD COLUMN provider text NOT NULL DEFAULT 'openai';

-- Update existing configurations
UPDATE ai_configurations 
SET provider = 'openai' 
WHERE provider IS NULL;