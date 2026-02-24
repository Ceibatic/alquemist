# Dashboard — Vista General

## URL

`/dashboard` — pagina unica sin tabs ni sub-rutas.

## Estructura

Pagina con rendering condicional por rol del usuario:

| Rol | Componente | Enfoque |
|-----|-----------|---------|
| Administrativo | `AdminDashboard` | Vision global: KPIs, produccion, calidad, alertas, tendencias |
| Operativo | `OperativeDashboard` | Trabajo diario: tareas, lotes asignados, proximas actividades |

El rol se detecta via `useHomeDashboard()` que llama a `home.getUserRoleType`.

## Elementos Comunes (ambos roles)

| Elemento | Descripcion | Condicion |
|----------|-------------|-----------|
| Greeting | Saludo temporal ("Buenos dias/tardes/noches, {nombre}") | Siempre |
| Trial Banner | Alerta de dias restantes de prueba con CTA a suscripcion | Solo plan trial |
| Onboarding Checklist | Checklist de configuracion inicial con 4 pasos | Instalacion nueva o incompleta |

Ver [onboarding-checklist.md](./onboarding-checklist.md) para detalle del checklist.

## Deep Linking

No aplica — pagina unica sin tabs ni parametros URL.

## Sidebar

Una sola entrada "Dashboard" apunta a `/dashboard`.

## Vistas por Rol

Ver [vista-admin.md](./vista-admin.md) para el dashboard administrativo.
Ver [vista-operativo.md](./vista-operativo.md) para el dashboard operativo.
Ver [widget-actividades.md](./widget-actividades.md) para el widget de actividades del dia (ambos roles).

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/dashboard/page.tsx` | Pagina principal con rendering por rol |
| `components/home/admin-dashboard.tsx` | Layout completo del dashboard admin |
| `components/home/operative-dashboard.tsx` | Layout completo del dashboard operativo |
| `components/home/trend-charts.tsx` | Graficos de tendencias 14 dias (solo admin) |
| `components/dashboard/onboarding-checklist.tsx` | Checklist de configuracion inicial |
| `components/dashboard/today-activities-widget.tsx` | Widget actividades con variantes compact/full |
| `components/dashboard/dashboard-loading.tsx` | Skeleton de carga |
| `components/dashboard/dashboard-error.tsx` | Estado de error |
| `components/subscription/trial-banner.tsx` | Banner de prueba gratuita |
| `hooks/use-home-dashboard.ts` | Hook: deteccion de rol + query consolidada |
| `hooks/use-dashboard.ts` | Hook: metricas y onboarding status |
| `convex/home.ts` | Backend: getDashboard, getUserRoleType, getDashboardTrends |
| `convex/dashboard.ts` | Backend: getMetrics, getOnboardingStatus |
