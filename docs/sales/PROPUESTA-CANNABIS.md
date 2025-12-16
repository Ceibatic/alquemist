# Alquemist

**Sistema de Gestion de Produccion para Cannabis Regulado**

---

## Que es Alquemist?

Plataforma SaaS que digitaliza y automatiza toda tu operacion de cannabis en un solo lugar: desde la toma de clones hasta la cosecha, con trazabilidad completa para cumplimiento regulatorio.

---

## El Ciclo de Produccion en Alquemist

### Flujo Completo: De la Semilla a la Cosecha

```
 PLANTILLAS          ORDEN DE             EJECUCION           COSECHA
 PRODUCCION          PRODUCCION           LOTES               Y CIERRE
     |                   |                   |                   |
     v                   v                   v                   v
+-----------+      +-----------+      +-----------+      +-----------+
| Configura |  ->  | Crea      |  ->  | Ejecuta   |  ->  | Registra  |
| el "como" |      | el "que"  |      | el "dia   |      | resultados|
| producir  |      | producir  |      | a dia"    |      | finales   |
+-----------+      +-----------+      +-----------+      +-----------+
     |                   |                   |                   |
  - Fases            - Cultivar          - Movimientos      - Peso cosecha
  - Actividades      - Cantidad          - Actividades      - Calidad
  - Tiempos          - Fechas            - Perdidas         - Destino
  - Controles QC     - Area inicial      - QC checks        - Trazabilidad
```

---

## Funcionalidades Principales

### 1. Plantillas de Produccion

Define una vez, reutiliza siempre. Las plantillas establecen el "manual de operacion" para cada tipo de cultivo.

**Que configuras en una plantilla:**

| Elemento | Descripcion | Ejemplo Cannabis |
|----------|-------------|------------------|
| **Fases** | Etapas del ciclo | Propagacion (14d) -> Vegetativo (28d) -> Floracion (63d) -> Cosecha |
| **Actividades** | Tareas programadas | Riego, Fertilizacion, Poda, IPM, Monitoreo ambiental |
| **Controles de Calidad** | Inspecciones | Revision tricomas, Deteccion plagas, Medicion pH |
| **Consumo estimado** | Insumos por fase | 50ml Clonex, 2kg Fertilizante Veg, 1L Aceite Neem |

**Tipos de programacion de actividades:**

| Tipo | Descripcion | Uso |
|------|-------------|-----|
| **Dia especifico** | Dia 1 de la fase | Trasplante, Cambio fotoperiodo |
| **Recurrente diario** | Todos los dias | Riego, Revision ambiental |
| **Dias especificos** | Lun-Mie-Vie | Fertilizacion, Poda |
| **Cada N dias** | Cada 3 dias | IPM preventivo |
| **Dependiente** | 2 dias despues de otra | Revision post-poda |

---

### 2. Ordenes de Produccion

Una orden representa un ciclo de cultivo completo. Planifica, aprueba y ejecuta.

**Flujo de una orden:**

```
PLANNING          APROBADA           ACTIVA            COMPLETADA
    |                 |                 |                   |
    v                 v                 v                   v
Configuras:       Validas:          Ejecutas:          Registras:
- Plantilla       - Capacidad       - Actividades      - Rendimiento
- Cultivar        - Inventario      - Movimientos      - Costos reales
- Cantidad        - Personal        - QC checks        - Notas finales
- Fecha inicio                      - Perdidas
- Area inicial
```

**Que se genera automaticamente:**

Al crear una orden con 100 plantas de White Widow:

1. **Fases programadas** - Propagacion, Vegetativo, Floracion, Cosecha
2. **47+ actividades** - Cada tarea con fecha, responsable, instrucciones
3. **Lotes (batches)** - Agrupaciones de plantas para seguimiento
4. **Alertas** - Recordatorios de actividades proximas y vencidas

---

### 3. Gestion de Lotes (Batches)

El lote es la unidad de trazabilidad. Cada lote tiene su historia completa.

**Informacion de un lote:**

| Dato | Descripcion |
|------|-------------|
| **Codigo** | WW-250115-001 (Cultivar-Fecha-Secuencial) |
| **Cultivar** | White Widow |
| **Cantidad** | 50 plantas (inicial: 52, perdidas: 2) |
| **Fase actual** | Floracion - Semana 4 |
| **Ubicacion** | Sala Floracion A - Posicion 1-50 |
| **Dias de vida** | 87 dias |

**Operaciones sobre lotes:**

