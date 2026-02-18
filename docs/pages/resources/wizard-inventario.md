# Wizard de Ajuste de Inventario

Wizard para ajustar cantidades de inventario existente. Cada ajuste se registra como actividad para mantener la trazabilidad completa del sistema.

## Acceso

Se abre como Sheet lateral (panel derecho) desde:
- Tab de Inventario del detalle de producto (boton "Ajustar inventario" en un item)
- Cualquier vista donde se muestre un item de inventario

## Contexto de entrada

El wizard recibe:
- `inventoryItemId`: el item de inventario a ajustar
- Pre-carga: producto, area, lote, cantidad actual

## Paso 1 — Seleccion de movimiento

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| Tipo de ajuste | Selector | Si | Ajuste (correccion de conteo), Merma (perdida/desperdicio), Correccion (error de registro) |
| Direccion | Automatico | — | Entrada (+) o Salida (-), segun tipo |

- **Ajuste**: puede ser positivo o negativo (correccion de conteo fisico)
- **Merma**: siempre negativo (producto perdido, danado, vencido)
- **Correccion**: puede ser positivo o negativo (error de registro previo)

## Paso 2 — Cantidad y detalles

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| Cantidad actual | Texto (readonly) | — | Muestra cantidad_available actual del item |
| Cantidad de ajuste | Input numerico | Si | Cuanto se ajusta (positivo o negativo segun tipo) |
| Cantidad resultante | Texto (readonly) | — | Calculo automatico: actual + ajuste |
| Razon | Textarea | Si | Motivo del ajuste (obligatorio para trazabilidad) |
| Notas | Textarea | No | Notas adicionales |

### Validaciones

- Cantidad resultante no puede ser negativa
- Razon es obligatoria (minimo 10 caracteres)
- Cantidad de ajuste no puede ser 0

### Preview visual

- Muestra un resumen tipo "antes → despues" con la cantidad actual y la resultante
- Indicador de color: verde si aumenta, rojo si disminuye

## Paso 3 — Confirmacion

Resumen del movimiento antes de ejecutar:
- Producto y lote afectado
- Area de almacenamiento
- Tipo de ajuste
- Cantidad: [actual] → [resultante] (diferencia: ±N)
- Razon del ajuste
- Responsable (usuario actual)
- Fecha y hora

Botones: "Cancelar" y "Confirmar ajuste" (amber-500)

## Registro como actividad

Al confirmar, el sistema:
1. Actualiza la cantidad del item de inventario
2. Crea un registro de actividad (via el sistema de actividades existente) con:
   - Tipo: ajuste de inventario
   - Entidad: el item de inventario
   - Recursos: el producto ajustado con cantidad y direccion
   - Metadata: tipo de ajuste, razon, cantidades antes/despues
3. Crea un registro en inventory_transactions con:
   - transaction_type: adjustment / waste / correction (segun tipo)
   - quantity_change, quantity_before, quantity_after
   - reason, performed_by, performed_at

Esto garantiza que todo movimiento de inventario queda en la cadena de trazabilidad del sistema de actividades.

## Confirmacion

Toast de exito con resumen del ajuste. Cierre automatico del sheet. El listado de inventario se actualiza en tiempo real (Convex reactivo).

## Componentes

- Sheet lateral reutilizable (nuevo componente)
- Query: `api.inventory.getById` (datos del item)
- Mutation: registro via sistema de actividades + `inventory_transactions`
