'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAreaSchema, CreateAreaInput } from '@/lib/validations/area';
import {
  getContainerTypesForEnvironment,
  getDefaultPositionsPerContainer,
} from '@/lib/constants/containers';
import {
  getStructureTypesForEnvironment,
  getStructureTypeDefaults,
} from '@/lib/constants/structures';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Info,
  Building2,
  Thermometer,
  Leaf,
  Sun,
  TreePine,
} from 'lucide-react';

interface AreaFormProps {
  defaultValues?: Partial<CreateAreaInput>;
  cropTypes: Array<{ _id: string; name: string }>;
  onSubmit: (data: CreateAreaInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

const areaTypes = [
  { value: 'propagation', label: 'Propagación' },
  { value: 'vegetative', label: 'Vegetativo' },
  { value: 'flowering', label: 'Floración' },
  { value: 'drying', label: 'Secado' },
  { value: 'curing', label: 'Curado' },
  { value: 'storage', label: 'Almacenamiento' },
  { value: 'processing', label: 'Procesamiento' },
  { value: 'quarantine', label: 'Cuarentena' },
];

export function AreaForm({
  defaultValues,
  cropTypes,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}: AreaFormProps) {
  const [useStructures, setUseStructures] = useState(
    mode === 'create' ? false : defaultValues?.capacity_mode === 'structures'
  );

  const form = useForm<CreateAreaInput>({
    resolver: zodResolver(createAreaSchema),
    defaultValues: {
      name: '',
      area_type: 'propagation',
      environment_type: 'indoor',
      status: 'active',
      compatible_crop_type_ids: [],
      total_area_m2: undefined as unknown as number,
      climate_controlled: false,
      lighting_controlled: false,
      irrigation_system: false,
      equipment_list: [],
      ...defaultValues,
    },
  });

  const environmentType = form.watch('environment_type');
  const climateControlled = form.watch('climate_controlled');

  // Structure fields (only used in create mode with structures enabled)
  const structureType = form.watch('structures.0.structure_type');
  const containerType = form.watch('structures.0.container_type');
  const prefix = form.watch('structures.0.prefix');
  const quantity = form.watch('structures.0.quantity');
  const numLevels = form.watch('structures.0.num_levels');
  const containersPerLevel = form.watch('structures.0.containers_per_level');
  const positionsPerContainer = form.watch('structures.0.positions_per_container');
  const footprint = form.watch('structures.0.footprint_m2');

  // Filtered options based on environment
  const structureTypes = useMemo(
    () => getStructureTypesForEnvironment(environmentType || 'indoor'),
    [environmentType]
  );
  const containerTypes = useMemo(
    () => getContainerTypesForEnvironment(environmentType || 'indoor'),
    [environmentType]
  );

  // Capacity calculation
  const calculatedCapacity = useMemo(() => {
    if (!useStructures) return null;
    const levels = numLevels || 1;
    const containers = containersPerLevel || 1;
    const positions = positionsPerContainer || 1;
    const qty = quantity || 1;
    const perStructure = levels * containers * positions;
    const total = perStructure * qty;
    const growingArea = footprint ? footprint * levels * qty : undefined;
    return { perStructure, total, growingArea };
  }, [useStructures, numLevels, containersPerLevel, positionsPerContainer, quantity, footprint]);

  // Preview names
  const previewNames = useMemo(() => {
    if (!prefix || !quantity) return [];
    const maxShow = 5;
    const names = Array.from(
      { length: Math.min(quantity, maxShow) },
      (_, i) => `${prefix} ${i + 1}`
    );
    return names;
  }, [prefix, quantity]);

  // Auto-fill structure defaults when type changes
  useEffect(() => {
    if (structureType && useStructures) {
      const defaults = getStructureTypeDefaults(structureType);
      form.setValue('structures.0.num_levels', defaults.defaultLevels);
    }
  }, [structureType, useStructures, form]);

  // Auto-fill container defaults when type changes
  useEffect(() => {
    if (containerType && useStructures) {
      const defaultPositions = getDefaultPositionsPerContainer(containerType);
      form.setValue('structures.0.positions_per_container', defaultPositions);
    }
  }, [containerType, useStructures, form]);

  // Reset structure fields when environment changes
  useEffect(() => {
    if (useStructures) {
      form.setValue('structures.0.structure_type', '');
      form.setValue('structures.0.container_type', '');
    }
  }, [environmentType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle structures mode
  const handleStructureToggle = (enabled: boolean) => {
    setUseStructures(enabled);
    if (enabled) {
      form.setValue('capacity_mode', 'structures');
      form.setValue('capacity_configurations', {
        max_capacity: 0,
        source: 'structures',
      });
      form.setValue('structures', [{
        prefix: '',
        quantity: 1,
        structure_type: '',
        environment_type: environmentType || 'indoor',
        num_levels: 1,
        containers_per_level: 1,
        container_type: '',
        positions_per_container: 1,
      }]);
    } else {
      form.setValue('capacity_mode', undefined);
      form.setValue('structures', undefined);
      form.setValue('capacity_configurations', undefined);
    }
  };

  // Keep structure environment_type in sync with area environment_type
  useEffect(() => {
    if (useStructures && environmentType) {
      form.setValue('structures.0.environment_type', environmentType as 'indoor' | 'outdoor');
    }
  }, [environmentType, useStructures, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* ============================================================ */}
        {/* SECTION 1: Basic Info */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-green-700" />
            Información Básica
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Nombre del Área *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Sala de Vegetativo A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Area Type */}
            <FormField
              control={form.control}
              name="area_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Área *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areaTypes.map((type) => (
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Environment Type */}
            <FormField
              control={form.control}
              name="environment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-3"
                    >
                      <Label
                        htmlFor="env-indoor"
                        className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                          field.value === 'indoor'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <RadioGroupItem value="indoor" id="env-indoor" className="sr-only" />
                        <Sun className="h-4 w-4 text-amber-600" />
                        <span className="font-medium text-sm">Indoor</span>
                      </Label>
                      <Label
                        htmlFor="env-outdoor"
                        className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                          field.value === 'outdoor'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <RadioGroupItem value="outdoor" id="env-outdoor" className="sr-only" />
                        <TreePine className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">Outdoor</span>
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Area */}
            <FormField
              control={form.control}
              name="total_area_m2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área (m²) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Ej: 100"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = parseFloat(val);
                        field.onChange(
                          val === '' ? undefined : isNaN(num) ? undefined : Math.round(num * 100) / 100
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Crop Types + Status */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="compatible_crop_type_ids"
              render={() => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Cultivos Compatibles *</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {cropTypes.map((crop) => (
                      <FormField
                        key={crop._id}
                        control={form.control}
                        name="compatible_crop_type_ids"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(crop._id)}
                                onCheckedChange={(checked) => {
                                  const value = field.value || [];
                                  if (checked) {
                                    field.onChange([...value, crop._id]);
                                  } else {
                                    field.onChange(
                                      value.filter((id) => id !== crop._id)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <Label className="font-normal cursor-pointer text-sm">
                              {crop.name}
                            </Label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col gap-2"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="active" />
                        </FormControl>
                        <Label className="font-normal">Activa</Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="maintenance" />
                        </FormControl>
                        <Label className="font-normal">Mantenimiento</Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="inactive" />
                        </FormControl>
                        <Label className="font-normal">Inactiva</Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: Structures (create mode only) */}
        {/* ============================================================ */}
        {mode === 'create' && (
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-700" />
                <div>
                  <h4 className="font-semibold">Estructuras</h4>
                  <p className="text-xs text-muted-foreground">
                    {useStructures
                      ? 'Capacidad calculada por estructuras'
                      : 'Opcional — puedes agregarlas después'}
                  </p>
                </div>
              </div>
              <Switch
                checked={useStructures}
                onCheckedChange={handleStructureToggle}
              />
            </div>

            {/* Manual capacity (when structures disabled) */}
            {!useStructures && (
              <FormField
                control={form.control}
                name="capacity_configurations"
                render={({ field }) => {
                  const config =
                    field.value && typeof field.value === 'object'
                      ? (field.value as Record<string, unknown>)
                      : {};
                  const maxCapacityValue = config.max_capacity;
                  return (
                    <FormItem className="pt-2 border-t">
                      <FormLabel className="text-sm">Capacidad máxima (plantas)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 500 (opcional, puedes definirlo después)"
                          value={
                            typeof maxCapacityValue === 'number' && maxCapacityValue > 0
                              ? maxCapacityValue
                              : ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              field.onChange(undefined);
                            } else {
                              field.onChange({ max_capacity: Number(val) });
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            {/* Structure configuration (when structures enabled) */}
            {useStructures && (
              <div className="space-y-4 pt-2 border-t">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Structure Type */}
                  <FormField
                    control={form.control}
                    name="structures.0.structure_type"
                    render={({ field }) => {
                      const selectedType = structureTypes.find(t => t.value === field.value);
                      return (
                        <FormItem>
                          <FormLabel>Tipo de Estructura *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
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
                            <FormDescription>{selectedType.description}</FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Container Type */}
                  <FormField
                    control={form.control}
                    name="structures.0.container_type"
                    render={({ field }) => {
                      const selectedType = containerTypes.find(t => t.value === field.value);
                      return (
                        <FormItem>
                          <FormLabel>Tipo de Contenedor *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
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
                          {selectedType && (
                            <FormDescription>{selectedType.description}</FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* Hierarchy: Levels, Containers/Level, Positions/Container */}
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="structures.0.num_levels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveles *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={field.value ?? 1}
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
                    name="structures.0.containers_per_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cont/Nivel *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10000}
                            value={field.value ?? 1}
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
                    name="structures.0.positions_per_container"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pos/Cont *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={1000}
                            value={field.value ?? 1}
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

                {/* Footprint */}
                <FormField
                  control={form.control}
                  name="structures.0.footprint_m2"
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

                {/* Prefix + Quantity */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="structures.0.prefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefijo *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Rack A"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Cada estructura se nombrará: {field.value || 'Prefijo'} 1, {field.value || 'Prefijo'} 2...
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="structures.0.quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            value={field.value ?? 1}
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

                {/* Preview + Capacity Summary */}
                {prefix && quantity && quantity > 0 && (
                  <div className="rounded-lg border bg-green-50 border-green-200 p-3 space-y-2">
                    {/* Name preview */}
                    <div>
                      <p className="text-xs font-medium text-green-800">Se crearán:</p>
                      <p className="text-sm text-green-700">
                        {previewNames.join(', ')}
                        {quantity > 5 && `, ... ${prefix} ${quantity}`}
                      </p>
                    </div>

                    {/* Capacity */}
                    {calculatedCapacity && (
                      <div className="flex items-center gap-2 pt-1 border-t border-green-200">
                        <Leaf className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-lg font-bold text-green-700">
                            {calculatedCapacity.total.toLocaleString()} plantas
                          </p>
                          <p className="text-xs text-green-600 font-mono">
                            {quantity} estructuras × {calculatedCapacity.perStructure.toLocaleString()} plantas c/u
                            {' '}({numLevels || 1} × {containersPerLevel || 1} × {positionsPerContainer || 1})
                          </p>
                          {calculatedCapacity.growingArea && (
                            <p className="text-xs text-green-600">
                              Área de cultivo: {calculatedCapacity.growingArea.toLocaleString()} m²
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 3: Additional Settings */}
        {/* ============================================================ */}
        <div className="space-y-4">
          {/* Climate Control */}
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-green-700" />
                <div>
                  <h4 className="font-semibold">Control Climático</h4>
                  <p className="text-xs text-muted-foreground">
                    Parámetros ambientales del área
                  </p>
                </div>
              </div>
              <FormField
                control={form.control}
                name="climate_controlled"
                render={({ field }) => (
                  <FormItem className="flex items-center space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {climateControlled && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <FormField
                  control={form.control}
                  name="environmental_specs.temperature_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Temp. Mín (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="18"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environmental_specs.temperature_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Temp. Máx (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="28"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environmental_specs.humidity_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Humedad Mín (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="40"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environmental_specs.humidity_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Humedad Máx (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="70"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environmental_specs.light_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Luz (hrs/día)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="18"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environmental_specs.ph_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">pH Mínimo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="5.5"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environmental_specs.ph_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">pH Máximo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="6.5"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Technical Features + Notes */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-semibold text-sm">Características Técnicas</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="lighting-toggle" className="text-sm">
                Control de Iluminación
              </Label>
              <FormField
                control={form.control}
                name="lighting_controlled"
                render={({ field }) => (
                  <FormItem className="flex items-center space-y-0">
                    <FormControl>
                      <Switch
                        id="lighting-toggle"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="irrigation-toggle" className="text-sm">
                Sistema de Riego
              </Label>
              <FormField
                control={form.control}
                name="irrigation_system"
                render={({ field }) => (
                  <FormItem className="flex items-center space-y-0">
                    <FormControl>
                      <Switch
                        id="irrigation-toggle"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
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
                    placeholder="Detalles adicionales sobre el área..."
                    className="min-h-[80px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Área'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
