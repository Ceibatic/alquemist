'use client';

import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFacility } from '@/components/providers/facility-provider';

const PHASES = [
  { value: 'propagation', label: 'Propagacion' },
  { value: 'vegetative', label: 'Vegetativo' },
  { value: 'flowering', label: 'Floracion' },
  { value: 'harvest', label: 'Cosecha' },
  { value: 'drying', label: 'Secado' },
  { value: 'curing', label: 'Curado' },
  { value: 'post_harvest', label: 'Poscosecha' },
  { value: 'processing', label: 'Procesamiento' },
  { value: 'storage', label: 'Almacenamiento' },
];

const PRIORITY_OPTIONS = [
  { value: 'routine', label: 'Rutinaria' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'critical', label: 'Critica' },
];

export interface WizardBasicData {
  name: string;
  code: string;
  description: string;
  typeId: string;
  defaultPriority: string;
  applicablePhases: string[];
  phaseDayStart: string;
  phaseDayEnd: string;
}

interface WizardStepBasicProps {
  data: WizardBasicData;
  onChange: (data: WizardBasicData) => void;
  isNew: boolean;
}

export function WizardStepBasic({ data, onChange, isNew }: WizardStepBasicProps) {
  const { currentCompanyId } = useFacility();

  const activityTypes = useQuery(
    api.activityTypes.list,
    currentCompanyId ? { companyId: currentCompanyId, status: 'active' } : 'skip' as any
  );

  // Auto-generate code from name (create only)
  useEffect(() => {
    if (isNew && data.name && !data.code) {
      const generated = data.name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 20);
      onChange({ ...data, code: generated });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, data.name]);

  const update = (partial: Partial<WizardBasicData>) => {
    onChange({ ...data, ...partial });
  };

  const togglePhase = (phase: string) => {
    const phases = data.applicablePhases.includes(phase)
      ? data.applicablePhases.filter((p) => p !== phase)
      : [...data.applicablePhases, phase];
    update({ applicablePhases: phases });
  };

  return (
    <div className="space-y-6">
      {/* Name + Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="wiz-name">Nombre *</Label>
          <Input
            id="wiz-name"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Ej: Fertirrigacion Vegetativa S1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wiz-code">Codigo</Label>
          <Input
            id="wiz-code"
            value={data.code}
            onChange={(e) => update({ code: e.target.value })}
            placeholder="Ej: FERT-VEG-S1"
            className="font-mono"
          />
        </div>
      </div>

      {/* Activity type */}
      <div className="space-y-2">
        <Label>Tipo de actividad *</Label>
        <Select value={data.typeId} onValueChange={(v) => update({ typeId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {activityTypes?.map((at) => (
              <SelectItem key={at._id} value={at._id}>
                {at.name} ({at.category})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label>Prioridad por defecto</Label>
        <Select
          value={data.defaultPriority}
          onValueChange={(v) => update({ defaultPriority: v })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="wiz-desc">Descripcion / Instrucciones</Label>
        <Textarea
          id="wiz-desc"
          value={data.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Instrucciones detalladas para el operador..."
          rows={3}
        />
      </div>

      {/* Phases */}
      <div className="space-y-2">
        <Label>Fases aplicables *</Label>
        <div className="flex flex-wrap gap-2">
          {PHASES.map((phase) => (
            <Badge
              key={phase.value}
              variant={data.applicablePhases.includes(phase.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => togglePhase(phase.value)}
            >
              {phase.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Day range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="wiz-dayStart">Dia inicio de fase</Label>
          <Input
            id="wiz-dayStart"
            type="number"
            value={data.phaseDayStart}
            onChange={(e) => update({ phaseDayStart: e.target.value })}
            placeholder="Ej: 1"
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wiz-dayEnd">Dia fin de fase</Label>
          <Input
            id="wiz-dayEnd"
            type="number"
            value={data.phaseDayEnd}
            onChange={(e) => update({ phaseDayEnd: e.target.value })}
            placeholder="Ej: 14"
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
