# Subpaginas — Instalaciones

## `/facilities/[id]` — Detalle de Instalacion

### Header

- Titulo: Nombre de la instalacion
- Breadcrumbs: Inicio > Instalaciones > {Nombre}
- Badges: StatusBadge + "INSTALACION ACTUAL" (si aplica) + tipo de instalacion
- Botones:
  - "Cambiar a esta instalacion" (green outline) — solo si NO es actual
  - "Editar" (green solid) → `/facilities/[id]/edit`

### 5 Tabs

#### Tab 1: General

- Nombre
- Tipo de instalacion
- Estado (StatusBadge)
- Numero de licencia
- Cultivos primarios (badges)

#### Tab 2: Ubicacion

- Direccion, departamento, municipio, ciudad, codigo postal
- Coordenadas GPS: latitud (6 decimales), longitud, altitud en metros
- **Mapa embebido:** iframe de OpenStreetMap centrado en coordenadas de la instalacion. Solo visible si hay coordenadas

#### Tab 3: Licencia

- Numero, tipo, autoridad emisora
- Fecha de emision y vencimiento (formato es-CO)
- **Alertas:**
  - Licencia vencida (alerta roja): "La licencia... vencio hace X dias"
  - Proxima a vencer (<=30 dias, alerta naranja): "La licencia vencera en X dias"

#### Tab 4: Areas

- 3 metric cards grandes: area total, area cultivo, area dosel (en m2)
- Visualizacion proporcional con barras animadas:
  - Total (blue, siempre 100%)
  - Cultivo (green, % del total)
  - Dosel (amber, % del cultivo)

#### Tab 5: Utilities

- Header con boton "Registrar Lectura" (amber) → abre UtilityReadingModal
- Tabla de lecturas con columnas: Periodo, Tipo, Consumo, Costo, Estado, Fecha, Acciones
- Tipos: Electricidad (kWh), Agua (m3), Gas (m3)
- Estados: Pendiente (outline), Prorrateado (blue), Sin batches (secondary)
- Boton "Prorratear" / "Re-prorratear" por lectura → asigna costo a batches activos proporcional a area x dias
- Estado vacio: "No hay lecturas registradas"

Ver [utilities.md](./utilities.md) para detalle del tab de utilities.

### Data Source

| Query | Datos |
|-------|-------|
| `facilities.get({ id, companyId })` | Instalacion completa |
| `users.getUserById({ userId })` | Para verificar instalacion actual |
| `crops.getCropTypes()` | Tipos de cultivo |
| `utilities.getByFacility({ facilityId })` | Lecturas (limite: 24) |

---

## `/facilities/[id]/edit` — Edicion de Instalacion

### Header

- Titulo: "Editar: {Nombre}"
- Breadcrumbs: Inicio > Instalaciones > {Nombre} > Editar

### Formulario

Mismo `FacilityForm` que el modal de creacion, con diferencias:

- Numero de licencia: **deshabilitado** (fondo gris, cursor no-modify, helper "El numero de licencia no se puede modificar")
- Boton: "Guardar Cambios" (en vez de "Crear Instalacion")
- Pre-llena todos los campos con datos existentes

### Resultado

- **Exito:** Toast "Instalacion actualizada" → redirige a `/facilities/[id]`
- **Error:** Toast con mensaje, permanece en pagina

### Data Source

| Mutation | Datos |
|----------|-------|
| `facilities.update({ id, companyId, ... })` | Actualiza campos de la instalacion |
