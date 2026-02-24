'use client';

import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface BatchInfo {
  _id: string;
  batch_code: string;
  current_quantity: number;
  areaName: string | null;
  status: string;
}

interface ActivityInfo {
  _id: string;
  status: string;
  entity_id?: string;
  scheduled_date: number;
  phase_role?: string;
}

interface PhaseBatchListProps {
  batches: BatchInfo[];
  activities: ActivityInfo[];
}

export function PhaseBatchList({ batches, activities }: PhaseBatchListProps) {
  const router = useRouter();

  if (batches.length === 0) return null;

  const now = Date.now();

  return (
    <div className="mt-2 space-y-1.5">
      {/* Summary line */}
      {batches.length > 1 && (
        <p className="text-xs text-muted-foreground">
          {batches.length} lotes
          {' — '}
          {batches.filter((b) => b.status === 'active').length} activos
          {batches.some((b) => b.status === 'completed') &&
            `, ${batches.filter((b) => b.status === 'completed').length} completados`}
        </p>
      )}

      {/* Batch rows */}
      {batches.map((batch) => {
        const batchActivities = activities.filter((a) => a.entity_id === batch._id);
        const completed = batchActivities.filter((a) => a.status === 'completed').length;
        const total = batchActivities.filter((a) => a.status !== 'cancelled').length;
        const overdue = batchActivities.some(
          (a) => a.status === 'pending' && a.scheduled_date < now
        );

        return (
          <div
            key={batch._id}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/production/batches/${batch._id}`);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                router.push(`/production/batches/${batch._id}`);
              }
            }}
            className="flex items-center gap-3 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-xs"
          >
            <span className="font-medium truncate min-w-0">
              {batch.batch_code}
            </span>
            <span className="text-muted-foreground whitespace-nowrap">
              {batch.current_quantity} plantas
            </span>
            {total > 0 && (
              <span className="text-muted-foreground whitespace-nowrap">
                {completed}/{total} actividades
              </span>
            )}
            {overdue && (
              <Badge className="bg-red-100 text-red-700 text-[10px] px-1 py-0">
                Atrasada
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
