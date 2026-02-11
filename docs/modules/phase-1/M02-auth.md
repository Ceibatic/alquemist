# Module 02: Authentication & Session Management

## Overview

El modulo de Autenticacion maneja el inicio de sesion, validacion de sesiones, y cierre de sesion. Usa **Clerk** (`@clerk/nextjs`) con integracion oficial a Convex via JWT template.

**Estado**: Implementado (migrado a Clerk febrero 2026)

---

## Implementacion Tecnica

### Clerk + Convex Setup

| Archivo | Proposito |
|---------|-----------|
| `convex/auth.config.ts` | Config Clerk JWT issuer domain para validacion de tokens |
| `convex/authHelpers.ts` | Helper `getAuthenticatedUserId(ctx)` para lookup de usuario por `clerkId` |
| `middleware.ts` | `clerkMiddleware()` de `@clerk/nextjs/server` — proteccion de rutas |
| `components/providers/convex-client-provider.tsx` | `ClerkProvider` + `ConvexProviderWithClerk` wrapper |
| `app/(auth)/*/page.tsx` | Custom UI para auth (no Clerk pre-built components) |

### Variables de Entorno

**Next.js (`.env.local`):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `CLERK_JWT_ISSUER_DOMAIN` — JWT issuer URL del template
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` — `/login`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` — `/signup`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` — `/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` — `/verify-email`

**Convex (backend):**
- `CLERK_JWT_ISSUER_DOMAIN` — Mismo issuer URL para validar tokens

### Flows de Auth con Clerk

| Flow | Frontend hook/call | Proposito |
|------|-------------------|-----------|
| `signUp` | `useSignUp().signUp.create()` + `prepareEmailAddressVerification()` | Registro + envio de OTP |
| `signIn` | `useSignIn().signIn.create()` + `setActive()` | Login |
| `email-verification` | `signUp.attemptEmailAddressVerification()` | Verificar email con codigo OTP |
| `password-reset` | Flujos gestionados por Clerk (custom UI) | Reset de password |
| `signOut` | `useClerk().signOut()` | Cerrar sesion |

### Auth en Backend

```typescript
import { getAuthenticatedUserId } from "./authHelpers";

// En cualquier query/mutation:
const userId = await getAuthenticatedUserId(ctx);
// Retorna Id<"users"> | null

