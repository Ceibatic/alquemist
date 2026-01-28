# Module 02: Authentication & Session Management

## Overview

El modulo de Autenticacion maneja el inicio de sesion, validacion de sesiones, y cierre de sesion. Usa **Convex Auth** (`@convex-dev/auth`) con Password provider y cookies gestionadas automaticamente.

**Estado**: Implementado (migrado a Convex Auth enero 2026)

---

## Implementacion Tecnica

### Convex Auth Setup

| Archivo | Proposito |
|---------|-----------|
| `convex/auth.ts` | Config `convexAuth()` con Password provider |
| `convex/auth.config.ts` | Config providers |
| `convex/ResendOTP.ts` | Email verification OTP via Resend |
| `convex/ResendOTPPasswordReset.ts` | Password reset OTP via Resend |
| `middleware.ts` | `convexAuthNextjsMiddleware` — proteccion de rutas |
| `components/providers/convex-client-provider.tsx` | `ConvexAuthProvider` wrapper |

### Flows de Password provider

| Flow | Frontend call | Proposito |
|------|--------------|-----------|
| `signUp` | `signIn("password", { email, password, firstName, lastName, flow: "signUp" })` | Registro |
| `signIn` | `signIn("password", { email, password, flow: "signIn" })` | Login |
| `email-verification` | `signIn("password", { email, code, flow: "email-verification" })` | Verificar email |
| `reset` | `signIn("password", { email, flow: "reset" })` | Solicitar reset |
| `reset-verification` | `signIn("password", { email, code, newPassword, flow: "reset-verification" })` | Cambiar password |

### Auth en Backend

```typescript
import { getAuthUserId } from "@convex-dev/auth/server";

// En cualquier query/mutation:
const userId = await getAuthUserId(ctx);
```

---

## User Stories

### US-02.1: Ver formulario de login
**Como** usuario registrado
**Quiero** acceder al formulario de inicio de sesion
**Para** entrar a mi cuenta

**Criterios de Aceptacion:**
- [ ] Pagina accesible en `/login`
- [ ] Logo de Alquemist centrado arriba
- [ ] Titulo "Iniciar Sesion" o "Bienvenido de Vuelta"
- [ ] Formulario centrado con ancho maximo
- [ ] Link "No tienes cuenta? Registrate" navega a `/signup`
- [ ] Link "Olvide mi contrasena" navega a `/forgot-password`
- [ ] Fondo con gradiente verde caracteristico

**Componentes:** [login/page.tsx](app/(auth)/login/page.tsx)

---

### US-02.2: Iniciar sesion
**Como** usuario registrado
**Quiero** ingresar mis credenciales
**Para** acceder a mi cuenta

**Criterios de Aceptacion:**
- [ ] Campos: email, password
- [ ] Toggle de visibilidad de contrasena
- [ ] Boton "Iniciar Sesion" (amber-500)
- [ ] Estado de carga durante autenticacion
- [ ] Mensaje de error generico "Credenciales invalidas"
- [ ] Redirige a `/dashboard` al autenticar exitosamente
- [ ] Sesion gestionada automaticamente por Convex Auth (cookies 30 dias)

**Escribe:** `signIn("password", { email, password, flow: "signIn" })` via `useAuthActions()`

---

### US-02.3: Validar sesion activa
**Como** sistema
**Quiero** validar la sesion en cada request protegido
**Para** asegurar que solo usuarios autenticados accedan

**Criterios de Aceptacion:**
- [ ] `middleware.ts` usa `convexAuthNextjsMiddleware` para proteger rutas
- [ ] Si no autenticado, redirige a `/login`
- [ ] Si autenticado en `/login` o `/signup`, redirige a `/dashboard`
- [ ] Rutas publicas: `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/set-password`, `/reset-password`, `/accept-invitation(.*)`, `/invitation-invalid`, `/welcome-invited`
- [ ] Cookies gestionadas automaticamente (30 dias)

**Componentes:** [middleware.ts](middleware.ts)

---

### US-02.4: Cerrar sesion
**Como** usuario autenticado
**Quiero** cerrar mi sesion
**Para** salir de mi cuenta de forma segura

**Criterios de Aceptacion:**
- [ ] Opcion "Cerrar Sesion" en menu de usuario
- [ ] Llama `signOut()` de `useAuthActions()`
- [ ] Convex Auth invalida sesion y limpia cookies
- [ ] Redirige a `/login`

---

### US-02.5: Redireccion automatica por estado
**Como** sistema
**Quiero** redirigir usuarios segun su estado de onboarding
**Para** guiarlos al paso correcto

**Criterios de Aceptacion:**
- [ ] Usuario sin empresa → redirige a `/company-setup`
- [ ] Usuario con empresa sin facility → redirige a `/facility-setup`
- [ ] Usuario completo → redirige a `/dashboard`

**Consulta:** `users.getOnboardingStatus` (usa `getAuthUserId(ctx)` internamente)

---

### US-02.6: Recordar sesion
**Como** usuario frecuente
**Quiero** que mi sesion se mantenga activa
**Para** no tener que iniciar sesion cada vez

**Criterios de Aceptacion:**
- [ ] Sesion dura 30 dias (configurado en `middleware.ts` cookieConfig)
- [ ] Gestionada automaticamente por Convex Auth

---

### US-02.7: Password reset
**Como** usuario
**Quiero** recuperar mi contrasena
**Para** acceder a mi cuenta si la olvide

**Criterios de Aceptacion:**
- [ ] `/forgot-password`: ingresa email → recibe OTP de 6 digitos via Resend
- [ ] `/reset-password`: ingresa codigo OTP + nueva contrasena
- [ ] Usa `signIn("password", { email, flow: "reset" })` y luego `signIn("password", { email, code, newPassword, flow: "reset-verification" })`

---

## Schema

> Convex Auth gestiona sesiones y auth accounts internamente via `authTables` en `convex/schema.ts`. No hay tabla `sessions` custom.

### Tablas de Convex Auth (automaticas)
- `authAccounts` — cuentas de auth (email/password)
- `authSessions` — sesiones activas
- `authRefreshTokens` — tokens de refresh
- `authVerificationCodes` — codigos OTP
- `authVerifiers` — verificadores
- `authRateLimits` — rate limiting

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M01-Registration | Previo | Signup crea auth account via Convex Auth |
| M03-Company | Siguiente | Redirige si no tiene empresa |
| M04-Facility | Siguiente | Redirige si no tiene facility |
| Dashboard | Destino | Redirige tras login exitoso completo |

---

## API Backend

> Auth es manejado por Convex Auth built-in. No hay mutations custom de login/logout.

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `users.getCurrentUser` | (auth context) | User completo con role/company |
| `users.getOnboardingStatus` | (auth context) | `{ hasCompany, onboardingCompleted }` |

### Mutations
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `users.completeOnboarding` | (auth context) | void |

---

## Seguridad

- Passwords hasheados por Convex Auth (bcrypt internamente)
- Sesiones gestionadas con cookies HTTP-only automaticas
- OTP de 6 digitos para verificacion y reset (via Resend)
- Middleware Next.js protege todas las rutas no-publicas
- Rate limiting integrado en Convex Auth
