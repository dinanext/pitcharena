# Setup Guide

## Prerequisites

- Node.js 20+ and npm
- A Supabase account and project
- OpenAI API key (or DeepSeek API key)
- Clerk account (for user authentication)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd project

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# AI Provider Keys
OPENAI_API_KEY=sk-proj-your-openai-key-here
DEEPSEEK_API_KEY=sk-your-deepseek-key-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Admin Panel Access
ADMIN_SECRET_KEY=your_strong_secret_key_here
```

### 3. Database Setup

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned
4. Go to Settings > API to get your keys

#### Run Migrations

The database migration is already in the `supabase/migrations/` folder. Apply it using the Supabase CLI or dashboard:

**Option A: Using Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

**Option B: Using SQL Editor in Supabase Dashboard**
1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/20251120073014_002_add_persona_personalization_fields.sql`
3. Paste and run the SQL

### 4. Get API Keys

#### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create new secret key
4. Copy to `.env` as `OPENAI_API_KEY`

#### DeepSeek (Alternative)
1. Go to [platform.deepseek.com](https://platform.deepseek.com)
2. Get your API key
3. Copy to `.env` as `DEEPSEEK_API_KEY`

#### Clerk
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable and secret keys
4. Add to `.env`

### 5. Seed Initial Data (Optional)

You can add investor personas through the admin dashboard or directly via SQL:

```sql
INSERT INTO investor_personas (
  name, role, region, language_code, risk_appetite,
  target_sector, check_size, investment_thesis, talking_style_json
) VALUES (
  'Sarah Chen',
  'The Titan',
  'USA',
  'en',
  'High Risk, High Reward',
  'B2B SaaS, AI Infrastructure',
  '$5M - $25M',
  'Focuses on massive TAM, strong unit economics, and founder market fit.',
  '{"bluntness": 8, "jargon_level": "high", "favorite_word": "synergy", "humor": 6}'::jsonb
);
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### 7. Access Admin Panel

1. Navigate to `/secret-admin`
2. Enter your `ADMIN_SECRET_KEY` value
3. Manage investor personas from the dashboard

## Verification Steps

### Test User Flow
1. Visit the landing page
2. Sign up/sign in with Clerk
3. Select an investor from the sidebar
4. Start a pitch conversation

### Test Admin Flow
1. Visit `/secret-admin`
2. Enter admin secret key
3. Verify you can see the dashboard
4. Create a test investor persona
5. Edit and delete the test persona

### Test AI Integration
1. Start a conversation with an investor
2. Send a message
3. Verify AI response is received
4. Try voice input (if browser supports it)
5. Test conversation turn limits

## Common Issues

### Issue: "cookies().set was called outside a request scope"
**Solution:** This is fixed in the current version by using API routes for cookie operations.

### Issue: Database connection error
**Solution:**
- Verify Supabase URL and keys are correct
- Check if migrations have been applied
- Ensure RLS policies are set up correctly

### Issue: AI not responding
**Solution:**
- Check if API keys are valid
- Verify API key has credits/quota
- Check browser console for errors

### Issue: Voice input not working
**Solution:**
- Ensure browser supports Web Speech API (Chrome, Edge)
- Grant microphone permissions
- Use HTTPS (required for speech recognition)

## Build for Production

```bash
# Type check
npm run typecheck

# Build
npm run build

# Start production server
npm start
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
- Review [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) to learn admin panel features
- Check [API.md](./API.md) for API endpoint documentation
