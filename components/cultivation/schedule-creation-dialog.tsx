'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const DEFAULT_PHASES = [
  { phase: 'propagation', duration_days: 14 },
  { phase: 'vegetative', duration_days: 28 },
  { phase: 'flowering', duration_days: 63 },
  { phase: 'harvest', duration_days: 1 },
  { phase: 'post_harvest', duration_days: 21 },
];

const PHASE_LABELS: Record<string, string> = {
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
  post_harvest: 'Poscosecha',
  processing: 'Procesamiento',
  storage: 'Almacenamiento',
};

interface ScheduleCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: Id<'batches'>;
  companyId: Id<'companies'>;
  cropTypeId?: Id<'crop_types'>;
}

export function ScheduleCreationDialog({
  open,
  onOpenChange,
  batchId,
  companyId,
  cropTypeId,
}: ScheduleCreationDialogProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [phases, setPhases] = useState(
    DEFAULT_PHASES.map((p) => ({ ...p }))
  );
  const [isCreating, setIsCreating] = useState(false);

  const createMutation = useMutation(api.cultivationSchedules.create);

  // Get crop types for name suggestion
  const cropTypes = useQuery(api.crops.getCropTypes, {});
  const cropTypeName = cropTypeId
    ? cropTypes?.find((ct) => ct._id === cropTypeId)?.name
    : null;

  const updatePhaseDuration = (index: number, days: number) => {
    setPhases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], duration_days: days };
      return updated;
    });
  };

  const removePhase = (index: number) => {
    setPhases((prev) => prev.filter((_, i) => i !== index));
  };

  const totalDays = phases.reduce((sum, p) => sum + p.duration_days, 0);

  const handleCreate = async () => {
    const scheduleName = name.trim() || `Plan ${cropTypeName ?? 'Cultivo'} ${new Date(startDate).toLocaleDateString()}`;

    if (phases.length === 0) {
      toast.error('Agrega al menos una fase');
      return;
    }

    if (!cropTypeId) {
      toast.error('El batch debe tener un tipo de cultivo asignado');
      return;
    }

    try {
      setIsCreating(true);
      await createMutation({
        companyId,
        batchId,
        cropTypeId,
        name: scheduleName,
        plannedPhases: phases.map((p) => ({
          phase: p.phase,
          duration_days: p.duration_days,
        })),
        plannedStartDate: new Date(startDate).getTime(),
      });
      toast.success('Plan de cultivo creado. Genera las actividades para continuar.');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear plan');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear plan de cultivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del plan</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Plan ${cropTypeName ?? 'Cultivo'} ${new Date(startDate).toLocaleDateString()}`}
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha de inicio</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Fases y duracion (dias)</Label>
            <div className="space-y-2">
              {phases.map((phase, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm flex-1 min-w-0 truncate">
                    {PHASE_LABELS[phase.phase] ?? phase.phase}
                  </span>
                  <Input
                    type="number"
                    min={1}
                    value={phase.duration_days}
                    onChange={(e) =>
                      updatePhaseDuration(index, Number(e.target.value) || 1)
                    }
                    className="w-20 text-center"
                  />
                  <span className="text-xs text-muted-foreground">dias</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removePhase(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Total: {totalDays} dias</span>
              <span className="text-xs text-muted-foreground">
                ~{Math.round(totalDays / 7)} semanas
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Crear plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
