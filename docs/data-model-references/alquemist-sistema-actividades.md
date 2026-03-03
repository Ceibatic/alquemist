# ALQUEMIST

## Sistema de Actividades

*Cómo funciona el ciclo completo: template → programación → ejecución*

Febrero 2026

---

## Tabla de Contenidos

1. Visión General
2. Templates de Actividad — La Receta
3. Programación — El Plan del Cultivo
4. Ejecución — Lo que Realmente Pasó
5. El Ciclo Completo: Un Ejemplo de Punta a Punta
6. Actividades Especiales
7. Resumen Visual

---

## 1. Visión General

El sistema de actividades de Alquemist funciona con una lógica de tres niveles que separa la definición de lo que se debe hacer, la planificación de cuándo se debe hacer, y el registro de lo que realmente se hizo. Esta separación es fundamental porque permite que un agrónomo defina una vez cómo se hace una fertirrigación, que el sistema la programe automáticamente cientos de veces a lo largo de distintos ciclos de cultivo, y que cada ejecución en campo capture exactamente lo que pasó — aunque haya diferencias con lo planeado.

Los tres niveles son:

**Templates** (la receta): Definen *qué* se hace, *con qué* recursos, *qué* se verifica, y *qué* efectos tiene. Son reutilizables y se configuran una vez. Un template es como una receta de cocina: lista de ingredientes, pasos, y el resultado esperado.

**Actividades Programadas** (el plan): Son instancias concretas del template asignadas a un lote específico en una fecha específica. Cuando se aprueba una orden de producción y se crea un lote, el sistema toma el plan maestro de cultivo y genera automáticamente todas las actividades programadas para ese lote. Cada una dice: "el día 35 del ciclo, al lote LOT-GELATO-001, hay que hacerle la fertirrigación vegetativa semana 5".

**Actividades Ejecutadas** (la realidad): Son el registro de lo que realmente ocurrió en campo. El operario abre su app, ve la actividad programada para hoy, la ejecuta, registra qué recursos usó realmente, completa las verificaciones del checklist, toma fotos si es necesario, y al finalizar el sistema genera automáticamente los movimientos de inventario correspondientes.

La razón de esta separación es la trazabilidad. Un auditor puede preguntarle al sistema: "¿qué fertirrigación le hicieron a este lote el día 35?", y el sistema responde con exactitud: qué productos se usaron, de qué lote de inventario venían, quién lo hizo, a qué hora, cuánto duró, qué valores de pH y EC se midieron, y si hubo alguna desviación del plan. Todo esto sin que el operario tenga que llenar formularios extensos — el sistema precarga los datos del template y el operario solo confirma o ajusta.

---

## 2. Templates de Actividad — La Receta

### Qué es un template

Un template de actividad es la definición reutilizable de una tarea agrícola. Piensa en él como la receta maestra que describe cómo se ejecuta una operación, qué recursos consume, qué verificaciones requiere, y qué efectos produce en el sistema. El template se configura una vez por un agrónomo o administrador, y luego se usa repetidamente cada vez que esa tarea se programa o ejecuta.

Cada template tiene un código único (por ejemplo FERT-VEG-S1 para "Fertirrigación Vegetativa Semana 1") y pertenece a un tipo de actividad. Los tipos son categorías amplias como Fertirrigación, Poda, Cosecha, Trasplante, Monitoreo Fitosanitario, Aplicación MIPE, etc. El tipo sirve para agrupar y filtrar en reportes — el template es donde vive el detalle operativo real.

### Información que guarda el template

**Identidad y clasificación:** El template tiene su código, nombre descriptivo, y tipo de actividad al que pertenece. También indica con qué frecuencia se ejecuta normalmente: diaria, semanal, quincenal, una sola vez, o bajo demanda. Y opcionalmente define en qué rango de días del ciclo del cultivo es aplicable — por ejemplo, la fertirrigación vegetativa semana 1-2 aplica entre el día 1 y el día 14 de la fase vegetativa.

**Fases aplicables:** Un template no aplica a todo el ciclo — cada uno está vinculado a una o más fases de producción. La fertirrigación vegetativa aplica solo en la fase de vegetativo. La cosecha aplica solo en la fase de cosecha. Un monitoreo fitosanitario puede aplicar en vegetativo Y floración. Este vínculo se establece mediante una tabla de relación donde se asocian los templates con las fases, y es lo que permite al sistema saber qué templates programar en cada fase del plan de cultivo.

