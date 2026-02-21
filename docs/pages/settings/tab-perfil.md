# Tab Perfil

Tab 1 de `/settings/account?tab=profile`. Informacion personal del usuario.

## Avatar

Avatar circular (80x80) con iniciales del nombre y apellido sobre fondo `#1B5E20`. Debajo, nombre completo y email. El avatar no es editable.

## Campos del Formulario

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Nombre | Text input | Si | Min 2, max 50 caracteres |
| Apellido | Text input | Si | Min 2, max 50 caracteres |
| Email | Text input (disabled) | — | No editable. Mensaje: "El email no puede ser modificado" |
| Telefono | Tel input | No | Formato colombiano: `+57 XXX XXX XXXX` o `3XX XXX XXXX` |
| Tipo de Identificacion | Select | No | `CC`, `CE`, `NIT`, `Passport` |
| Numero de Identificacion | Text input | No | Max 50 caracteres |

Los campos se muestran en grid de 2 columnas (nombre/apellido, email/telefono, tipo ID/numero).

## Dirty State

El formulario reporta cambios sin guardar al componente padre via `onDirtyChange`. Se sincroniza reactivamente cuando los datos del usuario cambian externamente (sin sobreescribir ediciones en curso).

## Al Guardar

1. Valida via `userProfileSettingsSchema` (Zod)
2. Llama `api.users.updateProfile`
3. Toast de exito. Errores parseados con `parseConvexError` para mensajes especificos
4. Reset del formulario para limpiar dirty state

## Componentes

- `components/settings/profile-form.tsx` — formulario completo
- Mutation: `api.users.updateProfile`
- Schema: `lib/validations/settings.ts` → `userProfileSettingsSchema`
