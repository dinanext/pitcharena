# Deployment Guide

## Overview

This guide covers deploying Pitch Arena to production. The application is designed to work with Vercel (recommended) but can be deployed to any Node.js hosting platform.

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments, edge functions, and built-in CDN.

### 2. Alternative Platforms
- AWS (Amplify, EC2, ECS)
- Google Cloud Platform (Cloud Run, App Engine)
- Azure (App Service)
- DigitalOcean (App Platform)
- Railway
- Render

---

## Vercel Deployment

### Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- Repository pushed to version control

### Step-by-Step Deployment

#### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Select the project root directory

#### 2. Configure Project

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Root Directory:** `./` (leave as default unless nested)

#### 3. Environment Variables

Add all required environment variables in the Vercel dashboard:

```env
# AI Providers
OPENAI_API_KEY=sk-proj-your-key
DEEPSEEK_API_KEY=sk-your-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your-key
CLERK_SECRET_KEY=sk_live_your-secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Admin
ADMIN_SECRET_KEY=your_production_secret_key
```

**Important:**
- Use production keys for all services
- Never use test/development keys in production
- Generate a strong admin secret key (32+ characters)

#### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Visit the deployment URL

#### 5. Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning (automatic)

---

## Environment Variables Management

### Production vs Development

**Development (.env.local):**
- Test API keys
- Local Supabase instance
- Development Clerk application
- Simple admin key

**Production (Vercel):**
- Production API keys with proper rate limits
- Production Supabase project
- Production Clerk application
- Strong, unique admin secret key

### Security Best Practices

1. **Never commit `.env` files**
   ```gitignore
   .env
   .env.local
   .env.production
   ```

2. **Rotate secrets regularly**
   - Admin keys: Every 90 days
   - API keys: When team members leave
   - Database credentials: Annually

3. **Use secret management tools**
   - Vercel: Built-in secret management
   - AWS: Secrets Manager
   - GCP: Secret Manager
   - Azure: Key Vault

4. **Limit access**
   - Only store secrets that are needed
   - Use service accounts with minimal permissions
   - Audit secret access logs

---

## Database Migrations

### Pre-Deployment

Ensure all database migrations are applied before deploying new code:

```bash
# Using Supabase CLI
supabase db push

# Or apply via SQL Editor in Supabase Dashboard
```

### Post-Deployment

Verify migrations succeeded:
1. Check Supabase Dashboard > Database > Migrations
2. Test API endpoints that use new schema
3. Monitor error logs for database errors

---

## Build Optimization

### Next.js Build Configuration

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Optimize images
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Production optimizations
  swcMinify: true,

  // Disable source maps in production (optional)
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
```

### Bundle Analysis

```bash
# Install analyzer
npm install @next/bundle-analyzer

# Analyze bundle
ANALYZE=true npm run build
```

Review and optimize large bundles:
- Code splitting
- Dynamic imports
- Tree shaking
- Remove unused dependencies

---

## Performance Optimization

### 1. Static Generation

Pre-render pages that don't change often:

```typescript
// app/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

### 2. Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/investor.jpg"
  alt="Investor"
  width={200}
  height={200}
  priority={false} // Lazy load
/>
```

### 3. Font Optimization

Use next/font:

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      {children}
    </html>
  );
}
```

### 4. API Route Optimization

```typescript
// Cache API responses
export const revalidate = 300; // 5 minutes

// Stream responses for large data
export async function GET() {
  const stream = new ReadableStream({
    // Streaming logic
  });
  return new Response(stream);
}
```

---

## Monitoring and Logging

### Vercel Analytics

**Built-in Metrics:**
- Page views
- Unique visitors
- Web Vitals (LCP, FID, CLS)
- API route performance

**Enable:**
1. Go to Project Settings > Analytics
2. Enable Vercel Analytics
3. Add `@vercel/analytics` package:

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking

**Recommended Services:**
- Sentry
- LogRocket
- Datadog
- New Relic

**Sentry Setup:**

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Application Logs

Use Vercel's built-in logging:

```typescript
console.log('Info message');
console.error('Error message', error);
console.warn('Warning message');
```

View logs in Vercel Dashboard > Deployments > Function Logs

---

## CI/CD Pipeline

### Automatic Deployments

**Vercel automatically deploys:**
- Production: `main` or `master` branch
- Preview: All other branches and PRs

### GitHub Actions (Optional)

Add pre-deployment checks:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

---

## Rollback Strategy

### Vercel Instant Rollback

1. Go to Deployments tab
2. Find the last working deployment
3. Click "Promote to Production"
4. Deployment is live instantly

### Database Rollbacks

**⚠️ Caution:** Database rollbacks are complex.

**Strategy:**
1. Keep database migrations backward compatible
2. Use feature flags for schema changes
3. Maintain backups before migrations
4. Test rollback procedures in staging

---

## Scaling Considerations

### Vercel Limits (Pro Plan)

- 100GB bandwidth/month
- 1000 builds/month
- 100 concurrent builds
- Edge Functions: Unlimited
- Serverless Functions: 1M executions/month

### Optimization for Scale

**1. Edge Functions**
Move static content and simple APIs to edge:

```typescript
export const runtime = 'edge';

export async function GET() {
  // Fast edge response
}
```

**2. Caching**
Implement aggressive caching:

```typescript
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

**3. Database Connection Pooling**
Supabase handles this automatically, but monitor:
- Connection count
- Query performance
- Timeout errors

**4. Rate Limiting**
Implement rate limiting for API routes:

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export async function POST(req: Request) {
  const { success } = await ratelimit.limit(
    req.headers.get('x-forwarded-for') ?? 'anonymous'
  );

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Handle request
}
```

---

## Security Checklist

### Pre-Deployment

- [ ] All secrets stored in environment variables
- [ ] No hardcoded API keys in code
- [ ] RLS policies enabled on all tables
- [ ] Admin secret key is strong (32+ characters)
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection (React handles by default)
- [ ] CSRF protection (using SameSite cookies)

### Post-Deployment

- [ ] SSL certificate active (automatic with Vercel)
- [ ] Security headers configured
- [ ] Content Security Policy (CSP) set
- [ ] Monitoring alerts configured
- [ ] Backup strategy in place
- [ ] Incident response plan documented

### Security Headers

Add to `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Troubleshooting

### Build Failures

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Type errors**
```bash
# Run type check locally
npm run typecheck
```

### Runtime Errors

**Error: Database connection failed**
- Verify environment variables are set
- Check Supabase service status
- Verify RLS policies

**Error: AI provider timeout**
- Check API key validity
- Verify API credits/quota
- Increase timeout in API route

### Performance Issues

**Slow page loads**
- Enable Vercel Analytics to identify bottlenecks
- Check bundle size with analyzer
- Optimize images
- Implement caching

**API route timeouts**
- Vercel has 10s timeout for Hobby, 60s for Pro
- Optimize database queries
- Consider background jobs for long tasks

---

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test user authentication flow
- [ ] Test admin panel access
- [ ] Verify AI chat functionality
- [ ] Check database connectivity
- [ ] Test mobile responsiveness
- [ ] Verify custom domain (if configured)
- [ ] Set up monitoring alerts
- [ ] Document deployment process
- [ ] Create runbook for common issues

---

## Maintenance Schedule

### Daily
- Monitor error rates
- Check API usage/costs
- Review user activity

### Weekly
- Review performance metrics
- Check database health
- Update dependencies (if needed)

### Monthly
- Security audit
- Cost optimization review
- Backup verification
- Performance optimization

### Quarterly
- Rotate secrets
- Update investor personas
- Review and update documentation
- Major dependency updates
