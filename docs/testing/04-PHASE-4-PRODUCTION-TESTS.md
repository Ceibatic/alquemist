# PHASE 4: PRODUCTION EXECUTION - TESTS

## Descripción de la Fase

Phase 4 cubre la ejecución completa del ciclo de producción:
- Creación de órdenes de producción desde templates
- Auto-scheduling de todas las actividades
- Workflow de aprobación por manager
- Ejecución de actividades por operadores
- Llenado de formularios de QC
- Upload de fotos y análisis AI de plagas/enfermedades
- Consumo automático de inventario
- Tracking de progreso en tiempo real
- Completado de órdenes

## Módulos Cubiertos

- **Module 24**: Production Orders Management
- **Module 25**: Activity Execution & Quality Control

## Datos de Prueba

Ver [00-TESTING-OVERVIEW.md](00-TESTING-OVERVIEW.md) para datos completos.

**Template**: Cannabis 8-Week Flowering Cycle
**Área**: Flowering Room
**Usuarios**: admin (manager), juan.lopez@testfarm.com (operator)

---

## Test 4.1: Crear Production Order desde Template

**Objetivo**: Validar la creación de una orden de producción desde un template.

**Precondiciones**:
- Phase 3 completada exitosamente
- Template "Cannabis 8-Week Flowering Cycle" activo
- Áreas creadas y disponibles
- Usuario loggeado (admin o manager)

**Pasos**:
1. Navegar a módulo "Production Orders" o "Orders"
2. Hacer clic en "Create New Order"
3. Completar formulario:
   - Template: Cannabis 8-Week Flowering Cycle (seleccionar)
   - Order Name: Batch 001 - Cherry AK Spring 2025
   - Primary Area: Flowering Room (seleccionar)
   - Start Date: [Fecha actual o próxima] (ej: 2025-04-01)
   - Quantity: 50 plants
   - Notes: First production batch for testing
4. Hacer clic en "Create Order"

**Resultados Esperados**:
- ✅ Production order creada en tabla `production_orders`
- ✅ Status inicial: "pending_approval" o "draft"
- ✅ Template vinculado correctamente
- ✅ Start date y estimated end date calculados (start + 56 días)
- ✅ Mensaje: "Order created. Scheduling activities..."
- ✅ Sistema comienza auto-scheduling de actividades

**Notas**:
- El auto-scheduling puede tomar unos segundos
- No se ejecuta nada hasta aprobación del manager
- Quantity afecta consumo de inventario (50 plantas × consumo por planta)

---

## Test 4.2: Verificar Auto-Scheduling de Actividades

**Objetivo**: Validar que todas las actividades se programaron automáticamente.

**Precondiciones**:
- Test 4.1 completado
- Order "Batch 001" creada

**Pasos**:
1. Ver detalles de la orden "Batch 001"
2. Navegar a pestaña "Activities" o "Schedule"
3. Ver calendario/timeline de actividades programadas

**Resultados Esperados**:
- ✅ Todas las actividades del template fueron instanciadas en `scheduled_activities`
- ✅ Actividades one-time programadas en días específicos:
  - Defoliation: 2025-04-21 (start + 21 días)
  - Harvest: 2025-05-26 (start + 56 días)
- ✅ Actividades recurring generadas:
  - Daily Watering: 56 instancias (una por día, del 2025-04-01 al 2025-05-26)
  - Weekly Feeding: 8 instancias (una por semana)
  - Pest Inspection: ~19 instancias (cada 3 días)
- ✅ Actividades dependent calculadas correctamente:
  - Final Flush: 2025-05-19 (harvest - 7 días)
- ✅ Cada actividad tiene:
  - Scheduled date
  - Status: "pending"
  - Assigned role
  - Vinculada al production order

**Notas**:
- Total de ~85+ actividades programadas
- Si scheduling falla, verificar lógica en backend
- Las fechas deben respetar el calendario (no días inválidos)

---

## Test 4.3: Manager Aprueba Production Order

**Objetivo**: Validar el workflow de aprobación de orden.

