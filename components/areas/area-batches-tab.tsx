'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, QrCode } from 'lucide-react';

interface AreaBatchesTabProps {
  areaId: Id<'areas'>;
  companyId: string;
}

const batchTypeLabels: Record<string, string> = {
  propagation: 'Propagacion',
  growth: 'Crecimiento',
  harvest: 'Cosecha',
};

const batchStatusMap: Record<string, string> = {
  active: 'active',
  completed: 'inactive',
  harvested: 'inactive',
  destroyed: 'maintenance',
  archived: 'inactive',
};

export function AreaBatchesTab({ areaId, companyId }: AreaBatchesTabProps) {
  const batches = useQuery(
    api.batches.list,
    companyId
      ? {
          companyId: companyId as Id<'companies'>,
          areaId: areaId,
        }
      : 'skip'
  );

  if (batches === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const total = batches.length;

  if (total === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay lotes en esta area
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Los lotes de produccion aparecern aqui cuando se creen en esta area.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {total} {total === 1 ? 'lote' : 'lotes'} en esta area
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch: any) => (
              <TableRow key={batch._id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-gray-400" />
                    <span className="text-xs">{batch.qr_code}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(batch.created_date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  {batchTypeLabels[batch.batch_type] || batch.batch_type}
                </TableCell>
                <TableCell>
                  {batch.current_quantity.toLocaleString()}
                </TableCell>
                <TableCell className="text-gray-600">
                  {batch.unit_of_measure}
                </TableCell>
                <TableCell className="text-right">
                  <StatusBadge
                    status={batchStatusMap[batch.status] || batch.status}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
