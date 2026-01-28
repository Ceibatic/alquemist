'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';
import { useFacility } from '@/components/providers/facility-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2, Package, Truck, Calendar, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductCombobox } from './product-combobox';
import { inventoryReceiptSchema, InventoryReceiptInput } from '@/lib/validations/inventory';
import { inventoryUnitLabels } from '@/lib/validations/product';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Id } from '@/convex/_generated/dataModel';

interface InventoryReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  preSelectedProductId?: string;
}

const RECEIPT_REASONS = [
  { value: 'Compra', label: 'Compra a proveedor' },
  { value: 'Donación', label: 'Donación recibida' },
  { value: 'Devolución', label: 'Devolución de cliente' },
  { value: 'Transferencia', label: 'Transferencia desde otra sede' },
  { value: 'Producción', label: 'Producción interna' },
  { value: 'Otro', label: 'Otro' },
];

const QUANTITY_UNITS = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'mL', label: 'Mililitros (mL)' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'bolsas', label: 'Bolsas' },
  { value: 'cajas', label: 'Cajas' },
];

export function InventoryReceiptModal({
  open,
  onOpenChange,
  facilityId,
  preSelectedProductId,
}: InventoryReceiptModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'product' | 'details' | 'financial'>('product');
  const { userId } = useUser();
  const { currentCompanyId } = useFacility();

  const logInventoryMovement = useMutation(api.activities.logInventoryMovement);

  // Get areas for this facility
  const areas = useQuery(api.areas.getByFacility, { facilityId: facilityId as any });

  // Get suppliers
  const suppliers = useQuery(
    api.suppliers.list,
    currentCompanyId
      ? { companyId: currentCompanyId }
      : 'skip'
  ) || [];

  const form = useForm<InventoryReceiptInput>({
    resolver: zodResolver(inventoryReceiptSchema),
    defaultValues: {
      product_id: preSelectedProductId || '',
      area_id: '',
      supplier_id: '',
      quantity: 0,
      quantity_unit: 'unidades',
      batch_number: '',
      supplier_lot_number: '',
      received_date: Date.now(),
      manufacturing_date: undefined,
      expiration_date: undefined,
      purchase_price: undefined,
      cost_per_unit: undefined,
      reason: 'Compra',
      notes: '',
    },
  });

  const selectedProductId = form.watch('product_id');
  const quantity = form.watch('quantity');
  const purchasePrice = form.watch('purchase_price');
  const receivedDate = form.watch('received_date');
  const manufacturingDate = form.watch('manufacturing_date');
  const expirationDate = form.watch('expiration_date');

  // Fetch the selected product to get its default_unit
  const selectedProduct = useQuery(
    api.products.getById,
    selectedProductId
      ? { productId: selectedProductId as Id<'products'> }
      : 'skip'
  );

  // Get the unit from the product (fallback to form value or 'unidades')
  const productUnit = selectedProduct?.default_unit || form.getValues('quantity_unit') || 'unidades';

  // Auto-calculate cost per unit
  const costPerUnit = purchasePrice && quantity > 0 ? purchasePrice / quantity : undefined;

  const handleProductSelect = (product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    default_price?: number;
    price_currency?: string;
    default_unit?: string;
  }) => {
    form.setValue('product_id', product._id);
    // Set the unit from the product's default_unit
    if (product.default_unit) {
      form.setValue('quantity_unit', product.default_unit);
    }
  };

  // Real-time validation for dates
  useEffect(() => {
    const now = Date.now();

    // Validate received_date not in future
    if (receivedDate && receivedDate > now) {
      form.setError('received_date', {
        type: 'manual',
        message: 'La fecha de recepción no puede ser en el futuro',
      });
    } else {
      form.clearErrors('received_date');
    }

    // Validate manufacturing_date not in future
    if (manufacturingDate && manufacturingDate > now) {
      form.setError('manufacturing_date', {
        type: 'manual',
        message: 'La fecha de manufactura no puede ser en el futuro',
      });
    } else {
      form.clearErrors('manufacturing_date');
    }

    // Validate expiration > manufacturing
    if (manufacturingDate && expirationDate && expirationDate <= manufacturingDate) {
      form.setError('expiration_date', {
        type: 'manual',
        message: 'La fecha de vencimiento debe ser posterior a la fecha de manufactura',
      });
    } else if (form.formState.errors.expiration_date?.message === 'La fecha de vencimiento debe ser posterior a la fecha de manufactura') {
      form.clearErrors('expiration_date');
    }
  }, [receivedDate, manufacturingDate, expirationDate, form]);

  // Check if expiration date is near (< 30 days)
  const isExpirationNear = expirationDate && (expirationDate - Date.now()) < 30 * 24 * 60 * 60 * 1000;

  // Check if purchase price and cost per unit have significant mismatch
  const hasPriceMismatch = purchasePrice && quantity > 0 && costPerUnit
    ? Math.abs(purchasePrice - (costPerUnit * quantity)) / purchasePrice > 0.05
    : false;

  const handleSubmit = async (data: InventoryReceiptInput) => {
    if (!userId) {
      toast.error('Debe estar autenticado para registrar entradas');
      return;
    }

    const now = Date.now();

    // Validate dates not in future
    if (data.received_date && data.received_date > now) {
      form.setError('received_date', {
        type: 'manual',
        message: 'La fecha de recepción no puede ser en el futuro',
      });
      return;
    }

    if (data.manufacturing_date && data.manufacturing_date > now) {
      form.setError('manufacturing_date', {
        type: 'manual',
        message: 'La fecha de manufactura no puede ser en el futuro',
      });
      return;
    }

    // Validate expiration > manufacturing
    if (data.manufacturing_date && data.expiration_date && data.expiration_date <= data.manufacturing_date) {
      form.setError('expiration_date', {
        type: 'manual',
        message: 'La fecha de vencimiento debe ser posterior a la fecha de manufactura',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await logInventoryMovement({
        movement_type: 'receipt',
        product_id: data.product_id as any,
        quantity: data.quantity,
        quantity_unit: selectedProduct?.default_unit || data.quantity_unit,
        area_id: data.area_id as any,
        facility_id: facilityId as any,
        supplier_id: data.supplier_id ? (data.supplier_id as any) : undefined,
        batch_number: data.batch_number,
        supplier_lot_number: data.supplier_lot_number,
        received_date: data.received_date,
        manufacturing_date: data.manufacturing_date,
        expiration_date: data.expiration_date,
        purchase_price: data.purchase_price,
        cost_per_unit: costPerUnit,
        reason: data.reason,
        notes: data.notes,
        performed_by: userId,
      });

      toast.success('Entrada de inventario registrada exitosamente');
      onOpenChange(false);
      form.reset();
      setStep('product');
    } catch (error: any) {
      console.error('Error registering receipt:', error);
      toast.error(error.message || 'Error al registrar la entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToDetails = selectedProductId && form.getValues('area_id');
  const canProceedToFinancial = canProceedToDetails && form.getValues('quantity') > 0;

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'yyyy-MM-dd');
  };

  const parseDate = (dateStr: string): number | undefined => {
    if (!dateStr) return undefined;
    return new Date(dateStr).getTime();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Truck className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <DialogTitle>Registrar Entrada de Inventario</DialogTitle>
              <DialogDescription>
                Registra una nueva entrada de inventario (compra, donación, transferencia, etc.)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {['product', 'details', 'financial'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s
                    ? 'bg-green-600 text-white'
                    : i < ['product', 'details', 'financial'].indexOf(step)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`mx-2 h-0.5 w-8 ${
                    i < ['product', 'details', 'financial'].indexOf(step)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Step 1: Product Selection */}
            {step === 'product' && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Paso 1: Selecciona el producto y ubicación
                    </span>
                  </div>
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
                          placeholder="Seleccionar producto..."
                        />
                      </FormControl>
                      <FormDescription>
                        Selecciona el producto que estás recibiendo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área de Almacenamiento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar área..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areas?.map((area: { _id: string; name: string }) => (
                            <SelectItem key={area._id} value={area._id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Dónde se almacenará este inventario
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar proveedor (opcional)..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier: { _id: string; commercial_name?: string; legal_name?: string }) => (
                            <SelectItem key={supplier._id} value={supplier._id}>
                              {supplier.commercial_name || supplier.legal_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        De quién estás comprando este producto
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep('details')}
                    disabled={!selectedProductId || !form.getValues('area_id')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Quantity and Batch Details */}
            {step === 'details' && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Paso 2: Cantidad y detalles del lote
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad *</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="quantity_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad *</FormLabel>
                        {selectedProduct?.default_unit ? (
                          // Product has a default unit - show read-only
                          <>
                            <div className="flex h-10 items-center rounded-md border bg-gray-50 px-3">
                              <span className="font-medium">
                                {inventoryUnitLabels[selectedProduct.default_unit] || selectedProduct.default_unit}
                              </span>
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                              Unidad definida en el producto
                            </p>
                          </>
                        ) : (
                          // No default unit - allow selection
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {QUANTITY_UNITS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="batch_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Lote</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: LOT-2024-001"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Identificador único del lote
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplier_lot_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lote del Proveedor</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Número de lote del proveedor"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="received_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Recepción</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={formatDate(field.value)}
                            onChange={(e) => field.onChange(parseDate(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manufacturing_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Fabricación</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={formatDate(field.value)}
                            onChange={(e) => field.onChange(parseDate(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiration_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Vencimiento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={formatDate(field.value)}
                            onChange={(e) => field.onChange(parseDate(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Warning for near expiration */}
                {isExpirationNear && expirationDate && (
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Este producto vence en menos de 30 días ({format(new Date(expirationDate), 'PPP', { locale: es })})
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('product')}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep('financial')}
                    disabled={!form.getValues('quantity')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Financial and Notes */}
            {step === 'financial' && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Paso 3: Información financiera y notas
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="purchase_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio de Compra Total</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              value={field.value || ''}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Precio total pagado por esta compra
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Costo por Unidad (calculado)
                    </label>
                    <div className="flex h-10 items-center rounded-md border bg-gray-50 px-3">
                      <span className="text-gray-500">$</span>
                      <span className="ml-1 font-medium">
                        {costPerUnit
                          ? costPerUnit.toLocaleString('es-CO', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '0.00'}
                      </span>
                      <span className="ml-1 text-gray-500">
                        / {selectedProduct?.default_unit || form.getValues('quantity_unit')}
                      </span>
                    </div>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Calculado automáticamente
                    </p>
                  </div>
                </div>

                {/* Warning for price mismatch */}
                {hasPriceMismatch && (
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      El precio de compra total y el costo por unidad multiplicado por la cantidad difieren en más del 5%.
                      Verifica que los valores sean correctos.
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón de la Entrada *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RECEIPT_REASONS.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionales sobre esta entrada..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Summary */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="mb-3 font-medium">Resumen de la Entrada</h4>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Cantidad:</dt>
                      <dd className="font-medium">
                        {quantity} {form.getValues('quantity_unit')}
                      </dd>
                    </div>
                    {purchasePrice && (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Precio total:</dt>
                          <dd className="font-medium text-green-600">
                            ${purchasePrice.toLocaleString('es-CO')}
                          </dd>
                        </div>
                        {costPerUnit && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Costo unitario:</dt>
                            <dd className="font-medium">
                              ${costPerUnit.toLocaleString('es-CO', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </dd>
                          </div>
                        )}
                      </>
                    )}
                  </dl>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('details')}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Registrar Entrada
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
