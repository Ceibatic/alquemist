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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertCircle, Info, Loader2, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';

// Form validation schema
const formSchema = z
  .object({
    moveType: z.enum(['same_area', 'other_area', 'other_batch'], {
      required_error: 'Tipo de movimiento requerido',
    }),
    targetAreaId: z.string().optional(),
    targetBatchId: z.string().optional(),
    position: z.string().optional(),
    reason: z.string().min(1, 'Razon requerida'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.moveType === 'other_area' && !data.targetAreaId) return false;
      if (data.moveType === 'other_batch' && !data.targetBatchId) return false;
      return true;
    },
    {
      message: 'Debe seleccionar un destino',
      path: ['targetAreaId'],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface PlantMoveModalProps {
  plant: {
    _id: Id<'plants'>;
    plant_code: string;
    batch_id: Id<'batches'>;
    area_id: Id<'areas'>;
    position?: string | {};
    cultivar_id?: Id<'cultivars'>;
    facility_id: Id<'facilities'>;
    [key: string]: any; // Allow additional enriched fields
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlantMoveModal({ plant, open, onOpenChange }: PlantMoveModalProps) {
  const { userId } = useUser();
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');

  // Query areas from the same facility
  const areas = useQuery(
    api.areas.list,
    open && plant.facility_id
      ? {
          facilityId: plant.facility_id,
          status: 'active',
        }
      : 'skip'
  );

  // Query batches with same cultivar for batch transfer
  const compatibleBatches = useQuery(
    api.batches.list,
    open && plant.cultivar_id
      ? {
          companyId: plant.facility_id as unknown as Id<'companies'>, // Will be filtered by cultivar
          cultivarId: plant.cultivar_id,
          status: 'active',
        }
      : 'skip'
  );

  // Get current area details
  const currentArea = useQuery(
    api.areas.getById,
    plant.area_id ? { areaId: plant.area_id } : 'skip'
  );

  // Get current batch details
  const currentBatch = useQuery(
    api.batches.getById,
    plant.batch_id ? { batchId: plant.batch_id } : 'skip'
  );

  // Move mutation
  const moveMutation = useMutation(api.plants.move);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moveType: 'same_area',
      targetAreaId: '',
      targetBatchId: '',
      position: (typeof plant.position === 'string' ? plant.position : '') || '',
      reason: '',
      notes: '',
    },
  });

  const moveType = form.watch('moveType');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        moveType: 'same_area',
        targetAreaId: '',
        targetBatchId: '',
        position: (typeof plant.position === 'string' ? plant.position : '') || '',
        reason: '',
        notes: '',
      });
      setSelectedAreaId('');
    }
  }, [open, form, plant.position]);

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast.error('Error', {
        description: 'Usuario no autenticado',
      });
      return;
    }

    try {
      const moveArgs: {
        plantId: Id<'plants'>;
        targetAreaId?: Id<'areas'>;
        targetBatchId?: Id<'batches'>;
        position?: { row: number; column: number };
        reason?: string;
        performedBy: Id<'users'>;
      } = {
        plantId: plant._id,
        reason: values.reason + (values.notes ? `\n${values.notes}` : ''),
        performedBy: userId as Id<'users'>,
      };

      // Parse position if provided
      if (values.position && values.position.trim()) {
        // Simple position format: "R1C2" or "1-2"
        const posMatch = values.position.match(/[Rr]?(\d+)[Cc-](\d+)/);
        if (posMatch) {
          moveArgs.position = {
            row: parseInt(posMatch[1]),
            column: parseInt(posMatch[2]),
          };
        }
      }

      if (values.moveType === 'other_area' && values.targetAreaId) {
        moveArgs.targetAreaId = values.targetAreaId as Id<'areas'>;
      } else if (values.moveType === 'other_batch' && values.targetBatchId) {
        moveArgs.targetBatchId = values.targetBatchId as Id<'batches'>;
      }

      await moveMutation(moveArgs);

      let successMessage = 'Planta movida exitosamente';
      if (values.moveType === 'same_area') {
        successMessage = `${plant.plant_code} reposicionada en ${currentArea?.name || 'area actual'}`;
      } else if (values.moveType === 'other_area') {
        const targetArea = areas?.find((a) => a._id === values.targetAreaId);
        successMessage = `${plant.plant_code} movida a ${targetArea?.name || 'nueva area'}`;
      } else if (values.moveType === 'other_batch') {
        const targetBatch = compatibleBatches?.find((b) => b._id === values.targetBatchId);
        successMessage = `${plant.plant_code} transferida a lote ${targetBatch?.batch_code || 'nuevo'}`;
      }

      toast.success('Movimiento exitoso', {
        description: successMessage,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error moving plant:', error);
      toast.error('Error al mover planta', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <MapPin className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <DialogTitle>Mover Planta</DialogTitle>
              <DialogDescription>
                Mover {plant.plant_code} a nueva ubicacion
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Location Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Ubicacion actual:</strong>{' '}
                {currentArea?.name || 'Cargando...'} - Lote {currentBatch?.batch_code || ''}
                {plant.position && ` - Posicion: ${plant.position}`}
              </AlertDescription>
            </Alert>

            {/* Move Type Selection */}
            <FormField
              control={form.control}
              name="moveType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Movimiento *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-3 space-y-0 border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="same_area" id="same_area" />
                        <Label htmlFor="same_area" className="flex-1 cursor-pointer font-normal">
                          <div className="font-medium">Misma area</div>
                          <div className="text-sm text-muted-foreground">
                            Cambiar solo la posicion dentro del area actual
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 space-y-0 border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="other_area" id="other_area" />
                        <Label htmlFor="other_area" className="flex-1 cursor-pointer font-normal">
                          <div className="font-medium">Otra area</div>
                          <div className="text-sm text-muted-foreground">
                            Mover a un area diferente en el mismo lote
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 space-y-0 border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="other_batch" id="other_batch" />
                        <Label htmlFor="other_batch" className="flex-1 cursor-pointer font-normal">
                          <div className="font-medium">Otro lote</div>
                          <div className="text-sm text-muted-foreground">
                            Transferir a un lote diferente (mismo cultivar)
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Area Selection (for other_area) */}
            {moveType === 'other_area' && (
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
                          const isCurrentArea = area._id === plant.area_id;

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
            )}

            {/* Target Batch Selection (for other_batch) */}
            {moveType === 'other_batch' && (
              <FormField
                control={form.control}
                name="targetBatchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote Destino *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar lote..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {compatibleBatches
                          ?.filter((batch) => batch._id !== plant.batch_id)
                          .map((batch) => (
                            <SelectItem key={batch._id} value={batch._id}>
                              {batch.batch_code} - {batch.areaName || 'Sin area'} (
                              {batch.current_quantity} plantas)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Solo se muestran lotes activos con el mismo cultivar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Position Input */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posicion (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: R1C5 o 1-5"
                    />
                  </FormControl>
                  <FormDescription>
                    Formato: R[fila]C[columna] o [fila]-[columna]
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectItem value="phase_progression">Progreso de fase</SelectItem>
                      <SelectItem value="space_optimization">Optimizacion de espacio</SelectItem>
                      <SelectItem value="better_conditions">Mejores condiciones</SelectItem>
                      <SelectItem value="health_isolation">Aislamiento sanitario</SelectItem>
                      <SelectItem value="quality_selection">Seleccion por calidad</SelectItem>
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
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Mover Planta
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
