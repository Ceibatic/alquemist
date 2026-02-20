'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomCultivarSchema } from '@/lib/validations/cultivar';
import type { CreateCustomCultivarInput } from '@/lib/validations/cultivar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CannabinoidRangeInput } from './cannabinoid-range-input';
import { getPhaseLabel, getPhaseColors } from '@/lib/constants/phases';
import { productCategoryLabels } from '@/lib/validations/product';
import { Loader2, Info, Leaf, FlaskConical, StickyNote, Package } from 'lucide-react';
import { useState, useCallback } from 'react';

interface CropType {
  _id: string;
  name: string;
  display_name_es: string;
  default_phases?: Array<{ name: string; duration_days: number }>;
}

interface Supplier {
  _id: string;
  name: string;
}

export interface PhaseProductConfig {
  phase: string;
  enabled: boolean;
  name: string;
  category: string;
  sku: string;
}

/** Plant-material related categories for phase products */
const PHASE_PRODUCT_CATEGORIES = [
  'seed',
  'clone',
  'seedling',
  'mother_plant',
  'plant_material',
  'plant_vegetative',
  'plant_flowering',
  'harvest_wet',
  'harvest_dry',
  'processed_plant',
] as const;

interface CultivarFormProps {
  cropTypes: CropType[];
  suppliers?: Supplier[];
  onSubmit: (data: CreateCustomCultivarInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<CreateCustomCultivarInput>;
  showPhaseProducts?: boolean;
  onSubmitWithProducts?: (data: CreateCustomCultivarInput, products: PhaseProductConfig[]) => Promise<void>;
}

export function CultivarForm({
  cropTypes,
  suppliers = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
  showPhaseProducts = false,
  onSubmitWithProducts,
}: CultivarFormProps) {
  const [selectedCropType, setSelectedCropType] = useState<string | undefined>(
    defaultValues?.crop_type_id
  );
  const [phaseProducts, setPhaseProducts] = useState<PhaseProductConfig[]>([]);

  const form = useForm<CreateCustomCultivarInput>({
    resolver: zodResolver(createCustomCultivarSchema),
    defaultValues: defaultValues || {
      name: '',
      crop_type_id: '',
      variety_type: '',
      genetic_lineage: '',
      supplier_id: '',
      flowering_time_days: undefined,
      thc_min: undefined,
      thc_max: undefined,
      cbd_min: undefined,
      cbd_max: undefined,
      notes: '',
    },
  });

  const cultivarName = form.watch('name');

  /** Generate a SKU from cultivar name + phase */
  const generateSku = useCallback((name: string, phase: string) => {
    const prefix = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 6)
      .toUpperCase();
    const phaseSuffix = phase.substring(0, 4).toUpperCase();
    return `${prefix}-${phaseSuffix}`;
  }, []);

  /** Initialize phase products when crop type changes */
  const initPhaseProducts = useCallback(
    (cropTypeId: string) => {
      const ct = cropTypes.find((c) => c._id === cropTypeId);
      if (!ct?.default_phases) {
        setPhaseProducts([]);
        return;
      }
      const currentName = form.getValues('name') || '';
      setPhaseProducts(
        ct.default_phases.map((phase) => ({
          phase: phase.name,
          enabled: false,
          name: `${currentName} - ${getPhaseLabel(phase.name)}`.trim().replace(/^- /, ''),
          category: 'plant_material',
          sku: generateSku(currentName || 'PROD', phase.name),
        }))
      );
    },
    [cropTypes, form, generateSku]
  );

  /** Update a single phase product config */
  const updatePhaseProduct = useCallback(
    (index: number, update: Partial<PhaseProductConfig>) => {
      setPhaseProducts((prev) =>
        prev.map((p, i) => (i === index ? { ...p, ...update } : p))
      );
    },
    []
  );

  const handleSubmit = async (data: CreateCustomCultivarInput) => {
    if (showPhaseProducts && onSubmitWithProducts) {
      const enabledProducts = phaseProducts.filter((p) => p.enabled);
      await onSubmitWithProducts(data, enabledProducts);
    } else {
      await onSubmit(data);
    }
  };

