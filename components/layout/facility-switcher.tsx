'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Check, ChevronsUpDown, Factory, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FacilitySwitcherProps {
  userId: string;
  currentFacilityId?: string;
  onFacilityChange?: (facilityId: string) => void;
}

export function FacilitySwitcher({
  userId,
  currentFacilityId,
  onFacilityChange,
}: FacilitySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Get user data to find company
  const user = useQuery(api.users.getUserById, {
    userId: userId as Id<'users'>,
  });

  // Get all facilities for the company
  const facilities = useQuery(
    api.facilities.getFacilitiesByCompany,
    user?.companyId ? { companyId: user.companyId as Id<'companies'> } : 'skip'
  );

  // Find current facility from the list
  const currentFacility = facilities?.find(
    (f) => f._id === currentFacilityId
  ) || facilities?.[0];

  // Auto-select first facility if none is selected
  useEffect(() => {
    if (!currentFacilityId && facilities && facilities.length > 0) {
      onFacilityChange?.(facilities[0]._id);
    }
  }, [currentFacilityId, facilities, onFacilityChange]);

  const handleFacilitySelect = (facilityId: string) => {
    setIsOpen(false);
    onFacilityChange?.(facilityId);
  };

  const handleManageFacilities = () => {
    setIsOpen(false);
    router.push('/facilities');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Factory className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {currentFacility?.name || 'Seleccionar instalación'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Instalaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!facilities || facilities.length === 0 ? (
          <DropdownMenuItem disabled>
            No hay instalaciones disponibles
          </DropdownMenuItem>
        ) : (
          facilities.map((facility) => (
            <DropdownMenuItem
              key={facility._id}
              onClick={() => handleFacilitySelect(facility._id)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4 shrink-0',
                  currentFacility?._id === facility._id
                    ? 'opacity-100'
                    : 'opacity-0'
                )}
              />
              <Factory className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{facility.name}</span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleManageFacilities} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Administrar Instalaciones</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
