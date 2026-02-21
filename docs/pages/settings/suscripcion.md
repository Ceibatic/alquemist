# Suscripcion

Pagina read-only en `/settings/subscription`. Muestra el plan actual y los planes disponibles.

## Plan Actual

Card con icono Sparkles (amber-500) que muestra:
- Nombre del plan con badge de dias restantes (si es trial)
- Mensaje contextual segun tipo de plan
- Contadores: instalaciones usadas/max, usuarios usados/max (con iconos Building2 y Users)

## Planes Disponibles

Grid `md:grid-cols-2 lg:grid-cols-4` con 4 planes:

| Plan | Precio | Instalaciones | Usuarios | Estado |
|------|--------|:-------------:|:--------:|--------|
| Prueba Gratuita | Gratis / 30 dias | 1 | 3 | Funcional |
| Inicial | $X/mes | 5 | 10 | Proximamente (disabled) |
| Profesional | $Y/mes | 20 | 50 | Proximamente (disabled) |
| Empresarial | Contactar | Ilimitadas | Ilimitados | Proximamente (disabled) |

El plan "Inicial" tiene borde `amber-500` y badge "Recomendado". El plan actual se muestra con fondo `bg-muted/50` y boton "Plan Actual" (disabled).

Cada card muestra: limites (instalaciones, usuarios), lista de features con check verde, y boton CTA.

## Notice

Card informativa al final: "Los planes pagos estaran disponibles pronto. Por ahora, disfruta de todas las funciones durante tu periodo de prueba gratuita."

## Componentes

- Pagina inline sin componentes extraidos
- Query: `api.subscription.getStatus`
- Planes definidos como constante `PLANS` en el archivo

**Ruta**: `app/(dashboard)/settings/subscription/page.tsx`