  // Check if selected crop is Cannabis
  const isCannabis =
    selectedCropType &&
    cropTypes.find((ct) => ct._id === selectedCropType)?.name === 'Cannabis';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Two-column layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <Info className="h-4 w-4 text-green-700" />
              <h3 className="font-semibold text-gray-900">Información Básica</h3>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre del Cultivar <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: Blue Dream, Geisha, Criollo"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crop_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo de Cultivo <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCropType(value);
                      if (showPhaseProducts) initPhaseProducts(value);
                    }}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de cultivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cropTypes.map((cropType) => (
                        <SelectItem key={cropType._id} value={cropType._id}>
                          {cropType.display_name_es}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Variety Type - Only show for Cannabis */}
            {isCannabis && (
              <FormField
                control={form.control}
                name="variety_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Variedad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de variedad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="indica">Indica</SelectItem>
                        <SelectItem value="sativa">Sativa</SelectItem>
                        <SelectItem value="hybrid">Híbrida</SelectItem>
                        <SelectItem value="ruderalis">Ruderalis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="genetic_lineage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linaje Genético</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: Blueberry x Haze"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Información sobre los parentales o origen genético
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {suppliers.length > 0 && (
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona proveedor (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Right Column - Characteristics & Notes */}
          <div className="space-y-6">
            {/* Growth Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Leaf className="h-4 w-4 text-green-700" />
                <h3 className="font-semibold text-gray-900">Información de Cultivo</h3>
              </div>

              <FormField
                control={form.control}
                name="flowering_time_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo de Floración (días)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === '' ? undefined : parseInt(val));
                        }}
                        placeholder="56"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Tiempo estimado desde inicio de floración hasta cosecha
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cannabis Characteristics - Only show for Cannabis */}
            {isCannabis && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FlaskConical className="h-4 w-4 text-green-700" />
                  <h3 className="font-semibold text-gray-900">Cannabinoides</h3>
                </div>

                <CannabinoidRangeInput
                  label="Rango de THC"
                  minValue={form.watch('thc_min')}
                  maxValue={form.watch('thc_max')}
                  onMinChange={(value) => form.setValue('thc_min', value)}
                  onMaxChange={(value) => form.setValue('thc_max', value)}
                  disabled={isSubmitting}
                />

                <CannabinoidRangeInput
                  label="Rango de CBD"
                  minValue={form.watch('cbd_min')}
                  maxValue={form.watch('cbd_max')}
                  onMinChange={(value) => form.setValue('cbd_min', value)}
                  onMaxChange={(value) => form.setValue('cbd_max', value)}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <StickyNote className="h-4 w-4 text-green-700" />
                <h3 className="font-semibold text-gray-900">Notas</h3>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Información adicional sobre el cultivar..."
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Phase Products Section (create mode only) */}
        {showPhaseProducts && phaseProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Package className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Productos por Fase</h3>
            </div>
            <p className="text-sm text-gray-500">
              Activa las fases para crear productos de catalogo automaticamente. Podras editarlos despues desde el detalle del cultivar.
            </p>
            <div className="space-y-3">
              {phaseProducts.map((pp, index) => {
                const colors = getPhaseColors(pp.phase);
                return (
                  <div
                    key={pp.phase}
                    className={`rounded-lg border p-3 transition-colors ${
                      pp.enabled ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={pp.enabled}
                        onCheckedChange={(checked) =>
                          updatePhaseProduct(index, {
                            enabled: checked,
                            // Refresh name/sku with current cultivar name
                            ...(checked
                              ? {
                                  name: `${cultivarName || ''} - ${getPhaseLabel(pp.phase)}`.trim().replace(/^- /, ''),
                                  sku: generateSku(cultivarName || 'PROD', pp.phase),
                                }
                              : {}),
                          })
                        }
                        disabled={isSubmitting}
                      />
                      <Badge
                        className={`${colors.bg} ${colors.text} ${colors.border} border text-xs`}
                      >
                        {getPhaseLabel(pp.phase)}
                      </Badge>
                      {pp.enabled && (
                        <div className="flex flex-1 gap-2 min-w-0">
                          <Input
                            value={pp.name}
                            onChange={(e) =>
                              updatePhaseProduct(index, { name: e.target.value })
                            }
                            placeholder="Nombre del producto"
                            className="text-sm h-8"
                            disabled={isSubmitting}
                          />
                          <Select
                            value={pp.category}
                            onValueChange={(val) =>
                              updatePhaseProduct(index, { category: val })
                            }
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="w-[180px] h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PHASE_PRODUCT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {productCategoryLabels[cat]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultValues ? 'Actualizar Cultivar' : 'Crear Cultivar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
