'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useFacility } from '@/components/providers/facility-provider';
import {
  ClipboardCheck,
  Camera,
  Paperclip,
  Repeat,
  Link2,
  ChevronDown,
  Shield,
} from 'lucide-react';

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Una vez' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Bisemanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'on_demand', label: 'A demanda' },
  { value: 'custom_days', label: 'Custom (cada N dias)' },
];

export interface WizardConfigData {
  qualityCheckTemplateId: string;
  requiresPhotos: boolean;
  requiresAttachments: boolean;
  frequencyType: string;
  frequencyIntervalDays: string;
  repeatCount: string;
  estimatedDurationMinutes: string;
  laborHoursPer1000Plants: string;
  dependsOnTemplateId: string;
  minDaysAfterDependency: string;
  regulatoryReference: string;
  requiresVerification: boolean;
}

interface WizardStepConfigProps {
  data: WizardConfigData;
  onChange: (data: WizardConfigData) => void;
}

export function WizardStepConfig({ data, onChange }: WizardStepConfigProps) {
  const { currentCompanyId } = useFacility();

  const qcTemplates = useQuery(
    api.qualityCheckTemplates.list,
    currentCompanyId
      ? { companyId: currentCompanyId, status: 'active' as const }
      : 'skip' as any
  );

  const allTemplates = useQuery(
    api.activityTemplates.list,
    currentCompanyId
      ? { companyId: currentCompanyId, isActive: true }
      : 'skip' as any
  );

  const update = (partial: Partial<WizardConfigData>) => {
    onChange({ ...data, ...partial });
  };

  // Selected QC template info
  const selectedQcTemplate = useMemo(() => {
    if (!data.qualityCheckTemplateId || !qcTemplates) return null;
    return qcTemplates.find((t) => t._id === data.qualityCheckTemplateId) ?? null;
  }, [data.qualityCheckTemplateId, qcTemplates]);

  const showRepeat = data.frequencyType !== 'once' && data.frequencyType !== 'on_demand';

  return (
    <div className="space-y-8">
      {/* Quality section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Control de Calidad</Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={!!data.qualityCheckTemplateId}
            onCheckedChange={(checked) => {
              if (!checked) {
                update({ qualityCheckTemplateId: '' });
              }
            }}
          />
          <Label className="cursor-pointer text-sm">
            Requiere formulario de calidad
          </Label>
        </div>

        {(!!data.qualityCheckTemplateId || data.qualityCheckTemplateId === '') && (
          <div className="space-y-2 ml-11">
            <Select
              value={data.qualityCheckTemplateId || 'none'}
              onValueChange={(v) =>
                update({ qualityCheckTemplateId: v === 'none' ? '' : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar formulario de calidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin formulario de calidad</SelectItem>
                {qcTemplates?.map((qct) => (
                  <SelectItem key={qct._id} value={qct._id}>
                    {qct.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedQcTemplate && (
              <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                <div className="font-medium">{selectedQcTemplate.name}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedQcTemplate.procedure_type}
                  </Badge>
                  {selectedQcTemplate.ai_assisted && (
                    <Badge variant="secondary" className="text-xs">AI</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Documentation section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Documentacion</Label>
        </div>

        <div className="space-y-3 ml-1">
          <div className="flex items-center gap-3">
            <Switch
              checked={data.requiresPhotos}
              onCheckedChange={(checked) => update({ requiresPhotos: checked })}
            />
            <div>
              <Label className="cursor-pointer text-sm">Requiere registro fotografico</Label>
              <p className="text-xs text-muted-foreground">
                El operador debera adjuntar fotos al reportar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={data.requiresAttachments}
              onCheckedChange={(checked) => update({ requiresAttachments: checked })}
            />
            <div>
              <Label className="cursor-pointer text-sm">Requiere archivos adjuntos</Label>
              <p className="text-xs text-muted-foreground">
                Permite adjuntar documentos (PDF, planillas, etc.)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recurrence section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Recurrencia</Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Frecuencia</Label>
            <Select
              value={data.frequencyType}
              onValueChange={(v) => update({ frequencyType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.frequencyType === 'custom_days' && (
            <div className="space-y-2">
              <Label htmlFor="cfg-interval">Cada N dias</Label>
              <Input
                id="cfg-interval"
                type="number"
                value={data.frequencyIntervalDays}
                onChange={(e) => update({ frequencyIntervalDays: e.target.value })}
                placeholder="Ej: 3"
                min={1}
              />
            </div>
          )}
        </div>

        {showRepeat && (
          <div className="space-y-2">
            <Label htmlFor="cfg-repeat">Repeticiones (vacio = hasta fin de fase)</Label>
            <Input
              id="cfg-repeat"
              type="number"
              value={data.repeatCount}
              onChange={(e) => update({ repeatCount: e.target.value })}
              placeholder="Dejar vacio para repetir toda la fase"
              min={1}
              className="max-w-[300px]"
            />
          </div>
        )}

        {/* Time estimates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cfg-duration">Duracion estimada (min)</Label>
            <Input
              id="cfg-duration"
              type="number"
              value={data.estimatedDurationMinutes}
              onChange={(e) => update({ estimatedDurationMinutes: e.target.value })}
              placeholder="Ej: 30"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cfg-labor">Horas labor / 1000 plantas</Label>
            <Input
              id="cfg-labor"
              type="number"
              step="0.1"
              value={data.laborHoursPer1000Plants}
              onChange={(e) => update({ laborHoursPer1000Plants: e.target.value })}
              placeholder="Ej: 2.5"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Dependencies section — collapsible */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-foreground text-muted-foreground transition-colors">
          <Link2 className="h-4 w-4" />
          Dependencias y regulatorio
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Depende de template</Label>
            <Select
              value={data.dependsOnTemplateId || 'none'}
              onValueChange={(v) =>
                update({ dependsOnTemplateId: v === 'none' ? '' : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Ninguna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna dependencia</SelectItem>
                {allTemplates?.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.dependsOnTemplateId && (
            <div className="space-y-2">
              <Label htmlFor="cfg-minDays">Dias minimos despues de dependencia</Label>
              <Input
                id="cfg-minDays"
                type="number"
                value={data.minDaysAfterDependency}
                onChange={(e) => update({ minDaysAfterDependency: e.target.value })}
                placeholder="Ej: 7"
                min={0}
                className="max-w-[200px]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cfg-regulatory">Referencia regulatoria</Label>
            <Input
              id="cfg-regulatory"
              value={data.regulatoryReference}
              onChange={(e) => update({ regulatoryReference: e.target.value })}
              placeholder="Ej: SOP-CUL-014"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={data.requiresVerification}
              onCheckedChange={(checked) => update({ requiresVerification: checked })}
            />
            <div>
              <Label className="cursor-pointer text-sm flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                Requiere verificacion de supervisor
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
