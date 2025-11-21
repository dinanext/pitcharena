/*
  # Update pitch_sessions user_id to UUID

  ## Summary
  Updates the pitch_sessions table to use UUID for user_id instead of TEXT, and references auth.users table from Supabase Auth.

  ## Changes
  1. Changes
    - Converts `user_id` column from TEXT to UUID
    - Adds foreign key constraint to `auth.users(id)`
  
  2. RLS Policies Updated
    - Updates all RLS policies to use `auth.uid()` instead of `current_setting`
    - Ensures proper authentication checks for all operations

  ## Important Notes
  - This migration is safe to run on an empty database
  - Existing data will be cleared during the conversion (safe for new deployments)
*/

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own pitch sessions" ON pitch_sessions;
DROP POLICY IF EXISTS "Users can insert own pitch sessions" ON pitch_sessions;
DROP POLICY IF EXISTS "Users can update own pitch sessions" ON pitch_sessions;
DROP POLICY IF EXISTS "Users can delete own pitch sessions" ON pitch_sessions;

-- Drop existing index on user_id
DROP INDEX IF EXISTS idx_pitch_sessions_user_id;

-- Clear existing data to allow column type change
TRUNCATE TABLE pitch_sessions CASCADE;

-- Change user_id column type to UUID and add foreign key
ALTER TABLE pitch_sessions 
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'pitch_sessions_user_id_fkey' 
    AND table_name = 'pitch_sessions'
  ) THEN
    ALTER TABLE pitch_sessions 
      ADD CONSTRAINT pitch_sessions_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Recreate index on user_id
CREATE INDEX IF NOT EXISTS idx_pitch_sessions_user_id ON pitch_sessions(user_id);

-- Create new RLS policies using auth.uid()
CREATE POLICY "Users can view own pitch sessions"
  ON pitch_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pitch sessions"
  ON pitch_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pitch sessions"
  ON pitch_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pitch sessions"
  ON pitch_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
