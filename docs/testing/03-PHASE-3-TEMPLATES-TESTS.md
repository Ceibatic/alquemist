# PHASE 3: PRODUCTION TEMPLATES & AI - TESTS

## Descripción de la Fase

Phase 3 cubre la creación y gestión de templates de producción y formularios de QC generados por AI:
- Creación de templates de producción con fases
- Configuración de actividades con scheduling complejo (one-time, recurring, dependent)
- Vinculación de cultivares y áreas
- Estimación de consumo de inventario
- Generación de formularios de Quality Check usando AI (Gemini Vision)

## Módulos Cubiertos

- **Module 22**: Production Templates & Activity Scheduling
- **Module 23**: AI Quality Check Templates

## Datos de Prueba

Ver [00-TESTING-OVERVIEW.md](00-TESTING-OVERVIEW.md) para datos completos.

**Template**: Cannabis 8-Week Flowering Cycle
**Cultivar**: Cherry AK
**Áreas**: Propagation, Vegetative, Flowering

---

## Test 3.1: Crear Production Template Básico

**Objetivo**: Validar la creación de un template de producción.

**Precondiciones**:
- Phase 2 completada exitosamente
- Al menos 3 áreas creadas
- Al menos 1 cultivar disponible
- Usuario loggeado como admin o manager

**Pasos**:
1. Navegar a módulo "Production Templates" o "Templates"
2. Hacer clic en "Create New Template"
3. Completar información básica:
   - Template Name: Cannabis 8-Week Flowering Cycle
   - Description: Standard 8-week flowering cycle for indica-dominant strains
   - Cultivar: Cherry AK (seleccionar)
   - Crop Type: Cannabis (auto-llenado del cultivar)
   - Total Duration: 56 days (8 semanas)
   - Is Active: Yes
4. Hacer clic en "Create" o "Next"

**Resultados Esperados**:
- ✅ Template creado en tabla `production_templates`
- ✅ `facility_id` vinculado a "North Greenhouse"
- ✅ `cultivar_id` apunta a Cherry AK
- ✅ Status: "draft" (hasta que se completen fases y actividades)
- ✅ Redirect a página de configuración de fases
- ✅ Mensaje: "Template created. Now add phases."

**Notas**:
- Un template sin fases y actividades es inútil
- El flujo guía al usuario a configurar fases inmediatamente

---

## Test 3.2: Agregar Fase 1 - Early Flower

**Objetivo**: Validar la creación de la primera fase del template.

**Precondiciones**:
- Test 3.1 completado
- Template "Cannabis 8-Week Flowering Cycle" creado
- En página de configuración de fases

**Pasos**:
1. Hacer clic en "Add Phase"
2. Completar formulario:
   - Phase Name: Early Flower
   - Description: First 3 weeks of flowering
   - Start Day: 1
   - End Day: 21
   - Primary Area: Flowering Room (seleccionar)
   - Order: 1
3. Hacer clic en "Create Phase"

**Resultados Esperados**:
- ✅ Fase creada en tabla `template_phases`
- ✅ Vinculada al template
- ✅ Duration: 21 días (day 1 al 21)
- ✅ Aparece en lista de fases del template
- ✅ Mensaje: "Phase created successfully"

**Notas**:
- Las fases deben ser secuenciales (no overlapping)
- Start day de una fase debe ser End day + 1 de la anterior

---

## Test 3.3: Agregar Fase 2 - Mid Flower

**Objetivo**: Validar la creación de la segunda fase.

**Precondiciones**:
- Test 3.2 completado
- Fase "Early Flower" creada (días 1-21)

**Pasos**:
1. Hacer clic en "Add Phase"
2. Completar:
   - Phase Name: Mid Flower
   - Description: Peak flowering weeks 4-6
   - Start Day: 22
   - End Day: 42
   - Primary Area: Flowering Room
   - Order: 2
3. Crear fase

**Resultados Esperados**:
- ✅ Segunda fase creada exitosamente
- ✅ Duration: 21 días (day 22 al 42)
- ✅ Lista muestra 2 fases en orden correcto
- ✅ Timeline visual muestra progreso (si hay UI de timeline)

**Notas**:
- El sistema debe validar que start day = 22 (siguiente al end day de fase anterior)

