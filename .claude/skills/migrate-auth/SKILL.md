---
name: migrate-auth
description: >
  Migrar el sistema de autenticacion de @convex-dev/auth a Clerk en el proyecto
  Alquemist. Ejecuta la migracion por fases segun el plan en
  docs/dev/clerk-migration-plan.md. Tambien puede ejecutar fases individuales
  si el usuario lo solicita (ej: "ejecuta fase 3"). Usar cuando el usuario
  pida migrar auth, implementar Clerk, o continuar la migracion de autenticacion.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, WebSearch, WebFetch
---

# Migrate Auth: @convex-dev/auth → Clerk

Migrar el sistema de autenticacion del proyecto Alquemist de `@convex-dev/auth` a **Clerk**, manteniendo las paginas de UI custom.

## Instrucciones Criticas

### Uso obligatorio de subagentes

Debes usar subagentes (Task tool) activamente en cada fase:

1. **Antes de cada fase:** Lanza un subagente `Explore` para verificar el estado actual de los archivos que vas a modificar. No asumas que el codigo esta igual que en el plan — siempre lee primero.

2. **Durante cada fase:** Si la fase modifica mas de 3 archivos, usa subagentes paralelos para implementar cambios independientes simultaneamente.

3. **Despues de cada fase:** Lanza un subagente `code-reviewer` para revisar TODOS los cambios de la fase. El reviewer debe verificar:
   - No hay imports rotos
   - No hay tipos incorrectos
   - No hay regresiones en funcionalidad existente
   - Los patrones son consistentes con el resto del codebase

4. **Build check obligatorio:** Despues de cada fase, ejecuta `npm run build` y corrige TODOS los errores antes de avanzar a la siguiente fase.

### Uso de TodoWrite

Mantener un todo list activo que refleje las fases y sub-tareas. Marcar items completados inmediatamente al terminar.

## Plan de referencia

Leer el plan completo en: `docs/dev/clerk-migration-plan.md`

## Proceso de ejecucion

### Pre-requisito

Antes de empezar, verificar con el usuario:
1. ¿Ya creo la cuenta de Clerk y tiene las API keys?
2. ¿Ya configuro el JWT template `convex` en Clerk Dashboard?
3. ¿Ya configuro las env vars en `.env.local` y Convex?

Si no, guiar al usuario paso a paso para completar el setup de Clerk Dashboard.

### Fase 0: Setup y validacion de env vars

1. Verificar que `.env.local` tiene:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
2. Verificar que Convex tiene:
   - `CLERK_JWT_ISSUER_DOMAIN` (via `npx convex env list`)
3. Si falta algo, instruir al usuario.

### Fase 1: Backend — Auth Helper + Schema

**Subagente Explore:** Leer `convex/schema.ts` y verificar estado actual de `authTables` y campos `users`.

**Implementar:**
1. Crear `convex/authHelpers.ts` con `getAuthenticatedUserId`
2. Modificar `convex/schema.ts`:
   - Eliminar `...authTables`
   - Agregar `clerkId` + index `by_clerk_id`
   - Eliminar campos: `emailVerificationTime`, `isAnonymous`, `phoneVerificationTime`, `image`
3. Modificar `convex/auth.config.ts` → dominio Clerk

**Subagente code-reviewer:** Revisar cambios de schema y helper.
**Build check:** `npm run build`

### Fase 2: Backend — Webhook sync usuarios

**Subagente Explore:** Verificar si `convex/http.ts` ya existe.

**Implementar:**
1. Instalar `svix` si no esta: `npm install svix`
2. Crear `convex/clerkSync.ts` con mutations internas
3. Crear/actualizar `convex/http.ts` con endpoint `/clerk-webhook`

**Subagente code-reviewer:** Revisar webhook handler y mutations.
**Build check:** `npm run build`

### Fase 3: Backend — Migrar 12 archivos (getAuthUserId → getAuthenticatedUserId)

**Subagente Explore:** Buscar TODAS las ocurrencias de `getAuthUserId` en `convex/`.

**Implementar:** Cambio mecanico en cada archivo:
- Cambiar import de `@convex-dev/auth/server` a `./authHelpers`
- Cambiar `getAuthUserId` a `getAuthenticatedUserId`

**IMPORTANTE:** Usar subagentes paralelos para archivos independientes. Agrupar en lotes de 3-4 archivos.

**Subagente code-reviewer:** Revisar que TODOS los imports esten correctos y no quede ninguna referencia a `@convex-dev/auth/server`.
**Build check:** `npm run build`

### Fase 4: Frontend — Provider + Middleware

**Subagente Explore:** Leer provider actual y middleware actual.

**Implementar:**
1. `npm install @clerk/nextjs` + `npm uninstall @convex-dev/auth @auth/core`
2. Reescribir `components/providers/convex-client-provider.tsx`
3. Reescribir `middleware.ts`
4. Actualizar `.env.local` si necesario

**Subagente code-reviewer:** Verificar provider chain y middleware routes.
**Build check:** `npm run build`

### Fase 5: Frontend — Reescribir paginas auth (UI custom con hooks Clerk)

**Subagente Explore:** Leer las 5 paginas auth actuales para entender la UI existente.

**Implementar (mantener UI, cambiar logica):**
1. `/login` → `useSignIn()` de Clerk
2. `/signup` → `useSignUp()` de Clerk
3. `/verify-email` → `attemptEmailAddressVerification`
4. `/forgot-password` → `reset_password_email_code`
5. `/reset-password` → `resetPassword()`

**CRITICO:** Mantener TODA la UI existente (forms, inputs, layouts, estilos). Solo cambiar los handlers de submit y el state management de auth.

**Subagente code-reviewer:** Verificar que la UI no cambio y que los flows de Clerk estan correctos.
**Build check:** `npm run build`

### Fase 6: Cleanup — Eliminar archivos obsoletos

1. Eliminar `convex/auth.ts`
2. Eliminar `convex/ResendOTP.ts`
3. Eliminar `convex/ResendOTPPasswordReset.ts`
4. Eliminar `convex/otpUtils.ts` (si existe)
5. Verificar que no queden imports rotos

**Build check:** `npm run build`

### Fase 7: Invitaciones

**Subagente Explore:** Leer `convex/invitations.ts` y paginas de invitacion.

**Implementar:** Adaptar flujo de invitaciones para Clerk signup.

**Subagente code-reviewer:** Revisar flujo completo de invitaciones.
**Build check:** `npm run build`

### Fase 8: Testing integral

Ejecutar checklist de testing:
- [ ] Signup nuevo usuario
- [ ] Verificacion email
- [ ] Login
- [ ] Redirect segun onboarding state
- [ ] Company setup
- [ ] Password reset
- [ ] Logout
- [ ] Rutas protegidas

## Ejecucion parcial

Si el usuario pide ejecutar solo una fase especifica (ej: "ejecuta fase 3"), ejecutar SOLO esa fase pero siempre:
1. Verificar pre-condiciones (fases anteriores completadas)
2. Usar subagente Explore antes
3. Implementar
4. Usar subagente code-reviewer despues
5. Build check

## Daily Log

Despues de completar cada fase, agregar entrada al log diario en `docs/dev/logs/YYYY-MM-DD.md` siguiendo el formato del proyecto.
