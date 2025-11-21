/*
  # Add Deep Personalization Fields to Investor Personas

  ## Summary
  Enhances the investor_personas table with comprehensive personalization fields for AI behavior customization.

  ## Changes to `investor_personas`
  - Adds `avatar_url` (text) - URL for the investor's profile picture
  - Adds `risk_appetite` (text) - Investment risk profile
  - Adds `target_sector` (text) - Preferred investment sectors
  - Adds `check_size` (text) - Typical investment range
  - Updates `investment_thesis` to contain comprehensive LLM instructions
  - Adds `talking_style_json` (jsonb) - Fine-grained communication style settings

  ## Changes to `pitch_sessions`
  - Adds `user_id` column for Clerk authentication
  - Adds `persona_id` to link sessions to specific personas
  - Adds `chat_transcript` (jsonb) for storing conversation history
  - Adds `outcome` field for win/lose status
  - Updates RLS policies for proper user access control

  ## Security Updates
  - Updates RLS policies to use Clerk user IDs
  - Ensures users can only access their own sessions
  - Keeps investor personas publicly readable
*/

-- Add new columns to investor_personas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investor_personas' AND column_name = 'avatar_url') THEN
    ALTER TABLE investor_personas ADD COLUMN avatar_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investor_personas' AND column_name = 'risk_appetite') THEN
    ALTER TABLE investor_personas ADD COLUMN risk_appetite TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investor_personas' AND column_name = 'target_sector') THEN
    ALTER TABLE investor_personas ADD COLUMN target_sector TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investor_personas' AND column_name = 'check_size') THEN
    ALTER TABLE investor_personas ADD COLUMN check_size TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investor_personas' AND column_name = 'talking_style_json') THEN
    ALTER TABLE investor_personas ADD COLUMN talking_style_json JSONB DEFAULT '{}';
  END IF;
END $$;

-- Update existing personas with new data
UPDATE investor_personas SET
  avatar_url = 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
  risk_appetite = 'High Risk, High Reward',
  target_sector = 'B2B SaaS, AI Infrastructure',
  check_size = '$5M - $25M',
  investment_thesis = 'You are a ruthless, data-driven VC focused on exponential growth and massive market domination. Your primary goal is finding network effects and defensible moats. You will immediately challenge assumptions on unit economics (CAC:LTV) and demand proof of concept for scalability. You have zero tolerance for vague answers about market size or competition. Every response must push the founder to prove their business can achieve 10x growth. You are direct, analytical, and relentless in your questioning.',
  talking_style_json = '{"bluntness": 9, "jargon_level": "High", "favorite_word": "Moat", "humor": 2}'::jsonb
WHERE name = 'Marc' AND role = 'The Ruthless VC';

UPDATE investor_personas SET
  name = 'Marc',
  role = 'The Titan',
  avatar_url = 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
  risk_appetite = 'High Risk, High Reward',
  target_sector = 'B2B SaaS, AI Infrastructure',
  check_size = '$5M - $25M',
  investment_thesis = 'You are a ruthless, data-driven VC focused on exponential growth and massive market domination. Your primary goal is finding network effects and defensible moats. You will immediately challenge assumptions on unit economics (CAC:LTV) and demand proof of concept for scalability. You have zero tolerance for vague answers about market size or competition. Every response must push the founder to prove their business can achieve 10x growth. You are direct, analytical, and relentless in your questioning.',
  talking_style_json = '{"bluntness": 9, "jargon_level": "High", "favorite_word": "Moat", "humor": 2}'::jsonb
WHERE region = 'USA';

UPDATE investor_personas SET
  name = 'Sarah',
  role = 'The Visionary',
  avatar_url = 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg',
  risk_appetite = 'Medium Risk, Sustainable Growth',
  target_sector = 'Climate Tech, HealthTech, Social Impact',
  check_size = '$1M - $5M',
  investment_thesis = 'You are an impact-focused European investor who prioritizes long-term sustainability, ethical frameworks, and responsible growth. You deeply care about GDPR compliance, data privacy, and ESG metrics. You are skeptical of rapid US-style ''growth at all costs'' approaches and prefer founders who demonstrate thoughtful, measured expansion. You ask probing questions about social impact, environmental sustainability, and regulatory compliance. Your tone is warm but challenging, and you value authentic mission-driven founders.',
  talking_style_json = '{"bluntness": 4, "jargon_level": "Medium", "favorite_word": "Sustainability", "humor": 6}'::jsonb
WHERE region = 'EU';

UPDATE investor_personas SET
  name = 'Rajiv',
  role = 'The Strategist',
  avatar_url = 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
  risk_appetite = 'Moderate Risk, High Volume',
  target_sector = 'FinTech, Consumer Tech, AgriTech',
  check_size = '$500K - $2M',
  investment_thesis = 'You are an Indian VC focused on emerging markets, rapid localization, and high-volume consumer adoption. You understand the unique challenges of price-sensitive markets and the importance of unit economics in developing economies. You constantly challenge founders on pricing strategies, market penetration tactics, and distribution channels in densely populated areas. You value scrappiness, resourcefulness, and deep understanding of local market dynamics. Your questions focus on customer acquisition cost, retention, and path to profitability in resource-constrained environments.',
  talking_style_json = '{"bluntness": 6, "jargon_level": "Medium", "favorite_word": "Adoption", "humor": 5}'::jsonb
WHERE region = 'India';

-- Add new columns to pitch_sessions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pitch_sessions' AND column_name = 'user_id') THEN
    ALTER TABLE pitch_sessions ADD COLUMN user_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pitch_sessions' AND column_name = 'persona_id') THEN
    ALTER TABLE pitch_sessions ADD COLUMN persona_id UUID REFERENCES investor_personas(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pitch_sessions' AND column_name = 'chat_transcript') THEN
    ALTER TABLE pitch_sessions ADD COLUMN chat_transcript JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pitch_sessions' AND column_name = 'outcome') THEN
    ALTER TABLE pitch_sessions ADD COLUMN outcome TEXT CHECK (outcome IN ('win', 'lose'));
  END IF;
END $$;

-- Update RLS policies for pitch_sessions
DROP POLICY IF EXISTS "Users can view own pitch sessions" ON pitch_sessions;
DROP POLICY IF EXISTS "Users can insert own pitch sessions" ON pitch_sessions;
DROP POLICY IF EXISTS "Users can update own pitch sessions" ON pitch_sessions;
DROP POLICY IF EXISTS "Users can delete own pitch sessions" ON pitch_sessions;

CREATE POLICY "Users can view own pitch sessions"
  ON pitch_sessions FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own pitch sessions"
  ON pitch_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own pitch sessions"
  ON pitch_sessions FOR UPDATE
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own pitch sessions"
  ON pitch_sessions FOR DELETE
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = current_setting('request.jwt.claims', true)::json->>'sub');