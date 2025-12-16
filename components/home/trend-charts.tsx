'use client';

import { useQuery } from 'convex/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, Layers, Activity, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

interface TrendChartsProps {
  facilityId: Id<'facilities'>;
}

export function TrendCharts({ facilityId }: TrendChartsProps) {
  const trends = useQuery(api.home.getDashboardTrends, { facilityId, days: 14 });

  if (trends === undefined) {
    return <TrendChartsSkeleton />;
  }

  // Format dates for display (show only day/month)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const productionData = trends.productionTrend.map((d) => ({
    date: formatDate(d.date),
    value: d.value,
  }));

  const batchData = trends.batchTrend.map((d) => ({
    date: formatDate(d.date),
    value: d.value,
  }));

  const activityData = trends.activityTrend.map((d) => ({
    date: formatDate(d.date),
    value: d.value,
  }));

  // Calculate totals for display
  const totalOrders = trends.productionTrend.reduce((sum, d) => sum + d.value, 0);
  const totalBatches = trends.batchTrend.reduce((sum, d) => sum + d.value, 0);
  const totalActivities = trends.activityTrend.reduce((sum, d) => sum + d.value, 0);

  // Plant health - get latest values
  const latestHealth = trends.plantHealthTrend[trends.plantHealthTrend.length - 1];
  const healthData = latestHealth
    ? [
        { name: 'Saludables', value: latestHealth.healthy, fill: '#22c55e' },
        { name: 'En Riesgo', value: latestHealth.warning, fill: '#f59e0b' },
        { name: 'Criticos', value: latestHealth.critical, fill: '#ef4444' },
      ]
    : [];

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Tendencias (Ultimos 14 dias)
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Production Orders Trend */}
        <MiniChart
          icon={TrendingUp}
          title="Ordenes Creadas"
          value={totalOrders}
          data={productionData}
          color="#22c55e"
        />

        {/* Batches Trend */}
        <MiniChart
          icon={Layers}
          title="Lotes Iniciados"
          value={totalBatches}
          data={batchData}
          color="#3b82f6"
        />

        {/* Activities Trend */}
        <MiniChart
          icon={Activity}
          title="Actividades"
          value={totalActivities}
          data={activityData}
          color="#8b5cf6"
        />

        {/* Plant Health Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Salud de Lotes
            </CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    hide
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-gray-500">
                  {latestHealth?.healthy || 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-gray-500">
                  {latestHealth?.warning || 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-gray-500">
                  {latestHealth?.critical || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

interface MiniChartProps {
  icon: React.ElementType;
  title: string;
  value: number;
  data: Array<{ date: string; value: number }>;
  color: string;
}

function MiniChart({ icon: Icon, title, value, data, color }: MiniChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4" style={{ color }} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="h-[60px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#374151' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendChartsSkeleton() {
  return (
    <section>
      <Skeleton className="h-7 w-48 mb-4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-[60px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
