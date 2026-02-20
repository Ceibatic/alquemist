'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PhaseItem } from './template-create-wizard';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AREA_TYPES = [
  { value: 'propagation', label: 'Propagacion' },
  { value: 'vegetative', label: 'Vegetativo' },
  { value: 'flowering', label: 'Floracion' },
  { value: 'drying', label: 'Secado' },
  { value: 'curing', label: 'Curado' },
  { value: 'storage', label: 'Almacenamiento' },
  { value: 'processing', label: 'Procesamiento' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PhaseCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase?: PhaseItem;
  onSave: (phase: Omit<PhaseItem, 'id'>) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PhaseCreateDialog({
  open,
  onOpenChange,
  phase,
  onSave,
}: PhaseCreateDialogProps) {
  const isEditing = !!phase;

  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('14');
  const [areaType, setAreaType] = useState('vegetative');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when editing an existing phase
  useEffect(() => {
    if (open) {
      if (phase) {
        setName(phase.name);
        setDurationDays(String(phase.durationDays));
        setAreaType(phase.areaType);
        setDescription(phase.description);
      } else {
        setName('');
        setDurationDays('14');
        setAreaType('vegetative');
        setDescription('');
      }
    }
  }, [open, phase]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('El nombre de la fase es requerido');
      return;
    }

    const days = parseInt(durationDays, 10);
    if (isNaN(days) || days < 1) {
      toast.error('La duracion debe ser al menos 1 dia');
      return;
    }

    setIsSaving(true);
    try {
      onSave({
        name: name.trim(),
        durationDays: days,
        areaType,
        description: description.trim(),
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Fase' : 'Nueva Fase'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="phase-name">Nombre *</Label>
            <Input
              id="phase-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Propagacion, Vegetativo, Floracion"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          {/* Duration + Area Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phase-duration">Duracion (dias) *</Label>
              <Input
                id="phase-duration"
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                min={1}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phase-area-type">Tipo de Area</Label>
              <Select value={areaType} onValueChange={setAreaType}>
                <SelectTrigger id="phase-area-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="phase-description">Descripcion</Label>
            <Textarea
              id="phase-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion de la fase..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar cambios' : 'Agregar fase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
