# Wireframes Next.js para Alquemist - Phase 1 Onboarding

**Alquemist PWA - Aplicación de Trazabilidad Agrícola**
**Última actualización**: Noviembre 2025

---

## Objetivo

Crear wireframes de baja fidelidad adaptados de Bubble a Next.js para Phase 1 (Onboarding & Authentication), optimizados para mobile y desktop, usando Resend para envío de emails.

---

## Resumen de Hallazgos

### Flujo Completo Phase 1
- **Total Pantallas**: 11 screens
- **First User Flow**: 7 pantallas (Signup → Email Verify → Company → Facility → Dashboard)
- **Invited User Flow**: 4 pantallas (Accept → Set Password → Welcome → Dashboard)
- **Email Service**: Resend integrado en Next.js Server Actions

### Patrones de Diseño (basados en imágenes de referencia)
- **Colores**: Verde #1B5E20 (primary), Amarillo #FFC107 (accent/CTA)
- **Layout**: Mobile-first, luego desktop
- **Componentes**: Cards, Forms de 2 columnas, Badges, Modales
- **Navegación**: Flujo lineal con validación en cada paso

### Formato de Wireframes
- **ASCII Art**: Box-drawing characters
- **Ancho Desktop**: ~73 caracteres
- **Ancho Mobile**: ~32 caracteres
- **Iconos**: Emoji para status y acciones
- **Detalle**: Baja fidelidad (estructura y contenido, no estilos)

---

## WIREFRAMES - PHASE 1: ONBOARDING & AUTHENTICATION

Total: 11 pantallas (7 first user + 4 invited user)

---

## FIRST USER FLOW (7 Pantallas)

### Page 1: Signup Form

**Desktop (73 chars)**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
│                     Trazabilidad Agrícola                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                      CREAR CUENTA                                   │
│                                                                      │
│  Nombre *                                                           │
│  [_________________________________]                                │
│                                                                      │
│  Apellido *                                                         │
│  [_________________________________]                                │
│                                                                      │
│  Correo Electrónico *                                               │
│  [_________________________________]                                │
│  ○ Email disponible  ○ Email ya registrado                         │
│                                                                      │
│  Contraseña *                                                       │
│  [_________________________________] [👁]                           │
│                                                                      │
│  Confirmar Contraseña *                                             │
│  [_________________________________] [👁]                           │
│                                                                      │
│  Teléfono (opcional)                                                │
│  [_________________________________]                                │
│  Formato: 10 dígitos (ej: 3001234567)                              │
│                                                                      │
│  ☐ Acepto los Términos de Servicio y Política de Privacidad       │
│                                                                      │
│  [         CREAR CUENTA         ]                                   │
│  (Botón amarillo - deshabilitado hasta validación completa)        │
│                                                                      │
│  ¿Ya tienes cuenta? [Iniciar Sesión]                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile (32 chars)**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
│   Trazabilidad Agrícola        │
├────────────────────────────────┤
│                                │
│   CREAR CUENTA                 │
│                                │
│ Nombre *                       │
│ [________________________]     │
│                                │
│ Apellido *                     │
│ [________________________]     │
│                                │
│ Correo Electrónico *           │
│ [________________________]     │
│                                │
│ Contraseña *                   │
│ [____________________] [👁]    │
│                                │
│ Confirmar Contraseña *         │
│ [____________________] [👁]    │
│                                │
│ Teléfono (opcional)            │
│ [________________________]     │
│                                │
│ ☐ Acepto Términos             │
│                                │
│ [   CREAR CUENTA   ]           │
│                                │
│ ¿Ya tienes cuenta?             │
│ [Iniciar Sesión]               │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Validación en tiempo real de email (API call: checkEmailAvailability)
- Indicador de fortaleza de contraseña (visual)
- Toggle para mostrar/ocultar contraseña
- Botón deshabilitado hasta que todos los campos sean válidos
- Link a Términos y Política abre modal o página nueva
- API Integration: POST /auth/register → returns emailHtml, emailSubject, verificationToken

