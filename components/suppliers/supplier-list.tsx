'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { SupplierTable } from './supplier-table';
import { SupplierCreateModal } from './supplier-create-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompactStats } from '@/components/ui/compact-stats';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Plus,
  PackageOpen,
  SlidersHorizontal,
  X,
  ChevronDown,
  Building2,
  CheckCircle,
  XCircle,
  BadgeCheck,
  Truck,
  Sprout,
  Leaf,
  FlaskConical,
  Shield,
  Droplet,
  Layers,
  Cog,
  Package,
  Microscope,
  FileText,
  LayoutGrid,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SupplierListProps {
  companyId: string;
}

// Map category values to Lucide icons
const categoryIcons: Record<string, React.ElementType> = {
  seeds: Sprout,
  clones: Leaf,
  nutrients: FlaskConical,
  pesticides: Shield,
  fertilizers: Droplet,
  substrates: Layers,
  equipment: Cog,
  packaging: Package,
  laboratory: Microscope,
  other: FileText,
};

const categoryOptions = [
  { value: null, label: 'Todas las categorías', icon: LayoutGrid },
  { value: 'seeds', label: 'Semillas', icon: Sprout },
  { value: 'clones', label: 'Clones', icon: Leaf },
  { value: 'nutrients', label: 'Nutrientes', icon: FlaskConical },
  { value: 'pesticides', label: 'Pesticidas', icon: Shield },
  { value: 'fertilizers', label: 'Fertilizantes', icon: Droplet },
  { value: 'substrates', label: 'Sustratos', icon: Layers },
  { value: 'equipment', label: 'Equipos', icon: Cog },
  { value: 'packaging', label: 'Empaque', icon: Package },
  { value: 'laboratory', label: 'Laboratorio', icon: Microscope },
  { value: 'other', label: 'Otros', icon: FileText },
];

type StatusFilter = 'active' | 'inactive';

