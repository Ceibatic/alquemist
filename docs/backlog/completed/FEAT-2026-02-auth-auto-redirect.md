# FEAT-2026-02-auth-auto-redirect

## Metadata
- **Creado:** 2026-02-11
- **Prioridad:** medium
- **Modulo relacionado:** M02-auth
- **Tipo:** enhancement

## Descripcion

Actualmente, las páginas de autenticación (`/login`, `/signup`, `/accept-invitation`, etc.) son accesibles incluso cuando el usuario ya está autenticado. Esto genera confusión y una experiencia subóptima, ya que un usuario logueado podría ver el formulario de login sin sentido.

Esta feature implementa un sistema de auto-redirección inteligente que detecta usuarios autenticados en páginas de auth y los redirige automáticamente al lugar correcto según su estado de onboarding: `/company-setup` si no tienen empresa, `/facility-basic` si no completaron onboarding, o `/dashboard` si todo está completo.

## User Stories

### US-ARD.1: Redirigir desde /login si ya autenticado

**Como** usuario ya autenticado
**quiero** ser redirigido automáticamente al lugar correcto
**para** no ver páginas de login innecesarias

#### Criterios de Aceptacion
- [x] Al cargar `/login`, verificar estado de autenticación con Clerk (`useAuth().isSignedIn`)
- [x] Si autenticado, consultar estado de usuario con `api.users.getOnboardingStatus`
- [x] Si `!hasCompany`, redirigir a `/company-setup`
- [x] Si `hasCompany && !onboardingCompleted`, redirigir a `/facility-basic`
- [x] Si `onboardingCompleted`, redirigir a `/dashboard`
- [x] Si no autenticado, mostrar el formulario de login normalmente
- [x] Durante la verificación, mostrar un loader centrado con mensaje "Verificando sesión..."

#### Backend
- Query: `api.users.getOnboardingStatus` (ya existe)
- No requiere cambios de schema

#### Frontend
- Página: [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx)
- Estados UI: checking (verificando), redirecting (redirigiendo), authenticated (mostrar form)
- Hook: `useAuth()` de `@clerk/nextjs`

#### Dependencias
- Relacionado: M02-auth

---

### US-ARD.2: Redirigir desde /signup si ya autenticado

**Como** usuario ya autenticado
**quiero** ser redirigido automáticamente al lugar correcto
**para** no ver páginas de registro innecesarias

#### Criterios de Aceptacion
- [x] Al cargar `/signup`, verificar estado de autenticación con Clerk (`useAuth().isSignedIn`)
- [x] Si autenticado, consultar estado de usuario con `api.users.getOnboardingStatus`
- [x] Aplicar la misma lógica de redirección que US-ARD.1
- [x] Si no autenticado, mostrar el formulario de registro normalmente
- [x] Durante la verificación, mostrar un loader centrado con mensaje "Verificando sesión..."

#### Backend
- Query: `api.users.getOnboardingStatus` (ya existe)

#### Frontend
- Página: [app/(auth)/signup/page.tsx](app/(auth)/signup/page.tsx)
- Estados UI: checking, redirecting, authenticated
- Hook: `useAuth()` de `@clerk/nextjs`

#### Dependencias
- Relacionado: US-ARD.1 (misma lógica de redirección)

---

### US-ARD.3: Redirigir desde páginas de invitación si ya autenticado

**Como** usuario ya autenticado en una empresa
**quiero** ser redirigido al dashboard si intento aceptar una nueva invitación
**para** evitar confusiones con múltiples cuentas

#### Criterios de Aceptacion
- [x] Al cargar `/accept-invitation`, `/invitation-invalid`, o `/welcome-invited`, verificar autenticación
- [x] Si autenticado, consultar estado de usuario con `api.users.getOnboardingStatus`
- [x] Si `onboardingCompleted`, redirigir directamente a `/dashboard` sin procesar la invitación
- [x] Si `!onboardingCompleted`, redirigir al paso correcto de onboarding
- [x] Si no autenticado, mostrar la página normalmente (permitir aceptar invitación)
- [x] Durante la verificación, mostrar loader con mensaje "Verificando sesión..."

#### Backend
- Query: `api.users.getOnboardingStatus` (ya existe)

#### Frontend
- Páginas:
  - [app/(auth)/accept-invitation/page.tsx](app/(auth)/accept-invitation/page.tsx)
  - [app/(auth)/invitation-invalid/page.tsx](app/(auth)/invitation-invalid/page.tsx)
  - [app/(auth)/welcome-invited/page.tsx](app/(auth)/welcome-invited/page.tsx)
- Estados UI: checking, redirecting, unauthenticated
- Hook: `useAuth()` de `@clerk/nextjs`

#### Dependencias
- Relacionado: US-ARD.1 (misma lógica de redirección)

---

### US-ARD.4: NO redirigir desde páginas de verificación/reset

**Como** usuario que está en proceso de verificar email o cambiar contraseña
**quiero** poder acceder a esas páginas incluso si estoy autenticado
**para** completar operaciones válidas de cuenta

