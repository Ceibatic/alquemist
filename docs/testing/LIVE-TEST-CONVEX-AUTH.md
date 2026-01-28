# Live Test: Migracion Convex Auth

**Fecha de migracion**: Enero 2026
**Objetivo**: Verificar que todos los flujos de auth funcionan correctamente tras migrar de auth custom a Convex Auth.

---

## Pre-requisitos

- [ ] `npx convex dev` corriendo sin errores
- [ ] `npm run dev` corriendo sin errores
- [ ] Env var `AUTH_RESEND_KEY` configurada en Convex dashboard
- [ ] Acceso a inbox de email para recibir OTPs

---

## Group A: Signup + Verificacion

### T1: Registro nuevo usuario
1. Ir a `/signup`
2. Llenar: nombre, apellido, email, telefono, password (cumpliendo requisitos)
3. Aceptar terminos
4. Click "Crear Cuenta"
- [ ] Redirige a `/verify-email`
- [ ] Email con codigo OTP de 6 digitos llega al inbox

### T2: Verificar email con OTP
1. En `/verify-email`, ingresar codigo de 6 digitos del email
2. Click "Verificar"
- [ ] Verifica exitosamente
- [ ] Redirige a `/company-setup`

### T3: Reenviar codigo
1. En `/verify-email`, click "Reenviar codigo"
- [ ] Nuevo email con codigo OTP llega
- [ ] Cooldown de 60 segundos funciona

### T4: Email duplicado
1. Ir a `/signup` con email ya registrado
2. Intentar registrar
- [ ] Muestra error de email ya registrado

---

## Group B: Onboarding

### T5: Flujo completo de onboarding
1. Tras verificar email, completar:
   - Company setup (nombre, NIT, etc.)
   - Facility basic info
   - Facility location
   - Setup complete
- [ ] Cada paso funciona y navega al siguiente
- [ ] Setup complete muestra resumen

### T6: Completar onboarding
1. En `/setup-complete`, click "Ir al Dashboard"
- [ ] `onboarding_completed` se marca `true` en DB
- [ ] Navega a `/dashboard`

### T7: Dashboard accesible
- [ ] `/dashboard` carga correctamente con datos del usuario
- [ ] Nombre y empresa visibles en header/sidebar

---

## Group C: Login / Logout

### T8: Login valido
1. Ir a `/login`
2. Ingresar email y password del usuario creado
3. Click "Iniciar Sesion"
- [ ] Redirige a `/dashboard`
- [ ] Sesion activa (puede navegar sin re-login)

### T9: Login invalido
1. Ir a `/login`
2. Ingresar email correcto + password incorrecto
- [ ] Muestra error "Credenciales invalidas" (o similar)
- [ ] No redirige

### T10: Logout
1. En dashboard, click "Cerrar Sesion" en menu de usuario
- [ ] Redirige a `/login`
- [ ] Intentar acceder a `/dashboard` redirige a `/login`

---

## Group D: Password Reset

### T11: Flujo completo de reset
1. Ir a `/forgot-password`
2. Ingresar email
3. Click "Enviar codigo"
- [ ] Muestra mensaje de exito (siempre, por seguridad)
- [ ] Email con codigo OTP llega

4. Ir a `/reset-password`
5. Ingresar codigo OTP + nueva password
6. Click "Restablecer"
- [ ] Password cambiado exitosamente
- [ ] Puede hacer login con nueva password

---

## Group E: Invitaciones

### T12: Crear invitacion
1. En dashboard, ir a Team Management
2. Crear invitacion con email nuevo
- [ ] Invitacion creada en DB
- [ ] Email de invitacion enviado

### T13: Aceptar invitacion
1. Abrir link de invitacion (`/accept-invitation?token=XXX`)
2. Ver detalles (empresa, rol)
3. Aceptar → set password
- [ ] Usuario creado con company/role asignados
- [ ] Redirige a `/welcome-invited` o `/dashboard`

### T14: Rechazar invitacion
1. Abrir link de invitacion
2. Click "Rechazar"
- [ ] Invitacion marcada como `rejected`

### T15: Token expirado
1. Usar link con token expirado o invalido
- [ ] Muestra pagina de error / invitacion invalida

---

## Group F: Middleware / Rutas

### T16: Ruta protegida sin login
1. Cerrar sesion
2. Navegar directamente a `/dashboard`
- [ ] Redirige a `/login`

### T17: Ruta auth con sesion activa
1. Con sesion activa, navegar a `/login`
- [ ] Redirige a `/dashboard`

### T18: Onboarding incompleto
1. Crear usuario nuevo, verificar email, pero NO completar company setup
2. Intentar acceder a `/dashboard`
- [ ] Redirige a `/company-setup` (o muestra estado apropiado)

---

## Notas

- Si un test falla, revisar consola del browser y logs de Convex (`npx convex logs`)
- OTP emails enviados via Resend — revisar spam si no llegan
- Sesiones duran 30 dias (cookie config en `middleware.ts`)
