# Alquemist — Instrucciones de Proyecto

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript strict
- **UI:** Radix UI + shadcn/ui + Tailwind CSS
- **Backend:** Convex (real-time serverless)
- **Auth:** Clerk (`@clerk/nextjs`) + Convex integration (JWT template `convex`)
- **Forms:** React Hook Form + Zod
- **Notificaciones:** Sonner toasts
- **Email:** Resend (invitaciones, reportes) + Clerk (verificacion, password reset)

## Autenticacion (Clerk + Convex)

El proyecto usa **Clerk** para autenticacion con integracion oficial a Convex via JWT template. Las paginas de auth son **custom UI** (no Clerk pre-built components).

> **Nota:** Migracion desde `@convex-dev/auth` en progreso. Plan completo en `docs/dev/clerk-migration-plan.md`. Skill de migracion en `.claude/skills/migrate-auth/SKILL.md`.

| Concepto | Implementacion |
|----------|---------------|
| Provider React | `ClerkProvider` + `ConvexProviderWithClerk` en `components/providers/convex-client-provider.tsx` |
| Middleware rutas | `middleware.ts` — `clerkMiddleware()` de `@clerk/nextjs/server` |
| Auth en frontend | `useSignIn()`, `useSignUp()`, `useUser()`, `useAuth()` de `@clerk/nextjs` |
| Auth en backend | `ctx.auth.getUserIdentity()` → lookup por `clerkId` en tabla `users` |
| Auth helper backend | `getAuthenticatedUserId(ctx)` — wrapper que retorna `Id<"users">` o `null` |
| Usuario actual | `api.users.getCurrentUser` query |
| Webhook sync | HTTP endpoint en Convex recibe `user.created/updated/deleted` de Clerk |
| Validadores compartidos | `convex/validation.ts` (email, phone, NIT) |

### Variables de entorno — Next.js (`.env.local`)

| Variable | Descripcion |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_test_...` dev, `pk_live_...` prod) |
| `CLERK_SECRET_KEY` | Clerk secret key (`sk_test_...` dev, `sk_live_...` prod) |
| `CLERK_JWT_ISSUER_DOMAIN` | Issuer URL del JWT template (ej: `https://fluent-gecko-72.clerk.accounts.dev`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/signup` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/verify-email` |

### Variables de entorno — Convex (backend)

Configurar via `npx convex env set VARIABLE -- "valor"`:

| Variable | Descripcion |
|----------|-------------|
| `CLERK_JWT_ISSUER_DOMAIN` | Mismo issuer URL del JWT template. Requerido para validar tokens |
| `RESEND_API_KEY` | API key de Resend para invitaciones y reportes |

### Schema users y Clerk

La tabla `users` en `convex/schema.ts` incluye un campo `clerkId` para vincular con Clerk. Reglas:

1. **Campo `clerkId`:** `v.optional(v.string())` — se llena via webhook `user.created`
2. **Index `by_clerk_id`:** Para lookup rapido de usuario por Clerk subject
3. **Campos custom siguen siendo `v.optional()`:** El usuario se crea via webhook con datos minimos (clerkId, email, name). Campos adicionales se llenan durante onboarding
4. **Queries que usan campos del user:** Usar null checks o fallbacks (`user.email ?? ""`, `user.locale || "es"`)

### Rutas publicas (no requieren auth)

`/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`, `/accept-invitation(.*)`, `/invitation-invalid`, `/welcome-invited`

## Estructura de Codigo

| Tipo | Path |
|------|------|
| Paginas auth | `app/(auth)/[ruta]/page.tsx` |
| Paginas dashboard | `app/(dashboard)/[ruta]/page.tsx` |
| Paginas onboarding | `app/(onboarding)/[ruta]/page.tsx` |
| Componentes | `components/[dominio]/[nombre].tsx` |
| Backend Convex | `convex/[dominio].ts` |
| Schema | `convex/schema.ts` (campo `clerkId` + index `by_clerk_id`) |
| Auth config | `convex/auth.config.ts` (Clerk JWT issuer) |
| Validacion | `convex/validation.ts` |
| Hooks | `hooks/[nombre].ts` |
| Documentacion modulos | `docs/modules/phase-{1,2,3,4}/` |

## Convenciones de Codigo

- TypeScript strict en todo el proyecto
- Formularios con React Hook Form + Zod schema
- Validacion dual: Zod en frontend + validacion en Convex mutations
- Botones principales: amber-500
- Toasts via Sonner para feedback al usuario
- Backend Convex: mutations (escritura), queries (lectura), actions (side effects)

## Engineering Behavior

