# Wireframes Next.js - Alquemist

Esta carpeta contiene wireframes de baja fidelidad para la implementación de Alquemist en Next.js 15, optimizados para desarrollo local con PWA capabilities.

---

## Estructura de Archivos

```
/docs/ui/nextjs/
├── README.md                            # Este archivo
├── PHASE-1-ONBOARDING-WIREFRAMES.md     # ✅ Onboarding & Authentication (11 pantallas)
├── PHASE-2-BASIC-SETUP-WIREFRAMES.md    # 🔜 Próximamente
└── PHASE-3-ADVANCED-WIREFRAMES.md       # 🔜 Próximamente
```

---

## Fases de Desarrollo

### PHASE 1: Onboarding & Authentication ✅
**Estado**: Wireframes completos
**Archivo**: [PHASE-1-ONBOARDING-WIREFRAMES.md](./PHASE-1-ONBOARDING-WIREFRAMES.md)

**Pantallas incluidas (11 total):**

**First User Flow (7 pantallas):**
1. Signup Form - Registro de usuario
2. Email Verification - Verificación de email con código de 8 dígitos
3. Company Setup - Crear empresa
4. Choose Plan - Selección de plan (SKIP FOR MVP)
5. Facility Basic Info - Información básica de instalación
6. Facility Location - Ubicación de instalación
7. Setup Complete - Confirmación y redirección a dashboard

**Invited User Flow (4 pantallas):**
8. Accept Invitation - Landing page de invitación
9. Set Password - Crear contraseña para usuario invitado
10. Welcome - Confirmación de cuenta creada
11. Invitation Invalid - Error de token inválido/expirado

**Additional:**
12. Login - Inicio de sesión

---

### PHASE 2: Basic Operations Setup 🔜
**Estado**: Pendiente
**Pantallas planeadas:**
- Dashboard principal
- Gestión de Áreas de Cultivo (CRUD)
- Gestión de Cultivares (CRUD)
- Gestión de Proveedores (CRUD)
- User Management & Roles

---

### PHASE 3: Production & Inventory 🔜
**Estado**: Pendiente
**Pantallas planeadas:**
- Gestión de Lotes (CRUD)
- Inventario de productos
- Sistema de actividades
- Trazabilidad de lotes

---

## Formato de Wireframes

Todos los wireframes en esta carpeta siguen el mismo formato:

### Características:
- **ASCII Art**: Usando box-drawing characters (┌─┐│└┘├┤)
- **Responsive**: Versiones desktop (~73 chars) y mobile (~32 chars)
- **Baja Fidelidad**: Estructura y contenido, sin diseño visual detallado
- **Iconos**: Emoji para status y acciones visuales
- **Completo**: Incluye elementos clave, API integration, validaciones, estados

### Estructura de cada pantalla:
```markdown
### Page X: Nombre de la Pantalla

**Desktop (73 chars)**
[wireframe ASCII art]

**Mobile (32 chars)**
[wireframe ASCII art]

**Elementos Clave:**
- Lista de features principales

**API Integration:**
- Endpoints y métodos

**Validaciones:**
- Reglas de validación

**Estados:**
- Loading, Success, Error
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Server Components, Turbopack)
- **React**: 19
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React (NO emojis en producción)
- **Forms**: React Hook Form + Zod
- **i18n**: use-intl (Español/Inglés)
- **PWA**: next-pwa

### Backend Integration
- **Backend**: Convex (https://handsome-jay-388.convex.site)
- **Email Service**: Resend (via Next.js Server Actions)

### Design System
- **Primary Color**: #1B5E20 (verde oscuro)
- **Accent Color**: #FFC107 (amarillo)
- **Background**: #E8E9F3 (lavanda claro)

---

## Adaptaciones de Bubble a Next.js

Los wireframes en esta carpeta han sido adaptados desde los wireframes de Bubble ([/docs/ui/bubble/](../bubble/)) para desarrollo local con Next.js:

### Principales cambios:
1. **Email Sending**: Convex genera HTML → Resend envía (via Next.js Server Actions)
2. **Routing**: Next.js App Router con navegación URL-based
3. **Forms**: React Hook Form + Zod validation (no Bubble form validation)
4. **State Management**: URL params + React state (no Bubble state)
5. **API Integration**: Direct Convex mutations/queries desde client components
6. **Responsive**: Tailwind CSS breakpoints (mobile-first)
7. **Components**: shadcn/ui base components (no Bubble visual elements)

---

## Referencias

### Documentación del Proyecto
- [API Endpoints Phase 1](../../api/PHASE-1-ONBOARDING-ENDPOINTS.md)
- [Wireframes Bubble Phase 1](../bubble/PHASE-1-ONBOARDING.md)
- [Frontend Development Guide](../../setup-reference/FRONTEND-DESARROLLO-LOCAL.md)
- [Design System](../../setup-reference/FRONTEND-DESIGN-SYSTEM.md)

### Documentación Externa
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Resend Docs](https://resend.com/docs)

---

## Próximos Pasos

1. ✅ Wireframes Phase 1 completados y organizados
2. 🔜 Implementar Phase 1 screens en Next.js
3. 🔜 Crear wireframes Phase 2
4. 🔜 Implementar Phase 2 screens

---

**Última actualización**: Noviembre 2025