**Duración estimada:** Cuánto tiempo debería tomar la ejecución en minutos. Esto sirve para planificación de labor y para detectar anomalías (si una actividad de 30 minutos estimados tomó 3 horas, algo pasó).

**Dependencias entre templates:** Un template puede depender de otro. Por ejemplo, el template de secado depende del template de cosecha — no puedes secar si no cosechaste primero. Esto es informativo y ayuda al sistema a ordenar la programación.

**Efectos en el sistema:** Aquí es donde el template cobra poder real. Un template puede declarar dos efectos importantes.

Primero, puede declarar que al completarse dispara un cambio de fase. Por ejemplo, el template de cosecha declara que al completarse, el lote debe avanzar de "floración" a "secado". Cuando el operario marca la actividad como completada, el sistema automáticamente actualiza la fase del lote, cambia la zona si es necesario, y genera los registros correspondientes.

Segundo, puede declarar que genera una transformación de inventario. La cosecha transforma plantas en flor húmeda: destruye el producto de entrada y crea los productos de salida. El secado transforma flor húmeda en flor seca. Cuando el template tiene este flag activado, al completar la actividad el sistema consulta los flujos de transformación del cultivar para saber qué productos entran y qué productos salen, y genera las transacciones de inventario correspondientes.

**Parámetros de referencia (metadata):** Un bloque de datos flexible donde el agrónomo define los valores objetivo y rangos aceptables para la actividad. Por ejemplo, una fertirrigación puede tener: EC objetivo entre 1.5 y 2.0 mS/cm, pH objetivo entre 5.8 y 6.2, porcentaje de drenaje entre 15% y 20%. Estos valores se usan en dos momentos: durante la ejecución, la app los muestra al operario como referencia; después de la ejecución, el sistema compara los valores reales capturados contra estos rangos y genera alertas si hay desviaciones.

### Los recursos del template

Cada template define una lista de recursos que se necesitan para ejecutar la actividad. Estos son los "ingredientes" de la receta. Cada recurso referencia un producto del catálogo de inventario (fertilizante, pesticida, agua, herramientas, EPP) y define una cantidad con un modo de escalado.

El modo de escalado es lo que hace que el sistema sea inteligente. En vez de definir cantidades absolutas, el template dice *cómo* calcular la cantidad según el contexto de ejecución. Hay cinco modos:

**Fijo:** La cantidad no cambia sin importar el tamaño del lote. Ejemplo: 1 par de guantes por actividad.

**Por planta:** La cantidad se multiplica por el número de plantas del lote. Si el template dice "5 litros por planta" y el lote tiene 42 plantas, el sistema calcula 210 litros. Si otro lote tiene 20 plantas, calcula 100 litros.

**Por metro cuadrado:** La cantidad se multiplica por el área del lote. Útil para aplicaciones de suelo o sustratos.

**Por zona:** Una cantidad fija por zona, independiente del tamaño. Útil para operaciones de desinfección de salas completas.

**Por litro de solución:** La cantidad se calcula según el volumen total de solución. Si el template dice "0.8 gramos de Calcio por litro" y se preparan 210 litros, el sistema calcula 168 gramos. Este modo es especialmente útil para fertirrigación donde las dosis se expresan en concentración.

Cada recurso también indica si es obligatorio u opcional. El operario debe registrar el consumo de todos los recursos obligatorios para poder completar la actividad.

### El checklist del template

El checklist es la lista de verificaciones que el operario debe realizar durante la ejecución. Cada ítem tiene una instrucción clara ("Verificar EC del drenaje"), opcionalmente un valor esperado ("5.8-6.2") con tolerancia ("±0.2"), y dos flags importantes:

**Crítico:** Si un ítem del checklist es marcado como crítico, la actividad no puede marcarse como completada hasta que ese ítem sea verificado. Esto impide que un operario cierre una fertirrigación sin haber medido el pH, por ejemplo.

**Requiere foto:** Si está activado, el operario debe adjuntar una foto como evidencia de esa verificación. Útil para inspecciones visuales, conteo de plagas, o documentación regulatoria.

### Qué pasa cuando cambia un template

