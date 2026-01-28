'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Leaf,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';

interface Batch {
  _id: Id<'batches'>;
  batch_code: string;
  facility_id: Id<'facilities'>;
  current_quantity: number;
  unit_of_measure: string;
  current_phase?: string;
  cultivarName?: string | null;
  cropTypeName?: string | null;
}

interface BatchHarvestWizardProps {
  batch: Batch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Form validation schema
const createFormSchema = (maxQuantity: number) => z.object({
  harvestedQuantity: z.coerce
    .number()
    .min(1, 'Cantidad debe ser mayor a 0')
    .max(maxQuantity, `No puede exceder ${maxQuantity}`),
  harvestDate: z.number(),
  qualityGrade: z.enum(['premium', 'standard', 'second'], {
    required_error: 'Grado de calidad requerido',
  }),
  productId: z.string().min(1, 'Producto de inventario requerido'),
  storageAreaId: z.string().min(1, 'Ubicación de almacenamiento requerida'),
  notes: z.string().optional(),
});

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

type WizardStep = 'harvest_details' | 'inventory_creation' | 'confirmation';

// Quality grade labels
const qualityGradeLabels: Record<string, string> = {
  premium: 'Premium (A)',
  standard: 'Estándar (B)',
  second: 'Segunda (C)',
};

export function BatchHarvestWizard({ batch, open, onOpenChange }: BatchHarvestWizardProps) {
  const { userId } = useUser();
  const [currentStep, setCurrentStep] = useState<WizardStep>('harvest_details');

  // Query products
  const user = useQuery(api.users.getCurrentUser);
  const products = useQuery(
    api.products.list,
    open && user?.company_id
      ? { companyId: user.company_id }
      : 'skip'
  );

  // Query storage locations (areas with storage type)
  const areas = useQuery(
    api.areas.list,
    open && batch.facility_id
      ? {
          facilityId: batch.facility_id,
          status: 'active',
        }
      : 'skip'
  );

  // Harvest mutation
  const harvestMutation = useMutation(api.batches.harvest);
  const createInventoryItem = useMutation(api.inventory.create);

  // Form setup
  const formSchema = createFormSchema(batch.current_quantity);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      harvestedQuantity: batch.current_quantity,
      harvestDate: Date.now(),
      qualityGrade: 'standard',
      productId: '',
      storageAreaId: '',
      notes: '',
    },
    mode: 'onChange',
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep('harvest_details');
      form.reset({
        harvestedQuantity: batch.current_quantity,
        harvestDate: Date.now(),
        qualityGrade: 'standard',
        productId: '',
        storageAreaId: '',
        notes: '',
      });
    }
  }, [open, batch.current_quantity, form]);

  // Watch form values for summary
  const watchedValues = form.watch();
  const isPartialHarvest = watchedValues.harvestedQuantity < batch.current_quantity;
  const remainingQuantity = batch.current_quantity - (watchedValues.harvestedQuantity || 0);

  // Get area name helper
  const getAreaName = (areaId: string) => {
    const area = areas?.find(a => a._id === areaId);
    return area ? `${area.name} (${area.area_type})` : '';
  };

  // Get product name helper
  const getProductName = (productId: string) => {
    const product = products?.items?.find(p => p._id === productId);
    return product ? product.name : '';
  };

  // Step validation
  const canProceedToInventory = () => {
    const values = form.getValues();
    return (
      values.harvestedQuantity > 0 &&
      values.harvestedQuantity <= batch.current_quantity &&
      values.qualityGrade
    );
  };

  const canProceedToConfirmation = () => {
    const values = form.getValues();
    return canProceedToInventory() && values.productId && values.storageAreaId;
  };

  // Navigation handlers
  const handleNext = async () => {
    if (currentStep === 'harvest_details') {
      const isValid = await form.trigger(['harvestedQuantity', 'harvestDate', 'qualityGrade']);
      if (!isValid || !canProceedToInventory()) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }
      setCurrentStep('inventory_creation');
    } else if (currentStep === 'inventory_creation') {
      const isValid = await form.trigger(['productId', 'storageAreaId']);
      if (!isValid || !canProceedToConfirmation()) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }
      setCurrentStep('confirmation');
    }
  };

  const handleBack = () => {
    if (currentStep === 'inventory_creation') {
      setCurrentStep('harvest_details');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('inventory_creation');
    }
  };

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast.error('Error', {
        description: 'Usuario no autenticado',
      });
      return;
    }

    try {
      // Call harvest mutation
      await harvestMutation({
        batchId: batch._id,
        harvestDate: values.harvestDate,
        totalWeight: values.harvestedQuantity,
        weightUnit: batch.unit_of_measure,
        qualityGrade: values.qualityGrade,
        destinationAreaId: values.storageAreaId as Id<'areas'>,
        notes: values.notes,
        harvestedBy: userId as Id<'users'>,
      });

      // Create inventory item
      await createInventoryItem({
        product_id: values.productId as Id<'products'>,
        area_id: values.storageAreaId as Id<'areas'>,
        quantity_available: values.harvestedQuantity,
        quantity_unit: batch.unit_of_measure,
        batch_number: batch.batch_code,
        received_date: values.harvestDate,
        lot_status: 'available',
      });

      toast.success('Cosecha registrada exitosamente', {
        description: `${batch.batch_code} - ${values.harvestedQuantity} ${batch.unit_of_measure} cosechados`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error registering harvest:', error);
      toast.error('Error al registrar cosecha', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Leaf className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <DialogTitle>Registrar Cosecha</DialogTitle>
              <DialogDescription>
                Registrar cosecha de {batch.batch_code}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Batch Info Header */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Código:</span>
              <span className="ml-2 font-mono font-semibold">{batch.batch_code}</span>
            </div>
            <div>
              <span className="text-gray-600">Producto:</span>
              <span className="ml-2 font-medium">
                {batch.cultivarName || batch.cropTypeName || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Cantidad Disponible:</span>
              <span className="ml-2 font-semibold">
                {batch.current_quantity} {batch.unit_of_measure}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Fase Actual:</span>
              <span className="ml-2 font-medium capitalize">
                {batch.current_phase || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center gap-2 ${currentStep === 'harvest_details' ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'harvest_details' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'}`}>
              1
            </div>
            <span className="text-sm">Detalles</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
          <div className={`flex items-center gap-2 ${currentStep === 'inventory_creation' ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'inventory_creation' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'}`}>
              2
            </div>
            <span className="text-sm">Inventario</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
          <div className={`flex items-center gap-2 ${currentStep === 'confirmation' ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'confirmation' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'}`}>
              3
            </div>
            <span className="text-sm">Confirmación</span>
          </div>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Harvest Details */}
            {currentStep === 'harvest_details' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Detalles de Cosecha</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Registra la cantidad cosechada, fecha y grado de calidad.
                  </p>
                </div>

                {/* Harvested Quantity */}
                <FormField
                  control={form.control}
                  name="harvestedQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad Cosechada *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max={batch.current_quantity}
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Máximo: {batch.current_quantity} {batch.unit_of_measure}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Partial harvest warning */}
                {isPartialHarvest && watchedValues.harvestedQuantity > 0 && (
                  <Alert variant="warning">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Cosecha parcial:</strong> Quedarán {remainingQuantity} {batch.unit_of_measure} sin cosechar.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Harvest Date */}
                <FormField
                  control={form.control}
                  name="harvestDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Cosecha *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(field.value).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? new Date(e.target.value).getTime()
                                : Date.now()
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
                  name="qualityGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grado de Calidad *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar grado..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="premium">Premium (A)</SelectItem>
                          <SelectItem value="standard">Estándar (B)</SelectItem>
                          <SelectItem value="second">Segunda (C)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Inventory Creation */}
            {currentStep === 'inventory_creation' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Creación de Inventario</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Selecciona el producto y ubicación de almacenamiento para el inventario.
                  </p>
                </div>

                {/* Conversion Info */}
                <Alert>
                  <Package className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div>
                        <strong>Conversión:</strong> {watchedValues.harvestedQuantity} {batch.unit_of_measure} del lote → {watchedValues.harvestedQuantity} unidades de producto
                      </div>
                      <div className="text-xs text-gray-600">
                        Grado de calidad: {qualityGradeLabels[watchedValues.qualityGrade || 'standard']}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Product Selection */}
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Producto de Inventario *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar producto..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products?.items?.map((product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name} - {product.sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Producto que se agregará al inventario
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Storage Location */}
                <FormField
                  control={form.control}
                  name="storageAreaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación de Almacenamiento *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar ubicación..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areas?.map((area) => (
                            <SelectItem key={area._id} value={area._id}>
                              {area.name} ({area.area_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Área donde se almacenará el producto cosechado
                      </FormDescription>
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
                      <FormLabel>Notas (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Notas adicionales sobre la cosecha..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 'confirmation' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Confirmar Cosecha</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Revisa los detalles antes de confirmar la cosecha.
                  </p>
                </div>

                {/* Status Change Alert */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    El lote <strong>{batch.batch_code}</strong> será marcado como{' '}
                    <strong className="text-green-700">cosechado</strong> y se creará un nuevo item de inventario.
                  </AlertDescription>
                </Alert>

                {/* Harvest Details Summary */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                    Detalles de Cosecha
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cantidad Cosechada:</span>
                      <span className="font-semibold">
                        {watchedValues.harvestedQuantity} {batch.unit_of_measure}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Cosecha:</span>
                      <span className="font-medium">
                        {new Date(watchedValues.harvestDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grado de Calidad:</span>
                      <span className="font-medium">
                        {qualityGradeLabels[watchedValues.qualityGrade || 'standard']}
                      </span>
                    </div>
                    {isPartialHarvest && (
                      <div className="flex justify-between text-amber-700">
                        <span>Cantidad Restante:</span>
                        <span className="font-semibold">
                          {remainingQuantity} {batch.unit_of_measure}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inventory Creation Summary */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 font-semibold text-sm">
                    Item de Inventario
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Producto:</span>
                      <span className="font-medium">
                        {getProductName(watchedValues.productId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ubicación:</span>
                      <span className="font-medium">
                        {getAreaName(watchedValues.storageAreaId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cantidad Disponible:</span>
                      <span className="font-semibold">
                        {watchedValues.harvestedQuantity} {batch.unit_of_measure}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lote de Origen:</span>
                      <span className="font-mono text-xs">
                        {batch.batch_code}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Batch Status Change */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-900">
                        Estado del Lote
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        <span className="font-mono">{batch.batch_code}</span>: activo → <strong>cosechado</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Summary */}
                {watchedValues.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-semibold mb-1">Notas:</div>
                    <p className="text-sm text-gray-700">{watchedValues.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <Separator />
            <div className="flex justify-between gap-3 pt-2">
              <div>
                {currentStep !== 'harvest_details' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={form.formState.isSubmitting}
                  >
                    Anterior
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancelar
                </Button>
                {currentStep === 'confirmation' ? (
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Registrando...
                      </>
                    ) : (
                      'Registrar Cosecha'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      currentStep === 'harvest_details' ? !canProceedToInventory() :
                      currentStep === 'inventory_creation' ? !canProceedToConfirmation() :
                      false
                    }
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Siguiente
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
