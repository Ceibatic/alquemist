'use client';

import { FacilityWithCropTypes } from '@/lib/types/facilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Factory,
  MapPin,
  Star,
  ArrowRightLeft,
  Clock,
  Leaf,
  Home,
  Warehouse,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface FacilityCardProps {
  facility: FacilityWithCropTypes;
  isCurrentFacility?: boolean;
  onSwitchToFacility?: (facilityId: string) => void;
  onDelete?: () => void;
}

const facilityTypeConfig: Record<string, { label: string; icon: React.ReactNode; gradient: string }> = {
  indoor: { label: 'Indoor', icon: <Factory className="h-16 w-16" />, gradient: 'from-blue-50 to-blue-100' },
  outdoor: { label: 'Outdoor', icon: <Leaf className="h-16 w-16" />, gradient: 'from-green-50 to-green-100' },
  greenhouse: { label: 'Invernadero', icon: <Home className="h-16 w-16" />, gradient: 'from-amber-50 to-amber-100' },
  mixed: { label: 'Mixta', icon: <Warehouse className="h-16 w-16" />, gradient: 'from-purple-50 to-purple-100' },
};

export function FacilityCard({
  facility,
  isCurrentFacility = false,
  onSwitchToFacility,
  onDelete,
}: FacilityCardProps) {
  const router = useRouter();
  const typeConfig = facilityTypeConfig[facility.facility_type || 'indoor'] || facilityTypeConfig.indoor;

  // Get location string
  const location = [facility.city, facility.administrative_division_1]
    .filter(Boolean)
    .join(', ') || 'Sin ubicación';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on dropdown menu
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown-menu]')) {
      return;
    }
    router.push(`/facilities/${facility._id}`);
  };

  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-shadow cursor-pointer group',
        isCurrentFacility && 'ring-2 ring-green-600'
      )}
      onClick={handleCardClick}
    >
      {/* Header visual / gradient background */}
      <div className={cn(
        'h-32 rounded-t-lg relative overflow-hidden bg-gradient-to-br',
        typeConfig.gradient
      )}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20 text-gray-400">
          {typeConfig.icon}
        </div>
        {/* Current facility badge */}
        {isCurrentFacility && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-600 text-white">
              <Star className="mr-1 h-3 w-3" />
              ACTUAL
            </Badge>
          </div>
        )}
        {/* Status badge in header */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={facility.status} />
        </div>
      </div>

      <CardContent className="pt-4 space-y-3">
        {/* Header with name and kebab menu */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <span className="font-bold text-lg text-gray-900 truncate block">{facility.name}</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Licencia: {facility.license_number}
            </p>
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
                <Link href={`/facilities/${facility._id}/edit`} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              {!isCurrentFacility && onSwitchToFacility && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwitchToFacility(facility._id);
                    }}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Cambiar a esta
                  </DropdownMenuItem>
                </>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Desactivar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Facility type */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Factory className="h-3.5 w-3.5" />
          <span>{typeConfig.label}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{location}</span>
        </div>

        {/* Primary crops */}
        {facility.cropTypes && facility.cropTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {facility.cropTypes.map((crop) => (
              <Badge key={crop._id} variant="outline" className="text-xs">
                {crop.display_name_es}
              </Badge>
            ))}
          </div>
        )}

        {/* Area info */}
        {facility.total_area_m2 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{facility.total_area_m2.toLocaleString()} m²</span>
            {facility.cultivation_area_m2 && (
              <>
                <span className="text-gray-300">|</span>
                <span>Cultivo: {facility.cultivation_area_m2.toLocaleString()} m²</span>
              </>
            )}
          </div>
        )}

        {/* Last update timestamp */}
        <div className="flex items-center gap-1 text-xs text-gray-400 pt-1">
          <Clock className="h-3 w-3" />
          <span>
            Creado:{' '}
            {facility.created_at
              ? new Date(facility.created_at).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'Sin registro'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