Aquí hay un detalle de diseño importante: los templates son documentos vivos que el agrónomo puede actualizar en cualquier momento. Puede cambiar dosis, agregar pasos al checklist, o ajustar parámetros. Pero estos cambios **solo afectan las actividades futuras**. Las actividades que ya fueron programadas o ejecutadas conservan una copia (snapshot) del template tal como era en el momento de la programación. Esto garantiza que el registro histórico es inmutable: si el auditor pregunta "¿con qué dosis se fertirrigó este lote el día 35?", la respuesta viene del snapshot, no del template actual.

---

## 3. Programación — El Plan del Cultivo

### El plan maestro (cultivation schedule)

Antes de hablar de las actividades programadas, hay que entender de dónde salen. El plan maestro de cultivo es la receta del ciclo completo para un cultivar específico. Define cuántos días dura cada fase y qué templates se aplican en cada una.

Por ejemplo, el plan "Gelato Indoor 127 días" podría definir:

- Germinación (7 días): template ENTRY-MATERIAL día 1, template GERM-CHECK días 3 y 5.
- Propagación (14 días): template FERT-PROP-LIGHT diaria, template PROP-ROOT-CHECK día 10.
- Vegetativo (28 días): template FERT-VEG-S1 diaria semanas 1-2, template FERT-VEG-S2 diaria semanas 3-4, template MONITOR-FITOSAN semanal, template DEFOL-VEG una vez día 21.
- Floración (63 días): template FERT-FLO-S1 a FERT-FLO-S9 (cambian cada semana), template MONITOR-FITOSAN semanal, template FLUSH última semana.
- Y así sucesivamente para cosecha, secado y empaque.

Este plan se configura una vez para el cultivar y se reutiliza cada vez que se crea un nuevo lote de ese cultivar.

### Cómo se generan las actividades programadas

Cuando un gerente aprueba una orden de producción y el sistema crea un lote, ocurre la programación automática. El sistema toma el plan maestro del cultivar, calcula las fechas reales a partir de la fecha de inicio del lote, y genera un registro de actividad programada para cada ocurrencia de cada template.

Cada actividad programada guarda:

**A qué lote pertenece:** Siempre está vinculada a un lote específico. No existen actividades programadas "sueltas".

**Qué template la origina:** Referencia al template que define qué se debe hacer.

**La fecha planificada:** El día calendario en que debería ejecutarse, calculada a partir de la fecha de inicio del lote y el día del ciclo.

**El día del ciclo:** En qué día del ciclo productivo cae esta actividad. Esto es útil para comparar entre lotes: "¿cómo estaba el lote A vs el lote B en su día 35?".

**La fase de producción:** En qué fase del ciclo está el lote cuando debe ejecutarse esta actividad.

**El snapshot del template:** Una copia completa del estado del template en el momento de programar. Incluye los recursos con sus cantidades y modos de escalado, el checklist completo con sus ítems críticos, y los parámetros de referencia (metadata). Esta copia es la que se usa durante la ejecución — si alguien modifica el template después, las actividades ya programadas no se ven afectadas.

**El estado:** Puede ser pendiente (aún no se ha ejecutado), completada (se ejecutó), omitida (se decidió no hacerla), o vencida (pasó la fecha y no se hizo).

### Qué se ve en el dashboard

El operario de campo abre la app y ve sus actividades del día: una lista de actividades programadas cuya fecha planificada es hoy (o que están vencidas de días anteriores), filtradas por el lote o la zona que tiene asignada. Cada una muestra el nombre del template, el lote, la zona, la fase, y un indicador de urgencia si está vencida.

El sistema también puede generar alertas automáticas cuando una actividad programada pasa su fecha sin ejecutarse. Estas alertas llegan al supervisor para que tome acción — puede ser que el operario se olvidó, o que hay una razón válida para omitirla.

---

## 4. Ejecución — Lo que Realmente Pasó

### Qué es una actividad ejecutada

La actividad ejecutada es el registro inmutable de lo que realmente ocurrió en campo. Es la evidencia. Puede originarse de una actividad programada (el caso más común) o puede ser ad-hoc — una actividad que el operario o supervisor decide hacer sin que estuviera en el plan, como una poda correctiva de emergencia o una observación no programada.

### Información que captura la actividad

**Quién, cuándo, dónde:** Cada actividad registra qué usuario la ejecutó, a qué hora exacta empezó, cuánto duró en minutos, en qué zona se realizó, para qué lote, y en qué fase del ciclo estaba el lote.

