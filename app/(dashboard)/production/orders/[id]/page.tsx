'use client';

import { use, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { OrderBatchSummary } from '@/components/production-orders/order-batch-summary';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/user-provider';
import { ActivityExecutionSheet } from '@/components/activities/activity-execution-sheet';
import { ActivitySchedule } from '@/components/activities/activity-schedule';
import {
  ClipboardList,
  Play,
  Calendar,
  CheckCircle,
  Clock,
  Info,
  Activity,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductionOrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id as Id<'production_orders'>;
  const { toast } = useToast();
  const router = useRouter();
  const { userId } = useUser();

  const order = useQuery(api.productionOrders.getById, { orderId });
  const orderActivities = useQuery(api.activities.listByOrder, { orderId, limit: 50 });

  const activateOrder = useMutation(api.productionOrders.activate);
  const completePhase = useMutation(api.productionOrders.completePhase);
  // Ad-hoc execution sheet state
  const [executionSheetOpen, setExecutionSheetOpen] = useState(false);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleActivate = async () => {
    if (!userId) return;
    try {
      await activateOrder({
        orderId,
        approvedBy: userId as Id<'users'>,
      });
      toast({
        title: 'Orden activada',
        description: 'La orden ha sido activada correctamente.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo activar la orden.',
        variant: 'destructive',
      });
    }
  };

  const handleCompletePhase = async (phaseId: Id<'order_phases'>) => {
    try {
      const result = await completePhase({ orderId, phaseId });
      toast({
        title: result.isOrderComplete ? 'Orden completada' : 'Fase completada',
        description: result.message,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo completar la fase.',
        variant: 'destructive',
      });
    }
  };

  if (order === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-10" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Orden no encontrada</h2>
        <Button variant="link" onClick={() => router.push('/production?tab=orders')}>
          Volver a ordenes
        </Button>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    planning: 'En Planificacion',
    active: 'Activa',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  const getStatusBadgeStatus = () => {
    switch (order.status) {
      case 'active': return 'active';
      case 'planning': return 'maintenance';
      case 'completed': return 'inactive';
      default: return 'inactive';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.order_number}
        icon={ClipboardList}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Produccion', href: '/production' },
          { label: 'Ordenes', href: '/production?tab=orders' },
          { label: order.order_number },
        ]}
        description={order.templateName || order.cropTypeName || undefined}
        action={
          order.status === 'planning' ? (
            <Button
              onClick={handleActivate}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Activar Orden
            </Button>
          ) : undefined
        }
      />

      {/* Status and Progress Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusBadge
                status={getStatusBadgeStatus()}
                label={statusLabels[order.status]}
              />
              {order.priority === 'high' && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                  Alta Prioridad
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Progreso General</p>
              <p className="text-xl font-bold">{order.completion_percentage}%</p>
            </div>
          </div>
          <Progress value={order.completion_percentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Tabs — 3 tabs: Detalle, Fases, Actividades (no "Lotes" tab) */}
      <Tabs defaultValue="detail" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto p-1 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="detail"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Info className="h-4 w-4" />
              Detalle
            </TabsTrigger>
            <TabsTrigger
              value="phases"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Clock className="h-4 w-4" />
              Fases
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Activity className="h-4 w-4" />
              Actividades
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Detail Tab — includes batch summary inline */}
        <TabsContent value="detail" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* General Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informacion General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Orden</p>
                    <p className="font-medium capitalize">{order.order_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Fuente</p>
                    <p className="font-medium capitalize">{order.source_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cultivo</p>
                    <p className="font-medium">{order.cropTypeName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cultivar</p>
                    <p className="font-medium">{order.cultivarName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instalacion</p>
                    <p className="font-medium">{order.facilityName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Template</p>
                    <p className="font-medium">{order.templateName || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantities & Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cantidades y Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Plantas Planificadas</p>
                    <p className="text-xl font-bold">
                      {order.total_plants_planned?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plantas Actuales</p>
                    <p className="text-xl font-bold text-green-600">
                      {order.total_plants_actual?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha Inicio</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(order.actual_start_date || order.planned_start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha Estimada</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(order.estimated_completion_date)}
                    </p>
                  </div>
                </div>
                {order.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">Notas</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Batch Summary — inline in Detail tab (US-PRD.6) */}
          <div className="mt-4">
            <OrderBatchSummary
              batches={order.batches ?? []}
              orderStatus={order.status}
            />
          </div>
        </TabsContent>

        {/* Phases Tab */}
        <TabsContent value="phases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fases de Produccion</CardTitle>
            </CardHeader>
            <CardContent>
              {order.phases && order.phases.length > 0 ? (
                <div className="space-y-4">
                  {order.phases.map((phase: any, index: number) => (
                    <div
                      key={phase._id}
                      className={`p-4 border rounded-lg ${
                        phase.status === 'in_progress'
                          ? 'border-green-500 bg-green-50'
                          : phase.status === 'completed'
                          ? 'bg-gray-50'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              phase.status === 'completed'
                                ? 'bg-green-500 text-white'
                                : phase.status === 'in_progress'
                                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {phase.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{phase.phase_name}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(phase.planned_start_date)} -{' '}
                              {formatDate(phase.planned_end_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {phase.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => handleCompletePhase(phase._id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completar
                            </Button>
                          )}
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              phase.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : phase.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {phase.status === 'completed'
                              ? 'Completada'
                              : phase.status === 'in_progress'
                              ? 'En Progreso'
                              : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay fases definidas para esta orden</p>
                  <p className="text-sm">
                    Selecciona un template con fases o agregalas manualmente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="mt-6 space-y-6">
          {/* Action button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExecutionSheetOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Reportar Ad-hoc
            </Button>
          </div>

          {/* Scheduled Activities — uses ActivitySchedule component */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actividades Programadas</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivitySchedule
                scope={{ type: 'order', orderId }}
                compact
              />
            </CardContent>
          </Card>

          {/* Executed Activities History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              {orderActivities === undefined ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : orderActivities && orderActivities.length > 0 ? (
                <div className="space-y-2">
                  {orderActivities.map((activity: any) => (
                    <div
                      key={activity._id}
                      className="p-3 border rounded-lg bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {activity.activity_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.batchCode} • {activity.performedByName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {activity.quantity_before !== undefined &&
                          activity.quantity_after !== undefined &&
                          activity.quantity_before !== activity.quantity_after && (
                            <p className="text-xs">
                              {activity.quantity_before} → {activity.quantity_after}
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No hay actividades ejecutadas aun</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ad-hoc execution sheet */}
      <ActivityExecutionSheet
        open={executionSheetOpen}
        onOpenChange={setExecutionSheetOpen}
        onCompleted={() => setExecutionSheetOpen(false)}
      />
    </div>
  );
}
