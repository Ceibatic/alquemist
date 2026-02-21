# Tab Licencias

Tab 3 de `/settings/facility?tab=licencias`. Informacion sobre licencias y permisos regulatorios.

## Alerta de Estado

Al inicio del formulario se muestra una alerta dinamica basada en la fecha de vencimiento:

| Estado | Condicion | Color | Icono |
|--------|-----------|-------|-------|
| Vencida | Fecha vencimiento < hoy | destructive (rojo) | AlertTriangle |
| Por Vencer | Vencimiento <= 90 dias | warning (amarillo) | Clock |
| Vigente | Vencimiento > 90 dias | success (verde) | CheckCircle2 |

La alerta muestra el mensaje con dias restantes y un Badge con el estado.

## Campos del Formulario

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Numero de Licencia | Text input | Si | Min 1, max 100 caracteres |
| Tipo de Licencia | Select | Si | `cultivation`, `processing`, `research`, `production`, `distribution`, `other` |
| Autoridad Emisora | Select | Si | `ICA`, `INVIMA`, `MinSalud`, `MinAgricultura`, `other` |
| Fecha de Emision | Date input | Si | — |
| Fecha de Vencimiento | Date input | Si | — |

## Al Guardar

1. Valida via Zod (`licenseSchema` local)
2. Convierte fechas a timestamps
3. Llama `api.facilities.update` con los campos del formulario
4. Toast de exito o error

## Componentes

- `components/settings/license-form.tsx` — formulario completo con alerta de estado
- Mutation: `api.facilities.update`
