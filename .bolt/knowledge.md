# Pitch Arena - AI Assistant Knowledge Base

## Project Summary
Pitch Arena is an AI-powered platform where entrepreneurs practice their startup pitches against realistic AI investor personas. Each persona has unique personalities, investment criteria, and communication styles.

## Core Functionality

### Investor Personas (8 pre-seeded)
1. **Marc Chen (The Titan)** - Ruthless Silicon Valley VC, high-risk/high-reward
2. **Sarah Williams (The Skeptic)** - Data-driven European investor
3. **Rajiv Patel (The Strategist)** - Emerging markets expert
4. **Elena Volkov (The Mentor)** - Founder-friendly growth-stage
5. **David Kim (The Analyst)** - Ex-Goldman Sachs, FinTech focused
6. **Priya Sharma (The Visionary)** - Impact investor
7. **Marcus Johnson (The Veteran)** - 20+ years experience, traditional
8. **Anna Berg (The Maverick)** - Early-stage DeepTech risk-taker

### User Flow
1. User lands on homepage and selects an investor
2. Redirected to `/arena/[investorId]`
3. Pitch session begins with AI-generated greeting
4. User sends messages (text or voice)
5. AI responds with personality-driven feedback
6. Funding probability updates dynamically (0-100%)
7. Session ends at 0% (loss) or user chooses to accept offer

### AI Behavior
- Each persona has unique `investment_thesis` (system prompt)
- `talking_style_json` controls: bluntness (1-10), jargon_level, favorite_word, humor (1-10)
- Responses include: reply_text, score_adjustment (-20 to +20), feedback_hidden
- Score affects AI tone: <30% = very skeptical, >70% = more engaged

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React hooks (useState, useEffect)
- **Voice**: Web Speech API

### Backend
- **API Routes**: Next.js App Router API routes
- **Database**: Supabase (PostgreSQL)
- **RLS**: Enabled on all tables
- **AI**: OpenAI GPT-4 / DeepSeek integration

### Database Tables

#### investor_personas
```sql
- id (uuid, primary key)
- name (text)
- role (text)
- region (text)
- language_code (text, default 'en')
- avatar_url (text, nullable)
- risk_appetite (text)
- target_sector (text)
- check_size (text)
- investment_thesis (text) -- AI system prompt
- talking_style_json (jsonb) -- Personality settings
- created_at (timestamptz)
```

#### pitch_sessions
```sql
- id (uuid, primary key)
- user_id (text, nullable)
- persona_id (uuid, foreign key)
- chat_transcript (jsonb, array of messages)
- outcome ('win' | 'lose', nullable)
- started_at (timestamptz)
- ended_at (timestamptz, nullable)
- created_at (timestamptz)
```

### RLS Policies
- **investor_personas**: Public read access (no auth required)
- **pitch_sessions**: User-specific CRUD (requires matching user_id)

## API Endpoints

### Personas
- `GET /api/personas` - List all personas
- `POST /api/personas` - Create new persona
- `GET /api/personas/[id]` - Get specific persona
- `PATCH /api/personas/[id]` - Update persona
- `DELETE /api/personas/[id]` - Delete persona

### Sessions
- `GET /api/sessions?userId=xxx` - List user sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/[id]` - Get specific session
- `PATCH /api/sessions/[id]` - Update session
- `DELETE /api/sessions/[id]` - Delete session

### Chat
- `POST /api/chat` - Send message to AI investor
  - Body: `{ messages, investorId, provider, currentScore }`
  - Returns: `{ content, probabilityChange, feedbackHidden }`

### Stats
- `GET /api/stats/[userId]` - Get user statistics
  - Returns: `{ totalSessions, wins, losses, winRate }`

## Admin Features

### Admin Dashboard (`/secret-admin`)
- Secret key authentication (no database users)
- Create/Edit/Delete investor personas
- View all pitch sessions
- Comprehensive CRUD operations
- Form validation and error handling

### Admin Routes
- `/secret-admin` - Login page
- `/secret-admin/dashboard` - Admin panel
- `POST /api/admin/auth` - Secret key validation
- `GET /api/admin/check-session` - Session check

## Key Files

### Database Operations (`/lib/supabase.ts`)
```typescript
// CRUD functions for all entities
getInvestorPersonas()
getInvestorPersonaById(id)
createInvestorPersona(data)
updateInvestorPersona(id, updates)
deleteInvestorPersona(id)

getPitchSessions(userId?)
getPitchSessionById(id)
createPitchSession(userId, personaId)
updatePitchSession(id, updates)
deletePitchSession(id)

getUserPitchStats(userId)
```

### Types (`/lib/types.ts`)
```typescript
interface InvestorPersona {
  id: string;
  name: string;
  role: string;
  region: string;
  language_code: string;
  avatar_url: string | null;
  risk_appetite: string;
  target_sector: string;
  check_size: string;
  investment_thesis: string;
  talking_style_json: TalkingStyle;
  created_at?: string;
}

