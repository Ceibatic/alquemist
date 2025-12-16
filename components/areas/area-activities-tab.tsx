'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, ArrowRight } from 'lucide-react';

interface AreaActivitiesTabProps {
  areaId: Id<'areas'>;
  companyId: string;
}

const activityTypeLabels: Record<string, string> = {
  watering: 'Riego',
  feeding: 'Fertilizacion',
  pruning: 'Poda',
  harvest: 'Cosecha',
  transplant: 'Trasplante',
  inspection: 'Inspeccion',
  treatment: 'Tratamiento',
  moving: 'Movimiento',
  planting: 'Siembra',
  drying: 'Secado',
  curing: 'Curado',
  packaging: 'Empaque',
};

export function AreaActivitiesTab({ areaId, companyId }: AreaActivitiesTabProps) {
  const activitiesData = useQuery(
    api.activities.list,
    companyId
      ? {
          companyId,
          entity_type: 'area',
          entity_id: areaId,
          limit: 50,
        }
      : 'skip'
  );

  if (activitiesData === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { activities, total } = activitiesData;

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay actividades registradas
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Las actividades realizadas en esta area apareceran aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {total} {total === 1 ? 'actividad' : 'actividades'} registradas
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Actividad Tipo</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity: any, index: number) => (
              <TableRow key={activity._id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-600">
                  {String(index + 1).padStart(5, '0')}
                </TableCell>
                <TableCell>
                  {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  {activityTypeLabels[activity.activity_type] || activity.activity_type}
                </TableCell>
                <TableCell className="text-gray-600">
                  {activity.area_from ? 'Origen' : '-'}
                </TableCell>
                <TableCell className="text-gray-600">
                  {activity.area_to ? 'Destino' : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {activity.quantity_after !== undefined
                    ? activity.quantity_after.toLocaleString()
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
