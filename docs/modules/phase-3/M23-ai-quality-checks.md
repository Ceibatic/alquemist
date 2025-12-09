# Module 23: AI Quality Checks

## Overview

El modulo de Controles de Calidad con AI permite crear templates de inspeccion que pueden usar asistencia de inteligencia artificial para analisis de imagenes, deteccion de plagas/enfermedades, y evaluacion de calidad. Los templates definen formularios estructurados que los operadores completan durante inspecciones, con opcion de analisis automatico de fotos.

**Estado**: Pendiente de implementacion

---

## User Stories

### US-23.1: Ver lista de templates de quality check
**Como** administrador de calidad
**Quiero** ver todos los templates de inspeccion disponibles
**Para** seleccionar cual usar durante inspecciones

**Criterios de Aceptacion:**
- [ ] Grid de cards con todos los QC templates de la empresa
- [ ] Filtro por tipo de cultivo (dropdown de crop_types)
- [ ] Filtro por tipo de procedimiento: Visual, Medicion, Laboratorio
- [ ] Badge "AI" si ai_assisted = true
- [ ] Badge "Regulatorio" si regulatory_requirement = true
- [ ] Cada card muestra: nombre, tipo cultivo, tipo procedimiento, etapas aplicables, veces usado
- [ ] Cards clickeables navegan a `/quality-checks/templates/[id]`
- [ ] Menu kebab: Ver, Editar, Duplicar, Archivar
- [ ] Stats: Total templates, Con AI, Regulatorios
- [ ] Estado vacio: icono ClipboardCheck + mensaje + CTA "Crear Template"

**Consulta:** `qualityCheckTemplates.list({ companyId, cropTypeId?, procedureType? })`

**Componentes:** [quality-checks/page.tsx](app/(dashboard)/quality-checks/page.tsx), [qc-template-list.tsx](components/quality-checks/qc-template-list.tsx)

---

### US-23.2: Crear template de quality check
**Como** administrador de calidad
**Quiero** crear un template de inspeccion
**Para** estandarizar los controles de calidad

**Criterios de Aceptacion:**
- [ ] Boton "Crear Template" abre modal/wizard
- [ ] **Seccion Informacion Basica:**
  - Nombre* (min 3 caracteres)
  - Tipo de cultivo* (select de crop_types)
  - Tipo de procedimiento (select: visual, measurement, laboratory)
  - Nivel de inspeccion (batch, sample, individual)
  - Es requisito regulatorio (toggle)
  - Estandar de cumplimiento (si regulatorio: INVIMA, ICA, FNC)
- [ ] **Seccion Aplicabilidad:**
  - Etapas de crecimiento aplicables* (multi-select: seedling, vegetative, flowering, etc.)
  - Frecuencia recomendada (diario, semanal, por fase, por evento)
- [ ] **Seccion AI:**
  - Habilitar asistencia AI (toggle)
  - Tipos de analisis AI (multi-select: pest_detection, disease_detection, quality_grading, deficiency_detection)
- [ ] **Seccion Estructura del Formulario** (ver US-23.3)
- [ ] Template se crea como `status: active`
- [ ] Toast de exito al crear

**Escribe:** `qualityCheckTemplates.create({ companyId, name, cropTypeId, procedureType, ... })`

**Validaciones backend:**
- crop_type existe
- template_structure tiene al menos 1 campo

**Componentes:** [qc-template-wizard.tsx](components/quality-checks/qc-template-wizard.tsx)

---

### US-23.3: Disenar estructura del formulario
**Como** administrador de calidad
**Quiero** definir los campos del formulario de inspeccion
**Para** capturar datos consistentes

**Criterios de Aceptacion:**
- [ ] Builder visual de formulario drag & drop
- [ ] **Tipos de campo disponibles:**
  - Texto corto / Texto largo
  - Numero (con min/max opcional)
  - Select (opciones definidas)
  - Multi-select (checkboxes)
  - Rating (1-5 estrellas)
  - Si/No (boolean)
  - Rango (slider)
  - Foto (captura de imagen)
  - Seccion (agrupador visual)
- [ ] Cada campo tiene:
  - Label*
  - Descripcion/ayuda
  - Es requerido (toggle)
  - Valor por defecto
  - Validaciones especificas por tipo