| Operacion | Descripcion | Registro |
|-----------|-------------|----------|
| **Mover** | Cambiar de area | De Vegetativo a Floracion |
| **Registrar perdida** | Plantas eliminadas | 2 plantas - Plaga detectada |
| **Dividir** | Separar en 2+ lotes | 50 -> 30 + 20 (diferentes salas) |
| **Combinar** | Unir lotes compatibles | Lote A + Lote B = Lote A ampliado |
| **Cosechar** | Finalizar ciclo | 22.5 kg - Calidad A |

**Trazabilidad completa:**

Cada operacion queda registrada con:
- Fecha y hora exacta
- Usuario que la realizo
- Cantidad antes y despues
- Notas y fotos adjuntas

---

### 4. Ejecucion de Actividades

Las actividades son las tareas del dia a dia. Nunca olvides una tarea critica.

**Vista del operador:**

```
ACTIVIDADES DE HOY - 15 Enero 2025
----------------------------------

08:00  [ ] Revision ambiental - Sala Propagacion A
       Temp: 24-26C | Humedad: 80-85% | CO2: 800-1000ppm

09:00  [ ] Riego + Fertilizacion - Lote WW-250101-001
       Formula: Veg-A 2ml/L + Veg-B 2ml/L | pH: 6.0

10:30  [ ] Toma de clones - Planta Madre PM-001
       Cantidad: 50 | Hormona: Clonex | Medio: Lana de roca

14:00  [ ] IPM Preventivo - Todas las salas
       Aceite Neem 5ml/L | Aplicacion foliar

VENCIDAS (1)
------------
[ ! ] Revision tricomas - Lote WW-241201-003
      Programada: 14 Enero | Prioridad: Alta
```

**Al completar una actividad:**

1. Confirmar ejecucion
2. Registrar variaciones (si las hay)
3. Agregar notas/fotos
4. Descontar insumos del inventario (automatico)

---

### 5. Controles de Calidad con IA

Inspecciones sistematicas con asistencia de inteligencia artificial.

**Tipos de controles:**

| Control | Frecuencia | IA Asiste |
|---------|------------|-----------|
| **Revision ambiental** | Diario | Analisis de tendencias |
| **Inspeccion de plagas** | Semanal | Deteccion por foto |
| **Revision desarrollo raices** | Dia 6 propagacion | Evaluacion salud |
| **Analisis tricomas** | Pre-cosecha | Momento optimo cosecha |

**Como funciona la deteccion de plagas:**

```
1. Tomas foto de las plantas
            |
            v
2. IA analiza la imagen
   - Identifica: Arana roja
   - Confianza: 87%
   - Severidad: Etapa temprana
   - Area afectada: 5-8%
            |
            v
3. Sistema genera:
   - Alerta al equipo
   - Recomendacion de tratamiento
   - Actividad de seguimiento
```

---

### 6. Gestion de Areas

Organiza tu instalacion en areas funcionales.

**Tipos de areas:**

| Area | Funcion | Condiciones tipicas |
|------|---------|---------------------|
| **Propagacion** | Enraizamiento de clones | 24C, 85% HR, 18h luz |
| **Vegetativo** | Crecimiento | 26C, 60% HR, 18h luz |
| **Floracion** | Produccion de flores | 24C, 50% HR, 12h luz |
| **Madres** | Plantas donadoras | 24C, 60% HR, 18h luz |
| **Secado** | Post-cosecha | 18C, 55% HR, Oscuridad |
| **Curado** | Maduracion | 18C, 60% HR, Oscuridad |

**Control de capacidad:**

```
SALA FLORACION A
----------------
Capacidad: 200 plantas
Ocupacion actual: 150 plantas (75%)
Disponible: 50 espacios

Lotes actuales:
- WW-250101-001: 50 plantas (Semana 4)
- OG-250108-002: 100 plantas (Semana 2)
```

---

### 7. Control de Inventario

Sabe que tienes, que necesitas, y cuando reordenar.

**Categorias de productos:**

| Categoria | Ejemplos |
|-----------|----------|
| **Nutrientes** | Fertilizantes base, Aditivos, pH up/down |
| **IPM** | Aceite neem, Jabon potasico, Controladores biologicos |
| **Medios** | Lana de roca, Coco, Perlita |
| **Consumibles** | Guantes, Etiquetas, Bolsas |

**Flujo de inventario:**

