'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Calendar, AlertTriangle } from 'lucide-react';

interface AreaInventoryTabProps {
  areaId: Id<'areas'>;
  companyId: string;
}

const stockStatusLabels: Record<string, string> = {
  adequate: 'Adecuado',
  low: 'Bajo',
  critical: 'Critico',
  out_of_stock: 'Agotado',
  overstocked: 'Exceso',
};

const stockStatusColors: Record<string, string> = {
  adequate: 'active',
  low: 'maintenance',
  critical: 'inactive',
  out_of_stock: 'inactive',
  overstocked: 'maintenance',
};

export function AreaInventoryTab({ areaId, companyId }: AreaInventoryTabProps) {
  const inventoryData = useQuery(api.inventory.list, {
    companyId,
    area_id: areaId,
    limit: 50,
  });

  if (inventoryData === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  const { items, total } = inventoryData;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay inventario en esta area
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Los items de inventario almacenados en esta area apareceran aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {total} {total === 1 ? 'item' : 'items'} en inventario
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item: any) => {
          const isLowStock =
            item.quantity_available <= (item.reorder_point || 0);
          const isExpiringSoon =
            item.expiration_date &&
            item.expiration_date - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days

          return (
            <Card key={item._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {item.batch_number || `INV-${item._id.slice(-6)}`}
                    </CardTitle>
                    {item.supplier_lot_number && (
                      <p className="text-xs text-gray-500">
                        Lote: {item.supplier_lot_number}
                      </p>
                    )}
                  </div>
                  <StatusBadge
                    status={stockStatusColors[item.stockStatus] || 'active'}
                    size="sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cantidad</span>
                  <span className="font-semibold">
                    {item.quantity_available.toLocaleString()} {item.quantity_unit}
                  </span>
                </div>

                {/* Reorder point warning */}
                {isLowStock && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded text-xs">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Stock bajo - Punto de reorden: {item.reorder_point}</span>
                  </div>
                )}

                {/* Reserved / Committed */}
                {(item.quantity_reserved > 0 || item.quantity_committed > 0) && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Reservado: {item.quantity_reserved}</span>
                    <span>Comprometido: {item.quantity_committed}</span>
                  </div>
                )}

                {/* Expiration */}
                {item.expiration_date && (
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      isExpiringSoon ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Vence:{' '}
                      {new Date(item.expiration_date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {/* Cost */}
                {item.cost_per_unit && (
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>Costo unitario</span>
                    <span>${item.cost_per_unit.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
