# PHASE 2: MASTER DATA & BASIC SETUP - USER FLOWS & TESTS

**Objetivo**: Configurar todos los datos maestros necesarios para operar el sistema.
**Prerequisitos**: Phase 1 (Onboarding) completada exitosamente.
**UI Reference**: Ver [../UI-PATTERNS.md](../UI-PATTERNS.md) para patrones visuales.

---

## Resumen de Modulos

| Modulo | Entidad | Proposito | Ruta |
|--------|---------|-----------|------|
| **8** | Areas | Zonas de cultivo (salas, invernaderos) | `/areas` |
| **15** | Cultivars | Variedades de plantas (strains, variedades) | `/cultivars` |
| **16** | Suppliers | Proveedores de insumos | `/suppliers` |
| **17** | Team | Gestion de usuarios e invitaciones | `/team` |
| **18** | Facilities | Gestion multi-instalacion | `/facilities` |
| **19** | Inventory | Stock de insumos y materiales | `/inventory` |
| **20** | Facility Settings | Configuracion de instalacion | `/settings/facility` |
| **21** | Account Settings | Preferencias de usuario | `/settings/account` |

---

## Datos de Prueba Base

**Facility**: North Greenhouse
**Usuario**: admin@ceibatic.com (Company Owner)
**Crop Type**: Cannabis

---

## MODULE 8: Area Management

### Descripcion
Areas son las zonas fisicas de cultivo dentro de una instalacion. Cada area tiene un tipo (propagacion, vegetativo, floracion, etc.), capacidad, y especificaciones ambientales.

### Tipos de Area
- `propagation` - Propagacion inicial (clones, semillas)
- `vegetative` - Crecimiento vegetativo
- `flowering` - Floracion/fructificacion
- `drying` - Secado post-cosecha
- `curing` - Curado
- `storage` - Almacenamiento
- `processing` - Procesamiento
- `quarantine` - Cuarentena

### Flujo 1: Ver Lista de Areas

**Ruta**: `/areas`

**Estructura de Pagina** (ver UI-PATTERNS.md seccion 2):
```
┌─────────────────────────────────────────────────────────────┐
│ [PageHeader: "Areas" + Breadcrumb]                          │
├─────────────────────────────────────────────────────────────┤
│ [Stats: Total | Activas | Mantenimiento | Inactivas]        │
├─────────────────────────────────────────────────────────────┤
│ [Filtros ▼] [Tipo ▼] [🔍 Buscar...] [+ Crear Area]         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│ │ Card 1  │ │ Card 2  │ │ Card 3  │  Grid: lg:3 md:2 sm:1  │
│ └─────────┘ └─────────┘ └─────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Navegar a `/areas`
2. Ver estadisticas en header (total, activas, mantenimiento, inactivas)
3. Ver grid de cards con areas existentes
4. Usar filtro de tipo para filtrar por tipo de area
5. Usar buscador para buscar por nombre
6. Click en card navega a detalle

**Criterios de Aceptacion**:
- [ ] Stats cards muestran conteos correctos
- [ ] Filtro de tipo funciona correctamente
- [ ] Busqueda filtra por nombre
- [ ] Cards muestran: codigo, tipo, nombre, ocupacion, status
- [ ] Click en card navega a `/areas/[id]`
- [ ] Estado vacio muestra mensaje + boton crear (si no hay areas)

---

### Flujo 2: Crear Nueva Area

**Trigger**: Click en boton "Crear Area" (amber-500)

**Modal de Creacion** (ver UI-PATTERNS.md seccion 4):
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] Crear Nueva Area                               [X]   │
│        Complete los campos para crear una nueva area        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┬─────────────────────────────┐  │
│ │ INFORMACION BASICA      │ CAPACIDAD & AMBIENTE        │  │
│ │                         │                             │  │
│ │ Nombre: [__________]    │ Area Total (m²): [___]      │  │
│ │                         │                             │  │
│ │ Tipo: [▼ Seleccionar]   │ Capacidad: [___] plantas    │  │
│ │                         │                             │  │
│ │ Estado:                 │ Control Climatico:          │  │
│ │ ○ Activa               │ ○ Si  ○ No                  │  │
│ │ ○ Mantenimiento        │                             │  │
│ │ ○ Inactiva             │ [Si control climatico:]     │  │
│ │                         │ Temp: [__] - [__] °C        │  │
│ │ Descripcion:            │ Humedad: [__] - [__] %      │  │
│ │ [________________]      │ Luz: [__] hrs/dia           │  │
│ │                         │ pH: [__] - [__]             │  │
│ └─────────────────────────┴─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      [Cancelar] [Crear Area]                │
└─────────────────────────────────────────────────────────────┘
```

