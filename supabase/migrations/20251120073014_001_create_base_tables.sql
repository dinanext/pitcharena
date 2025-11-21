/*
  # Create Base Tables for Pitch Arena

  ## Summary
  Creates the foundational tables for the Pitch Arena application including investor personas and pitch sessions.

  ## Tables Created
  - investor_personas: Stores AI investor personas with comprehensive profiles
  - pitch_sessions: Tracks user pitch practice sessions and outcomes

  ## Features
  - UUID primary keys with proper indexing
  - JSON columns for flexible data storage
  - RLS policies for security
  - Comprehensive constraints and defaults
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create investor_personas table
CREATE TABLE IF NOT EXISTS investor_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  region TEXT NOT NULL,
  language_code TEXT DEFAULT 'en',
  avatar_url TEXT,
  risk_appetite TEXT NOT NULL DEFAULT 'Moderate',
  target_sector TEXT NOT NULL DEFAULT 'General Technology',
  check_size TEXT NOT NULL DEFAULT '$1M - $5M',
  investment_thesis TEXT NOT NULL,
  talking_style_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pitch_sessions table  
CREATE TABLE IF NOT EXISTS pitch_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  persona_id UUID REFERENCES investor_personas(id) ON DELETE CASCADE,
  chat_transcript JSONB DEFAULT '[]',
  outcome TEXT CHECK (outcome IN ('win', 'lose')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_personas_region ON investor_personas(region);
CREATE INDEX IF NOT EXISTS idx_investor_personas_created_at ON investor_personas(created_at);
CREATE INDEX IF NOT EXISTS idx_pitch_sessions_user_id ON pitch_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_sessions_persona_id ON pitch_sessions(persona_id);

-- Enable Row Level Security
ALTER TABLE investor_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for investor_personas (public read access)
DROP POLICY IF EXISTS "Public read access to investor personas" ON investor_personas;
CREATE POLICY "Public read access to investor personas"
  ON investor_personas FOR SELECT
  TO public
  USING (true);

-- RLS policies for pitch_sessions (user-specific access)
DROP POLICY IF EXISTS "Users can view own pitch sessions" ON pitch_sessions;
CREATE POLICY "Users can view own pitch sessions"
  ON pitch_sessions FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can insert own pitch sessions" ON pitch_sessions;
CREATE POLICY "Users can insert own pitch sessions"
  ON pitch_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can update own pitch sessions" ON pitch_sessions;
CREATE POLICY "Users can update own pitch sessions"
  ON pitch_sessions FOR UPDATE
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can delete own pitch sessions" ON pitch_sessions;
CREATE POLICY "Users can delete own pitch sessions"
  ON pitch_sessions FOR DELETE
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');