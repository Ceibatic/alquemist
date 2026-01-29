'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  X,
  Trash2,
  Plus,
  GripVertical,
  AlertCircle,
  Settings,
} from 'lucide-react';
import type { FormField } from './dynamic-form-renderer';

// ============================================================================
// TYPES
// ============================================================================

interface FieldEditorProps {
  field: FormField | null;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  onClose: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Fecha' },
  { value: 'time', label: 'Hora' },
  { value: 'datetime', label: 'Fecha y Hora' },
  { value: 'select', label: 'Selección' },
  { value: 'multiselect', label: 'Selección Múltiple' },
  { value: 'radio', label: 'Radio Botones' },
  { value: 'checkbox', label: 'Casilla de Verificación' },
  { value: 'checkbox_group', label: 'Grupo de Casillas' },
  { value: 'textarea', label: 'Área de Texto' },
  { value: 'scale', label: 'Escala' },
  { value: 'photo', label: 'Foto' },
  { value: 'signature', label: 'Firma' },
  { value: 'measurement', label: 'Medición' },
  { value: 'location', label: 'Ubicación' },
  { value: 'qr_scan', label: 'Escanear QR' },
  { value: 'heading', label: 'Encabezado' },
  { value: 'paragraph', label: 'Párrafo' },
] as const;

const WIDTH_OPTIONS = [
  { value: 'full', label: 'Ancho Completo' },
  { value: 'half', label: 'Medio Ancho' },
  { value: 'third', label: 'Un Tercio' },
] as const;

const CONDITIONAL_OPERATORS = [
  { value: 'equals', label: 'Igual a' },
  { value: 'not_equals', label: 'Diferente de' },
  { value: 'contains', label: 'Contiene' },
  { value: 'greater_than', label: 'Mayor que' },
  { value: 'less_than', label: 'Menor que' },
] as const;

// Fields that support options
const OPTION_FIELDS = ['select', 'multiselect', 'radio', 'checkbox_group'];

// Fields that support min/max/step
const NUMERIC_FIELDS = ['number', 'measurement'];

// Fields that support validation
const VALIDATABLE_FIELDS = ['text', 'textarea', 'number', 'measurement'];