**Vínculo con la programación:** Si la actividad viene de una actividad programada, mantiene la referencia. Al completarla, la actividad programada correspondiente se marca como completada y guarda un link a esta actividad ejecutada. Esto cierra el círculo: planificado → ejecutado.

**Mediciones de campo (measurement_data):** Un bloque de datos flexible donde el operario registra las mediciones tomadas durante la ejecución. El contenido varía según el tipo de actividad:

Para una aplicación de producto (MIPE o fertirrigación): pH del agua antes de mezclar, electroconductividad del agua, pH de la solución preparada, electroconductividad de la solución, volumen total de agua, dosis total de producto, tipo de aplicación (foliar, drench, edáfica), equipo utilizado.

Para un monitoreo de lisímetro: código del lisímetro, identificación de la planta, altura de la planta, estado fenológico, fecha/hora de instalación y retiro, volumen de solución extraída, EC y pH de la solución del suelo.

Para una pasta saturada: número de muestra, volumen de agua, volumen de suelo, volumen de solución, EC y pH.

Estos datos se almacenan en un formato flexible (JSONB) que permite que cada tipo de actividad capture exactamente lo que necesita sin requerir columnas predefinidas para cada caso. El template define en sus parámetros de referencia (metadata) los rangos esperados, y la app compara automáticamente los valores capturados contra esos rangos, resaltando visualmente las desviaciones.

**Estado:** La actividad puede estar en progreso (el operario la inició pero no la terminó), completada, o cancelada.

**Notas:** Texto libre para cualquier observación relevante que no encaje en los campos estructurados.

### Los recursos consumidos

Cada recurso que el operario usa durante la actividad genera un registro propio. Este registro es el corazón de la trazabilidad de insumos porque conecta tres mundos: la planificación (qué decía el template que se debía usar), la ejecución (qué se usó realmente), y el inventario (de qué lote específico se tomó y cuánto costó).

**La cantidad planeada** viene del template escalado. Si el template dice "0.8g/L de Calcio" y se usan 210 litros, la cantidad planeada es 168g. Esta información se precarga automáticamente para que el operario solo tenga que confirmar o ajustar.

**La cantidad real** es lo que el operario registra. Puede ser igual a la planeada, o puede diferir. El operario midió 170g en vez de 168g. Esta diferencia queda registrada y es analizable: el sistema puede reportar "el consumo real de Calcio excede el planeado en un 1.2% en promedio para este template".

**El lote específico de inventario** de donde se tomó el recurso. Esto permite trazabilidad completa: si hay un problema con un lote de fertilizante, el sistema puede identificar todos los lotes de cultivo que lo recibieron. También permite calcular el costo real de la actividad basándose en el precio del lote específico utilizado.

**La transacción de inventario generada.** Al registrar un recurso consumido, el sistema genera automáticamente un movimiento en el log inmutable de inventario. Este movimiento descuenta la cantidad del stock disponible, registra el contexto completo (qué lote, qué fase, qué actividad, qué zona, qué usuario), y calcula el costo. El inventario se actualiza en tiempo real sin que el operario tenga que hacer nada adicional.

### Las observaciones de campo

Durante cualquier actividad, el operario puede registrar observaciones. Hay dos tipos de uso:

**Observaciones generales:** Notas sobre el estado del cultivo, mediciones ambientales, deficiencias nutricionales visibles, o cualquier situación relevante. Tienen un tipo (plaga, enfermedad, deficiencia, ambiental, general, medición) y un nivel de severidad (informativo, bajo, medio, alto, crítico).

**Monitoreo fitosanitario estructurado:** Cuando el operario detecta una plaga o enfermedad durante un monitoreo MIPE, la observación captura datos estructurados seleccionando del catálogo de agentes fitosanitarios. El operario selecciona el agente identificado (por ejemplo "Ácaro blanco" o "Botrytis sp." del catálogo), en qué parte de la planta lo encontró (raíz, tallo, hoja, flor, fruto), cuántos individuos encontró o qué porcentaje de plantas están afectadas (incidencia), qué porcentaje de área del órgano o planta está dañada (severidad como porcentaje preciso), y cuántas plantas evaluó en total (tamaño de la muestra).

Cada observación puede tener fotos adjuntas como evidencia, y si la severidad es media o superior, el sistema genera automáticamente una alerta para que el supervisor tome acción.

