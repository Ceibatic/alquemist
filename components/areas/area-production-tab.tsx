'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PhaseCard } from './phase-card';
import { Layers } from 'lucide-react';

interface AreaProductionTabProps {
  areaId: Id<'areas'>;
}

export function AreaProductionTab({ areaId }: AreaProductionTabProps) {
  const phaseGroups = useQuery(api.batches.listByAreaGroupedByPhase, { areaId });

  if (phaseGroups === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (phaseGroups.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="Sin produccion activa"
        description="No hay lotes activos en esta area. Los lotes agrupados por fase apareceran aqui."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {phaseGroups.map((group) => (
        <PhaseCard
          key={group.phase}
          phase={group.phase}
          batchCount={group.batchCount}
          totalPlants={group.totalPlants}
          avgDays={group.avgDays}
          batches={group.batches}
          areaId={areaId}
        />
      ))}
    </div>
  );
}
