'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ProductionOrderList } from '@/components/production-orders/production-order-list';
import { ClipboardList, Clock, Play, CheckCircle } from 'lucide-react';

interface OrdersTabProps {
  companyId: Id<'companies'>;
  facilityId: Id<'facilities'> | null;
}

function CompactStats({
  stats,
}: {
  stats: {
    activeOrders: number;
    planningOrders: number;
    completedOrders: number;
    averageCompletion: number;
  };
}) {
  const items = [
    { label: 'Activas', value: stats.activeOrders, icon: Play, color: 'text-blue-600' },
    { label: 'Planificacion', value: stats.planningOrders, icon: Clock, color: 'text-amber-600' },
    { label: 'Completadas', value: stats.completedOrders, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Progreso', value: `${stats.averageCompletion}%`, icon: ClipboardList, color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-lg border bg-white p-3"
        >
          <Icon className={`h-5 w-5 ${color}`} />
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{String(value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrdersTab({ companyId, facilityId }: OrdersTabProps) {
  const stats = useQuery(api.productionOrders.getStats, {
    companyId,
    facilityId: facilityId || undefined,
  });

  return (
    <div className="space-y-4">
      {stats && <CompactStats stats={stats} />}
      <ProductionOrderList
        companyId={companyId}
        facilityId={facilityId || undefined}
      />
    </div>
  );
}
