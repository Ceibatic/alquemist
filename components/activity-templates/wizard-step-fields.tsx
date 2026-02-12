'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  MessageSquare,
  Thermometer,
  Droplets,
  FlaskConical,
  Zap,
  Clock,
  DollarSign,
  Users,
  ClipboardList,
} from 'lucide-react';

/** IDs for essential fields (always included, not deselectable) */
export const ESSENTIAL_FIELDS = [
  { id: 'date', label: 'Fecha de actividad', icon: Clock },
  { id: 'responsible', label: 'Responsable', icon: Users },
  { id: 'batch', label: 'Lote', icon: ClipboardList },
  { id: 'area', label: 'Area', icon: ClipboardList },
  { id: 'phase', label: 'Fase del cultivo', icon: ClipboardList },
] as const;

/** IDs for optional fields that can be toggled */
interface OptionalField {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: 'environmental' | 'costs';
}

export const OPTIONAL_FIELDS: readonly OptionalField[] = [
  {
    id: 'observations',
    label: 'Observaciones / Notas',
    description: 'Campo de texto libre para notas del operador',
    icon: MessageSquare,
  },
  {
    id: 'environmental_temp',
    label: 'Temperatura',
    description: 'Registro de temperatura ambiente (°C)',
    icon: Thermometer,
    group: 'environmental',
  },
  {
    id: 'environmental_humidity',
    label: 'Humedad',
    description: 'Registro de humedad relativa (%)',
    icon: Droplets,
    group: 'environmental',
  },
  {
    id: 'environmental_ph',
    label: 'pH',
    description: 'Registro de pH del medio/sustrato',
    icon: FlaskConical,
    group: 'environmental',
  },
  {
    id: 'environmental_ec',
    label: 'EC / Conductividad',
    description: 'Registro de conductividad electrica (mS/cm)',
    icon: Zap,
    group: 'environmental',
  },
  {
    id: 'duration_minutes',
    label: 'Duracion real',
    description: 'Tiempo real que tomo la actividad (minutos)',
    icon: Clock,
  },
  {
    id: 'estimated_cost',
    label: 'Costo estimado',
    description: 'Costo planificado de la actividad',
    icon: DollarSign,
    group: 'costs',
  },
  {
    id: 'actual_cost',
    label: 'Costo real',
    description: 'Costo real incurrido',
    icon: DollarSign,
    group: 'costs',
  },
  {
    id: 'checklist',
    label: 'Checklist de verificacion',
    description: 'Usa los items del checklist del template como checkboxes',
    icon: ClipboardList,
  },
  {
    id: 'additional_responsible',
    label: 'Responsable adicional',
    description: 'Para actividades que requieren multiples operarios',
    icon: Users,
  },
];

export type OptionalFieldId = string;

interface WizardStepFieldsProps {
  selectedFields: string[];
  onChange: (fields: string[]) => void;
}

export function WizardStepFields({ selectedFields, onChange }: WizardStepFieldsProps) {
  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      onChange(selectedFields.filter((f) => f !== fieldId));
    } else {
      onChange([...selectedFields, fieldId]);
    }
  };

  // Group environmental and cost fields
  const environmentalFields = OPTIONAL_FIELDS.filter((f) => f.group === 'environmental');
  const costFields = OPTIONAL_FIELDS.filter((f) => f.group === 'costs');
  const otherFields = OPTIONAL_FIELDS.filter((f) => !f.group);

  return (
    <div className="space-y-6">
      {/* Essential fields — locked */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold">Campos esenciales</Label>
          <Badge variant="secondary" className="text-xs">Siempre incluidos</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ESSENTIAL_FIELDS.map((field) => {
            const Icon = field.icon;
            return (
              <div
                key={field.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 opacity-75"
              >
                <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{field.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional fields */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Campos opcionales del formulario</Label>
        <p className="text-xs text-muted-foreground">
          Selecciona los campos que apareceran al reportar esta actividad
        </p>

        {/* General fields */}
        <div className="space-y-2">
          {otherFields.map((field) => {
            const Icon = field.icon;
            const checked = selectedFields.includes(field.id);
            return (
              <label
                key={field.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  checked ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleField(field.id)}
                  className="mt-0.5"
                />
                <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{field.label}</span>
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Environmental data group */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Datos ambientales
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {environmentalFields.map((field) => {
              const Icon = field.icon;
              const checked = selectedFields.includes(field.id);
              return (
                <label
                  key={field.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleField(field.id)}
                    className="mt-0.5"
                  />
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{field.label}</span>
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Cost fields group */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Costos
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {costFields.map((field) => {
              const Icon = field.icon;
              const checked = selectedFields.includes(field.id);
              return (
                <label
                  key={field.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleField(field.id)}
                    className="mt-0.5"
                  />
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{field.label}</span>
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
