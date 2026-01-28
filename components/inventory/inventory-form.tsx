'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createInventoryItemSchema,
  CreateInventoryItemInput,
} from '@/lib/validations/inventory';
import { useQuery, useMutation } from 'convex/react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  BarChart3,
  Info,
  Building2,
  ShoppingCart,
} from 'lucide-react';
import { ProductCombobox } from './product-combobox';
import { ProductForm } from '@/components/products/product-form';
import { useFacility } from '@/components/providers/facility-provider';
import { toast } from 'sonner';
import type { ProductFormInput } from '@/lib/validations/product';

interface InventoryFormProps {
  facilityId: string;
  initialData?: Partial<CreateInventoryItemInput>;
  onSubmit: (data: CreateInventoryItemInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

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

const QUANTITY_UNITS = ['unidades', 'kg', 'g', 'L', 'mL', 'm²', 'm³'];

export function InventoryForm({
  facilityId,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
  isSubmitting = false,
}: InventoryFormProps) {
  const { currentCompanyId } = useFacility();
  const [selectedProductInfo, setSelectedProductInfo] = useState<{
    name: string;
    sku: string;
    category: string;
    default_price?: number;
    price_currency?: string;
  } | null>(null);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

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

  // Fetch suppliers for this company
  const suppliers = useQuery(
    api.suppliers.list,
    currentCompanyId ? { companyId: currentCompanyId as any, isActive: true } : 'skip'
  );

  // Create product mutation
  const createProduct = useMutation(api.products.create);

  // Watch purchase price to show comparison
  const purchasePrice = form.watch('purchase_price');
  const quantityAvailable = form.watch('quantity_available');

  // Calculate cost per unit when purchase price or quantity changes
  useEffect(() => {
    if (purchasePrice && quantityAvailable && quantityAvailable > 0) {
      const calculatedCost = purchasePrice / quantityAvailable;
      form.setValue('cost_per_unit', Math.round(calculatedCost * 100) / 100);
    }
  }, [purchasePrice, quantityAvailable, form]);

  // Format price for display
  const formatPrice = (price?: number, currency?: string) => {
    if (price === undefined) return null;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Handle product selection
  const handleProductSelect = (product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    default_price?: number;
    price_currency?: string;
  }) => {
    setSelectedProductInfo({
      name: product.name,
      sku: product.sku,
      category: product.category,
      default_price: product.default_price,
      price_currency: product.price_currency,
    });
  };

  // Handle create new product
  const handleCreateProduct = async (data: ProductFormInput) => {
    setIsCreatingProduct(true);
    try {
      const productId = await createProduct({
        companyId: currentCompanyId!,
        sku: data.sku,
        name: data.name,
        description: data.description || undefined,
        category: data.category,
        subcategory: data.subcategory || undefined,
        preferred_supplier_id: (data.preferred_supplier_id as any) || undefined,
        manufacturer: data.manufacturer || undefined,
        default_price: typeof data.default_price === 'number' ? data.default_price : undefined,
        price_currency: (data.price_currency as 'COP' | 'USD' | 'EUR' | undefined) || undefined,
        price_unit: data.price_unit || undefined,
        weight_value: typeof data.weight_value === 'number' ? data.weight_value : undefined,
        weight_unit: data.weight_unit || undefined,
        regulatory_registered: data.regulatory_registered,
        regulatory_registration_number:
          data.regulatory_registration_number || undefined,
        organic_certified: data.organic_certified,
        organic_cert_number: data.organic_cert_number || undefined,
      });

      // Set the new product as selected
      form.setValue('product_id', productId);
      setSelectedProductInfo({
        name: data.name,
        sku: data.sku,
        category: data.category,
        default_price: typeof data.default_price === 'number' ? data.default_price : undefined,
        price_currency: data.price_currency,
      });

      toast.success(`Producto "${data.name}" creado exitosamente`);
      setShowCreateProductModal(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleSubmit = async (data: CreateInventoryItemInput) => {
    await onSubmit(data);
  };

  // Price comparison info
  const showPriceComparison =
    selectedProductInfo?.default_price !== undefined &&
    purchasePrice !== undefined &&
    purchasePrice > 0;

  const priceDifference = showPriceComparison
    ? purchasePrice! - (selectedProductInfo?.default_price || 0)
    : 0;

  const pricePercentChange =
    showPriceComparison && selectedProductInfo?.default_price
      ? ((priceDifference / selectedProductInfo.default_price) * 100).toFixed(1)
      : '0';

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Section: Producto */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <ShoppingCart className="h-4 w-4 text-green-700" />
            <h3 className="font-semibold text-gray-900">Producto</h3>
          </div>

          <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto *</FormLabel>
                <FormControl>
                  <ProductCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    onProductSelect={handleProductSelect}
                    onCreateNew={() => setShowCreateProductModal(true)}
                    placeholder="Buscar o crear producto..."
                  />
                </FormControl>
                <FormDescription>
                  Selecciona un producto del catálogo o crea uno nuevo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selected Product Info */}
          {selectedProductInfo && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{selectedProductInfo.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {selectedProductInfo.sku}
                    </Badge>
                  </div>
                  {selectedProductInfo.default_price !== undefined && (
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Precio base: </span>
                      <span className="font-medium text-green-600">
                        {formatPrice(
                          selectedProductInfo.default_price,
                          selectedProductInfo.price_currency
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Section: Ubicación y Proveedor */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <MapPin className="h-4 w-4 text-green-700" />
            <h3 className="font-semibold text-gray-900">Ubicación y Origen</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Area */}
            <FormField
              control={form.control}
              name="area_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área de Almacenamiento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? '' : value)
                    }
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin proveedor</SelectItem>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            {supplier.name}
                          </div>
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
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? undefined : value)
                    }
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona origen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin especificar</SelectItem>
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
          </div>

          <Separator />

          {/* Section: Cantidades */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Package className="h-4 w-4 text-green-700" />
            <h3 className="font-semibold text-gray-900">Cantidades y Lote</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona unidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {QUANTITY_UNITS.map((unit) => (
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

            {/* Quality Grade */}
            <FormField
              control={form.control}
              name="quality_grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grado de Calidad</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? undefined : value)
                    }
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona grado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin especificar</SelectItem>
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

            {/* Batch Number */}
            <FormField
              control={form.control}
              name="batch_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Lote Interno</FormLabel>
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
          </div>

          <Separator />

          {/* Section: Costos */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <DollarSign className="h-4 w-4 text-green-700" />
            <h3 className="font-semibold text-gray-900">Costos de Este Lote</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Purchase Price */}
            <FormField
              control={form.control}
              name="purchase_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Compra Total</FormLabel>
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
                  <FormDescription>
                    Precio total pagado por este lote (COP)
                  </FormDescription>
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
                      placeholder="Calculado automáticamente"
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
                    Se calcula automáticamente (precio / cantidad)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price Comparison Alert */}
          {showPriceComparison && (
            <Alert
              className={
                priceDifference > 0
                  ? 'bg-amber-50 border-amber-200'
                  : priceDifference < 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
              }
            >
              <Info
                className={`h-4 w-4 ${
                  priceDifference > 0
                    ? 'text-amber-600'
                    : priceDifference < 0
                      ? 'text-green-600'
                      : 'text-gray-600'
                }`}
              />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {priceDifference > 0
                      ? 'El precio de compra es mayor al precio base del catálogo'
                      : priceDifference < 0
                        ? 'El precio de compra es menor al precio base del catálogo'
                        : 'El precio de compra es igual al precio base del catálogo'}
                  </span>
                  <Badge
                    variant={
                      priceDifference > 0
                        ? 'destructive'
                        : priceDifference < 0
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {priceDifference > 0 ? '+' : ''}
                    {pricePercentChange}%
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Precio base: {formatPrice(selectedProductInfo?.default_price)} |
                  Precio de compra: {formatPrice(purchasePrice)}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Section: Fechas */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Calendar className="h-4 w-4 text-green-700" />
            <h3 className="font-semibold text-gray-900">Fechas</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                          e.target.value
                            ? new Date(e.target.value).getTime()
                            : undefined
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
                          e.target.value
                            ? new Date(e.target.value).getTime()
                            : undefined
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
                          e.target.value
                            ? new Date(e.target.value).getTime()
                            : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Section: Niveles de Stock */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <BarChart3 className="h-4 w-4 text-green-700" />
            <h3 className="font-semibold text-gray-900">Niveles de Stock</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Minimum Stock Level */}
            <FormField
              control={form.control}
              name="minimum_stock_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel Mínimo</FormLabel>
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

            {/* Maximum Stock Level */}
            <FormField
              control={form.control}
              name="maximum_stock_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel Máximo</FormLabel>
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

          <Separator />

          {/* Section: Notas */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Star className="h-4 w-4 text-green-700" />
            <h3 className="font-semibold text-gray-900">Notas</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  <FormLabel>Notas Generales</FormLabel>
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </Form>

      {/* Create Product Modal */}
      <Dialog open={showCreateProductModal} onOpenChange={setShowCreateProductModal}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ShoppingCart className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <DialogTitle>Crear Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Agrega un producto al catálogo para usarlo en inventario
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ProductForm
            onSubmit={handleCreateProduct}
            onCancel={() => setShowCreateProductModal(false)}
            isSubmitting={isCreatingProduct}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