```
ENTRADA                    USO                      ALERTAS
   |                        |                          |
   v                        v                          v
Compra a            Al ejecutar              Stock minimo
proveedor           actividad se             alcanzado
   |                descuenta                    |
   v                automatico                   v
Registro con            |                    Notificacion
factura, lote,          v                    + Sugerencia
vencimiento        Trazabilidad              de compra
                   completa
```

---

### 8. Dashboard y Reportes

Vision general de tu operacion en tiempo real.

**KPIs principales:**

| Indicador | Descripcion |
|-----------|-------------|
| **Plantas activas** | Total en produccion |
| **Por fase** | Distribucion Prop/Veg/Flor |
| **Mortalidad** | % perdidas vs inicial |
| **Actividades hoy** | Pendientes / Completadas |
| **Alertas activas** | Plagas, Stock bajo, Vencidas |

**Alertas automaticas:**

- Actividades vencidas sin completar
- Stock bajo de insumos criticos
- Plaga detectada por IA
- Capacidad de area al limite
- Orden proxima a fecha estimada fin

---

## Caso de Uso: Ciclo Completo White Widow

### Dia 1: Crear Orden

```
Plantilla: Cannabis Interior Psicoactivo
Cultivar: White Widow
Cantidad: 50 clones
Fecha inicio: 15 Enero 2025
Duracion estimada: 119 dias
```

### Dias 1-14: Propagacion

- Toma de clones de planta madre
- Aplicacion hormona enraizamiento
- Monitoreo ambiental diario
- Revision desarrollo raices (dia 6, 10, 14)
- Transicion a vegetativo cuando raices visibles

### Dias 15-42: Vegetativo

- Trasplante a macetas vegetativas
- Riego + fertilizacion 3x/semana
- Poda de formacion
- IPM preventivo semanal
- Monitoreo de altura y salud

### Dias 43-105: Floracion

- Cambio fotoperiodo 12/12
- Cambio formula nutricional
- Defoliacion estrategica
- Revision tricomas (semana 6, 7, 8, 9)
- Flush final (ultimos 10 dias)

### Dias 106-119: Cosecha y Post-cosecha

- Corte y colgado
- Secado controlado (7-10 dias)
- Manicurado
- Curado en frascos
- Registro peso final: 22.5 kg

---

## Cumplimiento Regulatorio

### Trazabilidad para ICA/FNE

| Requisito | Como Alquemist lo cumple |
|-----------|--------------------------|
| **Origen de material** | Registro de planta madre, proveedor |
| **Historial de lote** | Cada movimiento, actividad, perdida |
| **Aplicaciones IPM** | Producto, cantidad, fecha, responsable |
| **Condiciones ambientales** | Registros diarios con timestamp |
| **Cosecha** | Peso, calidad, fecha, destino |

### Exportacion de datos

- Reportes en formato Excel/PDF
- Filtros por fecha, lote, tipo de actividad
- Historial completo auditable
- Firmas digitales de responsables

---

## Tecnologia

| Aspecto | Detalle |
|---------|---------|
| **Acceso** | Web + Mobile (PWA) |
| **Disponibilidad** | 99.9% uptime |
| **Datos** | Sincronizacion tiempo real |
| **Seguridad** | Encriptacion, roles por usuario |
| **IA** | Google Gemini Vision |
| **Sin instalacion** | 100% en la nube |

---

## Planes

| Plan | Instalaciones | Usuarios | Precio/mes |
|:----:|:-------------:|:--------:|:----------:|
| **Trial** | 1 | 3 | GRATIS (30 dias) |
| **Starter** | 1 | 10 | $359,000 COP |
| **Pro** | 3 | 50 | $990,000 COP |
| **Enterprise** | Ilimitado | Ilimitado | $3,999,000+ COP |

**Incluye en todos los planes:**
- Soporte tecnico
- Actualizaciones automaticas
- Onboarding guiado
- Sin costos de instalacion

**Programa Early Adopter: 50% OFF por 6 meses**

| Plan | Precio Regular | Precio Early Adopter |
|:----:|:--------------:|:--------------------:|
| Starter | $359,000 | **$179,500** |
| Pro | $990,000 | **$495,000** |
| Enterprise | $3,999,000+ | **$1,999,500** |

---

## Proximos Pasos

1. **Demo personalizada** - 30 minutos con tu equipo
2. **Prueba gratuita** - 30 dias sin compromiso
3. **Implementacion** - 4 semanas de la firma a produccion

---

## Contacto

**Ceibatic**

info@ceibatic.com | www.alquemist.co