**Campos Requeridos**:
- Nombre (unico dentro del facility)
- Tipo de area
- Area total (m²)
- Capacidad (plantas)

**Campos Opcionales**:
- Estado (default: active)
- Control climatico y especificaciones
- Descripcion

**Pasos**:
1. Click "Crear Area"
2. Completar nombre: "Propagation Room"
3. Seleccionar tipo: "propagation"
4. Ingresar area: 50 m²
5. Ingresar capacidad: 500 plantas
6. Activar control climatico
7. Configurar: Temp 24-26°C, Humedad 70-80%
8. Click "Crear Area"

**Criterios de Aceptacion**:
- [ ] Modal abre correctamente
- [ ] Validacion de campos requeridos
- [ ] Campos de ambiente aparecen solo si control climatico = Si
- [ ] Al guardar: toast de exito, modal cierra, lista actualiza
- [ ] Area aparece en lista con status correcto
- [ ] Stats cards actualizan conteo

---

### Flujo 3: Ver Detalle de Area

**Ruta**: `/areas/[id]`

**Estructura de Pagina** (ver UI-PATTERNS.md seccion 3):
```
┌─────────────────────────────────────────────────────────────┐
│ [Breadcrumb: Home > Areas > Propagation Room]               │
│ Propagation Room                              [Editar]      │
├─────────────────────────────────────────────────────────────┤
│ [Tab: Detalle] [Tab: Lotes] [Tab: Actividades]              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ INFORMACION GENERAL                      [StatusBadge]  ││
│ │                                                         ││
│ │ Tipo          Area Total    Capacidad    Ocupacion     ││
│ │ Propagacion   50 m²         500          0 (0%)        ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ CONTROL CLIMATICO                                       ││
│ │                                                         ││
│ │ Temperatura   Humedad       Luz          pH            ││
│ │ 24-26°C       70-80%        18 hrs       5.5-6.5       ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Tabs**:
- **Detalle**: Informacion general y especificaciones
- **Lotes**: Lista de batches activos en el area
- **Actividades**: Historial de actividades realizadas

**Pasos**:
1. Click en card de area desde lista
2. Ver informacion general
3. Navegar entre tabs
4. Click "Editar" para modificar

**Criterios de Aceptacion**:
- [ ] Breadcrumb muestra ruta correcta
- [ ] Informacion del area es correcta
- [ ] Tabs funcionan y cargan contenido
- [ ] Boton editar navega a edicion

---

### Flujo 4: Editar Area

**Ruta**: `/areas/[id]/edit`

**Pasos**:
1. Desde detalle, click "Editar"
2. Modificar capacidad: 600 (de 500)
3. Click "Guardar"

**Criterios de Aceptacion**:
- [ ] Formulario pre-llenado con datos actuales
- [ ] Cambios se guardan correctamente
- [ ] Redirige a detalle con datos actualizados
- [ ] Toast de confirmacion

---

### Test Cases: Areas

| ID | Descripcion | Datos | Resultado Esperado |
|----|-------------|-------|-------------------|
| A-01 | Crear area propagacion | Propagation Room, propagation, 50m², 500 | Area creada, status active |
| A-02 | Crear area vegetativa | Vegetative Room, vegetative, 150m², 200 | Area creada, lista muestra 2 |
| A-03 | Crear area floracion | Flowering Room, flowering, 250m², 100 | Area creada, lista muestra 3 |
| A-04 | Editar capacidad | Propagation Room → 600 | Capacidad actualizada |
| A-05 | Buscar area | "Prop" | Solo Propagation Room visible |
| A-06 | Filtrar por tipo | vegetative | Solo Vegetative Room visible |

---

## MODULE 15: Cultivar Management

### Descripcion
Cultivars son las variedades o strains que se cultivan. Pueden ser del sistema (predefinidos) o personalizados (creados por el facility).

### Conceptos Clave
- **System Cultivars**: Variedades predefinidas, solo lectura, compartidas
- **Custom Cultivars**: Variedades propietarias, editables, privadas al facility
- **Facility Linking**: Proceso de agregar cultivars del sistema al facility

### Flujo 1: Ver Lista de Cultivars

**Ruta**: `/cultivars`

**Estructura de Pagina**:
```
┌─────────────────────────────────────────────────────────────┐
│ [PageHeader: "Cultivars" + Breadcrumb]                      │
├─────────────────────────────────────────────────────────────┤
│ [Stats: Total | Cannabis | Coffee | Custom]                 │
├─────────────────────────────────────────────────────────────┤
│ [Tipo ▼] [🔍 Buscar...] [Agregar del Sistema] [+ Crear]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Cherry AK              [⭐ Sistema]                     ││
│ │ Indica | 8-9 semanas | THC 18-22%                       ││
│ │ [Ver] [Ver Lotes]                                       ││
│ └─────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Test Strain 1          [✓ Custom]                       ││
│ │ Hibrida | 9 semanas | THC 18-22%                        ││
│ │ [Ver] [Editar] [Eliminar]                               ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Diferencias por Tipo**:
- System: Solo lectura, badge ⭐, no editable
- Custom: Editable, badge ✓, puede eliminarse

