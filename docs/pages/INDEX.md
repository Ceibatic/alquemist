# Indice de Paginas — Alquemist

Consultar este archivo primero para localizar documentacion de cualquier pagina, tab, modal o wizard de la app.

---

## Dashboard

- **Ruta:** `/dashboard` | **Sidebar:** "Dashboard"
- **Navegacion:** Pagina unica, sin tabs. Renderizado condicional por rol.

| Archivo | Contenido |
|---------|-----------|
| [README.md](dashboard/README.md) | Vista general, layout, archivos clave |
| [vista-admin.md](dashboard/vista-admin.md) | Dashboard admin: KPIs globales, produccion, calidad, alertas, tendencias |
| [vista-operativo.md](dashboard/vista-operativo.md) | Dashboard operativo: tareas diarias, batches asignados, proximas actividades |
| [widget-actividades.md](dashboard/widget-actividades.md) | Widget de actividades del dia (variantes compact/full) |
| [onboarding-checklist.md](dashboard/onboarding-checklist.md) | Checklist de configuracion inicial para empresas nuevas |

**Componentes:** `components/home/admin-dashboard.tsx`, `components/home/operative-dashboard.tsx`, `components/home/trend-charts.tsx`, `components/dashboard/onboarding-checklist.tsx`, `components/dashboard/today-activities-widget.tsx`

**Backend:** `convex/home.ts` (getDashboard, getUserRoleType, getDashboardTrends), `convex/dashboard.ts` (getMetrics, getOnboardingStatus)

---

## Facilities

- **Ruta:** `/facilities` | **Sidebar:** "Instalaciones"
- **Navegacion:** Listado → Detalle con 5 tabs (General, Ubicacion, Licencia, Areas, Utilities)

| Archivo | Contenido |
|---------|-----------|
| [README.md](facilities/README.md) | Vista general, rutas, archivos clave |
| [listado.md](facilities/listado.md) | Grid de cards con filtros, indicador de limite de plan |
| [modal-crear.md](facilities/modal-crear.md) | Modal de creacion con validacion de limite de plan |
| [subpaginas.md](facilities/subpaginas.md) | Detalle con 5 tabs read-only, pagina de edicion |
| [utilities.md](facilities/utilities.md) | Tabla de lecturas de utilities, modal de registro, prorrateo |

**Sub-rutas:**
- `/facilities/[id]` — Detalle con 5 tabs
- `/facilities/[id]/edit` — Formulario de edicion (5 secciones)

**Componentes:** `components/facilities/facility-list.tsx`, `components/facilities/facility-card.tsx`, `components/facilities/facility-form.tsx`, `components/facilities/facility-create-modal.tsx`, `components/facilities/utility-readings-table.tsx`, `components/facilities/utility-reading-modal.tsx`

**Backend:** `convex/facilities.ts`, `convex/utilities.ts`

---

## Areas

- **Ruta:** `/areas` | **Sidebar:** "Areas"
- **Navegacion:** Listado → Detalle con 5 tabs (Produccion, Inventario, Historial, Cronograma, Detalle)

| Archivo | Contenido |
|---------|-----------|
| [README.md](areas/README.md) | Vista general, rutas, archivos clave |
| [listado.md](areas/listado.md) | Grid de cards con stats compactos y filtros |
| [modal-crear-area.md](areas/modal-crear-area.md) | Modal de creacion de area |
| [tab-produccion.md](areas/tab-produccion.md) | Tab produccion: phase cards con batches y ocupacion |
| [tab-inventario.md](areas/tab-inventario.md) | Tab inventario del area |
| [tab-historial.md](areas/tab-historial.md) | Tab historial: tabla de actividades ejecutadas |
| [tab-cronograma.md](areas/tab-cronograma.md) | Tab cronograma: calendario de actividades programadas |
| [tab-detalle.md](areas/tab-detalle.md) | Tab detalle: info general, capacidad, configuracion |
| [estructuras.md](areas/estructuras.md) | Gestion de estructuras (mesas, racks, etc.) con capacidad calculada |
| [subpaginas.md](areas/subpaginas.md) | Detalle de fase, detalle de actividad, edicion |

