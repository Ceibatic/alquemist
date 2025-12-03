'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInventoryItemSchema, CreateInventoryItemInput } from '@/lib/validations/inventory';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import {
  Loader2,
  Package,
  MapPin,
  Hash,
  Calendar,
  DollarSign,
  Star,
  BarChart3,
  StickyNote,
} from 'lucide-react';

interface InventoryFormProps {
  facilityId: string;
  initialData?: Partial<CreateInventoryItemInput>;
  onSubmit: (data: CreateInventoryItemInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

// Category to unit mapping
const CATEGORY_UNITS: Record<string, string[]> = {
  seed: ['unidades', 'gramos', 'kg'],
  nutrient: ['L', 'mL', 'kg', 'g'],
  pesticide: ['L', 'mL', 'kg', 'g'],
  equipment: ['unidades'],
  substrate: ['kg', 'g', 'm³', 'L'],
  container: ['unidades'],
  tool: ['unidades'],
  other: ['unidades', 'kg', 'g', 'L', 'mL'],
};

const PRODUCT_CATEGORIES = [
  { value: 'seed', label: 'Semillas' },
  { value: 'nutrient', label: 'Nutrientes' },
  { value: 'pesticide', label: 'Pesticidas' },
  { value: 'equipment', label: 'Equipos' },
  { value: 'substrate', label: 'Sustratos' },
  { value: 'container', label: 'Contenedores' },
  { value: 'tool', label: 'Herramientas' },
  { value: 'other', label: 'Otros' },
];

const QUALITY_GRADES = [
  { value: 'A', label: 'Grado A - Premium' },
  { value: 'B', label: 'Grado B - Estándar' },
  { value: 'C', label: 'Grado C - Básico' },
];

const SOURCE_TYPES = [
  { value: 'purchase', label: 'Compra' },
  { value: 'production', label: 'Producción' },
  { value: 'transfer', label: 'Transferencia' },
];

export function InventoryForm({
  facilityId,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
  isSubmitting = false,
}: InventoryFormProps) {
  const form = useForm<CreateInventoryItemInput>({
    resolver: zodResolver(createInventoryItemSchema),
    defaultValues: {
      product_id: initialData?.product_id || '',
      area_id: initialData?.area_id || '',
      supplier_id: initialData?.supplier_id || '',
      quantity_available: initialData?.quantity_available || 0,
      quantity_unit: initialData?.quantity_unit || '',
      batch_number: initialData?.batch_number || '',
      supplier_lot_number: initialData?.supplier_lot_number || '',
      serial_numbers: initialData?.serial_numbers || [],
      received_date: initialData?.received_date,
      manufacturing_date: initialData?.manufacturing_date,
      expiration_date: initialData?.expiration_date,
      purchase_price: initialData?.purchase_price,
      cost_per_unit: initialData?.cost_per_unit,
      quality_grade: initialData?.quality_grade,
      quality_notes: initialData?.quality_notes || '',
      source_type: initialData?.source_type,
      minimum_stock_level: initialData?.minimum_stock_level,
      maximum_stock_level: initialData?.maximum_stock_level,
      reorder_point: initialData?.reorder_point,
      lead_time_days: initialData?.lead_time_days,
      notes: initialData?.notes || '',
    },
  });

  // Fetch areas for this facility
  const areas = useQuery(
    api.areas.getByFacility,
    facilityId ? { facilityId: facilityId as any } : 'skip'
  );

  // Note: Supplier selection is simplified - in a full implementation,
  // we would pass companyId as a prop to fetch suppliers
  const suppliers: Array<{ _id: string; name: string }> = [];

  // Watch category to update available units
  const selectedCategory = form.watch('product_id'); // In real app, would get category from product

  const handleSubmit = async (data: CreateInventoryItemInput) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Section: Producto y Ubicación */}
        <div className="flex items-center gap-2 pb-2 border-b">
          <Package className="h-4 w-4 text-green-700" />
          <h3 className="font-semibold text-gray-900">Producto y Ubicación</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Product ID - In real app, this would be a product selector */}
          <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto *</FormLabel>
                <FormControl>
                  <Input placeholder="ID del producto" {...field} />
                </FormControl>
                <FormDescription>
                  Selecciona el producto del catálogo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Area */}
          <FormField
            control={form.control}
            name="area_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área de Almacenamiento *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un área" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {areas?.map((area) => (
                      <SelectItem key={area._id} value={area._id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supplier */}
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proveedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Sin proveedor</SelectItem>
                    {suppliers?.map((supplier) => (
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

          {/* Quantity Available */}
          <FormField
            control={form.control}
            name="quantity_available"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad Disponible *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity Unit */}
          <FormField
            control={form.control}
            name="quantity_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['unidades', 'kg', 'g', 'L', 'mL', 'm²', 'm³'].map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Batch Number */}
          <FormField
            control={form.control}
            name="batch_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Lote</FormLabel>
                <FormControl>
                  <Input placeholder="LOT-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supplier Lot Number */}
          <FormField
            control={form.control}
            name="supplier_lot_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lote del Proveedor</FormLabel>
                <FormControl>
                  <Input placeholder="SUP-LOT-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Received Date */}
          <FormField
            control={form.control}
            name="received_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Recepción</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value).getTime() : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Manufacturing Date */}
          <FormField
            control={form.control}
            name="manufacturing_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Fabricación</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value).getTime() : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiration Date */}
          <FormField
            control={form.control}
            name="expiration_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Vencimiento</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value).getTime() : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Purchase Price */}
          <FormField
            control={form.control}
            name="purchase_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Compra</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormDescription>Precio en COP</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cost Per Unit */}
          <FormField
            control={form.control}
            name="cost_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo por Unidad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value || ''}
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

          {/* Quality Grade */}
          <FormField
            control={form.control}
            name="quality_grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado de Calidad</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona grado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Sin especificar</SelectItem>
                    {QUALITY_GRADES.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Source Type */}
          <FormField
            control={form.control}
            name="source_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Origen</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona origen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Sin especificar</SelectItem>
                    {SOURCE_TYPES.map((type) => (
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

          {/* Minimum Stock Level */}
          <FormField
            control={form.control}
            name="minimum_stock_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel Mínimo de Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Cantidad mínima antes de alertar
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Maximum Stock Level */}
          <FormField
            control={form.control}
            name="maximum_stock_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel Máximo de Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
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

          {/* Reorder Point */}
          <FormField
            control={form.control}
            name="reorder_point"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Punto de Reorden</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Cantidad que activa reorden automático
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Lead Time Days */}
          <FormField
            control={form.control}
            name="lead_time_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiempo de Entrega (días)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Quality Notes */}
        <FormField
          control={form.control}
          name="quality_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas de Calidad</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas sobre la calidad del producto..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas adicionales sobre este item..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