**Precondiciones**:
- Test 4.2 completado
- Order en status "pending_approval"
- Usuario loggeado como manager (admin o maria.garcia)

**Pasos**:
1. Ver orden "Batch 001" en lista de pending orders
2. Hacer clic en "Review Order"
3. Revisar detalles:
   - Template usado
   - Actividades programadas
   - Inventario requerido
   - Timeline
4. Hacer clic en "Approve Order"
5. (Opcional) Agregar nota de aprobación

**Resultados Esperados**:
- ✅ Status de order cambia a "active"
- ✅ `approved_by_user_id` = manager user ID
- ✅ `approved_at` timestamp registrado
- ✅ Actividades ahora visibles para operadores
- ✅ Orden aparece en dashboard de "Active Orders"
- ✅ Mensaje: "Order approved and activated"

**Notas**:
- Solo managers pueden aprobar órdenes
- Una vez aprobada, la orden está en producción
- Operadores ahora pueden ejecutar actividades

---

## Test 4.4: Operator Ver Actividades Asignadas

**Objetivo**: Validar que un operador puede ver sus actividades asignadas.

**Precondiciones**:
- Test 4.3 completado
- Order "Batch 001" aprobada y activa
- Usuario loggeado como operator (juan.lopez@testfarm.com)

**Pasos**:
1. Navegar a dashboard de operador
2. Ver sección "My Activities" o "Tasks"
3. Filtrar por "Today" o "This Week"

**Resultados Esperados**:
- ✅ Lista muestra todas las actividades asignadas al rol "Production Operator"
- ✅ Para hoy (2025-04-01), debería ver:
  - Daily Watering (instance 1)
  - Pest Inspection (instance 1, si cae en día 1)
  - Weekly Feeding (instance 1, si cae en día 1)
- ✅ Actividades ordenadas por:
  - Priority (overdue > due today > upcoming)
  - Time of day (si configurado)
- ✅ Cada actividad muestra:
  - Activity name
  - Order name
  - Scheduled date/time
  - Status (pending/in_progress/completed/overdue)
  - Duration estimado
  - Action button: "Start Activity"

**Notas**:
- Actividades no pueden iniciarse antes de su scheduled date (opcional, depende de reglas)
- Actividades críticas pueden estar marcadas con badge

---

## Test 4.5: Ejecutar Actividad - Daily Watering (Con QC Form)

**Objetivo**: Validar la ejecución completa de una actividad con QC form.

**Precondiciones**:
- Test 4.4 completado
- Actividad "Daily Watering" visible y due today
- QC Template "Water Quality Check" vinculado

**Pasos**:
1. En lista de actividades, seleccionar "Daily Watering - Batch 001 - Day 1"
2. Hacer clic en "Start Activity"
3. Verificar que status cambia a "in_progress"
4. Completar QC Form:
   - pH Level: 6.0
   - EC Level: 1.5
   - Water Temperature: 22°C
   - Notes: "All plants watered evenly"
5. Hacer clic en "Complete Activity"

**Resultados Esperados**:
- ✅ Al hacer "Start":
  - Status cambia a "in_progress"
  - `started_at` timestamp registrado
  - Timer comienza (si hay tracking de tiempo)
- ✅ QC Form se muestra correctamente con todos los campos
- ✅ Validación de campos (pH debe estar en rango 5.5-6.5, etc.)
- ✅ Al hacer "Complete":
  - Status cambia a "completed"
  - `completed_at` timestamp registrado
  - QC data guardada en tabla de quality check records
  - Activity marcada con checkmark en lista
  - Mensaje: "Activity completed successfully"

**Notas**:
- Si QC form es requerido, no se puede completar actividad sin llenarlo
- Los datos de QC son valiosos para análisis posterior

---

## Test 4.6: Ejecutar Actividad con Upload de Fotos

**Objetivo**: Validar el upload de fotos durante ejecución de actividad.

**Precondiciones**:
- Test 4.5 completado
- Actividad "Pest Inspection" disponible
- Imágenes de plantas disponibles para upload