**Sub-rutas:**
- `/areas/[id]` — Detalle con 5 tabs
- `/areas/[id]/edit` — Formulario de edicion
- `/areas/[id]/phases/[phase]` — Detalle de fase con stats y tabla de actividades
- `/areas/[id]/activities/[actId]` — Detalle de actividad con 4 tabs (Esencial, Recursos, Fotos, Documentos)

**Componentes:** `components/areas/area-list.tsx`, `components/areas/area-card.tsx`, `components/areas/area-form.tsx`, `components/areas/area-create-modal.tsx`, `components/areas/area-production-tab.tsx`, `components/areas/area-inventory-tab.tsx`, `components/areas/area-history-tab.tsx`, `components/areas/area-structures-tab.tsx`, `components/areas/phase-card.tsx`, `components/areas/structure-card.tsx`, `components/areas/structure-form.tsx`

**Backend:** `convex/areas.ts`, `convex/structures.ts`

---

## Cultivars

- **Ruta:** `/cultivars` | **Sidebar:** "Cultivares"
- **Navegacion:** Listado → Detalle (info, cannabinoides, metricas)

| Archivo | Contenido |
|---------|-----------|
| [README.md](cultivars/README.md) | Vista general, rutas, archivos clave |
| [listado.md](cultivars/listado.md) | Grid de cards con filtros por tipo de cultivo, busqueda, toggle vista |
| [modal-crear-cultivar.md](cultivars/modal-crear-cultivar.md) | Modal de creacion + link system cultivars modal |
| [subpaginas.md](cultivars/subpaginas.md) | Detalle y edicion de cultivar |

**Sub-rutas:**
- `/cultivars/[id]` — Detalle (info, cannabinoides, metricas)
- `/cultivars/[id]/edit` — Formulario de edicion

**Componentes:** `components/cultivars/cultivar-list.tsx`, `components/cultivars/cultivar-card.tsx`, `components/cultivars/cultivar-form.tsx`, `components/cultivars/cultivar-create-modal.tsx`, `components/cultivars/cannabinoid-range-input.tsx`, `components/cultivars/link-cultivars-modal.tsx`

**Backend:** `convex/cultivars.ts`, `convex/crops.ts`

---

## Batches (Lotes)

- **Ruta:** `/batches/[id]` | **Acceso:** Desde ordenes, actividades, dashboard
- **Navegacion:** Detalle con 5 tabs (Detalle, Programadas, Actividades, Analytics, Trazabilidad)

| Archivo | Contenido |
|---------|-----------|
| [README.md](batches/README.md) | Vista general, tabs, header, modales, archivos clave |
| [trazabilidad.md](batches/trazabilidad.md) | Tab trazabilidad: origen, timeline, genealogia, outputs |

**Sub-rutas:**
- `/batches/[id]` — Detalle con 5 tabs, split/merge modals, badge producto actual

**Componentes:** `components/batches/batch-stats-bar.tsx`, `components/batches/batch-activities-table.tsx`, `components/batches/batch-analytics-tab.tsx`, `components/batches/batch-traceability-view.tsx`, `components/batches/split-batch-modal.tsx`, `components/batches/merge-batch-modal.tsx`

**Backend:** `convex/batches.ts` (getById, getBatchTraceability, splitBatch, mergeBatch)

---

## Production

- **Ruta:** `/production?tab=actividades|ordenes|analiticas` | **Sidebar:** "Produccion"
- **Navegacion:** 3 tabs con deep linking via URL. Actividades es default.

| Archivo | Contenido |
|---------|-----------|
| [README.md](production/README.md) | Vista general, tabs, rutas, archivos clave |
| [tab-actividades.md](production/tab-actividades.md) | Calendario de actividades programadas (dia/semana/mes), wizards de creacion/edicion/reporte |
| [tab-ordenes.md](production/tab-ordenes.md) | Listado de ordenes de produccion, wizard de creacion, detalle con fases |
| [subpaginas.md](production/subpaginas.md) | Detalle de actividad, wizard de reporte, detalle de orden, detalle de fase |

