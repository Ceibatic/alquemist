# Migración Auth: @convex-dev/auth → Clerk

**Fecha:** 2026-02-03
**Estado:** En desarrollo (sin usuarios existentes)
**UI:** Mantener páginas custom (hooks de Clerk, no componentes pre-built)

---

## 1. Por qué migrar

`@convex-dev/auth` tiene un problema persistente donde `signIn()` resuelve sin error pero las cookies de sesión no se setean en el middleware de Next.js. Después de configurar `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`, `RESEND_API_KEY`, limpiar datos huérfanos, y verificar que el code path en la librería crea sesiones correctamente — el usuario sigue siendo redirigido a `/login` después de login y verificación de email.

---

## 2. Inventario de integración actual

| Categoría | Alcance |
|-----------|---------|
| Backend `getAuthUserId` | 12 archivos, ~78 llamadas |
| Frontend `useAuthActions` | 5 páginas auth |
| Middleware | `convexAuthNextjsMiddleware` |
| Schema | `authTables` spread + 6 campos auth en `users` |
| Provider | `ConvexAuthProvider` en 4 layouts |
| OTP email | `ResendOTP.ts`, `ResendOTPPasswordReset.ts` |
| Invitaciones | `invitations.ts` crea usuarios directamente |

### Archivos backend con getAuthUserId

| Archivo | Llamadas |
|---------|----------|
| `convex/users.ts` | 7 |
| `convex/facilities.ts` | 11 |
| `convex/plants.ts` | 12 |
| `convex/cultivars.ts` | 10 |
| `convex/batches.ts` | 8 |
| `convex/suppliers.ts` | 7 |
| `convex/companies.ts` | 5 |
| `convex/products.ts` | 4 |
| `convex/home.ts` | 4 |
| `convex/roles.ts` | 1 |
| `convex/registration.ts` | 1 |

### Páginas frontend auth

| Página | Flujo actual |
|--------|-------------|
| `/login` | `signIn('password', { flow: 'signIn' })` |
| `/signup` | `signIn('password', { flow: 'signUp' })` |
| `/verify-email` | `signIn('password', { flow: 'email-verification' })` |
| `/forgot-password` | `signIn('password', { flow: 'reset' })` |
| `/reset-password` | `signIn('password', { flow: 'reset-verification' })` |

---

## 3. Cambio arquitectónico clave

Con `@convex-dev/auth`: `getAuthUserId(ctx)` → devuelve `Id<"users">` directamente.

Con Clerk: `ctx.auth.getUserIdentity()` → devuelve JWT claims `{ subject, email, ... }`. Necesitas buscar el user en tu tabla por `clerkId`.

**Solución:** Crear un helper que mantiene el mismo tipo de retorno:

```typescript
// convex/authHelpers.ts
export async function getAuthenticatedUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}
```

Esto hace que las 78 llamadas sean un cambio mecánico de import + nombre de función.

---

## 4. Plan de implementación

### Fase 0: Setup Clerk