---

## Test 3.4: Agregar Fase 3 - Late Flower

**Objetivo**: Validar la creación de la tercera y última fase.

**Precondiciones**:
- Test 3.3 completado
- 2 fases creadas

**Pasos**:
1. Agregar última fase:
   - Phase Name: Late Flower
   - Description: Final 2 weeks before harvest
   - Start Day: 43
   - End Day: 56
   - Primary Area: Flowering Room
   - Order: 3
2. Crear fase

**Resultados Esperados**:
- ✅ Tercera fase creada
- ✅ Total duration del template completo: 56 días
- ✅ 3 fases visibles en lista ordenadas (1, 2, 3)
- ✅ Template ahora muestra estructura completa

**Notas**:
- End day de última fase (56) debe coincidir con total duration del template
- Algunas implementaciones pueden auto-calcular esto

---

## Test 3.5: Agregar Actividad One-Time - Defoliación

**Objetivo**: Validar la creación de una actividad que ocurre una sola vez.

**Precondiciones**:
- Test 3.4 completado
- 3 fases creadas
- En página de configuración de actividades

**Pasos**:
1. Hacer clic en "Add Activity"
2. Completar formulario:
   - Activity Name: Defoliation
   - Description: Remove lower fan leaves
   - Phase: Mid Flower (seleccionar)
   - Type: One-Time
   - Scheduled Day: 21 (relative to template start)
   - Duration: 2 hours
   - Assigned Role: Production Operator
   - Is Critical: No
3. Crear actividad

**Resultados Esperados**:
- ✅ Actividad creada en tabla `template_activities`
- ✅ Vinculada a fase "Mid Flower" y template
- ✅ Schedule type: "one_time"
- ✅ Scheduled day: 21
- ✅ Aparece en lista de actividades del template
- ✅ Marcada con badge "One-Time"

**Notas**:
- One-time activities se programan solo una vez en el día especificado
- Day 21 está en la fase "Early Flower" (días 1-21), no Mid Flower - esto puede ser error de prueba, ajustar a day 30 para Mid Flower

---

## Test 3.6: Agregar Actividad Recurring Daily - Riego

**Objetivo**: Validar la creación de una actividad que se repite diariamente.

**Precondiciones**:
- Test 3.5 completado

**Pasos**:
1. Agregar actividad:
   - Activity Name: Daily Watering
   - Description: Water plants, check pH and EC
   - Phase: All Phases (o aplicar a las 3 fases)
   - Type: Recurring
   - Frequency: Daily
   - Start Day: 1
   - End Day: 56 (todo el ciclo)
   - Time of Day: 08:00 AM
   - Duration: 1 hour
   - Assigned Role: Production Operator
   - Is Critical: Yes
2. Crear actividad

**Resultados Esperados**:
- ✅ Actividad creada con type: "recurring"
- ✅ Recurrence pattern: "daily"
- ✅ Se generarán 56 instancias (una por día) cuando se cree una orden
- ✅ Marcada como "Critical" (requerida)
- ✅ Badge muestra "Recurring - Daily"

**Notas**:
- Las instancias reales (scheduled_activities) se crean cuando se crea la orden de producción
- Esta es solo la plantilla de la actividad

---

## Test 3.7: Agregar Actividad Recurring Weekly - Fertilización

**Objetivo**: Validar una actividad que se repite semanalmente.

**Preconditions**:
- Test 3.6 completado

**Pasos**:
1. Agregar actividad:
   - Activity Name: Weekly Feeding
   - Description: Apply base nutrients A+B
   - Phase: All Phases
   - Type: Recurring
   - Frequency: Weekly (every 7 days)
   - Start Day: 1
   - End Day: 56
   - Specific Day of Week: Monday (opcional)
   - Duration: 1.5 hours
   - Assigned Role: Production Operator
2. Crear

**Resultados Esperados**:
- ✅ Actividad creada con recurrence: "weekly"
- ✅ Se generarán 8 instancias (56 días / 7 = 8 semanas)
- ✅ Badge: "Recurring - Weekly"

**Notas**:
- Si se especifica day of week, todas las instancias caen en ese día
- Si no, se basa en start day + múltiplos de 7

---

