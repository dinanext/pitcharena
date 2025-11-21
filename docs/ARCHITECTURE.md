# Architecture Documentation

## System Overview

Pitch Arena is built using a modern Next.js architecture with server-side rendering, API routes, and real-time AI integration. The system follows a component-based design with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Landing Page  │  Arena Page  │  Admin Dashboard  │  Auth   │
└────────┬────────────────┬─────────────┬──────────────┬──────┘
         │                │             │              │
         ▼                ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Component Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Chat UI  │  Sidebar  │  Modals  │  Forms  │  Selectors   │
└────────┬────────────────┬─────────────┬──────────────┬──────┘
         │                │             │              │
         ▼                ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Server Actions  │  API Routes  │  Hooks  │  Utils         │
└────────┬────────────────┬─────────────┬──────────────┬──────┘
         │                │             │              │
         ▼                ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
├─────────────────────────────────────────────────────────────┤
│   Supabase DB   │   OpenAI API   │   Clerk Auth   │  etc.  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Pitch Flow

```
User → Landing Page
  ↓ (Sign In)
Clerk Authentication
  ↓
Arena Page (Select Investor)
  ↓
Chat Interface
  ↓ (Send Message)
API Route (/api/chat)
  ↓
AI Provider (OpenAI/DeepSeek)
  ↓ (Stream Response)
Chat Window (Display)
  ↓ (Turn Counter)
Game Over Modal (Win/Loss)
```

### 2. Admin Management Flow

```
Admin → /secret-admin
  ↓ (Enter Secret Key)
API Route (/api/admin/auth)
  ↓ (Validate & Set Cookie)
Admin Dashboard
  ↓ (CRUD Operations)
Server Actions
  ↓
Supabase (Service Role)
  ↓ (Bypass RLS)
investor_personas table
```

### 3. Investor Persona Loading

```
Arena Page Load
  ↓
Server Action (getAllInvestorPersonas)
  ↓
Supabase Query
  ↓
Return Array<InvestorPersona>
  ↓
Render Sidebar
  ↓
User Selects Investor
  ↓
Load Chat with Persona Context
```

## Key Components

### Frontend Components

#### 1. Landing Page (`components/landing-page.tsx`)
- Hero section with CTA
- Feature highlights
- Investor showcase
- Responsive design

#### 2. Chat Window (`components/chat-window.tsx`)
- Message display with role-based styling
- Scroll management
- Loading states
- Turn counter display

#### 3. Chat Input (`components/chat-input.tsx`)
- Text input with send button
- Voice input integration
- Disabled states based on game status
- Loading indicators

#### 4. Chat Sidebar (`components/chat-sidebar.tsx`)
- Investor persona list
- Selection state management
- Visual indicators for active investor
- Responsive drawer on mobile

#### 5. Game Over Modal (`components/game-over-modal.tsx`)
- Win/loss outcome display
- Restart and exit actions
- Animated overlay

#### 6. Admin Components
- **Investor Form Dialog** - Full CRUD form with validation
- **Dashboard Table** - Data grid with actions

### Backend Components

#### 1. API Routes

**`/api/chat`** (POST)
- Receives user message and investor ID
- Fetches investor persona from database
- Builds dynamic system prompt
- Calls AI provider
- Streams response back to client

**`/api/admin/auth`** (POST)
- Handles login and logout
- Validates admin secret key
- Sets/deletes HTTP-only cookies
- Returns success/error responses

#### 2. Server Actions (`lib/admin-actions.ts`)

**`checkAdminSession()`**
- Reads admin_session cookie
- Returns boolean for authorization

**`getAllInvestorPersonas()`**
- Fetches all investor personas
- Requires admin session
- Uses service role client (bypasses RLS)

**`createInvestorPersona()`**
- Inserts new investor record
- Validates admin session
- Returns success/error

**`updateInvestorPersona()`**
- Updates existing investor record
- Validates admin session
- Partial update support

**`deleteInvestorPersona()`**
- Deletes investor record
- Validates admin session
- Permanent deletion

### Database Layer

#### Supabase Client Configuration

**Client-side (`lib/supabase.ts`)**
```typescript
createClient(supabaseUrl, anonKey)
```
- Uses anon key
- Subject to RLS policies
- Used for user-facing features

**Server-side (Admin Actions)**
```typescript
createClient(supabaseUrl, serviceRoleKey)
```
- Uses service role key
- Bypasses RLS
- Used for admin operations only