- [ ] **Campos de foto:**
  - Cantidad minima/maxima
  - Requiere analisis AI (toggle)
  - Instrucciones de captura
- [ ] Preview del formulario en tiempo real
- [ ] Campos predefinidos segun tipo de cultivo y etapa
- [ ] Opcion de importar campos de otro template

**Estructura JSON del formulario:**
```typescript
{
  sections: [{
    id: string,
    title: string,
    fields: [{
      id: string,
      type: 'text' | 'number' | 'select' | 'photo' | ...,
      label: string,
      required: boolean,
      description?: string,
      validation?: { min?, max?, options? },
      ai_enabled?: boolean
    }]
  }]
}
```

**Componentes:** [form-builder.tsx](components/quality-checks/form-builder.tsx), [field-editor.tsx](components/quality-checks/field-editor.tsx)

---

### US-23.4: Ver detalle de template QC
**Como** administrador de calidad
**Quiero** ver todos los detalles de un template
**Para** entender que se evalua antes de usarlo

**Criterios de Aceptacion:**
- [ ] Pagina `/quality-checks/templates/[id]`
- [ ] Header con nombre + badges (AI, Regulatorio, Procedimiento)
- [ ] Botones: Editar, Duplicar, Iniciar Inspeccion
- [ ] Breadcrumb: Inicio > Quality Checks > Templates > [Nombre]
- [ ] **Card Informacion General:**
  - Tipo cultivo, procedimiento, nivel inspeccion
  - Etapas aplicables (badges)
  - Frecuencia recomendada
  - Veces usado, tiempo promedio de completado
- [ ] **Card Compliance** (si regulatorio):
  - Estandar de cumplimiento
  - Requisitos especificos
- [ ] **Card AI** (si habilitado):
  - Tipos de analisis activos
  - Precision del modelo (si disponible)
- [ ] **Preview del Formulario:**
  - Vista completa del formulario como lo vera el operador
  - Campos marcados como requeridos
  - Indicadores de campos con AI

**Consulta:** `qualityCheckTemplates.getById({ templateId })`

**Componentes:** [quality-checks/templates/[id]/page.tsx](app/(dashboard)/quality-checks/templates/[id]/page.tsx)

---

### US-23.5: Ejecutar inspeccion de calidad
**Como** operador de produccion
**Quiero** realizar una inspeccion usando un template
**Para** documentar el estado de un lote/planta

**Criterios de Aceptacion:**
- [ ] Iniciar desde: detalle de template, detalle de batch, actividad programada
- [ ] Seleccionar entidad a inspeccionar (batch o plant)
- [ ] Formulario renderizado segun template_structure
- [ ] **Para campos de foto con AI:**
  - Captura de imagen desde camara o galeria
  - Indicador de "Analizando..." durante procesamiento
  - Resultado del analisis AI mostrado junto a la foto
  - Opcion de aceptar/rechazar sugerencia AI
- [ ] **Campos de analisis AI:**
  - Deteccion de plagas: lista de plagas detectadas + confianza
  - Deteccion de enfermedades: identificacion + severidad
  - Calificacion de calidad: grado A/B/C + justificacion
  - Deficiencias: tipo + recomendacion
- [ ] Validacion de campos requeridos antes de enviar
- [ ] Guardar como borrador (partial save)
- [ ] Toast de exito al completar
- [ ] Registro de duracion de la inspeccion

**Escribe:** `qualityChecks.create({ templateId, entityType, entityId, formData, aiAnalysisResults, ... })`

**Componentes:** [qc-execution-form.tsx](components/quality-checks/qc-execution-form.tsx), [ai-photo-field.tsx](components/quality-checks/ai-photo-field.tsx)

---

### US-23.6: Ver historial de inspecciones
**Como** administrador de calidad
**Quiero** ver el historial de inspecciones realizadas
**Para** auditar y analizar tendencias

**Criterios de Aceptacion:**
- [ ] Pagina `/quality-checks/history` o tab en lista
- [ ] Tabla con: Fecha, Entidad, Template, Inspector, Resultado, AI usado
- [ ] Filtros: rango de fechas, template, entidad, inspector
- [ ] Filas clickeables navegan a detalle de inspeccion
- [ ] Export a CSV (futuro)
- [ ] Graficas de tendencia (futuro)

