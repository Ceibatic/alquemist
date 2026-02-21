# Subpaginas de Configuracion

## `/settings/facility` — Configuracion de Instalacion

Pagina con tabs para configurar la instalacion del usuario. Carga la primera instalacion accesible del usuario.

### Tabs

| Tab | Valor URL | Contenido |
|-----|-----------|-----------|
| General | `general` (default) | Nombre, tipo, cultivos, area, estado |
| Ubicacion | `ubicacion` | Direccion, departamento/municipio, GPS, altitud |
| Licencias | `licencias` | Numero de licencia, tipo, autoridad, fechas, alerta de vencimiento |

Los tabs se reflejan en URL via `?tab=general|ubicacion|licencias`.

**Breadcrumbs**: Inicio > Configuracion > Instalacion

**Query**: `api.users.getUserById`, `api.facilities.get`

**Mutation**: `api.facilities.update` (compartida por los 3 tabs)

**Componentes**:
- `components/settings/facility-settings-tabs.tsx` — contenedor de tabs
- `components/settings/general-info-form.tsx` — ver [tab-general.md](./tab-general.md)
- `components/settings/location-form.tsx` — ver [tab-ubicacion.md](./tab-ubicacion.md)
- `components/settings/license-form.tsx` — ver [tab-licencias.md](./tab-licencias.md)

**Ruta**: `app/(dashboard)/settings/facility/page.tsx`

---

## `/settings/account` — Mi Cuenta

Pagina con tabs para configurar el perfil, preferencias y seguridad del usuario. Incluye dirty-state guard: si hay cambios sin guardar en un tab y se intenta navegar a otro, muestra AlertDialog de confirmacion. Indicador visual (punto amber) en el tab con cambios pendientes. Listener `beforeunload` para prevenir cierre de ventana con cambios sin guardar.

### Tabs

| Tab | Valor URL | Contenido |
|-----|-----------|-----------|
| Perfil | `profile` (default) | Avatar, nombre, email, telefono, identificacion |
| Preferencias | `preferences` | Tema, instalacion por defecto |
| Seguridad | `security` | Cambio de contrasena con indicador de fortaleza |

Los tabs se reflejan en URL via `?tab=profile|preferences|security`.

**Breadcrumbs**: Inicio > Configuracion > Mi Cuenta

**Query**: `api.users.getCurrentUser`, `api.users.getUserById`

**Mutation**: `api.users.updateProfile` (perfil), `api.users.updatePreferences` (preferencias), Clerk `updatePassword()` (seguridad)

**Componentes**:
- `components/settings/account-settings-tabs.tsx` — contenedor de tabs con dirty-state guard
- `components/settings/profile-form.tsx` — ver [tab-perfil.md](./tab-perfil.md)
- `components/settings/preferences-form.tsx` — ver [tab-preferencias.md](./tab-preferencias.md)
- `components/settings/security-form.tsx` — ver [tab-seguridad.md](./tab-seguridad.md)

**Ruta**: `app/(dashboard)/settings/account/page.tsx`

---

## `/settings/subscription` — Suscripcion

Pagina read-only que muestra el plan actual y los planes disponibles.

Ver [suscripcion.md](./suscripcion.md) para detalle completo.

**Breadcrumbs**: Inicio > Configuracion > Suscripcion

**Query**: `api.subscription.getStatus`

**Componentes**:
- Pagina inline, sin componentes extraidos

**Ruta**: `app/(dashboard)/settings/subscription/page.tsx`
