# Database Schema Documentation

## Overview

Pitch Arena uses Supabase (PostgreSQL) as its primary database. The database stores investor personas, user data, and conversation metadata.

## Database Provider

**Supabase PostgreSQL**
- Version: PostgreSQL 15+
- Extensions: pgcrypto, uuid-ossp
- Connection pooling: Enabled by default
- Real-time subscriptions: Available (not currently used)

## Tables

### 1. investor_personas

Stores all investor persona data including investment preferences and communication styles.

**Table Name:** `investor_personas`

**Schema:**

```sql
CREATE TABLE investor_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  region TEXT NOT NULL,
  language_code TEXT DEFAULT 'en',
  avatar_url TEXT,
  risk_appetite TEXT NOT NULL,
  target_sector TEXT NOT NULL,
  check_size TEXT NOT NULL,
  investment_thesis TEXT NOT NULL,
  talking_style_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key, auto-generated |
| `name` | TEXT | NO | - | Investor's full name |
| `role` | TEXT | NO | - | Investor's persona role |
| `region` | TEXT | NO | - | Geographic region |
| `language_code` | TEXT | YES | 'en' | ISO language code |
| `avatar_url` | TEXT | YES | NULL | Profile image URL |
| `risk_appetite` | TEXT | NO | - | Risk preference description |
| `target_sector` | TEXT | NO | - | Target investment sectors |
| `check_size` | TEXT | NO | - | Investment range |
| `investment_thesis` | TEXT | NO | - | Investment philosophy |
| `talking_style_json` | JSONB | NO | '{}' | Communication style config |
| `created_at` | TIMESTAMPTZ | YES | NOW() | Record creation timestamp |

**Indexes:**

```sql
CREATE INDEX idx_investor_personas_region ON investor_personas(region);
CREATE INDEX idx_investor_personas_created_at ON investor_personas(created_at);
```

**Row Level Security (RLS):**

```sql
-- Enable RLS
ALTER TABLE investor_personas ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Authenticated users can view personas"
  ON investor_personas
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin operations use service role (bypasses RLS)
```

**talking_style_json Structure:**

```typescript
{
  "bluntness": number,      // 1-10, communication directness
  "jargon_level": string,   // "low" | "medium" | "high"
  "favorite_word": string,  // Frequently used word
  "humor": number           // 1-10, humor level
}
```

**Example Row:**

```sql
INSERT INTO investor_personas (
  name,
  role,
  region,
  language_code,
  avatar_url,
  risk_appetite,
  target_sector,
  check_size,
  investment_thesis,
  talking_style_json
) VALUES (
  'Sarah Chen',
  'The Titan',
  'USA',
  'en',
  'https://example.com/avatar.jpg',
  'High Risk, High Reward',
  'B2B SaaS, AI Infrastructure',
  '$5M - $25M',
  'Focuses on massive TAM, strong unit economics, and founder market fit. Values execution speed and scalability over profitability in early stages.',
  '{"bluntness": 8, "jargon_level": "high", "favorite_word": "synergy", "humor": 6}'::jsonb
);
```

---

## Queries

### Common Queries

#### Get All Investor Personas

```sql
SELECT * FROM investor_personas
ORDER BY created_at ASC;
```

#### Get Investor by ID

```sql
SELECT * FROM investor_personas
WHERE id = 'uuid-here';
```

#### Get Investors by Region

```sql
SELECT * FROM investor_personas
WHERE region = 'USA'
ORDER BY name ASC;
```

#### Get Investors by Target Sector

```sql
SELECT * FROM investor_personas
WHERE target_sector ILIKE '%B2B SaaS%'
ORDER BY check_size DESC;
```

#### Search by Name

```sql
SELECT * FROM investor_personas
WHERE name ILIKE '%sarah%'
ORDER BY name ASC;
```

#### Get Talking Style Details

```sql
SELECT
  name,
  role,
  talking_style_json->>'bluntness' as bluntness,
  talking_style_json->>'humor' as humor,
  talking_style_json->>'jargon_level' as jargon_level,
  talking_style_json->>'favorite_word' as favorite_word
