# Tech Stack Standard

**Ceibatic Standard Technology Stack**
**Version**: 1.0
**Date**: January 2025

> **Note**: This is a living document and standardized template. When starting a new project, copy this document and adapt it to your specific domain requirements. Update version numbers and dates to track your project-specific changes.

---

## Philosophy

This document defines the **recommended technology stack** for Ceibatic development projects. Use this as a **template** for new projects, adapting it to your specific domain requirements while maintaining the core architectural principles.

This stack represents battle-tested choices that optimize for:

- **Developer Velocity** - Fast iteration with minimal boilerplate
- **Type Safety** - End-to-end TypeScript for fewer bugs
- **Serverless-First** - Zero infrastructure management
- **Cost Efficiency** - $0 to start, scales affordably
- **Latin American Market** - Optimized for regional requirements
- **Real-Time Capabilities** - Built-in live data updates

**Use this as:**
- Starting point for new projects
- Reference for technology decisions
- Onboarding guide for development team
- Standard for consistency across projects

**How to Adapt:**
1. Replace placeholder domain models (resources, companies) with your specific entities
2. Adjust API endpoints to match your domain operations
3. Customize UI pages in Bubble to match your workflows
4. Add domain-specific validations and business rules
5. Configure regional settings (currency, timezone, locale) for your target market

---

## Complete Stack Overview

```yaml
Frontend (Dual Architecture):
  Primary (No-Code):
    Platform: Bubble.io
    Purpose: Rapid UI development, standard CRUD operations
    Features: Drag-and-drop UI, workflows, responsive design
    Integration: REST API + Clerk authentication

  Advanced (Code):
    Framework: Next.js 14+ (App Router)
    Language: TypeScript 5.x
    Styling: Tailwind CSS 3.x
    UI Components: shadcn/ui
    Internationalization: next-intl
    Forms: React Hook Form + Zod
    State Management: React Context + Convex (real-time)
    Purpose: Custom features, AI components, complex analytics

Backend:
  Database: Convex (serverless, real-time)
  API Functions: Convex queries/mutations
  File Storage: Convex Storage
  Real-time: Built-in WebSocket subscriptions
  Validation: Zod schemas

Authentication:
  Provider: Clerk
  Features: OAuth (Google, GitHub), Organizations, RBAC
  Multi-tenancy: Native organization support
  Security: MFA, session management, JWT

Deployment:
  Frontend Platform: Vercel
  Database Platform: Convex Cloud
  CDN: Vercel Edge Network
  Preferred Region: São Paulo (Latin America) / US East (North America)
  CI/CD: GitHub Actions + Vercel auto-deploy

Development Tools:
  Package Manager: npm or pnpm
  Version Control: Git + GitHub
  Code Quality: ESLint + Prettier
  Testing: Vitest (unit) + Playwright (e2e)
  Type Checking: TypeScript strict mode
```

---

## Architecture Overview

### Dual-Frontend Strategy

**Purpose:** Combine the speed of no-code with the flexibility of custom code.

```
┌──────────────────────────────────────────────────────────┐
│              USERS (Latin American Market)               │
│              Mobile PWA + Desktop Browser                │
└─────────────────────┬────────────────────────────────────┘
                      │ HTTPS
         ┌────────────┴────────────┐
         │                         │
         ↓                         ↓
┌─────────────────┐       ┌──────────────────────────┐
│  BUBBLE APP     │       │   NEXT.JS 14             │
│  (No-Code)      │       │   (Custom Code)          │
│                 │       │                          │
│  - Standard UI  │       │  - Custom Features       │
│  - CRUD Forms   │       │  - AI Components         │
│  - Workflows    │       │  - Advanced Analytics    │
│  - Dashboards   │       │  - Complex Integrations  │
└────────┬────────┘       └──────────┬───────────────┘
         │                           │
         └────────┬──────────────────┘
                  ↓
         ┌────────────────────┐
         │   REST API v1      │
         │   /api/v1/*        │
         │                    │
         │  - Auth            │
         │  - CRUD Ops        │
         │  - Business Logic  │
         └────────┬───────────┘
                  │
         ┌────────┴─────────────────┐
         │                          │
         ↓                          ↓
┌──────────────────┐       ┌─────────────────────┐
│   CLERK AUTH     │       │   CONVEX DATABASE   │
│   (clerk.com)    │       │   (convex.dev)      │
│                  │       │                     │
│  - User Mgmt     │       │  - Tables           │
│  - OAuth         │       │  - Real-time Sync   │
│  - Organizations │       │  - File Storage     │
│  - RBAC          │       │  - TypeScript API   │
└──────────────────┘       └─────────────────────┘
```

