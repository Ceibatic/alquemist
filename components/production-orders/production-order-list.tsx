'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ProductionOrderCard } from './production-order-card';
import { ProductionOrderCreateModal } from './production-order-create-modal';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  ClipboardList,
  SlidersHorizontal,
  X,
  ChevronDown,
  Play,
  Clock,
  CheckCircle,
  LayoutGrid,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductionOrderListProps {
  companyId: Id<'companies'>;
  facilityId?: Id<'facilities'>;
}

type StatusFilter = 'planning' | 'active' | 'completed' | 'cancelled';

export function ProductionOrderList({ companyId, facilityId }: ProductionOrderListProps) {
  const router = useRouter();

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([
    'planning',
    'active',
    'completed',
  ]);

  // Fetch data
  const orders = useQuery(api.productionOrders.list, {
    companyId,
    facilityId: facilityId || undefined,
    status: selectedStatus || undefined,
  });

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let result = orders;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.order_number.toLowerCase().includes(query) ||
          order.cultivarName?.toLowerCase().includes(query) ||
          order.templateName?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilters.length < 4) {
      result = result.filter((order) => statusFilters.includes(order.status as StatusFilter));
    }

    return result;
  }, [orders, searchQuery, statusFilters]);

  // Handlers
  const handleStatusFilterChange = (status: StatusFilter, checked: boolean) => {
    if (checked) {
      setStatusFilters((prev) => [...prev, status]);
    } else {
      setStatusFilters((prev) => prev.filter((s) => s !== status));
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilters.length < 4) count++;
    return count;
  }, [statusFilters]);

  const clearAllFilters = () => {
    setStatusFilters(['planning', 'active', 'completed']);
    setSearchQuery('');
    setSelectedStatus(null);
  };

  // Status options for dropdown
  const statusOptions = [
    { value: null, label: 'Todos los estados', icon: LayoutGrid },
    { value: 'planning', label: 'En Planificacion', icon: Clock },
    { value: 'active', label: 'Activas', icon: Play },
    { value: 'completed', label: 'Completadas', icon: CheckCircle },
  ];

  const selectedStatusOption =
    statusOptions.find((opt) => opt.value === selectedStatus) || statusOptions[0];
  const SelectedIcon = selectedStatusOption.icon;

  // Handlers for order actions
  const handleViewOrder = (order: any) => {
    router.push(`/production-orders/${order._id}`);
  };

  const handleCreateSuccess = (orderId: string) => {
    setCreateModalOpen(false);
    router.push(`/production-orders/${orderId}`);
  };

  // Loading state
  if (orders === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0 && !selectedStatus && !searchQuery) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay ordenes de produccion
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Crea tu primera orden de produccion para comenzar a gestionar tus cultivos.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Orden
            </Button>
          </CardContent>
        </Card>

        <ProductionOrderCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          companyId={companyId}
          facilityId={facilityId}
          onSuccess={handleCreateSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Left: Filters + Status Dropdown */}
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
                        id="status-planning"
                        checked={statusFilters.includes('planning')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('planning', checked as boolean)
                        }
                      />
                      <label htmlFor="status-planning" className="text-sm">
                        En Planificacion
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-active"
                        checked={statusFilters.includes('active')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('active', checked as boolean)
                        }
                      />
                      <label htmlFor="status-active" className="text-sm">
                        Activas
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-completed"
                        checked={statusFilters.includes('completed')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('completed', checked as boolean)
                        }
                      />
                      <label htmlFor="status-completed" className="text-sm">
                        Completadas
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-cancelled"
                        checked={statusFilters.includes('cancelled')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('cancelled', checked as boolean)
                        }
                      />
                      <label htmlFor="status-cancelled" className="text-sm">
                        Canceladas
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
                <span className="flex items-center gap-2">
                  <SelectedIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{selectedStatusOption.label}</span>
                  <span className="sm:hidden">Estado</span>
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value || 'all'}
                    onClick={() => setSelectedStatus(option.value)}
                    className={selectedStatus === option.value ? 'bg-gray-100' : ''}
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
            placeholder="Buscar ordenes..."
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
          <span className="hidden sm:inline">Nueva Orden</span>
        </Button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron ordenes que coincidan con tu busqueda
            </p>
            {(activeFiltersCount > 0 || searchQuery || selectedStatus) && (
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order: any) => (
            <ProductionOrderCard
              key={order._id}
              order={order}
              onClick={() => handleViewOrder(order)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <ProductionOrderCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        companyId={companyId}
        facilityId={facilityId}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
