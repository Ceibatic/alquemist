'use client';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import type { ActivityResourceInput } from '@/lib/validations/activity-execution';

interface ResourceEditorInlineProps {
  resources: ActivityResourceInput[];
  onChange: (resources: ActivityResourceInput[]) => void;
  /** Product names keyed by productId — resolved externally */
  productNames?: Record<string, string>;
  readOnly?: boolean;
}

export function ResourceEditorInline({
  resources,
  onChange,
  productNames = {},
  readOnly = false,
}: ResourceEditorInlineProps) {
  if (resources.length === 0) return null;

  function updateQuantity(index: number, quantity: number) {
    const updated = [...resources];
    updated[index] = { ...updated[index], quantity };
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      <h4 className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        <Package className="h-3.5 w-3.5" />
        Recursos ({resources.length})
      </h4>

      <div className="space-y-2">
        {resources.map((res, idx) => (
          <div
            key={`${res.productId}-${idx}`}
            className="flex items-center gap-3 rounded-lg border px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {productNames[res.productId] ?? res.productId}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{res.quantityUnit}</span>
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {res.direction}
                </Badge>
              </div>
            </div>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={res.quantity}
              onChange={(e) =>
                updateQuantity(idx, Number(e.target.value) || 0)
              }
              className="h-8 w-20 text-sm"
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
