/*
  # Add AI Files Support
  
  1. New Tables
    - ai_files (store file metadata)
    - ai_audio_transcriptions (store audio transcription results)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create ai_files table
CREATE TABLE ai_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create ai_audio_transcriptions table
CREATE TABLE ai_audio_transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id uuid REFERENCES ai_files(id) ON DELETE CASCADE,
  text text NOT NULL,
  language text,
  duration integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audio_transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own files"
  ON ai_files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own transcriptions"
  ON ai_audio_transcriptions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_ai_files_user_id ON ai_files(user_id);
CREATE INDEX idx_ai_audio_transcriptions_user_id ON ai_audio_transcriptions(user_id);
CREATE INDEX idx_ai_audio_transcriptions_file_id ON ai_audio_transcriptions(file_id);