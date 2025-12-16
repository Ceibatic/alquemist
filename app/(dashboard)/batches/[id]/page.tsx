'use client';

import { use, useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
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
import { PlantsTab } from '@/components/plants';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Leaf,
  MapPin,
  Calendar,
  Info,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
  History,
  Scissors,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BatchDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const batchId = resolvedParams.id as Id<'batches'>;
  const { toast } = useToast();
  const router = useRouter();
  const [userId, setUserId] = useState<Id<'users'> | null>(null);

  // Get user ID from cookies
  useEffect(() => {
    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));
    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setUserId(userData.userId as Id<'users'>);
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

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

  const phaseLabels: Record<string, string> = {
    germination: 'Germinacion',
    seedling: 'Plantula',
    propagation: 'Propagacion',
    vegetative: 'Vegetativo',
    flowering: 'Floracion',
    harvest: 'Cosecha',
  };

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

  // Calculate survival rate
  const survivalRate =
    batch.initial_quantity > 0
      ? Math.round((batch.current_quantity / batch.initial_quantity) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={batch.batch_code}
        icon={Layers}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Lotes', href: '/batches' },
          { label: batch.batch_code },
        ]}
        description={`${batch.cultivarName || batch.cropTypeName || 'Sin cultivar'} - ${batch.areaName || 'Sin area'}`}
        action={
          batch.status === 'active' ? (
            <div className="flex gap-2">
              <Button variant="outline">
                <ArrowRight className="h-4 w-4 mr-2" />
                Mover
              </Button>
              <Button variant="outline">
                <Scissors className="h-4 w-4 mr-2" />
                Dividir
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Status and Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                <Leaf className="h-6 w-6" />
                {batch.current_quantity}
              </p>
              <p className="text-sm text-gray-500">Plantas Actuales</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">{batch.initial_quantity}</p>
              <p className="text-sm text-gray-500">Iniciales</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-semibold ${batch.lost_quantity > 0 ? 'text-red-600' : ''}`}>
                {batch.lost_quantity}
              </p>
              <p className="text-sm text-gray-500">Perdidas</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">{batch.daysInProduction}d</p>
              <p className="text-sm text-gray-500">En Produccion</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Supervivencia</span>
              <span className={`font-medium ${survivalRate < 90 ? 'text-amber-600' : 'text-green-600'}`}>
                {survivalRate}%
              </span>
            </div>
            <Progress value={survivalRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
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
            {batch.enable_individual_tracking && (
              <TabsTrigger
                value="plants"
                className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                <Leaf className="h-4 w-4" />
                Plantas ({batch.plantsCount || 0})
              </TabsTrigger>
            )}
            <TabsTrigger
              value="movements"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <ArrowRight className="h-4 w-4" />
              Movimientos
            </TabsTrigger>
            <TabsTrigger
              value="losses"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <TrendingDown className="h-4 w-4" />
              Perdidas
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

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
                        onClick={() => router.push(`/production-orders/${batch.production_order_id}`)}
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

        {/* Plants Tab */}
        {batch.enable_individual_tracking && userId && (
          <TabsContent value="plants" className="mt-6">
            <PlantsTab batchId={batchId} userId={userId} />
          </TabsContent>
        )}

        {/* Movements Tab */}
        <TabsContent value="movements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              {batch.movements && batch.movements.length > 0 ? (
                <div className="space-y-3">
                  {batch.movements.map((movement: any) => (
                    <div key={movement._id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{movement.reason}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(movement.movement_date)}
                        </span>
                      </div>
                      {movement.notes && (
                        <p className="text-sm text-gray-600 mt-1">{movement.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowRight className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay movimientos registrados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Losses Tab */}
        <TabsContent value="losses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registro de Perdidas</CardTitle>
            </CardHeader>
            <CardContent>
              {batch.losses && batch.losses.length > 0 ? (
                <div className="space-y-3">
                  {batch.losses.map((loss: any) => (
                    <div key={loss._id} className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-red-700">
                            {loss.quantity} plantas - {loss.reason}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(loss.detection_date)}
                        </span>
                      </div>
                      {loss.description && (
                        <p className="text-sm text-gray-600 mt-1">{loss.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay perdidas registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Cosechas</CardTitle>
            </CardHeader>
            <CardContent>
              {batch.harvests && batch.harvests.length > 0 ? (
                <div className="space-y-3">
                  {batch.harvests.map((harvest: any) => (
                    <div key={harvest._id} className="p-3 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-green-700">
                            {harvest.total_weight} {harvest.weight_unit}
                          </span>
                          <span className="mx-2 text-gray-400">|</span>
                          <span className="text-sm">Calidad: {harvest.quality_grade}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(harvest.harvest_date)}
                        </span>
                      </div>
                      {harvest.notes && (
                        <p className="text-sm text-gray-600 mt-1">{harvest.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay cosechas registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
