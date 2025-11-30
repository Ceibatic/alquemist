'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Mock data for Colombian departments and municipalities
// This will be replaced with actual API data from Convex
const DEPARTMENTS = [
  { code: 'ANT', name: 'Antioquia' },
  { code: 'ATL', name: 'Atlántico' },
  { code: 'BOG', name: 'Bogotá D.C.' },
  { code: 'BOL', name: 'Bolívar' },
  { code: 'BOY', name: 'Boyacá' },
  { code: 'CAL', name: 'Caldas' },
  { code: 'CAQ', name: 'Caquetá' },
  { code: 'CAS', name: 'Casanare' },
  { code: 'CAU', name: 'Cauca' },
  { code: 'CES', name: 'Cesar' },
  { code: 'CHO', name: 'Chocó' },
  { code: 'COR', name: 'Córdoba' },
  { code: 'CUN', name: 'Cundinamarca' },
  { code: 'HUI', name: 'Huila' },
  { code: 'LAG', name: 'La Guajira' },
  { code: 'MAG', name: 'Magdalena' },
  { code: 'MET', name: 'Meta' },
  { code: 'NAR', name: 'Nariño' },
  { code: 'NSA', name: 'Norte de Santander' },
  { code: 'QUI', name: 'Quindío' },
  { code: 'RIS', name: 'Risaralda' },
  { code: 'SAN', name: 'Santander' },
  { code: 'SUC', name: 'Sucre' },
  { code: 'TOL', name: 'Tolima' },
  { code: 'VAC', name: 'Valle del Cauca' },
];

const MUNICIPALITIES: Record<string, { code: string; name: string }[]> = {
  ANT: [
    { code: 'MED', name: 'Medellín' },
    { code: 'BEL', name: 'Bello' },
    { code: 'ITA', name: 'Itagüí' },
    { code: 'ENV', name: 'Envigado' },
    { code: 'RIO', name: 'Rionegro' },
    { code: 'SAB', name: 'Sabaneta' },
  ],
  BOG: [{ code: 'BOG', name: 'Bogotá D.C.' }],
  VAC: [
    { code: 'CAL', name: 'Cali' },
    { code: 'PAL', name: 'Palmira' },
    { code: 'BUE', name: 'Buenaventura' },
    { code: 'TUL', name: 'Tuluá' },
    { code: 'CAR', name: 'Cartago' },
  ],
  ATL: [
    { code: 'BAQ', name: 'Barranquilla' },
    { code: 'SOL', name: 'Soledad' },
    { code: 'MAL', name: 'Malambo' },
    { code: 'SAB', name: 'Sabanalarga' },
  ],
  SAN: [
    { code: 'BUC', name: 'Bucaramanga' },
    { code: 'FLO', name: 'Floridablanca' },
    { code: 'GIR', name: 'Girón' },
    { code: 'PIE', name: 'Piedecuesta' },
  ],
  // Add more departments as needed
};

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
  const [availableMunicipalities, setAvailableMunicipalities] = React.useState<
    { code: string; name: string }[]
  >([]);

  // Update available municipalities when department changes
  React.useEffect(() => {
    if (departmentValue) {
      const municipalities = MUNICIPALITIES[departmentValue] || [];
      setAvailableMunicipalities(municipalities);

      // Clear municipality selection if it's not in the new list
      if (
        municipalityValue &&
        !municipalities.find((m) => m.code === municipalityValue)
      ) {
        onMunicipalityChange?.('');
      }
    } else {
      setAvailableMunicipalities([]);
      onMunicipalityChange?.('');
    }
  }, [departmentValue, municipalityValue, onMunicipalityChange]);

  const handleDepartmentChange = (value: string) => {
    onDepartmentChange?.(value);
    // Municipality will be cleared by the useEffect above
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
          disabled={disabled}
        >
          <SelectTrigger
            id="department"
            className={cn(departmentError && 'border-destructive')}
          >
            <SelectValue placeholder="Selecciona un departamento" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept.code} value={dept.code}>
                {dept.name}
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
          disabled={disabled || !departmentValue || availableMunicipalities.length === 0}
        >
          <SelectTrigger
            id="municipality"
            className={cn(municipalityError && 'border-destructive')}
          >
            <SelectValue
              placeholder={
                !departmentValue
                  ? 'Primero selecciona un departamento'
                  : availableMunicipalities.length === 0
                    ? 'No hay municipios disponibles'
                    : 'Selecciona un municipio'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableMunicipalities.map((mun) => (
              <SelectItem key={mun.code} value={mun.code}>
                {mun.name}
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