**Pasos**:
1. Navegar a `/cultivars`
2. Ver lista de cultivars vinculados al facility
3. Filtrar por crop type si hay multiples
4. Identificar cuales son system vs custom

**Criterios de Aceptacion**:
- [ ] Lista muestra cultivars del facility
- [ ] Badge indica si es system o custom
- [ ] Acciones correctas segun tipo
- [ ] Filtro de crop type funciona

---

### Flujo 2: Agregar Cultivars del Sistema

**Trigger**: Click "Agregar del Sistema"

**Modal de Seleccion**:
```
┌─────────────────────────────────────────────────────────────┐
│ Agregar Cultivars del Sistema                         [X]   │
│ Selecciona los cultivars que cultivas en tu instalacion     │
├─────────────────────────────────────────────────────────────┤
│ Tipo de Cultivo: [▼ Cannabis]                               │
│                                                             │
│ [🔍 Buscar en catalogo...]                                  │
├─────────────────────────────────────────────────────────────┤
│ ☐ Cherry AK (Indica) - 8-9 sem - THC 18-22%                │
│ ☐ OG Kush (Indica) - 8-9 sem - THC 19-24%                  │
│ ☐ Northern Lights (Indica) - 7-9 sem - THC 16-21%          │
│ ☐ White Widow (Hibrida) - 9-10 sem - THC 20-25%            │
│ ☐ Sour Diesel (Sativa) - 10-11 sem - THC 20-25%            │
├─────────────────────────────────────────────────────────────┤
│ Seleccionados: 0                                            │
│                      [Cancelar] [Agregar Seleccionados]     │
└─────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Click "Agregar del Sistema"
2. Filtrar por crop type si necesario
3. Seleccionar: Cherry AK, OG Kush, Northern Lights
4. Click "Agregar Seleccionados"

**Criterios de Aceptacion**:
- [ ] Modal muestra solo cultivars NO vinculados
- [ ] Multi-seleccion funciona
- [ ] Contador actualiza con seleccion
- [ ] Al guardar: toast exito, lista actualiza
- [ ] Cultivars aparecen con badge ⭐

---

### Flujo 3: Crear Cultivar Personalizado

**Trigger**: Click "Crear Cultivar" (amber-500)

**Modal de Creacion**:
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] Nuevo Cultivar Personalizado                   [X]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┬─────────────────────────────┐  │
│ │ INFORMACION BASICA      │ CARACTERISTICAS             │  │
│ │                         │                             │  │
│ │ Crop Type: [▼ Cannabis] │ Floración: [__] semanas     │  │
│ │                         │                             │  │
│ │ Nombre: [__________]    │ Rendimiento: [▼ Medio]      │  │
│ │                         │                             │  │
│ │ Tipo de Variedad:       │ THC (%): [__] - [__]        │  │
│ │ ○ Indica               │                             │  │
│ │ ○ Sativa               │ CBD (%): [__] - [__]        │  │
│ │ ● Hibrida              │                             │  │
│ │                         │ Aromas: [__________]        │  │
│ │ Genetica: [__________]  │                             │  │
│ │                         │ Efectos: [__________]       │  │
│ │ Breeder: [__________]   │                             │  │
│ └─────────────────────────┴─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      [Cancelar] [Crear Cultivar]            │
└─────────────────────────────────────────────────────────────┘
```

