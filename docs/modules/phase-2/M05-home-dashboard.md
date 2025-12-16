# Module 05: Home Dashboard

## Overview

El modulo de Home Dashboard proporciona una vista personalizada segun el rol del usuario. Distingue entre usuarios administrativos (propietarios, gerentes) y usuarios operativos (operadores de campo), mostrando informacion relevante para cada tipo de rol.

**Estado**: ✅ Implementado (Backend + Frontend)

---

## Arquitectura de Optimizacion

### Estrategia de Consumo de Datos

El modulo fue disenado con optimizacion de consumo como prioridad:

1. **Query Consolidada**: Una sola query (`home.getDashboard`) obtiene todos los datos necesarios
2. **Deteccion Automatica de Rol**: El backend determina el tipo de dashboard a retornar
3. **Datos Contextuales**: Solo se calculan metricas relevantes al rol del usuario
4. **Skip Pattern**: Evita queries cuando faltan parametros requeridos
5. **Indexes Optimizados**: Usa indices existentes de Convex

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE DATOS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Usuario → useHomeDashboard() → home.getDashboard()        │
│                                    │                         │
│                                    ▼                         │
│                            ┌───────────────┐                 │
│                            │ Detectar Rol  │                 │
│                            └───────────────┘                 │
│                                    │                         │
│                    ┌───────────────┴───────────────┐        │
│                    ▼                               ▼        │
│           ┌─────────────────┐             ┌─────────────────┐│
│           │  ADMINISTRATIVO │             │    OPERATIVO    ││
│           │  - KPIs         │             │  - Tareas dia   ││
│           │  - Produccion   │             │  - Mis lotes    ││
│           │  - Calidad      │             │  - Actividades  ││
│           │  - Alertas      │             │  - Quick Stats  ││
│           └─────────────────┘             └─────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementacion Actual

### Backend (Convex)

**Archivo**: `convex/home.ts`

#### Queries Implementadas

| Funcion | Descripcion | Optimizacion |
|---------|-------------|--------------|
| `getDashboard` | Query principal consolidada | Una sola llamada, datos por rol |
| `getAlertCount` | Contador de alertas para badge | Lightweight, solo conteo |
| `getUserRoleType` | Tipo de rol del usuario | Cache-friendly, estatico |

#### Logica de Deteccion de Rol

```typescript
// Roles Administrativos (level >= 500)
const adminRoles = ["COMPANY_OWNER", "FACILITY_MANAGER", "MANAGER", "ADMIN"];

// Roles Operativos (level < 500)
// Cualquier otro rol: OPERATOR, TECHNICIAN, etc.
```

### Frontend

**Archivos**:
- `hooks/use-home-dashboard.ts` - Hook principal con type guards
- `components/home/admin-dashboard.tsx` - Dashboard administrativo
- `components/home/operative-dashboard.tsx` - Dashboard operativo
- `app/(dashboard)/dashboard/page.tsx` - Pagina principal

---

## Dashboard Administrativo

### Metricas de Overview

| Metrica | Descripcion | Link |
|---------|-------------|------|
| Ordenes Activas | Produccion en curso | `/production-orders` |
| Plantas Totales | Total plantas en produccion | - |
| Lotes Activos | Batches con status "active" | `/batches` |
| Areas en Uso | Areas con lotes asignados | `/areas` |
| Avance Promedio | % promedio de ordenes activas | - |

### Seccion de Produccion

- **En Progreso**: Ordenes con status "active"
- **Pendientes**: Ordenes en "planning" o "pending_approval"
- **Completadas**: Ordenes finalizadas

### Metricas de Calidad

| Metrica | Calculo | Umbral |
|---------|---------|--------|
| Tasa de Mortalidad | `(initial - active) / initial * 100` | <5% verde, 5-15% amarillo, >15% rojo |
| Lotes Saludables | Mortalidad < 5% | - |
| Lotes en Riesgo | Mortalidad 5-15% | - |

### Sistema de Alertas

| Tipo | Severidad | Condicion |
|------|-----------|-----------|
| `license_expired` | Critical | Licencia vencida |
| `license_expiry` | Warning/Critical | Vence en <= 30 dias |
| `configuration_incomplete` | Warning | Sin areas configuradas |
| `quality_alert` | Warning | Lotes con mortalidad > 15% |
| `production_alert` | Warning | Ordenes sin actividad 7+ dias |
| `inventory_alert` | Warning | Productos con stock bajo |

### Ordenes Recientes

Lista de las ultimas 5 ordenes con:
- Numero de orden
- Estado (badge con color)
- Cultivar
- Progreso (barra)

---

## Dashboard Operativo

### Resumen del Dia

| Metrica | Descripcion |
|---------|-------------|
| Tareas Pendientes | Activities programadas para hoy |
| Completadas Hoy | Activities terminadas hoy |
| Atrasadas | Activities con fecha pasada |
| Lotes Asignados | Batches en areas accesibles |

### Progreso Visual

Circulo de progreso mostrando:
- Porcentaje completado
- Tareas completadas vs total

### Proximas Actividades

Lista de actividades programadas (7 dias):
- Tipo de actividad
- Fecha/hora programada
- Codigo de lote asociado
- Prioridad (badge si urgente)

### Mis Lotes

Cards de lotes asignados con:
- Codigo de lote
- Cultivar
- Plantas activas
- Dias en produccion
- Area

