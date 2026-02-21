# Configuracion — Vista General

## URL

`/settings` — hub de navegacion con cards hacia las secciones de configuracion.

## Estructura

Pagina estatica con 3 cards en grid `md:grid-cols-2`, cada una enlaza a una subpagina. Al final, card de ayuda.

| Card | Icono | Color | Destino |
|------|-------|-------|---------|
| Configuracion de Instalacion | Building2 | green | `/settings/facility` |
| Mi Cuenta | User | blue | `/settings/account` |
| Suscripcion | CreditCard | amber | `/settings/subscription` |

Cada card muestra un listado de bullets con las funciones disponibles y un boton de accion.

## Sidebar

Entrada "Configuracion" en el sidebar principal.

## Subpaginas

| Ruta | Proposito |
|------|-----------|
| `/settings/facility` | Configuracion de la instalacion (general, ubicacion, licencias) |
| `/settings/account` | Perfil de usuario, preferencias y seguridad |
| `/settings/subscription` | Plan actual y planes disponibles (read-only) |
| `/settings/activity-types` | Gestion de tipos de actividad (CRUD) — accesible por URL directa |

Ver [subpaginas.md](./subpaginas.md) para detalle de cada subpagina.

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/settings/page.tsx` | Hub de configuracion con cards de navegacion |
| `app/(dashboard)/settings/facility/page.tsx` | Pagina de configuracion de instalacion |
| `app/(dashboard)/settings/account/page.tsx` | Pagina de configuracion de cuenta |
| `app/(dashboard)/settings/subscription/page.tsx` | Pagina de suscripcion |
| `app/(dashboard)/settings/activity-types/page.tsx` | Pagina de tipos de actividad |
| `components/settings/facility-settings-tabs.tsx` | Contenedor de tabs de instalacion |
| `components/settings/account-settings-tabs.tsx` | Contenedor de tabs de cuenta con dirty-state guard |
| `components/settings/general-info-form.tsx` | Formulario de informacion general |
| `components/settings/location-form.tsx` | Formulario de ubicacion |
| `components/settings/license-form.tsx` | Formulario de licencias |
| `components/settings/profile-form.tsx` | Formulario de perfil de usuario |
| `components/settings/preferences-form.tsx` | Formulario de preferencias (tema, facility default) |
| `components/settings/security-form.tsx` | Formulario de cambio de contrasena |
| `convex/facilities.ts` | Backend de instalaciones (queries y mutations) |
| `convex/users.ts` | Backend de usuarios (profile, preferences) |
| `convex/subscription.ts` | Backend de suscripcion |
| `lib/validations/settings.ts` | Schemas Zod para perfil, contrasena |
