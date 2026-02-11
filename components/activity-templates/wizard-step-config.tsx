'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardCheck,
  Camera,
  Paperclip,
  Repeat,
  ChevronDown,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import type { WizardFormData } from './activity-template-wizard';

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Una vez' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Bisemanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'on_demand', label: 'A demanda' },
  { value: 'custom_days', label: 'Custom (cada N dias)' },
];

interface WizardStepConfigProps {
  formData: WizardFormData;
  updateField: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
  companyId: Id<'companies'>;
  templateId?: Id<'activity_templates'>;
  allTemplates?: any[];
}

export function WizardStepConfig({
  formData,
  updateField,
  companyId,
  templateId,
  allTemplates,
}: WizardStepConfigProps) {
  // Fetch QC templates for the quality check selector
  const qcTemplates = useQuery(
    api.qualityCheckTemplates.list,
    { companyId, status: 'active' as const }
  );

  const selectedQcTemplate = qcTemplates?.find(
    (t) => t._id === formData.qualityCheckTemplateId
  );

  return (
    <div className="space-y-6">
      {/* Quality Check */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Calidad
          </CardTitle>
          <CardDescription>
            Vincula un formulario de control de calidad que se completara al reportar esta actividad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={!!formData.qualityCheckTemplateId}
              onCheckedChange={(checked) => {
                if (!checked) updateField('qualityCheckTemplateId', '');
              }}
            />
            <Label className="cursor-pointer">Requiere formulario de calidad</Label>
          </div>

          {formData.qualityCheckTemplateId !== '' || formData.qualityCheckTemplateId === '' ? (
            <div className="space-y-3">
              <Select
                value={formData.qualityCheckTemplateId || 'none'}
                onValueChange={(v) =>
                  updateField('qualityCheckTemplateId', v === 'none' ? '' : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar template de calidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin formulario de calidad</SelectItem>
                  {qcTemplates?.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedQcTemplate && (
                <div className="rounded-lg bg-blue-50 p-3 text-sm">
                  <p className="font-medium text-blue-900">{selectedQcTemplate.name}</p>
                  <div className="flex gap-2 mt-1">
                    {selectedQcTemplate.procedure_type && (
                      <Badge variant="outline" className="text-xs">
                        {selectedQcTemplate.procedure_type}
                      </Badge>
                    )}
                    {selectedQcTemplate.ai_assisted && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                        AI
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentacion</CardTitle>
          <CardDescription>
            Define los requisitos de documentacion para esta actividad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={formData.requiresPhotos}
              onCheckedChange={(v) => updateField('requiresPhotos', v)}
            />
            <Label className="cursor-pointer">Requiere registro fotografico</Label>
          </div>
          <div className="flex items-center gap-3">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={formData.requiresAttachments}
              onCheckedChange={(v) => updateField('requiresAttachments', v)}
            />
            <Label className="cursor-pointer">Requiere archivos adjuntos</Label>
          </div>
        </CardContent>
      </Card>

      {/* Recurrence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Recurrencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select
                value={formData.frequencyType}
                onValueChange={(v) => updateField('frequencyType', v)}
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

            {formData.frequencyType === 'custom_days' && (
              <div className="space-y-2">
                <Label>Cada N dias</Label>
                <Input
                  type="number"
                  value={formData.frequencyIntervalDays}
                  onChange={(e) => updateField('frequencyIntervalDays', e.target.value)}
                  placeholder="Ej: 3"
                  min={1}
                />
              </div>
            )}
          </div>

          {formData.frequencyType !== 'once' && formData.frequencyType !== 'on_demand' && (
            <div className="space-y-2">
              <Label>Repeticiones (vacio = hasta fin de fase)</Label>
              <Input
                type="number"
                value={formData.repeatCount}
                onChange={(e) => updateField('repeatCount', e.target.value)}
                placeholder="Dejar vacio para repetir toda la fase"
                min={1}
                className="w-full sm:w-[300px]"
              />
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duracion estimada (min)</Label>
              <Input
                type="number"
                value={formData.estimatedDurationMinutes}
                onChange={(e) => updateField('estimatedDurationMinutes', e.target.value)}
                placeholder="Ej: 30"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Horas labor / 1000 plantas</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.laborHoursPer1000Plants}
                onChange={(e) => updateField('laborHoursPer1000Plants', e.target.value)}
                placeholder="Ej: 2.5"
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dependencies (collapsible) */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Dependencias y regulacion
                </CardTitle>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Depende de template</Label>
                <Select
                  value={formData.dependsOnTemplateId || 'none'}
                  onValueChange={(v) =>
                    updateField('dependsOnTemplateId', v === 'none' ? '' : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna dependencia</SelectItem>
                    {allTemplates
                      ?.filter((t) => t._id !== templateId)
                      .map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.dependsOnTemplateId && (
                <div className="space-y-2">
                  <Label>Dias min. despues de dependencia</Label>
                  <Input
                    type="number"
                    value={formData.minDaysAfterDependency}
                    onChange={(e) => updateField('minDaysAfterDependency', e.target.value)}
                    placeholder="Ej: 7"
                    min={0}
                    className="w-full sm:w-[200px]"
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Referencia regulatoria</Label>
                <Input
                  value={formData.regulatoryReference}
                  onChange={(e) => updateField('regulatoryReference', e.target.value)}
                  placeholder="Ej: SOP-CUL-014"
                />
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={formData.requiresVerification}
                  onCheckedChange={(v) => updateField('requiresVerification', v)}
                />
                <Label className="cursor-pointer">Requiere verificacion de supervisor</Label>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