## Test 3.8: Agregar Actividad Recurring Custom - Inspección de Plagas

**Objetivo**: Validar una actividad con frecuencia personalizada (cada 3 días).

**Precondiciones**:
- Test 3.7 completado

**Pasos**:
1. Agregar actividad:
   - Activity Name: Pest Inspection
   - Description: Check for pests and diseases
   - Phase: All Phases
   - Type: Recurring
   - Frequency: Custom
   - Repeat Every: 3 days
   - Start Day: 1
   - End Day: 56
   - Duration: 30 minutes
   - Assigned Role: Production Operator
3. Crear

**Resultados Esperados**:
- ✅ Actividad creada con custom frequency
- ✅ Se generarán ~19 instancias (56 / 3)
- ✅ Instancias en días: 1, 4, 7, 10, 13, ... 55
- ✅ Badge: "Recurring - Every 3 days"

**Notas**:
- Custom frequency permite flexibilidad total
- Útil para actividades que no son daily/weekly

---

## Test 3.9: Agregar Actividad Dependent - Flush antes de Cosecha

**Objetivo**: Validar una actividad que depende de otra (flush 7 días antes de harvest).

**Precondiciones**:
- Test 3.8 completado
- Varias actividades creadas

**Pasos**:
1. Primero, agregar actividad "Harvest":
   - Activity Name: Harvest
   - Type: One-Time
   - Scheduled Day: 56
   - Duration: 4 hours

2. Luego, agregar actividad dependiente "Final Flush":
   - Activity Name: Final Flush
   - Description: Flush with pure water 7 days before harvest
   - Type: Dependent
   - Depends On: Harvest (seleccionar)
   - Offset: -7 days (7 días ANTES)
   - Duration: 1 hour
   - Assigned Role: Production Operator
   - Is Critical: Yes

3. Crear ambas

**Resultados Esperados**:
- ✅ Actividad "Harvest" creada en day 56
- ✅ Actividad "Final Flush" creada con dependency
- ✅ "Final Flush" se programará automáticamente en day 49 (56 - 7)
- ✅ Si "Harvest" se reprograma, "Final Flush" se ajusta automáticamente
- ✅ Badge: "Dependent - 7 days before Harvest"

**Notas**:
- Las actividades dependientes son poderosas para workflows complejos
- Offset puede ser positivo (después) o negativo (antes)
- Ejemplo: "Prune" (day 15) → "Training" (3 days after prune) = day 18

---

## Test 3.10: Vincular Inventory Items a Actividad

**Objetivo**: Validar que se pueden estimar consumos de inventario por actividad.

**Preconditions**:
- Test 3.9 completado
- Items de inventario creados en Phase 2
- Actividad "Weekly Feeding" existe

**Pasos**:
1. Seleccionar actividad "Weekly Feeding"
2. Hacer clic en "Add Inventory Consumption" o sección de inventory
3. Agregar items:
   - Item: Base Floración A+B
   - Quantity per instance: 10 L
   - Unit: Liters
4. Agregar otro:
   - Item: Cal-Mag
   - Quantity per instance: 2 L
5. Guardar

**Resultados Esperados**:
- ✅ Relación creada entre actividad e inventory items
- ✅ Cuando se ejecute la actividad en una orden real, consumirá:
  - 10 L de Base Floración (por semana × 8 semanas = 80 L total)
  - 2 L de Cal-Mag (por semana × 8 = 16 L total)
- ✅ Template puede mostrar estimación total de inventario requerido
- ✅ Al crear orden, sistema verifica stock disponible

**Notas**:
- Esto es solo estimación en template
- El consumo real ocurre cuando se ejecuta la actividad en Phase 4

---

## Test 3.11: Ver Resumen de Template Completo

**Objetivo**: Validar que se puede ver un resumen completo del template.

**Preconditions**:
- Test 3.10 completado
- Template con 3 fases y múltiples actividades configurado

**Pasos**:
1. Navegar a vista de detalle del template "Cannabis 8-Week Flowering Cycle"
2. Ver resumen completo

**Resultados Esperados**:
- ✅ Header muestra:
  - Template name
  - Cultivar (Cherry AK)
  - Total duration (56 días)
  - Status (draft o active)