1. Crear cuenta en [clerk.com](https://clerk.com) y crear una aplicación
2. En Clerk Dashboard:
   - Habilitar email/password authentication
   - Configurar requisitos de password (8+ chars, mayúscula, minúscula, número, especial)
   - Habilitar email verification (built-in)
   - Configurar localization → español
   - Ir a JWT Templates → crear template `convex` con claims default
3. Guardar las keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `.env.local`
   - `CLERK_SECRET_KEY` → `.env.local`
   - `CLERK_JWT_ISSUER_DOMAIN` → Convex env var (`npx convex env set`)
   - `CLERK_WEBHOOK_SECRET` → Convex env var

### Fase 1: Backend — Auth Helper + Schema

**Crear `convex/authHelpers.ts`:**
```typescript
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getAuthenticatedUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}
```

**Modificar `convex/schema.ts`:**
- Eliminar `...authTables`
- Agregar a `users`:
  ```typescript
  clerkId: v.optional(v.string()),
  ```
- Agregar index:
  ```typescript
  .index("by_clerk_id", ["clerkId"])
  ```
- Eliminar campos Convex Auth: `emailVerificationTime`, `isAnonymous`, `phoneVerificationTime`, `image`
- Mantener: `email`, `email_verified`, `name`, `phone` (ahora son nuestros, no de Convex Auth)

**Modificar `convex/auth.config.ts`:**
```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

### Fase 2: Backend — Webhook para sync usuarios

**Crear `convex/http.ts`** (o actualizar si existe):
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify webhook signature with svix
    // Handle user.created, user.updated, user.deleted
    // Create/update/delete user in Convex users table
  }),
});

export default http;
```

**Crear `convex/clerkSync.ts`** con internal mutations:
- `createUserFromClerk({ clerkId, email, firstName, lastName })` → insert users
- `updateUserFromClerk({ clerkId, email, firstName, lastName })` → patch users
- `deleteUserFromClerk({ clerkId })` → delete user (soft or hard)

### Fase 3: Backend — Migrar 12 archivos

Cambio mecánico en cada archivo:

```typescript
// ANTES
import { getAuthUserId } from "@convex-dev/auth/server";
const userId = await getAuthUserId(ctx);

// DESPUÉS
import { getAuthenticatedUserId } from "./authHelpers";
const userId = await getAuthenticatedUserId(ctx);
```

**Orden recomendado:**
1. `convex/users.ts` (crítico — incluye `getCurrentUser`)
2. `convex/registration.ts`
3. `convex/companies.ts`
4. `convex/facilities.ts`
5. `convex/roles.ts`
6. `convex/home.ts`
7. `convex/batches.ts`
8. `convex/plants.ts`
9. `convex/cultivars.ts`
10. `convex/suppliers.ts`
11. `convex/products.ts`
12. `convex/invitations.ts`

### Fase 4: Frontend — Provider + Middleware

**Instalar/desinstalar:**
```bash
npm install @clerk/nextjs svix
npm uninstall @convex-dev/auth @auth/core
```

**`components/providers/convex-client-provider.tsx`:**
```typescript
'use client';
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

**`middleware.ts`:**
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/signup(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/accept-invitation(.*)",
  "/invitation-invalid",
  "/welcome-invited",
  "/terms",
  "/privacy",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Fase 5: Frontend — Reescribir páginas auth (UI custom)

Usar hooks de Clerk manteniendo el diseño existente.

**`/login` → usar `useSignIn()` de `@clerk/nextjs`:**
```typescript
import { useSignIn } from "@clerk/nextjs";
const { signIn, setActive, isLoaded } = useSignIn();

// En onSubmit:
const result = await signIn.create({
  identifier: data.email,
  password: data.password,
});
if (result.status === "complete") {
  await setActive({ session: result.createdSessionId });
  window.location.href = '/dashboard';
}
```

**`/signup` → usar `useSignUp()`:**
```typescript
import { useSignUp } from "@clerk/nextjs";
const { signUp, setActive, isLoaded } = useSignUp();

// En onSubmit:
await signUp.create({
  emailAddress: data.email,
  password: data.password,
  firstName: data.firstName,
  lastName: data.lastName,
});
// Enviar verificación:
await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
router.push('/verify-email');
```

**`/verify-email` → verificar con Clerk:**
```typescript
const result = await signUp.attemptEmailAddressVerification({ code });
if (result.status === "complete") {
  await setActive({ session: result.createdSessionId });
  window.location.href = '/company-setup';
}
```

**`/forgot-password` → usar `useSignIn()` con reset:**
```typescript
await signIn.create({
  strategy: "reset_password_email_code",
  identifier: email,
});
// Clerk envía el código automáticamente
```

**`/reset-password` → verificar y cambiar:**
```typescript
const result = await signIn.attemptFirstFactor({
  strategy: "reset_password_email_code",
  code: code,
});
if (result.status === "needs_new_password") {
  await signIn.resetPassword({ password: newPassword });
}
```

**Eliminar `/verify-email` como ruta pública** en middleware (ya no es necesaria si Clerk maneja verificación inline, pero mantenemos la página custom).

### Fase 6: Eliminar archivos obsoletos

- `convex/auth.ts` → eliminar
- `convex/ResendOTP.ts` → eliminar
- `convex/ResendOTPPasswordReset.ts` → eliminar
- `convex/otpUtils.ts` → eliminar (si existe)

### Fase 7: Rediseño invitaciones

**Nuevo flujo:**
1. Owner crea invitación → token generado (sin cambio)
2. Invitado ve detalles → acepta
3. Redirect a `/signup` con email pre-filled via query param
4. Clerk maneja signup + verificación
5. Webhook `user.created` detecta invitación pendiente por email → vincula company/role/facilities
6. Redirect a dashboard

### Fase 8: Testing completo

- [ ] Signup nuevo → recibe código → verifica → company-setup → facility → dashboard
- [ ] Login → sesión persiste → refresh mantiene sesión
- [ ] Password reset → código → nueva password → login exitoso
- [ ] Logout → redirige a login → rutas protegidas inaccesibles
- [ ] Invitación → signup → vinculación automática a company
- [ ] Dashboard guard → usuario sin company redirige a onboarding
- [ ] Todas las mutations/queries backend autentican correctamente

---

## 5. Archivos críticos

| Archivo | Acción |
|---------|--------|
| `convex/authHelpers.ts` | **CREAR** — helper getAuthenticatedUserId |
| `convex/schema.ts` | MODIFICAR — quitar authTables, agregar clerkId |
| `convex/auth.config.ts` | MODIFICAR — dominio Clerk |
| `convex/http.ts` | **CREAR** — webhook endpoint |
| `convex/clerkSync.ts` | **CREAR** — mutations para sync usuarios |
| `components/providers/convex-client-provider.tsx` | MODIFICAR — ClerkProvider + ConvexProviderWithClerk |
| `middleware.ts` | REESCRIBIR — clerkMiddleware |
| `app/(auth)/login/page.tsx` | MODIFICAR — useSignIn() |
| `app/(auth)/signup/page.tsx` | MODIFICAR — useSignUp() |
| `app/(auth)/verify-email/page.tsx` | MODIFICAR — attemptEmailAddressVerification |
| `app/(auth)/forgot-password/page.tsx` | MODIFICAR — reset_password_email_code |
| `app/(auth)/reset-password/page.tsx` | MODIFICAR — resetPassword() |
| `convex/users.ts` + 11 más | MODIFICAR — import change |
| `convex/auth.ts` | **ELIMINAR** |
| `convex/ResendOTP.ts` | **ELIMINAR** |
| `convex/ResendOTPPasswordReset.ts` | **ELIMINAR** |

---

## 6. Costo Clerk

| Plan | Precio | Incluye |
|------|--------|---------|
| Free | $0 | 10,000 MAU, email/password, verificación, JWT, webhooks, español |
| Pro | $25/mo | Custom emails (Resend), custom domain, sin branding |

**Recomendación:** Free plan es suficiente para desarrollo y primeros usuarios.
