'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Lock,
  FileText,
  Thermometer,
  Droplets,
  FlaskConical,
  Zap,
  Clock,
  DollarSign,
  UserPlus,
  Plus,
  Trash2,
  Target,
  Ruler,
  Sparkles,
} from 'lucide-react';
import type { WizardFormData } from './activity-template-wizard';
import { READING_TYPES } from '@/lib/constants/environmental-readings';
import { getSuggestedSchema, type MeasurementFieldDef } from '@/lib/constants/measurement-schemas';

// ---------------------------------------------------------------------------
// Field definitions
// ---------------------------------------------------------------------------

/**
 * Essential fields — always included, not deselectable.
 * Shown with a lock icon in the UI.
 */
const ESSENTIAL_FIELDS = [
  { id: 'date', label: 'Fecha de actividad', description: 'Fecha en que se realizo la actividad' },
  { id: 'responsible', label: 'Responsable', description: 'Operador que ejecuta la actividad' },
  { id: 'batch', label: 'Lote', description: 'Lote de cultivo asociado' },
  { id: 'area', label: 'Area', description: 'Area donde se ejecuta' },
  { id: 'phase', label: 'Fase del cultivo', description: 'Fase actual del lote' },
];

/**
 * Optional fields — user can enable/disable per template.
 * The IDs are stored in `activity_templates.form_fields`.
 */
const OPTIONAL_FIELDS = [
  {
    id: 'observations',
    label: 'Observaciones / Notas',
    description: 'Campo de texto libre para observaciones del operador',
    icon: FileText,
    group: 'general',
  },
  {
    id: 'environmental_temp',
    label: 'Temperatura (°C)',
    description: 'Temperatura ambiental al momento de la actividad',
    icon: Thermometer,
    group: 'environmental',
  },
  {
    id: 'environmental_humidity',
    label: 'Humedad (%)',
    description: 'Humedad relativa del ambiente',
    icon: Droplets,
    group: 'environmental',
  },
  {
    id: 'environmental_ph',
    label: 'pH',
    description: 'Nivel de pH de la solucion o sustrato',
    icon: FlaskConical,
    group: 'environmental',
  },
  {
    id: 'environmental_ec',
    label: 'EC / Conductividad (mS/cm)',
    description: 'Conductividad electrica de la solucion',
    icon: Zap,
    group: 'environmental',
  },
  {
    id: 'duration_minutes',
    label: 'Duracion real (minutos)',
    description: 'Tiempo real que tomo ejecutar la actividad',
    icon: Clock,
    group: 'general',
  },
  {
    id: 'estimated_cost',
    label: 'Costo estimado',
    description: 'Costo estimado previo a la actividad',
    icon: DollarSign,
    group: 'cost',
  },
  {
    id: 'actual_cost',
    label: 'Costo real',
    description: 'Costo real de la actividad ejecutada',
    icon: DollarSign,
    group: 'cost',
  },
  {
    id: 'additional_responsible',
    label: 'Responsable adicional',
    description: 'Para actividades que requieren multiples operarios',
    icon: UserPlus,
    group: 'general',
  },
];

