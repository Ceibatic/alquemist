'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Split,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Info
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

interface BatchSplitWizardProps {
  batch: Batch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Form validation schema
const formSchema = z.object({
  splits: z.array(z.object({
    quantity: z.coerce.number().min(1, 'Cantidad debe ser mayor a 0'),
    areaId: z.string().min(1, 'Area requerida'),
    phaseOverride: z.string().optional(),
    notes: z.string().optional(),
  })).min(2, 'Debes crear al menos 2 lotes'),
  reason: z.string().min(1, 'Razon requerida'),
  splitNotes: z.string().optional(),
}).refine((data) => {
  const total = data.splits.reduce((sum, split) => sum + Number(split.quantity), 0);
  return total;
}, {
  message: 'Validando cantidades...',
  path: ['splits'],
});

type FormValues = z.infer<typeof formSchema>;

type WizardStep = 'quantities' | 'metadata' | 'confirmation';

export function BatchSplitWizard({ batch, open, onOpenChange }: BatchSplitWizardProps) {
  const { userId } = useUser();
  const [currentStep, setCurrentStep] = useState<WizardStep>('quantities');

  // Query areas from the same facility
  const areas = useQuery(
    api.areas.list,
    open
      ? {
          facilityId: batch.facility_id,
          status: 'active',
        }
      : 'skip'
  );

  // Split mutation
  const splitMutation = useMutation(api.batches.split);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      splits: [
        { quantity: 0, areaId: '', phaseOverride: '', notes: '' },
        { quantity: 0, areaId: '', phaseOverride: '', notes: '' },
      ],
      reason: '',
      splitNotes: '',
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'splits',
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep('quantities');
      form.reset({
        splits: [
          { quantity: 0, areaId: '', phaseOverride: '', notes: '' },
          { quantity: 0, areaId: '', phaseOverride: '', notes: '' },
        ],
        reason: '',
        splitNotes: '',
      });
    }
  }, [open, form]);

  // Calculate remaining quantity to distribute
  const watchedSplits = form.watch('splits');
  const totalDistributed = watchedSplits.reduce((sum, split) => {
    const qty = Number(split.quantity) || 0;
    return sum + qty;
  }, 0);
  const remaining = batch.current_quantity - totalDistributed;
  const isValidTotal = totalDistributed === batch.current_quantity;

  // Step validation
  const canProceedToMetadata = () => {
    const splits = form.getValues('splits');
    if (splits.length < 2) return false;

    const allHaveQuantity = splits.every(s => Number(s.quantity) > 0);
    const allHaveArea = splits.every(s => s.areaId);
    const validTotal = totalDistributed === batch.current_quantity;

    return allHaveQuantity && allHaveArea && validTotal;
  };

  const canProceedToConfirmation = () => {
    // All validation happens at quantities step + optional metadata
    return canProceedToMetadata();
  };

  // Navigation handlers
  const handleNext = async () => {
    if (currentStep === 'quantities') {
      // Validate quantities step
      const isValid = await form.trigger(['splits', 'reason']);
      if (!isValid || !canProceedToMetadata()) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }
      setCurrentStep('metadata');
    } else if (currentStep === 'metadata') {
      setCurrentStep('confirmation');
    }
  };

  const handleBack = () => {
    if (currentStep === 'metadata') {
      setCurrentStep('quantities');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('metadata');
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
      // Map form data to mutation format
      const splitsData = values.splits.map(split => ({
        quantity: Number(split.quantity),
        areaId: split.areaId as Id<'areas'>,
        code: undefined, // Auto-generated
      }));

      await splitMutation({
        batchId: batch._id,
        splits: splitsData,
        reason: values.reason,
        performedBy: userId as Id<'users'>,
      });

      toast.success('Lote dividido exitosamente', {
        description: `${batch.batch_code} dividido en ${values.splits.length} lotes`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error splitting batch:', error);
      toast.error('Error al dividir lote', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      });
    }
  };

  // Add new split
  const handleAddSplit = () => {
    append({ quantity: 0, areaId: '', phaseOverride: '', notes: '' });
  };

  // Remove split (minimum 2)
  const handleRemoveSplit = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  // Get area name helper
  const getAreaName = (areaId: string) => {
    const area = areas?.find(a => a._id === areaId);
    return area ? `${area.name} (${area.area_type})` : '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Split className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <DialogTitle>Dividir Lote</DialogTitle>
              <DialogDescription>
                Dividir {batch.batch_code} en multiples lotes
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Batch Info Header */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Codigo:</span>
              <span className="ml-2 font-mono font-semibold">{batch.batch_code}</span>
            </div>
            <div>
              <span className="text-gray-600">Producto:</span>
              <span className="ml-2 font-medium">
                {batch.cultivarName || batch.cropTypeName || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Cantidad Actual:</span>
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
          <div className={`flex items-center gap-2 ${currentStep === 'quantities' ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'quantities' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'}`}>
              1
            </div>
            <span className="text-sm">Distribución</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
          <div className={`flex items-center gap-2 ${currentStep === 'metadata' ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'metadata' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'}`}>
              2
            </div>
            <span className="text-sm">Metadata</span>
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
            {/* Step 1: Quantity Distribution */}
            {currentStep === 'quantities' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Distribución de Cantidades</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Define cuantos lotes hijos crear y la cantidad para cada uno.
                    La suma debe ser igual a la cantidad original.
                  </p>
                </div>

                {/* Quantity Distribution Alert */}
                <Alert variant={isValidTotal ? 'success' : remaining === 0 ? 'default' : 'warning'}>
                  {isValidTotal ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {isValidTotal ? (
                      <span className="font-medium text-green-700">
                        Distribucion completa y valida
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <div>
                          <strong>Distribuido:</strong> {totalDistributed} / {batch.current_quantity} {batch.unit_of_measure}
                        </div>
                        <div className={remaining < 0 ? 'text-red-600' : ''}>
                          <strong>Restante:</strong> {remaining} {batch.unit_of_measure}
                          {remaining < 0 && ' (excede cantidad original)'}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Splits */}
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Lote Hijo #{index + 1}</h4>
                        {fields.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSplit(index)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`splits.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cantidad *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`splits.${index}.areaId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area Destino *</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar area..." />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSplit}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Lote Hijo
                </Button>

                {/* Reason */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razon de Division *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar razon..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quality_separation">
                            Separacion por calidad
                          </SelectItem>
                          <SelectItem value="space_distribution">
                            Distribucion de espacio
                          </SelectItem>
                          <SelectItem value="phase_separation">
                            Separacion por fase
                          </SelectItem>
                          <SelectItem value="customer_order">
                            Orden de cliente
                          </SelectItem>
                          <SelectItem value="testing">
                            Pruebas / Experimentacion
                          </SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Metadata */}
            {currentStep === 'metadata' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Metadata (Opcional)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Opcionalmente puedes actualizar la fase o agregar notas para cada lote hijo.
                  </p>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-sm">
                      Lote Hijo #{index + 1} - {watchedSplits[index].quantity} {batch.unit_of_measure}
                      {watchedSplits[index].areaId && (
                        <span className="text-gray-600 font-normal ml-2">
                          → {getAreaName(watchedSplits[index].areaId)}
                        </span>
                      )}
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      <FormField
                        control={form.control}
                        name={`splits.${index}.phaseOverride`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fase (opcional)</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Mantener fase actual" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="germination">Germinacion</SelectItem>
                                <SelectItem value="seedling">Plantula</SelectItem>
                                <SelectItem value="vegetative">Vegetativo</SelectItem>
                                <SelectItem value="flowering">Floracion</SelectItem>
                                <SelectItem value="harvest_ready">Listo para cosecha</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Dejar vacio para mantener fase: {batch.current_phase || 'N/A'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`splits.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas (opcional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Notas especificas para este lote..."
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                {/* Global notes */}
                <FormField
                  control={form.control}
                  name="splitNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Generales (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Notas generales sobre la division del lote..."
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
                  <h3 className="font-semibold mb-2">Confirmar Division</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Revisa los detalles antes de confirmar la division del lote.
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    El lote <strong>{batch.batch_code}</strong> sera marcado como dividido y
                    se crearan <strong>{fields.length} lotes hijos</strong>.
                  </AlertDescription>
                </Alert>

                {/* Summary table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">#</th>
                        <th className="text-left p-3 font-medium">Cantidad</th>
                        <th className="text-left p-3 font-medium">Area Destino</th>
                        <th className="text-left p-3 font-medium">Fase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {watchedSplits.map((split, index) => (
                        <tr key={index}>
                          <td className="p-3">#{index + 1}</td>
                          <td className="p-3 font-medium">
                            {split.quantity} {batch.unit_of_measure}
                          </td>
                          <td className="p-3">{getAreaName(split.areaId)}</td>
                          <td className="p-3 capitalize">
                            {split.phaseOverride || batch.current_phase || 'Sin cambio'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="p-3">Total</td>
                        <td className="p-3">
                          {totalDistributed} {batch.unit_of_measure}
                        </td>
                        <td className="p-3" colSpan={2}>
                          {fields.length} lotes
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <div>
                    <strong>Razon:</strong>
                    <span className="ml-2 capitalize">
                      {form.getValues('reason').replace(/_/g, ' ')}
                    </span>
                  </div>
                  {form.getValues('splitNotes') && (
                    <div>
                      <strong>Notas:</strong>
                      <p className="mt-1 text-gray-700">{form.getValues('splitNotes')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <Separator />
            <div className="flex justify-between gap-3 pt-2">
              <div>
                {currentStep !== 'quantities' && (
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
                        Dividiendo...
                      </>
                    ) : (
                      'Dividir Lote'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      currentStep === 'quantities' ? !canProceedToMetadata() :
                      currentStep === 'metadata' ? !canProceedToConfirmation() :
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
