'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Leaf,
  Ruler,
  Activity,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Scissors,
  Camera,
  FileText,
  Heart,
  Clock,
} from 'lucide-react';
import { PlantMeasurementModal } from './plant-measurement-modal';
import { PlantLossModal } from './plant-loss-modal';

interface PlantDetailDrawerProps {
  plantId: Id<'plants'> | null;
  onClose: () => void;
  userId: Id<'users'>;
}

export function PlantDetailDrawer({
  plantId,
  onClose,
  userId,
}: PlantDetailDrawerProps) {
  const { toast } = useToast();
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);

  const plant = useQuery(
    api.plants.getById,
    plantId ? { plantId } : 'skip'
  );

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const healthStyles = {
    healthy: 'bg-green-100 text-green-700',
    stressed: 'bg-amber-100 text-amber-700',
    sick: 'bg-red-100 text-red-700',
  };

  const healthLabels = {
    healthy: 'Sana',
    stressed: 'Estresada',
    sick: 'Enferma',
  };

  const statusLabels: Record<string, string> = {
    active: 'Activa',
    harvested: 'Cosechada',
    lost: 'Perdida',
    transferred: 'Transferida',
  };

  const activityLabels: Record<string, string> = {
    measurement: 'Medicion',
    movement: 'Movimiento',
    pruning: 'Poda',
    treatment: 'Tratamiento',
    fertilization: 'Fertilizacion',
    inspection: 'Inspeccion',
    cloning: 'Clonacion',
    harvest: 'Cosecha',
  };

  return (
    <>
      <Sheet open={!!plantId} onOpenChange={() => onClose()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {plant === undefined ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-24" />
              <Skeleton className="h-48" />
            </div>
          ) : plant === null ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Planta no encontrada</p>
            </div>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  {plant.plant_code}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status Header */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      healthStyles[plant.health_status as keyof typeof healthStyles]
                    }
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    {healthLabels[plant.health_status as keyof typeof healthLabels]}
                  </Badge>
                  <Badge variant="outline">
                    {statusLabels[plant.status] || plant.status}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {plant.daysInProduction}d en produccion
                  </Badge>
                </div>

                {/* Quick Actions */}
                {plant.status === 'active' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => setShowMeasurementModal(true)}
                    >
                      <Ruler className="h-4 w-4 mr-2" />
                      Medir
                    </Button>
                    <Button size="sm" variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Foto
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setShowLossModal(true)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Perdida
                    </Button>
                  </div>
                )}

                {/* Info Tabs */}
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="measurements">Mediciones</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                  </TabsList>

                  {/* Info Tab */}
                  <TabsContent value="info" className="mt-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Metricas Actuales</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {plant.current_height_cm || '-'}
                            </p>
                            <p className="text-xs text-gray-500">Altura (cm)</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {plant.current_nodes || '-'}
                            </p>
                            <p className="text-xs text-gray-500">Nodos</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {plant.stem_diameter_mm || '-'}
                            </p>
                            <p className="text-xs text-gray-500">Tallo (mm)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Informacion</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Lote</span>
                          <span className="font-medium">{plant.batchCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cultivar</span>
                          <span className="font-medium">
                            {plant.cultivarName || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fase</span>
                          <span className="font-medium capitalize">
                            {plant.plant_stage || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Area</span>
                          <span className="font-medium">{plant.areaName || '-'}</span>
                        </div>
                        {plant.motherPlantCode && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Planta Madre</span>
                            <span className="font-medium text-purple-600">
                              {plant.motherPlantCode}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fecha Plantacion</span>
                          <span className="font-medium">
                            {formatDate(plant.planted_date)}
                          </span>
                        </div>
                        {plant.clones_taken_count > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Clones Tomados</span>
                            <span className="font-medium text-purple-600">
                              {plant.clones_taken_count}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Offspring */}
                    {plant.offspring && plant.offspring.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Scissors className="h-4 w-4" />
                            Clones ({plant.offspring.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {plant.offspring.map((clone: any) => (
                              <div
                                key={clone._id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="font-mono text-sm">
                                  {clone.plant_code}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={
                                    healthStyles[
                                      clone.health_status as keyof typeof healthStyles
                                    ]
                                  }
                                >
                                  {clone.health_status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Measurements Tab */}
                  <TabsContent value="measurements" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>Historial de Mediciones</span>
                          {plant.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowMeasurementModal(true)}
                            >
                              + Nueva
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {plant.measurements && plant.measurements.length > 0 ? (
                          <div className="space-y-3">
                            {plant.measurements.map((m: any) => (
                              <div
                                key={m._id}
                                className="p-3 border rounded-lg space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="secondary"
                                    className={
                                      healthStyles[
                                        m.health_status as keyof typeof healthStyles
                                      ]
                                    }
                                  >
                                    {healthLabels[m.health_status as keyof typeof healthLabels]}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(m.measurement_date)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  {m.height_cm && (
                                    <div>
                                      <span className="text-gray-500">Altura:</span>{' '}
                                      {m.height_cm} cm
                                    </div>
                                  )}
                                  {m.nodes && (
                                    <div>
                                      <span className="text-gray-500">Nodos:</span>{' '}
                                      {m.nodes}
                                    </div>
                                  )}
                                  {m.stem_diameter_mm && (
                                    <div>
                                      <span className="text-gray-500">Tallo:</span>{' '}
                                      {m.stem_diameter_mm} mm
                                    </div>
                                  )}
                                </div>
                                {m.notes && (
                                  <p className="text-sm text-gray-600">{m.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Sin mediciones registradas</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* History Tab */}
                  <TabsContent value="history" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Historial de Actividades
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {plant.activities && plant.activities.length > 0 ? (
                          <div className="space-y-3">
                            {plant.activities.map((activity: any) => (
                              <div
                                key={activity._id}
                                className="p-3 border rounded-lg"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium capitalize">
                                      {activityLabels[activity.activity_type] ||
                                        activity.activity_type}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(activity.activity_date)}
                                  </span>
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {activity.description}
                                  </p>
                                )}
                                {activity.notes && (
                                  <p className="text-sm text-gray-500 mt-1 italic">
                                    {activity.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Sin actividades registradas</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modals */}
      {plant && (
        <>
          <PlantMeasurementModal
            open={showMeasurementModal}
            onClose={() => setShowMeasurementModal(false)}
            plantId={plant._id}
            userId={userId}
          />
          <PlantLossModal
            open={showLossModal}
            onClose={() => setShowLossModal(false)}
            plantId={plant._id}
            plantCode={plant.plant_code}
          />
        </>
      )}
    </>
  );
}
