# Module 01: Registration & Email Verification

## Overview

El modulo de Registro permite a nuevos usuarios crear una cuenta en Alquemist. Incluye el formulario de registro, validacion de email mediante codigo de 6 digitos, y la preparacion para el flujo de onboarding (creacion de empresa y facility).

**Estado**: Implementado

---

## User Stories

### US-01.1: Ver formulario de registro
**Como** nuevo usuario
**Quiero** acceder al formulario de registro
**Para** crear mi cuenta en la plataforma

**Criterios de Aceptacion:**
- [ ] Pagina accesible en `/signup`
- [ ] Logo de Alquemist centrado arriba
- [ ] Titulo "Crear Cuenta" con descripcion
- [ ] Formulario centrado con ancho maximo (max-w-md)
- [ ] Link "Ya tienes cuenta? Inicia sesion" navega a `/login`
- [ ] Responsive: funciona en mobile y desktop
- [ ] Fondo con gradiente verde caracteristico

**Componentes:** [signup/page.tsx](app/(auth)/signup/page.tsx), [signup-form.tsx](components/auth/signup-form.tsx)

---

### US-01.2: Registrar nueva cuenta
**Como** nuevo usuario
**Quiero** completar el formulario de registro
**Para** crear mi cuenta y comenzar el onboarding

**Criterios de Aceptacion:**
- [ ] **Campos del formulario:**
  - Nombre* (min 2 caracteres)
  - Apellido* (min 2 caracteres)
  - Correo electronico* (formato valido, unico)
  - Contrasena* (min 8 chars, 1 mayuscula, 1 numero, 1 especial)
  - Confirmar contrasena* (debe coincidir)
  - Telefono (opcional, formato colombiano)
- [ ] Checkbox "Acepto los Terminos de Servicio"*
- [ ] Indicador de fortaleza de contrasena visual
- [ ] Requisitos de contrasena mostrados debajo del campo
- [ ] Validacion en tiempo real de todos los campos
- [ ] Boton "Crear Cuenta" (amber-500)
- [ ] Boton deshabilitado si formulario invalido
- [ ] Estado de carga en boton durante submit

**Escribe:** `auth.register({ email, password, firstName, lastName, phone? })`

**Validaciones backend:**
- Email formato valido
- Email no registrado previamente
- Password cumple requisitos de seguridad
- Genera token de verificacion de 6 digitos
- Token expira en 24 horas

**Componentes:** [signup-form.tsx](components/auth/signup-form.tsx)

---

### US-01.3: Indicador de fortaleza de contrasena
**Como** nuevo usuario
**Quiero** ver que tan fuerte es mi contrasena
**Para** crear una contrasena segura

**Criterios de Aceptacion:**
- [ ] Barra visual de progreso debajo del campo
- [ ] **Niveles de fortaleza:**
  - Debil (0-2 puntos): Rojo
  - Media (3 puntos): Amarillo
  - Buena (4 puntos): Azul
  - Fuerte (5 puntos): Verde
