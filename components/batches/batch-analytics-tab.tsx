'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PHASE_LABELS } from '@/lib/constants/phases';
import { ACTIVITY_CATEGORIES } from '@/lib/constants/activity-types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import { DollarSign, TrendingDown } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderPhase {
  phase_name: string;
  phase_order: number;
  planned_start_date: number;
  planned_end_date: number;
  actual_start_date?: number;
  status: string;
}

interface LossRecord {
  quantity: number;
  reason: string;
  detection_date: number;
}

interface BatchAnalyticsTabProps {
  batchId: Id<'batches'>;
  orderPhases: OrderPhase[];
  losses: LossRecord[];
  initialQuantity: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_HEX: Record<string, string> = {
  cultivation: '#16a34a',
  monitoring: '#d97706',
  transformation: '#7c3aed',
  application: '#dc2626',
  movement: '#0891b2',
  maintenance: '#475569',
  quality: '#e11d48',
  harvest: '#ec4899',
  post_harvest: '#f97316',
  administrative: '#6b7280',
};

const LOSS_REASON_LABELS: Record<string, string> = {
  disease: 'Enfermedad',
  pest: 'Plagas',
  environmental: 'Ambiental',
  genetic: 'Genetica',
  accident: 'Accidente',
  discard: 'Descarte',
};

const LOSS_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#06b6d4', '#6b7280'];

function getCategoryLabel(category: string): string {
  return ACTIVITY_CATEGORIES.find((c) => c.value === category)?.label || category;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BatchAnalyticsTab({
  batchId,
  orderPhases,
  losses,
  initialQuantity,
}: BatchAnalyticsTabProps) {
  const analytics = useQuery(api.activities.getBatchAnalytics, { batchId });

  // Losses by reason
  const lossByReason = useMemo(() => {
    if (!losses || losses.length === 0) return [];
    const map = new Map<string, number>();
    for (const l of losses) {
      map.set(l.reason, (map.get(l.reason) || 0) + l.quantity);
    }
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .map(([reason, quantity]) => ({
        reason,
        label: LOSS_REASON_LABELS[reason] || reason,
        quantity,
        percentage: total > 0 ? Math.round((quantity / total) * 100) : 0,
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [losses]);

  // Phase timeline
  const phaseTimeline = useMemo(() => {
    if (orderPhases.length === 0) return [];
    return orderPhases.map((p) => {
      const plannedDays = Math.max(
        1,
        Math.floor(
          (p.planned_end_date - p.planned_start_date) / (1000 * 60 * 60 * 24)
        )
      );
      let actualDays: number | null = null;
      if (p.actual_start_date) {
        const end =
          p.status === 'completed'
            ? p.planned_end_date
            : Date.now();
        actualDays = Math.max(
          1,
          Math.floor((end - p.actual_start_date) / (1000 * 60 * 60 * 24))
        );
      }
      return {
        name: PHASE_LABELS[p.phase_name.toLowerCase()] || p.phase_name,
        planned: plannedDays,
        actual: actualDays,
        status: p.status,
      };
    });
  }, [orderPhases]);

  if (analytics === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* === Section 1: Activities & Resources === */}

      {/* Activities by Category */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actividades por tipo</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.activitiesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={analytics.activitiesByCategory.map((d) => ({
                  ...d,
                  label: getCategoryLabel(d.category),
                  fill: CATEGORY_HEX[d.category] || '#9ca3af',
                }))}
                layout="vertical"
                margin={{ left: 90 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  width={85}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}`, 'Actividades']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {analytics.activitiesByCategory.map((d, i) => (
                    <Cell
                      key={i}
                      fill={CATEGORY_HEX[d.category] || '#9ca3af'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Sin actividades registradas" />
          )}
        </CardContent>
      </Card>

      {/* Activities by Phase */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actividades por fase</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.activitiesByPhase.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={analytics.activitiesByPhase.map((d) => ({
                  ...d,
                  label: PHASE_LABELS[d.phase] || d.phase,
                }))}
                layout="vertical"
                margin={{ left: 90 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  width={85}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}`, 'Actividades']}
                />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]}>
                  {analytics.activitiesByPhase.map((d, i) => (
                    <Cell key={i} fill={PHASE_HEX[d.phase] || '#9ca3af'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Sin actividades registradas" />
          )}
        </CardContent>
      </Card>

      {/* Top Resources + Total Cost */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top 5 recursos consumidos</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.resourceSummary.length > 0 ? (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 font-medium">Producto</th>
                      <th className="pb-2 font-medium text-right">Cantidad</th>
                      <th className="pb-2 font-medium text-right">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.resourceSummary.map((r) => (
                      <tr key={r.productId} className="border-b last:border-0">
                        <td className="py-2">{r.productName}</td>
                        <td className="py-2 text-right tabular-nums">
                          {r.totalQuantity} {r.unit}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {formatCurrency(r.totalCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold">
                  {formatCurrency(analytics.totalCost)}
                </span>
                <span className="text-sm text-gray-500">costo acumulado</span>
              </div>
            </div>
          ) : (
            <EmptyChart message="Sin recursos registrados" />
          )}
        </CardContent>
      </Card>

      {/* === Section 2: Production & Health === */}

      {/* Survival Curve */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Curva de supervivencia</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.survivalCurve.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={[
                  { timestamp: analytics.survivalCurve[0].timestamp - 86400000, quantity: initialQuantity },
                  ...analytics.survivalCurve,
                ]}
              >
                <defs>
                  <linearGradient id="survivalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(ts) => formatShortDate(ts)}
                />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                <Tooltip
                  formatter={(value: number) => [`${value} plantas`, 'Cantidad']}
                  labelFormatter={(ts: number) => formatShortDate(ts)}
                />
                <Area
                  type="monotone"
                  dataKey="quantity"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fill="url(#survivalGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Sin datos de cantidad" />
          )}
        </CardContent>
      </Card>

      {/* Losses by Cause */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Perdidas por causa</CardTitle>
        </CardHeader>
        <CardContent>
          {lossByReason.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={lossByReason}
                    dataKey="quantity"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    strokeWidth={2}
                  >
                    {lossByReason.map((_, i) => (
                      <Cell key={i} fill={LOSS_COLORS[i % LOSS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} plantas`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {lossByReason.map((l, i) => (
                  <div key={l.reason} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: LOSS_COLORS[i % LOSS_COLORS.length] }}
                    />
                    <span className="flex-1">{l.label}</span>
                    <span className="tabular-nums font-medium">{l.quantity}</span>
                    <span className="text-gray-400 text-xs">({l.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart message="Sin perdidas registradas" />
          )}
        </CardContent>
      </Card>

      {/* Phase Timeline */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Avance de fases vs planificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {phaseTimeline.length > 0 ? (
            <div className="space-y-3">
              {phaseTimeline.map((phase) => {
                const max = Math.max(phase.planned, phase.actual || 0);
                const plannedPct = max > 0 ? (phase.planned / max) * 100 : 0;
                const actualPct =
                  phase.actual != null && max > 0
                    ? (phase.actual / max) * 100
                    : 0;
                const isDelayed =
                  phase.actual != null && phase.actual > phase.planned;
                return (
                  <div key={phase.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{phase.name}</span>
                      <span className="text-xs text-gray-500">
                        {phase.actual != null
                          ? `${phase.actual}d / ${phase.planned}d planificados`
                          : `${phase.planned}d planificados`}
                      </span>
                    </div>
                    <div className="flex gap-1 h-3">
                      {/* Planned bar */}
                      <div
                        className="bg-gray-200 rounded-full h-full"
                        style={{ width: `${plannedPct}%`, minWidth: 4 }}
                      />
                    </div>
                    {phase.actual != null && (
                      <div className="flex gap-1 h-3">
                        {/* Actual bar */}
                        <div
                          className={`rounded-full h-full ${
                            isDelayed ? 'bg-amber-400' : 'bg-green-500'
                          }`}
                          style={{ width: `${actualPct}%`, minWidth: 4 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex items-center gap-4 pt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-4 bg-gray-200 rounded-full" /> Planificado
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-4 bg-green-500 rounded-full" /> Real (a tiempo)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-4 bg-amber-400 rounded-full" /> Real (atrasado)
                </span>
              </div>
            </div>
          ) : (
            <EmptyChart message="Sin orden de produccion vinculada" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const PHASE_HEX: Record<string, string> = {
  propagation: '#7c3aed',
  germination: '#2563eb',
  seedling: '#0d9488',
  vegetative: '#059669',
  flowering: '#ec4899',
  harvest: '#d97706',
  post_harvest: '#f97316',
  processing: '#64748b',
};

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] text-gray-400">
      <TrendingDown className="h-8 w-8 mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
