# Alquemist — Instrucciones de Proyecto

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript strict
- **UI:** Radix UI + shadcn/ui + Tailwind CSS
- **Backend:** Convex (real-time serverless)
- **Auth:** Convex Auth (`@convex-dev/auth`) — Password provider con email OTP verification
- **Forms:** React Hook Form + Zod
- **Notificaciones:** Sonner toasts
- **Email:** Resend (OTP emails + invitaciones)

## Autenticacion (Convex Auth)

El proyecto usa **Convex Auth** con Password provider. No hay auth custom — todo pasa por `@convex-dev/auth`.

| Concepto | Implementacion |
|----------|---------------|
| Config auth | `convex/auth.ts` — `convexAuth()` con Password provider |
| Email OTP (verificacion) | `convex/ResendOTP.ts` — codigos de 6 digitos via Resend |
| Email OTP (reset password) | `convex/ResendOTPPasswordReset.ts` |
| Middleware rutas | `middleware.ts` — `convexAuthNextjsMiddleware` |
| Provider React | `ConvexAuthProvider` en `components/providers/convex-client-provider.tsx` |
| Auth en frontend | `useAuthActions()` de `@convex-dev/auth/react` → `signIn("password", { flow, ... })` |
| Auth en backend | `getAuthUserId(ctx)` de `@convex-dev/auth/server` |
| Usuario actual | `api.users.getCurrentUser` query |
| Validadores compartidos | `convex/validation.ts` (email, phone, NIT) |

### Flows de Password provider

| Flow | Uso |
|------|-----|
| `signUp` | Registro nuevo usuario |
| `signIn` | Login |
| `email-verification` | Verificar email con codigo OTP |
| `reset` | Solicitar codigo de reset password |
| `reset-verification` | Verificar codigo y cambiar password |

### Rutas publicas (no requieren auth)

`/login`, `/signup`, `/verify-email`, `/forgot-password`, `/set-password`, `/reset-password`, `/accept-invitation(.*)`, `/invitation-invalid`, `/welcome-invited`

## Estructura de Codigo

| Tipo | Path |
|------|------|
| Paginas auth | `app/(auth)/[ruta]/page.tsx` |
| Paginas dashboard | `app/(dashboard)/[ruta]/page.tsx` |
| Paginas onboarding | `app/(onboarding)/[ruta]/page.tsx` |
| Componentes | `components/[dominio]/[nombre].tsx` |
| Backend Convex | `convex/[dominio].ts` |
| Schema | `convex/schema.ts` (incluye `authTables` de Convex Auth) |
| Auth config | `convex/auth.ts`, `convex/auth.config.ts` |
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
- Skills: `.claude/skills/` (review-module)
- recuerda que deberiamos hacer commits al final de cada implementacion o modificacion relevante