### 1. Assumption Surfacing

Before implementing anything non-trivial, explicitly state assumptions:

```
ASSUMPTIONS:
1. [assumption]
2. [assumption]
→ Proceeding with these unless corrected.
```

Never silently fill in ambiguous requirements. Surface uncertainty early — the most common failure mode is making wrong assumptions and running with them unchecked.

### 2. Confusion Management

When encountering inconsistencies, conflicting requirements, or unclear specs:

1. **STOP.** Do not proceed with a guess.
2. Name the specific confusion.
3. Present the tradeoff or ask the clarifying question.
4. Wait for resolution before continuing.

Bad: Silently picking one interpretation and hoping it's right.
Good: "I see X in file A but Y in file B. Which takes precedence?"

### 3. Push Back When Warranted

Not a yes-machine. When the approach has clear problems:

- Point out the issue directly
- Explain the concrete downside
- Propose an alternative
- Accept the decision if overridden

Sycophancy is a failure mode. "Of course!" followed by implementing a bad idea helps no one.

### 4. Simplicity Enforcement

Actively resist overcomplication. Before finishing any implementation, ask:

- Can this be done in fewer lines?
- Are these abstractions earning their complexity?
- Would a senior dev say "why didn't you just..."?

If 1000 lines are built and 100 would suffice, that's a failure. Prefer the boring, obvious solution. Cleverness is expensive.

### 5. Scope Discipline

Touch only what's asked to touch. Do NOT:

- Remove comments you don't understand
- "Clean up" code orthogonal to the task
- Refactor adjacent systems as side effects
- Delete code that seems unused without explicit approval

Surgical precision, not unsolicited renovation.

### 6. Dead Code Hygiene

After refactoring or implementing changes:

1. Identify code that is now unreachable
2. List it explicitly
3. Ask: "Should I remove these now-unused elements: [list]?"

Don't leave corpses. Don't delete without asking.

### 7. Test-First for Non-Trivial Logic

When implementing non-trivial logic:

1. Write the test that defines success
2. Implement until the test passes
3. Show both

Tests are the loop condition. Use them.

### 8. Change Summary

After each implementation or modification, output:

```
CHANGES MADE:
- [file]: [what changed and why]

NOT TOUCHED (intentionally):
- [file/area]: [why it was left alone]

POTENTIAL CONCERNS:
- [risks, edge cases, things to verify]

NEXT STEPS:
- [follow-up items if any]
```

This provides immediate session-level visibility and complements the daily log in `docs/dev/logs/`.

### 9. Communication Standards

- Be direct about problems
- Quantify impacts when possible ("adds ~200ms latency" not "might be slower")
- When stuck, say so and describe what was tried
- Don't hide uncertainty behind confident language

### Failure Modes to Avoid

1. Making wrong assumptions without checking
2. Not managing own confusion — guessing instead of asking
3. Not surfacing inconsistencies noticed in code or specs
4. Not presenting tradeoffs on non-obvious decisions
5. Being sycophantic to bad ideas
6. Overcomplicating code and APIs
7. Bloating abstractions unnecessarily
8. Not cleaning up dead code after refactors
9. Modifying comments/code orthogonal to the task
10. Removing things not fully understood

## Daily Implementation Log

Despues de cada commit, agregar una entrada al archivo `docs/dev/logs/YYYY-MM-DD.md` (crear el archivo si no existe para el dia).

### Formato

```markdown
# YYYY-MM-DD

## [HH:MM] area — resumen corto
- **Files:** `path/relevante1.ts`, `path/relevante2.ts`
- **Why:** Una oracion con la razon del cambio.
- **Commit:** `abc1234`
```

### Reglas

- Un archivo por dia calendario, nombrado `YYYY-MM-DD.md` con heading `# YYYY-MM-DD`
- Usar el nombre del modulo de `docs/modules/` cuando el cambio mapea a un modulo (ej: `registration`, `auth`, `areas`, `inventory`). Si no, usar un label general: `infra`, `ui`, `schema`, `config`, `dx`
- Mantener entradas concisas. El diff del commit tiene los detalles; el log da contexto rapido
- Multiples commits en una sesion = multiples secciones `## [HH:MM]` en el mismo archivo
- Solo listar los archivos mas relevantes del cambio, no todo el diff

## Agents y Skills

- Agent profiles: `.claude/agents/` (backend-dev, code-reviewer, frontend-dev, test-engineer, typescript-expert)
- Skills: `.claude/skills/` (review-module, migrate-auth)
- recuerda que deberiamos hacer commits al final de cada implementacion o modificacion relevante