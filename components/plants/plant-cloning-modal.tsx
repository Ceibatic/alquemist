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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Scissors, Loader2, AlertTriangle, Info, Sprout } from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';

interface PlantCloningModalProps {
  plant: {
    _id: Id<'plants'>;
    plant_code: string;
    batch_id: Id<'batches'>;
    cultivar_id?: Id<'cultivars'>;
    clones_taken_count: number;
    status: string;
    company_id: Id<'companies'>;
    facility_id: Id<'facilities'>;
    [key: string]: any; // Allow additional enriched fields
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z
  .object({
    quantity: z
      .number()
      .min(1, 'Cantidad minima: 1')
      .max(100, 'Cantidad maxima: 100 por operacion'),
    targetType: z.enum(['new_batch', 'existing_batch'], {
      required_error: 'Tipo de destino requerido',
    }),
    existingBatchId: z.string().optional(),
    newBatchCode: z.string().optional(),
    areaId: z.string().optional(),
    cloningMethod: z.enum(['cutting', 'tissue_culture', 'air_layering'], {
      required_error: 'Metodo requerido',
    }),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.targetType === 'existing_batch' && !data.existingBatchId)
        return false;
      if (data.targetType === 'new_batch' && (!data.newBatchCode || !data.areaId))
        return false;
      return true;
    },
    {
      message: 'Debe especificar el destino completo',
      path: ['targetType'],
    }
  );

type FormValues = z.infer<typeof formSchema>;

const cloningMethods = [
  { value: 'cutting', label: 'Esquejes (Cutting)' },
  { value: 'tissue_culture', label: 'Cultivo de Tejidos' },
  { value: 'air_layering', label: 'Acodo Aereo' },
];

export function PlantCloningModal({
  plant,
  open,
  onOpenChange,
}: PlantCloningModalProps) {
  const { toast } = useToast();
  const { userId } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const areas = useQuery(
    api.areas.list,
    plant.facility_id ? { facilityId: plant.facility_id } : 'skip'
  );

  const existingBatches = useQuery(
    api.batches.list,
    plant.cultivar_id
      ? {
          companyId: plant.company_id,
          cultivarId: plant.cultivar_id,
          status: 'active',
        }
      : 'skip'
  );

  // Mutation
  const takeClones = useMutation(api.plants.takeClones);

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 10,
      targetType: 'new_batch',
      existingBatchId: '',
      newBatchCode: '',
      areaId: '',
      cloningMethod: 'cutting',
      notes: '',
    },
  });

  const targetType = form.watch('targetType');
  const selectedBatchId = form.watch('existingBatchId');

  // Get selected batch details
  const selectedBatch = existingBatches?.find((b) => b._id === selectedBatchId);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        quantity: 10,
        targetType: 'new_batch',
        existingBatchId: '',
        newBatchCode: '',
        areaId: '',
        cloningMethod: 'cutting',
        notes: '',
      });
    }
  }, [open, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Usuario no autenticado',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await takeClones({
        motherPlantId: plant._id,
        quantity: values.quantity,
        targetBatchId:
          values.targetType === 'existing_batch'
            ? (values.existingBatchId as Id<'batches'>)
            : undefined,
        newBatchData:
          values.targetType === 'new_batch'
            ? {
                areaId: values.areaId as Id<'areas'>,
                notes: values.notes,
              }
            : undefined,
        method: values.cloningMethod,
        notes: values.notes,
        performedBy: userId as Id<'users'>,
      });

      toast({
        title: 'Clones creados exitosamente',
        description: `Se crearon ${values.quantity} clones de ${plant.plant_code}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error al crear clones',
        description: error.message || 'No se pudo completar la operacion',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showWarning = plant.clones_taken_count > 20;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-700">
            <Scissors className="h-5 w-5" />
            Tomar Clones de Planta Madre
          </DialogTitle>
          <DialogDescription>
            Crear clones a partir de la planta <strong>{plant.plant_code}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Mother Plant Stats */}
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-start gap-3">
            <Sprout className="h-5 w-5 text-violet-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-violet-900">Planta Madre</h4>
              <div className="mt-1 space-y-1 text-sm text-violet-700">
                <p>
                  <span className="font-medium">Codigo:</span> {plant.plant_code}
                </p>
                <p>
                  <span className="font-medium">Total clones tomados:</span>{' '}
                  {plant.clones_taken_count}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning for high clone count */}
        {showWarning && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta planta madre ya tiene {plant.clones_taken_count} clones. Considere la
              salud de la planta antes de tomar mas esquejes.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad de Clones *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormDescription>Maximo 100 clones por operacion</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cloning Method */}
            <FormField
              control={form.control}
              name="cloningMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metodo de Clonacion *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el metodo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cloningMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Type */}
            <FormField
              control={form.control}
              name="targetType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Destino de los Clones *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2 rounded-lg border border-input p-3 hover:bg-accent">
                        <RadioGroupItem value="new_batch" id="new_batch" />
                        <Label
                          htmlFor="new_batch"
                          className="flex-1 cursor-pointer font-normal"
                        >
                          Crear nuevo lote para los clones
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border border-input p-3 hover:bg-accent">
                        <RadioGroupItem value="existing_batch" id="existing_batch" />
                        <Label
                          htmlFor="existing_batch"
                          className="flex-1 cursor-pointer font-normal"
                        >
                          Agregar a lote existente (mismo cultivar)
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Fields - New Batch */}
            {targetType === 'new_batch' && (
              <>
                <FormField
                  control={form.control}
                  name="newBatchCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codigo del Nuevo Lote *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CLN-260128-001"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Se generara automaticamente si se deja vacio
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="areaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area de Destino *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el area..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {areas?.map((area) => (
                            <SelectItem key={area._id} value={area._id}>
                              {area.name} - {area.current_occupancy} plantas
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Conditional Fields - Existing Batch */}
            {targetType === 'existing_batch' && (
              <>
                <FormField
                  control={form.control}
                  name="existingBatchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lote Existente *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el lote..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {existingBatches
                            ?.filter((b) => b._id !== plant.batch_id) // Exclude mother's batch
                            ?.map((batch) => (
                              <SelectItem key={batch._id} value={batch._id}>
                                {batch.batch_code} - {batch.current_quantity} plantas -{' '}
                                {batch.cultivarName || 'Sin cultivar'}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Solo lotes activos con el mismo cultivar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedBatch && (
                  <Alert variant="info">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      El lote seleccionado tiene actualmente{' '}
                      <strong>{selectedBatch.current_quantity}</strong> plantas.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones sobre el proceso de clonacion..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear Clones
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
