# Modal Crear Instalacion

## Vista General

Dialog para crear una nueva instalacion. Incluye control de limite del plan y formulario completo de 5 secciones.

## Header

- Icono: Factory
- Titulo: "Nueva Instalacion"
- Descripcion: "Crea una nueva instalacion..."

## Control de Limite

### Al limite (alerta roja)

"Has alcanzado el limite de X instalacion(es) de tu plan {planName}. Actualiza tu plan para crear mas instalaciones."
- Boton "Actualizar Plan"
- Formulario NO se muestra

### Cerca del limite (alerta naranja)

"Estas cerca del limite de tu plan. Te quedan X instalaciones disponibles."
- Formulario SI se muestra

## Formulario (FacilityForm)

5 cards/secciones:

### 1. Informacion Basica

| Campo | Tipo | Requerido | Detalle |
|-------|------|-----------|---------|
| Nombre | text | Si | 1-100 chars. Placeholder "Ej: Instalacion..." |
| Numero de Licencia | text | Si | 1-50 chars. Unico en sistema. Placeholder "Ej: INV-2024-001" |
| Tipo de Instalacion | select | No | Indoor / Outdoor / Invernadero / Mixta / Procesamiento |

### 2. Detalles de Licencia

| Campo | Tipo | Requerido | Detalle |
|-------|------|-----------|---------|
| Tipo de Licencia | select | No | INVIMA / ICA / Municipal / Otro |
| Autoridad Emisora | text | No | Placeholder "Ej: INVIMA" |
| Fecha de Emision | date | No | — |
| Fecha de Vencimiento | date | No | — |

### 3. Cultivos Primarios

Multi-select checkboxes de tipos de cultivo (cargados desde API `crops.getCropTypes`).

### 4. Ubicacion

| Campo | Tipo | Requerido | Detalle |
|-------|------|-----------|---------|
| Direccion | text | No | Placeholder "Ej: Calle 123 # 45-67" |
| Departamento | CascadingSelect | Si | Dropdown cascada Colombia |
| Municipio | CascadingSelect | Si | Depende de departamento seleccionado |
| Ciudad | text | No | — |
| Codigo Postal | text | No | — |
| Latitud | number | No | -90 a 90. Boton GeolocationButton para captura automatica |
| Longitud | number | No | -180 a 180 |
| Altitud (metros) | number | No | — |

### 5. Areas

| Campo | Tipo | Requerido | Detalle |
|-------|------|-----------|---------|
| Area Total (m2) | number | No | >= 0 |
| Area de Cultivo (m2) | number | No | >= 0, <= total |
| Area de Dosel (m2) | number | No | >= 0, <= cultivo |

## Acciones

| Boton | Estilo | Estado loading |
|-------|--------|----------------|
| Cancelar | outline | Cierra modal |
| Crear Instalacion | amber | "Guardando..." con spinner |

## Resultado

- **Exito:** Toast "Instalacion creada". Cierra modal
- **Error:** Toast con mensaje. Licencia duplicada: "El numero de licencia ya esta registrado en el sistema"

## Data Source

| Mutation | Datos |
|----------|-------|
| `facilities.create(...)` | Crea instalacion (verifica limite del plan) |

## Componentes

| Componente | Archivo |
|-----------|---------|
| FacilityCreateModal | `components/facilities/facility-create-modal.tsx` |
| FacilityForm | `components/facilities/facility-form.tsx` |
