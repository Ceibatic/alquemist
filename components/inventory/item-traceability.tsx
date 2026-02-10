'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GitBranch, Package, ArrowDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemTraceabilityProps {
  inventoryItemId: string;
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  transformed: 'Transformado',
  consumed: 'Consumido',
  harvested: 'Cosechado',
  expired: 'Vencido',
  waste: 'Desperdicio',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  transformed: 'bg-blue-100 text-blue-800',
  consumed: 'bg-gray-100 text-gray-800',
  harvested: 'bg-amber-100 text-amber-800',
  expired: 'bg-red-100 text-red-800',
  waste: 'bg-red-100 text-red-800',
};

export function ItemTraceability({ inventoryItemId }: ItemTraceabilityProps) {
  const trace = useQuery(api.inventory.getFullTrace, {
    inventoryItemId: inventoryItemId as Id<'inventory_items'>,
  });

  if (trace === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Trazabilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trace.totalSteps <= 1 && !trace.originReceipt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Trazabilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Sin cadena de trazabilidad</p>
            <p className="text-xs mt-1">
              Este item no tiene transformaciones registradas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Trazabilidad
          <Badge variant="secondary" className="ml-2">
            {trace.totalSteps} {trace.totalSteps === 1 ? 'paso' : 'pasos'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Origin receipt */}
          {trace.originReceipt && (
            <div className="relative flex items-start gap-4 pb-6">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 ring-4 ring-white">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-medium text-gray-900">
                  Recepcion de origen
                </p>
                <p className="text-xs text-gray-500">{trace.originReceipt.reason}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {new Date(trace.originReceipt.date).toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  <span>por {trace.originReceipt.performed_by}</span>
                </div>
              </div>
            </div>
          )}

          {/* Trace steps */}
          {trace.steps.map((step, index) => {
            const isCurrent = step.direction === 'current';
            const isLast = index === trace.steps.length - 1;

            return (
              <div key={step._id}>
                <div className="relative flex items-start gap-4 pb-2">
                  <div
                    className={cn(
                      'relative z-10 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white',
                      isCurrent
                        ? 'bg-amber-100'
                        : step.direction === 'backward'
                          ? 'bg-blue-100'
                          : 'bg-purple-100'
                    )}
                  >
                    <Package
                      className={cn(
                        'h-5 w-5',
                        isCurrent
                          ? 'text-amber-600'
                          : step.direction === 'backward'
                            ? 'text-blue-600'
                            : 'text-purple-600'
                      )}
                    />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-amber-900' : 'text-gray-900'
                      )}>
                        {step.product_name}
                        {isCurrent && ' (actual)'}
                      </p>
                      {step.transformation_status && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-1.5 py-0',
                            statusColors[step.transformation_status] || 'bg-gray-100'
                          )}
                        >
                          {statusLabels[step.transformation_status] || step.transformation_status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{step.product_sku}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{step.quantity} {step.quantity_unit}</span>
                      {step.batch_number && (
                        <span className="font-mono">Lote: {step.batch_number}</span>
                      )}
                      {step.activity_type && (
                        <span>via {step.activity_type}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(step.timestamp).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                {/* Arrow between steps */}
                {!isLast && (
                  <div className="relative flex items-center pl-[14px] py-1">
                    <ArrowDown className="h-3 w-3 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