**Consulta:** `qualityChecks.list({ companyId, templateId?, entityType?, dateRange? })`

**Componentes:** [qc-history-list.tsx](components/quality-checks/qc-history-list.tsx)

---

### US-23.7: Ver detalle de inspeccion
**Como** administrador de calidad
**Quiero** ver los resultados de una inspeccion especifica
**Para** revisar hallazgos y tomar acciones

**Criterios de Aceptacion:**
- [ ] Pagina `/quality-checks/[id]`
- [ ] Header con: entidad inspeccionada, fecha, inspector
- [ ] **Card Resumen:**
  - Resultado general (pass/fail/conditional)
  - Tiempo de completado
  - AI utilizado (si/no)
- [ ] **Formulario Completado:**
  - Todos los campos con respuestas
  - Fotos con resultados de analisis AI
  - Indicadores de campos que fallaron validacion
- [ ] **Card Analisis AI** (si aplica):
  - Detecciones con nivel de confianza
  - Recomendaciones generadas
- [ ] **Acciones:**
  - Crear incidencia (link a compliance)
  - Programar seguimiento
  - Agregar notas
- [ ] Historial de la entidad (inspecciones anteriores)

**Consulta:** `qualityChecks.getById({ checkId })`

**Componentes:** [quality-checks/[id]/page.tsx](app/(dashboard)/quality-checks/[id]/page.tsx)

---

### US-23.8: Integracion con deteccion de plagas
**Como** operador de produccion
**Quiero** que el sistema detecte automaticamente plagas en fotos
**Para** identificar problemas rapidamente

**Criterios de Aceptacion:**
- [ ] Campo de foto con `ai_analysis_types: ['pest_detection']`
- [ ] Al subir foto, se envia a modelo de vision AI
- [ ] **Resultado incluye:**
  - Lista de plagas detectadas
  - Ubicacion en imagen (bounding box)
  - Nivel de confianza (0-100%)
  - Severidad estimada
- [ ] Si confianza > 80%, sugiere crear registro de plaga
- [ ] Link a ficha de la plaga en biblioteca
- [ ] Recomendaciones de tratamiento

**Integracion:** `ai.analyzePestDetection({ imageUrl })`

**Componentes:** [pest-detection-result.tsx](components/quality-checks/pest-detection-result.tsx)

---

### US-23.9: Integracion con calificacion de calidad
**Como** administrador de calidad
**Quiero** que el sistema califique automaticamente la calidad visual
**Para** estandarizar evaluaciones

**Criterios de Aceptacion:**
- [ ] Campo de foto con `ai_analysis_types: ['quality_grading']`
- [ ] Modelo evalua criterios visuales:
  - Color
  - Textura
  - Tamanio
  - Defectos visibles
  - Madurez (si aplica)
- [ ] **Resultado:**
  - Grado: A (Premium), B (Estandar), C (Procesamiento)
  - Score numerico (0-100)
  - Justificacion por criterio
- [ ] Comparacion con batch promedio
- [ ] Historial de calificaciones del cultivar

**Integracion:** `ai.analyzeQualityGrade({ imageUrl, cropType })`

**Componentes:** [quality-grade-result.tsx](components/quality-checks/quality-grade-result.tsx)

---

## Schema

### Tabla: `quality_check_templates`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | Empresa |
| `name` | `string` | Nombre |
| `crop_type_id` | `id("crop_types")` | Tipo de cultivo |
| `procedure_type` | `string?` | visual/measurement/laboratory |
| `inspection_level` | `string?` | batch/sample/individual |
| `regulatory_requirement` | `boolean` | Es regulatorio (default: false) |
| `compliance_standard` | `string?` | INVIMA/ICA/FNC |
| `template_structure` | `object` | Definicion del formulario |
| `ai_assisted` | `boolean` | Usa AI (default: false) |
| `ai_analysis_types` | `array<string>` | Tipos de analisis AI |
| `applicable_stages` | `array<string>` | Etapas aplicables |
| `frequency_recommendation` | `string?` | daily/weekly/per_phase |
| `usage_count` | `number` | Veces usado (default: 0) |
| `average_completion_time_minutes` | `number?` | Tiempo promedio |
| `created_by` | `id("users")?` | Creador |
| `status` | `string` | active/archived |
| `created_at` | `number` | Timestamp creacion |
| `updated_at` | `number` | Timestamp actualizacion |

