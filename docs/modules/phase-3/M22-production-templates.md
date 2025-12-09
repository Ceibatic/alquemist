# Module 22: Production Templates

## Overview

El modulo de Templates de Produccion permite crear plantillas reutilizables que definen el flujo de produccion de cultivos. Cada template define las fases de crecimiento, actividades programadas, materiales necesarios, y condiciones ambientales requeridas. Los templates se usan para crear ordenes de produccion y generar actividades automaticamente.

**Estado**: Pendiente de implementacion

---

## User Stories

### US-22.1: Ver lista de templates
**Como** administrador de produccion
**Quiero** ver todos los templates de produccion disponibles
**Para** seleccionar cual usar para nuevas ordenes

**Criterios de Aceptacion:**
- [ ] Grid de cards con todos los templates de la empresa
- [ ] Filtro por tipo de cultivo (dropdown de crop_types)
- [ ] Filtro por categoria: Semilla a cosecha, Solo propagacion, Custom
- [ ] Cada card muestra: nombre, tipo cultivo, cultivar (si especifico), duracion estimada, fases, metodo, usos totales
- [ ] Badge "Publico" si is_public = true
- [ ] Cards clickeables navegan a `/templates/[id]`
- [ ] Menu kebab: Ver, Editar, Duplicar, Archivar
- [ ] Stats: Total templates, Por tipo de cultivo, Promedio de exito
- [ ] Estado vacio: icono FileTemplate + mensaje + CTA "Crear Primer Template"

**Consulta:** `productionTemplates.list({ companyId, cropTypeId?, status? })`

**Componentes:** [templates/page.tsx](app/(dashboard)/templates/page.tsx), [template-list.tsx](components/templates/template-list.tsx)

---

### US-22.2: Crear nuevo template
**Como** administrador de produccion
**Quiero** crear un template de produccion
**Para** estandarizar procesos y automatizar actividades

**Criterios de Aceptacion:**
- [ ] Boton "Crear Template" abre wizard multi-paso
- [ ] **Paso 1 - Informacion Basica:**
  - Nombre* (min 3 caracteres)
  - Descripcion
  - Tipo de cultivo* (select de crop_types)
  - Cultivar especifico (opcional, select de cultivars)
  - Categoria (seed-to-harvest, propagation-only, custom)
  - Metodo de produccion (indoor, outdoor, greenhouse)
  - Tipo de fuente (seed, clone, tissue_culture)
- [ ] **Paso 2 - Configuracion de Batch:**
  - Tamano de batch por defecto (plantas)
  - Habilitar tracking individual (toggle)
  - Duracion estimada total (dias)
  - Rendimiento estimado + unidad
  - Nivel de dificultad (beginner, intermediate, advanced)
- [ ] **Paso 3 - Requerimientos:**
  - Requerimientos ambientales (temp, humedad, luz)
  - Requerimientos de espacio (m²)
  - Costo estimado
- [ ] **Paso 4 - Fases:**
  - Agregar fases de produccion (ver US-22.3)
  - Minimo 1 fase requerida
- [ ] Template se crea como `status: active`, `is_public: false`
- [ ] Toast de exito al crear

**Escribe:** `productionTemplates.create({ companyId, name, cropTypeId, cultivarId?, templateCategory, ... })`

**Validaciones backend:**
- crop_type existe
- cultivar existe y es compatible con crop_type
- min 1 fase agregada

**Componentes:** [template-wizard.tsx](components/templates/template-wizard.tsx), [template-basic-info-step.tsx](components/templates/template-basic-info-step.tsx)

---

### US-22.3: Gestionar fases del template
**Como** administrador de produccion
**Quiero** definir las fases de crecimiento en el template
**Para** estructurar el proceso de produccion

**Criterios de Aceptacion:**
- [ ] Seccion de fases dentro del wizard/editor
- [ ] Lista ordenable de fases (drag & drop)
- [ ] Cada fase tiene:
  - Nombre de fase* (ej: Germinacion, Vegetativo, Floracion)
  - Orden secuencial (auto-asignado)
  - Duracion estimada en dias*
  - Tipo de area requerido* (select: propagation, vegetative, flowering, etc.)
  - Fase anterior (auto-linkado)
  - Condiciones requeridas (temp, humedad, luz, pH)
  - Criterios de completitud
  - Equipos requeridos
  - Materiales requeridos
  - Descripcion
- [ ] Boton "Agregar Fase" abre modal
- [ ] Opcion de eliminar fase (con confirmacion si tiene actividades)
- [ ] Preview de timeline visual con duracion total
- [ ] Fases predefinidas sugeridas segun crop_type