**Pasos**:
1. Seleccionar actividad "Pest Inspection - Batch 001 - Day 1"
2. Hacer clic en "Start Activity"
3. Completar QC Form "Pest Inspection Form":
   - Plant ID: P001
   - Inspector Name: Juan López
   - Pest Type: None (o seleccionar si hay)
   - Severity: 0 (sin plagas)
4. Upload fotos:
   - Hacer clic en "Upload Photos"
   - Seleccionar 2-3 fotos de plantas (hojas, tallos)
   - Upload
5. Esperar análisis AI (opcional en esta actividad)
6. Completar actividad

**Resultados Esperados**:
- ✅ Fotos subidas a storage (tabla `media_files`)
- ✅ Cada foto vinculada a la actividad (`activity_id`)
- ✅ Thumbnails generados (opcional)
- ✅ Si análisis AI está habilitado:
  - Gemini Vision API analiza fotos
  - Detecta si hay plagas/enfermedades visibles
  - Resultado guardado en `pest_disease_records` (si detecta algo)
- ✅ Actividad completada con fotos adjuntas
- ✅ Fotos visibles en historial de actividad

**Notas**:
- Límite de upload: 10 MB por foto, 10 fotos por actividad (o similar)
- Formatos aceptados: JPG, PNG
- Análisis AI puede tomar 5-15 segundos por foto

---

## Test 4.7: AI Detecta Plaga en Foto

**Objetivo**: Validar que AI puede detectar plagas en fotos y crear alerta.

**Precondiciones**:
- Sistema de AI detection configurado
- Foto con plaga visible disponible (ej: araña roja, mosca blanca)

**Pasos**:
1. Ejecutar actividad "Pest Inspection"
2. Upload foto con plaga visible
3. Esperar análisis AI
4. Verificar resultado

**Resultados Esperados**:
- ✅ Gemini Vision API analiza foto
- ✅ AI detecta plaga (ej: "Spider Mites detected on leaves")
- ✅ Registro creado en `pest_disease_records`:
  - `pest_disease_id` (ej: Spider Mites del catálogo `pest_diseases`)
  - `severity`: estimado por AI (1-5)
  - `location`: estimado (leaves, stems, etc.)
  - `photo_id`: vinculado a foto analizada
  - `detection_method`: "ai_vision"
  - `detected_at`: timestamp
- ✅ Alert/notification generado para manager
- ✅ (Opcional) Actividad de remediación auto-creada según severity

**Notas**:
- La precisión de AI depende de calidad de foto
- False positives son posibles - manager debe revisar
- En producción, esto es crítico para early detection

---

## Test 4.8: Crear Actividad de Remediación Manual

**Objetivo**: Validar que manager puede crear actividad de remediación después de detectar plaga.

**Precondiciones**:
- Test 4.7 completado
- Plaga detectada (Spider Mites)

**Pasos**:
1. Manager ve alerta de pest detection
2. Revisar details del pest record
3. Hacer clic en "Create Remediation Activity"
4. Completar formulario:
   - Activity Name: Apply Neem Oil Treatment
   - Description: Treat spider mite infestation
   - Scheduled Date: Tomorrow (2025-04-02)
   - Assigned Role: Production Operator
   - Inventory to Use:
     - Aceite de Neem: 2 L
5. Crear actividad

**Resultados Esperados**:
- ✅ Nueva actividad creada en `scheduled_activities`
- ✅ Vinculada al production order "Batch 001"
- ✅ Vinculada al pest record (relación pest → remediation)
- ✅ Inventario "Aceite de Neem" será consumido al ejecutar
- ✅ Actividad aparece en lista de operador para mañana
- ✅ Mensaje: "Remediation activity scheduled"

**Notas**:
- Actividades de remediación no están en template (son ad-hoc)
- Son críticas y deben ejecutarse pronto
- Tracking de efectividad: después de remediar, verificar si plaga se controló

---

## Test 4.9: Ejecutar Actividad con Consumo de Inventario

**Objetivo**: Validar que el inventario se consume automáticamente al completar actividad.