### Qué pasa al completar una actividad

Cuando el operario marca la actividad como completada, ocurren varias cosas dependiendo de lo que el template declare:

**Siempre:** La actividad programada correspondiente (si existe) se marca como completada. Las transacciones de inventario de los recursos consumidos ya se generaron al registrar cada recurso. Los costos se acumulan al lote.

**Si el template dispara un cambio de fase:** El lote avanza a la siguiente fase. Esto puede implicar cambio de zona (de "Sala Floración" a "Sala Secado"), actualización del producto actual del lote (de "plantas en floración" a "flor húmeda"), y reprogramación de actividades si la nueva fase tiene sus propios templates.

**Si el template genera una transformación:** El sistema consulta los flujos de transformación del cultivar para saber qué productos se destruyen y qué productos se crean. Se generan las transacciones correspondientes: una transacción de salida que destruye el producto anterior, y una o más transacciones de entrada que crean los nuevos productos con los rendimientos definidos. En el caso de una cosecha, por ejemplo: se destruyen 42 plantas en floración, se crean 21kg de flor húmeda (producto primario), 8.4kg de trim húmedo (producto secundario), y se registran 50kg de desperdicio (tallos y raíces).

---

## 5. El Ciclo Completo: Un Ejemplo de Punta a Punta

Para hacer todo esto concreto, sigamos una fertirrigación desde su definición hasta su registro final.

### Paso 1: El agrónomo crea el template

El agrónomo define el template FERT-VEG-S3 ("Fertirrigación Vegetativa Semana 3-4"). Establece que aplica a la fase vegetativa, se ejecuta diariamente, y dura aproximadamente 30 minutos.

Define tres recursos: agua (5 litros por planta), Calcio nitrato (0.8 gramos por litro de solución), y Potasio nitrato (0.6 gramos por litro de solución). Los dos fertilizantes son obligatorios; el agua también.

Define el checklist: verificar EC del drenaje (esperado: 1.8-2.2, tolerancia ±0.3, crítico), verificar pH del drenaje (esperado: 5.8-6.2, tolerancia ±0.2, crítico), verificar porcentaje de drenaje (esperado: 15-20%, informativo).

Define los parámetros de referencia: EC objetivo entre 1.5 y 2.0 mS/cm, pH objetivo entre 5.8 y 6.2.

### Paso 2: El sistema programa la actividad

Al aprobar una orden de producción para 42 plantas de Gelato, el sistema crea el lote LOT-GELATO-001 y programa las actividades. Para FERT-VEG-S3, como es diaria y la fase vegetativa dura del día 22 al día 49, el sistema genera 28 actividades programadas: una para cada día, del día 22 al día 49 del ciclo.

Cada actividad programada guarda un snapshot del template tal como es en ese momento: los tres recursos con sus modos de escalado, los tres ítems del checklist, y los parámetros de referencia.

### Paso 3: El operario ve su actividad del día

Es el día 35 del ciclo. El operario abre la app y ve en su lista: "Fertirrigación Vegetativa Sem 3-4 — LOT-GELATO-001 — Sala Vegetativo A — Día 35". Toca la actividad.

### Paso 4: El operario ejecuta

La app muestra los recursos precalculados: agua 210L (42 plantas × 5L), Calcio nitrato 168g (210L × 0.8g/L), Potasio nitrato 126g (210L × 0.6g/L). El operario prepara la solución, la aplica, y registra.

Para el Calcio nitrato, confirma 168g. El sistema le muestra los lotes disponibles en inventario; selecciona el lote CANO3-LOT-2026-03, que tiene 5kg disponibles a $45/kg.

Registra las mediciones de la preparación en measurement_data: pH del agua 7.0, EC del agua 0.3, pH de la solución 5.9, EC de la solución 1.8.

Completa el checklist: EC del drenaje = 1.9 (dentro de rango, marcado como ✓), pH del drenaje = 6.0 (dentro de rango, marcado como ✓), drenaje = 17% (dentro de rango, informativo).

### Paso 5: El sistema registra todo

Al completar, el sistema genera automáticamente tres transacciones de inventario: una para el agua, una para el Calcio nitrato (-168g del lote CANO3-LOT-2026-03, costo = $7.56), y una para el Potasio nitrato. Cada transacción lleva contexto completo: fue en la zona "Sala Veg A", para el lote LOT-GELATO-001, en la fase "vegetativo", por esta actividad específica, ejecutada por este operario.

