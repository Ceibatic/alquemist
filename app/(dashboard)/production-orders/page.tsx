'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { ProductionOrderList } from '@/components/production-orders/production-order-list';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import { ClipboardList, Play, CheckCircle, Leaf, TrendingUp } from 'lucide-react';

export default function ProductionOrdersPage() {
  const { currentCompanyId, currentFacilityId, isLoading: facilityLoading } = useFacility();

  // Fetch stats
  const stats = useQuery(
    api.productionOrders.getStats,
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
        { label: 'Ordenes', value: 0, icon: ClipboardList, color: 'default' },
        { label: 'Activas', value: 0, icon: Play, color: 'green' },
        { label: 'Plantas', value: 0, icon: Leaf, color: 'default' },
        { label: 'Completadas', value: 0, icon: CheckCircle, color: 'default' },
      ];
    }

    return [
      { label: 'Ordenes', value: stats.totalOrders, icon: ClipboardList, color: 'default' },
      { label: 'Activas', value: stats.activeOrders, icon: Play, color: 'green' },
      { label: 'Plantas', value: stats.totalPlantsActual, icon: Leaf, color: 'default' },
      {
        label: 'Avance',
        value: `${stats.averageCompletion}%`,
        icon: TrendingUp,
        color: stats.averageCompletion > 50 ? 'green' : 'default',
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
        title="Ordenes de Produccion"
        icon={ClipboardList}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Ordenes' }]}
        description="Gestiona las ordenes de produccion y seguimiento de cultivos"
      />

      {/* Compact Stats */}
      <CompactStats stats={compactStats} />

      {/* Order List */}
      <ProductionOrderList
        companyId={currentCompanyId}
        facilityId={currentFacilityId || undefined}
      />
    </div>
  );
}
