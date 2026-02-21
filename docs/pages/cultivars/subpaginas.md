# Subpaginas de Cultivares

## `/cultivars/[id]` — Detalle de Cultivar

Pagina de detalle read-only con header (nombre + botones Volver y Editar) y multiples cards de informacion.

### Header

- Titulo: nombre del cultivar
- Boton "Volver" (outline) → `/cultivars`
- Boton "Editar" (bg-green-900) → `/cultivars/[id]/edit`

### Badges de Status

Dos badges debajo del header:
- **Origen**: "Cultivar Personalizado" (verde, CheckCircle icon) — siempre visible
- **Estado**: "Activo" (verde) o "Discontinuado" (gris)

### Informacion Basica (Card)

Grid de 2 columnas (`lg:grid-cols-2`):

**Columna izquierda — Informacion Basica**:
- Tipo de Cultivo (display_name_es del crop_type)
- Tipo de Variedad (Indica/Sativa/Hibrida/Ruderalis, si tiene)
- Linaje Genetico (si tiene)

**Columna derecha — Caracteristicas**:
- Tiempo de Floracion: X semanas (Y dias)

### Perfil de Cannabinoides (Card, solo Cannabis)

Visible solo si el crop type es "Cannabis" y tiene valores THC o CBD.

Grid de 2 columnas (`md:grid-cols-2`):

| Cannabinoide | Badge | Barra visual |
|--------------|-------|-------------|
| THC | Purpura (bg-purple-100 text-purple-800) | Barra purpura (bg-purple-600) |
| CBD | Verde (bg-green-100 text-green-800) | Barra verde (bg-green-600) |

Cada uno muestra rango min% - max% como badge y barra visual proporcional.

### Notas (Card, opcional)

Texto con `whitespace-pre-wrap`. Solo visible si tiene notas.

### Metricas de Rendimiento (Card)

Grid de 4 columnas (`md:grid-cols-4`):

| Metrica | Formato |
|---------|---------|
| Lotes Totales | Numero |
| Rendimiento Promedio | Xg o "N/A" |
| Tasa de Exito | X% o "N/A" |
| Calificacion de Calidad | X/5 o "N/A" |

Si no hay lotes completados, muestra mensaje: "Las metricas se generaran automaticamente a medida que se completen lotes con este cultivar."

**Breadcrumbs**: Inicio > Cultivares > [nombre]

**Query**: `api.cultivars.get`, `api.crops.getCropTypeById`

**Ruta**: `app/(dashboard)/cultivars/[id]/page.tsx`

---

## `/cultivars/[id]/edit` — Edicion de Cultivar

Formulario de edicion con `CultivarForm` pre-populado con datos actuales del cultivar.

- Card con header "Informacion del Cultivar"
- Boton "Cancelar" (outline, ArrowLeft) en el header → vuelve a detalle
- Al guardar, redirige a `/cultivars/[id]`
- Toast de confirmacion

### Campos del Formulario

El formulario tiene layout de 2 columnas:

**Columna izquierda — Informacion Basica**:

| Campo | Tipo | Validacion |
|-------|------|------------|
| Nombre | Input texto | 2-100 caracteres, unico por empresa (activos) |
| Tipo de Cultivo | Select dropdown | Requerido (crop types activos) |
| Tipo de Variedad | Select | Solo Cannabis: Indica/Sativa/Hybrid/Ruderalis |
| Linaje Genetico | Input texto | Opcional, max 500 caracteres |
| Proveedor | Select | Opcional (si hay suppliers disponibles) |

**Columna derecha — Informacion de Cultivo**:

| Campo | Tipo | Validacion |
|-------|------|------------|
| Tiempo de Floracion (dias) | Input numerico | Opcional, entero, 1-365 |
| THC Min/Max | CannabinoidRangeInput | Solo Cannabis, 0-100%, min <= max |
| CBD Min/Max | CannabinoidRangeInput | Solo Cannabis, 0-100%, min <= max |
| Notas | Textarea | Opcional, max 1000 caracteres |

Los campos de cannabinoides solo se muestran cuando el tipo de cultivo seleccionado es Cannabis.

**Breadcrumbs**: Inicio > Cultivares > [nombre] > Editar

**Query**: `api.cultivars.get`, `api.crops.getCropTypes`

**Mutation**: `api.cultivars.update`

**Componentes**:
- `components/cultivars/cultivar-form.tsx` — form completo
- `components/cultivars/cannabinoid-range-input.tsx` — input de rango THC/CBD

**Ruta**: `app/(dashboard)/cultivars/[id]/edit/page.tsx`
