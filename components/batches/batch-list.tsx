'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { BatchCard } from './batch-card';
import { BatchCreateModal } from './batch-create-modal';
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
  Layers,
  SlidersHorizontal,
  X,
  ChevronDown,
  Play,
  CheckCircle,
  LayoutGrid,
  Leaf,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BatchListProps {
  companyId: Id<'companies'>;
  facilityId?: Id<'facilities'>;
}

type StatusFilter = 'active' | 'harvested' | 'lost' | 'archived';

export function BatchList({ companyId, facilityId }: BatchListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>(['active', 'harvested']);

  // Fetch data
  const batches = useQuery(api.batches.list, {
    companyId,
    facilityId: facilityId || undefined,
    status: selectedStatus || undefined,
    orderId: orderIdParam ? (orderIdParam as Id<'production_orders'>) : undefined,
  });

  // Filter batches
  const filteredBatches = useMemo(() => {
    if (!batches) return [];

    let result = batches;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (batch) =>
          batch.batch_code.toLowerCase().includes(query) ||
          batch.cultivarName?.toLowerCase().includes(query) ||
          batch.areaName?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilters.length < 4) {
      result = result.filter((batch) => statusFilters.includes(batch.status as StatusFilter));
    }

    return result;
  }, [batches, searchQuery, statusFilters]);

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
    if (orderIdParam) count++;
    return count;
  }, [statusFilters, orderIdParam]);

  const clearAllFilters = () => {
    setStatusFilters(['active', 'harvested']);
    setSearchQuery('');
    setSelectedStatus(null);
    if (orderIdParam) {
      router.push('/batches');
    }
  };

  // Status options for dropdown
  const statusOptions = [
    { value: null, label: 'Todos los estados', icon: LayoutGrid },
    { value: 'active', label: 'Activos', icon: Play },
    { value: 'harvested', label: 'Cosechados', icon: CheckCircle },
    { value: 'lost', label: 'Perdidos', icon: Leaf },
  ];

  const selectedStatusOption =
    statusOptions.find((opt) => opt.value === selectedStatus) || statusOptions[0];
  const SelectedIcon = selectedStatusOption.icon;

  // Handlers for batch actions
  const handleViewBatch = (batch: any) => {
    router.push(`/batches/${batch._id}`);
  };

  const handleCreateSuccess = (batchId: string) => {
    setCreateModalOpen(false);
    router.push(`/batches/${batchId}`);
  };

  // Loading state
  if (batches === undefined) {
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
  if (batches.length === 0 && !selectedStatus && !searchQuery && !orderIdParam) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Lote
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay lotes de produccion
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Crea tu primer lote para comenzar a gestionar tus plantas.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Lote
            </Button>
          </CardContent>
        </Card>

        <BatchCreateModal
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
      {/* Order filter indicator */}
      {orderIdParam && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-700">
            Mostrando lotes de una orden especifica
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/batches')}
            className="text-blue-700 hover:text-blue-800"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      )}

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
                        id="status-active"
                        checked={statusFilters.includes('active')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('active', checked as boolean)
                        }
                      />
                      <label htmlFor="status-active" className="text-sm">
                        Activos
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-harvested"
                        checked={statusFilters.includes('harvested')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('harvested', checked as boolean)
                        }
                      />
                      <label htmlFor="status-harvested" className="text-sm">
                        Cosechados
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-lost"
                        checked={statusFilters.includes('lost')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('lost', checked as boolean)
                        }
                      />
                      <label htmlFor="status-lost" className="text-sm">
                        Perdidos
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-archived"
                        checked={statusFilters.includes('archived')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('archived', checked as boolean)
                        }
                      />
                      <label htmlFor="status-archived" className="text-sm">
                        Archivados
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
            placeholder="Buscar lotes..."
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
          <span className="hidden sm:inline">Nuevo Lote</span>
        </Button>
      </div>

      {/* Batches Grid */}
      {filteredBatches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron lotes que coincidan con tu busqueda
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
          {filteredBatches.map((batch: any) => (
            <BatchCard
              key={batch._id}
              batch={batch}
              onClick={() => handleViewBatch(batch)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <BatchCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        companyId={companyId}
        facilityId={facilityId}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
