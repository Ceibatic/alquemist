'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LowStockAlertProps {
  count: number;
  criticalCount?: number;
  onViewItems?: () => void;
  className?: string;
}

export function LowStockAlert({
  count,
  criticalCount = 0,
  onViewItems,
  className,
}: LowStockAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || count === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border border-yellow-200 bg-yellow-50 p-4',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              {criticalCount > 0 ? (
                <>
                  {criticalCount} items en estado crítico y {count - criticalCount} con stock bajo
                </>
              ) : (
                <>
                  {count} {count === 1 ? 'item con' : 'items con'} stock bajo
                </>
              )}
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Los siguientes items están por debajo del punto de reorden. Considera realizar nuevas compras.
            </p>
            {onViewItems && (
              <Button
                variant="link"
                className="mt-2 h-auto p-0 text-sm font-semibold text-yellow-800 hover:text-yellow-900"
                onClick={onViewItems}
              >
                Ver items →
              </Button>
            )}
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-yellow-600 hover:text-yellow-800"
          aria-label="Cerrar alerta"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