**Escribe:** `templatePhases.create({ templateId, phaseName, phaseOrder, estimatedDurationDays, areaType, ... })`
**Escribe:** `templatePhases.update({ phaseId, ... })`
**Escribe:** `templatePhases.remove({ phaseId })`

**Componentes:** [template-phases-editor.tsx](components/templates/template-phases-editor.tsx), [phase-form-modal.tsx](components/templates/phase-form-modal.tsx)

---

### US-22.4: Gestionar actividades de fase
**Como** administrador de produccion
**Quiero** definir las actividades dentro de cada fase
**Para** automatizar la programacion de tareas

**Criterios de Aceptacion:**
- [ ] Seccion de actividades dentro de cada fase
- [ ] Lista ordenable de actividades
- [ ] Cada actividad tiene:
  - Nombre* (ej: Riego inicial, Fertilizacion, Poda)
  - Orden secuencial
  - Tipo de actividad* (watering, feeding, pruning, inspection, etc.)
  - Es recurrente (toggle)
  - Es control de calidad (toggle)
  - Configuracion de timing (dias desde inicio, hora)
  - Materiales requeridos
  - Duracion estimada (minutos)
  - Nivel de skill requerido
  - Template de quality check (si es QC)
  - Instrucciones
  - Notas de seguridad
- [ ] **Si es recurrente:**
  - Frecuencia (daily, every_2_days, weekly, biweekly)
  - Hasta cuando (fin de fase o fecha especifica)
- [ ] Actividades predefinidas segun tipo de fase
- [ ] Boton "Agregar Actividad"

**Escribe:** `templateActivities.create({ phaseId, activityName, activityOrder, activityType, isRecurring, ... })`

**Componentes:** [phase-activities-editor.tsx](components/templates/phase-activities-editor.tsx), [activity-form-modal.tsx](components/templates/activity-form-modal.tsx)

---

### US-22.5: Ver detalle de template
**Como** administrador de produccion
**Quiero** ver todos los detalles de un template
**Para** entender el flujo de produccion antes de usarlo

**Criterios de Aceptacion:**
- [ ] Pagina `/templates/[id]` con informacion completa
- [ ] Header con nombre + badges (tipo cultivo, categoria, publico)
- [ ] Botones: Editar, Duplicar, Usar en Orden
- [ ] Breadcrumb: Inicio > Templates > [Nombre]
- [ ] **Card Informacion General:**
  - Tipo cultivo, cultivar, metodo produccion
  - Fuente (semilla/clon/tejido)
  - Duracion total, rendimiento estimado
  - Dificultad, costo estimado
  - Veces usado, tasa de exito promedio
- [ ] **Card Configuracion Batch:**
  - Tamano por defecto
  - Tracking individual habilitado
- [ ] **Card Requerimientos:**
  - Ambientales (temp, humedad, luz)
  - Espacio
- [ ] **Seccion Timeline de Fases:**
  - Vista horizontal tipo Gantt simplificado
  - Cada fase como bloque con duracion proporcional
  - Click en fase expande actividades
- [ ] **Detalle por Fase:**
  - Lista de actividades con iconos por tipo
  - Indicadores: recurrente, quality check
  - Materiales y equipos requeridos

**Consulta:** `productionTemplates.getById({ templateId })` con fases y actividades

**Componentes:** [templates/[id]/page.tsx](app/(dashboard)/templates/[id]/page.tsx), [template-timeline.tsx](components/templates/template-timeline.tsx)

---

### US-22.6: Editar template
**Como** administrador de produccion
**Quiero** modificar un template existente
**Para** mejorar el proceso basado en experiencia

**Criterios de Aceptacion:**
- [ ] Pagina `/templates/[id]/edit` con wizard pre-poblado
- [ ] Todos los campos editables
- [ ] Advertencia si template ya fue usado en ordenes
- [ ] Opcion de crear version nueva en lugar de editar
- [ ] Fases y actividades editables en el mismo flujo
- [ ] Botones: Cancelar + Guardar Cambios
- [ ] Toast de exito al guardar

**Consulta:** `productionTemplates.getById({ templateId })`
**Escribe:** `productionTemplates.update({ templateId, ... })`

**Componentes:** [templates/[id]/edit/page.tsx](app/(dashboard)/templates/[id]/edit/page.tsx)

---

### US-22.7: Duplicar template
**Como** administrador de produccion
**Quiero** duplicar un template existente
**Para** crear variaciones sin empezar de cero

**Criterios de Aceptacion:**
- [ ] Boton "Duplicar" en detalle o menu kebab
- [ ] Copia todas las fases y actividades
- [ ] Nombre: "[Original] - Copia"
- [ ] Nuevo template en estado `active`
- [ ] Contadores reseteados (usage_count = 0)
- [ ] Redirige a editar el nuevo template
- [ ] Toast de exito

