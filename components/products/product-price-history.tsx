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
import { History, TrendingUp, TrendingDown, Minus, MessageSquare, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProductPriceHistoryProps {
  productId: string;
  limit?: number;
}

// Change type labels
const changeTypeLabels: Record<string, string> = {
  initial: 'Precio inicial',
  update: 'Actualización',
  correction: 'Corrección',
  promotion: 'Promoción',
  cost_increase: 'Aumento de costo',
};

// Change category labels
const changeCategoryLabels: Record<string, string> = {
  market_adjustment: 'Ajuste de mercado',
  supplier_change: 'Cambio de proveedor',
  inflation: 'Inflación',
  promotion: 'Promoción',
  error_correction: 'Corrección de error',
  cost_increase: 'Aumento de costos',
  cost_decrease: 'Reducción de costos',
  new_contract: 'Nuevo contrato',
  other: 'Otro',
};

// Badge colors for change types
const changeTypeBadgeColors: Record<string, string> = {
  initial: 'bg-blue-100 text-blue-800',
  update: 'bg-amber-100 text-amber-800',
  correction: 'bg-purple-100 text-purple-800',
  promotion: 'bg-green-100 text-green-800',
  cost_increase: 'bg-red-100 text-red-800',
};

export function ProductPriceHistory({ productId, limit = 10 }: ProductPriceHistoryProps) {
  const priceHistory = useQuery(api.products.getPriceHistory, {
    productId: productId as Id<'products'>,
    limit,
  });

  const formatPrice = (price: number | undefined, currency: string = 'COP') => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPriceChangeIcon = (oldPrice: number | undefined, newPrice: number) => {
    if (oldPrice === undefined || oldPrice === null) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
    if (newPrice > oldPrice) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    }
    if (newPrice < oldPrice) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const calculatePercentageChange = (oldPrice: number | undefined, newPrice: number) => {
    if (oldPrice === undefined || oldPrice === null || oldPrice === 0) return null;
    const change = ((newPrice - oldPrice) / oldPrice) * 100;
    return change.toFixed(1);
  };

  if (priceHistory === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Precios
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

  if (priceHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Precios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay cambios de precio registrados</p>
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
          Historial de Precios
          <Badge variant="secondary" className="ml-2">
            {priceHistory.length} {priceHistory.length === 1 ? 'cambio' : 'cambios'}
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
                <TableHead className="text-right">Precio Anterior</TableHead>
                <TableHead className="text-right">Nuevo Precio</TableHead>
                <TableHead className="text-center">Cambio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceHistory.map((record) => {
                const percentChange = calculatePercentageChange(
                  record.old_price,
                  record.new_price
                );

                return (
                  <TableRow key={record._id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm" title={new Date(record.changed_at).toLocaleString('es-CO', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })}>
                        {formatDistanceToNow(new Date(record.changed_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={changeTypeBadgeColors[record.change_type] || 'bg-gray-100'}
                      >
                        {changeTypeLabels[record.change_type] || record.change_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPrice(record.old_price, record.price_currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatPrice(record.new_price, record.price_currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getPriceChangeIcon(record.old_price, record.new_price)}
                        {percentChange && (
                          <span
                            className={`text-xs font-medium ${
                              parseFloat(percentChange) > 0
                                ? 'text-red-600'
                                : parseFloat(percentChange) < 0
                                  ? 'text-green-600'
                                  : 'text-gray-500'
                            }`}
                          >
                            {parseFloat(percentChange) > 0 ? '+' : ''}
                            {percentChange}%
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.change_category ? (
                        <span className="text-sm text-gray-600">
                          {changeCategoryLabels[record.change_category] ||
                            record.change_category}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{record.changedByName}</span>
                    </TableCell>
                    <TableCell>
                      {record.notes || record.change_reason ? (
                        <div
                          className="cursor-help"
                          title={`${record.change_reason || ''}${record.change_reason && record.notes ? ' - ' : ''}${record.notes || ''}`}
                        >
                          <MessageSquare className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
