'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Lock,
  FileText,
  Thermometer,
  Droplets,
  FlaskConical,
  Zap,
  Clock,
  DollarSign,
  ListChecks,
  UserPlus,
} from 'lucide-react';
import type { WizardFormData } from './activity-template-wizard';

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
    id: 'checklist',
    label: 'Checklist de verificacion',
    description: 'Lista de pasos a verificar (configurada en el template)',
    icon: ListChecks,
    group: 'general',
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
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WizardStepFields({ formData, updateField }: WizardStepFieldsProps) {
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
    </div>
  );
}