**Escribe:** `productionTemplates.duplicate({ templateId, newName? })`

---

### US-22.8: Archivar/Restaurar template
**Como** administrador de produccion
**Quiero** archivar templates que ya no uso
**Para** mantener la lista organizada

**Criterios de Aceptacion:**
- [ ] Boton "Archivar" en menu kebab
- [ ] Confirmacion antes de archivar
- [ ] Template no aparece en lista por defecto
- [ ] Filtro para ver archivados
- [ ] Opcion de restaurar template archivado
- [ ] Toast de confirmacion

**Escribe:** `productionTemplates.archive({ templateId })`
**Escribe:** `productionTemplates.restore({ templateId })`

---

### US-22.9: Gestionar recetas
**Como** administrador de produccion
**Quiero** crear recetas de nutrientes y pesticidas
**Para** usarlas en actividades del template

**Criterios de Aceptacion:**
- [ ] Pagina `/recipes` con lista de recetas
- [ ] Crear receta con:
  - Nombre*, descripcion
  - Tipo (nutrient, pesticide, fertilizer)
  - Cultivos aplicables (multi-select)
  - Etapas de crecimiento aplicables
  - Ingredientes (producto + cantidad + unidad)
  - Cantidad de salida
  - Pasos de preparacion
  - Metodo de aplicacion
  - Instrucciones de almacenamiento
  - Vida util (horas)
  - pH y EC objetivo
  - Costo estimado
- [ ] Recetas usables en actividades de template
- [ ] Tracking de veces usada y tasa de exito

**Consulta:** `recipes.list({ companyId, recipeType? })`
**Escribe:** `recipes.create({ companyId, name, recipeType, ... })`

**Componentes:** [recipes/page.tsx](app/(dashboard)/recipes/page.tsx), [recipe-form.tsx](components/recipes/recipe-form.tsx)

---

## Schema

### Tabla: `production_templates`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | Empresa propietaria |
| `name` | `string` | Nombre del template |
| `crop_type_id` | `id("crop_types")` | Tipo de cultivo |
| `cultivar_id` | `id("cultivars")?` | Cultivar especifico (opcional) |
| `template_category` | `string?` | seed-to-harvest/propagation |
| `production_method` | `string?` | indoor/outdoor/greenhouse |
| `source_type` | `string?` | seed/clone/tissue_culture |
| `default_batch_size` | `number` | Plantas por batch (default: 50) |
| `enable_individual_tracking` | `boolean` | Tracking individual (default: false) |
| `description` | `string?` | Descripcion |
| `estimated_duration_days` | `number?` | Duracion total |
| `estimated_yield` | `number?` | Rendimiento esperado |
| `yield_unit` | `string?` | Unidad de rendimiento |
| `difficulty_level` | `string?` | beginner/intermediate/advanced |
| `environmental_requirements` | `object?` | Requerimientos ambientales |
| `space_requirements` | `object?` | Requerimientos de espacio |
| `estimated_cost` | `number?` | Costo estimado |
| `cost_breakdown` | `object?` | Desglose de costos |
| `usage_count` | `number` | Veces usado (default: 0) |
| `average_success_rate` | `number?` | Tasa de exito promedio |
| `average_actual_yield` | `number?` | Rendimiento real promedio |
| `last_used_date` | `number?` | Ultimo uso |
| `is_public` | `boolean` | Publico a otras empresas (default: false) |
| `created_by` | `id("users")?` | Creador |
| `status` | `string` | active/archived |
| `created_at` | `number` | Timestamp creacion |
| `updated_at` | `number` | Timestamp actualizacion |

### Tabla: `template_phases`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `template_id` | `id("production_templates")` | Template padre |
| `phase_name` | `string` | Nombre de la fase |
| `phase_order` | `number` | Orden secuencial |
| `estimated_duration_days` | `number` | Duracion en dias |
| `area_type` | `string` | Tipo de area requerido |
| `previous_phase_id` | `id("template_phases")?` | Fase anterior |
| `required_conditions` | `object?` | Condiciones requeridas |
| `completion_criteria` | `object?` | Criterios de completitud |
| `required_equipment` | `array` | Equipos necesarios |
| `required_materials` | `array` | Materiales necesarios |
| `description` | `string?` | Descripcion |
| `created_at` | `number` | Timestamp creacion |

