'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// ── Props ────────────────────────────────────────────────────────────────────

interface AddOrderActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: Id<'production_orders'>;
  scheduledDate: number;
  minDate: number;
  maxDate: number;
  companyId: Id<'companies'>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDateInputValue(ts: number): string {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(val: string): number {
  const [y, m, d] = val.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

function formatDateLabel(ts: number): string {
  return new Date(ts).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

// ── Component ────────────────────────────────────────────────────────────────

export function AddOrderActivityDialog({
  open,
  onOpenChange,
  orderId,
  scheduledDate,
  minDate,
  maxDate,
  companyId,
}: AddOrderActivityDialogProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [activityName, setActivityName] = useState('');
  const [dateValue, setDateValue] = useState(toDateInputValue(scheduledDate));
  const [saving, setSaving] = useState(false);

  // Sync date when prop changes
  useEffect(() => {
    setDateValue(toDateInputValue(scheduledDate));
  }, [scheduledDate]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedTypeId('');
      setSelectedTemplateId('');
      setActivityName('');
      setDateValue(toDateInputValue(scheduledDate));
    }
  }, [open, scheduledDate]);

  // Fetch activity types
  const activityTypes = useQuery(api.activityTypes.list, {
    companyId,
    status: 'active',
  });

  // Fetch activity templates filtered by type
  const activityTemplates = useQuery(
    api.activityTemplates.list,
    selectedTypeId
      ? {
          companyId,
          typeId: selectedTypeId as Id<'activity_types'>,
          isActive: true,
        }
      : 'skip'
  );

  const createForOrder = useMutation(api.scheduledActivities.createForOrder);

  // Find the selected template object
  const selectedTemplate =
    activityTemplates?.find((t) => t._id === selectedTemplateId) ?? null;

  // When a template is selected, pre-fill the name
  useEffect(() => {
    if (selectedTemplate) {
      setActivityName(selectedTemplate.name);
    } else {
      setActivityName('');
    }
  }, [selectedTemplateId, selectedTemplate]);

  function handleTypeChange(typeId: string) {
    setSelectedTypeId(typeId);
    setSelectedTemplateId('');
    setActivityName('');
  }

  async function handleSave() {
    if (!selectedTypeId) {
      toast.error('Selecciona un tipo de actividad');
      return;
    }

    setSaving(true);
    try {
      const selectedDateTs = fromDateInputValue(dateValue);

      await createForOrder({
        orderId,
        typeId: selectedTypeId as Id<'activity_types'>,
        activityTemplateId: selectedTemplateId
          ? (selectedTemplateId as Id<'activity_templates'>)
          : undefined,
        scheduledDate: selectedDateTs,
        estimatedDurationMinutes: selectedTemplate?.estimated_duration_minutes,
        instructions: selectedTemplate?.description,
        activityName: activityName.trim() || undefined,
      });

      toast.success('Actividad agregada', {
        description: `"${activityName || 'Actividad'}" programada para ${formatDateLabel(selectedDateTs)}.`,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error('Error al agregar la actividad', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setSaving(false);
    }
  }

  // Duration display for the selected template preview
  function getDurationDisplay() {
    if (!selectedTemplate) return null;
    if (
      selectedTemplate.duration_type === 'days' &&
      selectedTemplate.duration_value != null
    ) {
      return `Duración: ${selectedTemplate.duration_value} día${selectedTemplate.duration_value !== 1 ? 's' : ''}`;
    }
    if (selectedTemplate.estimated_duration_minutes != null) {
      const mins = selectedTemplate.estimated_duration_minutes;
      const text = mins >= 60 ? `${Math.round(mins / 60)}h` : `${mins}min`;
      return `Duración estimada: ${text}`;
    }
    return null;
  }

  const durationDisplay = getDurationDisplay();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Agregar Actividad — {formatDateLabel(scheduledDate)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Activity Type */}
          <div className="space-y-1.5">
            <Label htmlFor="activity-type">Tipo de actividad</Label>
            {activityTypes === undefined ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando tipos...
              </div>
            ) : (
              <Select value={selectedTypeId} onValueChange={handleTypeChange}>
                <SelectTrigger id="activity-type">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Activity Template (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="activity-template">
              Plantilla de actividad{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            {!selectedTypeId ? (
              <p className="text-xs text-muted-foreground italic">
                Selecciona un tipo de actividad primero.
              </p>
            ) : activityTemplates === undefined ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando plantillas...
              </div>
            ) : activityTemplates.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No hay plantillas disponibles para este tipo.
              </p>
            ) : (
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger id="activity-template">
                  <SelectValue placeholder="Seleccionar plantilla..." />
                </SelectTrigger>
                <SelectContent>
                  {activityTemplates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Preview section (shown when template selected) */}
          {selectedTemplate && (
            <div className="rounded-md border bg-gray-50 p-3 space-y-2">
              <div className="space-y-1">
                <Label htmlFor="activity-name" className="text-xs">
                  Nombre de la actividad
                </Label>
                <Input
                  id="activity-name"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Nombre de la actividad"
                />
              </div>

              {durationDisplay && (
                <p className="text-xs text-muted-foreground">{durationDisplay}</p>
              )}

              {selectedTemplate.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {selectedTemplate.description}
                </p>
              )}
            </div>
          )}

          {/* Scheduled Date */}
          <div className="space-y-1.5">
            <Label htmlFor="scheduled-date">Fecha programada</Label>
            <Input
              id="scheduled-date"
              type="date"
              value={dateValue}
              min={toDateInputValue(minDate)}
              max={toDateInputValue(maxDate)}
              onChange={(e) => setDateValue(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleSave}
            disabled={saving || !selectedTypeId}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