**Precondiciones**:
- Test 4.8 completado
- Actividad "Weekly Feeding" programada
- Inventory items configurados (Base Floración, Cal-Mag)

**Pasos**:
1. Verificar stock actual:
   - Base Floración A+B: 500 L
   - Cal-Mag: 70 L (del Test 2.13)
2. Ejecutar actividad "Weekly Feeding - Batch 001 - Week 1"
3. Completar actividad
4. Verificar stock después

**Resultados Esperados**:
- ✅ Al completar actividad:
  - Stock de "Base Floración A+B" reduce a 490 L (500 - 10)
  - Stock de "Cal-Mag" reduce a 68 L (70 - 2)
- ✅ Transaction records creados en inventory_transactions:
  - Type: "consumption"
  - Quantity: -10 L (Base) y -2 L (Cal-Mag)
  - Reference: activity_id
  - Timestamp
- ✅ Si stock cae debajo de reorder point, genera alert
- ✅ Actividad registra inventory consumed en metadata

**Notas**:
- Consumo automático evita olvidos
- Tracking preciso de uso de recursos
- Ayuda con cost analysis y forecasting

---

## Test 4.10: Actividad Dependent se Auto-Programa

**Objetivo**: Validar que actividades dependientes se programan automáticamente.

**Precondiciones**:
- Order activa con actividad "Harvest" programada para día 56
- Actividad "Final Flush" configurada como dependent (-7 días)

**Pasos**:
1. Ver schedule de orden "Batch 001"
2. Buscar actividad "Final Flush"
3. Verificar scheduled date

**Resultados Esperados**:
- ✅ "Final Flush" programada automáticamente para 2025-05-19 (7 días antes de Harvest)
- ✅ Status: "pending" (hasta que llegue su fecha)
- ✅ Si "Harvest" se reprograma (ej: a día 58), "Final Flush" se ajusta automáticamente a día 51

**Notas**:
- Este test puede simularse reprogramando "Harvest" y verificando que "Final Flush" se mueve
- Dependencies son críticas para workflows complejos

---

## Test 4.11: Ver Progreso de Production Order

**Objetivo**: Validar el tracking de progreso de la orden.

**Precondiciones**:
- Order activa con algunas actividades completadas

**Pasos**:
1. Ver dashboard o detalles de orden "Batch 001"
2. Verificar métricas de progreso

**Resultados Esperados**:
- ✅ Progress bar o porcentaje visible:
  - Ejemplo: "5 of 85 activities completed (6%)"
- ✅ Breakdown por fase:
  - Early Flower: X% complete
  - Mid Flower: 0% (aún no inicia)
  - Late Flower: 0%
- ✅ Status indicators:
  - On Track / At Risk / Delayed
- ✅ Upcoming activities (próximas 7 días)
- ✅ Overdue activities (si las hay)
- ✅ Timeline visual muestra:
  - Actividades pasadas (completed)
  - Actividades actuales (in progress)
  - Actividades futuras (pending)

**Notas**:
- Progreso se calcula en tiempo real
- Manager puede usar esto para monitoring diario
- Si hay muchas overdue, puede indicar problema

---

## Test 4.12: Actividad Overdue

**Objetivo**: Validar el manejo de actividades vencidas.

**Precondiciones**:
- Order activa
- Actividad no completada después de su scheduled date

**Pasos**:
1. Simular paso del tiempo (o configurar actividad con fecha pasada)
2. Actividad "Daily Watering - Day 1" no se completó ayer
3. Ver lista de actividades hoy

**Resultados Esperados**:
- ✅ Actividad marca como "overdue"
- ✅ Badge o color de alerta (rojo)
- ✅ Aparece en top de lista de prioridades
- ✅ (Opcional) Notification enviada a operator y manager
- ✅ Actividad aún puede completarse (no se bloquea)
- ✅ Al completar, registra que fue "completed late"

**Notas**:
- Actividades críticas overdue requieren atención inmediata
- Ej: no regar plantas puede causar daño
- Tracking de overdue útil para performance metrics