- [ ] **Criterios evaluados (1 punto cada uno):**
  - Longitud >= 8 caracteres
  - Longitud >= 12 caracteres
  - Contiene minusculas y mayusculas
  - Contiene numeros
  - Contiene caracteres especiales (!@#$%^&*)
- [ ] Lista de requisitos con iconos check/x
- [ ] Requisitos cambian a verde cuando se cumplen

**Componentes:** [password-strength.tsx](components/auth/password-strength.tsx)

---

### US-01.4: Ver pagina de verificacion de email
**Como** usuario recien registrado
**Quiero** ver instrucciones para verificar mi email
**Para** completar el registro

**Criterios de Aceptacion:**
- [ ] Pagina accesible en `/verify-email`
- [ ] Redirige a esta pagina automaticamente tras registro exitoso
- [ ] Muestra email del usuario (pre-poblado de registro)
- [ ] Icono de correo/verificacion arriba
- [ ] Mensaje "Te enviamos un codigo de verificacion a [email]"
- [ ] Instrucciones claras para revisar inbox/spam
- [ ] Input para codigo de 6 digitos
- [ ] Temporizador de expiracion (24 horas desde envio)

**Componentes:** [verify-email/page.tsx](app/(auth)/verify-email/page.tsx), [verify-email-form.tsx](components/auth/verify-email-form.tsx)

---

### US-01.5: Ingresar codigo de verificacion
**Como** usuario pendiente de verificacion
**Quiero** ingresar el codigo que recibi por email
**Para** verificar mi cuenta y continuar

**Criterios de Aceptacion:**
- [ ] Input de 6 digitos (numerico)
- [ ] Auto-focus en primer digito
- [ ] Avanza automaticamente entre digitos
- [ ] Permite pegar codigo completo
- [ ] Boton "Verificar" (amber-500)
- [ ] Mensaje de error si codigo invalido
- [ ] Mensaje de error si codigo expirado
- [ ] Redirige a `/company-setup` al verificar exitosamente
- [ ] Toast de exito "Email verificado correctamente"

**Escribe:** `auth.verifyEmail({ email, token })`

**Validaciones backend:**
- Token existe y pertenece al usuario
- Token no ha expirado (< 24 horas)
- Actualiza email_verified = true
- Limpia token de verificacion

**Componentes:** [verify-email-form.tsx](components/auth/verify-email-form.tsx)

---

### US-01.6: Reenviar codigo de verificacion
**Como** usuario pendiente de verificacion
**Quiero** solicitar un nuevo codigo
**Para** completar verificacion si no recibi el anterior

**Criterios de Aceptacion:**
- [ ] Link "Reenviar codigo" debajo del formulario
- [ ] Cooldown de 60 segundos entre reenvios (muestra contador)
- [ ] Genera nuevo token de 6 digitos
- [ ] Invalida token anterior
- [ ] Toast de confirmacion "Codigo reenviado a [email]"
- [ ] Limite de 5 reenvios por hora

**Escribe:** `auth.resendVerification({ email })`

**Validaciones backend:**
- Usuario existe y no esta verificado
- Rate limiting: max 5 por hora
- Genera nuevo token, invalida anterior

**Componentes:** [verify-email-form.tsx](components/auth/verify-email-form.tsx)

---

### US-01.7: Verificar via link de email
**Como** usuario pendiente de verificacion
**Quiero** hacer clic en el link del email
**Para** verificar mi cuenta automaticamente

**Criterios de Aceptacion:**
- [ ] Email contiene link con token: `/verify-email?token=XXXXXX`
- [ ] Si URL tiene token, auto-rellena el input
- [ ] Intenta verificacion automatica al cargar
- [ ] Si token valido, redirige a company-setup
- [ ] Si token invalido, muestra error y permite ingresar manualmente

**Consulta URL:** `searchParams.get('token')`

**Componentes:** [verify-email/page.tsx](app/(auth)/verify-email/page.tsx)

---

## Schema

### Campos de usuario (registro)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `email` | `string` | Email unico del usuario |
| `password_hash` | `string` | Hash bcrypt de la contrasena |
| `first_name` | `string?` | Nombre |
| `last_name` | `string?` | Apellido |
| `phone` | `string?` | Telefono opcional |
| `email_verified` | `boolean` | Estado de verificacion |
| `email_verification_token` | `string?` | Token de 6 digitos |
| `token_expires_at` | `number?` | Timestamp de expiracion |
| `created_at` | `number` | Timestamp de creacion |

---

## Validaciones de Contrasena

| Requisito | Regex/Condicion |
|-----------|-----------------|
| Minimo 8 caracteres | `length >= 8` |
| Al menos 1 mayuscula | `/[A-Z]/` |
| Al menos 1 minuscula | `/[a-z]/` |
| Al menos 1 numero | `/[0-9]/` |
| Al menos 1 especial | `/[!@#$%^&*(),.?":{}|<>]/` |

---

## Mensajes de Error

| Codigo | Mensaje ES | Mensaje EN |
|--------|------------|------------|
| `EMAIL_EXISTS` | Este email ya esta registrado | This email is already registered |
| `INVALID_TOKEN` | Codigo invalido | Invalid code |
| `TOKEN_EXPIRED` | El codigo ha expirado | Code has expired |
| `RATE_LIMITED` | Demasiados intentos. Espera un momento | Too many attempts. Please wait |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M02-Auth | Siguiente | Despues de verificar, puede hacer login |
| M03-Company | Siguiente | Redirige a crear empresa tras verificar |
| M05-Invitation | Alternativo | Usuarios invitados saltan este modulo |

---

## API Backend

### Mutations
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `register` | `email, password, firstName, lastName, phone?` | `{ userId, email }` |
| `verifyEmail` | `email, token` | `{ success, userId }` |
| `resendVerification` | `email` | `{ success }` |

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `checkEmailExists` | `email` | `boolean` |

---

## Flujo de Pantallas

```
/signup
    |
    v
[Registro exitoso]
    |
    v
/verify-email?email=xxx
    |
    v
[Verificacion exitosa]
    |
    v
/company-setup (M03)
```
