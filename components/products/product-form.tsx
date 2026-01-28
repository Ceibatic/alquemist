'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  productFormSchema,
  productCategoryLabels,
  weightUnitLabels,
  priceChangeCategoryLabels,
  INVENTORY_UNITS,
  type ProductFormInput,
} from '@/lib/validations/product';
import { useFacility } from '@/components/providers/facility-provider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  productId?: string;
  onSubmit: (data: ProductFormInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const categories = [
  'seed',
  'nutrient',
  'pesticide',
  'equipment',
  'substrate',
  'container',
  'tool',
  'other',
] as const;

const weightUnits = ['kg', 'g', 'lb', 'oz'] as const;

const priceChangeCategories = [
  'market_adjustment',
  'supplier_change',
  'inflation',
  'promotion',
  'error_correction',
  'cost_increase',
  'cost_decrease',
  'new_contract',
  'other',
] as const;

export function ProductForm({
  productId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProductFormProps) {
  const { currentCompanyId } = useFacility();

  // Fetch suppliers for dropdown
  const suppliersData = useQuery(
    api.suppliers.list,
    currentCompanyId ? { companyId: currentCompanyId } : 'skip'
  );
  const suppliers = suppliersData || [];

  // Fetch product if editing
  const existingProduct = useQuery(
    api.products.getById,
    productId ? { productId: productId as Id<'products'> } : 'skip'
  );

  // Generate SKU query
  const generateSkuQuery = useQuery(
    api.products.generateSku,
    currentCompanyId ? { companyId: currentCompanyId, category: 'other' } : 'skip'
  );

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category: 'other',
      subcategory: '',
      default_unit: '',
      preferred_supplier_id: '',
      brand_id: '',
      manufacturer: '',
      weight_value: undefined,
      weight_unit: '',
      regulatory_registered: false,
      regulatory_registration_number: '',
      organic_certified: false,
      organic_cert_number: '',
      default_price: undefined,
      price_currency: 'COP',
      price_unit: '',
      priceChangeCategory: '',
      priceChangeReason: '',
      priceChangeNotes: '',
    },
  });

  // Real-time SKU validation
  const skuValue = form.watch('sku');
  const debouncedSku = useDebounce(skuValue, 500);

  const skuExists = useQuery(
    api.products.checkSkuExists,
    debouncedSku && debouncedSku.length >= 2 && currentCompanyId
      ? {
          sku: debouncedSku,
          companyId: currentCompanyId,
          productId: productId as Id<'products'> | undefined,
        }
      : 'skip'
  );

  // Populate form when editing
  useEffect(() => {
    if (existingProduct) {
      form.reset({
        sku: existingProduct.sku,
        name: existingProduct.name,
        description: existingProduct.description || '',
        category: existingProduct.category as any,
        subcategory: existingProduct.subcategory || '',
        default_unit: (existingProduct.default_unit as any) || '',
        preferred_supplier_id: existingProduct.preferred_supplier_id || '',
        brand_id: existingProduct.brand_id || '',
        manufacturer: existingProduct.manufacturer || '',
        weight_value: existingProduct.weight_value || undefined,
        weight_unit: (existingProduct.weight_unit as any) || '',
        regulatory_registered: existingProduct.regulatory_registered || false,
        regulatory_registration_number: existingProduct.regulatory_registration_number || '',
        organic_certified: existingProduct.organic_certified || false,
        organic_cert_number: existingProduct.organic_cert_number || '',
        default_price: existingProduct.default_price || undefined,
        price_currency: existingProduct.price_currency || 'COP',
        price_unit: existingProduct.price_unit || '',
      });
    }
  }, [existingProduct, form]);

  const watchCategory = form.watch('category');
  const watchPrice = form.watch('default_price');

  // Track if price has changed from original (only for editing)
  const originalPrice = existingProduct?.default_price;
  const isPriceChanged =
    productId &&
    existingProduct &&
    typeof watchPrice === 'number' &&
    watchPrice !== originalPrice;

  // Generate SKU based on category
  const handleGenerateSku = async () => {
    const category = form.getValues('category');
    const categoryPrefixes: Record<string, string> = {
      seed: 'SEM',
      nutrient: 'NUT',
      pesticide: 'PES',
      equipment: 'EQP',
      substrate: 'SUS',
      container: 'CON',
      tool: 'HER',
      other: 'OTR',
    };
    const prefix = categoryPrefixes[category] || 'PRD';
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const sku = `${prefix}-${timestamp}${randomPart}`;
    form.setValue('sku', sku);
  };

  const handleFormSubmit = async (data: ProductFormInput) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Información Básica</h3>
          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* SKU */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="relative flex-1">
                        <Input
                          placeholder="PRD-0001"
                          {...field}
                          onChange={(e) => {
                            const upper = e.target.value.toUpperCase();
                            field.onChange(upper);
                          }}
                          disabled={isSubmitting || !!productId}
                          className={cn(
                            skuExists && !productId && 'border-red-500',
                            skuExists === false && !productId && 'border-green-500'
                          )}
                        />
                        {skuValue && skuValue.length >= 2 && !productId && (
                          <div className="absolute right-2 top-2.5">
                            {skuExists === undefined ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : skuExists ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {!productId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateSku}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {skuExists && !productId && (
                    <p className="text-sm text-red-500">
                      Este SKU ya existe en el catálogo
                    </p>
                  )}
                  {skuExists === false && !productId && (
                    <p className="text-sm text-green-600">SKU disponible</p>
                  )}
                  <FormDescription>
                    Código único de identificación del producto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {productCategoryLabels[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del producto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción del producto..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subcategory */}
          <FormField
            control={form.control}
            name="subcategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategoría</FormLabel>
                <FormControl>
                  <Input placeholder="Subcategoría (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Default Inventory Unit */}
          <FormField
            control={form.control}
            name="default_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad de Inventario</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  value={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin unidad definida</SelectItem>
                    {INVENTORY_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Unidad de medida predeterminada para inventario (ej. kg, litros, unidades)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Supplier & Manufacturer */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Proveedor y Fabricante</h3>
          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Preferred Supplier */}
            <FormField
              control={form.control}
              name="preferred_supplier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor Preferido</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin proveedor</SelectItem>
                      {suppliers.map((supplier: any) => (
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

            {/* Manufacturer */}
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del fabricante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Brand */}
          <FormField
            control={form.control}
            name="brand_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Marca del producto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Precios</h3>
          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Default Price */}
            <FormField
              control={form.control}
              name="default_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Base</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : parseFloat(value));
                      }}
                    />
                  </FormControl>
                  <FormDescription>Precio de referencia del catálogo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency */}
            <FormField
              control={form.control}
              name="price_currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Moneda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COP">COP (Peso Colombiano)</SelectItem>
                      <SelectItem value="USD">USD (Dólar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Unit */}
            <FormField
              control={form.control}
              name="price_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad de Precio</FormLabel>
                  <FormControl>
                    <Input placeholder="por kg, por unidad..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Price Change Tracking - Only shown when editing and price changed */}
          {isPriceChanged && (
            <div className="mt-4 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  El precio cambió de{' '}
                  <strong>
                    {originalPrice !== undefined
                      ? new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                        }).format(originalPrice)
                      : 'No definido'}
                  </strong>{' '}
                  a{' '}
                  <strong>
                    {typeof watchPrice === 'number'
                      ? new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                        }).format(watchPrice)
                      : 'No definido'}
                  </strong>
                  . Por favor indica la razón del cambio para mantener trazabilidad.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Price Change Category */}
                <FormField
                  control={form.control}
                  name="priceChangeCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría del Cambio</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === 'none' ? '' : value)
                        }
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin especificar</SelectItem>
                          {priceChangeCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {priceChangeCategoryLabels[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Change Reason */}
                <FormField
                  control={form.control}
                  name="priceChangeReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón del Cambio</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Nuevo contrato con proveedor"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price Change Notes */}
              <FormField
                control={form.control}
                name="priceChangeNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional sobre el cambio de precio..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Physical Properties */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Propiedades Físicas</h3>
          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Weight Value */}
            <FormField
              control={form.control}
              name="weight_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : parseFloat(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight Unit */}
            <FormField
              control={form.control}
              name="weight_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad de Peso</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar unidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin especificar</SelectItem>
                      {weightUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {weightUnitLabels[unit]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Regulatory */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Información Regulatoria</h3>
          <Separator />

          <div className="space-y-4">
            {/* Regulatory Registered */}
            <FormField
              control={form.control}
              name="regulatory_registered"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Registrado ante autoridad regulatoria</FormLabel>
                    <FormDescription>
                      Ej: ICA, INVIMA, o entidad equivalente
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('regulatory_registered') && (
              <FormField
                control={form.control}
                name="regulatory_registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Registro</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de registro regulatorio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Organic Certified */}
            <FormField
              control={form.control}
              name="organic_certified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Certificación Orgánica</FormLabel>
                    <FormDescription>
                      El producto cuenta con certificación orgánica
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('organic_certified') && (
              <FormField
                control={form.control}
                name="organic_cert_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Certificación Orgánica</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de certificación" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
