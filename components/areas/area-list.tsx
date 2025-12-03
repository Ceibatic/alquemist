'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AreaCard } from './area-card';
import { AreaCreateModal } from './area-create-modal';
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
  Sprout,
  Leaf,
  Flower2,
  Sun,
  Package,
  Warehouse,
  Cog,
  ShieldAlert,
  LayoutGrid,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AreaListProps {
  facilityId: Id<'facilities'>;
}

type AreaStatus = 'active' | 'maintenance' | 'inactive';

const areaTypeOptions = [
  { value: null, label: 'Todas las areas', icon: LayoutGrid },
  { value: 'propagation', label: 'Propagacion', icon: Sprout },
  { value: 'vegetative', label: 'Vegetativo', icon: Leaf },
  { value: 'flowering', label: 'Floracion', icon: Flower2 },
  { value: 'drying', label: 'Secado', icon: Sun },
  { value: 'curing', label: 'Curado', icon: Package },
  { value: 'storage', label: 'Almacenamiento', icon: Warehouse },
  { value: 'processing', label: 'Procesamiento', icon: Cog },
  { value: 'quarantine', label: 'Cuarentena', icon: ShieldAlert },
];

export function AreaList({ facilityId }: AreaListProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<AreaStatus[]>(['active', 'maintenance', 'inactive']);
  const [climateControlFilter, setClimateControlFilter] = useState<boolean | null>(null);

  // Fetch data
  const areas = useQuery(api.areas.list, {
    facilityId,
    areaType: selectedType || undefined,
  });

  const cropTypes = useQuery(api.crops.getCropTypes, {
    includeInactive: false,
  });

  // Filter areas by search query and additional filters
  const filteredAreas = useMemo(() => {
    if (!areas) return [];

    let result = areas;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((area) =>
        area.name.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilters.length < 3) {
      result = result.filter((area) =>
        statusFilters.includes(area.status as AreaStatus)
      );
    }

    // Filter by climate control
    if (climateControlFilter !== null) {
      result = result.filter((area) =>
        area.climate_controlled === climateControlFilter
      );
    }

    return result;
  }, [areas, searchQuery, statusFilters, climateControlFilter]);

  const handleStatusFilterChange = (status: AreaStatus, checked: boolean) => {
    if (checked) {
      setStatusFilters((prev) => [...prev, status]);
    } else {
      setStatusFilters((prev) => prev.filter((s) => s !== status));
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilters.length < 3) count++;
    if (climateControlFilter !== null) count++;
    return count;
  }, [statusFilters, climateControlFilter]);

  const clearAllFilters = () => {
    setStatusFilters(['active', 'maintenance', 'inactive']);
    setClimateControlFilter(null);
    setSearchQuery('');
    setSelectedType(null);
  };

  const selectedTypeOption = areaTypeOptions.find((opt) => opt.value === selectedType) || areaTypeOptions[0];
  const SelectedIcon = selectedTypeOption.icon;

  // Loading state
  if (areas === undefined || cropTypes === undefined) {
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
  if (areas.length === 0 && !selectedType && !searchQuery) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Area
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay areas configuradas
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Comienza creando tu primera area de cultivo. Las areas te permiten
              organizar y gestionar diferentes zonas de produccion en tu
              instalacion.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Area
            </Button>
          </CardContent>
        </Card>

        <AreaCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          facilityId={facilityId}
          cropTypes={cropTypes.map((ct) => ({ _id: ct._id, name: ct.name }))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Filter Bar - Single Line */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Left: Filters + Type Dropdown */}
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
                        Activa
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-maintenance"
                        checked={statusFilters.includes('maintenance')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('maintenance', checked as boolean)
                        }
                      />
                      <label htmlFor="status-maintenance" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        Mantenimiento
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
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Inactiva
                      </label>
                    </div>
                  </div>
                </div>

                {/* Climate Control Filter */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Control Climatico</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={climateControlFilter === null ? 'default' : 'outline'}
                      size="sm"
                      className={climateControlFilter === null ? 'bg-green-700 hover:bg-green-800' : ''}
                      onClick={() => setClimateControlFilter(null)}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={climateControlFilter === true ? 'default' : 'outline'}
                      size="sm"
                      className={climateControlFilter === true ? 'bg-green-700 hover:bg-green-800' : ''}
                      onClick={() => setClimateControlFilter(true)}
                    >
                      Si
                    </Button>
                    <Button
                      variant={climateControlFilter === false ? 'default' : 'outline'}
                      size="sm"
                      className={climateControlFilter === false ? 'bg-green-700 hover:bg-green-800' : ''}
                      onClick={() => setClimateControlFilter(false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Area Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
                <span className="flex items-center gap-2">
                  <SelectedIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{selectedTypeOption.label}</span>
                  <span className="sm:hidden">Tipo</span>
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {areaTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value || 'all'}
                    onClick={() => setSelectedType(option.value)}
                    className={selectedType === option.value ? 'bg-gray-100' : ''}
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
            placeholder="Buscar areas..."
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
          <span className="hidden sm:inline">Crear Area</span>
        </Button>
      </div>

      {/* Areas Grid */}
      {filteredAreas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron areas que coincidan con tu busqueda
            </p>
            {(activeFiltersCount > 0 || searchQuery || selectedType) && (
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
          {filteredAreas.map((area, index) => (
            <AreaCard key={area._id} area={area} index={index + 1} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AreaCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        facilityId={facilityId}
        cropTypes={cropTypes.map((ct) => ({ _id: ct._id, name: ct.name }))}
      />
    </div>
  );
}
