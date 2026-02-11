# Estructura del Proyecto Alquemist

## Stack
- Frontend: Next.js 15 + React 19 + TypeScript
- UI: Radix UI + shadcn/ui + Tailwind CSS
- Backend: Convex (real-time serverless)
- Forms: React Hook Form + Zod
- Notificaciones: Sonner toasts

## Rutas de codigo

| Tipo | Path | Ejemplo |
|------|------|---------|
| Paginas auth | `app/(auth)/[ruta]/page.tsx` | `app/(auth)/signup/page.tsx` |
| Paginas dashboard | `app/(dashboard)/[ruta]/page.tsx` | `app/(dashboard)/areas/page.tsx` |
| Paginas onboarding | `app/(onboarding)/[ruta]/page.tsx` | `app/(onboarding)/company-setup/page.tsx` |
| Server actions | `app/(auth)/[ruta]/actions.ts` | `app/(auth)/signup/actions.ts` |
| Componentes | `components/[dominio]/[nombre].tsx` | `components/auth/signup-form.tsx` |
| Backend Convex | `convex/[dominio].ts` | `convex/registration.ts` |
| Schema | `convex/schema.ts` | - |
| Hooks | `hooks/[nombre].ts` | `hooks/use-auth.ts` |

## Documentacion de modulos

| Fase | Path |
|------|------|
| Phase 1 (onboarding) | `docs/modules/phase-1/M01-M07` |
| Phase 2 (gestion) | `docs/modules/phase-2/M05,M08,M15-M21` |
| Phase 3 (templates) | `docs/modules/phase-3/M22-M23` |
| Phase 4 (produccion) | `docs/modules/phase-4/M24-M26` |

## Convenciones

- Formularios usan React Hook Form + Zod schema
- Botones principales: amber-500
- Toasts via Sonner para feedback
- Backend Convex: mutations para escritura, queries para lectura
- Validacion dual: Zod en frontend + validacion en Convex mutations
