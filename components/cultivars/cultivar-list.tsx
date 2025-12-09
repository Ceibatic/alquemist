'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CultivarCard } from './cultivar-card';
import { CultivarCreateModal } from './cultivar-create-modal';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  PackageOpen,
  SlidersHorizontal,
  X,
  ChevronDown,
  Leaf,
  Sprout,
  Flower2,
  LayoutGrid,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CreateCustomCultivarInput } from '@/lib/validations/cultivar';

interface CultivarListProps {
  facilityId?: Id<'facilities'>;
}

type DifficultyFilter = 'easy' | 'medium' | 'difficult';
type OriginFilter = 'system' | 'custom';

export function CultivarList({ facilityId }: CultivarListProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Filter states
  const [selectedCropType, setSelectedCropType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [difficultyFilters, setDifficultyFilters] = useState<DifficultyFilter[]>(['easy', 'medium', 'difficult']);
  const [originFilter, setOriginFilter] = useState<OriginFilter | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cultivarToDelete, setCultivarToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data
  const cultivars = useQuery(api.cultivars.list, {
    cropTypeId: selectedCropType ? (selectedCropType as Id<'crop_types'>) : undefined,
  });

  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Mutations
  const createCultivar = useMutation(api.cultivars.create);
  const deleteCultivar = useMutation(api.cultivars.remove);

  // Filter cultivars
  const filteredCultivars = useMemo(() => {
    if (!cultivars) return [];

    let result = cultivars;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((cultivar) =>
        cultivar.name.toLowerCase().includes(query) ||
        cultivar.variety_type?.toLowerCase().includes(query) ||
        cultivar.genetic_lineage?.toLowerCase().includes(query)
      );
    }

    // Filter by difficulty
    if (difficultyFilters.length < 3) {
      result = result.filter((cultivar) => {
        const characteristics = cultivar.characteristics as { growth_difficulty?: string } | undefined;
        const difficulty = characteristics?.growth_difficulty;
        if (!difficulty) return true; // Include those without difficulty set
        return difficultyFilters.includes(difficulty as DifficultyFilter);
      });
    }

    // Filter by origin (system vs custom)
    if (originFilter !== null) {
      result = result.filter((cultivar) => {
        const isSystem = !!(cultivar as any).origin_metadata;
        return originFilter === 'system' ? isSystem : !isSystem;
      });
    }

    // Sort alphabetically
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [cultivars, searchQuery, difficultyFilters, originFilter]);

  // Handlers
  const handleDifficultyFilterChange = (difficulty: DifficultyFilter, checked: boolean) => {
    if (checked) {
      setDifficultyFilters((prev) => [...prev, difficulty]);
    } else {
      setDifficultyFilters((prev) => prev.filter((d) => d !== difficulty));
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (difficultyFilters.length < 3) count++;
    if (originFilter !== null) count++;
    return count;
  }, [difficultyFilters, originFilter]);

  const clearAllFilters = () => {
    setDifficultyFilters(['easy', 'medium', 'difficult']);
    setOriginFilter(null);
    setSearchQuery('');
    setSelectedCropType(null);
  };

  // Get crop type name helper
  const getCropTypeName = (cropTypeId: Id<'crop_types'>) => {
    if (!cropTypes) return '';
    const cropType = cropTypes.find((ct) => ct._id === cropTypeId);
    return cropType?.display_name_es || '';
  };

  // Determine if cultivar is from system
  const isSystemCultivar = (cultivar: any) => {
    return !!cultivar.origin_metadata;
  };

  // Get selected crop type option
  const cropTypeOptions = [
    { value: null, label: 'Todos los tipos', icon: LayoutGrid },
    ...(cropTypes?.map((ct) => ({
      value: ct._id,
      label: ct.display_name_es,
      icon: ct.name === 'Cannabis' ? Leaf : Sprout,
    })) || []),
  ];

  const selectedCropTypeOption = cropTypeOptions.find((opt) => opt.value === selectedCropType) || cropTypeOptions[0];
  const SelectedIcon = selectedCropTypeOption.icon;

  // Handlers for cultivar actions
  const handleViewCultivar = (cultivar: any) => {
    router.push(`/cultivars/${cultivar._id}`);
  };

  const handleEditCultivar = (cultivar: any) => {
    router.push(`/cultivars/${cultivar._id}/edit`);
  };

  const handleDeleteCultivar = (cultivar: any) => {
    setCultivarToDelete(cultivar);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCultivar = async () => {
    if (!cultivarToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCultivar({ id: cultivarToDelete._id });
      toast({
        title: 'Cultivar eliminado',
        description: `${cultivarToDelete.name} ha sido descontinuado correctamente.`,
      });
      setDeleteDialogOpen(false);
      setCultivarToDelete(null);
    } catch (error) {
      console.error('Error deleting cultivar:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el cultivar. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateCultivar = async (data: CreateCustomCultivarInput) => {
    try {
      await createCultivar({
        name: data.name,
        cropTypeId: data.crop_type_id as Id<'crop_types'>,
        varietyType: data.variety_type,
        geneticLineage: data.genetic_lineage,
        supplierId: data.supplier_id as Id<'suppliers'> | undefined,
        characteristics: data.characteristics,
        optimalConditions: data.optimal_conditions,
        notes: data.notes,
      });
      setCreateModalOpen(false);
      toast({
        title: 'Cultivar creado',
        description: `${data.name} ha sido creado correctamente.`,
      });
    } catch (error) {
      console.error('Error creating cultivar:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el cultivar. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (cultivars === undefined || cropTypes === undefined) {
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

  // Empty state (no cultivars at all)
  if (cultivars.length === 0 && !selectedCropType && !searchQuery) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Cultivar
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay cultivares configurados
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Comienza creando tu primer cultivar personalizado o agregando
              cultivares del catálogo del sistema.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Cultivar
            </Button>
          </CardContent>
        </Card>

        <CultivarCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          cropTypes={cropTypes}
          onSubmit={handleCreateCultivar}
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

                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Dificultad de Cultivo</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="difficulty-easy"
                        checked={difficultyFilters.includes('easy')}
                        onCheckedChange={(checked) =>
                          handleDifficultyFilterChange('easy', checked as boolean)
                        }
                      />
                      <label htmlFor="difficulty-easy" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Fácil
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="difficulty-medium"
                        checked={difficultyFilters.includes('medium')}
                        onCheckedChange={(checked) =>
                          handleDifficultyFilterChange('medium', checked as boolean)
                        }
                      />
                      <label htmlFor="difficulty-medium" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        Medio
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="difficulty-difficult"
                        checked={difficultyFilters.includes('difficult')}
                        onCheckedChange={(checked) =>
                          handleDifficultyFilterChange('difficult', checked as boolean)
                        }
                      />
                      <label htmlFor="difficulty-difficult" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Difícil
                      </label>
                    </div>
                  </div>
                </div>

                {/* Origin Filter */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Origen</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={originFilter === null ? 'default' : 'outline'}
                      size="sm"
                      className={originFilter === null ? 'bg-green-700 hover:bg-green-800' : ''}
                      onClick={() => setOriginFilter(null)}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={originFilter === 'system' ? 'default' : 'outline'}
                      size="sm"
                      className={originFilter === 'system' ? 'bg-green-700 hover:bg-green-800' : ''}
                      onClick={() => setOriginFilter('system')}
                    >
                      Sistema
                    </Button>
                    <Button
                      variant={originFilter === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      className={originFilter === 'custom' ? 'bg-green-700 hover:bg-green-800' : ''}
                      onClick={() => setOriginFilter('custom')}
                    >
                      Custom
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Crop Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
                <span className="flex items-center gap-2">
                  <SelectedIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{selectedCropTypeOption.label}</span>
                  <span className="sm:hidden">Tipo</span>
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {cropTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value || 'all'}
                    onClick={() => setSelectedCropType(option.value)}
                    className={selectedCropType === option.value ? 'bg-gray-100' : ''}
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
            placeholder="Buscar cultivares..."
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
          <span className="hidden sm:inline">Crear Cultivar</span>
        </Button>
      </div>

      {/* Cultivars Grid */}
      {filteredCultivars.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron cultivares que coincidan con tu búsqueda
            </p>
            {(activeFiltersCount > 0 || searchQuery || selectedCropType) && (
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
          {filteredCultivars.map((cultivar: any) => (
            <CultivarCard
              key={cultivar._id}
              cultivar={cultivar}
              isSystem={isSystemCultivar(cultivar)}
              cropTypeName={getCropTypeName(cultivar.crop_type_id)}
              onView={() => handleViewCultivar(cultivar)}
              onEdit={!isSystemCultivar(cultivar) ? () => handleEditCultivar(cultivar) : undefined}
              onDelete={!isSystemCultivar(cultivar) ? () => handleDeleteCultivar(cultivar) : undefined}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CultivarCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        cropTypes={cropTypes}
        onSubmit={handleCreateCultivar}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cultivar?</AlertDialogTitle>
            <AlertDialogDescription>
              {cultivarToDelete && (
                <>
                  El cultivar <strong>{cultivarToDelete.name}</strong> sera marcado como
                  descontinuado. Los lotes existentes que usan este cultivar no seran
                  afectados, pero no podras seleccionarlo para nuevos lotes.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCultivar}
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