**Campos Requeridos**:
- Crop Type
- Nombre
- Tipo de variedad (Cannabis)
- Tiempo de floracion
- Nivel de rendimiento

**Pasos**:
1. Click "Crear Cultivar"
2. Seleccionar crop type: Cannabis
3. Nombre: "Test Strain 1"
4. Tipo: Hibrida
5. Floracion: 9 semanas
6. Rendimiento: Medio-Alto
7. THC: 18-22%
8. Click "Crear Cultivar"

**Criterios de Aceptacion**:
- [ ] Modal abre correctamente
- [ ] Campos dinamicos segun crop type
- [ ] Al guardar: cultivar creado con badge ✓ Custom
- [ ] Cultivar editable y eliminable

---

### Test Cases: Cultivars

| ID | Descripcion | Datos | Resultado Esperado |
|----|-------------|-------|-------------------|
| C-01 | Agregar Cherry AK del sistema | Seleccionar Cherry AK | Cultivar vinculado, badge ⭐ |
| C-02 | Agregar multiples del sistema | OG Kush, Northern Lights | 3 cultivars system total |
| C-03 | Crear cultivar custom | Test Strain 1, Hibrida, 9 sem | Cultivar creado, badge ✓ |
| C-04 | Crear segundo custom | Test Strain 2, Sativa, 10 sem | 5 cultivars total (3+2) |
| C-05 | Editar cultivar custom | Test Strain 1 → 10 semanas | Floracion actualizada |
| C-06 | Intentar editar system | Cherry AK | Boton editar no disponible |

---

## MODULE 16: Supplier Management

### Descripcion
Suppliers son los proveedores que suministran insumos al facility (nutrientes, semillas, equipamiento, etc.).

### Categorias de Proveedor
- `nutrients` - Nutrientes y fertilizantes
- `pesticides` - Pesticidas y fungicidas
- `seeds` - Semillas y material genetico
- `equipment` - Equipamiento y herramientas
- `growing_media` - Sustratos y medios de cultivo
- `packaging` - Empaque y etiquetado
- `lab_testing` - Servicios de laboratorio
- `other` - Otros

### Flujo 1: Ver Lista de Suppliers

**Ruta**: `/suppliers`

**Estructura de Pagina**:
```
┌─────────────────────────────────────────────────────────────┐
│ [PageHeader: "Proveedores" + Breadcrumb]                    │
├─────────────────────────────────────────────────────────────┤
│ [Stats: Total | Activos | Inactivos]                        │
├─────────────────────────────────────────────────────────────┤
│ [Categoria ▼] [🔍 Buscar...] [+ Nuevo Proveedor]           │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐  │
│ │ ID    Nombre           Categorias      Estado        │  │
│ │ 001   FarmChem Inc     Nutrientes      🟢 Activo    │  │
│ │ 002   GrowSupply       Equipamiento    🟢 Activo    │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Criterios de Aceptacion**:
- [ ] Tabla muestra suppliers del company
- [ ] Filtro por categoria funciona
- [ ] Status badge correcto (active/inactive)
- [ ] Acciones: Ver, Editar, Desactivar

---

### Flujo 2: Crear Supplier

**Trigger**: Click "Nuevo Proveedor" (amber-500)

**Modal de Creacion**:
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] Nuevo Proveedor                                [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Nombre: [________________________]                          │
│                                                             │
│ Contacto: [________________________]                        │
│                                                             │
│ Email: [________________________]                           │
│                                                             │
│ Telefono: [________________________]                        │
│                                                             │
│ Direccion: [________________________]                       │
│                                                             │
│ Categorias:                                                 │
│ ☐ Nutrientes  ☐ Pesticidas  ☐ Semillas                    │
│ ☐ Equipamiento  ☐ Sustratos  ☐ Empaque                    │
│                                                             │
│ Notas: [________________________]                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      [Cancelar] [Crear Proveedor]           │
└─────────────────────────────────────────────────────────────┘
```

