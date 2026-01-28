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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useFacility } from '@/components/providers/facility-provider';
import {
  Search,
  Plus,
  PackageOpen,
  X,
  ChevronDown,
  Leaf,
  Sprout,
  LayoutGrid,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CreateCustomCultivarInput } from '@/lib/validations/cultivar';

interface CultivarListProps {
  facilityId?: Id<'facilities'>;
}

export function CultivarList({ facilityId }: CultivarListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { currentCompanyId } = useFacility();

  // Filter states
  const [selectedCropType, setSelectedCropType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cultivarToDelete, setCultivarToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data - requires companyId
  const cultivars = useQuery(
    api.cultivars.list,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          cropTypeId: selectedCropType ? (selectedCropType as Id<'crop_types'>) : undefined,
          status: showDiscontinued ? undefined : 'active',
        }
      : 'skip'
  );

  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Mutations
  const createCultivar = useMutation(api.cultivars.create);
  const deleteCultivar = useMutation(api.cultivars.remove);
  // TODO: Implement reactivate mutation in backend
  // const reactivateCultivar = useMutation(api.cultivars.reactivate);

  // Filter cultivars
  const filteredCultivars = useMemo(() => {
    if (!cultivars) return [];

    let result = cultivars;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (cultivar) =>
          cultivar.name.toLowerCase().includes(query) ||
          cultivar.variety_type?.toLowerCase().includes(query) ||
          cultivar.genetic_lineage?.toLowerCase().includes(query)
      );
    }

    // Sort alphabetically
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [cultivars, searchQuery]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCropType(null);
    setShowDiscontinued(false);
  };

  // TODO: Uncomment when reactivate mutation is implemented
  // const handleReactivateCultivar = async (cultivar: any) => {
  //   try {
  //     await reactivateCultivar({ id: cultivar._id });
  //     toast({
  //       title: 'Cultivar reactivado',
  //       description: `${cultivar.name} ha sido reactivado correctamente.`,
  //     });
  //   } catch (error) {
  //     console.error('Error reactivating cultivar:', error);
  //     const errorMessage = error instanceof Error ? error.message : 'No se pudo reactivar el cultivar. Intenta de nuevo.';
  //     toast({
  //       title: 'Error',
  //       description: errorMessage,
  //       variant: 'destructive',
  //     });
  //   }
  // };

  // Get crop type name helper
  const getCropTypeName = (cropTypeId: Id<'crop_types'>) => {
    if (!cropTypes) return '';
    const cropType = cropTypes.find((ct) => ct._id === cropTypeId);
    return cropType?.display_name_es || '';
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

  const selectedCropTypeOption =
    cropTypeOptions.find((opt) => opt.value === selectedCropType) || cropTypeOptions[0];
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
      const errorMessage = error instanceof Error ? error.message : 'No se pudo eliminar el cultivar. Intenta de nuevo.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateCultivar = async (data: CreateCustomCultivarInput) => {
    if (!currentCompanyId) {
      toast({
        title: 'Error',
        description: 'No se pudo determinar la empresa actual.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCultivar({
        companyId: currentCompanyId,
        name: data.name,
        cropTypeId: data.crop_type_id as Id<'crop_types'>,
        varietyType: data.variety_type,
        geneticLineage: data.genetic_lineage,
        floweringTimeDays: data.flowering_time_days,
        supplierId: data.supplier_id ? (data.supplier_id as Id<'suppliers'>) : undefined,
        thcMin: data.thc_min,
        thcMax: data.thc_max,
        cbdMin: data.cbd_min,
        cbdMax: data.cbd_max,
        notes: data.notes,
      });
      setCreateModalOpen(false);
      toast({
        title: 'Cultivar creado',
        description: `${data.name} ha sido creado correctamente.`,
      });
    } catch (error) {
      console.error('Error creating cultivar:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo crear el cultivar. Intenta de nuevo.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (!currentCompanyId || cultivars === undefined || cropTypes === undefined) {
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
  if (cultivars.length === 0 && !selectedCropType && !searchQuery && !showDiscontinued) {
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
              Comienza creando tu primer cultivar personalizado.
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
      {/* Compact Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Left: Type Dropdown */}
          <div className="flex items-center gap-2">
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

        {/* Show Discontinued Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-discontinued"
            checked={showDiscontinued}
            onCheckedChange={(checked) => setShowDiscontinued(checked as boolean)}
          />
          <Label
            htmlFor="show-discontinued"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mostrar cultivares descontinuados
          </Label>
        </div>
      </div>

      {/* Cultivars Grid */}
      {filteredCultivars.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron cultivares que coincidan con tu búsqueda
            </p>
            {(searchQuery || selectedCropType || showDiscontinued) && (
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
            <div
              key={cultivar._id}
              className={
                isDeleting && cultivarToDelete?._id === cultivar._id
                  ? 'opacity-50 pointer-events-none'
                  : ''
              }
            >
              <CultivarCard
                cultivar={cultivar}
                isSystem={false}
                cropTypeName={getCropTypeName(cultivar.crop_type_id)}
                onView={() => handleViewCultivar(cultivar)}
                onEdit={() => handleEditCultivar(cultivar)}
                onDelete={() => handleDeleteCultivar(cultivar)}
                // TODO: Enable when reactivate mutation is implemented
                // onReactivate={cultivar.status === 'discontinued' ? () => handleReactivateCultivar(cultivar) : undefined}
              />
            </div>
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
