'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ACTIVITY_CATEGORIES } from '@/lib/constants/activity-types';
import { Id } from '@/convex/_generated/dataModel';

interface BatchOption {
  _id: Id<'batches'>;
  batch_code: string;
  cultivarName: string;
}

interface PhaseDetailFiltersProps {
  batches: BatchOption[];
  selectedBatchIds: Set<string>;
  onBatchToggle: (batchId: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
}

export function PhaseDetailFilters({
  batches,
  selectedBatchIds,
  onBatchToggle,
  categoryFilter,
  onCategoryChange,
}: PhaseDetailFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {/* Batch checkboxes */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Lotes:</span>
        {batches.map((batch) => (
          <label
            key={batch._id}
            className="flex items-center gap-1.5 text-sm cursor-pointer"
          >
            <Checkbox
              checked={selectedBatchIds.has(batch._id)}
              onCheckedChange={() => onBatchToggle(batch._id)}
            />
            <span className="font-mono text-xs">{batch.batch_code}</span>
          </label>
        ))}
      </div>

      {/* Category dropdown */}
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorias</SelectItem>
          {ACTIVITY_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
