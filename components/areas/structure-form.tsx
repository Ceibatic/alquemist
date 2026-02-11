'use client';

import { useEffect, useMemo } from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  environmentType: string;
  isLoading?: boolean;
  initialData?: Partial<CreateStructureInput>;
  mode?: 'create' | 'edit';
}

export function StructureForm({
  open,
  onOpenChange,
  onSubmit,
  environmentType,
  isLoading = false,
  initialData,
  mode = 'create',
}: StructureFormProps) {
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
    }
  }, [open, initialData, envType, form]);

  const watchedValues = form.watch([
    'num_levels',
    'containers_per_level',
    'positions_per_container',
    'footprint_m2',
  ]);

  const calculatedCapacity = useMemo(() => {
    const [levels, containers, positions, footprint] = watchedValues;
    const total = (levels || 1) * (containers || 1) * (positions || 1);
    const growingArea = footprint ? footprint * (levels || 1) : undefined;
    return { total, growingArea };
  }, [watchedValues]);

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
    onSubmit(data);
  };

  const envTypeStr = environmentType as string;
  const relevantPresets = CROP_PRESETS.filter(
    (p) =>
      envTypeStr === 'mixed' ||
      envTypeStr === 'greenhouse' ||
      p.environment === envType
  );

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
            {/* Name */}
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

            {/* Structure Type */}
            <FormField
              control={form.control}
              name="structure_type"
              render={({ field }) => (
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
                  <FormMessage />
                </FormItem>
              )}
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
              render={({ field }) => (
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footprint */}
            <FormField
              control={form.control}
              name="footprint_m2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Huella en piso (m2)</FormLabel>
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
                {form.watch('num_levels') || 1} niveles x{' '}
                {form.watch('containers_per_level') || 1} contenedores x{' '}
                {form.watch('positions_per_container') || 1} posiciones
              </p>
              {calculatedCapacity.growingArea && (
                <p className="text-xs text-green-600">
                  Area de cultivo: {calculatedCapacity.growingArea} m2
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
                    : 'Crear Estructura'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
