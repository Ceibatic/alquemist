'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  Skull,
  Scissors,
  Merge,
  Leaf,
  TrendingUp,
  Activity,
  MapPin,
  User,
  Calendar,
} from 'lucide-react';

interface BatchActivitiesTabProps {
  batchId: Id<'batches'>;
}

const activityTypeLabels: Record<string, string> = {
  movement: 'Movimiento',
  loss_record: 'Perdida',
  split: 'Division',
  merge: 'Fusion',
  harvest: 'Cosecha',
  phase_transition: 'Transicion de Fase',
  watering: 'Riego',
  feeding: 'Fertilizacion',
  pruning: 'Poda',
  inspection: 'Inspeccion',
  treatment: 'Tratamiento',
  inventory_transformation: 'Transformacion de Inventario',
};

const activityTypeIcons: Record<string, any> = {
  movement: ArrowRight,
  loss_record: Skull,
  split: Scissors,
  merge: Merge,
  harvest: Leaf,
  phase_transition: TrendingUp,
  watering: Activity,
  feeding: Activity,
  pruning: Activity,
  inspection: Activity,
  treatment: Activity,
  inventory_transformation: TrendingUp,
};

const activityTypeColors: Record<string, string> = {
  movement: 'text-blue-600 bg-blue-100',
  loss_record: 'text-red-600 bg-red-100',
  split: 'text-purple-600 bg-purple-100',
  merge: 'text-indigo-600 bg-indigo-100',
  harvest: 'text-green-600 bg-green-100',
  phase_transition: 'text-amber-600 bg-amber-100',
  watering: 'text-cyan-600 bg-cyan-100',
  feeding: 'text-lime-600 bg-lime-100',
  pruning: 'text-teal-600 bg-teal-100',
  inspection: 'text-gray-600 bg-gray-100',
  treatment: 'text-orange-600 bg-orange-100',
  inventory_transformation: 'text-amber-600 bg-amber-100',
};

export function BatchActivitiesTab({ batchId }: BatchActivitiesTabProps) {
  const activities = useQuery(api.activities.listByBatch, {
    batchId,
    limit: 100,
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (activities === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay actividades registradas
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Las actividades realizadas en este lote apareceran aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'} registradas
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Linea de Tiempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            {activities.map((activity: any, index: number) => {
              const Icon = activityTypeIcons[activity.activity_type] || Activity;
              const colorClass = activityTypeColors[activity.activity_type] || 'text-gray-600 bg-gray-100';
              const label = activityTypeLabels[activity.activity_type] || activity.activity_type;

              return (
                <div key={activity._id} className="relative flex gap-4 pl-0">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pb-4">
                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                        {activity.performedByName && (
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.performedByName}
                          </div>
                        )}
                      </div>

                      {/* Before/after quantities */}
                      {(activity.quantity_before !== undefined || activity.quantity_after !== undefined) && (
                        <div className="flex items-center gap-2 text-sm mt-2">
                          {activity.quantity_before !== undefined && (
                            <span className="text-gray-600">
                              Antes: <span className="font-medium">{activity.quantity_before}</span>
                            </span>
                          )}
                          {activity.quantity_before !== undefined && activity.quantity_after !== undefined && (
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          )}
                          {activity.quantity_after !== undefined && (
                            <span className="text-gray-600">
                              Despues: <span className="font-medium">{activity.quantity_after}</span>
                            </span>
                          )}
                          {activity.quantity_before !== undefined && activity.quantity_after !== undefined && (
                            <span className={`ml-2 font-medium ${
                              activity.quantity_after < activity.quantity_before ? 'text-red-600' : 'text-green-600'
                            }`}>
                              ({activity.quantity_after > activity.quantity_before ? '+' : ''}
                              {activity.quantity_after - activity.quantity_before})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Area transitions for movements */}
                      {(activity.area_from || activity.area_to) && (
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {activity.area_from && (
                            <span className="text-gray-600">Desde area origen</span>
                          )}
                          {activity.area_from && activity.area_to && (
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          )}
                          {activity.area_to && (
                            <span className="text-gray-600">Hacia area destino</span>
                          )}
                        </div>
                      )}

                      {/* Phase transition details */}
                      {activity.activity_type === 'phase_transition' && activity.activity_metadata && (
                        <div className="text-sm mt-2 text-gray-600">
                          <span className="font-medium">
                            {activity.activity_metadata.previous_phase}
                          </span>
                          {' → '}
                          <span className="font-medium">
                            {activity.activity_metadata.new_phase}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {activity.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-700">{activity.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
