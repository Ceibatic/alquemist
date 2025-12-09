# Module 02: Authentication & Session Management

## Overview

El modulo de Autenticacion maneja el inicio de sesion de usuarios existentes, validacion de sesiones, y cierre de sesion. Utiliza cookies HTTP-only para almacenar tokens de sesion de forma segura.

**Estado**: Implementado

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
- [ ] Link "Olvide mi contrasena" (placeholder para futuro)
- [ ] Fondo con gradiente verde caracteristico

**Componentes:** [login/page.tsx](app/(auth)/login/page.tsx), [login-form.tsx](components/auth/login-form.tsx)

---

### US-02.2: Iniciar sesion
**Como** usuario registrado
**Quiero** ingresar mis credenciales
**Para** acceder a mi cuenta

**Criterios de Aceptacion:**
- [ ] **Campos del formulario:**
  - Correo electronico* (formato valido)
  - Contrasena* (campo password)
- [ ] Toggle de visibilidad de contrasena (icono ojo)
- [ ] Boton "Iniciar Sesion" (amber-500)
- [ ] Estado de carga durante autenticacion
- [ ] Mensaje de error generico "Credenciales invalidas" (por seguridad)
- [ ] Redirige a `/dashboard` al autenticar exitosamente
- [ ] Guarda session token en cookie HTTP-only
- [ ] Guarda user data en cookie para acceso cliente

**Escribe:** `auth.login({ email, password })`

**Validaciones backend:**
- Email existe en sistema
- Email esta verificado
- Password coincide con hash
- Genera session token (30 dias expiracion)

**Componentes:** [login-form.tsx](components/auth/login-form.tsx)

---

### US-02.3: Validar sesion activa
**Como** sistema
**Quiero** validar el token de sesion en cada request protegido
**Para** asegurar que solo usuarios autenticados accedan

**Criterios de Aceptacion:**
- [ ] Middleware valida cookie `session_token` en rutas protegidas
- [ ] Si token valido, permite acceso y pasa userId a request
- [ ] Si token invalido o expirado, redirige a `/login`
- [ ] Si token proximo a expirar (< 7 dias), renueva automaticamente
- [ ] Rutas publicas excluidas: `/login`, `/signup`, `/verify-email`, `/accept-invitation`

**Consulta:** `auth.validateSession({ token })`

**Componentes:** [middleware.ts](middleware.ts)

---

### US-02.4: Cerrar sesion
**Como** usuario autenticado
**Quiero** cerrar mi sesion
**Para** salir de mi cuenta de forma segura

**Criterios de Aceptacion:**
- [ ] Opcion "Cerrar Sesion" en menu de usuario (header)
- [ ] Confirmacion opcional antes de cerrar
- [ ] Invalida token de sesion en backend
- [ ] Elimina cookies de sesion y user data
- [ ] Redirige a `/login`
- [ ] Toast de confirmacion "Sesion cerrada correctamente"

**Escribe:** `auth.logout({ token })`

**Componentes:** [header.tsx](components/layout/header.tsx), [user-menu.tsx](components/layout/user-menu.tsx)

---

### US-02.5: Redireccion automatica por estado
**Como** sistema
**Quiero** redirigir usuarios segun su estado de onboarding
**Para** guiarlos al paso correcto

**Criterios de Aceptacion:**
- [ ] Usuario no verificado en `/login` → error "Debes verificar tu email"
- [ ] Usuario verificado sin empresa → redirige a `/company-setup`
- [ ] Usuario con empresa sin facility → redirige a `/facility-setup`
- [ ] Usuario completo → redirige a `/dashboard`
- [ ] Guarda estado de onboarding en user data

**Consulta:** `users.getOnboardingStatus({ userId })`

---

### US-02.6: Recordar sesion
**Como** usuario frecuente
**Quiero** que mi sesion se mantenga activa
**Para** no tener que iniciar sesion cada vez

**Criterios de Aceptacion:**
- [ ] Sesion dura 30 dias por defecto
- [ ] Token se renueva automaticamente si usuario activo
- [ ] Al cerrar sesion, se elimina el token
- [ ] Opcion futura: checkbox "Recordarme" con sesion extendida

---

### US-02.7: Manejo de errores de autenticacion
**Como** usuario
**Quiero** ver mensajes claros cuando hay problemas
**Para** entender que debo hacer

**Criterios de Aceptacion:**
- [ ] "Credenciales invalidas" - email/password incorrectos
- [ ] "Debes verificar tu email" - usuario no verificado
- [ ] "Tu sesion ha expirado" - token expirado
- [ ] "Cuenta suspendida" - status != active
- [ ] Limite de 5 intentos fallidos por hora (rate limiting)

---

## Schema

### Tabla: `sessions` (opcional si se usa JWT)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `user_id` | `id("users")` | Usuario de la sesion |
| `token` | `string` | Token unico de sesion |
| `expires_at` | `number` | Timestamp de expiracion |
| `created_at` | `number` | Timestamp de creacion |
| `user_agent` | `string?` | Browser/device info |
| `ip_address` | `string?` | IP del cliente |

### Cookies utilizadas

| Cookie | Tipo | Duracion | Contenido |
|--------|------|----------|-----------|
| `session_token` | HTTP-only | 30 dias | Token de sesion |
| `user_data` | Accesible JS | 30 dias | `{ userId, companyId, email, firstName }` |

---

## Estados de Usuario

| Estado | Puede hacer login | Redireccion |
|--------|-------------------|-------------|
| `active` + verified | Si | Dashboard o onboarding pendiente |
| `active` + no verified | No | Error "Verificar email" |
| `suspended` | No | Error "Cuenta suspendida" |
| `inactive` | No | Error "Cuenta desactivada" |

---

## Rate Limiting

| Accion | Limite | Ventana |
|--------|--------|---------|
| Login fallido | 5 intentos | 1 hora |
| Login exitoso | Sin limite | - |
| Resend verification | 5 intentos | 1 hora |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M01-Registration | Previo | Usuario debe existir y estar verificado |
| M03-Company | Siguiente | Redirige si no tiene empresa |
| M04-Facility | Siguiente | Redirige si no tiene facility |
| Dashboard | Destino | Redirige tras login exitoso completo |

---

## API Backend

### Mutations
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `login` | `email, password` | `{ token, user, company?, facility? }` |
| `logout` | `token` | `{ success }` |
| `refreshSession` | `token` | `{ newToken, expiresAt }` |

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `validateSession` | `token` | `{ valid, userId, expiresAt }` |
| `getOnboardingStatus` | `userId` | `{ emailVerified, hasCompany, hasFacility }` |

---

## Flujo de Login

```
/login
    |
    v
[Credenciales correctas?]
    |
    +-- No --> Error "Credenciales invalidas"
    |
    +-- Si --> [Email verificado?]
                    |
                    +-- No --> Error "Verificar email"
                    |
                    +-- Si --> [Tiene empresa?]
                                    |
                                    +-- No --> /company-setup
                                    |
                                    +-- Si --> [Tiene facility?]
                                                    |
                                                    +-- No --> /facility-setup
                                                    |
                                                    +-- Si --> /dashboard
```

---

## Seguridad

- Passwords nunca se almacenan en texto plano (bcrypt)
- Tokens de sesion son UUIDs aleatorios
- Cookies HTTP-only previenen XSS
- HTTPS obligatorio en produccion
- Rate limiting previene ataques de fuerza bruta
- Mensajes de error genericos (no revelan si email existe)