---

## Test 4.13: Manager Reprograma Actividad

**Objetivo**: Validar que manager puede cambiar fecha de actividad si necesario.

**Precondiciones**:
- Order activa
- Actividad futura "Defoliation" programada para día 21

**Pasos**:
1. Manager ve actividad "Defoliation - Batch 001"
2. Hacer clic en "Reschedule" o editar
3. Cambiar scheduled date:
   - Original: 2025-04-21
   - Nueva: 2025-04-23 (retrasar 2 días por condiciones de plantas)
4. Agregar nota: "Delaying due to slower growth"
5. Guardar cambio

**Resultados Esperados**:
- ✅ `scheduled_date` actualizado a 2025-04-23
- ✅ Change log registrado (quién, cuándo, por qué)
- ✅ Si hay dependent activities, se ajustan automáticamente
- ✅ Operador ve nueva fecha en su lista
- ✅ Mensaje: "Activity rescheduled successfully"

**Notas**:
- Solo managers pueden reprogramar
- Cambios deben justificarse (nota requerida)
- No se puede reprogramar actividades ya completadas

---

## Test 4.14: Completar Múltiples Actividades en Semana 1

**Objetivo**: Simular ejecución normal de producción durante primera semana.

**Precondiciones**:
- Order activa
- Operador loggeado

**Pasos**:
1. Completar todas las actividades de días 1-7:
   - Daily Watering: 7 instancias (día 1-7)
   - Weekly Feeding: 1 instancia (día 1)
   - Pest Inspection: 2-3 instancias (días 1, 4, 7)
2. Llenar QC forms para cada una
3. Upload fotos para pest inspections
4. Verificar consumo de inventario

**Resultados Esperados**:
- ✅ Todas las actividades de semana 1 completadas
- ✅ Progress de order: ~12 of 85 (14%)
- ✅ Inventory consumed:
  - Base Floración: -10 L
  - Cal-Mag: -2 L
  - [Otros items según configuración]
- ✅ QC records: 10+ registros guardados
- ✅ Photos: 6-9 fotos subidas
- ✅ No actividades overdue
- ✅ Order status: "active" y "on track"

**Notas**:
- Esto simula operación normal día a día
- En producción real, esto tomaría 7 días
- Para testing, se puede completar en minutos

---

## Test 4.15: Ver Reportes de Quality Checks

**Objetivo**: Validar que se pueden ver reportes de calidad.

**Precondiciones**:
- Múltiples QC forms completados

**Pasos**:
1. Navegar a sección de "Quality Reports" o "QC History"
2. Filtrar por order "Batch 001"
3. Ver datos de "Water Quality Check"

**Resultados Esperados**:
- ✅ Lista muestra todos los QC records:
  - Date
  - Activity
  - Form type
  - Key values (pH, EC, etc.)
  - Inspector
- ✅ Se puede filtrar por:
  - Date range
  - QC template
  - Inspector
- ✅ Charts/graphs visualizan trends:
  - pH over time (debería estar estable 5.5-6.5)
  - EC over time
- ✅ Export a CSV/PDF disponible (opcional)

**Notas**:
- Este data es crítico para compliance y análisis
- Trends pueden revelar problemas (ej: pH subiendo gradualmente)

---

## Test 4.16: Ver Historial de Pest Detections

**Objetivo**: Validar el tracking de plagas detectadas.

**Precondiciones**:
- Al menos 1 pest detection registrado (Test 4.7)

**Pasos**:
1. Navegar a "Pest & Disease Management"
2. Ver historial de detecciones

**Resultados Esperados**:
- ✅ Lista muestra pest records:
  - Detection date
  - Pest/disease type (Spider Mites)
  - Severity (1-5)
  - Location (leaves, stems)
  - Detection method (AI vision / manual)
  - Status: Active / Under treatment / Resolved
  - Associated remediation activities
- ✅ Se puede marcar pest como "Resolved" después de tratamiento
- ✅ Photos asociadas visibles