**Validaciones:**
- Email: formato válido + único en DB
- Contraseña: mín 8 chars, 1 mayúscula, 1 número, 1 especial
- Confirmar: debe coincidir con contraseña
- Términos: debe estar marcado

**Estados:**
- Loading: spinner en botón durante API call
- Success: mensaje "Cuenta creada. Revisa tu email" → navega a Page 2
- Error: mensaje bajo el campo con problema

---

### Page 2: Email Verification

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                     ✉️  VERIFICA TU EMAIL                            │
│                                                                      │
│  Enviamos un enlace de verificación a:                              │
│  user@example.com                                                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Haz clic en el enlace de tu correo o ingresa el código:     │  │
│  │                                                              │  │
│  │ Código de 8 dígitos:                                        │  │
│  │                                                              │  │
│  │    [___] [___] [___] [___] [___] [___] [___] [___]         │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ⏰ Expira en: 23:45:12                                             │
│  (Barra de progreso: ████████████████░░░░)                          │
│                                                                      │
│  [         VERIFICAR EMAIL         ]                                │
│  (Botón amarillo - habilitado con código completo)                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ¿No recibiste el email?                                     │  │
│  │ • Revisa tu carpeta de spam                                 │  │
│  │ • [Reenviar Email de Verificación]                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
├────────────────────────────────┤
│                                │
│  ✉️  VERIFICA TU EMAIL          │
│                                │
│ Enviamos un enlace a:          │
│ user@example.com               │
│                                │
│ ┌────────────────────────────┐ │
│ │ Ingresa el código:         │ │
│ │                            │ │
│ │ [__] [__] [__] [__]        │ │
│ │ [__] [__] [__] [__]        │ │
│ │                            │ │
│ └────────────────────────────┘ │
│                                │
│ ⏰ Expira en: 23:45            │
│ ████████████░░░░               │
│                                │
│ [  VERIFICAR EMAIL  ]          │
│                                │
│ ¿No recibiste el email?        │
│ • Revisa spam                  │
│ • [Reenviar Email]             │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Email display (del usuario que acaba de registrarse)
- 8 campos separados para código (auto-advance al siguiente)
- Countdown timer visual (24 horas)
- Botón de reenvío siempre disponible
- Auto-verificación si llega desde link del email (token en URL)

**API Integration:**
- GET /auth/verify-email?token=xxx (auto-verify from email link)
- POST /auth/verify-email (manual code submission)
- POST /auth/resend-verification (resend email)

**Estados:**
- Loading: spinner durante verificación
- Success: ✅ checkmark animado → navega a Page 3
- Error: código inválido/expirado → permite reintentar
- Resent: mensaje "Email reenviado" temporalmente

---

### Page 3: Company Setup

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              🏢 CREA TU EMPRESA                                      │
│                                                                      │
│  Paso 1 de 3: Información de la Empresa                             │
│  ━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░                             │
│                                                                      │
│  Nombre de la Empresa *                                             │
│  [_________________________________]                                │
│  Ej: Cultivos San José S.A.S                                        │
│                                                                      │
│  Tipo de Negocio *                                                  │
│  [S.A.S                          ▼]                                 │
│  Opciones: S.A.S, S.A., Ltda, E.U., Persona Natural                │
│                                                                      │
│  Industria *                                                        │
│  [Cannabis                       ▼]                                 │
│  Opciones: Cannabis, Café, Cacao, Flores, Mixto                    │
│                                                                      │
│  Ubicación                                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Departamento *                                               │  │
│  │ [Antioquia                    ▼]                             │  │
│  │                                                              │  │
│  │ Municipio *                                                  │  │
│  │ [Medellín                     ▼]                             │  │
│  │ (se filtra según departamento seleccionado)                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                                    [    CREAR EMPRESA    ]          │
│                                    (Botón amarillo)                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
├────────────────────────────────┤
│                                │
│   🏢 CREA TU EMPRESA           │
│                                │
│ Paso 1 de 3                    │
│ ████████░░░░░░░░               │
│                                │
│ Nombre de la Empresa *         │
│ [________________________]     │
│                                │
│ Tipo de Negocio *              │
│ [S.A.S               ▼]        │
│                                │
│ Industria *                    │
│ [Cannabis            ▼]        │
│                                │
│ Departamento *                 │
│ [Antioquia           ▼]        │
│                                │
│ Municipio *                    │
│ [Medellín            ▼]        │
│                                │
│                                │
│ [ CREAR EMPRESA ]              │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Progress indicator (Paso 1 de 3)
- Dropdowns con opciones predefinidas (business types, industries)
- Cascading dropdown: Departamento → Municipio
- Todos los campos requeridos marcados con *
- Botón habilitado solo cuando todos los campos estén completos

