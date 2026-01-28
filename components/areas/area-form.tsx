'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAreaSchema, CreateAreaInput } from '@/lib/validations/area';
import {
  CONTAINER_TYPES,
  getDefaultPlantsPerContainer,
  calculateMaxCapacity,
} from '@/lib/constants/containers';
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
  Ruler,
  Package,
  Thermometer,
  Leaf,
} from 'lucide-react';

interface AreaFormProps {
  defaultValues?: Partial<CreateAreaInput>;
  cropTypes: Array<{ _id: string; name: string }>;
  onSubmit: (data: CreateAreaInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
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
}: AreaFormProps) {
  // Detectar si el área existente usa contenedores
  const hasContainerConfig = !!(
    defaultValues?.capacity_configurations &&
    typeof defaultValues.capacity_configurations === 'object' &&
    'container_type' in defaultValues.capacity_configurations
  );

  const [useContainerMode, setUseContainerMode] = useState(hasContainerConfig);

  const form = useForm<CreateAreaInput>({
    resolver: zodResolver(createAreaSchema),
    defaultValues: {
      name: '',
      area_type: 'propagation',
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

  const climateControlled = form.watch('climate_controlled');

  // Watch container fields for auto-calculation
  const capacityConfig = form.watch('capacity_configurations');
  const containerType =
    capacityConfig && typeof capacityConfig === 'object'
      ? (capacityConfig as Record<string, unknown>).container_type
      : undefined;
  const containerCount =
    capacityConfig && typeof capacityConfig === 'object'
      ? (capacityConfig as Record<string, unknown>).container_count
      : undefined;
  const plantsPerContainer =
    capacityConfig && typeof capacityConfig === 'object'
      ? (capacityConfig as Record<string, unknown>).plants_per_container
      : undefined;

  // Auto-update plants_per_container when container type changes
  useEffect(() => {
    if (useContainerMode && containerType && typeof containerType === 'string') {
      const currentConfig = form.getValues('capacity_configurations') || {};
      const currentPlants = (currentConfig as Record<string, unknown>)
        .plants_per_container;
      // Solo actualizar si no hay valor
      if (!currentPlants) {
        const defaultPlants = getDefaultPlantsPerContainer(containerType);
        form.setValue('capacity_configurations', {
          ...currentConfig,
          plants_per_container: defaultPlants,
        } as CreateAreaInput['capacity_configurations']);
      }
    }
  }, [containerType, useContainerMode, form]);

  // Auto-calculate max_capacity when container values change
  useEffect(() => {
    if (
      useContainerMode &&
      typeof containerCount === 'number' &&
      typeof plantsPerContainer === 'number' &&
      containerCount > 0 &&
      plantsPerContainer > 0
    ) {
      const maxCapacity = calculateMaxCapacity(containerCount, plantsPerContainer);
      const currentConfig = form.getValues('capacity_configurations') || {};
      form.setValue('capacity_configurations', {
        ...currentConfig,
        max_capacity: maxCapacity,
      } as CreateAreaInput['capacity_configurations']);
    }
  }, [containerCount, plantsPerContainer, useContainerMode, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Info className="h-5 w-5 text-green-700" />
              Información Básica
            </h3>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Área *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Sala de Vegetativo A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        <SelectValue placeholder="Selecciona un tipo" />
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

            <FormField
              control={form.control}
              name="compatible_crop_type_ids"
              render={() => (
                <FormItem>
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
                      className="flex gap-4"
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

            {/* Description - moved to left column */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
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

          {/* Right Column - Capacity & Environment */}
          <div className="space-y-4">
            {/* Dimensions Section */}
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Ruler className="h-5 w-5 text-green-700" />
              Dimensiones
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="length_meters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Largo (m)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Ej: 10"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const num = parseFloat(e.target.value);
                          field.onChange(e.target.value === '' ? undefined : (isNaN(num) ? undefined : Math.round(num * 100) / 100));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="width_meters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Ancho (m)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Ej: 10"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const num = parseFloat(e.target.value);
                          field.onChange(e.target.value === '' ? undefined : (isNaN(num) ? undefined : Math.round(num * 100) / 100));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height_meters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Alto (m)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Ej: 3"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const num = parseFloat(e.target.value);
                          field.onChange(e.target.value === '' ? undefined : (isNaN(num) ? undefined : Math.round(num * 100) / 100));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="total_area_m2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área Total (m²) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Ej: 100"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = parseFloat(val);
                          field.onChange(val === '' ? undefined : (isNaN(num) ? undefined : Math.round(num * 100) / 100));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usable_area_m2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área Útil (m²)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Ej: 80"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = parseFloat(val);
                          field.onChange(val === '' ? undefined : (isNaN(num) ? undefined : Math.round(num * 100) / 100));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Capacity Section - Unified Box */}
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-700" />
                  <div>
                    <h4 className="font-semibold">Capacidad</h4>
                    <p className="text-xs text-muted-foreground">
                      {useContainerMode
                        ? 'Calculada por contenedores'
                        : 'Ingreso manual de plantas'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="container-mode" className="text-sm">
                    Usar contenedores
                  </Label>
                  <Switch
                    id="container-mode"
                    checked={useContainerMode}
                    onCheckedChange={(checked) => {
                      setUseContainerMode(checked);
                      if (!checked) {
                        const currentConfig = form.getValues('capacity_configurations');
                        const maxCapacity =
                          currentConfig &&
                          typeof currentConfig === 'object' &&
                          'max_capacity' in currentConfig
                            ? (currentConfig as Record<string, unknown>).max_capacity
                            : undefined;
                        form.setValue('capacity_configurations', {
                          max_capacity: maxCapacity as number,
                        } as CreateAreaInput['capacity_configurations']);
                      }
                    }}
                  />
                </div>
              </div>

              {useContainerMode ? (
                <div className="space-y-3 pt-2 border-t">
                  <FormField
                    control={form.control}
                    name="capacity_configurations"
                    render={({ field }) => {
                      const config =
                        field.value && typeof field.value === 'object'
                          ? (field.value as Record<string, unknown>)
                          : {};
                      return (
                        <FormItem>
                          <FormLabel className="text-sm">Tipo de Contenedor *</FormLabel>
                          <Select
                            value={(config.container_type as string) || ''}
                            onValueChange={(value) => {
                              const defaultPlants = getDefaultPlantsPerContainer(value);
                              field.onChange({
                                ...config,
                                container_type: value,
                                plants_per_container: defaultPlants,
                              });
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONTAINER_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="capacity_configurations"
                      render={({ field }) => {
                        const config =
                          field.value && typeof field.value === 'object'
                            ? (field.value as Record<string, unknown>)
                            : {};
                        return (
                          <FormItem>
                            <FormLabel className="text-sm">Cantidad *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="10"
                                value={(config.container_count as number) || ''}
                                onChange={(e) => {
                                  const count = e.target.value
                                    ? Number(e.target.value)
                                    : undefined;
                                  field.onChange({
                                    ...config,
                                    container_count: count,
                                  });
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="capacity_configurations"
                      render={({ field }) => {
                        const config =
                          field.value && typeof field.value === 'object'
                            ? (field.value as Record<string, unknown>)
                            : {};
                        return (
                          <FormItem>
                            <FormLabel className="text-sm">Plantas/Contenedor *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="20"
                                value={(config.plants_per_container as number) || ''}
                                onChange={(e) => {
                                  const plants = e.target.value
                                    ? Number(e.target.value)
                                    : undefined;
                                  field.onChange({
                                    ...config,
                                    plants_per_container: plants,
                                  });
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {typeof containerCount === 'number' &&
                    typeof plantsPerContainer === 'number' &&
                    containerCount > 0 &&
                    plantsPerContainer > 0 && (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-200">
                        <Leaf className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Total: {calculateMaxCapacity(containerCount, plantsPerContainer).toLocaleString()} plantas
                        </span>
                        <span className="text-xs text-green-600">
                          ({containerCount} x {plantsPerContainer})
                        </span>
                      </div>
                    )}
                </div>
              ) : (
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
                        <FormLabel className="text-sm">Capacidad máxima (plantas) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ej: 500"
                            value={
                              typeof maxCapacityValue === 'number'
                                ? maxCapacityValue
                                : ''
                            }
                            onChange={(e) => {
                              const maxCapacity = Number(e.target.value);
                              field.onChange({ max_capacity: maxCapacity });
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}
            </div>

            {/* Climate Control Section */}
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
          </div>
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
            className="bg-green-900 hover:bg-green-800"
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
