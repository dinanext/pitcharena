# Pitch Arena - AI Investor Simulation Platform

## Overview

Pitch Arena is an interactive platform that allows entrepreneurs to practice their startup pitches against AI-powered investor personas. Each investor has unique characteristics, investment preferences, and communication styles, providing realistic pitch practice scenarios.

## Key Features

### 1. Multiple AI Investor Personas
- Diverse investor profiles with different investment theses
- Unique talking styles (bluntness, humor, jargon level)
- Region-specific investors with different check sizes
- Target sector preferences (B2B SaaS, AI Infrastructure, etc.)

### 2. Real-time Chat Interface
- Interactive pitch sessions with AI investors
- Voice input support (speech recognition)
- Message history and context retention
- Multiple AI provider support (OpenAI, DeepSeek)

### 3. Admin Dashboard
- Secure admin panel for managing investor personas
- Full CRUD operations (Create, Read, Update, Delete)
- Cookie-based authentication with 1-hour sessions
- Protected routes with session validation

### 4. Game Mechanics
- Conversation turn limits
- Win/loss outcomes based on investor engagement
- Modal overlays for game-over scenarios
- Restart and exit options

### 5. Responsive Design
- Mobile-first approach
- Glass-morphism UI design
- Dark theme with neon accents
- Smooth animations and transitions

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **State Management:** React Hooks

### Backend
- **API Routes:** Next.js API Routes
- **Server Actions:** Next.js Server Actions
- **Authentication:** Cookie-based sessions (Clerk for user auth)

### Database
- **Database:** Supabase (PostgreSQL)
- **ORM:** Supabase JavaScript Client
- **Tables:**
  - `investor_personas` - Investor profile data
  - Additional tables for user management

### AI Integration
- **Primary:** OpenAI GPT-4
- **Alternative:** DeepSeek API
- **Features:**
  - Dynamic system prompt generation
  - Context-aware responses
  - Persona-based personality injection

## Project Structure

```
project/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── auth/
│   │   │       └── route.ts          # Admin authentication API
│   │   └── chat/
│   │       └── route.ts              # AI chat endpoint
│   ├── arena/
│   │   └── [investorId]/
│   │       └── page.tsx              # Main pitch arena page
│   ├── secret-admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Admin dashboard
│   │   └── page.tsx                  # Admin login
│   ├── sign-in/
│   ├── sign-up/
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
├── components/
│   ├── admin/
│   │   └── investor-form-dialog.tsx  # CRUD form for investors
│   ├── ui/                           # shadcn/ui components
│   ├── ai-provider-selector.tsx      # AI provider switcher
│   ├── chat-input.tsx                # Chat input with voice
│   ├── chat-sidebar.tsx              # Investor selection sidebar
│   ├── chat-window.tsx               # Chat messages display
│   ├── game-over-modal.tsx           # Game end overlay
│   └── landing-page.tsx              # Home page component
├── hooks/
│   ├── use-speech-recognition.ts     # Voice input hook
│   └── use-toast.ts                  # Toast notifications
├── lib/
│   ├── admin-actions.ts              # Admin server actions
│   ├── ai-config.ts                  # AI provider configuration
│   ├── investors.ts                  # Investor data utilities
│   ├── supabase.ts                   # Supabase client
│   ├── types.ts                      # TypeScript types
│   └── utils.ts                      # Utility functions
├── supabase/
│   └── migrations/                   # Database migrations
├── docs/                             # Documentation
├── .env                              # Environment variables
└── package.json                      # Dependencies
```

## Getting Started

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Documentation

- [Setup Guide](./SETUP.md) - Installation and configuration
- [Architecture](./ARCHITECTURE.md) - System design and data flow
- [Admin Guide](./ADMIN_GUIDE.md) - Admin dashboard usage
- [API Documentation](./API.md) - API endpoints and usage
- [Database Schema](./DATABASE.md) - Database structure
- [Deployment](./DEPLOYMENT.md) - Production deployment guide
- [Contributing](./CONTRIBUTING.md) - Development guidelines

## Environment Variables

```env
# AI Providers
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Admin Access
ADMIN_SECRET_KEY=your_admin_secret_key
```

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact the development team.
