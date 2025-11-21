# API Documentation

## Overview

This document describes all API endpoints and server actions available in the Pitch Arena platform.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

### User Authentication (Clerk)
- All user-facing routes require Clerk authentication
- JWT tokens are automatically handled by middleware
- Protected routes: `/arena/*`

### Admin Authentication (Cookie-based)
- Admin routes require `admin_session` cookie
- Cookie set via `/api/admin/auth` endpoint
- Session duration: 1 hour

## API Endpoints

### 1. Chat API

#### Send Message to AI Investor

**Endpoint:** `POST /api/chat`

**Description:** Sends a user message to an AI investor and streams the response.

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "message": "We're building an AI-powered platform...",
  "investorId": "uuid-here",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message..."
    },
    {
      "role": "assistant",
      "content": "Previous response..."
    }
  ]
}
```

**Response:** Server-Sent Events (Streaming)

**Success Response:**
```
data: {"content": "That's"}
data: {"content": " interesting."}
data: {"content": " Tell"}
data: {"content": " me"}
data: {"content": " more..."}
data: [DONE]
```

**Error Response:**
```json
{
  "error": "Investor not found",
  "status": 404
}
```

**Status Codes:**
- `200` - Success (streaming starts)
- `400` - Bad request (missing parameters)
- `404` - Investor not found
- `500` - Server error

**Example Usage:**
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: userMessage,
    investorId: selectedInvestor.id,
    conversationHistory: messages,
  }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      const parsed = JSON.parse(data);
      // Handle parsed.content
    }
  }
}
```

---

### 2. Admin Authentication API

#### Login to Admin Panel

**Endpoint:** `POST /api/admin/auth`

**Description:** Validates admin secret key and sets session cookie.

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "action": "login",
  "secretKey": "your_admin_secret_key"
}
```

**Success Response:**
```json
{
  "success": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid secret key"
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid credentials
- `500` - Server error

**Side Effects:**
- Sets `admin_session` cookie with 1-hour expiration
- Cookie is HTTP-only, secure (in production), and SameSite strict

---

#### Logout from Admin Panel

**Endpoint:** `POST /api/admin/auth`

**Description:** Clears admin session cookie.

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "action": "logout"
}
```

**Success Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200` - Success

**Side Effects:**
- Deletes `admin_session` cookie

---

## Server Actions

Server Actions are Next.js server-side functions that can be called from client components.

### 1. Check Admin Session

**Function:** `checkAdminSession()`

**Description:** Validates if the current user has an active admin session.

**Parameters:** None

**Returns:** `Promise<boolean>`

**Usage:**
```typescript
import { checkAdminSession } from '@/lib/admin-actions';

const isAdmin = await checkAdminSession();
if (!isAdmin) {
  router.push('/404');
}
```

---

### 2. Get All Investor Personas

**Function:** `getAllInvestorPersonas()`

**Description:** Fetches all investor personas from the database. Requires admin authentication.

**Parameters:** None

**Returns:** `Promise<InvestorPersona[]>`

**InvestorPersona Type:**
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
  talking_style_json: {
    bluntness: number;
    jargon_level: string;
    favorite_word: string;
    humor: number;
  };
  created_at: string;
}
```

**Usage:**
```typescript
import { getAllInvestorPersonas } from '@/lib/admin-actions';

try {
  const personas = await getAllInvestorPersonas();
  console.log(personas);
} catch (error) {
  console.error('Unauthorized or error:', error);
}
```

**Throws:**
- `Error('Unauthorized')` - If admin session is invalid

---

### 3. Create Investor Persona

**Function:** `createInvestorPersona(persona)`

**Description:** Creates a new investor persona in the database.

**Parameters:**
```typescript
type CreatePersonaData = Omit<InvestorPersona, 'id' | 'created_at'>;
```

**Returns:**
```typescript
Promise<{
  success: boolean;
  error?: string;
}>
```

**Usage:**
```typescript
import { createInvestorPersona } from '@/lib/admin-actions';

const result = await createInvestorPersona({
  name: 'John Smith',
  role: 'The Analyst',
  region: 'USA',
  language_code: 'en',
  avatar_url: null,
  risk_appetite: 'Moderate',
  target_sector: 'FinTech',
  check_size: '$1M - $5M',
  investment_thesis: 'Focuses on...',
  talking_style_json: {
    bluntness: 7,
    jargon_level: 'medium',
    favorite_word: 'data',
    humor: 5,
  },
});

if (result.success) {
  console.log('Persona created!');
} else {
  console.error(result.error);
}
```

---

### 4. Update Investor Persona

**Function:** `updateInvestorPersona(id, persona)`

**Description:** Updates an existing investor persona.

**Parameters:**
- `id: string` - UUID of the persona to update
- `persona: Partial<InvestorPersona>` - Fields to update

**Returns:**
```typescript
Promise<{
  success: boolean;
  error?: string;
}>
```

**Usage:**
```typescript
import { updateInvestorPersona } from '@/lib/admin-actions';