**When to Use Each:**

**Bubble (Primary UI):**
- ✓ Standard CRUD operations (create, read, update, delete)
- ✓ Data entry forms
- ✓ List/table views
- ✓ Basic dashboards
- ✓ Simple workflows
- ✓ Rapid prototyping

**Next.js (Advanced Features):**
- ✓ AI-powered features (ML models, intelligent automation)
- ✓ Complex visualizations
- ✓ Real-time collaboration
- ✓ Advanced analytics
- ✓ Custom integrations
- ✓ Performance-critical features

---

## Technology Stack (Detailed)

### Frontend Platform: Bubble.io (Primary)

**Why Bubble:**
- **Rapid Development** - Build UIs 10x faster than code
- **No-Code Workflows** - Visual logic builder for business rules
- **Built-in Responsive** - Mobile-friendly by default
- **Database UI** - Automatic forms from data structure
- **Version Control** - Built-in deployment pipeline
- **Cost-Effective** - All-in-one platform

**Key Features:**
- **Drag-and-Drop UI** - Visual page builder
- **Reusable Elements** - Component library
- **Workflows** - Visual logic for actions
- **API Connector** - Integrate with REST APIs
- **Responsive Design** - Automatic mobile adaptation
- **User Management** - Built-in (integrated with Clerk)

**Integration with Backend:**
```
Bubble → REST API (/api/v1/*) → Convex Database

1. User authenticates via Clerk plugin in Bubble
2. Get API token from /api/v1/auth/token
3. Store token in Bubble state
4. All API calls include: Authorization: Bearer <token>
5. Display data in Bubble UI elements
```

**Bubble Setup:**

1. **Install Clerk Plugin:**
   - Add Clerk authentication to Bubble app
   - Configure with same Clerk keys as Next.js
   - Enable Organizations for multi-tenancy

2. **Configure API Connector:**
   ```
   Name: Your App API
   Base URL: https://your-domain.com/api/v1
   Authentication: Bearer Token

   Shared Headers:
   - Authorization: Bearer [token]
   - Content-Type: application/json
   ```

3. **Create API Calls:**
   - GET /resources - List resources
   - POST /resources - Create resource
   - PUT /resources/:id - Update resource
   - DELETE /resources/:id - Delete resource
   - (Define endpoints based on your domain model)

4. **Build UI Pages:**
   - Dashboard (overview metrics)
   - Resource list & forms
   - Data entry pages
   - Analytics & reporting
   - Settings & configuration
   - User management

**Bubble Workflow Example:**
```
When Button "Create Resource" is clicked:
  → Step 1: Make API call POST /resources
    Body: {
      name: Input Resource Name's value,
      type: Dropdown Type's value,
      companyId: Current User's Company ID
    }
  → Step 2: Show alert "Resource created"
  → Step 3: Navigate to Resources page
  → Step 4: Refresh Repeating Group (resources list)
```

**Advantages:**
- Non-developers can build and modify UI
- Faster iteration on standard features
- Lower development costs
- Built-in hosting and SSL
- Visual debugging

**Limitations:**
- Limited customization for complex UI
- Performance constraints for heavy data
- No TypeScript or compile-time checks
- Vendor lock-in to Bubble platform

**Cost:**
```
Free Plan: $0/month (development only)
Starter Plan: $29/month (production)
Growth Plan: $119/month (custom domain, more capacity)
```

---

### Frontend Framework: Next.js 14+ (Advanced)