**API Integration:**
- GET /geographic/departments (load departamentos)
- GET /geographic/municipalities?departmentCode=xxx (cascading)
- POST /companies/create

**Database Writes:**
- companies table (sets trial plan, max_facilities=1, max_users=3)
- users table (links company_id, sets timezone from municipality)

**Estados:**
- Loading departments/municipalities: skeleton en dropdowns
- Loading create: spinner en botón
- Success: mensaje "¡Bienvenido! Empresa creada" → navega a Page 5 (skip Page 4 for MVP)
- Error: mensaje bajo campo problemático

---

### Page 4: Choose Plan (SKIP FOR MVP)

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              💳 SELECCIONA TU PLAN                                   │
│                                                                      │
│  Paso 2 de 3: Suscripción (OPCIONAL - Defaulting to Trial)         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░                             │
│                                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │TRIAL │  │STARTER│  │ PRO  │  │ENTER-│                            │
│  │      │  │       │  │      │  │PRISE │                            │
│  ├──────┤  ├───────┤  ├──────┤  ├──────┤                            │
│  │Gratis│  │$X/mes │  │$Y/mes│  │Custom│                            │
│  ├──────┤  ├───────┤  ├──────┤  ├──────┤                            │
│  │1 fac.│  │5 fac. │  │20fac.│  │Quote │                            │
│  │3 user│  │10 user│  │50user│  │Call  │                            │
│  │30días│  │Todo   │  │Todo  │  │Us    │                            │
│  ├──────┤  ├───────┤  ├──────┤  ├──────┤                            │
│  │[USAR]│  │[USAR] │  │[USAR]│  │CONTACT│                           │
│  └──────┘  └───────┘  └──────┘  └──────┘                            │
│                                                                      │
│  Ciclo de facturación:  ⚪ Mensual  ⚪ Anual (ahorra 15%)            │
│                                                                      │
│                                    [    CONTINUAR    ]              │
│                                    (Skip to Facility)               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Nota MVP**: Esta página se omite para MVP. Todos los usuarios inician con plan Trial por defecto.

---