const result = await updateInvestorPersona('uuid-here', {
  check_size: '$10M - $50M',
  risk_appetite: 'High Risk, High Reward',
});

if (result.success) {
  console.log('Persona updated!');
} else {
  console.error(result.error);
}
```

---

### 5. Delete Investor Persona

**Function:** `deleteInvestorPersona(id)`

**Description:** Permanently deletes an investor persona.

**Parameters:**
- `id: string` - UUID of the persona to delete

**Returns:**
```typescript
Promise<{
  success: boolean;
  error?: string;
}>
```

**Usage:**
```typescript
import { deleteInvestorPersona } from '@/lib/admin-actions';

const result = await deleteInvestorPersona('uuid-here');

if (result.success) {
  console.log('Persona deleted!');
} else {
  console.error(result.error);
}
```

---

## AI Provider Configuration

### Supported Providers

#### OpenAI
```typescript
{
  name: 'OpenAI',
  apiKey: process.env.OPENAI_API_KEY,
  endpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4-turbo-preview',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}
```

#### DeepSeek
```typescript
{
  name: 'DeepSeek',
  apiKey: process.env.DEEPSEEK_API_KEY,
  endpoint: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}
```

### System Prompt Template

The AI receives a dynamically generated system prompt based on the investor persona:

```typescript
const systemPrompt = `You are ${investor.name}, ${investor.role} based in ${investor.region}.

INVESTMENT PROFILE:
- Risk Appetite: ${investor.risk_appetite}
- Target Sector: ${investor.target_sector}
- Check Size: ${investor.check_size}

INVESTMENT THESIS:
${investor.investment_thesis}

COMMUNICATION STYLE:
- Bluntness: ${talking_style.bluntness}/10 (1=diplomatic, 10=very direct)
- Humor: ${talking_style.humor}/10 (1=serious, 10=playful)
- Jargon Level: ${talking_style.jargon_level}
- Favorite Word: "${talking_style.favorite_word}"

INSTRUCTIONS:
You are evaluating a startup pitch. Ask probing questions, challenge assumptions, and assess the business viability. Stay in character and use your communication style. Be critical but constructive. Focus on key investment metrics: market size, traction, team, business model, and competitive advantage.

Respond naturally as this investor would in a pitch meeting.`;
```

---

## Rate Limits

### OpenAI
- Tier-based limits (varies by account)
- Typical: 3,500 requests per minute
- 90,000 tokens per minute

### DeepSeek
- Check provider documentation for current limits
- Generally lower than OpenAI

### Internal Rate Limits
- No built-in rate limiting
- Recommended: Implement rate limiting middleware for production

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "details": "Additional details (optional)"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_INPUT` | Missing or malformed request data | 400 |
| `UNAUTHORIZED` | Invalid or missing authentication | 401 |
| `FORBIDDEN` | Valid auth but insufficient permissions | 403 |
| `NOT_FOUND` | Requested resource doesn't exist | 404 |
| `SERVER_ERROR` | Internal server error | 500 |
| `AI_PROVIDER_ERROR` | External AI provider failed | 502 |
| `DATABASE_ERROR` | Database operation failed | 500 |

---

## WebSocket Support

Currently not implemented. All real-time features use Server-Sent Events (SSE) for streaming AI responses.

**Future Enhancement:** WebSocket support for:
- Real-time collaboration
- Multi-user pitch sessions
- Live admin dashboard updates

---

## Webhooks

Not currently implemented.

**Future Enhancement:** Webhook support for:
- Conversation completion events
- New investor persona creation
- Admin access events

---

## SDK / Client Libraries

Not currently available.

**Future Enhancement:** Official TypeScript SDK for easier integration:

```typescript
import { PitchArenaClient } from '@pitch-arena/sdk';

const client = new PitchArenaClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://your-domain.com',
});

await client.chat.send({
  message: 'Hello',
  investorId: 'uuid',
});
```

---

## Testing the API

### Using cURL

**Test Chat Endpoint:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "We are building an AI platform",
    "investorId": "uuid-here",
    "conversationHistory": []
  }'
```

**Test Admin Login:**
```bash
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "secretKey": "your_secret_key"
  }' \
  -c cookies.txt
```

**Test Admin Logout:**
```bash
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "logout"
  }' \
  -b cookies.txt
```

### Using Postman

1. Import the collection (create from examples above)
2. Set environment variables
3. Test endpoints
4. Save cookies for admin authentication

---

## Versioning

Current API Version: **v1** (implicit, no version prefix)

**Future Enhancement:** Versioned API paths:
- `/api/v1/chat`
- `/api/v2/chat`

Allows backward compatibility when breaking changes are introduced.