**Why Next.js:**
- Server-side rendering (SSR) for SEO and performance
- App Router for modern React patterns (Server Components)
- API routes for backend logic
- Automatic code splitting and optimization
- Built-in Image optimization
- Excellent developer experience

**Key Features:**
- **App Router** - File-based routing with layouts
- **Server Components** - Reduce client-side JavaScript
- **Server Actions** - Type-safe mutations without API routes
- **Middleware** - Auth and i18n handling
- **ISR** - Incremental Static Regeneration

**Configuration:**
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-convex-deployment.convex.cloud',
      },
    ],
  },

  // Internationalization
  i18n: {
    locales: ['es', 'en', 'pt'],
    defaultLocale: 'es', // Spanish-first for Latin America
  },
}

export default nextConfig
```

---

### Language: TypeScript 5.x

**Why TypeScript:**
- Catch errors at compile time, not runtime
- Better IDE autocomplete and refactoring
- Self-documenting code with types
- Safer refactoring
- Industry standard for modern web apps

**Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/convex/*": ["./convex/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### Styling: Tailwind CSS 3.x

**Why Tailwind:**
- Utility-first approach (rapid development)
- No CSS file bloat (unused styles purged)
- Consistent design system
- Excellent mobile-first responsive design
- No naming conflicts

**Configuration:**
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom brand colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... other colors
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

---

### UI Components: shadcn/ui

**Why shadcn/ui:**
- Copy-paste components (you own the code)
- Built on Radix UI (accessibility built-in)
- Tailwind-based styling
- TypeScript-first
- Customizable without fighting the framework

**Key Components:**
- Forms (Input, Select, Checkbox, etc.)
- Data Display (Table, Card, Badge)
- Overlays (Dialog, Sheet, Popover)
- Feedback (Toast, Alert)
- Navigation (Tabs, Menu, Breadcrumb)

**Installation:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
# ... add components as needed
```

---

### Internationalization: next-intl

**Why next-intl:**
- Server Component support (App Router compatible)
- Type-safe translations
- Automatic locale detection
- SEO-friendly (different URLs per locale)
- Format numbers, dates, currencies per locale

**Configuration:**
```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  timeZone: 'America/Bogota', // Default timezone
  now: new Date(),
}))

// Supported locales
export const locales = ['es', 'en', 'pt'] as const
export const defaultLocale = 'es' as const
```

**Usage:**
```typescript
import { useTranslations } from 'next-intl'

export default function Component() {
  const t = useTranslations('Common')

  return <h1>{t('welcome')}</h1>
}
```

---

### Forms: React Hook Form + Zod

**Why This Combination:**
- React Hook Form: Performant, minimal re-renders
- Zod: Type-safe schema validation
- Perfect integration with TypeScript
- Server-side validation support

**Example:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define schema
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
})

type FormData = z.infer<typeof formSchema>

