'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { ProductTable } from './product-table';
import { ProductCreateModal } from './product-create-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompactStats } from '@/components/ui/compact-stats';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Plus,
  ShoppingCart,
  ChevronDown,
  X,
  LayoutGrid,
  Sprout,
  FlaskConical,
  Shield,
  Cog,
  Layers,
  Container,
  Wrench,
  FileText,
  CheckCircle,
  XCircle,
  Leaf,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';

// Category options with Lucide icons
const categoryOptions = [
  { value: null, label: 'Todas las categorías', icon: LayoutGrid },
  { value: 'seed', label: 'Semillas', icon: Sprout },
  { value: 'nutrient', label: 'Nutrientes', icon: FlaskConical },
  { value: 'pesticide', label: 'Pesticidas', icon: Shield },
  { value: 'equipment', label: 'Equipos', icon: Cog },
  { value: 'substrate', label: 'Sustratos', icon: Layers },
  { value: 'container', label: 'Contenedores', icon: Container },
  { value: 'tool', label: 'Herramientas', icon: Wrench },
  { value: 'clone', label: 'Esquejes', icon: Sprout },
  { value: 'seedling', label: 'Plántulas', icon: Sprout },
  { value: 'mother_plant', label: 'Plantas Madre', icon: Sprout },
  { value: 'plant_material', label: 'Material Vegetal', icon: Leaf },
  { value: 'other', label: 'Otros', icon: FileText },
];

// Status options
const statusOptions = [
  { value: null, label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'discontinued', label: 'Descontinuados' },
];

export function ProductList() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentCompanyId } = useFacility();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mutations
  const removeProduct = useMutation(api.products.remove);

  // Fetch products
  const productsData = useQuery(
    api.products.list,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
          search: searchQuery || undefined,
        }
      : 'skip'
  );

  const products = productsData?.products || [];
  const total = productsData?.total || 0;

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!products.length) return { total: 0, active: 0, discontinued: 0 };

    const active = products.filter((p: any) => p.status === 'active').length;
    const discontinued = products.filter((p: any) => p.status === 'discontinued').length;

    return { total: products.length, active, discontinued };
  }, [products]);

  const selectedCategoryOption =
    categoryOptions.find((opt) => opt.value === selectedCategory) || categoryOptions[0];
  const SelectedIcon = selectedCategoryOption.icon;

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedStatus(null);
  };

  // Handlers
  const handleRowClick = (product: any) => {
    router.push(`/products/${product._id}`);
  };

  const handleEdit = (product: any) => {
    router.push(`/products/${product._id}/edit`);
  };

  const handleDelete = (product: any) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await removeProduct({
        productId: productToDelete._id as Id<'products'>,
      });

      toast({
        title: 'Producto eliminado',
        description: `"${productToDelete.name}" ha sido eliminado.`,
      });

      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el producto.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (productsData === undefined) {
    return (
      <div className="space-y-6">
        {/* Compact Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        {/* Filter Bar Skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        {/* Table Skeleton */}
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Empty state
  if (products.length === 0 && !selectedCategory && !searchQuery && !selectedStatus) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Producto
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay productos
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Comienza creando tu primer producto. Los productos son la base para
              gestionar tu inventario.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Producto
            </Button>
          </CardContent>
        </Card>

        <ProductCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Stats */}
      <CompactStats
        stats={[
          { label: 'Total Productos', value: metrics.total, icon: ShoppingCart, color: 'blue' },
          { label: 'Activos', value: metrics.active, icon: CheckCircle, color: 'green' },
          { label: 'Descontinuados', value: metrics.discontinued, icon: XCircle, color: 'gray' },
        ]}
      />

      {/* Compact Filter Bar - Single Line */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Left: Category Dropdown */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
                <span className="flex items-center gap-2">
                  <SelectedIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{selectedCategoryOption.label}</span>
                  <span className="sm:hidden">Categoría</span>
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {categoryOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value || 'all'}
                    onClick={() => setSelectedCategory(option.value)}
                    className={selectedCategory === option.value ? 'bg-gray-100' : ''}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[140px] justify-between">
                <span>
                  {statusOptions.find((s) => s.value === selectedStatus)?.label || 'Estado'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[160px]">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value || 'all'}
                  onClick={() => setSelectedStatus(option.value)}
                  className={selectedStatus === option.value ? 'bg-gray-100' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Right: Create Button */}
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Crear Producto</span>
        </Button>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron productos que coincidan con tu búsqueda
            </p>
            {(searchQuery || selectedCategory || selectedStatus) && (
              <Button
                variant="link"
                className="mt-2 text-green-700"
                onClick={clearAllFilters}
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <ProductTable
            products={products}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>
      )}

      {/* Create Modal */}
      <ProductCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete && (
                <>
                  ¿Estás seguro de que deseas eliminar{' '}
                  <strong>{productToDelete.name}</strong>?
                  <br /><br />
                  <span className="text-orange-600">
                    Si este producto tiene items de inventario asociados,
                    será marcado como descontinuado en lugar de eliminarse.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