## Security Architecture

### 1. Authentication Layers

**User Authentication (Clerk)**
- JWT-based authentication
- Session management
- Protected routes via middleware

**Admin Authentication (Cookie-based)**
- Secret key validation
- HTTP-only cookies (prevents XSS)
- 1-hour session expiration
- Separate from user auth

### 2. Authorization Model

**User Access**
- Can view investor personas (RLS allows SELECT)
- Can create chat sessions
- Cannot modify investor data

**Admin Access**
- Full CRUD on investor_personas
- Bypasses RLS using service role key
- Time-limited sessions

### 3. Row Level Security (RLS)

**investor_personas table**
```sql
-- Read access for authenticated users
CREATE POLICY "Authenticated users can view personas"
  ON investor_personas FOR SELECT
  TO authenticated
  USING (true);

-- Admin operations bypass RLS (use service role key)
```

### 4. Data Protection

- Environment variables for secrets
- HTTP-only cookies (admin sessions)
- Secure cookie flags in production
- API rate limiting (via providers)
- Input validation on forms

## AI Integration Architecture

### System Prompt Generation

Dynamic prompt built from investor persona:

```typescript
const systemPrompt = `
You are ${name}, ${role} from ${region}.

Investment Focus:
- Risk Appetite: ${risk_appetite}
- Target Sector: ${target_sector}
- Check Size: ${check_size}

Investment Thesis:
${investment_thesis}

Communication Style:
- Bluntness: ${bluntness}/10
- Humor: ${humor}/10
- Jargon Level: ${jargon_level}
- Favorite Word: ${favorite_word}

Evaluate pitches and ask tough questions.
`;
```

### Provider Abstraction

```typescript
interface AIProvider {
  apiKey: string;
  endpoint: string;
  model: string;
  streamResponse: (messages) => ReadableStream;
}
```

**OpenAI Provider**
- Model: gpt-4-turbo-preview
- Streaming: Server-Sent Events
- Context window: 128k tokens

**DeepSeek Provider**
- Model: deepseek-chat
- Streaming: Server-Sent Events
- Context window: 64k tokens

### Message Context Management

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const conversationContext = [
  systemPrompt,
  ...messageHistory,
  newUserMessage
];
```

## Performance Considerations

### 1. Frontend Optimization
- Component lazy loading
- Image optimization (Next.js Image)
- CSS-in-JS with Tailwind (minimal runtime)
- React Suspense boundaries

### 2. Backend Optimization
- Server-side rendering where appropriate
- Static generation for landing page
- API route caching (where safe)
- Database connection pooling (Supabase)

### 3. Real-time Features
- Streaming AI responses (better UX)
- Optimistic UI updates
- Debounced voice input

### 4. Database Queries
- Index on frequently queried columns
- Selective field fetching
- Connection pooling
- Query result caching

## Scalability

### Horizontal Scaling
- Stateless API routes (easy to replicate)
- Cookie-based sessions (no server state)
- Supabase handles DB scaling

### Vertical Scaling
- Next.js handles concurrent requests
- Supabase connection pooling
- AI provider rate limits (main bottleneck)

### Caching Strategy
- Static pages cached at CDN
- API responses cached where appropriate
- Database queries optimized with indexes

## Error Handling

### Client-side
- Try-catch blocks in async operations
- Toast notifications for user feedback
- Fallback UI components
- Loading states

### Server-side
- Error boundaries in API routes
- Proper HTTP status codes
- Detailed error messages (dev mode)
- Generic messages (production)

### Database
- Transaction rollback on failures
- Validation before operations
- Foreign key constraints
- Type checking via TypeScript

## Monitoring & Logging

### Application Logs
- API route access logs
- Error tracking (console)
- Performance metrics

### Database Logs
- Query performance (Supabase dashboard)
- Connection pool stats
- Error logs

### AI Usage
- Token consumption tracking
- Response time monitoring
- Cost analysis per conversation

## Future Architecture Considerations

1. **Caching Layer:** Redis for session and API response caching
2. **Queue System:** Background job processing for heavy operations
3. **CDN:** Static asset delivery optimization
4. **Monitoring:** Application Performance Monitoring (APM) tool
5. **Analytics:** User behavior tracking and conversion funnels
6. **WebSockets:** Real-time collaboration features
7. **Microservices:** Separate AI orchestration service
