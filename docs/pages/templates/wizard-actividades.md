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
| Dia inicio / Dia fin | Inputs numericos | No | Rango de dias dentro de la fase donde aplica (ej: dia 1 al 14 de vegetativo). Se usa para programacion automatica |

## Paso 2 — Campos del Formulario

Define que campos aparecen al reportar la actividad:
- **Campos esenciales** (bloqueados, siempre presentes): fecha, responsable, notas
- **Campos opcionales** (checkboxes para activar/desactivar): duracion, cantidad aplicada, condiciones climaticas, etc.

La seleccion determina que campos ve el operador al ejecutar la actividad.

## Paso 3 — Recursos

Configura materiales e insumos necesarios para la actividad:
- **Filtro por categoria**: Dropdown con categorias disponibles (Semillas, Nutrientes, Pesticidas, Equipos, Sustratos, Contenedores, Herramientas, etc.)
- **Buscador**: Input con busqueda por nombre o codigo en catalogo de productos. La lista de resultados aparece al seleccionar categoria o escribir en el buscador
- **Resultados**: Cada producto muestra nombre, badge de categoria, codigo, unidad de medida, precio unitario y proveedor
- **Carrito de seleccion**: Lista de productos agregados con la misma informacion enriquecida
- **Campos por recurso** (inline): cantidad, base de calculo (fijo/por planta/por m²/por zona/por L solucion), direccion (consumido/aplicado/producido)
- **Campos avanzados** (expandible por recurso): metodo de aplicacion, tasa de aplicacion, notas, toggle recurso requerido/opcional

## Paso 4 — Configuracion Final

| Seccion | Contenido |
|---------|-----------|
| Calidad | Toggle para vincular QC template + selector de template con preview |
| Documentacion | Toggles para requerir fotos y/o adjuntos |
| Recurrencia | Frecuencia (una vez/diario/semanal/bisemanal/mensual/a demanda/custom), intervalo custom en dias, repeticiones, duracion estimada, horas labor por 1000 plantas |
| Dependencias | Colapsable: selector de template dependiente + dias minimos despues de dependencia |

## Navegacion

- Botones "Anterior" y "Siguiente" en cada paso
- Paso 1 requiere validacion antes de avanzar
- "Guardar" disponible en paso 4
- Al guardar exitosamente: toast de confirmacion + redireccion a `/templates?tab=activities`
- Modo edicion: carga datos existentes en todos los pasos

## Componentes

- `components/activity-templates/activity-template-wizard.tsx` — wizard principal, tipos (WizardFormData, ResourceItem, ProductListItem)
- `components/activity-templates/wizard-step-basic.tsx` — paso 1
- `components/activity-templates/wizard-step-fields.tsx` — paso 2
- `components/activity-templates/wizard-step-resources.tsx` — paso 3
- `components/activity-templates/wizard-step-config.tsx` — paso 4
- Query: `api.activityTemplates.getById` (modo edicion)
- Mutation: `api.activityTemplates.create` / `api.activityTemplates.update`