**Sub-rutas:**
- `/production/activities/new` — Wizard nueva actividad (4 pasos)
- `/production/activities/[id]` — Detalle de actividad
- `/production/activities/[id]/edit` — Wizard de edicion
- `/production/activities/[id]/report` — Wizard de reporte/ejecucion (1-4 pasos dinamicos, incluye transformacion)
- `/production/orders/new` — Wizard creacion de orden (2 pasos, con yield cascade y entry/exit phase)
- `/production/orders/[id]` — Detalle de orden (info + fases + timeline)
- `/production/orders/[id]/phases/[phaseId]` — Detalle de fase con cronograma diario

**Componentes:** `components/production/activities-tab.tsx`, `components/production/activity-calendar.tsx`, `components/production/calendar-toolbar.tsx`, `components/production/calendar-week-view.tsx`, `components/production/calendar-day-view.tsx`, `components/production/calendar-month-view.tsx`, `components/production/calendar-activity-pill.tsx`, `components/production/schedule-activity-wizard.tsx`, `components/production/edit-activity-wizard.tsx`, `components/production/report-activity-wizard.tsx`, `components/production/report-step-execution.tsx`, `components/production/transformation-outputs-form.tsx`, `components/production/orders-tab.tsx`, `components/production/production-analytics.tsx`, `components/production-orders/production-order-list.tsx`, `components/production-orders/production-order-card.tsx`, `components/production-orders/order-create-wizard.tsx`, `components/production-orders/order-wizard-step-phases.tsx`, `components/production-orders/yield-cascade-preview.tsx`

**Backend:** `convex/scheduledActivities.ts`, `convex/productionOrders.ts`, `convex/orderPhases.ts`, `convex/activities.ts`, `convex/phaseProductFlows.ts`

---

## Resources

- **Ruta:** `/resources?tab=products|suppliers` | **Sidebar:** "Recursos"
- **Navegacion:** 2 tabs con deep linking. Products es default.

| Archivo | Contenido |
|---------|-----------|
| [README.md](resources/README.md) | Vista general, tabs, rutas, archivos clave |
| [tab-productos.md](resources/tab-productos.md) | Catalogo de productos con CRUD completo |
| [tab-proveedores.md](resources/tab-proveedores.md) | Listado de proveedores con CRUD |
| [detalle-producto.md](resources/detalle-producto.md) | Detalle de producto con sub-tabs (Info, Inventario, Calidad) |
| [wizard-inventario.md](resources/wizard-inventario.md) | Wizard de registro de inventario |
| [subpaginas.md](resources/subpaginas.md) | Sub-rutas de productos y proveedores |

**Sub-rutas:**
- `/resources/products/[id]` — Detalle con sub-tabs (Info, Inventario, Calidad)
- `/resources/products/[id]/edit` — Edicion de producto
- `/resources/products/new` — Creacion de producto
- `/resources/suppliers/[id]` — Detalle de proveedor
- `/resources/suppliers/[id]/edit` — Edicion de proveedor
- `/resources/suppliers/new` — Creacion de proveedor

**Redirects:** `/products` → `/resources`, `/suppliers` → `/resources?tab=suppliers`, `/inventory` eliminado

**Componentes:** `components/products/product-list.tsx`, `components/suppliers/supplier-list.tsx`

**Backend:** `convex/products.ts`, `convex/suppliers.ts`, `convex/inventory.ts`

---

## Templates

- **Ruta:** `/templates?tab=production|activities|quality` | **Sidebar:** "Templates"
- **Navegacion:** 3 tabs con deep linking. Production es default.

| Archivo | Contenido |
|---------|-----------|
| [README.md](templates/README.md) | Vista general, tabs, rutas, archivos clave |
| [tab-produccion.md](templates/tab-produccion.md) | Templates de produccion con fases y actividades |
| [tab-actividades.md](templates/tab-actividades.md) | Templates de actividades estandarizadas |
| [tab-calidad.md](templates/tab-calidad.md) | Templates de control de calidad / inspecciones |
| [wizard-actividades.md](templates/wizard-actividades.md) | Wizard de creacion/edicion de template de actividad |
| [subpaginas.md](templates/subpaginas.md) | Detalle de template, detalle de fase, wizards |

**Sub-rutas:**
- `/templates/new` — Wizard de creacion (2 pasos)
- `/templates/[id]` — Detalle de template (info + fases)
- `/templates/[id]/edit` — Edicion de template
- `/templates/[id]/phases/[phaseId]` — Detalle de fase con cronograma diario
- `/activity-templates/[id]` — Wizard de template de actividad
- `/activity-templates/new` — Nuevo template de actividad
- `/quality-checks/templates/[id]` — Detalle de template QC
- `/quality-checks/inspections/[id]` — Detalle de inspeccion ejecutada