export default function RegistrationForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      companyName: '',
    },
  })

  async function onSubmit(data: FormData) {
    // Type-safe data
    await registerUser(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

---

### Database: Convex

**Why Convex:**
- **Serverless** - No database server to manage
- **Real-time** - Built-in WebSocket subscriptions
- **Type-safe** - Auto-generates TypeScript types
- **Serverless Functions** - Backend logic as queries/mutations
- **File Storage** - Built-in file uploads
- **Zero config** - No migrations, schema auto-updates
- **Developer Experience** - Hot reload, local dev mode

**Key Concepts:**

1. **Schema Definition:**

Define your domain model tables. The example below shows a typical multi-tenant schema - adapt the table names and fields to your specific domain:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Core user table (required for multi-tenancy)
  users: defineTable({
    email: v.string(),
    name: v.string(),
    companyId: v.id('companies'),
    roleId: v.id('roles'),
    clerkId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_company', ['companyId'])
    .index('by_clerk_id', ['clerkId']),

  // Company table (required for multi-tenancy)
  companies: defineTable({
    name: v.string(),
    taxId: v.string(),
    businessEntityType: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_tax_id', ['taxId']),

  // Add your domain-specific tables here
  // Example: resources, projects, tasks, etc.
})
```

2. **Queries (Read Data):**
```typescript
// convex/users.ts
import { query } from './_generated/server'
import { v } from 'convex/values'

export const getUsersByCompany = query({
  args: { companyId: v.id('companies') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_company', (q) => q.eq('companyId', args.companyId))
      .collect()
  },
})
```

3. **Mutations (Write Data):**
```typescript
// convex/users.ts
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    companyId: v.id('companies'),
    roleId: v.id('roles'),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})
```

4. **Real-time Subscriptions:**
```typescript
// In React component
'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function UserList({ companyId }: { companyId: string }) {
  // Auto-updates when data changes!
  const users = useQuery(api.users.getUsersByCompany, { companyId })

  if (users === undefined) return <div>Loading...</div>

  return (
    <ul>
      {users.map(user => (
        <li key={user._id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

**File Storage:**
```typescript
// Upload file
const storageId = await ctx.storage.store(file)

// Generate URL
const url = await ctx.storage.getUrl(storageId)
```

---

### Authentication: Clerk

**Why Clerk:**
- **Organizations** - Built-in multi-tenancy
- **OAuth** - Google, GitHub, etc. pre-configured
- **RBAC** - Role-based access control
- **Security** - MFA, session management, JWT
- **Developer Experience** - React components, hooks
- **Webhooks** - Sync user data to your database

**Setup:**

1. **Installation:**
```bash
npm install @clerk/nextjs
```

2. **Configuration:**
```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

3. **Usage in Components:**
```typescript
// Server Component
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId, orgId } = await auth()

  if (!userId) redirect('/sign-in')

  return <div>Welcome {userId}</div>
}

// Client Component
'use client'
import { useUser, useOrganization } from '@clerk/nextjs'

export default function Component() {
  const { user } = useUser()
  const { organization } = useOrganization()

  return <div>{user?.firstName} @ {organization?.name}</div>
}
```

4. **Multi-Tenancy Pattern:**
```typescript
// Map Clerk Organization to your Company
const companyId = organization.id // Use as companyId in database

// Row-level security in queries
const batches = await ctx.db
  .query('batches')
  .withIndex('by_company', (q) => q.eq('companyId', companyId))
  .collect()
```

---

### Deployment

#### Bubble Deployment

**Platform:** Bubble.io Cloud

**Setup:**
1. Build pages and workflows in Bubble editor
2. Test in development mode
3. Deploy to production with one click
4. Configure custom domain (optional)

**Features:**
- Automatic hosting and SSL
- Built-in version control
- Rollback to previous versions
- CDN for static assets
- Automatic scaling

**Cost:**
- Development: Free
- Production: $29-119/month (includes hosting)

---

#### Next.js Deployment: Vercel

**Why Vercel:**
- **Zero Configuration** - Connect GitHub, auto-deploy
- **Edge Network** - Global CDN for fast loading
- **Serverless Functions** - Auto-scaling
- **Preview Deployments** - Every PR gets a URL
- **Analytics** - Built-in performance monitoring
- **Cost-Effective** - FREE tier, $20/month Pro

**Setup:**

1. Connect GitHub repository to Vercel
2. Configure environment variables:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_***
   CLERK_SECRET_KEY=sk_***
   NEXT_PUBLIC_CONVEX_URL=https://***.convex.cloud
   CONVEX_DEPLOY_KEY=***
   BUBBLE_APP_URL=https://your-app.bubbleapps.io
   ALLOWED_ORIGINS=https://your-app.bubbleapps.io,http://localhost:3000
   ```
3. Deploy: `git push origin main` (auto-deploys)

**Features:**
- Automatic HTTPS certificates
- Custom domains
- Preview URLs for PRs
- Rollback to previous deployments
- Edge Functions (globally distributed)
- CORS configured for Bubble integration

---

## Architecture Patterns

### Multi-Tenancy (Company-Based Isolation)

**Pattern:**
- Every table has `companyId` foreign key
- Users belong to one company (Clerk Organization)
- Row-level security in all queries
- No cross-company data access

**Implementation:**
```typescript
// Always filter by companyId
const { orgId } = await auth()

const records = await ctx.db
  .query('table_name')
  .withIndex('by_company', (q) => q.eq('companyId', orgId))
  .collect()

// Never allow queries without company filtering!
```

---

### Role-Based Access Control (5 Levels)

**Standard Role Hierarchy:**

1. **OWNER** (level 1000) - Full access, billing, user management
2. **MANAGER** (level 500) - Operational management, reporting
3. **SUPERVISOR** (level 300) - Team supervision, approvals
4. **WORKER** (level 100) - Task execution, data entry
5. **VIEWER** (level 10) - Read-only access

**Implementation:**
```typescript
// Database schema
roles: defineTable({
  name: v.string(),
  level: v.number(), // 1000, 500, 300, 100, 10
  permissions: v.object({}), // JSON permission matrix
  companyId: v.id('companies'),
})

// Permission check
function hasPermission(userLevel: number, requiredLevel: number) {
  return userLevel >= requiredLevel
}

// Usage in mutation
export const deleteRecord = mutation({
  args: { id: v.id('records') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)

    if (!hasPermission(user.roleLevel, 500)) {
      throw new Error('Insufficient permissions')
    }

    await ctx.db.delete(args.id)
  },
})
```

---

### API Design (REST)

**Standard Response Format:**
```typescript
// lib/api/response.ts
export type ApiResponse<T> = {
  success: true
  data: T
  meta: {
    timestamp: string
  }
} | {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta: {
    timestamp: string
  }
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: { timestamp: new Date().toISOString() },
  }
}

export function errorResponse(code: string, message: string): ApiResponse<never> {
  return {
    success: false,
    error: { code, message },
    meta: { timestamp: new Date().toISOString() },
  }
}
```

**Usage:**
```typescript
// app/api/v1/users/route.ts
import { NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const users = await getUsers()
    return NextResponse.json(successResponse(users))
  } catch (error) {
    return NextResponse.json(
      errorResponse('FETCH_ERROR', 'Failed to fetch users'),
      { status: 500 }
    )
  }
}
```

---

### Validation (Zod Schemas)

**Shared Validation:**
```typescript
// lib/validations/user.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  companyId: z.string(),
  roleId: z.string(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// Use in API
export async function POST(request: Request) {
  const body = await request.json()

  const result = createUserSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      errorResponse('VALIDATION_ERROR', result.error.message),
      { status: 422 }
    )
  }

  // result.data is type-safe
  const user = await createUser(result.data)
  return NextResponse.json(successResponse(user))
}
```

---

### Error Handling

**Standard Error Classes:**
```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, 'BAD_REQUEST', message, details)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message)
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`)
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(422, 'VALIDATION_ERROR', message, details)
  }
}
```

---

## Development Workflow

### Dual-Frontend Development Strategy

**Phase 1: Start with Bubble (Weeks 1-4)**
1. Build core CRUD UI in Bubble
2. Set up API connector to backend
3. Implement standard workflows
4. Test with real users
5. Iterate quickly based on feedback

**Phase 2: Add Next.js for Advanced Features (Weeks 5+)**
1. Identify features that need custom code
2. Build AI components, analytics, etc.
3. Deploy to Vercel
4. Integrate with Bubble via shared backend

**Ongoing:**
- Maintain Bubble for 80% of UI (standard operations)
- Use Next.js for 20% (advanced/custom features)
- Both frontends use same backend (API + Convex + Clerk)

---

### Bubble Development Setup

**Initial Setup:**
1. Create Bubble account at bubble.io
2. Create new app (choose blank template)
3. Install Clerk plugin from Bubble marketplace
4. Configure API Connector with backend URL
5. Set up data types (mirror Convex schema)

**Development Workflow:**
1. Design pages in visual editor
2. Add elements (inputs, buttons, repeating groups)
3. Create workflows (when button clicked...)
4. Make API calls to backend
5. Test in preview mode
6. Deploy to production

**Best Practices:**
- Use reusable elements for common components
- Create custom states for temporary data
- Use URL parameters for navigation
- Test workflows step-by-step
- Version control with Bubble's built-in system

---

### Next.js Local Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd <project>

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 4. Run development servers
npm run dev          # Next.js (port 3000)
npx convex dev       # Convex (sync schema)

# 5. Open browser
open http://localhost:3000
```

### Environment Variables

```bash
# .env.local

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_***
CLERK_SECRET_KEY=sk_***
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=***

# Optional: For Bubble integration
BUBBLE_APP_URL=https://your-app.bubbleapps.io
ALLOWED_ORIGINS=https://your-app.bubbleapps.io,http://localhost:3000
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/module-name

# 2. Make changes with incremental commits
git add .
git commit -m "feat(component): add feature"

# 3. Push to GitHub
git push origin feature/module-name

# 4. Create Pull Request
gh pr create --title "feat: implement module" --body "Description"

# 5. After merge, update main
git checkout main
git pull origin main
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats Colombian pesos correctly', () => {
    expect(formatCurrency(290000, 'COP')).toBe('$290.000')
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can sign up and create company', async ({ page }) => {
  await page.goto('/sign-up')

  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'SecurePass123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/onboarding')
})
```

---

## Code Quality

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}
```

### Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
}
```

---

## Performance Optimization

### Latin American Market

**Strategies:**
- **CDN Region**: São Paulo or US East edge
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **PWA**: Offline support for rural areas
- **3G Optimization**: Compressed assets, lazy loading

### Monitoring

**Vercel Analytics:**
- Core Web Vitals monitoring
- Real User Monitoring (RUM)
- Performance insights

**Convex Dashboard:**
- Query performance
- Database size
- Function execution time

---

## Cost Estimates

### Startup (0-100 users, Development Phase)
```
Frontend:
  Bubble: $0/month (Development mode)
  Vercel: $0/month (Hobby tier)

Backend:
  Convex: $0/month (Free tier - 1M rows)
  Clerk: $0/month (Free tier - 10k MAU)

Total: $0/month
```

### Small Business (100-1000 users, Production)
```
Frontend:
  Bubble: $29/month (Starter plan - primary UI)
  Vercel: $0-20/month (Hobby or Pro - custom features)

Backend:
  Convex: $0-25/month (Starter tier)
  Clerk: $25/month (Startup tier)

Total: $54-99/month
```

### Medium Business (1000-10000 users, Full Features)
```
Frontend:
  Bubble: $119/month (Growth plan - custom domain, capacity)
  Vercel: $20/month (Pro tier - custom Next.js features)

Backend:
  Convex: $25-100/month (Growth tier)
  Clerk: $99/month (Growth tier)

Total: $263-338/month
```

**Cost Optimization Strategies:**
- Start with Bubble-only (standard UI) to minimize costs
- Add Next.js features incrementally as needed
- Use Bubble for 80% of UI, Next.js for 20% advanced features
- Bubble includes hosting, reducing infrastructure costs
- Scale backend (Convex/Clerk) based on actual usage

---

## Security Best Practices

### Authentication
- ✓ Use Clerk for authentication (battle-tested)
- ✓ Enable MFA for admin users
- ✓ Implement session timeout
- ✓ Use HTTP-only cookies

### Data Security
- ✓ Row-level security (filter by companyId)
- ✓ Input validation with Zod
- ✓ Sanitize user input
- ✓ Use parameterized queries (Convex handles this)

### API Security
- ✓ Validate JWT tokens
- ✓ Rate limiting (Vercel middleware)
- ✓ CORS configuration
- ✓ Error handling (don't leak sensitive info)

---

## Regional Considerations (Latin America)

### Internationalization
```typescript
// Default: Spanish-first
defaultLocale: 'es'
locales: ['es', 'en', 'pt']
```

### Currency Formatting
```typescript
// Colombian Pesos
new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0
}).format(290000) // $290.000

// Brazilian Real
new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(290) // R$ 290,00
```

### Timezone
```typescript
// Default timezone
timezone: 'America/Bogota'    // Colombia
timezone: 'America/Sao_Paulo' // Brazil
timezone: 'America/Mexico_City' // Mexico
```

---

## Migration from Other Stacks

### From Traditional Backend (Node.js + PostgreSQL)

**Before:**
```typescript
// Separate backend server
// PostgreSQL database
// Manual API endpoints
// Manual WebSocket setup
```

**After (Convex):**
```typescript
// No separate backend
// Convex database (serverless)
// Type-safe queries/mutations
// Built-in real-time subscriptions
```

### From Firebase

**Before:**
```typescript
// Firestore (NoSQL, limited querying)
// Firebase Auth
// Manual security rules
```

**After (Convex + Clerk):**
```typescript
// Convex (relational, powerful queries)
// Clerk (more features, better DX)
// Type-safe, automatic security
```

---

## Resources & Documentation

### Official Docs
- [Next.js](https://nextjs.org/docs)
- [Convex](https://docs.convex.dev)
- [Clerk](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev)
- [next-intl](https://next-intl-docs.vercel.app)

### Learning Resources
- [Next.js App Router Course](https://nextjs.org/learn)
- [Convex Quickstart](https://docs.convex.dev/quickstart)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Community
- [Next.js Discord](https://nextjs.org/discord)
- [Convex Discord](https://convex.dev/community)
- [Clerk Discord](https://clerk.com/discord)

---

## Summary

**This stack provides:**
- ✓ **Dual-Frontend Flexibility** - Bubble for speed, Next.js for power
- ✓ **Zero Infrastructure** - Serverless everything
- ✓ **Rapid Development** - No-code + code where needed
- ✓ **Type Safety** - End-to-end TypeScript (Next.js side)
- ✓ **Real-time** - Built-in live updates
- ✓ **Developer Experience** - Fast iteration, hot reload
- ✓ **Cost Effective** - $0 to start, scales affordably ($54-338/month in production)
- ✓ **Production Ready** - Battle-tested technologies
- ✓ **Latin America Optimized** - Regional CDN, i18n, currency

**Perfect for:**
- SaaS applications with standard + custom features
- B2B platforms requiring rapid iteration
- Multi-tenant systems (company-based isolation)
- Real-time collaboration tools
- Mobile-first web apps (PWA)
- Applications needing AI/ML features alongside standard CRUD

**Development Approach:**
1. **Start Fast:** Build 80% of UI in Bubble (weeks, not months)
2. **Add Power:** Implement 20% custom features in Next.js (as needed)
3. **Single Backend:** Both frontends share Convex + Clerk
4. **Scale Together:** Bubble and Next.js grow with your business

**Cost Comparison:**
- **Bubble-only approach:** $54-149/month (backend + Bubble hosting)
- **Next.js-only approach:** $45-219/month (backend + Vercel)
- **Dual approach (recommended):** $54-338/month (best of both worlds)

---

## Customizing for Your Domain

When starting a new project with this stack:

### 1. Define Your Domain Model
- Identify core entities (e.g., Projects, Tasks, Orders, Patients, Properties)
- Map relationships between entities
- Determine which fields are required vs. optional
- Design your Convex schema based on these entities

### 2. Design Your API
- Create RESTful endpoints for each entity
- Follow the pattern: GET /entities, POST /entities, PUT /entities/:id, DELETE /entities/:id
- Add custom endpoints for complex operations
- Document your API using the response format pattern

### 3. Build Your Bubble UI
- Create pages for each major entity
- Design forms for create/edit operations
- Build list views with repeating groups
- Implement workflows for business logic
- Connect to your API endpoints

### 4. Add Next.js Features (As Needed)
- Identify features that require custom code
- Build complex visualizations or analytics
- Implement AI/ML features
- Create real-time collaboration features
- Deploy incrementally alongside Bubble

### 5. Configure for Your Region
- Set default locale and supported languages
- Configure currency formatting
- Set timezone defaults
- Adjust CDN regions if needed

---

**Ready to build with this stack!** 🚀
