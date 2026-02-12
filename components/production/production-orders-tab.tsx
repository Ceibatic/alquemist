'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { ProductionOrderList } from '@/components/production-orders/production-order-list';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, Play, Leaf, TrendingUp } from 'lucide-react';

interface ProductionOrdersTabProps {
  companyId: Id<'companies'>;
  facilityId?: Id<'facilities'>;
}

export function ProductionOrdersTab({ companyId, facilityId }: ProductionOrdersTabProps) {
  const stats = useQuery(api.productionOrders.getStats, {
    companyId,
    facilityId,
  });

  const compactStats = useMemo<CompactStat[]>(() => {
    if (!stats) {
      return [
        { label: 'Ordenes', value: 0, icon: ClipboardList, color: 'default' },
        { label: 'Activas', value: 0, icon: Play, color: 'green' },
        { label: 'Plantas', value: 0, icon: Leaf, color: 'default' },
        { label: 'Avance', value: '0%', icon: TrendingUp, color: 'default' },
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

  return (
    <div className="space-y-6 pt-4">
      <CompactStats stats={compactStats} />
      <ProductionOrderList
        companyId={companyId}
        facilityId={facilityId}
      />
    </div>
  );
}
