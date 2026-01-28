'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ChevronRight,
  Calendar,
  Leaf,
  MapPin,
  ClipboardCheck,
  Play,
  CheckSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OperativeDashboardData } from '@/hooks/use-home-dashboard';
import { cn } from '@/lib/utils';

interface OperativeDashboardProps {
  data: OperativeDashboardData;
}

export function OperativeDashboard({ data }: OperativeDashboardProps) {
  const totalTasks =
    data.todaysTasks.pending + data.todaysTasks.completed + data.todaysTasks.overdue;

  return (
    <div className="space-y-6">
      {/* Today's Overview */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Resumen del Dia
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TaskCard
            icon={Clock}
            title="Tareas Pendientes"
            value={data.todaysTasks.pending}
            variant={data.todaysTasks.pending > 0 ? 'warning' : 'default'}
          />
          <TaskCard
            icon={CheckCircle2}
            title="Completadas Hoy"
            value={data.todaysTasks.completed}
            variant="success"
          />
          <TaskCard
            icon={AlertTriangle}
            title="Atrasadas"
            value={data.todaysTasks.overdue}
            variant={data.todaysTasks.overdue > 0 ? 'danger' : 'default'}
          />
          <TaskCard
            icon={Layers}
            title="Lotes Asignados"
            value={data.quickStats.activeBatchesAssigned}
            href="/batches"
          />
        </div>
      </section>

      {/* Progress Ring for Today */}
      {totalTasks > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900">
                  Progreso del Dia
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {data.todaysTasks.completed} de {totalTasks} tareas completadas
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-700">
                    {Math.round((data.todaysTasks.completed / totalTasks) * 100)}%
                  </div>
                </div>
                <div className="h-16 w-16 relative">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-green-200"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={
                        2 * Math.PI * 28 * (1 - data.todaysTasks.completed / totalTasks)
                      }
                      className="text-green-600"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-blue-500" />
              Proximas Actividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingActivities.length === 0 ? (
              <EmptyState
                icon={Calendar}
                message="No hay actividades programadas"
              />
            ) : (
              <div className="space-y-3">
                {data.upcomingActivities.slice(0, 5).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
                {data.upcomingActivities.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    Ver todas ({data.upcomingActivities.length})
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Completed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="h-5 w-5 text-green-500" />
              Actividades Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentCompletedActivities.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                message="No hay actividades completadas hoy"
              />
            ) : (
              <div className="space-y-3">
                {data.recentCompletedActivities.map((activity) => (
                  <CompletedActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Batches */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-5 w-5 text-green-600" />
              Mis Lotes
            </CardTitle>
            <Link href="/batches">
              <Button variant="outline" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.myBatches.length === 0 ? (
            <EmptyState
              icon={Layers}
              message="No tienes lotes asignados"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.myBatches.slice(0, 6).map((batch) => (
                <BatchCard key={batch.id} batch={batch} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for Operative */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Acciones Rapidas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionButton
            icon={Play}
            label="Iniciar Actividad"
            href="/activities/new"
          />
          <QuickActionButton
            icon={ClipboardCheck}
            label="Control de Calidad"
            href="/quality-checks"
            badge={
              data.quickStats.pendingQualityChecks > 0
                ? data.quickStats.pendingQualityChecks.toString()
                : undefined
            }
          />
          <QuickActionButton
            icon={Layers}
            label="Ver Lotes"
            href="/batches"
          />
          <QuickActionButton
            icon={Calendar}
            label="Calendario"
            href="/activities"
          />
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface TaskCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  href?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function TaskCard({
  icon: Icon,
  title,
  value,
  href,
  variant = 'default',
}: TaskCardProps) {
  const variantStyles = {
    default: {
      card: 'bg-gray-50 border-gray-200',
      icon: 'text-gray-600 bg-gray-100',
      value: 'text-gray-900',
    },
    success: {
      card: 'bg-green-50 border-green-200',
      icon: 'text-green-700 bg-green-100',
      value: 'text-green-700',
    },
    warning: {
      card: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-700 bg-amber-100',
      value: 'text-amber-700',
    },
    danger: {
      card: 'bg-red-50 border-red-200',
      icon: 'text-red-700 bg-red-100',
      value: 'text-red-700',
    },
  };

  const styles = variantStyles[variant];

  const content = (
    <Card className={cn('transition-all', styles.card, href && 'cursor-pointer hover:shadow-md')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </p>
            <p className={cn('mt-1 text-2xl font-bold', styles.value)}>
              {value}
            </p>
          </div>
          <div className={cn('p-2 rounded-lg', styles.icon)}>
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

interface ActivityItemProps {
  activity: OperativeDashboardData['upcomingActivities'][0];
}

function ActivityItem({ activity }: ActivityItemProps) {
  const priorityStyles = {
    high: 'bg-red-100 text-red-700 border-red-200',
    normal: 'bg-gray-100 text-gray-700 border-gray-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const priorityConfig = priorityStyles[activity.priority as keyof typeof priorityStyles] ||
    priorityStyles.normal;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Manana, ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-CO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 capitalize">
            {activity.activityType.replace(/_/g, ' ')}
          </span>
          {activity.priority === 'high' && (
            <Badge variant="secondary" className={priorityConfig}>
              Urgente
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatDate(activity.scheduledDate)}</span>
          {activity.batchCode && (
            <>
              <span className="text-gray-300">|</span>
              <Layers className="h-3 w-3" />
              <span>{activity.batchCode}</span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400" />
    </div>
  );
}

interface CompletedActivityItemProps {
  activity: OperativeDashboardData['recentCompletedActivities'][0];
}

function CompletedActivityItem({ activity }: CompletedActivityItemProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
      <div className="flex-shrink-0">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-green-900 capitalize">
          {activity.activityType.replace(/_/g, ' ')}
        </span>
        <div className="text-sm text-green-700">
          {activity.batchCode && <span>{activity.batchCode} - </span>}
          <span>{formatTime(activity.completedAt)}</span>
        </div>
      </div>
    </div>
  );
}

interface BatchCardProps {
  batch: OperativeDashboardData['myBatches'][0];
}

function BatchCard({ batch }: BatchCardProps) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={`/batches/${batch.id}` as any}>
      <Card className="hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <span className="font-mono text-sm font-semibold text-gray-900">
              {batch.batchCode}
            </span>
            <BatchStatusBadge status={batch.status} />
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {batch.cultivarName || 'Sin cultivar'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Leaf className="h-3 w-3" />
              <span>{batch.plantsActive} plantas</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{batch.daysInProduction}d</span>
            </div>
            {batch.areaName && (
              <div className="flex items-center gap-1 col-span-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{batch.areaName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface QuickActionButtonProps {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

function QuickActionButton({
  icon: Icon,
  label,
  href,
  badge,
}: QuickActionButtonProps) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={href as any}>
      <Card className="hover:shadow-md hover:border-green-300 transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-700">
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-medium text-gray-900">{label}</span>
            {badge && (
              <Badge variant="destructive" className="ml-auto">
                {badge}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
}

function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
      <Icon className="h-8 w-8 mb-2" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

function BatchStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Activo', className: 'bg-green-100 text-green-700' },
    completed: { label: 'Completado', className: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
    planning: { label: 'Planificacion', className: 'bg-gray-100 text-gray-700' },
  };
  const { label, className } = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' };
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
}
