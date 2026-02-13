'use client';

import { use, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { BatchStatsBar } from '@/components/batches/batch-stats-bar';
import { BatchActivitiesTable } from '@/components/batches/batch-activities-table';
import { BatchAnalyticsTab } from '@/components/batches/batch-analytics-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PHASE_LABELS } from '@/lib/constants/phases';
import { useRouter } from 'next/navigation';
import { ActivityExecutionSheet } from '@/components/activities/activity-execution-sheet';
import { ActivitySchedule } from '@/components/activities/activity-schedule';
import {
  Layers,
  MapPin,
  Calendar,
  CalendarCheck,
  Info,
  AlertTriangle,
  TrendingDown,
  Activity,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BatchDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const batchId = resolvedParams.id as Id<'batches'>;
  const router = useRouter();
  // Execution sheet state
  const [executionSheetOpen, setExecutionSheetOpen] = useState(false);

  const batch = useQuery(api.batches.getById, { batchId });

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Loading state
  if (batch === undefined) {
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

  // Not found
  if (batch === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Lote no encontrado</h2>
        <Button variant="link" onClick={() => router.push('/batches')}>
          Volver a lotes
        </Button>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    harvested: 'Cosechado',
    lost: 'Perdido',
    split: 'Dividido',
    merged: 'Fusionado',
    archived: 'Archivado',
  };

  const phaseLabels = PHASE_LABELS;

  const getStatusBadgeStatus = () => {
    switch (batch.status) {
      case 'active':
        return 'active';
      case 'harvested':
        return 'maintenance';
      case 'lost':
        return 'inactive';
      default:
        return 'inactive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={batch.batch_code}
        icon={Layers}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Produccion', href: '/production' },
          { label: batch.batch_code },
        ]}
        description={`${batch.cultivarName || batch.cropTypeName || 'Sin cultivar'} - ${batch.areaName || 'Sin area'}`}
        action={
          batch.status === 'active' ? (
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => setExecutionSheetOpen(true)}
            >
              <Activity className="h-4 w-4 mr-2" />
              Reportar Actividad
            </Button>
          ) : 'skip' as any
        }
      />

      {/* Status badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge
          status={getStatusBadgeStatus()}
          label={statusLabels[batch.status]}
        />
        <BatchStatsBar
          currentPhase={batch.current_phase}
          currentQuantity={batch.current_quantity}
          initialQuantity={batch.initial_quantity}
          lostQuantity={batch.lost_quantity}
          daysInProduction={batch.daysInProduction}
          currentPhaseInfo={batch.currentPhaseInfo}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="detail" className="w-full">
        <TabsList className="inline-flex h-auto p-1 bg-gray-100 rounded-lg">
          <TabsTrigger
            value="detail"
            className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
          >
            <Info className="h-4 w-4" />
            Detalle
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
          >
            <CalendarCheck className="h-4 w-4" />
            Programadas
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
          >
            <Activity className="h-4 w-4" />
            Actividades
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
          >
            <TrendingDown className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Detail Tab */}
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
                    <p className="text-sm text-gray-500">Codigo</p>
                    <p className="font-medium">{batch.batch_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <StatusBadge
                      status={getStatusBadgeStatus()}
                      label={statusLabels[batch.status]}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Lote</p>
                    <p className="font-medium capitalize">{batch.batch_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Fuente</p>
                    <p className="font-medium capitalize">{batch.source_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cultivo</p>
                    <p className="font-medium">{batch.cropTypeName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cultivar</p>
                    <p className="font-medium">{batch.cultivarName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fase Actual</p>
                    <p className="font-medium">
                      {phaseLabels[batch.current_phase || ''] || batch.current_phase || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rastreo</p>
                    <p className="font-medium">
                      {batch.enable_individual_tracking ? 'Individual' : 'Lote'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ubicacion y Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Instalacion</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {batch.facilityName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="font-medium">{batch.areaName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha Creacion</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(batch.created_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Germinacion</p>
                    <p className="font-medium">{formatDate(batch.germination_date)}</p>
                  </div>
                  {batch.orderNumber && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Orden de Produccion</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-green-700"
                        onClick={() => router.push(`/production/orders/${batch.production_order_id}`)}
                      >
                        {batch.orderNumber}
                      </Button>
                    </div>
                  )}
                </div>
                {batch.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">Notas</p>
                    <p className="text-sm whitespace-pre-line">{batch.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Child Batches (if split) */}
          {batch.childBatches && batch.childBatches.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Lotes Derivados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {batch.childBatches.map((child: any) => (
                    <div
                      key={child._id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/batches/${child._id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{child.batch_code}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {child.current_quantity} plantas
                          </span>
                          <StatusBadge status="active" size="sm" label={child.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scheduled Activities Tab */}
        <TabsContent value="scheduled" className="mt-6">
          <ActivitySchedule
            scope={{ type: 'batch', batchId }}
            compact
          />
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="mt-6">
          <BatchActivitiesTable
            batchId={batchId}
            orderPhases={batch.orderPhases ?? []}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <BatchAnalyticsTab
            batchId={batchId}
            orderPhases={batch.orderPhases ?? []}
            losses={batch.losses ?? []}
            initialQuantity={batch.initial_quantity}
          />
        </TabsContent>
      </Tabs>

      {/* Execution Sheet */}
      <ActivityExecutionSheet
        open={executionSheetOpen}
        onOpenChange={setExecutionSheetOpen}
        entityType="batch"
        entityId={batchId}
        batchIds={[batchId]}
        phase={batch.current_phase}
        onCompleted={() => setExecutionSheetOpen(false)}
      />
    </div>
  );
}
