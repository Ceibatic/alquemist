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

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phaseId: Id<'template_phases'>;
  phaseAreaType: string;
  day: number;
  companyId: Id<'companies'>;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AddActivityDialog({
  open,
  onOpenChange,
  phaseId,
  phaseAreaType,
  day,
  companyId,
}: AddActivityDialogProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [activityName, setActivityName] = useState('');
  const [startDay, setStartDay] = useState(day);
  const [phaseRole, setPhaseRole] = useState<string>('none');
  const [saving, setSaving] = useState(false);

  // Sync startDay when `day` prop changes (dialog opened for a different day)
  useEffect(() => {
    setStartDay(day);
  }, [day]);

  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedTypeId('');
      setSelectedTemplateId('');
      setActivityName('');
      setStartDay(day);
      setPhaseRole('none');
    }
  }, [open, day]);

  // Fetch activity types
  const activityTypes = useQuery(api.activityTypes.list, {
    companyId,
    status: 'active',
  });

  // Fetch activity templates filtered by type and phase
  const activityTemplates = useQuery(
    api.activityTemplates.list,
    selectedTypeId
      ? {
          companyId,
          typeId: selectedTypeId as Id<'activity_types'>,
          phase: phaseAreaType,
          isActive: true,
        }
      : 'skip'
  );

  const createFromTemplate = useMutation(
    api.templateActivities.createFromActivityTemplate
  );

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

  // When the type changes, reset the template selection
  function handleTypeChange(typeId: string) {
    setSelectedTypeId(typeId);
    setSelectedTemplateId('');
    setActivityName('');
  }

  async function handleSave() {
    if (!selectedTemplateId) {
      toast.error('Selecciona una plantilla de actividad');
      return;
    }

    setSaving(true);
    try {
      await createFromTemplate({
        phaseId,
        activityTemplateId: selectedTemplateId as Id<'activity_templates'>,
        startDay,
        activityName: activityName.trim() || undefined,
        phaseRole: phaseRole === 'entry' || phaseRole === 'exit' ? phaseRole : undefined,
      });
      toast.success('Actividad agregada', {
        description: `"${activityName}" fue agregada al día ${startDay}.`,
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
          <DialogTitle>Agregar Actividad - Día {day}</DialogTitle>
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

          {/* Activity Template */}
          <div className="space-y-1.5">
            <Label htmlFor="activity-template">Plantilla de actividad</Label>
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
                No hay plantillas disponibles para este tipo y fase.
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
              {/* Name (editable) */}
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

              {/* Duration (readonly) */}
              {durationDisplay && (
                <p className="text-xs text-muted-foreground">{durationDisplay}</p>
              )}

              {/* Description preview (readonly, truncated) */}
              {selectedTemplate.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {selectedTemplate.description}
                </p>
              )}
            </div>
          )}

          {/* Start Day (editable) */}
          <div className="space-y-1.5">
            <Label htmlFor="start-day">Día de inicio</Label>
            <Input
              id="start-day"
              type="number"
              min={1}
              value={startDay}
              onChange={(e) =>
                setStartDay(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
            />
          </div>

          {/* Phase Role */}
          <div className="space-y-1.5">
            <Label htmlFor="phase-role">Rol en la fase</Label>
            <Select value={phaseRole} onValueChange={setPhaseRole}>
              <SelectTrigger id="phase-role">
                <SelectValue placeholder="Regular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Regular</SelectItem>
                <SelectItem value="entry">Entrada a fase</SelectItem>
                <SelectItem value="exit">Salida de fase</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {phaseRole === 'entry'
                ? 'La fase no iniciará hasta ejecutar esta actividad.'
                : phaseRole === 'exit'
                  ? 'Al ejecutar esta actividad, la fase se completará automáticamente.'
                  : 'Actividad regular sin efecto en el ciclo de vida de la fase.'}
            </p>
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
            disabled={saving || !selectedTemplateId}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
