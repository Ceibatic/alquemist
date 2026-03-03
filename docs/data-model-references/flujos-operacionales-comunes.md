## Flujos Operativos Detallados

Descripción paso a paso de cómo interactúan las tablas durante las operaciones más comunes del sistema. Cada paso indica el dominio que interviene y las tablas afectadas.

### Flujo 1: Crear Orden de Producción, Batch e Ingreso de Material

*Inicia el ciclo productivo. Un gerente selecciona un cultivar, configura la orden con las fases deseadas, y al aprobar, el sistema genera el batch, programa las actividades, y el operario ejecuta la primera actividad de ingreso de material que formaliza la entrada del recurso al proceso productivo.*

| # | Dominio | Acción |
|---|---|---|
| 1 | **PROD** | El gerente selecciona un cultivar (ej: Gelato #41). El sistema carga automáticamente las production_phases del crop_type asociado. Para cannabis: germinación, propagación, vegetativo, floración, cosecha, secado, empaque + madre (8 fases, donde madre es bifurcación opcional desde vegetativo). |
| 2 | **ORDER** | Se crea un production_order con: cultivar_id=Gelato, entry_phase_id y exit_phase_id según el tipo de operación. Ejemplos: full-cycle desde semilla (germinación→empaque), desde esquejes (propagación→empaque), procesador (secado→empaque), establecimiento de madre (germinación→madre). |
| 3 | **ORDER** | El sistema genera production_order_phases siguiendo la cadena depends_on_phase_id desde entry hasta exit, con planned_duration_days tomados del cultivar.phase_durations o de production_phases.default_duration_days. |
| 4 | **PROD** | Cálculo en cascada usando phase_product_flows del cultivar Gelato desde entry hasta exit phase. Ejemplo full-cycle: 50 semillas × 90% germinación × 95% propagación × 98% floración × 500g/planta × 25% ratio seco × 80% trimming = ~4.7kg producto final. Cada yield es específico del cultivar. Se registra en expected_output_quantity. |
| 5 | **NEXO** | Al aprobar la orden se crea el batch: code='LOT-GELATO-260301', cultivar_id=Gelato, current_phase_id=entry_phase, current_product_id=initial_product, source_inventory_item_id=lote de semillas/esquejes, zone_id=zona asignada, production_order_id=la orden, status='active'. |
| 6 | **ACT** | El cultivation_schedule genera scheduled_activities desde los activity_templates aplicables a cada fase (via activity_template_phases). La PRIMERA actividad es siempre ENTRY-MATERIAL: template de ingreso de material que formaliza la entrada del recurso al batch. Cada scheduled_activity guarda un template_snapshot JSONB. |
| 7 | **INV** | Si hay material en inventario, se genera una reservation (inventory_transaction type='reservation') para reservar la cantidad. quantity_reserved += N en el inventory_item correspondiente. |
| 8 | **ACT** | El operario ejecuta ENTRY-MATERIAL: se crea activity con batch_id, zone_id, phase_id=entry_phase. Los activity_resources registran el material consumido (semillas, esquejes, flor húmeda) con quantity_actual y el inventory_item_id específico. |
| 9 | **INV** | Se generan dos inventory_transactions: (1) type='release' libera la reserva, (2) type='consumption' registra el consumo real con contexto completo: batch_id, phase_id, activity_id, user_id. El inventory_item pasa a lot_status='depleted' si se consumió todo. |
| 10 | **ACT** | La actividad ENTRY-MATERIAL pasa a status='completed'. El batch está formalmente en producción con material ingresado, trazable hasta el lote de origen (y si aplica, hasta el shipment, supplier y documentos regulatorios). |

### Flujo 1b: Propagación por Semilla (Ciclo Completo)

*Desde la compra de semillas hasta la planta vegetativa lista para floración. Demuestra la cadena completa semilla → plántula → planta enraizada → planta vegetativa con dos transformaciones de fase.*

**phase_product_flows del cultivar Gelato para esta ruta:**

| Fase | direction | product_role | product_id | yield |
|---|---|---|---|---|
| germinación | input | primary | SEM-GELATO-FEM | — |
| germinación | output | primary | SEEDLING-GELATO | 90% (9 de cada 10 germinan) |
| propagación | input | primary | SEEDLING-GELATO | — |
| propagación | output | primary | PLANT-VEG-GELATO | 95% (5% no enraízan bien) |
| vegetativo | input | primary | PLANT-VEG-GELATO | — |
| vegetativo | output | primary | PLANT-FLO-GELATO | 98% |

**Flujo paso a paso:**

| # | Dominio | Acción |
|---|---|---|
| 1 | **REG** | Semillas llegan via shipment desde proveedor certificado. Inspección: viabilidad, integridad de la cubierta, documentos fitosanitarios. Se crea inventory_item: SEM-GELATO-FEM, quantity=50, source_type='purchase'. |
| 2 | **ORDER** | production_order: cultivar=Gelato, entry_phase=germinación, exit_phase=empaque, initial_quantity=50, initial_product=SEM-GELATO-FEM. |
| 3 | **NEXO** | Batch creado: LOT-GELATO-260301, current_phase=germinación, current_product=SEM-GELATO-FEM, source_inventory_item=lote de semillas. |
| 4 | **ACT** | ENTRY-MATERIAL: operario registra ingreso de 50 semillas al batch. Genera consumption del lote de semillas. Las semillas dejan de ser "stock en almacén" y pasan a ser "material en producción". |
| 5 | **ACT** | Actividades de germinación: remojo (24h), siembra en sustrato húmedo, control de temperatura (25-28°C), control de humedad (>80%). Duración típica: 3-7 días. |
| 6 | **INV** | Fin de germinación — is_transformation=true, is_destructive=true: transformation_out destruye SEM-GELATO-FEM (50 semillas), transformation_in crea SEEDLING-GELATO (45 plántulas, yield 90%). 5 semillas no viables → transaction type='waste'. |
| 7 | **NEXO** | Batch actualiza: current_phase=propagación, current_product=SEEDLING-GELATO, plant_count=45. Zone puede cambiar (germinador → bandeja de propagación). |
| 8 | **ACT** | Actividades de propagación: trasplante a alvéolos individuales, fertirrigación suave, luz 18/6, inspección de enraizamiento. Duración: 10-21 días. |
| 9 | **INV** | Fin de propagación — is_transformation=true, is_destructive=false: transformation_out marca SEEDLING-GELATO como transformado, transformation_in crea PLANT-VEG-GELATO (43 plantas, yield 95%). 2 plántulas débiles → waste. |
| 10 | **NEXO** | Batch actualiza: current_phase=vegetativo, current_product=PLANT-VEG-GELATO, plant_count=43, zone=Sala Vegetativo. Desde aquí continúa el ciclo normal (vegetativo → floración → cosecha → secado → empaque). |

### Flujo 1c: Propagación por Esquejes Externos

*La empresa compra esquejes (clones) de un vivero externo y arranca directamente en propagación, saltando germinación. Demuestra el entry_point flexible y la trazabilidad de transporte.*

**phase_product_flows del cultivar Gelato para esta ruta:**

| Fase | direction | product_role | product_id | yield |
|---|---|---|---|---|
| propagación | input | primary | CLONE-GELATO | — |
| propagación | output | primary | PLANT-VEG-GELATO | 92% (esquejes menos robustos que plántulas de semilla) |

**Flujo paso a paso:**

| # | Dominio | Acción |
|---|---|---|
| 1 | **REG** | Shipment desde vivero: 100 esquejes CLONE-GELATO, transporte refrigerado (8-12°C), documentos: Guía ICA + certificado fitosanitario + certificado de origen genético. |
| 2 | **REG** | Inspección de llegada: received=98, rejected=2 (raíz dañada). inspection_result='accepted_with_observations'. Se crea inventory_item: CLONE-GELATO, quantity=98, shipment_item_id=↑. |
| 3 | **ORDER** | production_order: cultivar=Gelato, **entry_phase=propagación** (salta germinación), exit_phase=empaque, initial_quantity=98, initial_product=CLONE-GELATO. La germinación NO se incluye en production_order_phases. |
| 4 | **NEXO** | Batch creado: LOT-GELATO-260315, current_phase=propagación, current_product=CLONE-GELATO, source_inventory_item=lote de esquejes (trazable al shipment y supplier). |
| 5 | **ACT** | ENTRY-MATERIAL: operario registra ingreso de 98 esquejes. consumption del lote de esquejes. Observación: "2 esquejes adicionales con signos de deshidratación, se mantienen en observación". |
| 6 | **ACT** | Actividades de propagación: aplicación de hormona de enraizamiento, sustrato húmedo, cúpula de humedad, luz difusa 18/6. Duración: 10-14 días. Inspección de raíces día 7 y día 12. |
| 7 | **INV** | Fin de propagación: transformation 98 esquejes → 90 plantas enraizadas (PLANT-VEG-GELATO, yield 92%). 8 esquejes que no enraizaron → waste. |
| 8 | **NEXO** | Batch actualiza: current_phase=vegetativo, current_product=PLANT-VEG-GELATO, plant_count=90. Trazabilidad completa: PLANT-VEG-GELATO → batch → source_inventory_item → shipment_item → shipment → supplier + docs. |

### Flujo 1d: Planta Madre y Producción de Clones

*Establecimiento de una planta madre y su ciclo continuo de producción de clones. La fase 'madre' es una bifurcación desde vegetativo: el batch permanece indefinidamente, produciendo clones periódicamente que alimentan nuevas órdenes de producción. Demuestra is_transformation=true con is_destructive=false.*

**phase_product_flows del cultivar Gelato para la ruta madre:**

| Fase | direction | product_role | product_id | yield | Notas |
|---|---|---|---|---|---|
| germinación | input | primary | SEM-GELATO-FEM | — | |
| germinación | output | primary | SEEDLING-GELATO | 90% | |
| propagación | input | primary | SEEDLING-GELATO | — | |
| propagación | output | primary | PLANT-VEG-GELATO | 95% | |
| madre | input | primary | PLANT-VEG-GELATO | — | *la madre se "consume" solo nominalmente — el batch no se destruye* |
| madre | output | primary | CLONE-GELATO | — | *expected_quantity_per_input=50 clones por sesión de corte* |

**Parte 1 — Establecimiento de la planta madre:**

| # | Dominio | Acción |
|---|---|---|
| 1 | **ORDER** | production_order: cultivar=Gelato, entry_phase=germinación, **exit_phase=madre**. initial_quantity=5 semillas (se seleccionará la mejor planta como madre). production_order_phases genera: germinación → propagación → vegetativo → madre (NO incluye floración→empaque). |
| 2 | **NEXO** | Batch creado: LOT-MADRE-GELATO-001, current_phase=germinación. El batch sigue el flujo normal de semilla (Flujo 1b pasos 4-9) hasta llegar a vegetativo. |
| 3 | **ACT** | En vegetativo, el supervisor selecciona la mejor planta por vigor, estructura y salud. Si se iniciaron 5 semillas, se hace split (Flujo 4): LOT-MADRE-GELATO-001 queda con 1 planta (la elegida), las otras 4 se separan a un batch de producción normal. |
| 4 | **NEXO** | Transición de fase: vegetativo → madre. Batch actualiza: current_phase=madre, zone=Sala Madres. La orden pasa a status='completed' pero el **batch permanece status='active'** indefinidamente. |

**Parte 2 — Ciclo de producción de clones (recurrente):**

| # | Dominio | Acción |
|---|---|---|
| 5 | **ACT** | Actividad programada: template CLONE-CUT, frecuencia=biweekly, asociada a fase madre via activity_template_phases. El template define: triggers_transformation=true, estimated_duration=120min. |
| 6 | **ACT** | El operario ejecuta CLONE-CUT: selecciona ramas apicales, corta 50 esquejes, aplica hormona, registra observaciones sobre vigor de la madre. activity_resources registra insumos consumidos (hormona, gel, alvéolos, sustrato). |
| 7 | **INV** | Fase madre: is_transformation=true, is_destructive=**false**. El sistema genera transformation_in SIN transformation_out: se crean 50 unidades de CLONE-GELATO como nuevo inventory_item (source_type='production'). La madre NO se destruye — el batch mantiene plant_count=1, current_product inalterado. |
| 8 | **INV** | Nuevo inventory_item: product=CLONE-GELATO, quantity=50, source_type='production', zone='Sala Madres'. El lote es trazable al batch madre y a la actividad CLONE-CUT específica via transaction.batch_id y transaction.activity_id. |
| 9 | **NEXO** | El batch madre sigue en status='active', current_phase=madre. Recibe actividades de mantenimiento (fertirrigación, poda de formación, renovación de sustrato) intercaladas con los CLONE-CUT periódicos. |
| 10 | **ORDER** | Los 50 clones producidos alimentan nuevas órdenes de producción: production_order con entry_phase=propagación, initial_product=CLONE-GELATO, source=este inventory_item. El Flujo 1c aplica a partir de ahí. |

**Ciclo continuo:** La madre puede producir clones cada 2-3 semanas durante 6-12 meses. Cada sesión de CLONE-CUT genera un inventory_item independiente con su propia trazabilidad. Cuando la madre se agota o pierde vigor, el batch pasa a status='completed' y se establece una nueva madre.

**Trazabilidad completa de un clon producido internamente:**

```
CLONE-GELATO (inventory_item — producido internamente)
│
├── inventory_transaction type='transformation_in'
│   ├── batch_id → LOT-MADRE-GELATO-001 (la madre que lo produjo)
│   ├── activity_id → CLONE-CUT #47 (sesión de corte específica)
│   └── phase_id → madre
│
├── Madre: LOT-MADRE-GELATO-001
│   ├── cultivar: Gelato #41
│   ├── Origen: LOT-MADRE-GELATO-001 (batch original de semilla)
│   │   └── source_inventory_item → SEM-GELATO-FEM
│   │       └── shipment → supplier: "Banco Genético XYZ"
│   └── Historial: 47 sesiones de CLONE-CUT, 2,350 clones producidos
│
└── Destino: production_order → nuevo batch → propagación → ... → producto final
```

### Flujo 2: Fertirrigación Diaria

*Operación rutinaria que demuestra el ciclo completo template → scheduled → activity → transaction. Incluye escalado automático, checklist de verificación y generación de alertas.*

| # | Dominio | Acción |
|---|---|---|
| 1 | **ACT** | scheduled_activity aparece en el dashboard del operario: template=FERT-VEG-S1, batch=LOT-001, phase=vegetativo, planned_date=hoy, crop_day=35. |
| 2 | **ACT** | El operario inicia la ejecución. Se crea un registro en activities: zone_id=Sala Veg A, phase_id=vegetativo, batch_id=LOT-001, performed_by=operario, performed_at=ahora, status='in_progress'. |
| 3 | **ACT** | El sistema escala los recursos del template_snapshot según quantity_basis: 42 plantas × 5L/planta (per_plant) = 210L agua. Ca(NO₃)₂: 0.8g/L × 210L (per_L_solution) = 168g. Se pre-cargan como quantity_planned en activity_resources. |
| 4 | **INV** | El operario confirma cantidades reales. Por cada recurso, activity_resources registra quantity_actual. Se genera inventory_transaction type='application' para cada recurso: Ca(NO₃)₂ -168g, agua -210L, etc. |
| 5 | **INV** | El inventory_item de Ca(NO₃)₂: quantity_available -= 168g. La transaction tiene contexto completo: zone_id=Sala Veg A, batch_id=LOT-001, phase_id=vegetativo, activity_id=esta actividad, user_id=operario, cost_total calculado. |
| 6 | **ACT** | El operario completa el checklist: EC=1.8 (target: 1.5-2.0 ✓), pH=5.9 (target: 5.8-6.2 ✓), drenaje=18% (target: 15-20% ✓). Todos los ítems is_critical pasan. |
| 7 | **OPS** | Si algún valor de checklist está fuera de rango, se genera automáticamente un registro en alerts: type='env_out_of_range', severity='warning', entity_type='batch', entity_id=LOT-001. |
| 8 | **ACT** | La actividad pasa a status='completed'. scheduled_activity.status='completed' y completed_activity_id apunta a esta actividad. |

### Flujo 3: Cosecha con Multi-Output y Test de Calidad

*La cosecha es la operación más compleja: destruye el input (plantas), genera múltiples outputs (flor húmeda, trim, desperdicio), consume insumos, registra fotos, avanza la fase del batch, y dispara un test de calidad.*

| # | Dominio | Acción |
|---|---|---|
| 1 | **ACT** | Se ejecuta la actividad HARV-MANUAL-CUT. El template define 18 recursos en 7 categorías, estimated_duration=360min, triggers_transformation=true, triggers_phase_change_id=secado. |
| 2 | **INV** | transformation_out: Se genera inventory_transaction type='transformation_out' para las 42 plantas en floración. El inventory_item FLO-GELATO se reduce a 0 y pasa a lot_status='depleted'. |
| 3 | **PROD** | phase_product_flows del cultivar Gelato para la fase 'cosecha' define los outputs: direction='output', product_role='primary' → WET-GELATO (flor húmeda); product_role='secondary' → TRIM-WET-GELATO (trim húmedo); product_role='waste' → tallos y raíces. Los productos y yields son específicos de Gelato. |
| 4 | **INV** | transformation_in — Output primario: Se crea NUEVO inventory_item para WET-GELATO (flor húmeda), +21kg. Transaction type='transformation_in', related_transaction_id apunta al transformation_out, target_item_id apunta al nuevo item. |
| 5 | **INV** | transformation_in — Output secundario: Se crea NUEVO inventory_item para TRIM-WET-GELATO (trim húmedo), +8.4kg. Misma mecánica de vinculación con related_transaction_id. |
| 6 | **INV** | waste: ~50kg tallos y raíces. Transaction type='waste', reason='Material no aprovechable, descartado en compostera'. No crea inventory_item de destino. |
| 7 | **INV** | consumption: Los insumos consumidos (6 pares guantes, 300mL alcohol isopropílico, turkey bags, etc.) generan cada uno su transaction type='consumption' con contexto completo. |
| 8 | **OPS** | Fotos de la cosecha se registran en attachments: entity_type='activity', entity_id=esta actividad, file_type='image/jpeg'. Múltiples fotos, cada una un registro. |
| 9 | **NEXO** | El batch se actualiza: current_phase_id avanza a 'secado', status='phase_transition', current_product_id cambia a WET-GELATO, zone_id cambia a 'Sala Secado'. |
| 10 | **ÁREAS** | Si existen plant_positions, todas pasan a status='harvested' y current_batch_id se limpia. |
| 11 | **QUAL** | Se crea quality_test: batch_id=LOT-001, phase_id=cosecha, test_type='potency', status='pending'. Cuando el lab devuelva resultados, se crean quality_test_results para THC (23.5%), CBD (0.8%), limonene (12mg/g), etc. |
| 12 | **ORDER** | production_order_phases para 'cosecha': status='completed', input_quantity=42 plantas, output_quantity=21kg flor húmeda, yield_pct calculado. |

### Flujo 4: Split de Batch

*Cuando parte de un lote presenta problemas (deficiencia, retraso, contaminación), se separa en un batch hijo para tratamiento independiente manteniendo trazabilidad completa.*

| # | Dominio | Acción |
|---|---|---|
| 1 | **NEXO** | El supervisor detecta que 8 de las 42 plantas del batch LOT-001 muestran deficiencia severa de calcio. Decide separar las plantas afectadas para tratamiento intensivo sin retrasar el resto del lote. |
| 2 | **NEXO** | Se crea batch_lineage: operation='split', parent_batch_id=LOT-001, child_batch_id=LOT-001-B, quantity_transferred=8 plantas, reason='8 plantas con deficiencia Ca severa', performed_by=supervisor. |
| 3 | **NEXO** | LOT-001 se actualiza: plant_count=34 (de 42). Se crea LOT-001-B: parent_batch_id=LOT-001, plant_count=8, cultivar_id=Gelato (heredado), current_phase_id=vegetativo (misma fase), zone_id puede ser la misma u otra zona. |
| 4 | **ACT** | LOT-001-B recibe scheduled_activities propias con templates correctivos (mayor concentración Ca, fertirrigación más frecuente). El plan original de LOT-001 continúa sin cambios. |
| 5 | **INV** | Cada batch acumula costos por separado: todas las inventory_transactions llevan batch_id=LOT-001 o batch_id=LOT-001-B según corresponda. total_cost de cada batch se calcula independientemente. |
| 6 | **NEXO** | Cuando LOT-001-B se recupera, se puede crear otro batch_lineage operation='merge' para reunificar, o mantener como batches separados hasta el final. La genealogía completa queda registrada. |

### Flujo 5: Procesador de Post-Cosecha (Fases 5-7)

*Una empresa procesadora compra flor húmeda y solo ejecuta secado, trimming y empaque. El modelo soporta esto sin adaptaciones, gracias a los entry/exit points de la orden de producción.*

| # | Dominio | Acción |
|---|---|---|
| 1 | **ORDER** | Se crea production_order: cultivar_id=Gelato, entry_phase_id=secado (fase 5), exit_phase_id=empaque (fase 7), initial_quantity=21kg, initial_product_id=WET-GELATO. No se generan phases para germinación, vegetativo, floración ni cosecha. |
| 2 | **INV** | La flor húmeda comprada se registra como inventory_transaction type='receipt': +21kg WET-GELATO, source_type='purchase', cost_per_unit=precio de compra. Se crea el inventory_item correspondiente. |
| 3 | **NEXO** | Se crea el batch: cultivar_id=Gelato, current_phase_id=secado, status='active', source_inventory_item_id=la compra, zone_id=Sala Secado. |
| 4 | **ACT** | Los templates de secado, trimming y empaque se programan y ejecutan con el flujo normal de scheduled_activities → activities → activity_resources → inventory_transactions. |
| 5 | **INV** | Secado: transformation 21kg húmeda → 5.25kg seca (yield 25%). phase_product_flows del cultivar Gelato para la fase 'secado' define: input=WET-GELATO, output primary=DRY-GELATO con expected_yield_pct=25%. |
| 6 | **QUAL** | Post-secado: quality_test para humedad residual (<12%), presencia de moho (negativo), integridad de tricomas. Los resultados quedan vinculados al batch y fase. |
| 7 | **INV** | Trimming: 5.25kg seca → 4.2kg premium (DRY-GELATO-PREMIUM) + 1.05kg trim seco (TRIM-DRY-GELATO). Multi-output via phase_product_flows del cultivar. |
| 8 | **INV** | Empaque: 4.2kg → ~150 frascos JAR-GELATO-28G. Cada frasco tiene su inventory_item con batch_number para trazabilidad completa hasta el origen. |
| 9 | **OPS** | overhead_costs: energía de la sala de secado (15 días × tarifa), renta proporcional del espacio. allocation_basis='per_m2' proratea al batch según area_m2 usada. |
| 10 | **ORDER** | Cada production_order_phase registra input/output/yield real. La orden pasa a status='completed'. El batch status='completed'. |

### Flujo 6: Monitoreo Ambiental y Alertas

*Los sensores IoT generan lecturas continuas que se comparan contra condiciones óptimas del cultivar, disparando alertas cuando hay desviaciones.*

| # | Dominio | Acción |
|---|---|---|
| 1 | **OPS** | sensors registra un sensor tipo 'temperature' en Sala Floración A, brand_model='Trolmaster HCS-1'. Cada 5 minutos el sensor envía datos al sistema. |
| 2 | **OPS** | environmental_readings recibe: sensor_id, zone_id=Sala Floración A, parameter='temperature', value=28.5, unit='°C', timestamp=ahora. zone_id denormalizado permite queries rápidas sin JOIN a sensors. |
| 3 | **PROD** | El cultivar Gelato #41 tiene optimal_conditions.temp='20-26°C'. La lectura de 28.5°C está fuera del rango óptimo. |
| 4 | **OPS** | Se genera alert: type='env_out_of_range', severity='warning', entity_type='sensor', entity_id=el sensor, message='Temperatura 28.5°C excede rango óptimo (20-26°C) en Sala Floración A'. |
| 5 | **OPS** | El supervisor recibe la alerta, investiga, ajusta el HVAC. Registra acknowledged_by=supervisor, acknowledged_at=ahora. |
| 6 | **OPS** | Cuando la temperatura vuelve al rango, resolved_at se llena. El historial completo de alertas permite análisis de incidentes por zona, periodo y severidad. |

### Flujo 7: Recepción con Trazabilidad de Transporte

*Material vegetal regulado (semillas, esquejes) llega con documentación de transporte obligatoria. El sistema registra el viaje completo, inspecciona el material, captura documentos, y al confirmar genera los lotes de inventario.*

| # | Dominio | Acción |
|---|---|---|
| 1 | **REG** | El supervisor crea un shipment: supplier='Banco Genético XYZ', origin='Rionegro', carrier='Transportes Fríos SAS', vehicle='Placa ABC-123', type='inbound', status='received'. |
| 2 | **REG** | Se agregan shipment_items: 100 semillas SEM-GELATO-FEM, supplier_lot='BG-2026-089', cost_per_unit=$2.50, destination_zone='Almacén Semillas'. |
| 3 | **REG** | El sistema consulta shipment_doc_requirements para los productos del envío. Para la categoría 'material_vegetal': Guía ICA (mandatory), Certificado de origen genético (mandatory), Factura (mandatory). |
| 4 | **REG** | El supervisor sube/llena cada documento requerido. INSERT regulatory_documents con field_data según el schema del doc_type, file adjunto en Supabase Storage, shipment_id=este envío. |
| 5 | **REG** | Inspección: por cada línea, registrar received_quantity=98, rejected_quantity=2, inspection_result='accepted_with_observations', inspection_data={seed_coat_intact:true, viable:98, damaged:2}. |
| 6 | **INV** | Al confirmar: INSERT inventory_item (lote de 98 semillas) + INSERT inventory_transaction type='receipt'. UPDATE shipment_items.inventory_item_id y transaction_id. UPDATE inventory_items.shipment_item_id. |
| 7 | **INV** | Las 2 semillas rechazadas: INSERT inventory_transaction type='waste' o type='return'. |
| 8 | **REG** | Shipment status → 'accepted' (o 'partial_accepted'). Si hay documentos mandatorios faltantes → INSERT alert type='regulatory_missing'. |

### Flujo 8: Trazabilidad Completa Hacia Atrás

*Un auditor quiere verificar la cadena completa de un frasco de producto final. El sistema permite navegar desde el frasco hasta el origen del material vegetal. Se muestran dos rutas: origen por semilla externa y origen por clon de planta madre.*

**Ruta A — Origen por semilla externa:**

```
JAR-GELATO-28G (inventory_item — producto final empacado)
│
├── inventory_transaction type='transformation_in'
│   └── batch GELATO-2026-001
│       ├── Actividades: activities → activity_resources → inventory_transactions
│       ├── Calidad: quality_tests → quality_test_results
│       ├── Ambiente: environmental_readings
│       ├── Costos: overhead_costs + activity costs → COGS
│       └── Documentos regulatorios del batch:
│           ├── CoA (Certificado de Análisis) ✅ → quality_test vinculado
│           ├── Certificado de calidad post-cosecha ✅
│           └── Análisis de pesticidas ⚠️ vence en 15 días
│
├── Origen: inventory_item SEM-GELATO-FEM (semilla)
│   ├── Ingreso: activity ENTRY-MATERIAL → consumption → batch
│   └── shipment_item (expected: 100, received: 98, rejected: 2)
│       │   inspection_result: 'accepted_with_observations'
│       └── shipment SHP-2026-0015
│           ├── supplier: "Banco Genético XYZ"
│           ├── carrier: "Transportes Fríos SAS", vehículo: "ABC-123"
│           ├── transport_conditions: { temp: 4-8°C, cold_chain: true, 3h }
│           └── Documentos de transporte:
│               ├── Guía ICA #ANT-2026-00892 ✅
│               ├── Certificado de origen genético ✅
│               └── Factura proveedor #FV-2026-1234 ✅
│
├── Documentos del producto (per_product):
│   └── Ficha técnica del cultivar Gelato #41 ✅
│
└── Documentos de la facility (per_facility):
    ├── Licencia de cultivo ICA ✅ (vence dic 2026)
    ├── Registro sanitario INVIMA ✅
    └── Certificado orgánico ⚠️ (renovación en 45 días)
```

**Ruta B — Origen por clon de planta madre:**

```
JAR-GELATO-28G (inventory_item — producto final empacado)
│
├── inventory_transaction type='transformation_in'
│   └── batch GELATO-2026-042
│       ├── (misma estructura de actividades, calidad, costos, docs del batch)
│       └── ...
│
├── Origen: inventory_item CLONE-GELATO (clon producido internamente)
│   ├── Ingreso: activity ENTRY-MATERIAL → consumption → batch
│   └── inventory_transaction type='transformation_in' (producción del clon)
│       ├── activity: CLONE-CUT #47 (sesión de corte del 15-mar-2026)
│       └── batch: LOT-MADRE-GELATO-001 (planta madre)
│           ├── cultivar: Gelato #41, fase: madre, status: active
│           ├── Establecida: 01-ene-2026, 47 sesiones, 2,350 clones producidos
│           └── Origen de la madre: inventory_item SEM-GELATO-FEM
│               └── shipment SHP-2025-0089
│                   ├── supplier: "Banco Genético XYZ"
│                   └── Documentos: Guía ICA ✅, Cert. origen ✅
│
└── Documentos de facility: (mismos que Ruta A)
```

### Flujo 9: MIPE — Monitoreo Fitosanitario, Aplicación y Seguimiento

*Ciclo completo de Manejo Integrado de Plagas y Enfermedades: monitoreo programado → detección → programación de aplicación → ejecución con trazabilidad de producto → seguimiento de efectividad. Demuestra el uso de phytosanitary_agents, measurement_data, y la integración con inventario para productos de protección.*

**Parte 1 — Monitoreo fitosanitario:**

| # | Dominio | Acción |
|---|---|---|
| 1 | **ACT** | scheduled_activity aparece en el dashboard: template=MONITOR-FITOSAN, batch=LOT-GELATO, phase=floración, crop_day=45. El template.metadata define: {sampling_method: "zigzag", sample_size_formula: "sqrt(total_plants) × 1.5"}. |
| 2 | **ACT** | El agrónomo inicia la ejecución. Se crea activity con measurement_data: {sample_size: 15, total_plants: 90, sampling_method: "zigzag", phenological_stage: "floración semana 4"}. |
| 3 | **ACT** | Hallazgo 1: activity_observation — type='pest', agent_id=→ACARO_BLANCO, plant_part='leaf', incidence_value=12, incidence_unit='count', severity_pct=15.0, severity='medium', sample_size=15, description='Colonias en envés de hojas jóvenes del tercio superior, mayor concentración cerca del sistema de ventilación'. |
| 4 | **ACT** | Hallazgo 2: activity_observation — type='disease', agent_id=→BOTRYTIS_SP, plant_part='flower', incidence_value=8.5, incidence_unit='percentage', severity_pct=5.0, severity='low', sample_size=15, description='Manchas grises incipientes en cogollos densos, zona de baja circulación de aire'. |
| 5 | **OPS** | Fotos de cada hallazgo: attachments con entity_type='observation', entity_id=la observación, file_type='image/jpeg'. Cada foto preserva metadata EXIF (GPS, timestamp). |
| 6 | **OPS** | El severity='medium' del ácaro blanco genera alert: type='pest_detected', severity='warning', entity_type='activity_observation', entity_id=la observación, batch_id=LOT-GELATO, message='Ácaro blanco detectado en LOT-GELATO, incidencia 12 individuos, severidad 15%'. |

**Parte 2 — Programación y ejecución de aplicación:**

| # | Dominio | Acción |
|---|---|---|
| 7 | **ACT** | El agrónomo programa la aplicación: scheduled_activity con template=APLIC-MIPE-FOLIAR, batch=LOT-GELATO, planned_date=mañana. El template define: activity_template_resources con product=Acaricida X (product_id), quantity=2, quantity_basis='per_L_solution'. activity_template_checklist incluye: 'Verificar pH solución (5.5-6.5)', 'Verificar EC solución', 'Usar EPP completo', 'Cubrir sistema de riego'. |
| 8 | **ACT** | El operario ejecuta. Se crea activity con measurement_data: {water_ph: 6.5, water_ec_ms: 0.3, solution_ph: 5.8, solution_ec_ms: 2.1, total_water_volume_l: 200, total_product_dose_ml: 400, application_type: "foliar", equipment: "Bomba espalda 20L"}. |
| 9 | **ACT** | activity_resources: product=Acaricida X, inventory_item=lote específico (con supplier_lot_number para trazabilidad al proveedor), quantity_planned=400mL, quantity_actual=400mL. El sistema trae automáticamente desde products: phi_days=21 (periodo de carencia), rei_hours=4 (periodo de reentrada). Desde inventory_items: batch_number, cost_per_unit. |
| 10 | **INV** | inventory_transaction: type='application', quantity=400mL, batch_id=LOT-GELATO, phase_id=floración, activity_id=↑. El inventory_item del acaricida se reduce: quantity_available -= 400mL. |
| 11 | **OPS** | Verificación PHI: cosecha estimada en crop_day=75, hoy es crop_day=45, faltan 30 días. phi_days=21. Margen=9 días → OK. Si phi_days > días restantes → alert type='phi_violation', severity='critical', message='Aplicación de Acaricida X viola periodo de carencia. PHI=21 días, cosecha estimada en 15 días'. |
| 12 | **OPS** | Verificación REI: alert informativa con rei_hours=4. message='Periodo de reentrada: 4 horas. No ingresar a Sala Floración A hasta las 14:00'. |

**Parte 3 — Seguimiento:**

| # | Dominio | Acción |
|---|---|---|
| 13 | **ACT** | Se programa monitoreo de seguimiento: template=MONITOR-FITOSAN-SEGUIMIENTO, planned_date=hoy+7, crop_day=52, batch=LOT-GELATO. |
| 14 | **ACT** | El agrónomo ejecuta el seguimiento. Busca ácaro blanco → activity_observation: agent_id=→ACARO_BLANCO, incidence_value=2, severity_pct=3.0, severity='low'. La incidencia bajó de 12→2 individuos, severidad de 15%→3%. |
| 15 | **OPS** | Alert original (pest_detected) se marca como resolved_at=ahora. El historial completo queda: detección → aplicación (con producto, lote, dosis) → seguimiento → resolución. |

### Flujo 10: MIRFE — Monitoreo Nutricional y Preparación de Soluciones

*Manejo Integrado de la Relación Fertilización-Extracción: monitoreo de lisímetro/pasta saturada para evaluar disponibilidad nutricional, y preparación de soluciones stock con trazabilidad completa de insumos.*

**Parte 1 — Monitoreo de lisímetro de succión:**

| # | Dominio | Acción |
|---|---|---|
| 1 | **ACT** | scheduled_activity: template=MONITOR-LISIMETRO, batch=LOT-GELATO, phase=floración. El template.metadata define: {ec_target: "2.0-3.5 mS/cm", ph_target: "5.5-6.5", extraction_wait_hours: 6}. |
| 2 | **ACT** | Instalación: el agrónomo ejecuta la actividad. measurement_data registra la primera parte: {lysimeter_code: "LIS-A3-01", plant_id: "P-A3-L2-012", plant_height_cm: 85, phenological_stage: "floración sem 4", install_datetime: "2026-03-15T08:00:00"}. |
| 3 | **ACT** | Retiro (6 horas después): se completa measurement_data: {removal_datetime: "2026-03-15T14:00:00", extracted_volume_ml: 35, ec_ms: 4.8, ph: 5.2}. La UI compara contra template.metadata targets y resalta desviaciones. |
| 4 | **ACT** | EC=4.8 excede rango (2.0-3.5) → activity_observation: type='measurement', severity='warning', description='EC solución suelo 4.8 mS/cm excede rango óptimo (2.0-3.5). Posible acumulación de sales. Recomendar lavado o reducir concentración de fertirrigación'. |
| 5 | **OPS** | Se genera alert: type='env_out_of_range', severity='warning', entity_type='batch', entity_id=LOT-GELATO, message='EC suelo 4.8 mS/cm en LOT-GELATO excede rango. Acción requerida en próxima fertirrigación'. |

**Parte 2 — Monitoreo de pasta saturada:**

| # | Dominio | Acción |
|---|---|---|
| 6 | **ACT** | template=MONITOR-PASTA-SATURADA, batch=LOT-GELATO. measurement_data: {sample_number: 3, water_volume_ml: 200, soil_volume_ml: 100, solution_volume_ml: 150, ec_ms: 3.1, ph: 6.0, sample_datetime: "2026-03-16T09:30:00"}. |
| 7 | **ACT** | Los valores están dentro de rango → no se genera observación de alerta. Los datos quedan registrados para análisis de tendencia: measurement_data es queryable via JSONB operators para graficar EC a lo largo del ciclo. |

**Parte 3 — Preparación de soluciones stock:**

| # | Dominio | Acción |
|---|---|---|
| 8 | **INV** | recipe: name='Solución Stock A - Vegetativo', output_product=SOL-STOCK-A, base_quantity=10L, items=[{product: Ca(NO₃)₂, quantity: 800g}, {product: KNO₃, quantity: 500g}, {product: MgSO₄, quantity: 300g}]. Cada product tiene en su registro: composición, registro ICA, proveedor preferido. |
| 9 | **INV** | recipe_execution: recipe=Stock A, scale_factor=5.0 (preparar 50L), executed_by=operario. output_quantity_expected=50L, output_quantity_actual=49.5L, yield_pct=99%. |
| 10 | **ACT** | Actividad asociada: template=PREP-SOL-STOCK. measurement_data: {part_label: "A", water_ph: 7.1, water_ec_ms: 0.2, solution_ph: 4.2, solution_ec_ms: 85.0, water_volume_l: 50}. |
| 11 | **INV** | Consumo de insumos: inventory_transaction type='consumption' para Ca(NO₃)₂ (4000g), KNO₃ (2500g), MgSO₄ (1500g) — cada uno con trazabilidad al lote específico (inventory_item_id) y al proveedor. |
| 12 | **INV** | Producción: inventory_transaction type='transformation_in' → nuevo inventory_item SOL-STOCK-A, 49.5L, source_type='production'. Este stock se usa luego como recurso en las actividades de fertirrigación (Flujo 2), cerrando el ciclo. |

---