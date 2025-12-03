'use client';

import * as React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface CascadingSelectProps {
  departmentValue?: string;
  municipalityValue?: string;
  onDepartmentChange?: (value: string) => void;
  onMunicipalityChange?: (value: string) => void;
  departmentError?: string;
  municipalityError?: string;
  departmentLabel?: string;
  municipalityLabel?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CascadingSelect({
  departmentValue,
  municipalityValue,
  onDepartmentChange,
  onMunicipalityChange,
  departmentError,
  municipalityError,
  departmentLabel = 'Departamento',
  municipalityLabel = 'Municipio',
  required = false,
  disabled = false,
  className,
}: CascadingSelectProps) {
  // Fetch departments from Convex
  const departments = useQuery(api.geographic.getDepartments, { countryCode: 'CO' });

  // Fetch municipalities for selected department
  const municipalities = useQuery(
    api.geographic.getMunicipalities,
    departmentValue ? { countryCode: 'CO', departmentCode: departmentValue } : 'skip'
  );

  const isLoadingDepartments = departments === undefined;
  const isLoadingMunicipalities = departmentValue && municipalities === undefined;

  // Clear municipality when department changes and municipality is no longer valid
  const prevDepartmentRef = React.useRef(departmentValue);
  React.useEffect(() => {
    if (prevDepartmentRef.current !== departmentValue) {
      prevDepartmentRef.current = departmentValue;
      // Clear municipality when department changes
      if (municipalityValue) {
        onMunicipalityChange?.('');
      }
    }
  }, [departmentValue, municipalityValue, onMunicipalityChange]);

  const handleDepartmentChange = (value: string) => {
    onDepartmentChange?.(value);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Department Select */}
      <div className="space-y-2">
        <Label htmlFor="department">
          {departmentLabel}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select
          value={departmentValue}
          onValueChange={handleDepartmentChange}
          disabled={disabled || isLoadingDepartments}
        >
          <SelectTrigger
            id="department"
            className={cn(departmentError && 'border-destructive')}
          >
            <SelectValue placeholder={isLoadingDepartments ? 'Cargando...' : 'Selecciona un departamento'} />
          </SelectTrigger>
          <SelectContent>
            {(departments ?? []).map((dept) => (
              <SelectItem key={dept.division_1_code} value={dept.division_1_code!}>
                {dept.division_1_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {departmentError && (
          <p className="text-sm text-destructive">{departmentError}</p>
        )}
      </div>

      {/* Municipality Select */}
      <div className="space-y-2">
        <Label htmlFor="municipality">
          {municipalityLabel}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select
          value={municipalityValue}
          onValueChange={onMunicipalityChange}
          disabled={disabled || !departmentValue || isLoadingMunicipalities || (municipalities ?? []).length === 0}
        >
          <SelectTrigger
            id="municipality"
            className={cn(municipalityError && 'border-destructive')}
          >
            <SelectValue
              placeholder={
                !departmentValue
                  ? 'Primero selecciona un departamento'
                  : isLoadingMunicipalities
                    ? 'Cargando...'
                    : (municipalities ?? []).length === 0
                      ? 'No hay municipios disponibles'
                      : 'Selecciona un municipio'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(municipalities ?? []).map((mun) => (
              <SelectItem key={mun.division_2_code} value={mun.division_2_code!}>
                {mun.division_2_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {municipalityError && (
          <p className="text-sm text-destructive">{municipalityError}</p>
        )}
      </div>
    </div>
  );
}