#### Criterios de Aceptacion
- [x] `/verify-email` no implementa lógica de auto-redirección (permitir acceso siempre)
- [x] `/forgot-password` no implementa lógica de auto-redirección (permitir acceso siempre)
- [x] `/reset-password` no implementa lógica de auto-redirección (permitir acceso siempre)
- [x] `/set-password` no implementa lógica de auto-redirección (permitir acceso siempre)
- [x] Estas páginas siguen su flujo normal independiente del estado de autenticación

#### Backend
- No requiere cambios

#### Frontend
- Páginas: NO modificar estas páginas
  - `app/(auth)/verify-email/page.tsx`
  - `app/(auth)/forgot-password/page.tsx`
  - `app/(auth)/reset-password/page.tsx`
  - `app/(auth)/set-password/page.tsx`

#### Dependencias
- Ninguna

---

## Schema Changes

No requiere cambios en el schema. Se reutiliza `api.users.getOnboardingStatus` existente.

## Consideraciones Tecnicas

- **Arquitectura:** Implementar en cada página individualmente usando `useEffect` con `useAuth()` y `useQuery(api.users.getOnboardingStatus)`
- **Patrón de código:**
  ```tsx
  'use client';

  import { useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { useAuth } from '@clerk/nextjs';
  import { useQuery } from 'convex/react';
  import { api } from '@/convex/_generated/api';
  import { Loader2 } from 'lucide-react';

  export default function Page() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();
    const onboardingStatus = useQuery(
      isSignedIn ? api.users.getOnboardingStatus : "skip"
    );

    useEffect(() => {
      if (!isLoaded) return;
      if (!isSignedIn) return; // Mostrar form normalmente

      if (onboardingStatus === undefined) return; // Loading
      if (onboardingStatus === null) return; // Sin usuario en Convex (edge case)

      // Redirigir según estado
      if (!onboardingStatus.hasCompany) {
        router.replace('/company-setup');
      } else if (!onboardingStatus.onboardingCompleted) {
        router.replace('/facility-basic');
      } else {
        router.replace('/dashboard');
      }
    }, [isLoaded, isSignedIn, onboardingStatus, router]);

    // Mostrar loader mientras verifica
    if (isSignedIn && onboardingStatus === undefined) {
      return <div>Loading...</div>;
    }

    // Resto de la página
    return <div>Login Form</div>;
  }
  ```
- **Integraciones:**
  - Clerk para detección de autenticación
  - Convex query `api.users.getOnboardingStatus` para estado de onboarding
  - Next.js `useRouter` para redirecciones client-side
- **Riesgos:**
  - Race condition entre Clerk y Convex (usuario creado en Clerk pero todavía no sincronizado en Convex via webhook). Mitigado por el endpoint `api.clerkSync.ensureUserExists` que ya existe en el proyecto.
  - Flicker de UI al cargar la página antes de redirigir. Mitigado mostrando loader durante verificación.
- **Performance:** Las redirecciones son client-side con `router.replace()`, no causan recarga completa de página

## Out of Scope

- **Redirección desde middleware:** No se implementa en `middleware.ts` porque Clerk middleware ya maneja la protección de rutas. La lógica de negocio específica (estado de onboarding) debe estar en el cliente.
- **Redirección de páginas sensibles:** `/verify-email`, `/forgot-password`, `/reset-password`, `/set-password` NO redirigen usuarios autenticados
- **Múltiples empresas:** Esta feature NO maneja el caso de usuarios con acceso a múltiples empresas (fuera del alcance actual del MVP)
- **Deep linking con retorno:** No se implementa guardar la URL original para retornar después del login (ej: usuario va a `/dashboard/areas`, se desloguea, quiere volver a `/dashboard/areas` después de login). Esto se puede agregar en una iteración futura.
- **Notificación al usuario:** No se muestra un toast explicando por qué fueron redirigidos. Solo se muestra loader durante la verificación.

---

## Implementacion

### Commits
- `769ec55` — feat(auth): US-ARD.1 auto-redirect from /login if authenticated
- `5fecd79` — feat(auth): US-ARD.2 auto-redirect from /signup if authenticated
- `9031b86` — feat(auth): US-ARD.3 auto-redirect from invitation pages if authenticated

### Archivos Modificados
- `app/(auth)/login/page.tsx` — auto-redirección en página de login
- `app/(auth)/signup/page.tsx` — auto-redirección en página de registro
- `app/(auth)/accept-invitation/page.tsx` — auto-redirección en aceptar invitación
- `app/(auth)/invitation-invalid/page.tsx` — auto-redirección en invitación inválida
- `app/(auth)/welcome-invited/page.tsx` — auto-redirección en página de bienvenida

### Archivos NO Modificados (intencionalmente)
- `app/(auth)/verify-email/page.tsx` — sin auto-redirección (permitir verificación)
- `app/(auth)/forgot-password/page.tsx` — sin auto-redirección (permitir reset)
- `app/(auth)/reset-password/page.tsx` — sin auto-redirección (permitir reset)
- `app/(auth)/set-password/page.tsx` — sin auto-redirección (permitir set password)

### Fecha de Completado
2026-02-11
