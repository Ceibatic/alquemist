# Tab Preferencias

Tab 2 de `/settings/account?tab=preferences`. Preferencias de experiencia del usuario.

## Campos del Formulario

| Campo | Tipo | Requerido | Opciones |
|-------|------|-----------|----------|
| Tema | Select | Si | `light` (Claro), `dark` (Oscuro), `system` (Sistema) |
| Instalacion por defecto | Select | No | Instalaciones accesibles del usuario (dinamico) |

## Comportamiento del Tema

El cambio de tema se aplica inmediatamente via `next-themes` `setTheme()` al seleccionar una opcion, sin necesidad de guardar. El boton "Guardar Cambios" persiste la preferencia en la base de datos para que se mantenga entre sesiones.

## Instalacion por Defecto

Muestra solo las instalaciones a las que el usuario tiene acceso (filtradas por `accessible_facility_ids`). Se usa en `facilities-content.tsx` para seleccionar la instalacion inicial al entrar a la app.

## Al Guardar

1. Llama `api.users.updatePreferences` con `theme` y `default_facility_id`
2. Toast de exito. Errores parseados con `parseConvexError`
3. Reset del formulario para limpiar dirty state

## Componentes

- `components/settings/preferences-form.tsx` — formulario completo
- Query: `api.facilities.getFacilitiesByCompany` (para opciones de instalacion)
- Mutation: `api.users.updatePreferences`
