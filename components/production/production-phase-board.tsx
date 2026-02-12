'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getPhaseLabel, getPhaseColors } from '@/lib/constants/phases';
import { Layers, Sprout, Clock, TrendingDown, ClipboardList, MapPin } from 'lucide-react';
import Link from 'next/link';

interface ProductionPhaseBoardProps {
  companyId: Id<'companies'>;
  facilityId: Id<'facilities'>;
}

export function ProductionPhaseBoard({ companyId, facilityId }: ProductionPhaseBoardProps) {
  const phaseGroups = useQuery(api.batches.listGroupedByPhase, { companyId, facilityId });
  const stats = useQuery(api.batches.getStats, { companyId, facilityId });
  const orderStats = useQuery(api.productionOrders.getStats, { companyId, facilityId });

  const compactStats = useMemo<CompactStat[]>(() => {
    return [
      {
        label: 'Lotes activos',
        value: stats?.activeBatches ?? 0,
        icon: Layers,
        color: 'green',
      },
      {
        label: 'Plantas activas',
        value: stats?.totalPlantsActive?.toLocaleString() ?? '0',
        icon: Sprout,
        color: 'default',
      },
      {
        label: 'Mortalidad',
        value: `${stats?.averageMortalityRate ?? 0}%`,
        icon: TrendingDown,
        color: (stats?.averageMortalityRate ?? 0) > 10 ? 'red' : 'default',
      },
      {
        label: 'Ordenes activas',
        value: orderStats?.activeOrders ?? 0,
        icon: ClipboardList,
        color: 'blue',
      },
    ];
  }, [stats, orderStats]);

  if (phaseGroups === undefined) {
    return (
      <div className="space-y-6 pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <CompactStats stats={compactStats} />

      {phaseGroups.length === 0 ? (
        <div className="py-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-600">Sin produccion activa</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No hay lotes activos en esta instalacion.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {phaseGroups.map((group) => (
            <PhaseCardGlobal key={group.phase} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

interface PhaseGroup {
  phase: string;
  batchCount: number;
  totalPlants: number;
  avgDays: number;
  batches: {
    _id: Id<'batches'>;
    batch_code: string;
    current_quantity: number;
    cultivarName: string;
    areaName: string;
    daysInProduction: number;
  }[];
}

function PhaseCardGlobal({ group }: { group: PhaseGroup }) {
  const colors = getPhaseColors(group.phase);
  const label = getPhaseLabel(group.phase);

  return (
    <Link href={`/production/phases/${group.phase}`} className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {label}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>{group.batchCount} {group.batchCount === 1 ? 'lote' : 'lotes'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5" />
              <span>{group.totalPlants.toLocaleString()} plantas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{group.avgDays}d prom.</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            {group.batches.map((batch) => (
              <Link
                key={batch._id}
                href={`/batches/${batch._id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-50 text-sm hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono font-medium text-gray-900 truncate">
                    {batch.batch_code}
                  </span>
                  <span className="text-gray-500 truncate hidden sm:inline">{batch.cultivarName}</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                    <MapPin className="h-3 w-3" />
                    {batch.areaName}
                  </span>
                  <span className="text-gray-700 font-medium whitespace-nowrap">
                    {batch.current_quantity.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
