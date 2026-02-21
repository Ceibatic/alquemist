# Tab General

Tab 1 de `/settings/facility?tab=general`. Muestra la configuracion basica de la instalacion.

## Campos del Formulario

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Nombre de la Instalacion | Text input | Si | Min 3, max 200 caracteres |
| Tipo de Instalacion | Select | Si | `indoor`, `outdoor`, `greenhouse`, `mixed` |
| Cultivos Primarios | Multi-checkbox | Si | Min 1 seleccionado. Opciones dinamicas de `api.crops.getCropTypes` |
| Area Total (m2) | Number input | No | Numerico, step any |
| Estado | RadioGroup | Si | `active` (Activa), `inactive` (Inactiva) |

## Al Guardar

1. Valida via Zod (`generalInfoSchema` local)
2. Llama `api.facilities.update` con los campos del formulario
3. Toast de exito o error

## Componentes

- `components/settings/general-info-form.tsx` — formulario completo
- Query: `api.crops.getCropTypes` (para opciones de cultivos primarios)
- Mutation: `api.facilities.update`
