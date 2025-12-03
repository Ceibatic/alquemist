'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Pencil, Power } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { getCategoryIcon, getCategoryLabel } from '@/lib/constants/suppliers';
import { cn } from '@/lib/utils';

// Use a more flexible type to accept Convex query results
interface SupplierData {
  _id: string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  product_categories: string[];
  is_active: boolean;
  is_approved: boolean;
}

interface SupplierTableProps {
  suppliers: SupplierData[];
  loading?: boolean;
  onToggleStatus?: (supplierId: string) => void;
}

export function SupplierTable({
  suppliers,
  loading = false,
  onToggleStatus,
}: SupplierTableProps) {
  // Cast suppliers to avoid type conflicts
  const supplierData = suppliers as any[];
  const router = useRouter();

  const columns = useMemo<ColumnDef<SupplierData>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nombre" />
        ),
        cell: ({ row }) => {
          const supplier = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {supplier.name}
              </span>
              {supplier.legal_name && (
                <span className="text-xs text-gray-500">
                  {supplier.legal_name}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'tax_id',
        header: 'NIT',
        cell: ({ row }) => {
          const taxId = row.original.tax_id;
          return taxId ? (
            <span className="text-sm text-gray-700">{taxId}</span>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          );
        },
      },
      {
        id: 'contact',
        header: 'Contacto',
        cell: ({ row }) => {
          const supplier = row.original;
          const email = supplier.primary_contact_email;
          const phone = supplier.primary_contact_phone;

          return (
            <div className="flex flex-col space-y-1">
              {email && (
                <span className="text-sm text-gray-700">{email}</span>
              )}
              {phone && (
                <span className="text-xs text-gray-500">{phone}</span>
              )}
              {!email && !phone && (
                <span className="text-sm text-gray-400">-</span>
              )}
            </div>
          );
        },
      },
      {
        id: 'categories',
        header: 'Categorías',
        cell: ({ row }) => {
          const categories = row.original.product_categories || [];
          if (categories.length === 0) {
            return <span className="text-sm text-gray-400">-</span>;
          }

          return (
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 3).map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="text-xs border-green-200 bg-green-50 text-green-700"
                >
                  <span className="mr-1">{getCategoryIcon(cat)}</span>
                  {getCategoryLabel(cat)}
                </Badge>
              ))}
              {categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{categories.length - 3}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const supplier = row.original;
          return (
            <div className="flex flex-col space-y-1">
              <Badge
                variant="outline"
                className={cn(
                  'w-fit text-xs',
                  supplier.is_active
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                )}
              >
                {supplier.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
              {supplier.is_approved && (
                <Badge
                  variant="outline"
                  className="w-fit text-xs border-blue-200 bg-blue-50 text-blue-700"
                >
                  Aprobado
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const supplier = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/suppliers/${supplier._id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/suppliers/${supplier._id}/edit`);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus?.(supplier._id);
                  }}
                  className={cn(
                    !supplier.is_active && 'text-green-600',
                    supplier.is_active && 'text-gray-600'
                  )}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {supplier.is_active ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router, onToggleStatus]
  );

  return (
    <DataTable
      columns={columns}
      data={supplierData}
      searchKey="name"
      searchPlaceholder="Buscar por nombre..."
      onRowClick={(supplier) => router.push(`/suppliers/${supplier._id}`)}
      loading={loading}
    />
  );
}