**Notas**:
- Tracking de plagas es crucial para compliance (regulaciones)
- Debe haber audit trail completo

---

## Test 4.17: Pausar Production Order

**Objetivo**: Validar que se puede pausar una orden temporalmente.

**Precondiciones**:
- Order activa "Batch 001"

**Pasos**:
1. Manager selecciona orden "Batch 001"
2. Hacer clic en "Pause Order"
3. Ingresar razón: "Equipment maintenance required"
4. Confirmar

**Resultados Esperados**:
- ✅ Status de order cambia a "paused"
- ✅ Todas las actividades pending cambian a "on_hold"
- ✅ Operadores no ven estas actividades en su lista
- ✅ Timeline/schedule se "congela"
- ✅ Mensaje: "Order paused. Resume when ready."

**Notas**:
- Al pausar, no se reprograman actividades (aún)
- Útil para emergencias o mantenimiento
- Debe poder resumir después

---

## Test 4.18: Resumir Production Order

**Objetivo**: Validar que se puede resumir orden pausada.

**Precondiciones**:
- Test 4.17 completado
- Order "Batch 001" pausada

**Pasos**:
1. Manager selecciona orden pausada
2. Hacer clic en "Resume Order"
3. Seleccionar opción:
   - Keep original schedule (puede resultar en muchas overdue)
   - Reschedule remaining activities (ajustar fechas)
4. Confirmar con opción "Reschedule"

**Resultados Esperados**:
- ✅ Status cambia de "paused" a "active"
- ✅ Actividades pending reprogramadas desde hoy en adelante
- ✅ Dependencies recalculadas
- ✅ Estimated end date actualizado
- ✅ Operadores ven actividades nuevamente
- ✅ Mensaje: "Order resumed. Schedule adjusted."

**Notas**:
- Reschedule automático es complejo pero necesario
- Alternativa manual: manager ajusta fechas individualmente

---

## Test 4.19: Completar Order (Harvest)

**Objetivo**: Validar el proceso de completar una orden (simular harvest).

**Precondiciones**:
- Todas las actividades completadas excepto "Harvest"
- Day 56 alcanzado (o simulado)

**Pasos**:
1. Ejecutar actividad "Harvest - Batch 001"
2. Completar QC form (si hay):
   - Harvest Date: 2025-05-26
   - Wet Weight: 25 kg
   - Quality: Premium
   - Notes: "Excellent trichome development"
3. Upload fotos de cosecha
4. Completar actividad
5. Verificar status de orden

**Resultados Esperados**:
- ✅ Actividad "Harvest" completada
- ✅ Progress: 85 of 85 (100%)
- ✅ Status de order cambia automáticamente a "completed"
- ✅ `completed_at` timestamp registrado
- ✅ Harvest data guardado (weight, quality)
- ✅ Order ya no aparece en "Active Orders"
- ✅ Aparece en "Completed Orders" o historial
- ✅ Mensaje: "Congratulations! Order completed successfully."

**Notas**:
- Completar orden es hito importante
- Data de harvest es crítico para analytics (yield, quality, etc.)
- Puede trigger post-harvest workflows (curing, etc.) en fases futuras

---

## Test 4.20: Ver Analytics y Reportes de Order Completado

**Objetivo**: Validar que se pueden generar reportes de orden completada.

**Precondiciones**:
- Test 4.19 completado
- Order "Batch 001" completada

**Pasos**:
1. Navegar a detalles de orden "Batch 001"
2. Ver sección "Summary" o "Report"
3. Generar reporte completo

**Resultados Esperados**:
- ✅ Summary muestra:
  - **Duration**: Start date → End date (56 días)
  - **Activities**: 85 total, 85 completed (100%)
  - **Overdue activities**: X (si las hubo)
  - **Inventory consumed**:
    - Base Floración: 80 L
    - Cal-Mag: 16 L
    - [Otros items]
  - **Harvest yield**: 25 kg wet weight
  - **Quality checks**: X forms completed
  - **Pest detections**: 1 (Spider Mites, resolved)
  - **Photos uploaded**: X fotos