El inventario se actualiza: el lote de Calcio nitrato pasa de 5,000g disponibles a 4,832g.

La actividad programada se marca como completada y apunta a la actividad ejecutada.

El costo de $7.56 (más los costos de los otros recursos) se acumula al costo total del lote LOT-GELATO-001.

### El resultado

Si en 6 meses un auditor pregunta "¿qué fertilización recibió el lote LOT-GELATO-001 el día 35?", el sistema responde: "Fertirrigación Vegetativa Sem 3-4, ejecutada por Juan Pérez el 15 de marzo de 2026 a las 7:30 AM, duración 28 minutos. Se usaron 168g de Calcio nitrato del lote CANO3-LOT-2026-03 (proveedor: AgroInsumos SAS, recibido el 1 de marzo via envío SHP-2026-0023), 126g de Potasio nitrato del lote KNO3-LOT-2026-02. EC de la solución: 1.8 mS/cm (dentro de rango), pH: 5.9 (dentro de rango), drenaje: 17% (dentro de rango). Costo total: $12.40."

---

## 6. Actividades Especiales

### Ingreso de material (ENTRY-MATERIAL)

La primera actividad de cualquier lote es siempre un ingreso de material. Este template especial formaliza la entrada del recurso al proceso productivo — transforma material que estaba como "stock en almacén" a "material en producción". Al ejecutarse, consume el inventario de semillas, esquejes o cualquier material de entrada, vinculándolo permanentemente al lote. Es la actividad que cierra la trazabilidad entre el inventario (de dónde vino el material, qué envío, qué proveedor) y la producción (qué lote lo está usando).

### Cosecha (HARV-MANUAL-CUT)

La actividad más compleja del sistema. Al completarse genera transformaciones de inventario (destruye plantas, crea múltiples productos de salida), avanza la fase del lote (de floración a secado), consume insumos (guantes, herramientas, bolsas), registra fotos como evidencia, actualiza las posiciones de plantas si existen, y puede disparar un test de calidad de laboratorio. Todo esto ocurre en una sola transacción atómica — si algo falla, nada se registra parcialmente.

### Corte de clones (CLONE-CUT)

Actividad recurrente en lotes de planta madre. Su particularidad es que genera una transformación donde el input NO se destruye: la madre produce clones sin consumirse. El template tiene el flag de transformación activado pero la fase madre está marcada como no-destructiva, así que el sistema genera las transacciones de entrada (nuevos esquejes en inventario) sin generar una transacción de salida. Los clones producidos se convierten en inventario disponible para nuevas órdenes de producción.

### Monitoreo fitosanitario (MONITOR-FITOSAN)

Actividad de inspección que no consume recursos de inventario pero genera datos críticos. El operario recorre el cultivo con un patrón de muestreo definido (zigzag, aleatorio), evalúa un subconjunto de plantas, y registra observaciones estructuradas. Si detecta plagas o enfermedades, selecciona el agente del catálogo, registra incidencia y severidad, y adjunta fotos. Las observaciones de severidad media o alta generan alertas automáticas y típicamente derivan en la programación de una actividad de aplicación.

### Aplicación MIPE (APLIC-MIPE-FOLIAR)

Actividad que aplica productos de protección vegetal (pesticidas, fungicidas, biocontroladores). Además de los recursos del template (el producto y su dosis), captura mediciones de preparación (pH y EC del agua y la solución, volumen, equipo). El sistema verifica automáticamente que el periodo de carencia del producto (PHI) no entre en conflicto con la fecha estimada de cosecha, y calcula el periodo de reentrada (REI) para generar una alerta informativa con la hora a partir de la cual se puede volver a entrar a la zona.

### Monitoreo de lisímetro (MONITOR-LISIMETRO)

Actividad de dos tiempos: instalación del lisímetro en el sustrato y retiro horas después para recolectar la solución del suelo. Las mediciones de EC y pH de esta solución indican la disponibilidad real de nutrientes en la zona radicular, lo cual es información crítica para ajustar la fertirrigación. El sistema compara estos valores contra los rangos óptimos del cultivar y genera alertas si hay desviaciones.

### Preparación de soluciones stock (PREP-SOL-STOCK)

