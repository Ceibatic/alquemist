'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Building2, Plus, Ruler, Sprout } from 'lucide-react';
import { StructureCard } from './structure-card';
import { StructureForm } from './structure-form';
import { type CreateStructureInput } from '@/lib/validations/structure';
import { toast } from 'sonner';

interface AreaStructuresTabProps {
  areaId: Id<'areas'>;
  environmentType?: string;
}

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
  status: string;
  notes?: string;
  sort_order: number;
}

/**
 * Extract prefixes from existing structure names.
 * Matches pattern: "Some Prefix 123" → prefix = "Some Prefix", number = 123
 */
function extractPrefixes(
  structures: Structure[]
): Array<{ prefix: string; nextNumber: number }> {
  const prefixMap = new Map<string, number>();

  for (const s of structures) {
    if (s.status !== 'active') continue;
    const match = s.name.match(/^(.+?)\s+(\d+)$/);
    if (match) {
      const prefix = match[1];
      const num = parseInt(match[2], 10);
      const current = prefixMap.get(prefix) || 0;
      if (num >= current) {
        prefixMap.set(prefix, num + 1);
      }
    }
  }

  return Array.from(prefixMap.entries()).map(([prefix, nextNumber]) => ({
    prefix,
    nextNumber,
  }));
}

export function AreaStructuresTab({
  areaId,
  environmentType = 'indoor',
}: AreaStructuresTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<Structure | null>(
    null
  );
  const [deletingStructure, setDeletingStructure] = useState<Structure | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const structures = useQuery(api.structures.getByArea, { areaId });
  const capacitySummary = useQuery(api.structures.getCapacitySummary, {
    areaId,
  });

  const createStructure = useMutation(api.structures.create);
  const createBatchStructures = useMutation(api.structures.createBatch);
  const updateStructure = useMutation(api.structures.update);
  const removeStructure = useMutation(api.structures.remove);

  const existingPrefixes = useMemo(() => {
    if (!structures) return [];
    return extractPrefixes(structures as Structure[]);
  }, [structures]);

  const handleCreate = async (data: CreateStructureInput) => {
    setIsSubmitting(true);
    try {
      await createStructure({
        areaId,
        name: data.name,
        structureType: data.structure_type,
        environmentType: data.environment_type,
        numLevels: data.num_levels,
        containersPerLevel: data.containers_per_level,
        containerType: data.container_type,
        positionsPerContainer: data.positions_per_container,
        footprintM2: data.footprint_m2,
        notes: data.notes,
      });
      toast.success('Estructura creada exitosamente');
      setFormOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al crear estructura'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBatch = async (data: {
    prefix: string;
    startNumber: number;
    quantity: number;
    structure_type: string;
    environment_type: string;
    num_levels: number;
    containers_per_level: number;
    container_type: string;
    positions_per_container: number;
    footprint_m2?: number;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createBatchStructures({
        areaId,
        prefix: data.prefix,
        startNumber: data.startNumber,
        quantity: data.quantity,
        structureType: data.structure_type,
        environmentType: data.environment_type,
        numLevels: data.num_levels,
        containersPerLevel: data.containers_per_level,
        containerType: data.container_type,
        positionsPerContainer: data.positions_per_container,
        footprintM2: data.footprint_m2,
        notes: data.notes,
      });
      toast.success(
        `${data.quantity} estructura${data.quantity > 1 ? 's' : ''} creada${data.quantity > 1 ? 's' : ''} exitosamente`
      );
      setFormOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al crear estructuras'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: CreateStructureInput) => {
    if (!editingStructure) return;
    setIsSubmitting(true);
    try {
      await updateStructure({
        id: editingStructure._id as Id<'structures'>,
        name: data.name,
        structureType: data.structure_type,
        environmentType: data.environment_type,
        numLevels: data.num_levels,
        containersPerLevel: data.containers_per_level,
        containerType: data.container_type,
        positionsPerContainer: data.positions_per_container,
        footprintM2: data.footprint_m2,
        notes: data.notes,
      });
      toast.success('Estructura actualizada');
      setEditingStructure(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al actualizar estructura'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStructure) return;
    try {
      await removeStructure({
        id: deletingStructure._id as Id<'structures'>,
      });
      toast.success('Estructura eliminada');
      setDeletingStructure(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al eliminar estructura'
      );
    }
  };

  if (structures === undefined || capacitySummary === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const envType = environmentType === 'outdoor' ? 'outdoor' : 'indoor';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold">Estructuras</h3>
          {structures.length > 0 && (
            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
              {structures.filter((s) => s.status === 'active').length} activas
            </span>
          )}
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white"
          size="sm"
        >
          <Plus className="mr-1 h-4 w-4" />
          Agregar Estructura
        </Button>
      </div>

      {/* Summary (only when structures exist) */}
      {capacitySummary.structureCount > 0 && (
        <div className="grid gap-3 grid-cols-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Estructuras</p>
                  <p className="text-lg font-bold">
                    {capacitySummary.structureCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Capacidad Total
                  </p>
                  <p className="text-lg font-bold">
                    {capacitySummary.totalCapacity.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Area Cultivo
                  </p>
                  <p className="text-lg font-bold">
                    {capacitySummary.totalGrowingAreaM2 > 0
                      ? `${capacitySummary.totalGrowingAreaM2} m2`
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Structure list */}
      {structures.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Sin estructuras configuradas
            </p>
            <p className="text-xs text-gray-400">
              Agrega estructuras (racks, hileras, camas) para calcular la
              capacidad automaticamente
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {structures
            .filter((s) => s.status === 'active')
            .map((structure) => (
              <StructureCard
                key={structure._id}
                structure={structure as Structure}
                onEdit={(s) => setEditingStructure(s)}
                onDelete={(s) => setDeletingStructure(s)}
              />
            ))}
        </div>
      )}

      {/* Create Form */}
      <StructureForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        onSubmitBatch={handleCreateBatch}
        environmentType={envType}
        isLoading={isSubmitting}
        mode="create"
        existingPrefixes={existingPrefixes}
      />

      {/* Edit Form */}
      {editingStructure && (
        <StructureForm
          open={!!editingStructure}
          onOpenChange={(open) => {
            if (!open) setEditingStructure(null);
          }}
          onSubmit={handleEdit}
          environmentType={envType}
          isLoading={isSubmitting}
          mode="edit"
          initialData={{
            name: editingStructure.name,
            structure_type: editingStructure.structure_type,
            environment_type: editingStructure.environment_type as 'indoor' | 'outdoor' | 'greenhouse',
            num_levels: editingStructure.num_levels,
            containers_per_level: editingStructure.containers_per_level,
            container_type: editingStructure.container_type,
            positions_per_container: editingStructure.positions_per_container,
            footprint_m2: editingStructure.footprint_m2,
            notes: editingStructure.notes,
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingStructure}
        onOpenChange={(open) => {
          if (!open) setDeletingStructure(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Estructura</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de eliminar &quot;{deletingStructure?.name}&quot;? La
              capacidad del area se recalculara automaticamente. Esta accion no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