### Tabla: `template_activities`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `phase_id` | `id("template_phases")` | Fase padre |
| `activity_name` | `string` | Nombre |
| `activity_order` | `number` | Orden |
| `activity_type` | `string` | watering/feeding/pruning/etc. |
| `is_recurring` | `boolean` | Es recurrente (default: false) |
| `is_quality_check` | `boolean` | Es QC (default: false) |
| `timing_configuration` | `object` | Configuracion de timing |
| `required_materials` | `array` | Materiales necesarios |
| `estimated_duration_minutes` | `number?` | Duracion estimada |
| `skill_level_required` | `string?` | Nivel requerido |
| `quality_check_template_id` | `id("quality_check_templates")?` | Template QC |
| `instructions` | `string?` | Instrucciones |
| `safety_notes` | `string?` | Notas de seguridad |
| `created_at` | `number` | Timestamp creacion |

### Tabla: `recipes`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | Empresa |
| `name` | `string` | Nombre |
| `description` | `string?` | Descripcion |
| `recipe_type` | `string` | nutrient/pesticide/fertilizer |
| `applicable_crop_types` | `array<id>` | Cultivos aplicables |
| `applicable_growth_stages` | `array<string>` | Etapas aplicables |
| `ingredients` | `array<object>` | Lista de ingredientes |
| `output_quantity` | `number?` | Cantidad producida |
| `output_unit` | `string?` | Unidad |
| `batch_size` | `number?` | Tamano de batch |
| `preparation_steps` | `array<object>?` | Pasos de preparacion |
| `application_method` | `string?` | Metodo aplicacion |
| `storage_instructions` | `string?` | Instrucciones almacenamiento |
| `shelf_life_hours` | `number?` | Vida util |
| `target_ph` | `number?` | pH objetivo |
| `target_ec` | `number?` | EC objetivo |
| `estimated_cost` | `number?` | Costo estimado |
| `cost_per_unit` | `number?` | Costo por unidad |
| `times_used` | `number` | Veces usada (default: 0) |
| `success_rate` | `number?` | Tasa de exito |
| `last_used_date` | `number?` | Ultimo uso |
| `created_by` | `id("users")?` | Creador |
| `status` | `string` | active/archived |
| `created_at` | `number` | Timestamp creacion |
| `updated_at` | `number` | Timestamp actualizacion |

---

## Tipos de Actividad

| Valor | Label | Icono |
|-------|-------|-------|
| `watering` | Riego | Droplet |
| `feeding` | Fertilizacion | FlaskConical |
| `pruning` | Poda | Scissors |
| `transplanting` | Trasplante | ArrowRight |
| `inspection` | Inspeccion | Eye |
| `treatment` | Tratamiento | Shield |
| `harvest` | Cosecha | Package |
| `drying` | Secado | Sun |
| `curing` | Curado | Timer |
| `quality_check` | Control de Calidad | CheckCircle |
| `movement` | Movimiento | Move |
| `planting` | Siembra | Sprout |

---

## Categorias de Template

| Valor | Label | Descripcion |
|-------|-------|-------------|
| `seed-to-harvest` | Semilla a Cosecha | Ciclo completo |
| `propagation` | Solo Propagacion | Germinacion/clonacion |
| `custom` | Personalizado | Flujo custom |

---

## Estados

| Estado | Uso |
|--------|-----|
| `active` | Disponible para usar |
| `archived` | Archivado |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M07-Reference Data | Lookup | `crop_types` para tipo de cultivo |
| M15-Cultivars | Lookup | `cultivar_id` opcional |
| M23-Quality Checks | Hijo | `quality_check_template_id` en actividades |
| M08-Areas | Referencia | `area_type` en fases |
| Production Orders | Padre | Templates generan ordenes |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `list` | `companyId, cropTypeId?, status?` | Template[] |
| `getById` | `templateId` | Template con fases y actividades |
| `getPublicTemplates` | `cropTypeId?` | Templates publicos |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `companyId, name, cropTypeId, ...` | crop_type existe |
| `update` | `templateId, ...campos` | ownership |
| `duplicate` | `templateId, newName?` | ownership |
| `archive` | `templateId` | ownership |
| `restore` | `templateId` | ownership |

### Template Phases
| `templatePhases.create` | `templateId, phaseName, phaseOrder, ...` |
| `templatePhases.update` | `phaseId, ...` |
| `templatePhases.remove` | `phaseId` |
| `templatePhases.reorder` | `templateId, phaseIds[]` |

### Template Activities
| `templateActivities.create` | `phaseId, activityName, ...` |
| `templateActivities.update` | `activityId, ...` |
| `templateActivities.remove` | `activityId` |

### Recipes
| `recipes.list` | `companyId, recipeType?` |
| `recipes.create` | `companyId, name, recipeType, ...` |
| `recipes.update` | `recipeId, ...` |