interface TalkingStyle {
  bluntness: number; // 1-10
  jargon_level: string; // 'low' | 'medium' | 'high'
  favorite_word: string;
  humor: number; // 1-10
}

interface PitchSession {
  id: string;
  user_id: string | null;
  persona_id: string;
  chat_transcript: Message[];
  outcome: 'win' | 'lose' | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  persona?: InvestorPersona;
}

interface Message {
  id: string;
  role: 'user' | 'investor';
  content: string;
  timestamp: Date;
  scoreAdjustment?: number;
  feedbackHidden?: string;
}
```

## Environment Variables
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# AI Providers (At least one required)
OPENAI_API_KEY=sk-xxx
DEEPSEEK_API_KEY=sk-xxx

# Admin Access (Optional)
ADMIN_SECRET_KEY=your-secret-key
```

## Development Workflow

### Setup
```bash
npm install
# Add environment variables to .env
npm run dev
```

### Build & Test
```bash
npm run typecheck  # TypeScript validation
npm run build     # Production build
```

### Database Migrations
Located in `/supabase/migrations/`:
1. `001_create_base_tables.sql` - Core schema
2. `002_add_persona_personalization_fields.sql` - Enhanced fields
3. `003_seed_data.sql` - Initial personas

## Common Issues & Solutions

### Issue: Build fails with Clerk error
**Solution**: Removed ClerkProvider from layout.tsx, simplified middleware

### Issue: "Expected workUnitAsyncStorage" error
**Solution**: Simplified middleware to basic Next.js pattern, removed Clerk

### Issue: API route params type error
**Solution**: Use Next.js 15 pattern: `{ params: Promise<{ id: string }> }`

### Issue: Database query returns null
**Solution**: Use `maybeSingle()` instead of `single()` for nullable queries

## Best Practices

### Adding New Features
1. Define types in `/lib/types.ts`
2. Create database functions in `/lib/supabase.ts`
3. Build API routes following existing patterns
4. Create UI components using shadcn/ui
5. Test thoroughly including error cases
6. Update documentation

### Security
- All database tables have RLS enabled
- User-specific data protected by policies
- API keys stored in environment variables
- No sensitive data exposed in client code

### Performance
- Indexes on frequently queried columns
- Efficient queries using Supabase filters
- Client-side caching where appropriate
- Optimized bundle size

## Documentation Structure

Available in `/docs/`:
- **INDEX.md** - Navigation hub
- **README.md** - Project overview
- **SETUP.md** - Local development (30-60 min)
- **ARCHITECTURE.md** - System design (30 min)
- **DATABASE.md** - Schema details (20 min)
- **API.md** - Endpoint reference (30 min)
- **USER_GUIDE.md** - End-user docs (15-30 min)
- **ADMIN_GUIDE.md** - Admin operations (30 min)
- **DEPLOYMENT.md** - Production deployment (45 min)
- **CONTRIBUTING.md** - Development workflow (20 min)

Total: 4,345 lines of comprehensive documentation

## Current Status

### Completed
✅ Database schema and migrations
✅ 8 investor personas seeded
✅ All CRUD operations implemented and tested
✅ API endpoints created and documented
✅ Admin dashboard functional
✅ RLS policies configured
✅ Build passing without errors
✅ Comprehensive documentation

### Known Limitations
- No user authentication (simplified MVP)
- Basic admin authentication (secret key only)
- Single language support (English)
- No email notifications
- No payment integration

### Future Enhancements
- User authentication (Supabase Auth)
- Multi-language support
- Email campaign tracking
- Payment integration
- Mobile app
- Advanced analytics dashboard
- AI model fine-tuning
- Real-time collaboration features

## Testing

### Manual Testing
1. Visit homepage - select investor
2. Start pitch session
3. Send messages (text and voice)
4. Watch funding probability change
5. Complete session (win or lose)
6. Access admin dashboard
7. Create/edit persona
8. Verify database operations

### API Testing
Use `/api/test-crud` endpoint to verify all CRUD operations

### Database Testing
Direct SQL queries to verify:
- Personas count: 8
- RLS policies active
- Indexes created
- Foreign keys working

## Deployment Checklist

1. ✅ Set environment variables
2. ✅ Run migrations
3. ✅ Seed initial data
4. ✅ Test build locally
5. ✅ Verify all API endpoints
6. ✅ Check RLS policies
7. ✅ Test admin access
8. ✅ Verify AI integration
9. ✅ Review error handling
10. ✅ Monitor performance

## Support & Resources

- **Documentation**: `/docs` folder
- **Type Definitions**: `/lib/types.ts`
- **Database Functions**: `/lib/supabase.ts`
- **API Routes**: `/app/api`
- **Components**: `/components`

For questions or issues, refer to comprehensive documentation in `/docs` directory.
