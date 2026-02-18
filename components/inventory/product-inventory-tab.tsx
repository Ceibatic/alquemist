'use client';

import { useMemo, useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  AlertTriangle,
  Plus,
  Boxes,
  Lock,
  ClipboardList,
  Settings2,
} from 'lucide-react';
import { useFacility } from '@/components/providers/facility-provider';
import { InventoryAdjustSheet } from './inventory-adjust-sheet';

interface ProductInventoryTabProps {
  productId: string;
  productName: string;
  defaultUnit?: string;
  onAddStock: () => void;
}

const LOT_STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  quarantined: 'En cuarentena',
  reserved: 'Reservado',
  expired: 'Vencido',
  waste: 'Desecho',
  discontinued: 'Descontinuado',
};

const LOT_STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  quarantined: 'bg-yellow-100 text-yellow-800',
  reserved: 'bg-blue-100 text-blue-800',
  expired: 'bg-red-100 text-red-800',
  waste: 'bg-gray-100 text-gray-800',
  discontinued: 'bg-gray-100 text-gray-600',
};

export function ProductInventoryTab({
  productId,
  productName,
  defaultUnit,
  onAddStock,
}: ProductInventoryTabProps) {
  const { currentCompanyId } = useFacility();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adjustItemId, setAdjustItemId] = useState<Id<'inventory_items'> | null>(null);
  const [adjustSheetOpen, setAdjustSheetOpen] = useState(false);

  const handleAdjust = useCallback((itemId: Id<'inventory_items'>) => {
    setAdjustItemId(itemId);
    setAdjustSheetOpen(true);
  }, []);

  const inventoryItems = useQuery(
    api.inventory.list,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          product_id: productId as Id<'products'>,
          lot_status: statusFilter !== 'all' ? statusFilter : undefined,
          limit: 100,
        }
      : 'skip'
  );

  const stats = useMemo<CompactStat[]>(() => {
    if (!inventoryItems?.items) {
      return [
        { label: 'Disponible', value: 0, icon: Package, color: 'green' },
        { label: 'Reservado', value: 0, icon: Lock, color: 'blue' },
        { label: 'Comprometido', value: 0, icon: ClipboardList, color: 'default' },
        { label: 'Lotes', value: 0, icon: Boxes, color: 'default' },
      ];
    }

    const items = inventoryItems.items;
    const totalAvailable = items.reduce(
      (sum, i) => sum + (i.quantity_available || 0),
      0
    );
    const totalReserved = items.reduce(
      (sum, i) => sum + (i.quantity_reserved || 0),
      0
    );
    const totalCommitted = items.reduce(
      (sum, i) => sum + (i.quantity_committed || 0),
      0
    );
    const unit = defaultUnit || 'uds';

    return [
      {
        label: 'Disponible',
        value: `${totalAvailable} ${unit}`,
        icon: Package,
        color: 'green',
      },
      {
        label: 'Reservado',
        value: `${totalReserved} ${unit}`,
        icon: Lock,
        color: 'blue',
      },
      {
        label: 'Comprometido',
        value: `${totalCommitted} ${unit}`,
        icon: ClipboardList,
        color: 'default',
      },
      { label: 'Lotes', value: items.length, icon: Boxes, color: 'default' },
    ];
  }, [inventoryItems, defaultUnit]);

  if (inventoryItems === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const items = inventoryItems?.items || [];
  const hasItems = items.length > 0;

  const isExpiringSoon = (date?: string | number) => {
    if (!date) return false;
    const expDate = new Date(date);
    const now = new Date();
    const diffDays = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (date?: string | number) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const formatDate = (date?: string | number) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <CompactStats stats={stats} />

      {/* Filters & Actions */}
      <div className="flex items-center justify-between gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estado del lote" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="quarantined">En cuarentena</SelectItem>
            <SelectItem value="reserved">Reservado</SelectItem>
            <SelectItem value="expired">Vencido</SelectItem>
            <SelectItem value="waste">Desecho</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={onAddStock}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Stock
        </Button>
      </div>

      {/* Table */}
      {!hasItems ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-600 mb-1">
              Sin inventario
            </p>
            <p className="text-sm text-gray-500 mb-4">
              No hay items de inventario para {productName}
            </p>
            <Button
              onClick={onAddStock}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Stock
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                  <TableHead className="text-right">Reservado</TableHead>
                  <TableHead>Recepcion</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Costo/Ud</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-mono text-sm">
                      {item.batch_number || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.quantity_available ?? 0} {item.quantity_unit || defaultUnit || ''}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {item.quantity_reserved ?? 0}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(item.received_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {isExpired(item.expiration_date) && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                        {isExpiringSoon(item.expiration_date) && (
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        )}
                        <span
                          className={`text-sm ${
                            isExpired(item.expiration_date)
                              ? 'text-red-600 font-medium'
                              : isExpiringSoon(item.expiration_date)
                                ? 'text-yellow-600'
                                : ''
                          }`}
                        >
                          {formatDate(item.expiration_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          LOT_STATUS_COLORS[item.lot_status || 'available'] || ''
                        }
                      >
                        {LOT_STATUS_LABELS[item.lot_status || 'available'] || item.lot_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.cost_per_unit != null
                        ? new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                          }).format(item.cost_per_unit)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAdjust(item._id)}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {adjustItemId && (
        <InventoryAdjustSheet
          open={adjustSheetOpen}
          onOpenChange={setAdjustSheetOpen}
          inventoryItemId={adjustItemId}
        />
      )}
    </div>
  );
}
