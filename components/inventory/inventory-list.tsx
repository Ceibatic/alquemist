'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { InventoryTable } from './inventory-table';
import { InventoryCreateModal } from './inventory-create-modal';
import { AdjustStockModal } from './adjust-stock-modal';
import { LowStockAlert } from './low-stock-alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type StockFilter = 'normal' | 'low' | 'critical' | 'out_of_stock';

export function InventoryList({ facilityId }: InventoryListProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [adjustStockModalOpen, setAdjustStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [stockFilters, setStockFilters] = useState<StockFilter[]>([
    'normal',
    'low',
    'critical',
    'out_of_stock',
  ]);

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
          item.productSku?.toLowerCase().includes(query)
      );
    }

    // Filter by stock status
    if (stockFilters.length < 4) {
      result = result.filter((item) => {
        const status = item.stockStatus || 'normal';
        return stockFilters.includes(status as StockFilter);
      });
    }

    return result;
  }, [enrichedItems, searchQuery, stockFilters]);

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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (stockFilters.length < 4) count++;
    return count;
  }, [stockFilters]);

  const clearAllFilters = () => {
    setStockFilters(['normal', 'low', 'critical', 'out_of_stock']);
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
    setAdjustStockModalOpen(true);
  };

  const handleDelete = async (item: any) => {
    console.log('Delete item:', item);
  };

  const handleViewLowStock = () => {
    setStockFilters(['low', 'critical']);
    setSearchQuery('');
  };

  // Loading state
  if (inventoryItems === undefined) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
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
      {/* Stats Cards with Lucide Icons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.total}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">{metrics.lowStock}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crítico</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{metrics.criticalStock}</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sin Stock</p>
                <p className="mt-2 text-3xl font-bold text-gray-600">{metrics.outOfStock}</p>
              </div>
              <div className="rounded-full bg-gray-100 p-3">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <span className="hidden sm:inline">Agregar Item</span>
        </Button>
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

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <AdjustStockModal
          open={adjustStockModalOpen}
          onOpenChange={setAdjustStockModalOpen}
          item={selectedItem}
        />
      )}
    </div>
  );
}