- ✅ Sección de Phases muestra 3 fases:
  - Early Flower (días 1-21)
  - Mid Flower (días 22-42)
  - Late Flower (días 43-56)
- ✅ Sección de Activities muestra todas las actividades agrupadas por tipo:
  - One-Time: Defoliation, Harvest
  - Recurring Daily: Daily Watering (56x)
  - Recurring Weekly: Weekly Feeding (8x)
  - Recurring Custom: Pest Inspection (19x)
  - Dependent: Final Flush
- ✅ Sección de Estimated Inventory muestra consumo total
- ✅ Total activities to be scheduled: ~85+ instancias

**Notas**:
- Este resumen es crítico para review antes de activar el template
- Debería mostrar timeline visual o calendario

---

## Test 3.12: Activar Template

**Objetivo**: Validar que un template puede ser activado para uso en producción.

**Preconditions**:
- Test 3.11 completado
- Template completamente configurado

**Pasos**:
1. En vista de template, hacer clic en "Activate Template"
2. Confirmar activación

**Resultados Esperados**:
- ✅ Status del template cambia a "active"
- ✅ Template ahora aparece en lista de templates disponibles para crear órdenes
- ✅ Mensaje: "Template activated successfully"
- ✅ No se pueden editar fases/actividades de template activo (o requiere versioning)

**Notas**:
- Solo templates activos pueden usarse para crear production orders
- Editar template activo puede crear conflictos con órdenes en progreso
- Mejor práctica: duplicar template y crear nueva versión

---

## Test 3.13: Crear QC Template con AI - Preparación

**Objetivo**: Preparar un documento PDF/imagen de formulario de QC para análisis por AI.

**Preconditions**:
- Usuario tiene acceso a módulo de QC Templates
- Tiene un PDF o imagen de formulario de inspección (ej: formulario de inspección de plagas)

**Pasos de Preparación**:
1. Tener disponible un documento de ejemplo:
   - Puede ser PDF de formulario de inspección
   - O imagen/foto de checklist en papel
   - Debe contener campos claros (checkboxes, text fields, etc.)

2. Navegar a módulo "Quality Check Templates" o "QC Forms"
3. Hacer clic en "Create QC Template with AI"

**Resultados Esperados**:
- ✅ Página de upload de archivo visible
- ✅ Acepta formatos: PDF, JPG, PNG
- ✅ Límite de tamaño: 10 MB (o similar)

**Notas**:
- Este test requiere archivo real
- Para testing, se puede usar un formulario simple creado en Word/Google Docs y exportado a PDF
- Ejemplo: formulario con campos "Plant ID", "Pest Type" (dropdown), "Severity" (1-5), "Action Taken"

---

## Test 3.14: Upload y Analizar Formulario con Gemini AI

**Objetivo**: Validar que Gemini AI puede analizar el documento y extraer campos.

**Preconditions**:
- Test 3.13 completado
- Archivo de formulario listo para upload
- Gemini API configurada en backend

**Pasos**:
1. En página "Create QC Template with AI", upload archivo
2. Completar metadata:
   - Template Name: Pest Inspection Form
   - Description: Daily pest and disease inspection checklist
   - Category: Pest Control
3. Hacer clic en "Analyze with AI" o "Generate Form"
4. Esperar procesamiento (puede tomar 10-30 segundos)

**Resultados Esperados**:
- ✅ Archivo subido exitosamente a storage (tabla `media_files`)
- ✅ Request enviado a Gemini Vision API
- ✅ AI extrae campos del formulario:
  - Text fields (ej: "Plant ID", "Inspector Name")
  - Dropdowns (ej: "Pest Type": Spider Mites, Aphids, Thrips, etc.)
  - Checkboxes (ej: "Leaves affected", "Stems affected")
  - Number fields (ej: "Severity (1-5)")
  - Date fields (ej: "Inspection Date")
- ✅ AI genera estructura JSON de campos
- ✅ Preview del formulario HTML generado visible

**Notas**:
- La calidad de extracción depende de la claridad del documento original
- Gemini puede no ser 100% preciso - usuario debe poder editar después (pero en MVP, no hay edición manual según docs)
- Si falla, mostrar error claro y permitir retry

---

## Test 3.15: Review y Guardar QC Template Generado por AI

