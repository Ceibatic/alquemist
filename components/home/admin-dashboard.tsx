'use client';

import Link from 'next/link';
import {
  ClipboardList,
  Leaf,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  ChevronRight,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { AdminDashboardData } from '@/hooks/use-home-dashboard';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
  data: AdminDashboardData;
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Resumen General
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPICard
            icon={ClipboardList}
            title="Ordenes Activas"
            value={data.overview.activeOrders}
            href="/production-orders"
            variant="primary"
          />
          <KPICard
            icon={Leaf}
            title="Plantas Totales"
            value={data.overview.totalPlants.toLocaleString()}
            subtitle="en produccion"
          />
          <KPICard
            icon={Layers}
            title="Lotes Activos"
            value={data.overview.activeBatches}
            href="/batches"
          />
          <KPICard
            icon={MapPin}
            title="Areas en Uso"
            value={`${data.overview.areasInUse}/${data.overview.totalAreas}`}
            subtitle="areas"
            href="/areas"
          />
          <KPICard
            icon={TrendingUp}
            title="Avance Promedio"
            value={`${data.production.averageCompletion}%`}
            variant={data.production.averageCompletion > 50 ? 'success' : 'warning'}
          />
        </div>
      </section>

      {/* Production Status + Quality + Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Production Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-green-600" />
              Estado de Produccion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">En Progreso</span>
              </div>
              <span className="font-semibold">
                {data.production.ordersInProgress}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-sm text-gray-600">Pendientes</span>
              </div>
              <span className="font-semibold">
                {data.production.ordersPending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Completadas</span>
              </div>
              <span className="font-semibold">
                {data.production.ordersCompleted}
              </span>
            </div>
            <div className="pt-2 border-t">
              <Link href="/production-orders">
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todas las ordenes
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quality Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5 text-red-500" />
              Calidad de Lotes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tasa de Mortalidad</span>
                <span
                  className={cn(
                    'font-semibold',
                    data.quality.mortalityRate < 5
                      ? 'text-green-600'
                      : data.quality.mortalityRate < 15
                        ? 'text-amber-600'
                        : 'text-red-600'
                  )}
                >
                  {data.quality.mortalityRate}%
                </span>
              </div>
              <Progress
                value={Math.min(data.quality.mortalityRate, 100)}
                className={cn(
                  'h-2',
                  data.quality.mortalityRate < 5
                    ? '[&>div]:bg-green-500'
                    : data.quality.mortalityRate < 15
                      ? '[&>div]:bg-amber-500'
                      : '[&>div]:bg-red-500'
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {data.quality.healthyBatches}
                </div>
                <div className="text-xs text-green-600">Saludables</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">
                  {data.quality.warningBatches}
                </div>
                <div className="text-xs text-amber-600">En Riesgo</div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <Link href="/batches">
                <Button variant="ghost" size="sm" className="w-full">
                  Ver lotes
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas Activas
              {data.alerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {data.alerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm">Sin alertas pendientes</span>
              </div>
            ) : (
              <div className="space-y-3">
                {data.alerts.slice(0, 4).map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
                {data.alerts.length > 4 && (
                  <div className="pt-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver todas ({data.alerts.length})
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-gray-500" />
              Ordenes Recientes
            </CardTitle>
            <Link href="/production-orders">
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <ClipboardList className="h-8 w-8 mb-2" />
              <span className="text-sm">No hay ordenes recientes</span>
              <Link href="/production-orders/new" className="mt-2">
                <Button size="sm">Crear primera orden</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface KPICardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

function KPICard({
  icon: Icon,
  title,
  value,
  subtitle,
  href,
  variant = 'default',
}: KPICardProps) {
  const variantStyles = {
    default: 'bg-gray-50 border-gray-200',
    primary: 'bg-green-50 border-green-200',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
  };

  const iconStyles = {
    default: 'text-gray-600 bg-gray-100',
    primary: 'text-green-700 bg-green-100',
    success: 'text-emerald-700 bg-emerald-100',
    warning: 'text-amber-700 bg-amber-100',
  };

  const content = (
    <Card
      className={cn(
        'transition-all',
        variantStyles[variant],
        href && 'cursor-pointer hover:shadow-md'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-2 rounded-lg', iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link href={href as any} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

interface AlertItemProps {
  alert: AdminDashboardData['alerts'][0];
}

function AlertItem({ alert }: AlertItemProps) {
  const severityStyles = {
    critical: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconStyles = {
    critical: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        severityStyles[alert.severity]
      )}
    >
      <AlertCircle className={cn('h-5 w-5 mt-0.5', iconStyles[alert.severity])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{alert.message}</p>
        {alert.actionUrl && (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Link
            href={alert.actionUrl as any}
            className="text-xs underline hover:no-underline mt-1 inline-block"
          >
            Ver detalles
          </Link>
        )}
      </div>
    </div>
  );
}

interface OrderItemProps {
  order: AdminDashboardData['recentOrders'][0];
}

function OrderItem({ order }: OrderItemProps) {
  const statusConfig = {
    planning: { label: 'Planificacion', color: 'bg-gray-100 text-gray-700' },
    pending_approval: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
    active: { label: 'En Progreso', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[order.status as keyof typeof statusConfig] || {
    label: order.status,
    color: 'bg-gray-100 text-gray-700',
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={`/production-orders/${order.id}` as any}>
      <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {order.orderNumber}
            </span>
            <Badge variant="secondary" className={config.color}>
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {order.cultivarName || 'Sin cultivar'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">{order.progress}%</div>
            <Progress value={order.progress} className="w-16 h-1.5" />
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}
