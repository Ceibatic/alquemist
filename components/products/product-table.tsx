'use client';

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Sprout,
  FlaskConical,
  Shield,
  Cog,
  Layers,
  Container,
  Wrench,
  FileText,
  Plant,
  Seedling,
  Tree,
  Leaf,
} from 'lucide-react';
import { productCategoryLabels, productStatusLabels } from '@/lib/validations/product';

interface Product {
  _id: string;
  sku: string;
  name: string;
  category: string;
  default_price?: number;
  price_currency?: string;
  manufacturer?: string;
  status: string;
  preferredSupplierName?: string | null;
}

interface ProductTableProps {
  products: Product[];
  onRowClick?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

// Category icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  seed: Sprout,
  nutrient: FlaskConical,
  pesticide: Shield,
  equipment: Cog,
  substrate: Layers,
  container: Container,
  tool: Wrench,
  clone: Plant,
  seedling: Seedling,
  mother_plant: Tree,
  plant_material: Leaf,
  other: FileText,
};

// Status colors
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  discontinued: 'bg-gray-100 text-gray-800',
};

export function ProductTable({
  products,
  onRowClick,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const formatPrice = (price: number | undefined, currency: string = 'COP') => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">SKU</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Precio Base</TableHead>
          <TableHead>Fabricante</TableHead>
          <TableHead>Proveedor</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const CategoryIcon = categoryIcons[product.category] || FileText;
          const categoryLabel = productCategoryLabels[product.category] || product.category;
          const statusLabel = productStatusLabels[product.status] || product.status;
          const statusColor = statusColors[product.status] || 'bg-gray-100 text-gray-800';

          return (
            <TableRow
              key={product._id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRowClick?.(product)}
            >
              <TableCell className="font-mono text-sm">{product.sku}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4 text-gray-500" />
                  <span>{categoryLabel}</span>
                </div>
              </TableCell>
              <TableCell>
                {formatPrice(product.default_price, product.price_currency)}
              </TableCell>
              <TableCell className="text-gray-600">
                {product.manufacturer || '-'}
              </TableCell>
              <TableCell className="text-gray-600">
                {product.preferredSupplierName || '-'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusColor}>
                  {statusLabel}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick?.(product);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(product);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(product);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