### Page 5: Add Facility - Basic Info

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              🏭 AGREGAR INSTALACIÓN                                  │
│                                                                      │
│  Paso 2 de 3: Información Básica                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░                             │
│                                                                      │
│  Información Básica                                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Nombre de la Instalación *                                   │  │
│  │ [_____________________________]                              │  │
│  │ Ej: "Finca Norte"                                            │  │
│  │                                                              │  │
│  │ Número de Licencia *                                         │  │
│  │ [_____________________________]                              │  │
│  │                                                              │  │
│  │ Tipo de Licencia *                                           │  │
│  │ ⚪ Cultivo Comercial                                         │  │
│  │ ⚪ Investigación                                             │  │
│  │ ⚪ Procesamiento                                             │  │
│  │ ⚪ Otro                                                       │  │
│  │                                                              │  │
│  │ Área Licenciada (m²) *                                       │  │
│  │ [____________]                                               │  │
│  │                                                              │  │
│  │ Cultivos Principales * (selecciona uno o más)                │  │
│  │ ☐ Cannabis                                                   │  │
│  │ ☐ Café                                                       │  │
│  │ ☐ Cacao                                                      │  │
│  │ ☐ Flores                                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                                    [    CONTINUAR    ]              │
│                                    (Botón amarillo)                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
├────────────────────────────────┤
│                                │
│  🏭 AGREGAR INSTALACIÓN        │
│                                │
│ Paso 2 de 3                    │
│ ████████████████░░░░           │
│                                │
│ Nombre *                       │
│ [________________________]     │
│ Ej: "Finca Norte"              │
│                                │
│ Número de Licencia *           │
│ [________________________]     │
│                                │
│ Tipo de Licencia *             │
│ ⚪ Cultivo Comercial           │
│ ⚪ Investigación               │
│ ⚪ Procesamiento               │
│ ⚪ Otro                         │
│                                │
│ Área (m²) *                    │
│ [____________]                 │
│                                │
│ Cultivos Principales *         │
│ ☐ Cannabis                     │
│ ☐ Café                         │
│ ☐ Cacao                        │
│ ☐ Flores                       │
│                                │
│ [   CONTINUAR   ]              │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Progress indicator (Paso 2 de 3)
- Radio buttons para tipo de licencia (single selection)
- Checkboxes para cultivos (multiple selection)
- Input numérico para área (solo números positivos)
- Datos guardados en estado local (no DB aún)
- Botón Continuar → Page 6 con datos preservados

**Validaciones:**
- Nombre: requerido, mín 3 caracteres
- Licencia: requerido, alfanumérico
- Tipo: debe seleccionar uno
- Área: requerido, número positivo
- Cultivos: al menos uno seleccionado

---

### Page 6: Add Facility - Location

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              📍 UBICACIÓN DE LA INSTALACIÓN                          │
│                                                                      │
│  Paso 3 de 3: Ubicación y Configuración                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                             │
│                                                                      │
│  Ubicación                                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Departamento *                                               │  │
│  │ [Antioquia (prellenado)       ▼]                             │  │
│  │                                                              │  │
│  │ Municipio *                                                  │  │
│  │ [Seleccione municipio         ▼]                             │  │
│  │                                                              │  │
│  │ Dirección *                                                  │  │
│  │ [_____________________________]                              │  │
│  │ Calle, número, detalles                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Coordenadas GPS                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Latitud *              Longitud *                            │  │
│  │ [____________]         [____________]                        │  │
│  │                                                              │  │
│  │ [📍 Obtener Mi Ubicación]                                    │  │
│  │ (Usa GPS del navegador)                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Zona Climática *                                                   │
│  ⚪ Tropical       ⚪ Subtropical       ⚪ Templado                  │
│                                                                      │
│  [  ← ATRÁS  ]                      [  CREAR INSTALACIÓN  ]        │
│  (vuelve a Page 5)                  (Botón amarillo)               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
├────────────────────────────────┤
│                                │
│ 📍 UBICACIÓN                   │
│                                │
│ Paso 3 de 3                    │
│ ████████████████████████       │
│                                │
│ Departamento *                 │
│ [Antioquia       ▼]            │
│                                │
│ Municipio *                    │
│ [Seleccione      ▼]            │
│                                │
│ Dirección *                    │
│ [________________________]     │
│                                │
│ Coordenadas GPS                │
│ Latitud *                      │
│ [____________]                 │
│                                │
│ Longitud *                     │
│ [____________]                 │
│                                │
│ [📍 Obtener Ubicación]         │
│                                │
│ Zona Climática *               │
│ ⚪ Tropical                    │
│ ⚪ Subtropical                 │
│ ⚪ Templado                    │
│                                │
│ [← ATRÁS] [CREAR INSTALACIÓN] │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Departamento pre-filled desde company data
- Municipio dropdown cascading
- Botón GPS usa browser geolocation API
- Validación de coordenadas (rangos válidos)
- Botón Atrás preserva datos y vuelve a Page 5
- Botón Crear envía TODOS los datos (Page 5 + Page 6)