// Implementacion (authHelpers.ts):
// 1. Obtener identity JWT: ctx.auth.getUserIdentity()
// 2. Lookup usuario por clerkId: identity.subject
// 3. Retornar user._id de Convex
```

---

## User Stories

### US-02.1: Ver formulario de login
**Como** usuario registrado
**Quiero** acceder al formulario de inicio de sesion
**Para** entrar a mi cuenta

**Criterios de Aceptacion:**
- [x] Pagina accesible en `/login`
- [x] Logo de Alquemist centrado arriba
- [x] Titulo "Iniciar Sesion"
- [x] Formulario centrado con ancho maximo
- [x] Link "No tienes cuenta? Registrate" navega a `/signup`
- [x] Link "Olvide mi contrasena" navega a `/forgot-password`
- [x] Fondo con gradiente caracteristico

**Componentes:** [app/(auth)/login/page.tsx](../../../app/(auth)/login/page.tsx)

---

### US-02.2: Iniciar sesion
**Como** usuario registrado
**Quiero** ingresar mis credenciales
**Para** acceder a mi cuenta

**Criterios de Aceptacion:**
- [x] Campos: email, password
- [x] Toggle de visibilidad de contrasena (componente `PasswordInput`)
- [x] Boton "Iniciar Sesion" (primary button)
- [x] Estado de carga durante autenticacion ("Iniciando sesión...")
- [x] Mensaje de error via `getClerkErrorMessage()` helper
- [x] Redirige a `/dashboard` al autenticar exitosamente (via `window.location.href`)
- [x] Sesion gestionada automaticamente por Clerk (cookies seguras)

**Implementacion:**
```tsx
const { signIn, setActive } = useSignIn();
const result = await signIn.create({
  identifier: email,
  password: password,
});
if (result.status === 'complete') {
  await setActive({ session: result.createdSessionId });
  window.location.href = '/dashboard';
}
```

---

### US-02.3: Validar sesion activa
**Como** sistema
**Quiero** validar la sesion en cada request protegido
**Para** asegurar que solo usuarios autenticados accedan

**Criterios de Aceptacion:**
- [x] `middleware.ts` usa `clerkMiddleware()` para proteger rutas
- [x] Si no autenticado en ruta protegida, Clerk redirige a `/login`
- [x] Si autenticado en `/login` o `/signup`, redirige segun estado de onboarding (implementado en FEAT-2026-02-auth-auto-redirect)
- [x] Rutas publicas definidas en `isPublicRoute` matcher:
  - `/login(.*)`, `/signup(.*)`, `/verify-email(.*)`
  - `/forgot-password(.*)`, `/set-password(.*)`, `/reset-password(.*)`
  - `/accept-invitation(.*)`, `/invitation-invalid`, `/welcome-invited`
  - `/terms`, `/privacy`
- [x] Cookies HTTP-only gestionadas por Clerk

**Componentes:** [middleware.ts](../../../middleware.ts)

---

### US-02.4: Cerrar sesion
**Como** usuario autenticado
**Quiero** cerrar mi sesion
**Para** salir de mi cuenta de forma segura

**Criterios de Aceptacion:**
- [x] Opcion "Cerrar Sesion" en dropdown del header (icono LogOut)
- [x] Llama `signOut({ redirectUrl: '/login' })` de `useClerk()`
- [x] Clerk invalida sesion y limpia cookies automaticamente
- [x] Redirige a `/login` tras logout

**Implementacion:**
```tsx
const { signOut } = useClerk();
await signOut({ redirectUrl: '/login' });
```

**Componentes:** [components/layout/header.tsx](../../../components/layout/header.tsx)

---

### US-02.5: Redireccion automatica por estado de onboarding
**Como** sistema
**Quiero** redirigir usuarios segun su estado de onboarding
**Para** guiarlos al paso correcto

**Criterios de Aceptacion:**
- [x] Usuario sin empresa (`!user.companyId`) → redirige a `/company-setup`
- [x] Usuario con empresa sin onboarding completo → redirige a `/facility-basic`
- [x] Usuario completo (`onboardingCompleted === true`) → muestra dashboard
- [x] Redirecciones en `DashboardLayoutClient` via `useEffect` + `router.replace()`

**Consulta:** `api.users.getCurrentUser` (retorna objeto con `companyId` y `onboardingCompleted`)

**Componentes:** [app/(dashboard)/dashboard-layout-client.tsx](../../../app/(dashboard)/dashboard-layout-client.tsx)

---

### US-02.6: Recordar sesion
**Como** usuario frecuente
**Quiero** que mi sesion se mantenga activa
**Para** no tener que iniciar sesion cada vez

**Criterios de Aceptacion:**
- [x] Sesion gestionada por Clerk con tokens JWT
- [x] Cookies seguras (HTTP-only, SameSite, Secure en produccion)
- [x] Duracion configurada en Clerk dashboard (default: 7 dias activos + 30 dias inactivos)

---

### US-02.7: Password reset
**Como** usuario
**Quiero** recuperar mi contrasena
**Para** acceder a mi cuenta si la olvide

**Criterios de Aceptacion:**
- [x] `/forgot-password`: formulario para ingresar email
- [x] Clerk envia email con codigo o link de reset (gestionado por Clerk)
- [x] `/reset-password`: formulario para ingresar nueva contrasena
- [x] Usa flujos de Clerk para password reset (custom UI)
- [x] Redirige a `/login` tras reset exitoso con toast de confirmacion

**Componentes:**
- [app/(auth)/forgot-password/page.tsx](../../../app/(auth)/forgot-password/page.tsx)
- [app/(auth)/reset-password/page.tsx](../../../app/(auth)/reset-password/page.tsx)

---

### US-02.8: Sincronizacion de usuarios Clerk ↔ Convex
**Como** sistema
**Quiero** sincronizar usuarios de Clerk a Convex
**Para** mantener consistencia entre auth y datos de negocio

**Criterios de Aceptacion:**
- [x] Webhook de Clerk recibe eventos `user.created`, `user.updated`, `user.deleted`
- [x] HTTP endpoint en Convex procesa webhooks y actualiza tabla `users`
- [x] Campo `clerkId` en users almacena Clerk subject (user ID)
- [x] Index `by_clerk_id` permite lookup rapido
- [x] `ensureUserExists` mutation maneja race conditions webhook vs primer login

**Backend:** `convex/clerkSync.ts` (HTTP endpoints para webhooks)

---

## Schema

### Tabla `users`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `clerkId` | `v.optional(v.string())` | Clerk user ID (subject del JWT) |
| `email` | `v.optional(v.string())` | Email sincronizado desde Clerk |
| `email_verified` | `v.optional(v.boolean())` | Estado de verificacion (de Clerk) |
| `first_name` | `v.optional(v.string())` | Nombre del usuario |
| `last_name` | `v.optional(v.string())` | Apellido del usuario |
| `company_id` | `v.optional(v.id("companies"))` | Empresa del usuario (null durante onboarding) |
| `onboarding_completed` | `v.optional(v.boolean())` | Flag de onboarding completo |
| ... | ... | Otros campos de usuario |

**Indexes relevantes:**
- `by_clerk_id`: Lookup rapido por Clerk ID
- `by_company`: Usuarios de una empresa
- `email`: Lookup por email

> **Nota:** Clerk gestiona sus propias tablas de sesiones internamente. Convex solo almacena la referencia `clerkId` para vincular usuarios.

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M01-Registration | Previo | Signup crea usuario en Clerk y sincroniza a Convex via webhook |
| M03-Company | Siguiente | Dashboard redirige a company-setup si `!user.companyId` |
| M04-Facility | Siguiente | Dashboard redirige a facility-basic si `!user.onboardingCompleted` |
| M18-Invitations | Relacionado | Invitaciones vinculan usuarios existentes a nuevas empresas |
| Dashboard | Destino | Redirige tras login exitoso y onboarding completo |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `users.getCurrentUser` | (auth context via Clerk JWT) | User completo con role/company o `null` |
| `users.getOnboardingStatus` | (auth context via Clerk JWT) | `{ hasCompany, onboardingCompleted, userId, email }` o `null` |

### Mutations
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `users.completeOnboarding` | (auth context via Clerk JWT) | `{ success: true }` |
| `clerkSync.ensureUserExists` | (auth context via Clerk JWT) | Crea usuario en Convex si no existe (maneja race conditions) |

### HTTP Endpoints (webhooks)
| Endpoint | Proposito |
|----------|-----------|
| `clerkSync.handleWebhook` | Recibe eventos de Clerk (`user.created`, `user.updated`, `user.deleted`) |

---

## Seguridad

- **Passwords:** Gestionados completamente por Clerk (bcrypt con salt rounds altos)
- **Sesiones:** Tokens JWT firmados por Clerk, validados en Convex via `CLERK_JWT_ISSUER_DOMAIN`
- **Cookies:** HTTP-only, Secure (HTTPS), SameSite=Lax configuradas por Clerk
- **Webhook verification:** Webhooks de Clerk verificados con firma SVIX
- **Rate limiting:** Integrado en Clerk (limite de intentos de login, etc.)
- **Email verification:** Obligatoria via OTP de 6 digitos (Clerk + Resend)
- **2FA:** Disponible en Clerk (no implementado en MVP actual)

---

## Migracion desde Convex Auth

> El proyecto fue migrado desde `@convex-dev/auth` a Clerk en febrero 2026. Plan completo en `docs/dev/clerk-migration-plan.md`.

**Cambios principales:**
- Auth provider: `@convex-dev/auth` → `@clerk/nextjs`
- Auth en backend: `getAuthUserId(ctx)` → `getAuthenticatedUserId(ctx)` (lookup por `clerkId`)
- Schema: Tablas `authAccounts`, `authSessions` (eliminadas) → campo `clerkId` en `users`
- Frontend: `useAuthActions()` → `useSignIn()`, `useSignUp()`, `useAuth()`, `useClerk()`
- Email OTP: Resend custom → Clerk built-in (via Resend)
