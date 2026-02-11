'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

const UTILITY_TYPE_LABELS: Record<string, string> = {
  electricity: 'Electricidad',
  water: 'Agua',
  gas: 'Gas',
};

const ALLOCATION_STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  pending: { label: 'Pendiente', variant: 'outline' },
  allocated: { label: 'Prorrateado', variant: 'default' },
  no_batches: { label: 'Sin batches', variant: 'secondary' },
};

interface UtilityReadingsTableProps {
  facilityId: Id<'facilities'>;
}

export function UtilityReadingsTable({
  facilityId,
}: UtilityReadingsTableProps) {
  const readings = useQuery(api.utilities.getByFacility, {
    facility_id: facilityId,
    limit: 24,
  });
  const allocate = useMutation(api.utilities.allocateToActiveBatches);
  const [allocatingId, setAllocatingId] = useState<string | null>(null);

  const handleAllocate = async (readingId: Id<'utility_readings'>) => {
    setAllocatingId(readingId);
    try {
      const result = await allocate({ readingId });
      if (result.allocated === 0) {
        toast.info('No hay batches activos. Costo registrado como overhead.');
      } else {
        toast.success(
          `Costo prorrateado a ${result.allocated} batch${result.allocated > 1 ? 'es' : ''}`
        );
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al prorratear');
    } finally {
      setAllocatingId(null);
    }
  };

  if (readings === undefined) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay lecturas registradas.</p>
        <p className="text-sm mt-1">
          Registra tu primera lectura de medidor para comenzar a trackear costos
          de utilities.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Periodo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Consumo</TableHead>
            <TableHead className="text-right">Costo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading) => {
            const statusInfo = ALLOCATION_STATUS_LABELS[
              reading.allocation_status
            ] || {
              label: reading.allocation_status,
              variant: 'outline' as const,
            };
            const isAllocating = allocatingId === reading._id;

            return (
              <TableRow key={reading._id}>
                <TableCell className="font-medium">{reading.period}</TableCell>
                <TableCell>
                  {UTILITY_TYPE_LABELS[reading.utility_type] ||
                    reading.utility_type}
                </TableCell>
                <TableCell className="text-right">
                  {reading.consumption.toLocaleString('es-CO')}{' '}
                  {reading.consumption_unit}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${reading.cost_total.toLocaleString('es-CO')}
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-gray-500">
                  {new Date(reading.created_at).toLocaleDateString('es-CO')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleAllocate(reading._id as Id<'utility_readings'>)
                    }
                    disabled={isAllocating}
                    title={
                      reading.allocation_status === 'allocated'
                        ? 'Re-prorratear'
                        : 'Prorratear a batches'
                    }
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    {isAllocating
                      ? 'Prorrateando...'
                      : reading.allocation_status === 'allocated'
                        ? 'Re-prorratear'
                        : 'Prorratear'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