**Campos Requeridos**:
- Nombre

**Campos Opcionales**:
- Contacto, Email, Telefono, Direccion
- Categorias
- Notas

**Pasos**:
1. Click "Nuevo Proveedor"
2. Nombre: "FarmChem Inc"
3. Contacto: "Carlos Rodriguez"
4. Email: "sales@farmchem.com"
5. Categorias: Nutrientes, Pesticidas
6. Click "Crear Proveedor"

**Criterios de Aceptacion**:
- [ ] Proveedor creado exitosamente
- [ ] Aparece en lista con categorias correctas
- [ ] Status default: active

---

### Test Cases: Suppliers

| ID | Descripcion | Datos | Resultado Esperado |
|----|-------------|-------|-------------------|
| S-01 | Crear proveedor quimicos | FarmChem Inc, Nutrientes | Proveedor creado |
| S-02 | Crear proveedor equipamiento | GrowSupply, Equipamiento | 2 proveedores total |
| S-03 | Editar proveedor | FarmChem → agregar Pesticidas | Categoria actualizada |
| S-04 | Desactivar proveedor | GrowSupply → inactive | Status cambia a inactivo |
| S-05 | Filtrar por categoria | Nutrientes | Solo FarmChem visible |

---

## MODULE 19: Inventory Management

### Descripcion
Inventory gestiona todos los items fisicos: plantas madre, semillas, clones, equipamiento, nutrientes, y materiales.

### Categorias de Inventario
- `mother_plant` - Plantas madre
- `seeds` - Semillas
- `clones` - Clones/esquejes
- `equipment` - Equipamiento
- `nutrients` - Nutrientes
- `pesticides` - Pesticidas
- `materials` - Materiales de cultivo
- `consumables` - Consumibles

### Flujo 1: Ver Lista de Inventario

**Ruta**: `/inventory`

**Estructura de Pagina**:
```
┌─────────────────────────────────────────────────────────────┐
│ [PageHeader: "Inventario" + Breadcrumb]                     │
├─────────────────────────────────────────────────────────────┤
│ [Stats: Total Items | Low Stock ⚠️]                         │
├─────────────────────────────────────────────────────────────┤
│ [Todos] [Plantas Madre] [Semillas] [Nutrientes] [Materiales]│
├─────────────────────────────────────────────────────────────┤
│ [🔍 Buscar...] [+ Agregar Item]                             │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐  │
│ │ ID    Nombre         Categoria    Cantidad   Estado   │  │
│ │ 001   Base Veg A+B   Nutrientes   500 L      🟢 OK   │  │
│ │ 002   Cal-Mag        Nutrientes   15 L       🔴 Low  │  │
│ │ 003   Coco Coir      Materiales   200 bags   🟢 OK   │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Estados de Stock**:
- 🟢 OK: stock >= reorder_point
- 🟡 Medium: stock entre 50% y 100% del reorder_point
- 🔴 Low: stock < reorder_point

**Criterios de Aceptacion**:
- [ ] Lista muestra items del facility
- [ ] Tabs filtran por categoria
- [ ] Status badge indica nivel de stock
- [ ] Low stock count es correcto

---

### Flujo 2: Crear Item de Inventario

**Trigger**: Click "Agregar Item" (amber-500)

**Modal de Creacion**:
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] Nuevo Item de Inventario                       [X]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┬─────────────────────────────┐  │
│ │ INFORMACION BASICA      │ STOCK & TRACKING            │  │
│ │                         │                             │  │
│ │ Categoria: [▼ Select]   │ Cantidad: [___] [▼ Unidad] │  │
│ │                         │                             │  │
│ │ Nombre: [__________]    │ Punto Reorden: [___]        │  │
│ │                         │                             │  │
│ │ SKU: [__________]       │ Area: [▼ Almacen]           │  │
│ │                         │                             │  │
│ │ Proveedor: [▼ Select]   │ Precio Unit: $[___]         │  │
│ │                         │                             │  │
│ │ Lote: [__________]      │ Vencimiento: [__/__/____]   │  │
│ └─────────────────────────┴─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      [Cancelar] [Guardar]                   │
└─────────────────────────────────────────────────────────────┘
```

