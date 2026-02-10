'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Truck,
  Minus,
  RotateCcw,
  Trash2,
  ArrowRightLeft,
  Undo2,
  User,
  Calendar,
  Package,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface InventoryActivityHistoryProps {
  inventoryItemId?: string;
  productId?: string;
  limit?: number;
  showTitle?: boolean;
}

interface ActivityMetadata {
  movement_type?: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
  quantity_unit?: string;
  quantity_change?: number;
  batch_number?: string;
  reason?: string;
  lot_selection_mode?: string;
  source_inventory_id?: string;
  destination_inventory_id?: string;
}

const MOVEMENT_CONFIG: Record<
  string,
  {
    icon: typeof Truck;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  inventory_receipt: {
    icon: Truck,
    label: 'Entrada',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  inventory_consumption: {
    icon: Minus,
    label: 'Consumo',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  inventory_correction: {
    icon: RotateCcw,
    label: 'Correccion',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
  },
  inventory_waste: {
    icon: Trash2,
    label: 'Desperdicio',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  inventory_transfer: {
    icon: ArrowRightLeft,
    label: 'Transferencia',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
  },
  inventory_return: {
    icon: Undo2,
    label: 'Devolucion',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
  },
};

const DIRECTION_CONFIG: Record<string, { label: string; color: string }> = {
  consumed: { label: 'Consumido', color: 'bg-red-100 text-red-700' },
  produced: { label: 'Producido', color: 'bg-green-100 text-green-700' },
  applied: { label: 'Aplicado', color: 'bg-blue-100 text-blue-700' },
  wasted: { label: 'Desperdiciado', color: 'bg-orange-100 text-orange-700' },
};

export function InventoryActivityHistory({
  inventoryItemId,
  productId,
  limit = 20,
  showTitle = true,
}: InventoryActivityHistoryProps) {
  const movements = useQuery(api.activities.getInventoryMovements, {
    inventoryItemId: inventoryItemId as any,
    productId: productId as any,
    limit,
  });

  if (!movements) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Historial de Movimientos</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Historial de Movimientos</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No hay movimientos registrados</p>
            <p className="text-xs text-gray-400">
              Los movimientos apareceran aqui cuando se registren
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Historial de Movimientos</CardTitle>
            <Badge variant="secondary">{movements.length} registros</Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {movements.map((activity) => (
              <ActivityRow key={activity._id} activity={activity} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ activity }: { activity: any }) {
  const config = MOVEMENT_CONFIG[activity.activity_type] || {
    icon: Package,
    label: activity.title || activity.activity_type,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  };
  const Icon = config.icon;
  const metadata = activity.activity_metadata as ActivityMetadata;

  // Query activity_resources for this activity (v2 model)
  const resources = useQuery(api.activityResources.listByActivity, {
    activityId: activity._id,
  });

  // Calculate quantity change
  let quantityChange: number | null = null;
  if (activity.quantity_before !== undefined && activity.quantity_after !== undefined) {
    quantityChange = activity.quantity_after - activity.quantity_before;
  } else if (metadata.quantity_change !== undefined) {
    quantityChange = metadata.quantity_change;
  } else if (metadata.quantity !== undefined) {
    if (activity.activity_type === 'inventory_receipt') {
      quantityChange = metadata.quantity;
    } else {
      quantityChange = -metadata.quantity;
    }
  }

  // Prefer title from v2 if available
  const displayLabel = activity.title || config.label;

  return (
    <div
      className={cn(
        'flex gap-4 border-l-4 p-4',
        config.borderColor
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          config.bgColor
        )}
      >
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{displayLabel}</span>
              {metadata.batch_number && (
                <Badge variant="outline" className="text-xs">
                  {metadata.batch_number}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {metadata.reason || activity.notes || 'Sin razon especificada'}
            </p>
          </div>

          {/* Quantity Change */}
          {quantityChange !== null && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium',
                quantityChange > 0
                  ? 'bg-green-100 text-green-700'
                  : quantityChange < 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              )}
            >
              {quantityChange > 0 ? (
                <ArrowUp className="h-3 w-3" />
              ) : quantityChange < 0 ? (
                <ArrowDown className="h-3 w-3" />
              ) : null}
              {quantityChange > 0 ? '+' : ''}
              {quantityChange} {metadata.quantity_unit || ''}
            </div>
          )}
        </div>

        {/* Before/After */}
        {activity.quantity_before !== undefined &&
          activity.quantity_after !== undefined && (
            <div className="mt-1 text-xs text-gray-500">
              {activity.quantity_before} → {activity.quantity_after}{' '}
              {metadata.quantity_unit}
            </div>
          )}

        {/* Meta info */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {activity.performedByName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(activity.timestamp), "d MMM yyyy 'a las' HH:mm", {
              locale: es,
            })}
          </span>
          {metadata.lot_selection_mode === 'fifo' && (
            <Badge variant="secondary" className="text-xs">
              FIFO
            </Badge>
          )}
        </div>

        {/* Activity Resources (v2 normalized) */}
        {resources && resources.length > 0 && (
          <div className="mt-2 rounded-lg bg-gray-50 p-2">
            <p className="mb-1 text-xs font-medium text-gray-600">Recursos:</p>
            <div className="space-y-1">
              {resources.map((r: any) => {
                const dirConfig = DIRECTION_CONFIG[r.direction] || {
                  label: r.direction,
                  color: 'bg-gray-100 text-gray-700',
                };
                return (
                  <div key={r._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Badge className={cn('text-[10px] px-1.5 py-0', dirConfig.color)}>
                        {dirConfig.label}
                      </Badge>
                      <span className="text-gray-600">
                        {r.batch_number || 'Sin lote'}
                      </span>
                    </div>
                    <span className="font-medium">
                      {r.direction === 'consumed' ? '-' : '+'}{r.quantity} {r.quantity_unit || ''}
                      {r.cost_total !== undefined && (
                        <span className="ml-1 text-gray-400">
                          (${r.cost_total.toFixed(2)})
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback: legacy materials_consumed (when no activity_resources exist) */}
        {(!resources || resources.length === 0) &&
          activity.materials_consumed &&
          Array.isArray(activity.materials_consumed) &&
          activity.materials_consumed.length > 1 && (
            <div className="mt-2 rounded-lg bg-gray-50 p-2">
              <p className="mb-1 text-xs font-medium text-gray-600">
                Lotes consumidos:
              </p>
              <div className="space-y-1">
                {activity.materials_consumed.map((material: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-600">
                      {material.batch_number || 'Sin lote'}
                    </span>
                    <span className="font-medium">
                      -{material.quantity} {metadata.quantity_unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Notes */}
        {activity.notes && activity.notes !== metadata.reason && (
          <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
            {activity.notes}
          </p>
        )}
      </div>
    </div>
  );
}