**Objetivo**: Validar que el template de QC puede ser guardado y usado.

**Preconditions**:
- Test 3.14 completado exitosamente
- AI generó estructura de formulario

**Pasos**:
1. Revisar preview del formulario generado
2. Verificar que campos detectados son correctos
3. (Si hay edición manual disponible, ajustar campos)
4. Hacer clic en "Save QC Template"

**Resultados Esperados**:
- ✅ QC Template guardado en tabla `quality_check_templates`
- ✅ Form fields guardados como JSON structure
- ✅ HTML del formulario generado y guardado
- ✅ Template aparece en lista de QC Templates disponibles
- ✅ Mensaje: "QC Template created successfully"
- ✅ Template puede ser vinculado a actividades

**Notas**:
- El template guardado puede ser reusado en múltiples actividades
- En Phase 4, cuando un operador ejecute la actividad, verá este formulario

---

## Test 3.16: Vincular QC Template a Actividad

**Objetivo**: Validar que un QC template puede vincularse a una actividad del production template.

**Preconditions**:
- Test 3.15 completado
- QC Template "Pest Inspection Form" creado
- Actividad "Pest Inspection" existe en production template

**Pasos**:
1. Volver al Production Template "Cannabis 8-Week Flowering Cycle"
2. Editar actividad "Pest Inspection"
3. En sección de QC:
   - Select QC Template: Pest Inspection Form
   - Is QC Required: Yes
4. Guardar cambios

**Resultados Esperados**:
- ✅ Relación creada entre actividad y QC template
- ✅ `quality_check_template_id` guardado en `template_activities`
- ✅ Actividad ahora muestra badge "QC Required"
- ✅ Cuando se ejecute esta actividad en Phase 4, el formulario será requerido

**Notas**:
- Una actividad puede tener solo 1 QC template
- Un QC template puede usarse en múltiples actividades

---

## Test 3.17: Crear Segundo QC Template (Manual Check)

**Objetivo**: Validar la creación de un segundo QC template para otra actividad.

**Preconditions**:
- Sistema de QC templates funcionando

**Pasos**:
1. Crear otro QC template (puede ser con AI o manual si hay esa opción):
   - Template Name: Water Quality Check
   - Fields:
     - pH Level (number, 5.5-6.5)
     - EC Level (number, 1.0-2.0)
     - Water Temperature (number, °C)
     - Notes (text)
2. Guardar template
3. Vincular a actividad "Daily Watering"

**Resultados Esperados**:
- ✅ Segundo QC template creado
- ✅ Vinculado a "Daily Watering"
- ✅ Cada instancia de "Daily Watering" requerirá llenar este formulario

**Notas**:
- Esto simula un caso real: cada riego debe registrar pH y EC
- Los datos se guardarán en tabla de quality check records

---

## Test 3.18: Listar Todos los Templates Activos

**Objetivo**: Validar que se puede ver la lista completa de production templates.

**Preconditions**:
- Al menos 1 template activo creado

**Pasos**:
1. Navegar a módulo "Production Templates"
2. Ver lista completa
3. Aplicar filtros

**Resultados Esperados**:
- ✅ Lista muestra todos los templates del facility
- ✅ Para cada template:
  - Name
  - Cultivar
  - Duration
  - # of phases
  - # of activities
  - Status (active/draft)
  - Actions (view, edit, duplicate, deactivate)
- ✅ Filtros disponibles:
  - Status (active/draft)
  - Cultivar
  - Crop type
- ✅ Búsqueda por nombre funcional

**Notas**:
- Templates inactivos/draft no pueden usarse para crear órdenes
- Ordenar por "most recently used" sería útil

---

## Test 3.19: Duplicar Template (Opcional)

**Objetivo**: Validar que se puede duplicar un template existente.

**Preconditions**:
- Template "Cannabis 8-Week Flowering Cycle" existe

**Pasos**:
1. En lista de templates, seleccionar "Cannabis 8-Week Flowering Cycle"
2. Hacer clic en "Duplicate" o "Clone"
3. Modificar nombre:
   - New Name: Cannabis 9-Week Flowering Cycle
4. Confirmar duplicación
5. Editar template duplicado:
   - Cambiar duration a 63 días
   - Ajustar fase 3 end day a 63

