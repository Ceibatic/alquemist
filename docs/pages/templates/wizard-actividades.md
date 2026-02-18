# Wizard de Activity Templates

Wizard de 4 pasos para crear y editar templates de actividad. Se accede via `/activity-templates/new` (crear) o `/activity-templates/[id]` (editar).

## Indicador de Progreso

Barra horizontal con 4 pasos numerados. Paso actual destacado, pasos completados con checkmark. Navegacion libre entre pasos completados.

## Paso 1 — Tipo y Basico

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| Nombre | Input texto | Si | Nombre descriptivo del template |
| Codigo | Input texto | Auto | Generado automaticamente, editable |
| Tipo de actividad | Dropdown | Si | Selecciona de tipos configurados por empresa |
| Prioridad | Dropdown | No | low / medium / high / critical |
| Descripcion | Textarea | No | Descripcion detallada |
| Fases aplicables | Badge toggles | No | Propagacion, Vegetativo, Floracion, etc. |
| Rango de dias en fase | Inputs min/max | No | Dias dentro de la fase donde aplica |

## Paso 2 — Campos del Formulario

Define que campos aparecen al reportar la actividad:
- **Campos esenciales** (bloqueados, siempre presentes): fecha, responsable, notas
- **Campos opcionales** (checkboxes para activar/desactivar): duracion, cantidad aplicada, condiciones climaticas, etc.

La seleccion determina que campos ve el operador al ejecutar la actividad.

## Paso 3 — Recursos

Configura materiales e insumos necesarios para la actividad:
- **Buscador**: Input con busqueda en catalogo de productos
- **Carrito de seleccion**: Lista de productos agregados
- **Campos por recurso** (inline): cantidad, unidad base, direccion (entrada/salida)
- **Campos avanzados** (expandible): costo unitario, notas

## Paso 4 — Configuracion Final

| Seccion | Contenido |
|---------|-----------|
| Calidad | Checkbox para vincular QC template + selector de template |
| Documentacion | Toggles para requerir fotos y/o adjuntos |
| Recurrencia | Frecuencia (diaria/semanal/mensual), intervalo, repeticiones |
| Dependencias | Colapsable con lista de otros templates que deben completarse antes |

## Navegacion

- Botones "Anterior" y "Siguiente" en cada paso
- Paso 1 requiere validacion antes de avanzar
- "Guardar" disponible en paso 4
- Modo edicion: carga datos existentes en todos los pasos

## Componentes

- `components/activity-templates/activity-template-wizard.tsx` — wizard principal
- Wizard steps como componentes internos
- Query: `api.activityTemplates.getById` (modo edicion)
- Mutation: `api.activityTemplates.create` / `api.activityTemplates.update`
