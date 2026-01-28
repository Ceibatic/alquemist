'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { OccupancyBar } from '@/components/ui/occupancy-bar';
import { getContainerTypeLabel } from '@/lib/constants/containers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  MoreVertical,
  Edit,
  Trash2,
  Layers,
  Thermometer,
  Droplets,
  Sun,
  Clock,
  Sprout,
  Leaf,
  Flower2,
  Package,
  Warehouse,
  Cog,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';

// Flexible type for Convex data
interface AreaData {
  _id: string;
  name: string;
  area_type: string;
  status: string;
  total_area_m2?: number;
  current_occupancy: number;
  climate_controlled: boolean;
  batchCount?: number;
  capacity_configurations?: {
    max_capacity?: number;
    container_type?: string;
    container_count?: number;
    plants_per_container?: number;
  };
  environmental_specs?: {
    temperature_min?: number;
    temperature_max?: number;
    humidity_min?: number;
    humidity_max?: number;
    light_hours?: number;
  };
  created_at?: number;
  updated_at?: number;
}

interface AreaCardProps {
  area: AreaData;
  index?: number;
}

const areaTypeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  propagation: { label: 'Propagacion', icon: <Sprout className="h-3.5 w-3.5" /> },
  vegetative: { label: 'Vegetativo', icon: <Leaf className="h-3.5 w-3.5" /> },
  flowering: { label: 'Floracion', icon: <Flower2 className="h-3.5 w-3.5" /> },
  drying: { label: 'Secado', icon: <Sun className="h-3.5 w-3.5" /> },
  curing: { label: 'Curado', icon: <Package className="h-3.5 w-3.5" /> },
  storage: { label: 'Almacenamiento', icon: <Warehouse className="h-3.5 w-3.5" /> },
  processing: { label: 'Procesamiento', icon: <Cog className="h-3.5 w-3.5" /> },
  quarantine: { label: 'Cuarentena', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
};

export function AreaCard({ area, index }: AreaCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const removeArea = useMutation(api.areas.remove);

  const maxCapacity = area.capacity_configurations?.max_capacity || 0;
  const hasContainerConfig = !!area.capacity_configurations?.container_type;
  const typeConfig = areaTypeConfig[area.area_type] || { label: area.area_type, icon: null };
  const areaCode = index ? String(index).padStart(3, '0') : '---';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on dropdown menu
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown-menu]')) {
      return;
    }
    router.push(`/areas/${area._id}`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await removeArea({ id: area._id as Id<'areas'> });
      toast({
        title: 'Area eliminada',
        description: `El area "${area.name}" ha sido desactivada.`,
      });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting area:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el area.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const occupancyPercentage = maxCapacity > 0
    ? Math.round((area.current_occupancy / maxCapacity) * 100)
    : 0;

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image placeholder / header area */}
      <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Layers className="h-16 w-16 text-gray-400" />
        </div>
      </div>

      <CardContent className="pt-4 space-y-3">
        {/* Header with code, name and kebab menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-bold text-lg text-gray-900 shrink-0">{areaCode}</span>
            <span className="text-gray-400 shrink-0">|</span>
            <span className="font-semibold text-gray-800 truncate">{area.name}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              data-dropdown-menu
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/areas/${area._id}/edit`} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Area type with icon */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          {typeConfig.icon}
          <span>{typeConfig.label}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            <span>Lotes: {area.batchCount ?? 0}</span>
          </div>
          <span className="text-gray-300">|</span>
          <span>Area: {area.total_area_m2 || 0} m²</span>
          <StatusBadge status={area.status} size="sm" />
        </div>

        {/* Capacity bar */}
        {maxCapacity > 0 && (
          <div className="space-y-1">
            <OccupancyBar
              current={area.current_occupancy}
              max={maxCapacity}
              showLabel={false}
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Capacidad {area.current_occupancy.toLocaleString()}/{maxCapacity.toLocaleString()}{' '}
                {hasContainerConfig && area.capacity_configurations
                  ? getContainerTypeLabel(area.capacity_configurations.container_type!).toLowerCase() + 's'
                  : 'Plantas'}
              </span>
              <span>{occupancyPercentage}%</span>
            </div>
          </div>
        )}

        {/* Climate control info */}
        {area.climate_controlled && area.environmental_specs && (
          <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
            {area.environmental_specs.temperature_min !== undefined && (
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-red-400" />
                <span>
                  {area.environmental_specs.temperature_min}-
                  {area.environmental_specs.temperature_max}
                </span>
              </div>
            )}
            {area.environmental_specs.light_hours !== undefined && (
              <div className="flex items-center gap-1">
                <Sun className="h-3 w-3 text-amber-400" />
                <span>{area.environmental_specs.light_hours}/8</span>
              </div>
            )}
            {area.environmental_specs.humidity_min !== undefined && (
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3 text-blue-400" />
                <span>
                  {area.environmental_specs.humidity_min}-
                  {area.environmental_specs.humidity_max}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Last update timestamp */}
        <div className="flex items-center gap-1 text-xs text-gray-400 pt-1">
          <Clock className="h-3 w-3" />
          <span>
            Ult. Registro:{' '}
            {area.updated_at
              ? new Date(area.updated_at).toLocaleString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'Sin registro'}
          </span>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar area</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de que deseas eliminar el area &quot;{area.name}&quot;?
              El area sera desactivada y no aparecera en la lista activa.
              Esta accion no eliminara el historial asociado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