**Resultados Esperados**:
- ✅ Nuevo template creado con todos los datos copiados
- ✅ Fases, actividades, y QC templates duplicados
- ✅ Nuevo template tiene status "draft"
- ✅ Puede ser editado independientemente del original

**Notas**:
- Duplicar es más rápido que crear desde cero
- Útil para crear variaciones (ej: mismo cultivar, distinto timing)

---

## Test 3.20: Estimar Inventario Total del Template

**Objetivo**: Validar que el sistema puede calcular consumo total estimado de inventario.

**Preconditions**:
- Template con actividades vinculadas a inventory items

**Pasos**:
1. Ver template "Cannabis 8-Week Flowering Cycle"
2. Navegar a sección "Inventory Estimate" o "Resource Planning"
3. Ver estimaciones

**Resultados Esperados**:
- ✅ Tabla muestra consumo estimado por item:
  - Base Floración A+B: 80 L (10L × 8 semanas)
  - Cal-Mag: 16 L (2L × 8 semanas)
  - [Otros items si se configuraron]
- ✅ Para cada item:
  - Total quantity needed
  - Current stock available
  - Status: Sufficient / Needs reorder
- ✅ Warning si stock actual < quantity needed

**Notas**:
- Estas son solo estimaciones
- El consumo real puede variar según condiciones
- Útil para planning antes de crear orden

---

## Resumen de Phase 3

### Flujo Completo Esperado

```
1. Create Production Template
   ↓
2. Add 3 Phases (Early, Mid, Late Flower)
   ↓
3. Add Activities:
   - One-time (Defoliation, Harvest)
   - Recurring (Daily watering, Weekly feeding, Pest inspection)
   - Dependent (Final flush)
   ↓
4. Link Inventory to Activities
   ↓
5. Create QC Templates with AI
   ↓
6. Link QC Templates to Activities
   ↓
7. Activate Template
   ↓
8. Ready for Phase 4 (Create Production Orders)
```

### Estado del Sistema al Finalizar Phase 3

**Production Templates**:
- 1+ active template: "Cannabis 8-Week Flowering Cycle"
- 3 phases configured
- 6+ activities con diferentes tipos de scheduling
- Inventory consumption estimado

**QC Templates**:
- 2+ QC templates:
  - Pest Inspection Form (AI-generated)
  - Water Quality Check
- Vinculados a actividades relevantes

**Ready for Production**:
- Templates listos para crear órdenes reales
- Scheduling logic configurado correctamente
- QC forms preparados para data collection

### Criterios de Éxito

- ✅ Al menos 1 production template activo
- ✅ Template tiene al menos 3 fases
- ✅ Template tiene actividades de todos los tipos:
  - One-time ✓
  - Recurring (daily/weekly) ✓
  - Dependent ✓
- ✅ Al menos 1 QC template generado por AI
- ✅ QC templates vinculados a actividades
- ✅ Inventory consumption estimado
- ✅ Template puede usarse para crear órdenes

### Troubleshooting

**Problema: No puedo activar template**
- Verificar que template tiene al menos 1 fase
- Verificar que fases cubren el duration completo
- Verificar que al menos 1 actividad existe

**Problema: Actividad dependent no se programa correctamente**
- Verificar que actividad parent existe
- Verificar que offset es válido (no resulta en día negativo)
- Verificar orden de creación (parent debe existir primero)

**Problema: AI no extrae campos correctamente**
- Verificar que imagen/PDF es clara y legible
- Verificar que formulario tiene estructura clara
- Probar con documento más simple
- Verificar API key de Gemini

**Problema: No puedo vincular QC template a actividad**
- Verificar que QC template está guardado
- Verificar que actividad existe
- Verificar permisos del usuario

**Problema: Estimación de inventario muestra 0**
- Verificar que actividades tienen items vinculados
- Verificar que quantities están configuradas
- Verificar que recurring activities calculan correctamente el # de instancias

---

**Fase anterior**: [02-PHASE-2-MASTER-DATA-TESTS.md](02-PHASE-2-MASTER-DATA-TESTS.md)
**Siguiente fase**: [04-PHASE-4-PRODUCTION-TESTS.md](04-PHASE-4-PRODUCTION-TESTS.md)
