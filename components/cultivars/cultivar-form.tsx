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
import { CannabinoidRangeInput } from './cannabinoid-range-input';
import { Loader2, Info, Leaf, FlaskConical, StickyNote } from 'lucide-react';
import { useState } from 'react';

interface CropType {
  _id: string;
  name: string;
  display_name_es: string;
}

interface Supplier {
  _id: string;
  name: string;
}

interface CultivarFormProps {
  cropTypes: CropType[];
  suppliers?: Supplier[];
  onSubmit: (data: CreateCustomCultivarInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<CreateCustomCultivarInput>;
}

export function CultivarForm({
  cropTypes,
  suppliers = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
}: CultivarFormProps) {
  const [selectedCropType, setSelectedCropType] = useState<string | undefined>(
    defaultValues?.crop_type_id
  );

  const form = useForm<CreateCustomCultivarInput>({
    resolver: zodResolver(createCustomCultivarSchema),
    defaultValues: defaultValues || {
      name: '',
      crop_type_id: '',
      variety_type: '',
      genetic_lineage: '',
      supplier_id: '',
      notes: '',
      characteristics: {},
    },
  });

  const handleSubmit = async (data: CreateCustomCultivarInput) => {
    await onSubmit(data);
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
                name="characteristics.flowering_time_days"
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

              <FormField
                control={form.control}
                name="characteristics.growth_difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dificultad de Cultivo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona dificultad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Medio</SelectItem>
                        <SelectItem value="difficult">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
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
                  minValue={form.watch('characteristics.thc_min')}
                  maxValue={form.watch('characteristics.thc_max')}
                  onMinChange={(value) =>
                    form.setValue('characteristics.thc_min', value)
                  }
                  onMaxChange={(value) =>
                    form.setValue('characteristics.thc_max', value)
                  }
                  disabled={isSubmitting}
                />

                <CannabinoidRangeInput
                  label="Rango de CBD"
                  minValue={form.watch('characteristics.cbd_min')}
                  maxValue={form.watch('characteristics.cbd_max')}
                  onMinChange={(value) =>
                    form.setValue('characteristics.cbd_min', value)
                  }
                  onMaxChange={(value) =>
                    form.setValue('characteristics.cbd_max', value)
                  }
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