FROM investor_personas
WHERE (talking_style_json->>'bluntness')::int > 7;
```

---

## Migrations

### Migration File Location

```
supabase/migrations/20251120073014_002_add_persona_personalization_fields.sql
```

### Migration Content

```sql
/*
  # Add Deep Personalization Fields to Investor Personas

  1. New Columns
    - `risk_appetite` (text): Investor's risk tolerance profile
    - `target_sector` (text): Preferred investment sectors
    - `check_size` (text): Investment amount range
    - `talking_style_json` (jsonb): Communication style configuration

  2. Changes
    - Updates existing investor_personas table
    - Adds default values for backward compatibility
    - No data loss for existing records

  3. Security
    - RLS policies remain unchanged
    - Service role retains full access
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investor_personas'
    AND column_name = 'risk_appetite'
  ) THEN
    ALTER TABLE investor_personas
    ADD COLUMN risk_appetite TEXT NOT NULL DEFAULT 'Moderate';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investor_personas'
    AND column_name = 'target_sector'
  ) THEN
    ALTER TABLE investor_personas
    ADD COLUMN target_sector TEXT NOT NULL DEFAULT 'General Technology';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investor_personas'
    AND column_name = 'check_size'
  ) THEN
    ALTER TABLE investor_personas
    ADD COLUMN check_size TEXT NOT NULL DEFAULT '$1M - $5M';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investor_personas'
    AND column_name = 'talking_style_json'
  ) THEN
    ALTER TABLE investor_personas
    ADD COLUMN talking_style_json JSONB NOT NULL DEFAULT '{
      "bluntness": 5,
      "jargon_level": "medium",
      "favorite_word": "interesting",
      "humor": 5
    }'::jsonb;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_personas_region
  ON investor_personas(region);

CREATE INDEX IF NOT EXISTS idx_investor_personas_created_at
  ON investor_personas(created_at);
```

### Applying Migrations

**Using Supabase CLI:**
```bash
supabase db push
```

**Using SQL Editor:**
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Paste migration content
4. Execute query

---

## Backup and Restore

### Creating Backups

**Using Supabase Dashboard:**
1. Go to Database > Backups
2. Create manual backup
3. Download backup file

**Using pg_dump:**
```bash
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -t investor_personas \
  > backup.sql
```

### Restoring Backups

**Using psql:**
```bash
psql -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  < backup.sql
```

**Using Supabase Dashboard:**
1. Go to Database > Backups
2. Select backup to restore
3. Confirm restoration

---

## Data Constraints

### Validation Rules

**Name:**
- Required
- Max length: 255 characters
- No special validation

**Role:**
- Required
- Max length: 255 characters
- Examples: "The Titan", "The Skeptic"

**Region:**
- Required
- Max length: 100 characters
- Examples: "USA", "Europe", "Asia"

**Language Code:**
- Optional (defaults to 'en')
- Format: ISO 639-1 (2-letter code)
- Examples: "en", "es", "fr"

**Risk Appetite:**
- Required
- Max length: 500 characters
- Examples: "High Risk, High Reward", "Conservative Growth"

**Target Sector:**
- Required
- Max length: 1000 characters
- Can include multiple sectors (comma-separated)

**Check Size:**
- Required
- Max length: 100 characters
- Format: "$MIN - $MAX" (e.g., "$1M - $5M")

**Investment Thesis:**
- Required
- Max length: 5000 characters
- Rich text description

**Talking Style JSON:**
- Required
- Must be valid JSON object
- Required fields: bluntness, jargon_level, favorite_word, humor

---

## Performance Optimization

### Query Optimization

**Indexes:**
- `region` - Frequent filtering by location
- `created_at` - Chronological ordering

**Query Tips:**
- Use indexed columns in WHERE clauses
- Limit SELECT to needed columns
- Use prepared statements for repeated queries

### Connection Pooling

Supabase handles connection pooling automatically:
- Max connections: Varies by plan
- Connection timeout: 60 seconds
- Idle timeout: 10 minutes

### Caching Strategy

**Application-level caching:**
```typescript
// Cache investor personas for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;
let cachedPersonas: InvestorPersona[] | null = null;
let cacheTimestamp: number = 0;

export async function getCachedPersonas() {
  const now = Date.now();
  if (cachedPersonas && now - cacheTimestamp < CACHE_TTL) {
    return cachedPersonas;
  }

  cachedPersonas = await getAllInvestorPersonas();
  cacheTimestamp = now;
  return cachedPersonas;
}
```

---

## Data Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Review persona usage metrics
- Archive unused personas
- Optimize indexes

**Monthly:**
- Vacuum database (automatic in Supabase)
- Analyze query performance
- Review RLS policies

**Quarterly:**
- Update investment theses
- Refresh persona data
- Audit data quality

### Data Quality Checks

```sql
-- Check for empty fields
SELECT COUNT(*)
FROM investor_personas
WHERE investment_thesis = '' OR risk_appetite = '';

-- Validate talking_style_json structure
SELECT name, talking_style_json
FROM investor_personas
WHERE NOT (
  talking_style_json ? 'bluntness' AND
  talking_style_json ? 'jargon_level' AND
  talking_style_json ? 'favorite_word' AND
  talking_style_json ? 'humor'
);

-- Find duplicate names
SELECT name, COUNT(*)
FROM investor_personas
GROUP BY name
HAVING COUNT(*) > 1;
```

---

## Security Best Practices

### Row Level Security (RLS)

**Current Policies:**
- Authenticated users: Read-only access
- Admin operations: Use service role key (bypasses RLS)

**Recommended Policies for Future:**
```sql
-- Allow users to track their own conversation history
CREATE POLICY "Users can view own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### Service Role Key Usage

**⚠️ Important:**
- Service role key bypasses ALL RLS policies
- Only use in trusted server-side code
- Never expose to client-side code
- Rotate periodically

### Data Encryption

**At Rest:**
- Supabase encrypts all data at rest by default
- AES-256 encryption

**In Transit:**
- All connections use TLS 1.2+
- Certificate pinning recommended

---

## Monitoring and Logging

### Query Logging

**Enable in Supabase:**
1. Go to Settings > Database
2. Enable query logging
3. Set log level to INFO or DEBUG

### Performance Monitoring

**Key Metrics:**
- Query execution time
- Connection pool usage
- Index hit rate
- Cache hit rate

**Tools:**
- Supabase Dashboard (built-in)
- pg_stat_statements extension
- Custom APM integration

---

## Future Enhancements

### Planned Tables

**conversations:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  investor_id UUID NOT NULL REFERENCES investor_personas(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  outcome TEXT,
  turn_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**messages:**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**analytics:**
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_personas(id),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Full-Text Search

```sql
-- Add full-text search on investment thesis
ALTER TABLE investor_personas
ADD COLUMN investment_thesis_tsv TSVECTOR
GENERATED ALWAYS AS (
  to_tsvector('english', investment_thesis)
) STORED;

CREATE INDEX idx_investment_thesis_tsv
ON investor_personas
USING GIN(investment_thesis_tsv);

-- Search query
SELECT * FROM investor_personas
WHERE investment_thesis_tsv @@ to_tsquery('english', 'SaaS & growth');
```