- ✅ Timeline visual completo
- ✅ Cost analysis (inventory cost + labor hours)
- ✅ Performance metrics:
  - On-time completion rate
  - Average activity completion time
- ✅ Export a PDF disponible

**Notas**:
- Este reporte es valioso para:
  - Compliance (regulaciones)
  - Continuous improvement
  - Cost tracking
  - Yield forecasting

---

## Test 4.21: Crear Segunda Production Order

**Objetivo**: Validar que se pueden tener múltiples órdenes simultáneas.

**Precondiciones**:
- Facility tiene capacidad disponible
- Áreas disponibles

**Pasos**:
1. Crear nueva orden:
   - Template: Cannabis 8-Week Flowering Cycle (mismo)
   - Order Name: Batch 002 - OG Kush Spring 2025
   - Cultivar: OG Kush (cambiar cultivar)
   - Primary Area: Flowering Room (misma área o diferente)
   - Start Date: 2025-04-15 (2 semanas después de Batch 001)
   - Quantity: 40 plants
2. Aprobar orden
3. Ver ambas órdenes activas

**Resultados Esperados**:
- ✅ Segunda orden creada exitosamente
- ✅ Actividades programadas independientemente
- ✅ Dashboard muestra 2 active orders (si Batch 001 aún activa)
- ✅ Operadores ven actividades de ambas órdenes en su lista
- ✅ Inventario compartido entre ambas órdenes
- ✅ No hay conflictos de scheduling

**Notas**:
- Múltiples órdenes simultáneas es caso real
- Área puede tener múltiples batches si hay capacidad
- Operadores deben poder filtrar actividades por orden

---

## Test 4.22: Validar Capacidad de Área

**Objetivo**: Validar que sistema no permite exceder capacidad de área.

**Precondiciones**:
- Flowering Room tiene capacidad: 100 plants
- Batch 001: 50 plants (completado)
- Batch 002: 40 plants (activo)

**Pasos**:
1. Intentar crear tercera orden:
   - Order Name: Batch 003
   - Primary Area: Flowering Room
   - Quantity: 30 plants
2. Verificar validación

**Resultados Esperados**:
- ✅ Si Batch 001 ya completó (plantas cosechadas), capacidad liberada:
  - Ocupación actual: 40/100 (solo Batch 002)
  - Batch 003 (30 plants) puede crearse ✓
- ✅ Si Batch 001 aún activo:
  - Ocupación: 90/100 (50 + 40)
  - Batch 003 (30 plants) rechazado ✗
  - Error: "Insufficient capacity in Flowering Room. Available: 10 plants."

**Notas**:
- Capacity management es crítico para planning
- Algunas implementaciones pueden permitir "overbooking" con warning
- Capacidad se libera cuando orden completa o plantas se mueven/cosechan

---

## Resumen de Phase 4

### Flujo Completo Esperado

```
1. Create Production Order from Template
   ↓
2. Auto-Schedule ALL Activities (~85+ instances)
   ↓
3. Manager Approves Order
   ↓
4. Operator Executes Activities:
   - Fill QC Forms
   - Upload Photos
   - AI Analyzes Photos (pest detection)
   - Inventory Auto-Consumed
   ↓
5. Manager Monitors Progress
   - Track completion %
   - Handle overdue activities
   - Create ad-hoc remediation activities
   ↓
6. Complete Final Activity (Harvest)
   ↓
7. Order Auto-Completed
   ↓
8. Generate Reports & Analytics
   ↓
9. Repeat for Next Batch
```

### Estado del Sistema al Finalizar Phase 4

**Production Orders**:
- 1+ completed order: "Batch 001 - Cherry AK"
- 1+ active orders: "Batch 002 - OG Kush" (opcional)

**Activities Executed**:
- 85+ activities completed en Batch 001
- QC forms filled: 85+ records
- Photos uploaded: 20-50 fotos
- Pest detections: 1+ (con remediation)

**Inventory Consumed**:
- Base Floración: ~80 L consumido
- Cal-Mag: ~16 L consumido
- Otros items según configuración
- Stock levels actualizados en tiempo real

