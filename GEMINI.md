# GEMINI.md - Alquemist Project Overview

## Project Overview
**Alquemist** is a multi-crop agricultural management platform designed for modern SaaS-based tracking of crops such as Cannabis, Coffee, Cocoa, and Flowers. It focuses on batch-first tracking, AI-powered feature integration (pest detection, form digitization), and automated regional compliance (with a focus on Colombia).

The platform is multi-tenant, where each **Company** is an organization (managed via Clerk), and users have roles within those companies or specific facilities.

### Main Technologies
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, shadcn/ui.
- **Backend**: Convex (serverless, real-time database and functions).
- **Authentication**: Clerk (integrated with Convex via JWT).
- **AI**: Google Gemini (`@google/generative-ai`) for image analysis and automated form extraction.
- **Reporting**: `pptxgenjs` for PowerPoint generation, `recharts` for data visualization.
- **Email**: Resend for system notifications and invitations.
- **Regional Support**: Default Colombia configuration (DANE administrative divisions, local regulatory frameworks).

## Architecture
- **Data Model**: Defined in `convex/schema.ts` with ~30 tables organized into functional groups:
    - **Core System**: `companies`, `users`, `roles`, `invitations`, `geographic_locations`.
    - **Crop Configuration**: `crop_types`, `cultivars`, `units_of_measure`.
    - **Facilities**: `facilities`, `areas`, `structures`.
    - **Supply Chain**: `suppliers`, `products`, `inventory_items`, `inventory_transactions`.
    - **Production**: `production_templates`, `production_orders`, `batches`, `plants`.
    - **Activities**: `activity_types`, `activities`, `scheduled_activities`, `activity_resources`.
    - **Quality & Health**: `quality_checks`, `pest_diseases`, `pest_disease_records`.
    - **Media & Compliance**: `media_files`, `compliance_events`.
- **Auth Flow**: Clerk handles authentication; a webhook (`convex/http.ts`) syncs Clerk users to the Convex `users` table. `convex/authHelpers.ts` provides a `getAuthenticatedUserId` helper to resolve identities.
- **UI Structure**: Organized into `app/(auth)`, `app/(dashboard)`, and `app/(onboarding)`. The dashboard uses a sidebar/header layout defined in `app/(dashboard)/layout.tsx` and `DashboardLayoutClient`.

## Building and Running

### Development
1.  **Install dependencies**: `npm install`
2.  **Environment Variables**: Copy `.env.example` to `.env.local` and fill in Clerk and Convex credentials.
3.  **Convex Dev**: `npx convex dev` (starts the Convex backend development environment).
4.  **Frontend Dev**: `npm run dev` (starts the Next.js dev server at `http://localhost:3000`).

### Production
- **Build**: `npm run build` (runs Convex codegen and Next.js build).
- **Start**: `npm run start` (runs the built application).
- **Convex Deploy**: `npx convex deploy` (deploys schema and functions to production).

### Quality Control
- **Linting**: `npm run lint`
- **Type Checking**: `npm run type-check`
- **Tests**: `npm run test` (Note: Check `scripts/` for various automated test suites).

## Development Conventions

### Coding Style
- **Strict TypeScript**: Use strict typing throughout the project.
- **Server Components**: Prefer Next.js Server Components for data fetching where appropriate, though many dashboard components use Convex hooks (`useQuery`, `useMutation`) for real-time updates.
- **UI Components**: Use shadcn/ui components (based on Radix UI) located in `components/ui/`.
- **Form Handling**: Use `react-hook-form` with `zod` for validation.
- **API Strategy**: Use Convex Queries and Mutations instead of standard REST API routes for most application logic.

### Database Operations
- **Surgical Updates**: When modifying the schema, ensure backward compatibility with existing data.
- **Auth Checking**: Always use `getAuthenticatedUserId(ctx)` in Convex functions to verify the caller's identity and company access.

### Documentation
- **Source of Truth**: Refer to `docs/pages/INDEX.md` for UI implementation details and `docs/Technical-Specification.md` for architecture.
- **Lessons Learned**: Consult `tasks/lessons.md` for project-specific patterns and common pitfalls.

## Project Structure
- `app/`: Next.js application router, layouts, and pages.
- `convex/`: Backend schema, functions (queries, mutations, actions), and webhooks.
- `components/`: Domain-specific React components (e.g., `components/batches`, `components/inventory`).
- `lib/`: Shared utilities, types, constants, and validation schemas.
- `docs/`: Extensive project documentation (requirements, technical specs, UI maps).
- `scripts/`: Shell and TypeScript scripts for testing, seeding, and automation.
- `public/`: Static assets and PWA manifest.
