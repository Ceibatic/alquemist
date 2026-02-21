'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';

interface WizardStepSelectBatchesProps {
  companyId: Id<'companies'>;
  areaId: Id<'areas'>;
  selectedBatchIds: Id<'batches'>[];
  onSelectionChange: (batchIds: Id<'batches'>[]) => void;
}

const PHASE_LABELS: Record<string, string> = {
  germination: 'Germinacion',
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
  post_harvest: 'Post-cosecha',
  processing: 'Procesamiento',
  storage: 'Almacenamiento',
};

export function WizardStepSelectBatches({
  companyId,
  areaId,
  selectedBatchIds,
  onSelectionChange,
}: WizardStepSelectBatchesProps) {
  const batches = useQuery(api.batches.list, {
    companyId,
    areaId,
    status: 'active',
  });

  const toggleBatch = (batchId: Id<'batches'>) => {
    if (selectedBatchIds.includes(batchId)) {
      onSelectionChange(selectedBatchIds.filter((id) => id !== batchId));
    } else {
      onSelectionChange([...selectedBatchIds, batchId]);
    }
  };

  const toggleAll = () => {
    if (!batches) return;
    if (selectedBatchIds.length === batches.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(batches.map((b) => b._id));
    }
  };

  if (batches === undefined) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Layers className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p>No hay lotes activos en esta area.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Selecciona los lotes sobre los que se realizara la actividad.
        </p>
        <button
          onClick={toggleAll}
          className="text-xs text-amber-600 hover:underline"
        >
          {selectedBatchIds.length === batches.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>
      </div>

      <div className="border rounded-lg divide-y">
        {batches.map((batch) => {
          const isSelected = selectedBatchIds.includes(batch._id);
          return (
            <button
              key={batch._id}
              onClick={() => toggleBatch(batch._id)}
              className={cn(
                'flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors',
                isSelected && 'bg-amber-50/50'
              )}
            >
              <Checkbox checked={isSelected} className="pointer-events-none" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium font-mono">{batch.batch_code}</span>
                  {batch.current_phase && (
                    <Badge variant="outline" className="text-[10px]">
                      {PHASE_LABELS[batch.current_phase] ?? batch.current_phase}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  {batch.cultivarName && <span>{batch.cultivarName}</span>}
                  <span>{batch.current_quantity ?? batch.initial_quantity} plantas</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-right">
        {selectedBatchIds.length} de {batches.length} seleccionados
      </p>
    </div>
  );
}