**API Integration:**
- POST /facilities/create (envía datos de ambas páginas 5 y 6)
- Validates company max_facilities limit

**Database Writes:**
- facilities table (todos los datos de basic info + location)
- users table (sets currentFacilityId)

**Estados:**
- GPS Loading: spinner en botón mientras obtiene coordenadas
- GPS Success: coords auto-poblados en inputs
- GPS Error: mensaje "No se pudo obtener ubicación, ingrésalas manualmente"
- Create Loading: spinner en botón
- Create Success: → navega a Page 7
- Create Error: mensaje de error específico

---

### Page 7: Setup Complete

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                   ✅ ¡INSTALACIÓN CREADA!                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │         Tu instalación está lista para usar                  │  │
│  │                                                              │  │
│  │  Resumen:                                                    │  │
│  │  ✓ Empresa: Cultivos San José                               │  │
│  │  ✓ Instalación: Finca Norte                                 │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  A continuación, configurarás:                                      │
│  • Áreas de Cultivo                                                 │
│  • Cultivares (variedades)                                          │
│  • Proveedores (opcional)                                           │
│                                                                      │
│  Estos pueden gestionarse desde tu panel operacional.               │
│                                                                      │
│                                                                      │
│                   [  IR AL PANEL DE CONTROL  ]                      │
│                   (Botón amarillo grande)                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
├────────────────────────────────┤
│                                │
│  ✅ ¡INSTALACIÓN CREADA!       │
│                                │
│ ┌────────────────────────────┐ │
│ │ Tu instalación está lista  │ │
│ │                            │ │
│ │ Resumen:                   │ │
│ │ ✓ Empresa:                 │ │
│ │   Cultivos San José        │ │
│ │                            │ │
│ │ ✓ Instalación:             │ │
│ │   Finca Norte              │ │
│ └────────────────────────────┘ │
│                                │
│ A continuación:                │
│ • Áreas de Cultivo             │
│ • Cultivares                   │
│ • Proveedores                  │
│                                │
│ Gestionable desde tu           │
│ panel operacional.             │
│                                │
│ [ IR AL PANEL DE CONTROL ]     │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Checkmarks visuales (success state)
- Resumen de lo creado (company name, facility name)
- Guidance sobre próximos pasos (Phase 2)
- Un solo botón CTA grande
- No hay opciones de editar (eso se hace en dashboard)

**Behavior:**
- currentFacilityId ya establecido en users table
- Al hacer click en botón → navega a /dashboard (Phase 2)
- Página estática de confirmación (no API calls)

---

## INVITED USER FLOW (4 Pantallas)

### Page 8: Accept Invitation Landing

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
│                      INVITACIÓN DE EQUIPO                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              Has sido invitado(a) a:                                │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  🏢 AGRÍCOLA DEL VALLE SAS                                   │  │
│  │                                                              │  │
│  │  Rol: Supervisor de Producción                              │  │
│  │  Invitado por: Juan Pérez                                   │  │
│  │  Instalaciones: 2                                            │  │
│  │  • Instalación Norte                                         │  │
│  │  • Instalación Sur                                           │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Tu cuenta:                                                         │
│  📧 maria@example.com                                               │
│                                                                      │
│  Esta invitación expira en: 71 horas                                │
│                                                                      │
│                                                                      │
│         [  ACEPTAR INVITACIÓN  ]    [  RECHAZAR  ]                 │
│         (Botón amarillo)            (Botón gris)                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
│   INVITACIÓN DE EQUIPO         │
├────────────────────────────────┤
│                                │
│ Has sido invitado(a) a:        │
│                                │
│ ┌────────────────────────────┐ │
│ │ 🏢 AGRÍCOLA DEL VALLE SAS  │ │
│ │                            │ │
│ │ Rol: Supervisor            │ │
│ │ Invitado por: Juan Pérez   │ │
│ │                            │ │
│ │ Instalaciones: 2           │ │
│ │ • Instalación Norte        │ │
│ │ • Instalación Sur          │ │
│ └────────────────────────────┘ │
│                                │
│ Tu cuenta:                     │
│ 📧 maria@example.com           │
│                                │
│ Expira en: 71 horas            │
│                                │
│ [ ACEPTAR INVITACIÓN ]         │
│                                │
│ [    RECHAZAR    ]             │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Token validation en page load (URL param)
- Muestra info de la invitación (company, role, inviter, facilities)
- Email del usuario invitado
- Countdown de expiración (72 horas)
- Dos acciones posibles: Aceptar o Rechazar

