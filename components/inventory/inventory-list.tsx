'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { InventoryTable } from './inventory-table';
import { InventoryCreateModal } from './inventory-create-modal';
import { InventoryReceiptModal } from './inventory-receipt-modal';
import { InventoryMovementModal } from './inventory-movement-modal';
import { LowStockAlert } from './low-stock-alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
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
  Package,
  AlertTriangle,
  XCircle,
  Sprout,
  FlaskConical,
  Shield,
  Cog,
  Layers,
  Container,
  Wrench,
  FileText,
  LayoutGrid,
  Truck,
  CheckCircle2,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface InventoryListProps {
  facilityId: string;
}

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
  { value: 'other', label: 'Otros', icon: FileText },
];

// Lot status options with Lucide icons
const lotStatusOptions = [
  { value: 'available', label: 'Disponible', icon: CheckCircle2 },
  { value: 'reserved', label: 'Reservado', icon: Lock },
  { value: 'expired', label: 'Expirado', icon: AlertCircle },
  { value: 'quarantine', label: 'Cuarentena', icon: AlertTriangle },
  { value: 'discontinued', label: 'Descontinuado', icon: XCircle },
];

type StockFilter = 'normal' | 'low' | 'critical' | 'out_of_stock';

export function InventoryList({ facilityId }: InventoryListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [stockFilters, setStockFilters] = useState<StockFilter[]>([
    'normal',
    'low',
    'critical',
    'out_of_stock',
  ]);
  const [lotStatusFilter, setLotStatusFilter] = useState<string[]>([]);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mutations
  const removeItem = useMutation(api.inventory.remove);

  // Fetch inventory items
  const inventoryItems = useQuery(
    api.inventory.getByFacility,
    facilityId
      ? {
          facilityId: facilityId as Id<'facilities'>,
          category: selectedCategory || undefined,
        }
      : 'skip'
  );

  // Enrich inventory items with product data
  const enrichedItems = useMemo(() => {
    if (!inventoryItems) return [];

    return inventoryItems.map((item: any) => ({
      ...item,
      _id: item._id,
      product_id: item.product_id,
      productName: item.productName || 'Sin nombre',
      productSku: item.productSku || 'Sin SKU',
      productCategory: item.productCategory || 'other',
      quantity_available: item.quantity_available,
      quantity_unit: item.quantity_unit,
      reorder_point: item.reorder_point,
      minimum_stock_level: item.minimum_stock_level,
      maximum_stock_level: item.maximum_stock_level,
      supplier_id: item.supplier_id,
      supplierName: item.supplierName || '-',
      expiration_date: item.expiration_date,
      stockStatus: item.stockStatus,
      lot_status: item.lot_status,
    }));
  }, [inventoryItems]);

  // Filter by search query and stock status
  const filteredItems = useMemo(() => {
    let result = enrichedItems;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.productName?.toLowerCase().includes(query) ||
          item.productSku?.toLowerCase().includes(query) ||
          item.batch_number?.toLowerCase().includes(query)
      );
    }

    // Filter by stock status
    if (stockFilters.length < 4) {
      result = result.filter((item) => {
        const status = item.stockStatus || 'normal';
        return stockFilters.includes(status as StockFilter);
      });
    }

    // Filter by lot status
    if (lotStatusFilter.length > 0) {
      result = result.filter((item) =>
        lotStatusFilter.includes(item.lot_status)
      );
    }

    return result;
  }, [enrichedItems, searchQuery, stockFilters, lotStatusFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = enrichedItems.length;
    const lowStock = enrichedItems.filter(
      (item) => item.stockStatus === 'low' || item.stockStatus === 'critical'
    ).length;
    const criticalStock = enrichedItems.filter(
      (item) => item.stockStatus === 'critical'
    ).length;
    const outOfStock = enrichedItems.filter(
      (item) => item.stockStatus === 'out_of_stock'
    ).length;

    return { total, lowStock, criticalStock, outOfStock };
  }, [enrichedItems]);

  const handleStockFilterChange = (status: StockFilter, checked: boolean) => {
    if (checked) {
      setStockFilters((prev) => [...prev, status]);
    } else {
      setStockFilters((prev) => prev.filter((s) => s !== status));
    }
  };

  const handleLotStatusFilterChange = (status: string, checked: boolean) => {
    if (checked) {
      setLotStatusFilter((prev) => [...prev, status]);
    } else {
      setLotStatusFilter((prev) => prev.filter((s) => s !== status));
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (stockFilters.length < 4) count++;
    if (lotStatusFilter.length > 0) count++;
    return count;
  }, [stockFilters, lotStatusFilter]);

  const clearAllFilters = () => {
    setStockFilters(['normal', 'low', 'critical', 'out_of_stock']);
    setLotStatusFilter([]);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const selectedCategoryOption =
    categoryOptions.find((opt) => opt.value === selectedCategory) || categoryOptions[0];
  const SelectedIcon = selectedCategoryOption.icon;

  // Handlers
  const handleRowClick = (item: any) => {
    router.push(`/inventory/${item._id}`);
  };

  const handleEdit = (item: any) => {
    router.push(`/inventory/${item._id}/edit`);
  };

  const handleAdjustStock = (item: any) => {
    setSelectedItem(item);
    setMovementModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await removeItem({
        inventoryId: itemToDelete._id as Id<'inventory_items'>,
      });

      toast({
        title: 'Item eliminado',
        description: `"${itemToDelete.productName}" ha sido eliminado del inventario.`,
      });

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el item.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewLowStock = () => {
    setStockFilters(['low', 'critical']);
    setSearchQuery('');
  };

  // Loading state
  if (inventoryItems === undefined) {
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
  if (enrichedItems.length === 0 && !selectedCategory && !searchQuery) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Item
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay items de inventario
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Comienza agregando tu primer item al inventario. El inventario te permite
              gestionar el stock de productos en tu instalación.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primer Item
            </Button>
          </CardContent>
        </Card>

        <InventoryCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          facilityId={facilityId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Stats */}
      <CompactStats
        stats={[
          { label: 'Total Items', value: metrics.total, icon: Package, color: 'blue' },
          { label: 'Stock Bajo', value: metrics.lowStock, icon: AlertTriangle, color: 'yellow' },
          { label: 'Crítico', value: metrics.criticalStock, icon: AlertTriangle, color: 'red' },
          { label: 'Sin Stock', value: metrics.outOfStock, icon: XCircle, color: 'gray' },
        ]}
      />

      {/* Low Stock Alert */}
      {metrics.lowStock > 0 && (
        <LowStockAlert
          count={metrics.lowStock}
          criticalCount={metrics.criticalStock}
          onViewItems={handleViewLowStock}
        />
      )}

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

                {/* Stock Status Filter */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Estado de Stock</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stock-normal"
                        checked={stockFilters.includes('normal')}
                        onCheckedChange={(checked) =>
                          handleStockFilterChange('normal', checked as boolean)
                        }
                      />
                      <label htmlFor="stock-normal" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Normal
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stock-low"
                        checked={stockFilters.includes('low')}
                        onCheckedChange={(checked) =>
                          handleStockFilterChange('low', checked as boolean)
                        }
                      />
                      <label htmlFor="stock-low" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        Bajo
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stock-critical"
                        checked={stockFilters.includes('critical')}
                        onCheckedChange={(checked) =>
                          handleStockFilterChange('critical', checked as boolean)
                        }
                      />
                      <label htmlFor="stock-critical" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Crítico
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stock-out"
                        checked={stockFilters.includes('out_of_stock')}
                        onCheckedChange={(checked) =>
                          handleStockFilterChange('out_of_stock', checked as boolean)
                        }
                      />
                      <label htmlFor="stock-out" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-500" />
                        Sin Stock
                      </label>
                    </div>
                  </div>
                </div>

                {/* Lot Status Filter */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Estado de Lote</Label>
                  <div className="space-y-2">
                    {lotStatusOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lot-${option.value}`}
                            checked={lotStatusFilter.includes(option.value)}
                            onCheckedChange={(checked) =>
                              handleLotStatusFilterChange(option.value, checked as boolean)
                            }
                          />
                          <label htmlFor={`lot-${option.value}`} className="text-sm flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" />
                            {option.label}
                          </label>
                        </div>
                      );
                    })}
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
            placeholder="Buscar por nombre, SKU o lote..."
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

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setReceiptModalOpen(true)}
            className="shrink-0"
          >
            <Truck className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Registrar Entrada</span>
          </Button>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Agregar Item</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron items que coincidan con tu búsqueda
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
          <InventoryTable
            items={filteredItems}
            loading={false}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onAdjustStock={handleAdjustStock}
            onDelete={handleDelete}
          />
        </Card>
      )}

      {/* Create Modal */}
      <InventoryCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        facilityId={facilityId}
      />

      {/* Receipt Modal */}
      <InventoryReceiptModal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        facilityId={facilityId}
      />

      {/* Movement Modal */}
      {selectedItem && (
        <InventoryMovementModal
          open={movementModalOpen}
          onOpenChange={setMovementModalOpen}
          item={{
            _id: selectedItem._id,
            product_id: selectedItem.product_id,
            productName: selectedItem.productName,
            quantity_available: selectedItem.quantity_available,
            quantity_unit: selectedItem.quantity_unit,
            area_id: selectedItem.area_id,
            reorder_point: selectedItem.reorder_point,
            batch_number: selectedItem.batch_number,
          }}
          facilityId={facilityId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar item de inventario?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete && (() => {
                const willBeHardDeleted =
                  itemToDelete.quantity_available === 0 &&
                  (itemToDelete.quantity_reserved === 0 || itemToDelete.quantity_reserved === undefined) &&
                  (itemToDelete.quantity_committed === 0 || itemToDelete.quantity_committed === undefined);

                return (
                  <>
                    ¿Estas seguro de que deseas eliminar{' '}
                    <strong>{itemToDelete.productName}</strong> del inventario?
                    <br /><br />
                    {willBeHardDeleted ? (
                      <>
                        <span className="text-destructive font-semibold">
                          Este item será eliminado permanentemente
                        </span>
                        {' '}porque no tiene stock ni transacciones. Esta acción no se puede deshacer.
                      </>
                    ) : (
                      <>
                        Este item será marcado como descontinuado porque tiene stock o historial de transacciones.
                        Dejará de aparecer en la lista activa pero mantendrá su historial.
                      </>
                    )}
                  </>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : (() => {
                if (!itemToDelete) return 'Eliminar';
                const willBeHardDeleted =
                  itemToDelete.quantity_available === 0 &&
                  (itemToDelete.quantity_reserved === 0 || itemToDelete.quantity_reserved === undefined) &&
                  (itemToDelete.quantity_committed === 0 || itemToDelete.quantity_committed === undefined);
                return willBeHardDeleted ? 'Eliminar permanentemente' : 'Marcar como descontinuado';
              })()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
