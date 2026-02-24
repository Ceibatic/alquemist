# Onboarding Checklist — Configuracion Inicial

## Vista General

Checklist que guia al usuario en la configuracion inicial de su instalacion. Aparece en ambos dashboards (admin y operativo) cuando la instalacion es nueva o la configuracion esta incompleta.

## Condicion de Visibilidad

Se muestra cuando:
- `isNewInstallation === true` (areas.total === 0 && cultivars.total === 0 && inventory.total === 0)
- O `completionPercentage < 100`

Se oculta cuando los 4 pasos estan completados (completion = 100%).

## Elementos

Card con barra de progreso en la parte superior y porcentaje de completado.

### Pasos del Checklist

| # | Paso | Icono | Descripcion | Boton | Destino | Obligatorio |
|---|------|-------|-------------|-------|---------|-------------|
| 1 | Crear tu primera Area de cultivo | MapPin | Define las zonas de produccion de tu instalacion | Crear Area | `/dashboard/areas` | Si |
| 2 | Agregar Cultivares | Sprout | Registra las variedades que vas a cultivar | Configurar | `/dashboard/cultivars` | Si |
| 3 | Registrar Proveedores | Factory | Anade tus proveedores de semillas e insumos | Configurar | `/dashboard/suppliers` | No (opcional) |
| 4 | Configurar Inventario | Package | Registra tus productos e insumos disponibles | Configurar | `/dashboard/inventory` | No (opcional) |

### Estados Visuales

| Estado | Background | Icono |
|--------|-----------|-------|
| Completado | green-50 | Checkmark verde |
| Pendiente | white | Circulo vacio |
| Hover (pendiente) | gray-50 | — |

### Mensaje de Completado

Cuando todos los pasos estan completos: caja verde con "Configuracion completada! Ya puedes comenzar a crear ordenes de produccion".

## Data Source

| Query | Datos |
|-------|-------|
| `dashboard.getMetrics({ facilityId })` | areas, cultivars, inventory (para isNewInstallation) |
| `dashboard.getOnboardingStatus({ facilityId, companyId })` | areasConfigured, cultivarsLinked, suppliersAdded, inventorySetup, completionPercentage |

## Componentes

| Componente | Archivo |
|-----------|---------|
| OnboardingChecklist | `components/dashboard/onboarding-checklist.tsx` |
