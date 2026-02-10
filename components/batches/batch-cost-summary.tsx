'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign } from 'lucide-react';

interface BatchCostSummaryProps {
  batchId: Id<'batches'>;
}

const phaseLabels: Record<string, string> = {
  propagation: 'Propagacion',
  vegetative: 'Vegetativa',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  post_harvest: 'Post-cosecha',
  processing: 'Procesamiento',
  sin_fase: 'Sin fase',
};

const phaseBadgeColors: Record<string, string> = {
  propagation: 'bg-cyan-100 text-cyan-800',
  vegetative: 'bg-green-100 text-green-800',
  flowering: 'bg-purple-100 text-purple-800',
  harvest: 'bg-amber-100 text-amber-800',
  post_harvest: 'bg-orange-100 text-orange-800',
  processing: 'bg-blue-100 text-blue-800',
  sin_fase: 'bg-gray-100 text-gray-800',
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function BatchCostSummary({ batchId }: BatchCostSummaryProps) {
  const costData = useQuery(api.inventory.getCostByBatch, { batchId });

  if (costData === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Costos de Produccion (COGS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (costData.transactionCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Costos de Produccion (COGS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay transacciones con costo registradas para este lote</p>
            <p className="text-xs mt-1">Los costos se registran al aplicar insumos con tipo &quot;Aplicacion&quot;</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Costos de Produccion (COGS)
          <Badge variant="secondary" className="ml-2">
            {costData.transactionCount} {costData.transactionCount === 1 ? 'transaccion' : 'transacciones'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(costData.grandTotal)}
            </p>
            <p className="text-sm text-gray-500">Costo Total</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {costData.phases.length}
            </p>
            <p className="text-sm text-gray-500">Fases</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {costData.totalYield > 0
                ? `${costData.totalYield.toLocaleString('es-CO')} ${costData.yieldUnit}`
                : '-'}
            </p>
            <p className="text-sm text-gray-500">Rendimiento</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {costData.cogsPerUnit != null
                ? `${formatCurrency(costData.cogsPerUnit)}/${costData.yieldUnit}`
                : '-'}
            </p>
            <p className="text-sm text-gray-500">COGS por unidad</p>
          </div>
        </div>

        {/* Phase Breakdown */}
        {costData.phases.map((phase) => (
          <div key={phase.phase}>
            <div className="flex items-center justify-between mb-2">
              <Badge
                variant="secondary"
                className={phaseBadgeColors[phase.phase] || 'bg-gray-100'}
              >
                {phaseLabels[phase.phase] || phase.phase}
              </Badge>
              <span className="font-semibold">{formatCurrency(phase.total)}</span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Insumo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead className="text-right">Costo Total</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phase.transactions.map((tx) => (
                    <TableRow key={tx._id}>
                      <TableCell>
                        <div className="font-medium">{tx.product_name}</div>
                        <div className="text-xs text-gray-400">{tx.product_sku}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {tx.quantity_change.toLocaleString('es-CO')} {tx.quantity_unit}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(tx.cost_per_unit)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(tx.cost_total)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.performed_at).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
