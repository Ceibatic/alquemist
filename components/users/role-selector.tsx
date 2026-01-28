'use client';

import { useEffect, useState } from 'react';
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
import { Info } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface Role {
  _id: Id<'roles'>;
  name: string;
  display_name_es: string;
  display_name_en: string;
  description?: string;
  level: number;
}

interface RoleSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  currentUserRoleLevel?: number;
  error?: string;
}

const roleDescriptions: Record<string, string> = {
  COMPANY_OWNER:
    'Acceso completo a todos los recursos y configuraciones de la empresa',
  FACILITY_MANAGER:
    'Puede administrar todas las operaciones de una instalación específica, incluyendo áreas, inventario y reportes',
  PRODUCTION_SUPERVISOR:
    'Supervisa actividades de producción y control de calidad',
  WORKER: 'Ejecuta actividades asignadas y tareas diarias',
  VIEWER: 'Acceso de solo lectura a los datos de la empresa',
};

export function RoleSelector({
  value,
  onValueChange,
  currentUserRoleLevel,
  error,
}: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Fetch all system roles from Convex
  const rolesFromDb = useQuery(api.roles.list);

  // Fallback to hardcoded roles if query is loading or fails
  const fallbackRoles: Role[] = [
    {
      _id: 'COMPANY_OWNER' as Id<'roles'>,
      name: 'COMPANY_OWNER',
      display_name_es: 'Propietario',
      display_name_en: 'Company Owner',
      description: roleDescriptions.COMPANY_OWNER,
      level: 1000,
    },
    {
      _id: 'FACILITY_MANAGER' as Id<'roles'>,
      name: 'FACILITY_MANAGER',
      display_name_es: 'Gerente de Instalación',
      display_name_en: 'Facility Manager',
      description: roleDescriptions.FACILITY_MANAGER,
      level: 500,
    },
    {
      _id: 'PRODUCTION_SUPERVISOR' as Id<'roles'>,
      name: 'PRODUCTION_SUPERVISOR',
      display_name_es: 'Supervisor de Producción',
      display_name_en: 'Production Supervisor',
      description: roleDescriptions.PRODUCTION_SUPERVISOR,
      level: 300,
    },
    {
      _id: 'WORKER' as Id<'roles'>,
      name: 'WORKER',
      display_name_es: 'Trabajador',
      display_name_en: 'Worker',
      description: roleDescriptions.WORKER,
      level: 100,
    },
    {
      _id: 'VIEWER' as Id<'roles'>,
      name: 'VIEWER',
      display_name_es: 'Observador',
      display_name_en: 'Viewer',
      description: roleDescriptions.VIEWER,
      level: 10,
    },
  ];

  // Use roles from database if available, otherwise use fallback
  const systemRoles = rolesFromDb || fallbackRoles;

  // Update selected role when value changes
  useEffect(() => {
    const role = systemRoles.find((r) => r._id === value);
    setSelectedRole(role || null);
  }, [value, systemRoles]);

  // Filter roles based on current user's level
  const availableRoles = systemRoles.filter((role) => {
    if (!currentUserRoleLevel) return true;
    // Users can only assign roles at their level or below
    return role.level <= currentUserRoleLevel;
  });

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="role">
          Rol <span className="text-red-500">*</span>
        </Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            id="role"
            className={error ? 'border-red-500' : ''}
          >
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role._id} value={role._id}>
                {role.display_name_es}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      {/* Role Description */}
      {selectedRole && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                {selectedRole.display_name_es}
              </p>
              <p className="text-sm text-blue-700">
                {selectedRole.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
