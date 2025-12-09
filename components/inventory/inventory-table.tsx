'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreVertical, Package, Calendar } from 'lucide-react';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StockStatus } from './stock-status';
import { getCategoryIcon, getCategoryLabel } from './category-tabs';
import { cn } from '@/lib/utils';

interface InventoryTableItem {
  _id: string;
  product_id: string;
  productName?: string;
  productSku?: string;
  productCategory?: string;
  quantity_available: number;
  quantity_unit: string;
  reorder_point?: number;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  supplier_id?: string;
  supplierName?: string;
  expiration_date?: number;
  stockStatus: string;
  lot_status: string;
}

interface InventoryTableProps {
  items: InventoryTableItem[];
  loading?: boolean;
  onRowClick?: (item: InventoryTableItem) => void;
  onEdit?: (item: InventoryTableItem) => void;
  onAdjustStock?: (item: InventoryTableItem) => void;
  onDelete?: (item: InventoryTableItem) => void;
}

export function InventoryTable({
  items,
  loading = false,
  onRowClick,
  onEdit,
  onAdjustStock,
  onDelete,
}: InventoryTableProps) {
  const columns = useMemo<ColumnDef<InventoryTableItem>[]>(
    () => [
      {
        accessorKey: 'productName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Producto" />
        ),
        cell: ({ row }) => {
          const item = row.original;
          const isExpiringSoon =
            item.expiration_date &&
            item.expiration_date < Date.now() + 30 * 24 * 60 * 60 * 1000;
          const isExpired = item.expiration_date && item.expiration_date < Date.now();

          return (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{item.productName || 'Sin nombre'}</p>
                  {(isExpiringSoon || isExpired) && (
                    <span
                      className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                        isExpired
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      {isExpired ? 'Vencido' : 'Por vencer'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{item.productSku || 'Sin SKU'}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'productCategory',
        header: 'Categoría',
        cell: ({ row }) => {
          const category = row.original.productCategory || 'other';
          return (
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCategoryIcon(category)}</span>
              <span className="text-sm text-gray-700">{getCategoryLabel(category)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'quantity_available',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cantidad" />
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {item.quantity_available}
              </span>
              <span className="ml-1 text-gray-500">{item.quantity_unit}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'stockStatus',
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.original.stockStatus as any;
          return <StockStatus status={status} />;
        },
      },
      {
        accessorKey: 'reorder_point',
        header: 'Punto Reorden',
        cell: ({ row }) => {
          const item = row.original;
          if (!item.reorder_point) {
            return <span className="text-sm text-gray-400">-</span>;
          }
          return (
            <div className="text-sm text-gray-700">
              {item.reorder_point} {item.quantity_unit}
            </div>
          );
        },
      },
      {
        accessorKey: 'supplierName',
        header: 'Proveedor',
        cell: ({ row }) => {
          const supplier = row.original.supplierName;
          return (
            <div className="max-w-[150px] truncate text-sm text-gray-700">
              {supplier || '-'}
            </div>
          );
        },
      },
      {
        accessorKey: 'expiration_date',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vencimiento" />
        ),
        cell: ({ row }) => {
          const date = row.original.expiration_date;
          if (!date) {
            return <span className="text-sm text-gray-400">-</span>;
          }

          const expirationDate = new Date(date);
          const daysUntilExpiration = Math.floor(
            (date - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const isExpired = daysUntilExpiration < 0;
          const isExpiringSoon = daysUntilExpiration >= 0 && daysUntilExpiration <= 30;

          return (
            <div className="text-sm">
              <div
                className={cn(
                  'font-medium',
                  isExpired && 'text-red-600',
                  isExpiringSoon && 'text-orange-600',
                  !isExpired && !isExpiringSoon && 'text-gray-700'
                )}
              >
                {expirationDate.toLocaleDateString('es-CO')}
              </div>
              {isExpiringSoon && !isExpired && (
                <div className="text-xs text-orange-600">
                  {daysUntilExpiration} días
                </div>
              )}
              {isExpired && (
                <div className="text-xs text-red-600">Vencido</div>
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const item = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Abrir menú</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onRowClick?.(item)}>
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onAdjustStock && (
                  <DropdownMenuItem onClick={() => onAdjustStock(item)}>
                    Ajustar stock
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(item)}
                      className="text-red-600"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onRowClick, onEdit, onAdjustStock, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      onRowClick={onRowClick}
      loading={loading}
    />
  );
}
