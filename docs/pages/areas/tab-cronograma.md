# Tab Cronograma

Cuarto tab de `/areas/[id]`. Muestra un calendario/timeline de las actividades programadas para esta area.

## Contenido

Reutiliza el componente `ActivitySchedule` del modulo de Actividades con scope de area:

```tsx
<ActivitySchedule scope={{ type: 'area', areaId }} compact />
```

El componente muestra actividades programadas en formato calendario con vista compacta.

## Componentes

- `components/activities/activity-schedule.tsx` — componente compartido del modulo Actividades
- Scope: `{ type: 'area', areaId }` — filtra solo actividades de esta area
