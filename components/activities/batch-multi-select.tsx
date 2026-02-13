'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BatchMultiSelectProps {
  companyId: Id<'companies'>;
  value: string[];
  onChange: (batchIds: string[]) => void;
  orderId?: Id<'production_orders'>;
  areaId?: Id<'areas'>;
  phase?: string;
  facilityId?: Id<'facilities'>;
  maxSelection?: number;
  singleMode?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BatchMultiSelect({
  companyId,
  value,
  onChange,
  orderId,
  areaId,
  phase,
  facilityId,
  maxSelection,
  singleMode = false,
}: BatchMultiSelectProps) {
  // Load active batches with filters
  const batches = useQuery(api.batches.list, {
    companyId,
    facilityId,
    areaId,
    status: 'active',
    orderId,
  });

  if (batches === undefined) {
    return (
      <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando lotes...
      </div>
    );
  }

  // Apply phase filter client-side (not supported by query args)
  let filteredBatches = batches;
  if (phase) {
    filteredBatches = filteredBatches.filter(
      (b) => b.current_phase === phase,
    );
  }

  if (filteredBatches.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No hay lotes activos con los filtros seleccionados
      </p>
    );
  }

  const selectedSet = new Set(value);
  const allSelected = filteredBatches.every((b) =>
    selectedSet.has(b._id as string),
  );

  function toggleBatch(batchId: string) {
    if (singleMode) {
      onChange([batchId]);
      return;
    }

    if (selectedSet.has(batchId)) {
      onChange(value.filter((id) => id !== batchId));
    } else {
      if (maxSelection && value.length >= maxSelection) return;
      onChange([...value, batchId]);
    }
  }

  function selectAll() {
    if (allSelected) {
      onChange([]);
    } else {
      const ids = filteredBatches.map((b) => b._id as string);
      onChange(maxSelection ? ids.slice(0, maxSelection) : ids);
    }
  }

  return (
    <div className="space-y-2">
      {/* Header with counter and select all */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {value.length} de {filteredBatches.length} lotes seleccionados
        </span>
        {!singleMode && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs"
            onClick={selectAll}
          >
            {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </Button>
        )}
      </div>

      {/* Batch list */}
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
        {filteredBatches.map((batch) => {
          const id = batch._id as string;
          const isSelected = selectedSet.has(id);

          return (
            <label
              key={id}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
            >
              {singleMode ? (
                <input
                  type="radio"
                  name="batch-select"
                  checked={isSelected}
                  onChange={() => toggleBatch(id)}
                  className="h-4 w-4 accent-amber-500"
                />
              ) : (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleBatch(id)}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {batch.batch_code}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {batch.cultivarName ?? ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {batch.areaName && <span>{batch.areaName}</span>}
                  {batch.current_phase && (
                    <span className="rounded bg-muted px-1.5 py-0.5">
                      {batch.current_phase}
                    </span>
                  )}
                  <span>
                    {batch.current_quantity ?? 0} uds
                  </span>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