// Display-only fields
const DISPLAY_FIELDS = ['heading', 'paragraph'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FieldEditor({ field, onUpdate, onDelete, onClose }: FieldEditorProps) {
  const [localField, setLocalField] = useState<FormField | null>(field);

  if (!localField) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Editor de Campo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Selecciona un campo para editar sus propiedades
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateField = (updates: Partial<FormField>) => {
    const updated = { ...localField, ...updates };
    setLocalField(updated);
    onUpdate(updated);
  };

  const addOption = () => {
    const options = localField.options || [];
    const newOption = {
      value: `option_${options.length + 1}`,
      label: `Opción ${options.length + 1}`,
    };
    updateField({ options: [...options, newOption] });
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const options = [...(localField.options || [])];
    options[index] = { ...options[index], [field]: value };
    updateField({ options });
  };

  const deleteOption = (index: number) => {
    const options = localField.options?.filter((_, i) => i !== index);
    updateField({ options });
  };

  const isDisplayField = DISPLAY_FIELDS.includes(localField.type);
  const hasOptions = OPTION_FIELDS.includes(localField.type);
  const hasNumericProps = NUMERIC_FIELDS.includes(localField.type);
  const hasValidation = VALIDATABLE_FIELDS.includes(localField.type);
  const isScaleField = localField.type === 'scale';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Editor de Campo</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-6">
          {/* Basic Properties */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-type">Tipo de Campo</Label>
              <Select
                value={localField.type}
                onValueChange={(value) => updateField({ type: value as FormField['type'] })}
              >
                <SelectTrigger id="field-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-label">
                {isDisplayField ? 'Texto' : 'Etiqueta'}
              </Label>
              <Input
                id="field-label"
                value={localField.label}
                onChange={(e) => updateField({ label: e.target.value })}
                placeholder={isDisplayField ? 'Ingresa el texto...' : 'Nombre del campo'}
              />
            </div>

            {!isDisplayField && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="field-placeholder">Placeholder</Label>
                  <Input
                    id="field-placeholder"
                    value={localField.placeholder || ''}
                    onChange={(e) => updateField({ placeholder: e.target.value })}
                    placeholder="Texto de ayuda..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-help">Texto de Ayuda</Label>
                  <Textarea
                    id="field-help"
                    value={localField.helpText || ''}
                    onChange={(e) => updateField({ helpText: e.target.value })}
                    placeholder="Instrucciones adicionales..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="field-required">Campo Requerido</Label>
                  <Switch
                    id="field-required"
                    checked={localField.required || false}
                    onCheckedChange={(checked) => updateField({ required: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-width">Ancho</Label>
                  <Select
                    value={localField.width || 'full'}
                    onValueChange={(value) => updateField({ width: value as FormField['width'] })}
                  >
                    <SelectTrigger id="field-width">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WIDTH_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* Options Editor */}
          {hasOptions && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Opciones</Label>
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {localField.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        placeholder="Etiqueta"
                        className="flex-1"
                      />
                      <Input
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        placeholder="Valor"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteOption(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {(!localField.options || localField.options.length === 0) && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No hay opciones. Haz clic en Agregar para crear una.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Numeric Properties */}
          {hasNumericProps && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>Propiedades Numéricas</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-min">Mínimo</Label>
                    <Input
                      id="field-min"
                      type="number"
                      value={localField.min ?? ''}
                      onChange={(e) =>
                        updateField({ min: e.target.value ? Number(e.target.value) : undefined })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field-max">Máximo</Label>
                    <Input
                      id="field-max"
                      type="number"
                      value={localField.max ?? ''}
                      onChange={(e) =>
                        updateField({ max: e.target.value ? Number(e.target.value) : undefined })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-step">Paso</Label>
                    <Input
                      id="field-step"
                      type="number"
                      value={localField.step ?? ''}
                      onChange={(e) =>
                        updateField({ step: e.target.value ? Number(e.target.value) : undefined })
                      }
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field-unit">Unidad</Label>
                    <Input
                      id="field-unit"
                      value={localField.unit || ''}
                      onChange={(e) => updateField({ unit: e.target.value })}
                      placeholder="kg, cm, etc."
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Scale Properties */}
          {isScaleField && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>Propiedades de Escala</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scale-min">Valor Mínimo</Label>
                    <Input
                      id="scale-min"
                      type="number"
                      value={localField.scaleMin ?? 1}
                      onChange={(e) =>
                        updateField({ scaleMin: e.target.value ? Number(e.target.value) : 1 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scale-max">Valor Máximo</Label>
                    <Input
                      id="scale-max"
                      type="number"
                      value={localField.scaleMax ?? 5}
                      onChange={(e) =>
                        updateField({ scaleMax: e.target.value ? Number(e.target.value) : 5 })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scale-label-min">Etiqueta Mínima</Label>
                    <Input
                      id="scale-label-min"
                      value={localField.scaleLabels?.min || ''}
                      onChange={(e) =>
                        updateField({
                          scaleLabels: {
                            min: e.target.value,
                            max: localField.scaleLabels?.max || '',
                          },
                        })
                      }
                      placeholder="Bajo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scale-label-max">Etiqueta Máxima</Label>
                    <Input
                      id="scale-label-max"
                      value={localField.scaleLabels?.max || ''}
                      onChange={(e) =>
                        updateField({
                          scaleLabels: {
                            min: localField.scaleLabels?.min || '',
                            max: e.target.value,
                          },
                        })
                      }
                      placeholder="Alto"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Validation */}
          {hasValidation && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>Validación</Label>
                <div className="space-y-2">
                  <Label htmlFor="validation-pattern">Patrón (RegEx)</Label>
                  <Input
                    id="validation-pattern"
                    value={localField.validation?.pattern || ''}
                    onChange={(e) =>
                      updateField({
                        validation: {
                          ...localField.validation,
                          pattern: e.target.value,
                        },
                      })
                    }
                    placeholder="^[A-Z0-9]+$"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validation-message">Mensaje de Error</Label>
                  <Input
                    id="validation-message"
                    value={localField.validation?.message || ''}
                    onChange={(e) =>
                      updateField({
                        validation: {
                          ...localField.validation,
                          message: e.target.value,
                        },
                      })
                    }
                    placeholder="Formato inválido"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validation-min-length">Long. Mínima</Label>
                    <Input
                      id="validation-min-length"
                      type="number"
                      value={localField.validation?.minLength ?? ''}
                      onChange={(e) =>
                        updateField({
                          validation: {
                            ...localField.validation,
                            minLength: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validation-max-length">Long. Máxima</Label>
                    <Input
                      id="validation-max-length"
                      type="number"
                      value={localField.validation?.maxLength ?? ''}
                      onChange={(e) =>
                        updateField({
                          validation: {
                            ...localField.validation,
                            maxLength: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Conditional Display */}
          {!isDisplayField && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Mostrar Condicionalmente</Label>
                  <Switch
                    checked={!!localField.showIf}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateField({
                          showIf: {
                            field: '',
                            operator: 'equals',
                            value: '',
                          },
                        });
                      } else {
                        updateField({ showIf: undefined });
                      }
                    }}
                  />
                </div>

                {localField.showIf && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="condition-field">Campo</Label>
                      <Input
                        id="condition-field"
                        value={localField.showIf.field}
                        onChange={(e) =>
                          updateField({
                            showIf: {
                              ...localField.showIf!,
                              field: e.target.value,
                            },
                          })
                        }
                        placeholder="ID del campo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition-operator">Operador</Label>
                      <Select
                        value={localField.showIf.operator}
                        onValueChange={(value) =>
                          updateField({
                            showIf: {
                              ...localField.showIf!,
                              operator: value as any,
                            },
                          })
                        }
                      >
                        <SelectTrigger id="condition-operator">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITIONAL_OPERATORS.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition-value">Valor</Label>
                      <Input
                        id="condition-value"
                        value={localField.showIf.value}
                        onChange={(e) =>
                          updateField({
                            showIf: {
                              ...localField.showIf!,
                              value: e.target.value,
                            },
                          })
                        }
                        placeholder="Valor a comparar"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <Button variant="destructive" className="w-full" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar Campo
        </Button>
      </div>
    </Card>
  );
}
