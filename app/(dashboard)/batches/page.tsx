'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { BatchList } from '@/components/batches/batch-list';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import { Layers, Leaf, AlertTriangle, TrendingDown } from 'lucide-react';

export default function BatchesPage() {
  const { currentCompanyId, currentFacilityId, isLoading: facilityLoading } = useFacility();

  // Fetch stats
  const stats = useQuery(
    api.batches.getStats,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          facilityId: currentFacilityId || undefined,
        }
      : 'skip'
  );

  // Calculate compact stats
  const compactStats = useMemo<CompactStat[]>(() => {
    if (!stats) {
      return [
        { label: 'Lotes', value: 0, icon: Layers, color: 'default' },
        { label: 'Activos', value: 0, icon: Layers, color: 'green' },
        { label: 'Plantas', value: 0, icon: Leaf, color: 'default' },
        { label: 'Mortalidad', value: '0%', icon: TrendingDown, color: 'default' },
      ];
    }

    return [
      { label: 'Total Lotes', value: stats.totalBatches, icon: Layers, color: 'default' },
      { label: 'Activos', value: stats.activeBatches, icon: Layers, color: 'green' },
      { label: 'Plantas', value: stats.totalPlantsActive, icon: Leaf, color: 'default' },
      {
        label: 'Mortalidad',
        value: `${stats.averageMortalityRate}%`,
        icon: stats.averageMortalityRate > 10 ? AlertTriangle : TrendingDown,
        color: stats.averageMortalityRate > 10 ? 'red' : 'default',
      },
    ];
  }, [stats]);

  // Loading state
  if (facilityLoading || !currentCompanyId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Lotes de Produccion"
        icon={Layers}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Lotes' }]}
        description="Gestiona los lotes de plantas y su seguimiento"
      />

      {/* Compact Stats */}
      <CompactStats stats={compactStats} />

      {/* Batch List */}
      <BatchList
        companyId={currentCompanyId}
        facilityId={currentFacilityId || undefined}
      />
    </div>
  );
}
