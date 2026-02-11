'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { WizardFormData } from './activity-template-wizard';

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

interface WizardStepBasicProps {
  formData: WizardFormData;
  updateField: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
  activityTypes: any[] | undefined;
  cropTypes: any[] | undefined;
  isEdit: boolean;
}

export function WizardStepBasic({
  formData,
  updateField,
  activityTypes,
  cropTypes,
}: WizardStepBasicProps) {
  const togglePhase = (phase: string) => {
    const current = formData.applicablePhases;
    updateField(
      'applicablePhases',
      current.includes(phase)
        ? current.filter((p) => p !== phase)
        : [...current, phase]
    );
  };

  const toggleCropType = (ctId: string) => {
    const current = formData.cropTypeIds;
    updateField(
      'cropTypeIds',
      current.includes(ctId)
        ? current.filter((c) => c !== ctId)
        : [...current, ctId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informacion basica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ej: Fertirrigacion Vegetativa S1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Codigo</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => updateField('code', e.target.value)}
                placeholder="Ej: FERT-VEG-S1"
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de actividad *</Label>
              <Select
                value={formData.typeId}
                onValueChange={(v) => updateField('typeId', v)}
              >
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
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad por defecto</Label>
              <Select
                value={formData.defaultPriority}
                onValueChange={(v) => updateField('defaultPriority', v)}
              >
                <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion / Instrucciones</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Instrucciones detalladas para el operador..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Applicability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fases aplicables *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PHASES.map((phase) => (
              <Badge
                key={phase.value}
                variant={formData.applicablePhases.includes(phase.value) ? 'default' : 'outline'}
                className="cursor-pointer select-none"
                onClick={() => togglePhase(phase.value)}
              >
                {phase.label}
              </Badge>
            ))}
          </div>

          {/* Crop types */}
          {cropTypes && cropTypes.length > 0 && (
            <div className="space-y-2">
              <Label>Tipos de cultivo (opcional)</Label>
              <div className="flex flex-wrap gap-2">
                {cropTypes.map((ct) => (
                  <Badge
                    key={ct._id}
                    variant={formData.cropTypeIds.includes(ct._id) ? 'default' : 'outline'}
                    className="cursor-pointer select-none"
                    onClick={() => toggleCropType(ct._id)}
                  >
                    {ct.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Day range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayStart">Dia inicio de fase (opcional)</Label>
              <Input
                id="dayStart"
                type="number"
                value={formData.phaseDayStart}
                onChange={(e) => updateField('phaseDayStart', e.target.value)}
                placeholder="Ej: 1"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dayEnd">Dia fin de fase (opcional)</Label>
              <Input
                id="dayEnd"
                type="number"
                value={formData.phaseDayEnd}
                onChange={(e) => updateField('phaseDayEnd', e.target.value)}
                placeholder="Ej: 14"
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
