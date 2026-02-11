'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { getStructureTypeLabel } from '@/lib/constants/structures';
import { getContainerTypeLabelByEnv } from '@/lib/constants/containers';

interface Structure {
  _id: string;
  name: string;
  structure_type: string;
  environment_type: string;
  num_levels: number;
  containers_per_level: number;
  container_type: string;
  positions_per_container: number;
  total_capacity: number;
  footprint_m2?: number;
  growing_area_m2?: number;
  sort_order: number;
  status: string;
  notes?: string;
}

interface StructureCardProps {
  structure: Structure;
  onEdit: (structure: Structure) => void;
  onDelete: (structure: Structure) => void;
}

export function StructureCard({
  structure,
  onEdit,
  onDelete,
}: StructureCardProps) {
  const containerLabel = getContainerTypeLabelByEnv(structure.container_type);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            {/* Header */}
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{structure.name}</h4>
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-gray-100 rounded">
                {getStructureTypeLabel(structure.structure_type)}
              </span>
              <StatusBadge status={structure.status} />
            </div>

            {/* Capacity formula */}
            <div className="text-sm text-muted-foreground font-mono">
              {structure.num_levels} nivel{structure.num_levels > 1 ? 'es' : ''}
              {' x '}
              {structure.containers_per_level} {containerLabel}
              {' x '}
              {structure.positions_per_container} pos
              {' = '}
              <span className="font-semibold text-foreground">
                {structure.total_capacity.toLocaleString()} plantas
              </span>
            </div>

            {/* Dimensions */}
            {(structure.footprint_m2 || structure.growing_area_m2) && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                {structure.footprint_m2 && (
                  <span>Huella: {structure.footprint_m2} m2</span>
                )}
                {structure.growing_area_m2 && (
                  <span>Area cultivo: {structure.growing_area_m2} m2</span>
                )}
              </div>
            )}

            {/* Notes */}
            {structure.notes && (
              <p className="text-xs text-muted-foreground italic">
                {structure.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(structure)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(structure)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
