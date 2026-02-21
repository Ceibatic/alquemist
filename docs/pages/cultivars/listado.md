# Listado de Cultivares

Pagina principal `/cultivars`. Muestra todos los cultivares de la empresa con filtros, stats y grid de cards.

## Stats (CompactStats)

| Stat | Icono | Color | Calculo |
|------|-------|-------|---------|
| Total | Sprout | green | Total de cultivares activos |
| (Top 3 por tipo) | Leaf/Flower2/Trees | default | Count por tipo de cultivo (ej: Cannabis: 12, Cafe: 3) |

Los stats se calculan client-side agrupando cultivares por `crop_type_id` y mostrando hasta 3 tipos con mas cultivares. Los iconos rotan entre Leaf, Flower2, Trees, Sprout.

Query: `api.cultivars.list` con `companyId`, `api.crops.getCropTypes`

## Filtros

Barra de filtros en una sola linea.

### Tipo de Cultivo (Dropdown)

Componente `CropTypeFilter` con emojis:

| Emoji | Tipo |
|-------|------|
| 📋 | Todos (default) |
| 🌿 | Cannabis |
| ☕ | Cafe |
| 🍫 | Cacao |
| 🌸 | Flores |
| 🌱 | Otros |

### Busqueda

Input de texto que filtra client-side por nombre, variety_type y genetic_lineage.

### Mostrar Discontinuados

Checkbox "Mostrar cultivares discontinuados". Por defecto desactivado (solo muestra activos).

## Grid de Cards

Grid responsivo: `md:grid-cols-2 lg:grid-cols-3`. Cada card (`CultivarCard`) muestra:

1. **Header visual** (h-32): gradiente verde (from-green-50 to-green-100) con icono Leaf como watermark (opacity-20)
2. **Badge de origen** (top-right): "Sistema" (amarillo, Star icon) o "Custom" (verde, CheckCircle icon)
3. **Nombre** + menu kebab (Editar, Eliminar, Reactivar si discontinuado)
4. **Badges**: variety_type (outline) + nombre tipo de cultivo (texto gris)
5. **Stats row**: tiempo de floracion en semanas (Flower2 icon), badge de dificultad (Facil verde, Medio amarillo, Dificil rojo)
6. **THC/CBD** (si Cannabis): fondo gris-50 con rangos (THC: Activity verde, CBD: Activity azul)
7. **Linaje genetico** (si tiene): texto italic truncado
8. **Timestamp**: "Creado: dd/mm/yyyy"

### Acciones por Card

| Accion | Descripcion |
|--------|-------------|
| Click card | Navega a `/cultivars/[id]` |
| Editar (menu) | Navega a `/cultivars/[id]/edit` |
| Eliminar (menu) | Soft delete via `api.cultivars.remove` (status → discontinued) |
| Reactivar (menu) | Solo visible en discontinuados, reactiva cultivar |

## Boton Crear

Boton "Crear Cultivar" (amber-500) en la barra de filtros. Abre `CultivarCreateModal` (ver [modal-crear-cultivar.md](./modal-crear-cultivar.md)).

## Estado Vacio

**Sin cultivares**: icono, titulo "No tienes cultivares", descripcion explicativa, boton CTA "Crear Cultivar" (amber-500).

**Sin resultados por filtro**: icono, mensaje "No se encontraron cultivares", boton "Limpiar filtros".

## Componentes

- `components/cultivars/cultivar-list.tsx` — lista completa con filtros
- `components/cultivars/cultivar-card.tsx` — card individual
- `components/cultivars/cultivar-create-modal.tsx` — modal de creacion
- `components/cultivars/crop-type-filter.tsx` — dropdown de tipo de cultivo
- Query: `api.cultivars.list` (con companyId, cropTypeId, status)
- Query: `api.crops.getCropTypes`
- Mutation: `api.cultivars.create`, `api.cultivars.remove`
