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
import {
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Trash2,
  ArrowRightLeft,
  Package,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface InventoryTransactionHistoryProps {
  inventoryId: string;
  limit?: number;
}

// Transaction type labels
const transactionTypeLabels: Record<string, string> = {
  addition: 'Entrada',
  consumption: 'Consumo',
  waste: 'Desperdicio',
  transfer: 'Transferencia',
  correction: 'Corrección',
  receipt: 'Recepción',
};

// Transaction type icons
const transactionTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  addition: ArrowUpCircle,
  consumption: ArrowDownCircle,
  waste: Trash2,
  transfer: ArrowRightLeft,
  correction: RefreshCw,
  receipt: Package,
};

// Badge colors for transaction types
const transactionTypeBadgeColors: Record<string, string> = {
  addition: 'bg-green-100 text-green-800',
  consumption: 'bg-blue-100 text-blue-800',
  waste: 'bg-red-100 text-red-800',
  transfer: 'bg-purple-100 text-purple-800',
  correction: 'bg-amber-100 text-amber-800',
  receipt: 'bg-green-100 text-green-800',
};

export function InventoryTransactionHistory({
  inventoryId,
  limit = 20,
}: InventoryTransactionHistoryProps) {
  const transactions = useQuery(api.inventory.getTransactionHistory, {
    inventoryId: inventoryId as Id<'inventory_items'>,
    limit,
  });

  const formatQuantity = (quantity: number, unit: string) => {
    const sign = quantity > 0 ? '+' : '';
    return `${sign}${quantity.toLocaleString('es-CO')} ${unit}`;
  };

  if (transactions === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Movimientos
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

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Movimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay movimientos registrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Movimientos
          <Badge variant="secondary" className="ml-2">
            {transactions.length} {transactions.length === 1 ? 'movimiento' : 'movimientos'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cambio</TableHead>
                <TableHead className="text-right">Antes</TableHead>
                <TableHead className="text-right">Después</TableHead>
                <TableHead>Razón</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const TypeIcon =
                  transactionTypeIcons[tx.transaction_type] || RefreshCw;
                const isPositive = tx.quantity_change > 0;

                return (
                  <TableRow key={tx._id}>
                    <TableCell className="whitespace-nowrap">
                      <div
                        className="text-sm"
                        title={new Date(tx.performed_at).toLocaleString('es-CO', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        })}
                      >
                        {formatDistanceToNow(new Date(tx.performed_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${transactionTypeBadgeColors[tx.transaction_type] || 'bg-gray-100'} flex items-center gap-1 w-fit`}
                      >
                        <TypeIcon className="h-3 w-3" />
                        {transactionTypeLabels[tx.transaction_type] ||
                          tx.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatQuantity(tx.quantity_change, tx.quantity_unit)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-gray-500">
                      {tx.quantity_before.toLocaleString('es-CO')}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {tx.quantity_after.toLocaleString('es-CO')}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={tx.reason}>
                        {tx.reason}
                      </div>
                      {tx.notes && (
                        <div
                          className="text-xs text-gray-400 truncate"
                          title={tx.notes}
                        >
                          {tx.notes}
                        </div>
                      )}
                      {tx.transaction_type === 'transfer' &&
                        (tx.sourceAreaName || tx.destinationAreaName) && (
                          <div className="text-xs text-purple-600">
                            {tx.sourceAreaName} → {tx.destinationAreaName}
                          </div>
                        )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{tx.performedByName}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
