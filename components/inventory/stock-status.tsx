'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StockStatusType = 'adequate' | 'low' | 'critical' | 'out_of_stock' | 'overstocked';

interface StockStatusProps {
  status: StockStatusType;
  className?: string;
}

export function StockStatus({ status, className }: StockStatusProps) {
  const statusConfig = {
    adequate: {
      label: 'En Stock',
      icon: '🟢',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    low: {
      label: 'Stock Bajo',
      icon: '🟡',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    critical: {
      label: 'Crítico',
      icon: '🔴',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    out_of_stock: {
      label: 'Agotado',
      icon: '⚫',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    overstocked: {
      label: 'Exceso',
      icon: '🔵',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
  };

  const config = statusConfig[status] || statusConfig.adequate;

  return (
    <Badge className={cn(config.className, 'hover:opacity-80 transition-opacity', className)}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

interface StockLevelBarProps {
  current: number;
  reorderPoint?: number;
  minimum?: number;
  maximum?: number;
  unit: string;
  className?: string;
}

export function StockLevelBar({
  current,
  reorderPoint = 0,
  minimum = 0,
  maximum,
  unit,
  className,
}: StockLevelBarProps) {
  const max = maximum || Math.max(current, reorderPoint * 2, 100);
  const percentage = (current / max) * 100;
  const reorderPercentage = (reorderPoint / max) * 100;
  const minPercentage = (minimum / max) * 100;

  // Determine color based on stock level
  let barColor = 'bg-green-600';
  if (current <= 0) {
    barColor = 'bg-gray-400';
  } else if (current <= reorderPoint * 0.5) {
    barColor = 'bg-red-600';
  } else if (current <= reorderPoint) {
    barColor = 'bg-yellow-600';
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {current} {unit}
        </span>
        <span className="text-gray-500">
          Max: {maximum ? `${maximum} ${unit}` : 'N/A'}
        </span>
      </div>

      <div className="relative h-4 w-full rounded-full bg-gray-200">
        {/* Current stock bar */}
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />

        {/* Reorder point indicator */}
        {reorderPoint > 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-orange-500"
            style={{ left: `${Math.min(reorderPercentage, 100)}%` }}
            title={`Punto de reorden: ${reorderPoint} ${unit}`}
          >
            <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-orange-500" />
          </div>
        )}

        {/* Minimum stock indicator */}
        {minimum > 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-red-500"
            style={{ left: `${Math.min(minPercentage, 100)}%` }}
            title={`Stock mínimo: ${minimum} ${unit}`}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Mín: {minimum} {unit}</span>
        {reorderPoint > 0 && (
          <span className="text-orange-600">
            Reorden: {reorderPoint} {unit}
          </span>
        )}
      </div>
    </div>
  );
}
