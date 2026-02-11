'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createStructureSchema,
  type CreateStructureInput,
} from '@/lib/validations/structure';
import {
  getStructureTypesForEnvironment,
  getStructureTypeDefaults,
} from '@/lib/constants/structures';
import {
  getContainerTypesForEnvironment,
  getDefaultPositionsPerContainer,
} from '@/lib/constants/containers';
import { CROP_PRESETS, type CropPreset } from '@/lib/constants/crop-presets';

interface StructureFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStructureInput) => void;
  onSubmitBatch?: (data: {
    prefix: string;
    startNumber: number;
    quantity: number;
    structure_type: string;
    environment_type: string;
    num_levels: number;
    containers_per_level: number;
    container_type: string;
    positions_per_container: number;
    footprint_m2?: number;
    notes?: string;
  }) => void;
  environmentType: string;
  isLoading?: boolean;
  initialData?: Partial<CreateStructureInput>;
  mode?: 'create' | 'edit';
  existingPrefixes?: Array<{ prefix: string; nextNumber: number }>;
}

export function StructureForm({
  open,
  onOpenChange,
  onSubmit,
  onSubmitBatch,
  environmentType,
  isLoading = false,
  initialData,
  mode = 'create',
  existingPrefixes = [],
}: StructureFormProps) {
  const [namingMode, setNamingMode] = useState<'custom' | 'sequence'>('custom');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [batchQuantity, setBatchQuantity] = useState(1);

  const envType = (
    environmentType === 'mixed' || environmentType === 'greenhouse'
      ? environmentType
      : environmentType || 'indoor'
  ) as 'indoor' | 'outdoor' | 'greenhouse';

  const structureTypes = getStructureTypesForEnvironment(envType);
  const containerTypes = getContainerTypesForEnvironment(envType);

  const form = useForm<CreateStructureInput>({
    resolver: zodResolver(createStructureSchema),
    defaultValues: {
      name: initialData?.name || '',
      structure_type: initialData?.structure_type || '',
      environment_type: envType,
      num_levels: initialData?.num_levels || 1,
      containers_per_level: initialData?.containers_per_level || 1,
      container_type: initialData?.container_type || '',
      positions_per_container: initialData?.positions_per_container || 1,
      footprint_m2: initialData?.footprint_m2,
      notes: initialData?.notes || '',
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || '',
        structure_type: initialData?.structure_type || '',
        environment_type: envType,
        num_levels: initialData?.num_levels || 1,
        containers_per_level: initialData?.containers_per_level || 1,
        container_type: initialData?.container_type || '',
        positions_per_container: initialData?.positions_per_container || 1,
        footprint_m2: initialData?.footprint_m2,
        notes: initialData?.notes || '',
      });
      setNamingMode('custom');
      setSelectedPrefix(existingPrefixes[0]?.prefix || '');
      setBatchQuantity(1);
    }
  }, [open, initialData, envType, form, existingPrefixes]);

  const watchedValues = form.watch([
    'num_levels',
    'containers_per_level',
    'positions_per_container',
    'footprint_m2',
  ]);

  const calculatedCapacity = useMemo(() => {
    const [levels, containers, positions, footprint] = watchedValues;
    const perStructure = (levels || 1) * (containers || 1) * (positions || 1);
    const qty = namingMode === 'sequence' ? batchQuantity : 1;
    const total = perStructure * qty;
    const growingArea = footprint ? footprint * (levels || 1) * qty : undefined;
    return { perStructure, total, growingArea };
  }, [watchedValues, namingMode, batchQuantity]);

  // Preview names for sequence mode
  const sequencePreview = useMemo(() => {
    if (namingMode !== 'sequence' || !selectedPrefix) return [];
    const prefixData = existingPrefixes.find((p) => p.prefix === selectedPrefix);
    const start = prefixData?.nextNumber || 1;
    const maxShow = 5;
    const names = Array.from(
      { length: Math.min(batchQuantity, maxShow) },
      (_, i) => `${selectedPrefix} ${start + i}`
    );
    return names;
  }, [namingMode, selectedPrefix, batchQuantity, existingPrefixes]);

  const applyPreset = (preset: CropPreset) => {
    form.setValue('structure_type', preset.structure_type);
    form.setValue('num_levels', preset.num_levels);
    form.setValue('containers_per_level', preset.containers_per_level);
    form.setValue('container_type', preset.container_type);
    form.setValue('positions_per_container', preset.positions_per_container);
    form.setValue('environment_type', preset.environment);
  };

  const handleStructureTypeChange = (value: string) => {
    form.setValue('structure_type', value);
    const defaults = getStructureTypeDefaults(value);
    form.setValue('num_levels', defaults.defaultLevels);
  };

  const handleContainerTypeChange = (value: string) => {
    form.setValue('container_type', value);
    const defaultPositions = getDefaultPositionsPerContainer(value);
    form.setValue('positions_per_container', defaultPositions);
  };

  const handleSubmit = (data: CreateStructureInput) => {
    if (namingMode === 'sequence' && onSubmitBatch) {
      const prefixData = existingPrefixes.find(
        (p) => p.prefix === selectedPrefix
      );
      onSubmitBatch({
        prefix: selectedPrefix,
        startNumber: prefixData?.nextNumber || 1,
        quantity: batchQuantity,
        structure_type: data.structure_type,
        environment_type: data.environment_type,
        num_levels: data.num_levels,
        containers_per_level: data.containers_per_level,
        container_type: data.container_type,
        positions_per_container: data.positions_per_container,
        footprint_m2: data.footprint_m2,
        notes: data.notes,
      });
    } else {
      onSubmit(data);
    }
  };

  const envTypeStr = environmentType as string;
  const relevantPresets = CROP_PRESETS.filter(
    (p) =>
      envTypeStr === 'mixed' ||
      envTypeStr === 'greenhouse' ||
      p.environment === envType
  );

  const showSequenceMode =
    mode === 'create' && existingPrefixes.length > 0 && !!onSubmitBatch;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Estructura' : 'Nueva Estructura'}
          </DialogTitle>
        </DialogHeader>

        {/* Presets (only in create mode) */}
        {mode === 'create' && relevantPresets.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Preset de cultivo (auto-fill)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {relevantPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 text-xs rounded-md border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Naming Mode Toggle (create mode with existing prefixes) */}
            {showSequenceMode && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Modo de nombre
                </p>
                <RadioGroup
                  value={namingMode}
                  onValueChange={(v) => setNamingMode(v as 'custom' | 'sequence')}
                  className="grid grid-cols-2 gap-2"
                >
                  <Label
                    htmlFor="naming-custom"
                    className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer text-sm ${
                      namingMode === 'custom'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <RadioGroupItem value="custom" id="naming-custom" />
                    Nombre personalizado
                  </Label>
                  <Label
                    htmlFor="naming-sequence"
                    className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer text-sm ${
                      namingMode === 'sequence'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <RadioGroupItem value="sequence" id="naming-sequence" />
                    Continuar secuencia
                  </Label>
                </RadioGroup>
              </div>
            )}

            {/* Name (custom mode) */}
            {namingMode === 'custom' && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Rack A-1, Hilera Norte 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Sequence mode: prefix select + quantity */}
            {namingMode === 'sequence' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Prefijo *</Label>
                    <Select
                      value={selectedPrefix}
                      onValueChange={setSelectedPrefix}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona prefijo" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingPrefixes.map((p) => (
                          <SelectItem key={p.prefix} value={p.prefix}>
                            {p.prefix} (siguiente: {p.nextNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cantidad *</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={batchQuantity}
                      onChange={(e) =>
                        setBatchQuantity(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                </div>
                {sequencePreview.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Se crearán: {sequencePreview.join(', ')}
                    {batchQuantity > 5 && `, ... ${selectedPrefix} ${(existingPrefixes.find((p) => p.prefix === selectedPrefix)?.nextNumber || 1) + batchQuantity - 1}`}
                  </p>
                )}
              </div>
            )}

            {/* Structure Type */}
            <FormField
              control={form.control}
              name="structure_type"
              render={({ field }) => {
                const selectedType = structureTypes.find(
                  (t) => t.value === field.value
                );
                return (
                  <FormItem>
                    <FormLabel>Tipo de Estructura *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleStructureTypeChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {structureTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedType && (
                      <FormDescription>
                        {selectedType.description}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Hierarchy Config: Levels, Containers, Positions */}
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="num_levels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveles *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="containers_per_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cont/Nivel *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10000}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="positions_per_container"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pos/Cont *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Container Type */}
            <FormField
              control={form.control}
              name="container_type"
              render={({ field }) => {
                const selectedType = containerTypes.find(
                  (t) => t.value === field.value
                );
                return (
                  <FormItem>
                    <FormLabel>Tipo de Contenedor *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleContainerTypeChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {containerTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedType && 'description' in selectedType && (
                      <FormDescription>
                        {(selectedType as { description: string }).description}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Footprint */}
            <FormField
              control={form.control}
              name="footprint_m2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Huella en piso (m²)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      placeholder="Opcional"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Espacio que ocupa cada estructura en el piso. Se multiplica por niveles para calcular el área de cultivo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity Summary */}
            <div className="rounded-lg border bg-green-50 border-green-200 p-3 space-y-1">
              <p className="text-xs font-medium text-green-800">
                Capacidad Total
              </p>
              <p className="text-2xl font-bold text-green-700">
                {calculatedCapacity.total.toLocaleString()} plantas
              </p>
              <p className="text-xs text-green-600 font-mono">
                {namingMode === 'sequence' && batchQuantity > 1
                  ? `${batchQuantity} estructuras × `
                  : ''}
                {form.watch('num_levels') || 1} niveles x{' '}
                {form.watch('containers_per_level') || 1} contenedores x{' '}
                {form.watch('positions_per_container') || 1} posiciones
              </p>
              {calculatedCapacity.growingArea && (
                <p className="text-xs text-green-600">
                  Area de cultivo: {calculatedCapacity.growingArea} m²
                </p>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas opcionales sobre la estructura"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Guardando...'
                  : mode === 'edit'
                    ? 'Guardar Cambios'
                    : namingMode === 'sequence' && batchQuantity > 1
                      ? `Crear ${batchQuantity} Estructuras`
                      : 'Crear Estructura'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