### Tabla: `quality_checks` (registros de inspecciones)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `template_id` | `id("quality_check_templates")` | Template usado |
| `entity_type` | `string` | batch/plant |
| `entity_id` | `string` | ID de la entidad |
| `performed_by` | `id("users")` | Inspector |
| `form_data` | `object` | Datos del formulario completado |
| `ai_analysis_results` | `object?` | Resultados de AI |
| `overall_result` | `string` | pass/fail/conditional |
| `duration_minutes` | `number?` | Duracion |
| `photos` | `array<string>` | URLs de fotos |
| `notes` | `string?` | Notas adicionales |
| `follow_up_required` | `boolean` | Requiere seguimiento |
| `follow_up_date` | `number?` | Fecha seguimiento |
| `company_id` | `id("companies")` | Empresa |
| `facility_id` | `id("facilities")` | Instalacion |
| `status` | `string` | draft/completed |
| `created_at` | `number` | Timestamp |

---

## Tipos de Procedimiento

| Valor | Label | Descripcion |
|-------|-------|-------------|
| `visual` | Visual | Inspeccion ocular |
| `measurement` | Medicion | Con instrumentos |
| `laboratory` | Laboratorio | Analisis de muestras |

---

## Niveles de Inspeccion

| Valor | Label |
|-------|-------|
| `batch` | Por lote completo |
| `sample` | Muestra representativa |
| `individual` | Planta por planta |

---

## Tipos de Analisis AI

| Valor | Label | Descripcion |
|-------|-------|-------------|
| `pest_detection` | Deteccion de Plagas | Identifica insectos y acaros |
| `disease_detection` | Deteccion de Enfermedades | Hongos, bacterias, virus |
| `quality_grading` | Calificacion de Calidad | A/B/C |
| `deficiency_detection` | Deteccion de Deficiencias | Nutrientes faltantes |
| `growth_analysis` | Analisis de Crecimiento | Etapa y salud general |

---

## Etapas de Crecimiento

| Valor | Label |
|-------|-------|
| `seedling` | Plantula |
| `vegetative` | Vegetativo |
| `pre_flowering` | Pre-floracion |
| `flowering` | Floracion |
| `harvest` | Cosecha |
| `drying` | Secado |
| `curing` | Curado |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M07-Reference Data | Lookup | `crop_types` |
| M22-Templates | Hijo | Actividades de QC referencian templates |
| M24-Batches | Entidad | Inspecciones sobre batches |
| M26-Plants | Entidad | Inspecciones sobre plantas |
| Pest/Disease | AI | Deteccion automatica |
| Compliance | Destino | Crear eventos desde hallazgos |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `qualityCheckTemplates.list` | `companyId, cropTypeId?, procedureType?` | Template[] |
| `qualityCheckTemplates.getById` | `templateId` | Template completo |
| `qualityChecks.list` | `companyId, templateId?, entityType?, dateRange?` | Check[] |
| `qualityChecks.getById` | `checkId` | Check con detalles |
| `qualityChecks.getByEntity` | `entityType, entityId` | Check[] del entity |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `qualityCheckTemplates.create` | `companyId, name, cropTypeId, template_structure, ...` | structure valida |
| `qualityCheckTemplates.update` | `templateId, ...` | ownership |
| `qualityCheckTemplates.duplicate` | `templateId` | ownership |
| `qualityCheckTemplates.archive` | `templateId` | ownership |
| `qualityChecks.create` | `templateId, entityType, entityId, formData, ...` | template existe |
| `qualityChecks.saveDraft` | `checkId, formData` | es draft |
| `qualityChecks.complete` | `checkId` | campos requeridos |

### AI Integration
| `ai.analyzePestDetection` | `imageUrl` | PestResult[] |
| `ai.analyzeDiseaseDetection` | `imageUrl` | DiseaseResult[] |
| `ai.analyzeQualityGrade` | `imageUrl, cropType` | QualityGradeResult |
| `ai.analyzeDeficiency` | `imageUrl` | DeficiencyResult[] |