// Group labels for visual grouping
const GROUPS: Record<string, string> = {
  general: 'General',
  environmental: 'Datos ambientales',
  cost: 'Costos',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WizardStepFieldsProps {
  formData: WizardFormData;
  updateField: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
  activityTypes?: Array<{ _id: string; code: string; name: string; category: string }> | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WizardStepFields({ formData, updateField, activityTypes }: WizardStepFieldsProps) {
  const toggleField = (fieldId: string) => {
    const current = formData.formFields;
    updateField(
      'formFields',
      current.includes(fieldId)
        ? current.filter((f) => f !== fieldId)
        : [...current, fieldId]
    );
  };

  // Group optional fields
  const grouped = OPTIONAL_FIELDS.reduce(
    (acc, field) => {
      const group = field.group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    },
    {} as Record<string, typeof OPTIONAL_FIELDS>
  );

  return (
    <div className="space-y-6">
      {/* Essential fields (locked) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campos esenciales</CardTitle>
          <CardDescription>
            Estos campos siempre se incluyen en el formulario de reporte y no se pueden deshabilitar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ESSENTIAL_FIELDS.map((field) => (
              <div
                key={field.id}
                className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"
              >
                <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{field.label}</p>
                  <p className="text-xs text-gray-500">{field.description}</p>
                </div>
                <Checkbox checked disabled className="opacity-50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optional fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campos opcionales</CardTitle>
          <CardDescription>
            Selecciona los campos adicionales que apareceran en el formulario de reporte
            al ejecutar actividades con este template.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(grouped).map(([groupKey, fields], groupIdx) => (
            <div key={groupKey}>
              {groupIdx > 0 && <Separator className="mb-4" />}
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                {GROUPS[groupKey] ?? groupKey}
              </h4>
              <div className="space-y-3">
                {fields.map((field) => {
                  const Icon = field.icon;
                  const isChecked = formData.formFields.includes(field.id);
                  return (
                    <label
                      key={field.id}
                      className="flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{field.label}</p>
                        <p className="text-xs text-muted-foreground">{field.description}</p>
                      </div>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleField(field.id)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reference parameters — expected ranges for metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Parametros de referencia
          </CardTitle>
          <CardDescription>
            Define rangos esperados para metricas ambientales. Se usaran para validar lecturas y generar alertas de desviacion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.referenceParameters.map((param, idx) => {
            const readingType = READING_TYPES.find(r => r.type === param.metric);
            return (
              <div key={idx} className="flex items-end gap-2 rounded-lg border p-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Metrica</Label>
                  <Select
                    value={param.metric}
                    onValueChange={(val) => {
                      const rt = READING_TYPES.find(r => r.type === val);
                      const updated = [...formData.referenceParameters];
                      updated[idx] = { ...updated[idx], metric: val, unit: rt?.defaultUnit ?? '' };
                      updateField('referenceParameters', updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {READING_TYPES.map(rt => (
                        <SelectItem key={rt.type} value={rt.type}>{rt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20 space-y-1">
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={param.min}
                    onChange={(e) => {
                      const updated = [...formData.referenceParameters];
                      updated[idx] = { ...updated[idx], min: e.target.value };
                      updateField('referenceParameters', updated);
                    }}
                    placeholder={readingType ? String(readingType.normalRange[0]) : '--'}
                  />
                </div>
                <div className="w-20 space-y-1">
                  <Label className="text-xs">Ideal</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={param.target}
                    onChange={(e) => {
                      const updated = [...formData.referenceParameters];
                      updated[idx] = { ...updated[idx], target: e.target.value };
                      updateField('referenceParameters', updated);
                    }}
                    placeholder="--"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={param.max}
                    onChange={(e) => {
                      const updated = [...formData.referenceParameters];
                      updated[idx] = { ...updated[idx], max: e.target.value };
                      updateField('referenceParameters', updated);
                    }}
                    placeholder={readingType ? String(readingType.normalRange[1]) : '--'}
                  />
                </div>
                <div className="w-16 space-y-1">
                  <Label className="text-xs">Unidad</Label>
                  <Input
                    value={param.unit}
                    onChange={(e) => {
                      const updated = [...formData.referenceParameters];
                      updated[idx] = { ...updated[idx], unit: e.target.value };
                      updateField('referenceParameters', updated);
                    }}
                    placeholder="--"
                    className="text-xs"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    const updated = formData.referenceParameters.filter((_, i) => i !== idx);
                    updateField('referenceParameters', updated);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              updateField('referenceParameters', [
                ...formData.referenceParameters,
                { metric: '', target: '', min: '', max: '', unit: '' },
              ]);
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Agregar parametro
          </Button>
        </CardContent>
      </Card>

      {/* Measurement schema — structured fields for data capture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Campos de medicion
          </CardTitle>
          <CardDescription>
            Define los campos de datos que se capturan al ejecutar esta actividad.
            Estos campos aparecen en el formulario de reporte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Load suggested button */}
          {(() => {
            const selectedType = activityTypes?.find(at => at._id === formData.typeId);
            const typeCode = selectedType?.code ?? '';
            const suggested = getSuggestedSchema(typeCode);
            if (suggested.length > 0) {
              return (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mb-2"
                  onClick={() => updateField('measurementSchema', suggested)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Cargar sugerido ({suggested.length} campos)
                </Button>
              );
            }
            return null;
          })()}

          {/* Field list */}
          {formData.measurementSchema.map((field, idx) => (
            <div key={idx} className="flex items-end gap-2 rounded-lg border p-3">
              <div className="w-28 space-y-1">
                <Label className="text-xs">Key</Label>
                <Input
                  value={field.key}
                  onChange={(e) => {
                    const updated = [...formData.measurementSchema];
                    updated[idx] = { ...updated[idx], key: e.target.value };
                    updateField('measurementSchema', updated);
                  }}
                  placeholder="ej: water_ph"
                  className="text-xs font-mono"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Etiqueta</Label>
                <Input
                  value={field.label}
                  onChange={(e) => {
                    const updated = [...formData.measurementSchema];
                    updated[idx] = { ...updated[idx], label: e.target.value };
                    updateField('measurementSchema', updated);
                  }}
                  placeholder="ej: pH del agua"
                  className="text-xs"
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select
                  value={field.type}
                  onValueChange={(val) => {
                    const updated = [...formData.measurementSchema];
                    updated[idx] = { ...updated[idx], type: val as 'number' | 'text' | 'select' };
                    updateField('measurementSchema', updated);
                  }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Numero</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20 space-y-1">
                <Label className="text-xs">Unidad</Label>
                <Input
                  value={field.unit ?? ''}
                  onChange={(e) => {
                    const updated = [...formData.measurementSchema];
                    updated[idx] = { ...updated[idx], unit: e.target.value || undefined };
                    updateField('measurementSchema', updated);
                  }}
                  placeholder="--"
                  className="text-xs"
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Grupo</Label>
                <Input
                  value={field.group ?? ''}
                  onChange={(e) => {
                    const updated = [...formData.measurementSchema];
                    updated[idx] = { ...updated[idx], group: e.target.value || undefined };
                    updateField('measurementSchema', updated);
                  }}
                  placeholder="--"
                  className="text-xs"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  const updated = formData.measurementSchema.filter((_, i) => i !== idx);
                  updateField('measurementSchema', updated);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              updateField('measurementSchema', [
                ...formData.measurementSchema,
                { key: '', label: '', type: 'number' as const },
              ]);
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Agregar campo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