**Redirects:** `/activity-templates` → `/templates?tab=activities`, `/quality-checks` → `/templates?tab=quality`

**Componentes:** `components/templates/template-list.tsx`, `components/templates/template-create-wizard.tsx`, `components/templates/phase-detail-view.tsx`, `components/templates/add-activity-dialog.tsx`, `components/activity-templates/activity-template-list.tsx`, `components/quality-checks/quality-template-list.tsx`

**Backend:** `convex/productionTemplates.ts`, `convex/templatePhases.ts`, `convex/templateActivities.ts`, `convex/activityTemplates.ts`, `convex/qualityCheckTemplates.ts`

---

## Users

- **Ruta:** `/users` | **Sidebar:** "Usuarios"
- **Navegacion:** 2 tabs internos (sin reflejo en URL): Usuarios Activos, Invitaciones Pendientes

| Archivo | Contenido |
|---------|-----------|
| [README.md](users/README.md) | Vista general, tabs, stats, archivos clave |
| [tab-usuarios.md](users/tab-usuarios.md) | Tabla de usuarios activos con filtros por rol y busqueda |
| [tab-invitaciones.md](users/tab-invitaciones.md) | Cards de invitaciones pendientes con reenvio/cancelacion |
| [modal-invitar.md](users/modal-invitar.md) | Modal de invitacion con formulario completo |
| [modal-editar-rol.md](users/modal-editar-rol.md) | Modal de edicion de rol con acceso a instalaciones |
| [subpaginas.md](users/subpaginas.md) | Perfil de usuario con 3 cards de info |

**Sub-rutas:**
- `/users/[id]` — Perfil de usuario (info personal, rol, actividad)

**Componentes:** `components/users/user-row.tsx`, `components/users/invite-user-modal.tsx`, `components/users/edit-user-role-modal.tsx`, `components/users/role-selector.tsx`, `components/users/facility-access-select.tsx`

**Backend:** `convex/users.ts`, `convex/invitations.ts`, `convex/roles.ts`

---

## Settings

- **Ruta:** `/settings` | **Sidebar:** "Configuracion"
- **Navegacion:** Hub con cards de navegacion → subpaginas independientes

| Archivo | Contenido |
|---------|-----------|
| [README.md](settings/README.md) | Vista general, hub layout, archivos clave |
| [tab-general.md](settings/tab-general.md) | Config general de la instalacion (nombre, tipo, etc.) |
| [tab-ubicacion.md](settings/tab-ubicacion.md) | Ubicacion de la instalacion (direccion, coordenadas) |
| [tab-licencias.md](settings/tab-licencias.md) | Licencias de la instalacion |
| [tab-perfil.md](settings/tab-perfil.md) | Perfil de usuario (nombre, email, avatar) |
| [tab-preferencias.md](settings/tab-preferencias.md) | Preferencias (tema, instalacion por defecto) |
| [tab-seguridad.md](settings/tab-seguridad.md) | Cambio de contrasena |
| [suscripcion.md](settings/suscripcion.md) | Plan actual y planes disponibles (read-only) |
| [subpaginas.md](settings/subpaginas.md) | Mapa de sub-rutas del hub |

**Sub-rutas:**
- `/settings/facility` — Config de instalacion (tabs: General, Ubicacion, Licencias)
- `/settings/account` — Cuenta de usuario (tabs: Perfil, Preferencias, Seguridad)
- `/settings/subscription` — Suscripcion y planes
- `/settings/activity-types` — Gestion de tipos de actividad (CRUD, acceso directo por URL)

**Componentes:** `components/settings/facility-settings-tabs.tsx`, `components/settings/account-settings-tabs.tsx`, `components/settings/general-info-form.tsx`, `components/settings/location-form.tsx`, `components/settings/license-form.tsx`, `components/settings/profile-form.tsx`, `components/settings/preferences-form.tsx`, `components/settings/security-form.tsx`

**Backend:** `convex/facilities.ts`, `convex/users.ts`, `convex/subscription.ts`
