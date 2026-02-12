'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPhaseLabel, getPhaseColors } from '@/lib/constants/phases';
import {
  Sprout,
  TrendingDown,
  ClipboardList,
  BarChart3,
  Layers,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Link from 'next/link';

interface ProductionAnalyticsProps {
  companyId: Id<'companies'>;
  facilityId: Id<'facilities'>;
}

export function ProductionAnalytics({ companyId, facilityId }: ProductionAnalyticsProps) {
  const [mortalityDays, setMortalityDays] = useState<number>(30);

  const batchStats = useQuery(api.batches.getStats, { companyId, facilityId });
  const orderStats = useQuery(api.productionOrders.getStats, { companyId, facilityId });
  const mortalityTrend = useQuery(api.batches.getMortalityTrend, {
    companyId,
    facilityId,
    days: mortalityDays,
  });
  const recentBatches = useQuery(api.batches.listRecent, {
    companyId,
    facilityId,
    limit: 10,
  });

  const kpiStats = useMemo<CompactStat[]>(() => {
    const mortalityRate = batchStats?.averageMortalityRate ?? 0;
    return [
      {
        label: 'Plantas activas',
        value: batchStats?.totalPlantsActive?.toLocaleString() ?? '0',
        icon: Sprout,
        color: 'green',
      },
      {
        label: 'Mortalidad global',
        value: `${mortalityRate}%`,
        icon: TrendingDown,
        color: mortalityRate > 15 ? 'red' : mortalityRate > 5 ? 'yellow' : 'green',
      },
      {
        label: 'Ordenes activas',
        value: orderStats?.activeOrders ?? 0,
        icon: ClipboardList,
        color: 'blue',
      },
      {
        label: 'Rendimiento acum.',
        value: orderStats?.totalPlantsActual?.toLocaleString() ?? '0',
        icon: BarChart3,
        color: 'purple',
      },
    ];
  }, [batchStats, orderStats]);

  // Phase distribution data for bar chart
  const phaseDistribution = useMemo(() => {
    if (!batchStats?.batchesByPhase) return [];
    return Object.entries(batchStats.batchesByPhase)
      .map(([phase, count]) => ({
        phase,
        label: getPhaseLabel(phase),
        count: count as number,
        fill: getPhaseBarColor(phase),
      }))
      .filter((d) => d.count > 0);
  }, [batchStats]);

  const isLoading =
    batchStats === undefined || orderStats === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* KPI Cards */}
      <CompactStats stats={kpiStats} />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Phase Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Distribucion por fase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {phaseDistribution.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
                Sin datos de fases
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={phaseDistribution} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={75} />
                  <Tooltip
                    formatter={(value: number) => [`${value} lotes`, 'Cantidad']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Mortality Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Mortalidad por periodo
              </CardTitle>
              <Select
                value={String(mortalityDays)}
                onValueChange={(v) => setMortalityDays(Number(v))}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {mortalityTrend === undefined ? (
              <Skeleton className="h-52" />
            ) : mortalityTrend.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
                Sin datos de mortalidad
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mortalityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(d: string) => {
                      const date = new Date(d);
                      return date.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                      });
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Mortalidad']}
                    labelFormatter={(label: string) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      });
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mortalityRate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Batches */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Lotes recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentBatches === undefined ? (
            <Skeleton className="h-48" />
          ) : recentBatches.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Sin lotes recientes
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Codigo</th>
                    <th className="pb-2 font-medium">Cultivar</th>
                    <th className="pb-2 font-medium">Fase</th>
                    <th className="pb-2 font-medium text-right">Plantas</th>
                    <th className="pb-2 font-medium text-right">Dias</th>
                    <th className="pb-2 font-medium">Area</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBatches.map((batch) => {
                    const colors = getPhaseColors(batch.current_phase);
                    return (
                      <tr
                        key={batch._id}
                        className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="py-2">
                          <Link
                            href={`/batches/${batch._id}`}
                            className="font-mono text-xs font-medium text-blue-600 hover:underline"
                          >
                            {batch.batch_code}
                          </Link>
                        </td>
                        <td className="py-2 text-gray-700">{batch.cultivarName}</td>
                        <td className="py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {getPhaseLabel(batch.current_phase)}
                          </span>
                        </td>
                        <td className="py-2 text-right font-medium">
                          {batch.current_quantity.toLocaleString()}
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {batch.daysInProduction}
                        </td>
                        <td className="py-2 text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {batch.areaName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getPhaseBarColor(phase: string): string {
  const colorMap: Record<string, string> = {
    propagation: '#7c3aed',
    germination: '#2563eb',
    seedling: '#0d9488',
    vegetative: '#059669',
    flowering: '#ec4899',
    harvest: '#f59e0b',
    post_harvest: '#f97316',
    processing: '#64748b',
  };
  return colorMap[phase] ?? '#9ca3af';
}
