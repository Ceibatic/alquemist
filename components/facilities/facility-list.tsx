'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { FacilityCard } from './facility-card';
import { FacilityCreateModal } from './facility-create-modal';
import { PlanLimitIndicator } from './plan-limit-indicator';
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
  Factory,
  LayoutGrid,
  Warehouse,
  Leaf,
  Home,
} from 'lucide-react';
import { FacilityFormData, PlanType, getPlanLimit } from '@/lib/validations/facilities';
import { FacilityWithCropTypes } from '@/lib/types/facilities';

interface FacilityListProps {
  userId: string;
  companyId: string;
}

type FacilityTypeFilter = 'indoor' | 'outdoor' | 'greenhouse' | 'mixed';
type StatusFilter = 'active' | 'inactive' | 'suspended';

const facilityTypeOptions = [
  { value: null, label: 'Todos los tipos', icon: LayoutGrid },
  { value: 'indoor', label: 'Indoor', icon: Factory },
  { value: 'outdoor', label: 'Outdoor', icon: Leaf },
  { value: 'greenhouse', label: 'Invernadero', icon: Home },
  { value: 'mixed', label: 'Mixta', icon: Warehouse },
];

export function FacilityList({ userId, companyId }: FacilityListProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Filter states
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>(['active', 'inactive', 'suspended']);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<FacilityWithCropTypes | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user data
  const user = useQuery(api.users.getUserById, {
    userId: userId as Id<'users'>,
  });

  // Fetch facilities
  const facilitiesData = useQuery(api.facilities.list, {
    companyId: companyId as Id<'companies'>,
  });

  // Fetch crop types
  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Mutations
  const createFacility = useMutation(api.facilities.create);
  const setCurrentFacility = useMutation(api.users.setCurrentFacility);
  const removeFacility = useMutation(api.facilities.remove);

  // Plan info
  const planType: PlanType = 'business';
  const planLimit = getPlanLimit(planType);

  const currentFacilityId = user?.primary_facility_id || user?.accessibleFacilityIds?.[0];
  const facilities = facilitiesData?.facilities || [];
  const totalFacilities = facilitiesData?.total || 0;

  // Enrich facilities with crop type information
  const enrichedFacilities: FacilityWithCropTypes[] = useMemo(() => {
    return facilities.map((facility) => ({
      ...facility,
      cropTypes: facility.primary_crop_type_ids
        .map((id) => cropTypes?.find((ct) => ct._id === id))
        .filter(Boolean)
        .map((ct) => ({
          _id: ct!._id,
          name: ct!.name,
          display_name_es: ct!.display_name_es,
        })),
    }));
  }, [facilities, cropTypes]);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    let result = enrichedFacilities;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((facility) =>
        facility.name.toLowerCase().includes(query) ||
        facility.license_number?.toLowerCase().includes(query) ||
        facility.city?.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (selectedType) {
      result = result.filter((facility) => facility.facility_type === selectedType);
    }

    // Filter by status
    if (statusFilters.length < 3) {
      result = result.filter((facility) =>
        statusFilters.includes(facility.status as StatusFilter)
      );
    }

    return result;
  }, [enrichedFacilities, searchQuery, selectedType, statusFilters]);

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
    if (statusFilters.length < 3) count++;
    return count;
  }, [statusFilters]);

  const clearAllFilters = () => {
    setStatusFilters(['active', 'inactive', 'suspended']);
    setSearchQuery('');
    setSelectedType(null);
  };

  const handleCreateFacility = async (data: FacilityFormData) => {
    try {
      const facilityId = await createFacility({
        company_id: companyId as Id<'companies'>,
        name: data.name,
        license_number: data.license_number,
        license_type: data.license_type,
        license_authority: data.license_authority,
        license_issued_date: data.license_issued_date,
        license_expiry_date: data.license_expiry_date,
        facility_type: data.facility_type,
        primary_crop_type_ids: data.primary_crop_type_ids as Id<'crop_types'>[],
        address: data.address,
        city: data.city,
        administrative_division_1: data.administrative_division_1,
        administrative_division_2: data.administrative_division_2,
        postal_code: data.postal_code,
        latitude: data.latitude,
        longitude: data.longitude,
        altitude_meters: data.altitude_meters,
        total_area_m2: data.total_area_m2,
        cultivation_area_m2: data.cultivation_area_m2,
        canopy_area_m2: data.canopy_area_m2,
        status: 'active',
      });

      toast({
        title: 'Instalación creada',
        description: `La instalación "${data.name}" ha sido creada exitosamente.`,
      });

      // If this is the first facility, set it as primary
      if (!currentFacilityId && user) {
        await setCurrentFacility({
          userId: userId as Id<'users'>,
          facilityId: facilityId as Id<'facilities'>,
        });
      }

      setCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating facility:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la instalación. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleSwitchToFacility = async (facilityId: string) => {
    if (!user) return;

    try {
      await setCurrentFacility({
        userId: userId as Id<'users'>,
        facilityId: facilityId as Id<'facilities'>,
      });

      toast({
        title: 'Instalación cambiada',
        description: 'Has cambiado a otra instalación exitosamente.',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error switching facility:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la instalación. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFacility = (facility: FacilityWithCropTypes) => {
    setFacilityToDelete(facility);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFacility = async () => {
    if (!facilityToDelete) return;

    try {
      setIsDeleting(true);
      await removeFacility({
        id: facilityToDelete._id as Id<'facilities'>,
        companyId: companyId as Id<'companies'>,
      });

      toast({
        title: 'Instalación desactivada',
        description: `La instalación "${facilityToDelete.name}" ha sido desactivada.`,
      });

      setDeleteDialogOpen(false);
      setFacilityToDelete(null);
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo desactivar la instalación.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedTypeOption = facilityTypeOptions.find((opt) => opt.value === selectedType) || facilityTypeOptions[0];
  const SelectedIcon = selectedTypeOption.icon;

  // Loading state
  if (!user || facilitiesData === undefined || cropTypes === undefined) {
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
  if (facilities.length === 0 && !selectedType && !searchQuery) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Instalación
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay instalaciones configuradas
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Crea tu primera instalación para comenzar a gestionar tus operaciones de cultivo.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Instalación
            </Button>
          </CardContent>
        </Card>

        <FacilityCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSubmit={handleCreateFacility}
          currentFacilityCount={totalFacilities}
          planType={planType}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Limit Indicator */}
      {planLimit !== -1 && (
        <PlanLimitIndicator
          currentCount={totalFacilities}
          maxCount={planLimit}
          planName={planType.charAt(0).toUpperCase() + planType.slice(1)}
        />
      )}

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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-suspended"
                        checked={statusFilters.includes('suspended')}
                        onCheckedChange={(checked) =>
                          handleStatusFilterChange('suspended', checked as boolean)
                        }
                      />
                      <label htmlFor="status-suspended" className="text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        Suspendida
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Facility Type Dropdown */}
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
              {facilityTypeOptions.map((option) => {
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
            placeholder="Buscar instalaciones..."
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
          <span className="hidden sm:inline">Nueva Instalación</span>
        </Button>
      </div>

      {/* Facilities Grid */}
      {filteredFacilities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageOpen className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron instalaciones que coincidan con tu búsqueda
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
          {filteredFacilities.map((facility) => (
            <FacilityCard
              key={facility._id}
              facility={facility}
              isCurrentFacility={facility._id === currentFacilityId}
              onSwitchToFacility={handleSwitchToFacility}
              onDelete={() => handleDeleteFacility(facility)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <FacilityCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateFacility}
        currentFacilityCount={totalFacilities}
        planType={planType}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar instalación?</AlertDialogTitle>
            <AlertDialogDescription>
              {facilityToDelete && (
                <>
                  La instalación <strong>{facilityToDelete.name}</strong> sera desactivada.
                  <br /><br />
                  No podras crear nuevos lotes ni actividades en esta instalación hasta que
                  la reactives. Los datos existentes se mantendran.
                  {facilityToDelete._id === currentFacilityId && (
                    <>
                      <br /><br />
                      <span className="text-orange-600 font-medium">
                        Esta es tu instalación actual. Seras redirigido a otra instalación.
                      </span>
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFacility}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Desactivando...' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
