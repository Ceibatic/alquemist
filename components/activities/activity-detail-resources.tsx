'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package } from 'lucide-react';

interface ActivityDetailResourcesProps {
  activityId: Id<'activities'>;
}

const directionLabels: Record<string, string> = {
  consumed: 'Consumido',
  produced: 'Producido',
  applied: 'Aplicado',
  wasted: 'Desperdicio',
};

export function ActivityDetailResources({
  activityId,
}: ActivityDetailResourcesProps) {
  const resources = useQuery(api.activityResources.listByActivity, {
    activityId,
  });

  if (resources === undefined) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (resources.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Sin recursos registrados"
        description="No se registraron recursos consumidos o producidos en esta actividad."
      />
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Direccion</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead className="text-right">Costo unit.</TableHead>
            <TableHead className="text-right">Costo total</TableHead>
            <TableHead>Lote inv.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((res: any) => (
            <TableRow key={res._id}>
              <TableCell className="font-medium">
                {res.productName ?? res.product_id ?? '-'}
              </TableCell>
              <TableCell>
                {directionLabels[res.direction] ?? res.direction ?? '-'}
              </TableCell>
              <TableCell className="text-right">
                {res.quantity?.toLocaleString() ?? '-'}
              </TableCell>
              <TableCell>{res.quantity_unit ?? '-'}</TableCell>
              <TableCell className="text-right">
                {res.cost_per_unit != null
                  ? `$${res.cost_per_unit.toLocaleString()}`
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {res.cost_total != null
                  ? `$${res.cost_total.toLocaleString()}`
                  : '-'}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {res.batch_number ?? '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