**API Integration:**
- GET /invitations/validate?token=xxx (on page load)
- POST /invitations/reject (si rechaza)

**Estados:**
- Loading: skeleton mientras valida token
- Valid: muestra invitación
- Invalid/Expired: redirect a Page 11
- Reject confirmation: modal "¿Estás seguro?" antes de rechazar

**Behavior:**
- Aceptar → muestra Page 9 (set password) en misma página
- Rechazar → confirmation popup → API call → redirect a login
- Invalid token → redirect a Page 11

---

### Page 9: Set Password (Invitation Acceptance)

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
│                     CONFIGURA TU CUENTA                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                   Crea tu contraseña:                               │
│                                                                      │
│  Contraseña *                                                       │
│  [_________________________________] [👁]                           │
│                                                                      │
│  Confirmar Contraseña *                                             │
│  [_________________________________] [👁]                           │
│                                                                      │
│  Requisitos de contraseña:                                          │
│  ○ Mínimo 8 caracteres         (se vuelve ✅ cuando cumple)        │
│  ○ 1 letra mayúscula            (se vuelve ✅ cuando cumple)        │
│  ○ 1 número                     (se vuelve ✅ cuando cumple)        │
│  ○ 1 carácter especial          (se vuelve ✅ cuando cumple)        │
│                                                                      │
│  ─────────────────────────────────────────────────────────────      │
│                                                                      │
│  Información Opcional:                                              │
│                                                                      │
│  Teléfono                                                           │
│  [_________________________________]                                │
│                                                                      │
│  Idioma Preferido                                                   │
│  ⚪ Español      ⚪ English                                         │
│                                                                      │
│                                                                      │
│         [  ← VOLVER  ]         [  CREAR CUENTA  ]                  │
│         (a Page 8)             (Botón amarillo)                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
│   CONFIGURA TU CUENTA          │
├────────────────────────────────┤
│                                │
│ Crea tu contraseña:            │
│                                │
│ Contraseña *                   │
│ [____________________] [👁]    │
│                                │
│ Confirmar Contraseña *         │
│ [____________________] [👁]    │
│                                │
│ Requisitos:                    │
│ ○ Mínimo 8 caracteres          │
│ ○ 1 mayúscula                  │
│ ○ 1 número                     │
│ ○ 1 especial                   │
│                                │
│ ───────────────────────        │
│                                │
│ Información Opcional:          │
│                                │
│ Teléfono                       │
│ [________________________]     │
│                                │
│ Idioma                         │
│ ⚪ Español  ⚪ English          │
│                                │
│ [← VOLVER] [CREAR CUENTA]      │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Password inputs con toggle de visibilidad
- Checklist de requisitos con validación en vivo
- Botón habilitado solo cuando todos los requisitos se cumplen
- Campos opcionales separados visualmente
- Botón Volver regresa a Page 8

**API Integration:**
- POST /invitations/accept
  - Params: token, password, phone (optional), language

**Validaciones:**
- Mismas que signup (8 chars, 1 upper, 1 number, 1 special)
- Passwords deben coincidir
- Requisitos se vuelven verdes conforme se cumplen
- Botón deshabilitado hasta cumplir todos

**Estados:**
- Loading: spinner durante creación de cuenta
- Success: auto-login con authToken → navega a Page 10
- Error: mensaje de error (token expirado, etc.)