**Quality Data Collected**:
- Water quality: pH y EC registrados diariamente (56 records)
- Pest inspections: ~19 records
- Harvest data: yield, quality

**System Metrics**:
- Order completion rate: 100%
- On-time activity rate: X%
- Average activity duration: X hours
- Inventory turnover: calculado

### Criterios de Éxito

- ✅ Production order creada desde template
- ✅ Todas las actividades auto-programadas correctamente
- ✅ Manager aprobó orden exitosamente
- ✅ Operador ejecutó múltiples actividades
- ✅ QC forms completados con datos válidos
- ✅ Fotos subidas y analizadas por AI
- ✅ AI detectó al menos 1 plaga/enfermedad (si foto apropiada usada)
- ✅ Actividad de remediación creada y ejecutada
- ✅ Inventario consumido automáticamente
- ✅ Progress tracking funcionando
- ✅ Orden completada exitosamente
- ✅ Reportes generados

### Troubleshooting

**Problema: Actividades no se auto-programan**
- Verificar que template tiene actividades configuradas
- Verificar lógica de scheduling en backend
- Revisar logs de errores durante creación de orden

**Problema: Operador no ve actividades asignadas**
- Verificar que orden está aprobada (status "active")
- Verificar rol del operador
- Verificar filtros en vista de actividades (date range, status)

**Problema: No puedo completar actividad (botón deshabilitado)**
- Verificar que actividad está "in progress"
- Verificar que QC form requerido está completado
- Verificar que todos los campos obligatorios tienen valores

**Problema: AI no detecta plaga en foto**
- Verificar calidad de foto (clara, bien iluminada, enfocada)
- Verificar que plaga es visible para humanos
- AI no es 100% preciso - puede tener false negatives
- Verificar API key de Gemini y límites de rate

**Problema: Inventario no se consume al completar actividad**
- Verificar que actividad tiene inventory items vinculados
- Verificar que quantities están configuradas
- Verificar que hay stock suficiente
- Revisar logs de inventory transactions

**Problema: Progress no se actualiza**
- Refrescar página
- Verificar que actividades están marcadas "completed"
- Verificar cálculo de progreso (completed / total)

**Problema: No puedo aprobar orden**
- Verificar que usuario tiene rol Manager o superior
- Verificar que orden está en status "pending_approval"
- Verificar que hay inventory suficiente para estimación

**Problema: Order no se completa automáticamente después de última actividad**
- Verificar que TODAS las actividades están completed
- Verificar que no hay actividades "on_hold" o "paused"
- Trigger manual de completion si es necesario

**Problema: Múltiples órdenes causan conflictos en área**
- Verificar capacidad disponible del área
- Revisar lógica de capacity tracking
- Considerar usar diferentes áreas o escalonar fechas

---

**Fase anterior**: [03-PHASE-3-TEMPLATES-TESTS.md](03-PHASE-3-TEMPLATES-TESTS.md)

---

## Conclusión del Testing End-to-End

Al completar exitosamente todas las fases (1-4), habrás validado:

1. **Onboarding completo**: Usuario → Empresa → Facility
2. **Master data**: Áreas, cultivares, suppliers, inventory, equipo
3. **Templates inteligentes**: Scheduling complejo, AI QC forms
4. **Producción real**: Órdenes, actividades, QC, fotos, AI, tracking

El sistema Alquemist está listo para producción real cuando:
- Todos los flujos críticos funcionan sin errores
- Data se guarda correctamente y es consistente
- UI es intuitiva y responsive
- AI detection tiene precisión aceptable (>80% para casos obvios)
- Performance es adecuado (órdenes con 100+ actividades cargan rápido)
- Reportes son completos y útiles

**Next Steps después del Testing**:
- User Acceptance Testing (UAT) con usuarios reales
- Performance testing con múltiples órdenes simultáneas
- Security audit
- Compliance review
- Production deployment

---

**Última actualización**: 2025-11-21
**Versión**: 1.0