Actividad vinculada a una receta (recipe) del inventario. El operario prepara una solución nutritiva concentrada según la fórmula definida, registra las mediciones de calidad (pH y EC), y el sistema genera las transacciones de consumo de cada insumo más la creación del producto resultante (la solución stock lista para usar). Esta solución stock luego aparece como recurso disponible en las actividades de fertirrigación.

### Actividades ad-hoc

No todas las actividades vienen del plan. Un supervisor puede crear una actividad sin template ni actividad programada — por ejemplo, una poda correctiva de emergencia, un lavado de raíces por exceso de sales, o una inspección no planificada por sospecha de contaminación. La actividad ad-hoc registra exactamente los mismos datos que una programada (quién, cuándo, dónde, recursos, observaciones), pero no tiene snapshot de template ni link a una actividad programada. Queda igualmente vinculada al lote y a la fase para efectos de trazabilidad y costeo.

---

## 7. Resumen Visual

```
CONFIGURACIÓN (una vez)                 PLANIFICACIÓN (por lote)                 EJECUCIÓN (por actividad)
═══════════════════════                 ════════════════════════                 ═════════════════════════

┌─────────────────────┐                                                        
│  ACTIVITY TYPES     │    Clasificación de primer nivel                       
│  (~15-30 registros) │    Fertirrigación, Poda, Cosecha...                   
└──────────┬──────────┘                                                        
           │                                                                   
           ▼                                                                   
┌─────────────────────┐                 ┌─────────────────────┐                ┌─────────────────────┐
│  ACTIVITY TEMPLATE  │  ──snapshot──▶  │  SCHEDULED ACTIVITY │  ──ejecutar──▶ │  ACTIVITY           │
│                     │                 │                     │                │                     │
│  • Código + nombre  │                 │  • Lote asignado    │                │  • Quién lo hizo    │
│  • Tipo + frecuencia│                 │  • Fecha planificada│                │  • Cuándo (exacto)  │
│  • Fases aplicables │                 │  • Día del ciclo    │                │  • Dónde (zona)     │
│  • Duración estimada│                 │  • Fase del ciclo   │                │  • Para qué lote    │
│  • Dispara cambio   │                 │  • Snapshot JSONB   │                │  • En qué fase      │
│    de fase?         │                 │  • Estado: pending/  │                │  • Duración real    │
│  • Genera transfor- │                 │    completed/skipped │                │  • Mediciones JSONB │
│    mación?          │                 │    /overdue          │                │  • Estado: in_prog/ │
│  • Metadata (target │                 │                     │                │    completed/cancel │
│    EC, pH, rangos)  │                 └──────────┬──────────┘                │  • Notas            │
│                     │                            │                           └──────┬──────────────┘
│  RESOURCES:         │                            │                                  │
│  • Producto X, 0.8  │                  Se genera desde                               │
│    g/L (per_L)      │                  CULTIVATION SCHEDULE                           ├── ACTIVITY RESOURCES
│  • Agua, 5 L/planta │                  (plan maestro que    ◄──── Al aprobar         │   • Producto X: plan=168g
│    (per_plant)      │                   combina cultivar +         orden de           │     real=170g, lote=LOT-03
│                     │                   templates por fase)        producción         │   • Agua: plan=210L
│  CHECKLIST:         │                                                                │     real=210L
│  • Verificar EC     │                                                                │   → Genera INVENTORY
│    (5.8-6.2, crít.) │                                                                │     TRANSACTIONS
│  • Verificar pH     │                                                                │     (inmutables)
│    (1.5-2.0, crít.) │                                                                │
│  • % drenaje        │                                                                ├── ACTIVITY OBSERVATIONS
│    (15-20%, info)   │                                                                │   • Ácaro blanco, hoja
│                     │                                                                │     incidencia: 12 indiv.
└─────────────────────┘                                                                │     severidad: 15%
                                                                                       │   → Si grave: genera ALERT
                                                                                       │
                                                                                       └── ATTACHMENTS
                                                                                           • Fotos de campo
                                                                                           • Evidencia visual
```

**El dato fluye en una sola dirección:** el template define la receta, la programación crea instancias concretas con fecha y lote, y la ejecución registra la realidad. Cambios en el template no afectan lo ya programado (gracias al snapshot). Lo ejecutado es inmutable. El inventario se actualiza automáticamente. Todo queda vinculado al lote para trazabilidad y costeo.
