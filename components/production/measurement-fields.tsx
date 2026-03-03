'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { ActivityExecutionInput } from '@/lib/validations/activity-execution';
import type { MeasurementFieldDef } from '@/lib/constants/measurement-schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Beaker } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReferenceParameter {
  metric: string;
  target?: number;
  min?: number;
  max?: number;
  unit: string;
}

interface MeasurementFieldsProps {
  schema: MeasurementFieldDef[];
  form: UseFormReturn<ActivityExecutionInput>;
  referenceParameters?: ReferenceParameter[] | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MeasurementFields({ schema, form, referenceParameters }: MeasurementFieldsProps) {
  if (!schema || schema.length === 0) return null;

  // Group fields by their group property
  const groups = new Map<string, MeasurementFieldDef[]>();
  for (const field of schema) {
    const group = field.group ?? 'General';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(field);
  }

  const measurementData = form.watch('measurementData') ?? {};

  function setFieldValue(key: string, value: string | number) {
    const current = form.getValues('measurementData') ?? {};
    form.setValue('measurementData', { ...current, [key]: value });
  }

  // Find matching reference parameter for a measurement field
  function findRefParam(key: string): ReferenceParameter | undefined {
    if (!referenceParameters) return undefined;
    return referenceParameters.find(p => p.metric === key);
  }

  return (
    <div className="space-y-3 pt-2 border-t">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        <Beaker className="h-3 w-3" /> Mediciones especificas
      </Label>

      {Array.from(groups.entries()).map(([groupName, groupFields]) => (
        <div key={groupName} className="space-y-2">
          {groups.size > 1 && (
            <p className="text-xs font-medium text-muted-foreground">{groupName}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {groupFields.map((field) => {
              const refParam = findRefParam(field.key);
              const currentVal = measurementData[field.key];

              if (field.type === 'select' && field.options) {
                return (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs">
                      {field.label}
                      {field.required && ' *'}
                    </Label>
                    <Select
                      value={typeof currentVal === 'string' ? currentVal : ''}
                      onValueChange={(val) => setFieldValue(field.key, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              return (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs">
                    {field.label}
                    {field.unit ? ` (${field.unit})` : ''}
                    {field.required && ' *'}
                  </Label>
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    step={field.step}
                    value={currentVal !== undefined ? String(currentVal) : ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (field.type === 'number') {
                        setFieldValue(field.key, raw === '' ? '' as unknown as number : parseFloat(raw));
                      } else {
                        setFieldValue(field.key, raw);
                      }
                    }}
                    placeholder="--"
                  />
                  {refParam && (
                    <RangeHintInline param={refParam} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function RangeHintInline({ param }: { param: ReferenceParameter }) {
  const parts: string[] = [];
  if (param.min !== undefined && param.max !== undefined) {
    parts.push(`Rango: ${param.min}–${param.max} ${param.unit}`);
  }
  if (param.target !== undefined) {
    parts.push(`ideal: ${param.target}`);
  }
  if (parts.length === 0) return null;
  return (
    <p className="text-[10px] text-muted-foreground mt-0.5">
      {parts.join(' (')}
      {parts.length > 1 ? ')' : ''}
    </p>
  );
}