### Acciones Rapidas

| Accion | Link | Badge |
|--------|------|-------|
| Iniciar Actividad | `/activities/new` | - |
| Control de Calidad | `/quality-checks` | Pendientes |
| Ver Lotes | `/batches` | - |
| Calendario | `/activities` | - |

---

## User Stories

### US-05.1: Ver dashboard segun rol
**Como** usuario del sistema
**Quiero** ver un dashboard personalizado segun mi rol
**Para** acceder rapidamente a la informacion relevante para mi trabajo

**Criterios de Aceptacion**:
- [x] Usuarios administrativos ven KPIs, produccion, calidad, alertas
- [x] Usuarios operativos ven tareas, lotes asignados, actividades
- [x] El sistema detecta automaticamente el tipo de rol

### US-05.2: Ver alertas criticas
**Como** administrador
**Quiero** ver alertas de licencia, stock bajo y problemas de calidad
**Para** tomar accion inmediata en temas criticos

**Criterios de Aceptacion**:
- [x] Alertas ordenadas por severidad (criticas primero)
- [x] Link directo a la accion requerida
- [x] Diferenciacion visual por tipo de alerta

### US-05.3: Ver tareas del dia
**Como** operador de campo
**Quiero** ver mis tareas pendientes y completadas del dia
**Para** organizar mi trabajo diario

**Criterios de Aceptacion**:
- [x] Conteo de tareas pendientes, completadas, atrasadas
- [x] Lista de proximas actividades con fecha/hora
- [x] Acceso rapido a iniciar actividades

### US-05.4: Ver mis lotes asignados
**Como** operador de campo
**Quiero** ver los lotes en las areas a las que tengo acceso
**Para** monitorear el estado de las plantas a mi cargo

**Criterios de Aceptacion**:
- [x] Lista de lotes con informacion clave
- [x] Navegacion directa a detalle de lote
- [x] Filtrado por areas accesibles

---

## Configuracion de Roles

### Tabla de Roles y Dashboards

| Rol | Nivel | Tipo Dashboard | Acceso |
|-----|-------|----------------|--------|
| COMPANY_OWNER | 1000 | Administrativo | Todas las instalaciones |
| FACILITY_MANAGER | 800 | Administrativo | Instalaciones asignadas |
| MANAGER | 600 | Administrativo | Areas asignadas |
| ADMIN | 500 | Administrativo | Segun permisos |
| OPERATOR | 200 | Operativo | Areas asignadas |
| TECHNICIAN | 100 | Operativo | Areas asignadas |

---

## API Reference

### getDashboard

```typescript
// Query: home.getDashboard
// Args:
{
  userId: Id<"users">,
  facilityId?: Id<"facilities">  // Opcional, usa primary si no se provee
}

// Returns (Administrative):
{
  roleType: "administrative",
  overview: { activeOrders, totalPlants, activeBatches, areasInUse, totalAreas },
  production: { ordersInProgress, ordersCompleted, ordersPending, averageCompletion },
  quality: { mortalityRate, healthyBatches, warningBatches },
  alerts: [{ id, type, severity, message, actionUrl }],
  recentOrders: [{ id, orderNumber, status, cultivarName, progress, createdAt }]
}

// Returns (Operative):
{
  roleType: "operative",
  todaysTasks: { pending, completed, overdue },
  myBatches: [{ id, batchCode, cultivarName, areaName, plantsActive, daysInProduction, status }],
  upcomingActivities: [{ id, activityType, batchCode, scheduledDate, status, priority }],
  recentCompletedActivities: [{ id, activityType, completedAt, batchCode }],
  quickStats: { activeBatchesAssigned, tasksCompletedToday, pendingQualityChecks }
}
```

### getAlertCount

```typescript
// Query: home.getAlertCount
// Args:
{
  facilityId: Id<"facilities">
}

// Returns:
{
  total: number,
  critical: number
}
```

### getUserRoleType

```typescript
// Query: home.getUserRoleType
// Args:
{
  userId: Id<"users">
}

// Returns:
{
  roleType: "administrative" | "operative",
  roleName: string,
  roleDisplayName: string
} | null
```

---

## Hooks de Frontend

### useHomeDashboard

```typescript
import { useHomeDashboard, isAdminDashboard, isOperativeDashboard } from '@/hooks/use-home-dashboard';

// Uso:
const { data, roleInfo, isLoading, isAdmin, isOperative } = useHomeDashboard({
  userId,
  facilityId
});

// Type guards:
if (isAdminDashboard(data)) {
  // data tiene tipo AdminDashboardData
}
if (isOperativeDashboard(data)) {
  // data tiene tipo OperativeDashboardData
}
```

### useAlertCount

```typescript
import { useAlertCount } from '@/hooks/use-home-dashboard';

// Uso (para badge en header):
const { total, critical, isLoading } = useAlertCount(facilityId);
```

---

## Proximos Pasos

### Fase Actual
- [x] Dashboard administrativo basico
- [x] Dashboard operativo basico
- [x] Sistema de alertas
- [x] Deteccion automatica de rol

### Mejoras Futuras
- [ ] Graficos de tendencia (produccion, calidad)
- [ ] Widget de clima/ambiente
- [ ] Notificaciones push
- [ ] Personalizacion de widgets
- [ ] Dashboard para rol TECHNICIAN especializado

---

**Ultima actualizacion**: Diciembre 2024