export function SupplierList({ companyId }: SupplierListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>(['active', 'inactive']);
  const [approvedFilter, setApprovedFilter] = useState<boolean | null>(null);

  // Dialog states for toggle and delete
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToAction, setSupplierToAction] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch suppliers
  const suppliers = useQuery(
    api.suppliers.list,
    companyId
      ? {
          companyId: companyId as Id<'companies'>,
          productCategory: selectedCategory || undefined,
        }
      : 'skip'
  );

  // Mutations
  const toggleStatus = useMutation(api.suppliers.toggleStatus);
  const removeSupplier = useMutation(api.suppliers.remove);

  // Handle toggle - show confirmation dialog only for deactivation
  const handleToggleStatus = (supplierId: string) => {
    const supplier = suppliers?.find((s) => s._id === supplierId);
    if (!supplier) return;

    if (supplier.is_active) {
      // Show confirmation for deactivation
      setSupplierToAction(supplier);
      setToggleDialogOpen(true);
    } else {
      // Direct activation without confirmation
      confirmToggleStatus(supplier);
    }
  };

  const confirmToggleStatus = async (supplier?: any) => {
    const targetSupplier = supplier || supplierToAction;
    if (!companyId || !targetSupplier) return;

    try {
      setIsProcessing(true);
      await toggleStatus({
        supplierId: targetSupplier._id as Id<'suppliers'>,
        companyId: companyId as Id<'companies'>,
      });
      toast.success(
        targetSupplier.is_active
          ? `${targetSupplier.name} ha sido desactivado`
          : `${targetSupplier.name} ha sido activado`
      );
      setToggleDialogOpen(false);
      setSupplierToAction(null);
    } catch (error) {
      console.error('Error toggling supplier status:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error al actualizar el estado del proveedor';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete
  const handleDeleteSupplier = (supplierId: string) => {
    const supplier = suppliers?.find((s) => s._id === supplierId);
    if (supplier) {
      setSupplierToAction(supplier);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteSupplier = async () => {
    if (!companyId || !supplierToAction) return;

    try {
      setIsProcessing(true);
      await removeSupplier({
        id: supplierToAction._id as Id<'suppliers'>,
        companyId: companyId as Id<'companies'>,
      });
      toast.success(`${supplierToAction.name} ha sido eliminado`);
      setDeleteDialogOpen(false);
      setSupplierToAction(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error al eliminar el proveedor';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter suppliers by search query and additional filters
  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];

    let result = suppliers;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(query) ||
          supplier.legal_name?.toLowerCase().includes(query) ||
          supplier.tax_id?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilters.length < 2) {
      result = result.filter((supplier) => {
        if (statusFilters.includes('active') && supplier.is_active) return true;
        if (statusFilters.includes('inactive') && !supplier.is_active) return true;
        return false;
      });
    }

    // Filter by approved status
    if (approvedFilter !== null) {
      result = result.filter((supplier) => supplier.is_approved === approvedFilter);
    }

    return result;
  }, [suppliers, searchQuery, statusFilters, approvedFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!suppliers) return { total: 0, active: 0, inactive: 0, approved: 0 };
    return {
      total: suppliers.length,
      active: suppliers.filter((s) => s.is_active).length,
      inactive: suppliers.filter((s) => !s.is_active).length,
      approved: suppliers.filter((s) => s.is_approved).length,
    };
  }, [suppliers]);

  const handleStatusFilterChange = (status: StatusFilter, checked: boolean) => {
    if (checked) {
      setStatusFilters((prev) => [...prev, status]);
    } else {
      setStatusFilters((prev) => prev.filter((s) => s !== status));
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilters.length < 2) count++;
    if (approvedFilter !== null) count++;
    return count;
  }, [statusFilters, approvedFilter]);

  const clearAllFilters = () => {
    setStatusFilters(['active', 'inactive']);
    setApprovedFilter(null);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const selectedCategoryOption =
    categoryOptions.find((opt) => opt.value === selectedCategory) || categoryOptions[0];
  const SelectedIcon = selectedCategoryOption.icon;

  // Loading state
  if (suppliers === undefined) {
    return (
      <div className="space-y-6">
        {/* Compact Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
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
  if (suppliers.length === 0 && !selectedCategory && !searchQuery) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay proveedores registrados
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Comienza agregando tu primer proveedor. Los proveedores te permiten gestionar
              tus relaciones comerciales y el abastecimiento de tu operación.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primer Proveedor
            </Button>
          </CardContent>
        </Card>

        <SupplierCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          companyId={companyId as Id<'companies'>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Stats */}
      <CompactStats
        stats={[
          { label: 'Total', value: metrics.total, icon: Building2, color: 'blue' },
          { label: 'Activos', value: metrics.active, icon: CheckCircle, color: 'green' },
          { label: 'Inactivos', value: metrics.inactive, icon: XCircle, color: 'gray' },
          { label: 'Aprobados', value: metrics.approved, icon: BadgeCheck, color: 'blue' },
        ]}
      />

      {/* Compact Filter Bar - Single Line */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Left: Filters + Category Dropdown */}
        <div className="flex items-center gap-2">
          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-600 text-[10px] font-medium text-white flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filtros</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-gray-500 hover:text-gray-700"
                      onClick={clearAllFilters}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Estado</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-active"
                        checked={statusFilters.includes('active')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('active', checked as boolean)
                        }
                      />
                      <label htmlFor="status-active" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Activo
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-inactive"
                        checked={statusFilters.includes('inactive')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('inactive', checked as boolean)
                        }
                      />
                      <label htmlFor="status-inactive" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-500" />
                        Inactivo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Approved Filter */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Aprobación</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={approvedFilter === null ? 'default' : 'outline'}
                      size="sm"
                      className={approvedFilter === null ? 'bg-green-700 hover:bg-green-800' : ''}
                      onClick={() => setApprovedFilter(null)}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={approvedFilter === true ? 'default' : 'outline'}
                      size="sm"
                      className={approvedFilter === true ? 'bg-green-700 hover:bg-green-800' : ''}
                      onClick={() => setApprovedFilter(true)}
                    >
                      Aprobados
                    </Button>
                    <Button
                      variant={approvedFilter === false ? 'default' : 'outline'}
                      size="sm"
                      className={approvedFilter === false ? 'bg-green-700 hover:bg-green-800' : ''}
                      onClick={() => setApprovedFilter(false)}
                    >
                      Pendientes
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

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
        </div>

        {/* Center: Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, razón social o NIT..."
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
          <span className="hidden sm:inline">Nuevo Proveedor</span>
        </Button>
      </div>

      {/* Table */}
      {filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron proveedores que coincidan con tu búsqueda
            </p>
            {(activeFiltersCount > 0 || searchQuery || selectedCategory) && (
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
          <SupplierTable
            suppliers={filteredSuppliers}
            loading={false}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteSupplier}
          />
        </Card>
      )}

      {/* Create Modal */}
      <SupplierCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        companyId={companyId as Id<'companies'>}
      />

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              {supplierToAction && (
                <>
                  El proveedor <strong>{supplierToAction.name}</strong> sera desactivado.
                  No aparecera en los selectores de otros modulos hasta que lo actives
                  nuevamente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmToggleStatus()}
              disabled={isProcessing}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isProcessing ? 'Procesando...' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              {supplierToAction && (
                <>
                  El proveedor <strong>{supplierToAction.name}</strong> sera eliminado
                  permanentemente. Esta accion no se puede deshacer.
                  Los registros historicos de inventario y compras se mantendran.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSupplier}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
