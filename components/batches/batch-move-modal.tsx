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
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertCircle, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';

// Form validation schema
const formSchema = z.object({
  targetAreaId: z.string().min(1, 'Area destino requerida'),
  reason: z.string().min(1, 'Razon requerida'),
  notes: z.string().optional(),
  movementDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Batch {
  _id: Id<'batches'>;
  batch_code: string;
  area_id: Id<'areas'>;
  facility_id: Id<'facilities'>;
  current_quantity: number;
  unit_of_measure: string;
}

interface BatchMoveModalProps {
  batch: Batch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchMoveModal({ batch, open, onOpenChange }: BatchMoveModalProps) {
  const { userId } = useUser();
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');

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

  // Get selected area details for capacity check
  const selectedArea = useQuery(
    api.areas.getById,
    selectedAreaId ? { areaId: selectedAreaId as Id<'areas'> } : 'skip'
  );

  // Move mutation
  const moveMutation = useMutation(api.batches.move);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetAreaId: '',
      reason: '',
      notes: '',
      movementDate: new Date().toISOString().split('T')[0], // Today in YYYY-MM-DD format
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        targetAreaId: '',
        reason: '',
        notes: '',
        movementDate: new Date().toISOString().split('T')[0],
      });
      setSelectedAreaId('');
    }
  }, [open, form]);

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast.error('Error', {
        description: 'Usuario no autenticado',
      });
      return;
    }

    try {
      // Convert date string to timestamp if provided
      const movementDate = values.movementDate
        ? new Date(values.movementDate).getTime()
        : Date.now();

      await moveMutation({
        batchId: batch._id,
        targetAreaId: values.targetAreaId as Id<'areas'>,
        reason: values.reason,
        notes: values.notes,
        performedBy: userId as Id<'users'>,
      });

      toast.success('Lote movido exitosamente', {
        description: `${batch.batch_code} movido a nueva area`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error moving batch:', error);
      toast.error('Error al mover lote', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      });
    }
  };

  // Calculate capacity info for selected area
  const getCapacityInfo = () => {
    if (!selectedArea) return null;

    const config = selectedArea.capacity_configurations as any;
    const maxCapacity = config?.max_capacity || 0;
    const currentOccupancy = selectedArea.current_occupancy || 0;
    const availableCapacity = maxCapacity - currentOccupancy;

    return {
      maxCapacity,
      currentOccupancy,
      availableCapacity,
      isOverCapacity: batch.current_quantity > availableCapacity,
    };
  };

  const capacityInfo = getCapacityInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <MapPin className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <DialogTitle>Mover Lote</DialogTitle>
              <DialogDescription>
                Mover {batch.batch_code} a otra area
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Target Area Selection */}
            <FormField
              control={form.control}
              name="targetAreaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area Destino *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedAreaId(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar area..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas?.map((area) => {
                        const config = area.capacity_configurations as any;
                        const maxCapacity = config?.max_capacity || 0;
                        const currentOccupancy = area.current_occupancy || 0;
                        const isCurrentArea = area._id === batch.area_id;

                        return (
                          <SelectItem
                            key={area._id}
                            value={area._id}
                            disabled={isCurrentArea}
                          >
                            {area.name} ({area.area_type})
                            {maxCapacity > 0 &&
                              ` - ${currentOccupancy}/${maxCapacity} plantas`}
                            {isCurrentArea && ' (actual)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity Info Alert */}
            {capacityInfo && (
              <Alert variant={capacityInfo.isOverCapacity ? 'warning' : 'info'}>
                {capacityInfo.isOverCapacity ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                <AlertDescription>
                  {capacityInfo.isOverCapacity ? (
                    <>
                      <strong>Advertencia:</strong> El lote tiene{' '}
                      {batch.current_quantity} {batch.unit_of_measure} pero el area
                      solo tiene {capacityInfo.availableCapacity} espacios
                      disponibles.
                    </>
                  ) : (
                    <>
                      Capacidad disponible: {capacityInfo.availableCapacity}/
                      {capacityInfo.maxCapacity} {batch.unit_of_measure}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Reason Selection */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razon *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar razon..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="phase_progression">
                        Progreso de fase
                      </SelectItem>
                      <SelectItem value="space_optimization">
                        Optimizacion de espacio
                      </SelectItem>
                      <SelectItem value="better_conditions">
                        Mejores condiciones
                      </SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Notas adicionales sobre el movimiento..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Movement Date */}
            <FormField
              control={form.control}
              name="movementDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Movimiento (opcional)</FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      {...field}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Moviendo...
                  </>
                ) : (
                  'Mover'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