**Campos Requeridos**:
- Categoria
- Nombre
- Cantidad inicial
- Unidad de medida
- Area de almacenamiento

**Pasos**:
1. Click "Agregar Item"
2. Categoria: Nutrientes
3. Nombre: "Base Vegetativa A+B"
4. Proveedor: FarmChem Inc
5. Cantidad: 500 Litros
6. Punto de Reorden: 100
7. Click "Guardar"

**Criterios de Aceptacion**:
- [ ] Item creado con cantidad inicial
- [ ] Status calculado automaticamente (OK si >= reorder_point)
- [ ] Vinculo a supplier correcto

---

### Flujo 3: Ajustar Stock

**Trigger**: Menu contextual → "Ajustar Stock"

**Modal de Ajuste**:
```
┌─────────────────────────────────────────────────────────────┐
│ Ajustar Stock: Cal-Mag                                [X]   │
├─────────────────────────────────────────────────────────────┤
│ Stock Actual: 100 L                                         │
│                                                             │
│ Tipo de Ajuste:                                             │
│ ○ Entrada (+)                                              │
│ ● Salida (-)                                               │
│                                                             │
│ Cantidad: [30] L                                            │
│                                                             │
│ Razon: [Botellas danadas_____________]                      │
│                                                             │
│ Nuevo Stock: 70 L                                           │
├─────────────────────────────────────────────────────────────┤
│                      [Cancelar] [Confirmar Ajuste]          │
└─────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. En item "Cal-Mag", click menu → "Ajustar Stock"
2. Tipo: Salida
3. Cantidad: 30
4. Razon: "Botellas danadas"
5. Click "Confirmar Ajuste"

**Criterios de Aceptacion**:
- [ ] Preview del nuevo stock es correcto
- [ ] Stock actualizado en lista
- [ ] Registro de movimiento creado
- [ ] Status actualiza si cruza reorder_point

---

### Test Cases: Inventory

| ID | Descripcion | Datos | Resultado Esperado |
|----|-------------|-------|-------------------|
| I-01 | Crear nutriente base | Base Veg A+B, 500L, reorder 100 | Item creado, 🟢 OK |
| I-02 | Crear nutriente floracion | Base Flor A+B, 500L | 2 items |
| I-03 | Crear Cal-Mag | Cal-Mag, 100L, reorder 20 | 3 items |
| I-04 | Crear sustrato | Coco Coir, 200 bags | 4 items |
| I-05 | Ajustar stock negativo | Cal-Mag -85L | Stock 15L, 🔴 Low |
| I-06 | Ver Low Stock | Filtrar items bajos | Solo Cal-Mag visible |

---

## MODULE 17: Team Management

### Descripcion
Team gestiona los usuarios que tienen acceso al sistema, incluyendo invitaciones, roles, y permisos.

### Roles
- `ADMIN` - Acceso completo, configuracion de empresa
- `FACILITY_MANAGER` - Gestion de instalacion
- `PRODUCTION_SUPERVISOR` - Supervision de produccion
- `WORKER` - Ejecucion de actividades
- `QUALITY_CONTROLLER` - Control de calidad

### Flujo 1: Ver Lista de Usuarios

**Ruta**: `/team`

**Estructura de Pagina**:
```
┌─────────────────────────────────────────────────────────────┐
│ [PageHeader: "Equipo" + Breadcrumb]                         │
├─────────────────────────────────────────────────────────────┤
│ [Stats: Total | Activos | Pendientes]                       │
├─────────────────────────────────────────────────────────────┤
│ [Rol ▼] [Estado ▼] [🔍 Buscar...] [+ Invitar Usuario]      │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Usuario           Email              Rol       Estado │  │
│ │ Admin User        admin@...          Admin     🟢 Act │  │
│ │ Maria Garcia      maria@...          Manager   ⏳ Pend │  │
│ │ Juan Lopez        juan@...           Worker    ⏳ Pend │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Estados de Usuario**:
- 🟢 Active: Usuario activo con acceso
- ⏳ Pending: Invitacion enviada, sin aceptar
- 🔴 Inactive: Usuario desactivado

