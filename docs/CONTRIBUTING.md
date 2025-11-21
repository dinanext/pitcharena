# Contributing Guide

## Welcome

Thank you for considering contributing to Pitch Arena! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Issue Reporting](#issue-reporting)
8. [Feature Requests](#feature-requests)

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or inflammatory comments
- Personal attacks
- Publishing private information
- Spam or excessive self-promotion

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git installed and configured
- Basic knowledge of TypeScript and React
- Familiarity with Next.js (helpful but not required)

### Fork and Clone

```bash
# Fork the repository on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/pitch-arena.git
cd pitch-arena

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/pitch-arena.git

# Install dependencies
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in required API keys (see SETUP.md)
3. Run development server: `npm run dev`

---

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

```
feature/add-voice-input
bugfix/fix-admin-logout
hotfix/security-patch
docs/update-readme
refactor/simplify-chat-logic
```

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(chat): add voice input support

Implemented speech recognition for chat input using Web Speech API.
Includes microphone permission handling and fallback for unsupported browsers.

Closes #123

---

fix(admin): resolve cookie setting error

Changed from Server Action to API route for cookie operations to comply
with Next.js 15 restrictions.

Fixes #456
```

### Development Process

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

3. **Test locally**
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Keep branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open Pull Request**
   - Go to GitHub and create PR
   - Fill out PR template
   - Link related issues

---

## Coding Standards

### TypeScript

**Use explicit types:**
```typescript
// ✅ Good
function greet(name: string): string {
  return `Hello, ${name}`;
}

// ❌ Bad
function greet(name) {
  return `Hello, ${name}`;
}
```

**Avoid `any`:**
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

function getUser(): User {
  // ...
}

// ❌ Bad
function getUser(): any {
  // ...
}
```

**Use type inference when obvious:**
```typescript
// ✅ Good
const count = 0; // Type inferred as number

// ❌ Unnecessary
const count: number = 0;
```

### React Components

**Use functional components:**
```typescript
// ✅ Good
export function ChatWindow({ messages }: ChatWindowProps) {
  return <div>{/* ... */}</div>;
}

// ❌ Avoid class components
export class ChatWindow extends React.Component {
  // ...
}
```

**Use client directive only when needed:**
```typescript
// ✅ Good - Server Component by default
export function InvestorList({ investors }: Props) {
  return <div>{/* ... */}</div>;
}

// ✅ Good - Client Component when hooks are needed
'use client';

export function ChatInput() {
  const [message, setMessage] = useState('');
  return <input value={message} onChange={e => setMessage(e.target.value)} />;
}
```

**Props interface naming:**
```typescript
// ✅ Good
interface ChatWindowProps {
  messages: Message[];
  onSend: (message: string) => void;
}

export function ChatWindow({ messages, onSend }: ChatWindowProps) {
  // ...
}
```

### Styling

**Use Tailwind CSS classes:**
```typescript
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
  {/* ... */}
</div>

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  {/* ... */}
</div>
```

**Use cn() utility for conditional classes:**
```typescript
import { cn } from '@/lib/utils';

<button
  className={cn(
    'px-4 py-2 rounded',
    isActive && 'bg-primary text-white',
    disabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Click me
</button>
```

### File Organization

**One component per file:**
```
components/
  chat-window.tsx       # Main component
  chat-input.tsx        # Separate component
  chat-sidebar.tsx      # Separate component
```

**Co-locate related files:**
```
features/
  chat/
    components/
      chat-window.tsx
      chat-input.tsx
    hooks/
      use-chat.ts
    types.ts
    utils.ts
```

### Error Handling

**Always handle errors:**
```typescript
// ✅ Good
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  toast({
    title: 'Error',
    description: 'Failed to load data',
    variant: 'destructive',
  });
  throw error; // Re-throw if caller needs to handle
}

// ❌ Bad
const data = await fetchData(); // Unhandled promise rejection
```

**User-friendly error messages:**
```typescript
// ✅ Good
toast({
  title: 'Failed to save',
  description: 'Please check your internet connection and try again.',
});

// ❌ Bad
toast({
  title: 'Error',
  description: error.message, // Technical error message
});
```

### Performance

**Use React.memo for expensive components:**
```typescript
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Complex rendering logic
  return <div>{/* ... */}</div>;
});
```

**Debounce user input:**
```typescript
import { useDebounce } from '@/hooks/use-debounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  // API call with debounced value
}, [debouncedSearch]);
```

**Lazy load heavy components:**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
});
```

---

## Testing Guidelines

### Unit Tests (Future)

```typescript
// chat-utils.test.ts
import { formatMessage } from './chat-utils';

describe('formatMessage', () => {
  it('should format user messages correctly', () => {
    const result = formatMessage('Hello', 'user');
    expect(result).toEqual({
      role: 'user',
      content: 'Hello',
    });
  });

  it('should handle empty messages', () => {
    const result = formatMessage('', 'user');
    expect(result).toBeNull();
  });
});
```

### Integration Tests (Future)

```typescript
// admin-dashboard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboard } from './page';

describe('AdminDashboard', () => {
  it('should display investor list', async () => {
    render(<AdminDashboard />);
    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should open create dialog on button click', () => {
    render(<AdminDashboard />);
    const button = screen.getByText('Add Investor');
    fireEvent.click(button);
    expect(screen.getByText('Create Investor Persona')).toBeVisible();
  });
});
```

### Manual Testing Checklist

Before submitting PR, test:

- [ ] Feature works as expected
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] No console errors or warnings
- [ ] Loading states display correctly
- [ ] Error states handled gracefully
- [ ] Accessibility (keyboard navigation)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari)

---

## Pull Request Process

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Checked on mobile devices

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated Checks**
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Build success

2. **Code Review**
   - At least one approval required
   - Address all review comments
   - Keep discussion respectful

3. **Testing**
   - Manual testing by reviewer
   - Verify in preview deployment

4. **Merge**
   - Squash and merge (default)
   - Delete branch after merge

### PR Best Practices

**Do:**
- Keep PRs small and focused
- Write descriptive titles and descriptions
- Link related issues
- Respond to feedback promptly
- Update PR based on review comments

**Don't:**
- Mix multiple features in one PR
- Submit work-in-progress without marking as draft
- Force push after reviews have started
- Merge your own PRs without approval

---

## Issue Reporting

### Bug Reports

Use this template:

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 98, Safari 15]
- Version: [e.g., 1.2.3]

**Additional Context**
Any other relevant information
```

### Issue Labels

- `bug` - Something isn't working
- `feature` - New feature request
- `enhancement` - Improvement to existing feature
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Critical issues
- `priority: low` - Nice to have

---

## Feature Requests

### Proposal Template

```markdown
**Feature Description**
Clear description of the proposed feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, related features

**Implementation Notes** (optional)
Technical considerations
```

### Feature Discussion

1. Open issue with feature proposal
2. Community discusses feasibility and approach
3. Maintainers approve or provide feedback
4. Implementation can begin after approval

---

## Development Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Tools
- [ESLint](https://eslint.org) - Linting
- [Prettier](https://prettier.io) - Code formatting
- [TypeScript](https://www.typescriptlang.org) - Type checking

### Communication
- GitHub Issues - Bug reports and features
- GitHub Discussions - General questions
- Pull Requests - Code review

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Special mentions for significant contributions

---

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Open a new issue with `question` label

Thank you for contributing to Pitch Arena! 🚀
