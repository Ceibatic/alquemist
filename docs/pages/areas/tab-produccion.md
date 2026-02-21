# Tab Produccion

Tab default de `/areas/[id]`. Muestra la produccion activa agrupada por fase de cultivo.

## Listado

Grid de cards (`md:grid-cols-2 lg:grid-cols-3`) con una `PhaseCard` por cada fase activa en el area.

Cada card muestra:
- Badge de fase con color (segun `getPhaseColors`)
- Stats: count de lotes, total plantas, dias promedio en fase
- Lista de lotes en la fase: codigo (monospace), cultivar, cantidad de plantas

## Acciones

| Accion | Descripcion |
|--------|-------------|
| Click card | Navega a `/areas/[id]/phases/[phase]` (detalle de fase) |

## Estado Vacio

Icono Layers, titulo "Sin produccion activa", mensaje "No hay lotes activos en esta area. Los lotes agrupados por fase apareceran aqui."

## Componentes

- `components/areas/area-production-tab.tsx` — tab principal
- `components/areas/phase-card.tsx` — card individual de fase
- Query: `api.batches.listByAreaGroupedByPhase`

## Flujo de navegacion

```
/areas/[id]                      → Tab produccion con phase cards
/areas/[id]/phases/[phase]       → Detalle de fase con tabla de actividades
/areas/[id]/activities/[actId]   → Detalle de actividad
```