---

### Page 10: Welcome (Invited User)

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
│                         ¡BIENVENIDO(A)!                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                      ✓ ¡Cuenta Creada!                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  Has sido agregado(a) a:                                     │  │
│  │  🏢 Agrícola del Valle SAS                                   │  │
│  │                                                              │  │
│  │  Tu rol: Supervisor de Producción                           │  │
│  │                                                              │  │
│  │  Instalaciones asignadas: 2                                  │  │
│  │  • Instalación Norte                                         │  │
│  │  • Instalación Sur                                           │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Puedes empezar a trabajar inmediatamente con tu equipo.            │
│                                                                      │
│                                                                      │
│                   [  IR AL PANEL DE CONTROL  ]                      │
│                   (Botón amarillo grande)                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
│     ¡BIENVENIDO(A)!            │
├────────────────────────────────┤
│                                │
│ ✓ ¡Cuenta Creada!              │
│                                │
│ ┌────────────────────────────┐ │
│ │ Has sido agregado(a) a:    │ │
│ │ 🏢 Agrícola del Valle SAS  │ │
│ │                            │ │
│ │ Tu rol:                    │ │
│ │ Supervisor de Producción   │ │
│ │                            │ │
│ │ Instalaciones: 2           │ │
│ │ • Instalación Norte        │ │
│ │ • Instalación Sur          │ │
│ └────────────────────────────┘ │
│                                │
│ Puedes empezar a trabajar      │
│ inmediatamente con tu equipo.  │
│                                │
│ [ IR AL PANEL DE CONTROL ]     │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Success indicator (✓ checkmark)
- Muestra info de la company y rol asignado
- Lista de facilities asignadas
- Guidance sobre próximos pasos
- Un solo CTA grande

**Behavior:**
- currentFacilityId ya establecido (primera facility asignada)
- User ya autenticado (authToken from Page 9)
- Click botón → navega a /dashboard
- Página estática (no API calls)

---

### Page 11: Invitation Invalid

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
│                   INVITACIÓN NO VÁLIDA                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                          ⚠️                                          │
│                                                                      │
│              Esta invitación no es válida                           │
│                     o ha expirado.                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  Posibles razones:                                           │  │
│  │                                                              │  │
│  │  • El enlace ya fue usado                                    │  │
│  │  • Han pasado más de 72 horas desde la invitación           │  │
│  │  • La invitación fue revocada por el administrador          │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Por favor contacta al administrador de tu empresa                  │
│  para recibir una nueva invitación.                                 │
│                                                                      │
│                                                                      │
│                   [  IR A INICIO DE SESIÓN  ]                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
│   INVITACIÓN NO VÁLIDA         │
├────────────────────────────────┤
│                                │
│           ⚠️                   │
│                                │
│ Esta invitación no es válida   │
│ o ha expirado.                 │
│                                │
│ ┌────────────────────────────┐ │
│ │ Posibles razones:          │ │
│ │                            │ │
│ │ • Enlace ya usado          │ │
│ │ • Pasaron +72 horas        │ │
│ │ • Invitación revocada      │ │
│ └────────────────────────────┘ │
│                                │
│ Contacta al administrador      │
│ de tu empresa para recibir     │
│ una nueva invitación.          │
│                                │
│ [ IR A INICIO DE SESIÓN ]      │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Warning icon (⚠️)
- Mensaje claro de error
- Lista de posibles causas
- Instrucciones de qué hacer
- Un solo botón → login

**Behavior:**
- Página estática (no hay API calls)
- Landing page para tokens inválidos/expirados
- Click botón → redirect a /login

---

## ADDITIONAL PAGES (Module 6 - Login & Session)

### Page 12: Login

