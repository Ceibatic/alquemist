'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Id } from '@/convex/_generated/dataModel';

interface FacilityAccessSelectProps {
  companyId: Id<'companies'>;
  selectedFacilityIds: string[];
  onFacilityToggle: (facilityId: string, checked: boolean) => void;
  error?: string;
}

export function FacilityAccessSelect({
  companyId,
  selectedFacilityIds,
  onFacilityToggle,
  error,
}: FacilityAccessSelectProps) {
  // Fetch facilities for the company
  const facilities = useQuery(api.facilities.getFacilitiesByCompany, {
    companyId,
  });

  if (facilities === undefined) {
    return (
      <div className="space-y-2">
        <Label>Acceso a Instalaciones</Label>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />
            <span className="ml-2 text-sm text-gray-600">
              Cargando instalaciones...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!facilities || facilities.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Acceso a Instalaciones</Label>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            No hay instalaciones disponibles. El usuario podrá acceder a las
            instalaciones una vez sean creadas.
          </p>
        </div>
      </div>
    );
  }

  const allSelected = selectedFacilityIds.length === facilities.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all facilities
      facilities.forEach((facility) => {
        if (!selectedFacilityIds.includes(facility._id)) {
          onFacilityToggle(facility._id, true);
        }
      });
    } else {
      // Deselect all facilities
      facilities.forEach((facility) => {
        if (selectedFacilityIds.includes(facility._id)) {
          onFacilityToggle(facility._id, false);
        }
      });
    }
  };

  return (
    <div className="space-y-3">
      <Label>
        Acceso a Instalaciones <span className="text-red-500">*</span>
      </Label>

      {/* Select All Option */}
      <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <Checkbox
          id="select-all"
          checked={allSelected}
          onCheckedChange={handleSelectAll}
        />
        <label
          htmlFor="select-all"
          className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Todas las instalaciones
        </label>
      </div>

      {/* Individual Facilities */}
      <div className="space-y-2">
        {facilities.map((facility) => {
          const isChecked = selectedFacilityIds.includes(facility._id);
          return (
            <div
              key={facility._id}
              className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50"
            >
              <Checkbox
                id={facility._id}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  onFacilityToggle(facility._id, checked as boolean)
                }
              />
              <label
                htmlFor={facility._id}
                className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <div className="font-medium">{facility.name}</div>
                {(facility.city || facility.administrative_division_1) && (
                  <div className="mt-1 text-xs text-gray-600">
                    {facility.city}
                    {facility.city && facility.administrative_division_1 && ', '}
                    {facility.administrative_division_1}
                  </div>
                )}
              </label>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {selectedFacilityIds.length > 0 && (
        <p className="text-sm text-gray-600">
          {selectedFacilityIds.length} de {facilities.length}{' '}
          {facilities.length === 1 ? 'instalación seleccionada' : 'instalaciones seleccionadas'}
        </p>
      )}
    </div>
  );
}