**Criterios de Aceptacion**:
- [ ] Lista muestra usuarios del company
- [ ] Status badge correcto
- [ ] Filtros de rol y estado funcionan

---

### Flujo 2: Invitar Usuario

**Trigger**: Click "Invitar Usuario" (amber-500)

**Modal de Invitacion**:
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] Invitar Nuevo Usuario                          [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Email: [________________________]                           │
│                                                             │
│ Nombre: [________________________]                          │
│                                                             │
│ Apellido: [________________________]                        │
│                                                             │
│ Rol: [▼ Seleccionar Rol]                                   │
│                                                             │
│ Instalacion: [▼ North Greenhouse]                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      [Cancelar] [Enviar Invitacion]         │
└─────────────────────────────────────────────────────────────┘
```

**Pasos**:
1. Click "Invitar Usuario"
2. Email: "maria.garcia@testfarm.com"
3. Nombre: "Maria"
4. Apellido: "Garcia"
5. Rol: Facility Manager
6. Instalacion: North Greenhouse
7. Click "Enviar Invitacion"

**Criterios de Aceptacion**:
- [ ] Email de invitacion enviado
- [ ] Usuario aparece con status ⏳ Pending
- [ ] Accion "Reenviar Invitacion" disponible

---

### Test Cases: Team

| ID | Descripcion | Datos | Resultado Esperado |
|----|-------------|-------|-------------------|
| T-01 | Invitar Facility Manager | maria@..., Manager | Invitacion enviada, ⏳ Pending |
| T-02 | Invitar Worker | juan@..., Worker | 3 usuarios total |
| T-03 | Reenviar invitacion | Maria Garcia | Nueva invitacion enviada |
| T-04 | Filtrar por rol | Rol = Worker | Solo Juan visible |
| T-05 | Filtrar por estado | Estado = Pending | Maria y Juan visibles |

---

## MODULE 18: Facility Management

### Descripcion
Facility Management permite gestionar multiples instalaciones y cambiar entre ellas.

### Flujo 1: Ver Instalaciones

**Ruta**: `/facilities`

**Estructura de Pagina**:
```
┌─────────────────────────────────────────────────────────────┐
│ [PageHeader: "Instalaciones" + Breadcrumb]                  │
├─────────────────────────────────────────────────────────────┤
│ [Stats: Total | Plan: Professional (5 max)]                 │
├─────────────────────────────────────────────────────────────┤
│ [+ Nueva Instalacion]                                       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🏭 North Greenhouse                        [✓ Activa]   ││
│ │ Medellin | 500 m² | Cannabis                            ││
│ │ Areas: 3 | Usuarios: 3 | Ordenes: 0                     ││
│ │ [Ver Dashboard] [Configurar] [Cambiar a esta]           ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

### Flujo 2: Facility Switcher (Header)

**Ubicacion**: Header global

**Componente**:
```
┌─────────────────────────────────────────┐
│ [🏭 North Greenhouse ▼]                 │
├─────────────────────────────────────────┤
│ 🏭 North Greenhouse ✓                   │
│ 🏭 South Facility                       │
│ ─────────────────────────               │
│ + Agregar Instalacion                   │
│ ⚙️ Gestionar Instalaciones              │
└─────────────────────────────────────────┘
```

**Workflow al Cambiar**:
1. Usuario selecciona facility diferente
2. Sistema actualiza `currentFacilityId` del usuario
3. Pagina actual recarga con contexto de nuevo facility
4. Todos los datos mostrados son del nuevo facility

**Criterios de Aceptacion**:
- [ ] Switcher muestra facility actual
- [ ] Dropdown lista todos los facilities accesibles
- [ ] Al cambiar, toda la aplicacion usa nuevo contexto
- [ ] Stats y datos reflejan nuevo facility

---

## MODULE 20: Facility Settings

### Descripcion
Configuraciones especificas de la instalacion actual.

**Ruta**: `/settings/facility`

### Secciones

**Tab General**:
- Nombre de instalacion
- Tipo de licencia
- Numero de licencia
- Area licenciada (m²)
- Cultivo principal

**Tab Ubicacion**:
- Departamento
- Municipio
- Direccion
- Coordenadas GPS

**Tab Ambiente**:
- Zona climatica
- Temperatura objetivo
- Humedad objetivo

**Criterios de Aceptacion**:
- [ ] Datos pre-cargados correctamente
- [ ] Cambios se guardan
- [ ] Validacion de campos

---

## MODULE 21: Account Settings

### Descripcion
Preferencias personales del usuario.

**Ruta**: `/settings/account`

### Secciones

**Tab Perfil**:
- Nombre, Apellido
- Email (solo lectura)
- Telefono

**Tab Preferencias**:
- Idioma
- Zona horaria
- Formato de fecha
- Unidades (metricas/imperiales)

**Tab Notificaciones**:
- Alertas de stock bajo
- Actividades vencidas
- Resumen diario
- Alertas de calidad

**Tab Seguridad**:
- Cambiar contrasena
- 2FA (si disponible)

**Criterios de Aceptacion**:
- [ ] Datos del usuario cargados
- [ ] Cambio de idioma funciona
- [ ] Preferencias se persisten

---

## Resumen de Estado Final - Phase 2

### Al completar Phase 2, el sistema debe tener:

**Areas (3)**:
| Area | Tipo | m² | Capacidad |
|------|------|-----|-----------|
| Propagation Room | propagation | 50 | 500 clones |
| Vegetative Room | vegetative | 150 | 200 plants |
| Flowering Room | flowering | 250 | 100 plants |

**Cultivars (5)**:
| Cultivar | Tipo | Source |
|----------|------|--------|
| Cherry AK | Indica | System |
| OG Kush | Indica | System |
| Northern Lights | Indica | System |
| Test Strain 1 | Hibrida | Custom |
| Test Strain 2 | Sativa | Custom |

**Suppliers (2)**:
| Supplier | Categorias |
|----------|------------|
| FarmChem Inc | Nutrientes, Pesticidas |
| GrowSupply | Equipamiento, Materiales |

**Inventory (6+ items)**:
| Item | Categoria | Stock | Status |
|------|-----------|-------|--------|
| Base Vegetativa A+B | Nutrientes | 500 L | OK |
| Base Floracion A+B | Nutrientes | 500 L | OK |
| Cal-Mag | Nutrientes | 15 L | Low |
| pH Down | Nutrientes | 50 L | OK |
| Coco Coir | Materiales | 200 bags | OK |
| Perlita | Materiales | 50 bags | OK |

**Team (3 usuarios)**:
| Usuario | Rol | Estado |
|---------|-----|--------|
| admin@ceibatic.com | Admin | Active |
| maria.garcia@testfarm.com | Facility Manager | Pending |
| juan.lopez@testfarm.com | Worker | Pending |

---

## Checklist Final Phase 2

- [ ] 3 areas creadas y activas
- [ ] 3+ cultivars del sistema vinculados
- [ ] 2+ cultivars personalizados creados
- [ ] 2 suppliers registrados
- [ ] 6+ items de inventario creados
- [ ] 1+ item con status Low Stock
- [ ] 2 invitaciones de equipo enviadas
- [ ] Facility settings configurados
- [ ] Account settings configurados
- [ ] Facility switcher funcional (si hay multiples)

---

**Fase anterior**: [01-PHASE-1-ONBOARDING-TESTS.md](01-PHASE-1-ONBOARDING-TESTS.md)
**Siguiente fase**: [03-PHASE-3-TEMPLATES-TESTS.md](03-PHASE-3-TEMPLATES-TESTS.md)