**Desktop**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          🌱 ALQUEMIST                                │
│                     Trazabilidad Agrícola                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                   BIENVENIDO DE VUELTA                              │
│                                                                      │
│  Correo Electrónico                                                 │
│  [_________________________________]                                │
│                                                                      │
│  Contraseña                                                         │
│  [_________________________________] [👁]                           │
│                                                                      │
│  [Olvidé mi contraseña]                                             │
│                                                                      │
│  [         INICIAR SESIÓN         ]                                 │
│  (Botón amarillo)                                                   │
│                                                                      │
│  ¿No tienes cuenta? [Regístrate]                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile**
```
┌────────────────────────────────┐
│       🌱 ALQUEMIST             │
│   Trazabilidad Agrícola        │
├────────────────────────────────┤
│                                │
│  BIENVENIDO DE VUELTA          │
│                                │
│ Correo Electrónico             │
│ [________________________]     │
│                                │
│ Contraseña                     │
│ [____________________] [👁]    │
│                                │
│ [Olvidé mi contraseña]         │
│                                │
│ [  INICIAR SESIÓN  ]           │
│                                │
│ ¿No tienes cuenta?             │
│ [Regístrate]                   │
│                                │
└────────────────────────────────┘
```

**API Integration:**
- POST /auth/login
  - Returns: token, userId, companyId, user data

**Estados:**
- Loading: spinner en botón
- Success: store token → redirect a /dashboard
- Error: "Email o contraseña incorrectos"

---

## TECHNICAL IMPLEMENTATION NOTES

### Email Service Integration (Resend)

**Setup:**
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'Alquemist <onboarding@alquemist.com>',
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }

  return data;
}
```

**Server Action (Page 1 - Signup):**
```typescript
// app/signup/actions.ts
'use server'

import { sendVerificationEmail } from '@/lib/email';

export async function registerUser(formData) {
  // 1. Call Convex to create user and get email content
  const result = await convex.mutation(api.registration.registerUserStep1, {
    email: formData.email,
    password: formData.password,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
  });

  // 2. Send email using Resend (Next.js handles this, not Convex)
  await sendVerificationEmail({
    to: result.email,
    subject: result.emailSubject,
    html: result.emailHtml,
  });

  return { success: true, userId: result.userId };
}
```

### Responsive Breakpoints

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      sm: '640px',  // Mobile landscape
      md: '768px',  // Tablet portrait
      lg: '1024px', // Desktop
      xl: '1280px', // Large desktop
    },
  },
};
```

### Form Validation

```typescript
// lib/validations.ts
import { z } from 'zod';

export const signupSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos 1 mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos 1 carácter especial'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
```

### Navigation Flow

```typescript
// First User Flow
/signup (Page 1)
  → /verify-email (Page 2)
    → /company-setup (Page 3)
      → /facility/basic (Page 5)
        → /facility/location (Page 6)
          → /onboarding-complete (Page 7)
            → /dashboard

// Invited User Flow
/accept-invitation?token=xxx (Page 8)
  → /accept-invitation?token=xxx (Page 9 - same route, different state)
    → /welcome-invited (Page 10)
      → /dashboard

// Login
/login (Page 12)
  → /dashboard
```

---

## SUMMARY

### Total Wireframes Created
- **11 screens** (7 first user + 4 invited user)
- **Desktop and mobile** versions for all
- **Low-fidelity** ASCII art format

### Key Adaptations from Bubble to Next.js
1. **Email sending**: Convex generates HTML → Resend sends (via Next.js Server Actions)
2. **Routing**: Next.js App Router with URL-based navigation
3. **Forms**: React Hook Form + Zod validation
4. **State**: URL params + React state (no Bubble state management)
5. **API**: Direct Convex mutations/queries from client components
6. **Responsive**: Tailwind CSS breakpoints
7. **Components**: shadcn/ui for base components

### Next Steps for Implementation
1. Initialize Next.js 15 project
2. Install dependencies (Convex, Resend, shadcn/ui)
3. Configure Tailwind with color palette
4. Setup Resend API key
5. Create route structure
6. Implement forms with validation
7. Integrate Convex mutations
8. Test email flows end-to-end

---

**Wireframes completos y listos para implementación**
