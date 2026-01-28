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
import { Merge, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';

// Form validation schema
const formSchema = z.object({
  targetBatchId: z.string().min(1, 'Lote destino requerido'),
  reason: z.string().min(1, 'Razon requerida'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Batch {
  _id: Id<'batches'>;
  batch_code: string;
  area_id: Id<'areas'>;
  facility_id: Id<'facilities'>;
  cultivar_id?: Id<'cultivars'>;
  current_quantity: number;
  current_phase?: string;
  unit_of_measure: string;
  status: string;
}

interface BatchMergeModalProps {
  batch: Batch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchMergeModal({ batch, open, onOpenChange }: BatchMergeModalProps) {
  const { userId } = useUser();
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  // Query compatible batches from the same facility, cultivar, and phase
  const compatibleBatches = useQuery(
    api.batches.list,
    open && batch.facility_id && batch.cultivar_id
      ? {
          companyId: batch.facility_id as any, // We'll filter by facility instead
          facilityId: batch.facility_id,
          cultivarId: batch.cultivar_id,
          status: 'active',
        }
      : 'skip'
  );

  // Filter to only show batches in the same phase and exclude the source batch
  const mergeableBatches = compatibleBatches?.filter(
    (b) =>
      b._id !== batch._id &&
      b.current_phase === batch.current_phase &&
      b.area_id === batch.area_id
  );

  // Get selected target batch details
  const selectedTarget = mergeableBatches?.find(
    (b) => b._id === selectedTargetId
  );

  // Merge mutation
  const mergeMutation = useMutation(api.batches.merge);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetBatchId: '',
      reason: '',
      notes: '',
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        targetBatchId: '',
        reason: '',
        notes: '',
      });
      setSelectedTargetId('');
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
      await mergeMutation({
        primaryBatchId: values.targetBatchId as Id<'batches'>,
        secondaryBatchId: batch._id,
        reason: values.reason,
        performedBy: userId as Id<'users'>,
      });

      const newQuantity = (selectedTarget?.current_quantity || 0) + batch.current_quantity;

      toast.success('Lotes fusionados exitosamente', {
        description: `Nueva cantidad: ${newQuantity} ${batch.unit_of_measure}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error merging batches:', error);
      toast.error('Error al fusionar lotes', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      });
    }
  };

  // Calculate merged quantity info
  const getMergeInfo = () => {
    if (!selectedTarget) return null;

    const currentQuantity = selectedTarget.current_quantity;
    const addedQuantity = batch.current_quantity;
    const newQuantity = currentQuantity + addedQuantity;

    return {
      currentQuantity,
      addedQuantity,
      newQuantity,
    };
  };

  const mergeInfo = getMergeInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Merge className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <DialogTitle>Fusionar Lotes</DialogTitle>
              <DialogDescription>
                Fusionar {batch.batch_code} con otro lote
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Source Batch Info */}
            <div className="p-3 rounded-lg bg-slate-50 border">
              <p className="text-sm font-medium text-slate-700">Lote Origen</p>
              <p className="text-lg font-semibold">{batch.batch_code}</p>
              <div className="flex gap-4 mt-2 text-sm text-slate-600">
                <span>Cantidad: {batch.current_quantity} {batch.unit_of_measure}</span>
                <span>Fase: {batch.current_phase || 'N/A'}</span>
              </div>
            </div>

            {/* Target Batch Selection */}
            <FormField
              control={form.control}
              name="targetBatchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lote Destino *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedTargetId(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar lote destino..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mergeableBatches && mergeableBatches.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No hay lotes compatibles disponibles
                        </div>
                      )}
                      {mergeableBatches?.map((targetBatch) => (
                        <SelectItem
                          key={targetBatch._id}
                          value={targetBatch._id}
                        >
                          {targetBatch.batch_code} - {targetBatch.current_quantity}{' '}
                          {targetBatch.unit_of_measure}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Batch Details & Calculation */}
            {mergeInfo && (
              <Alert variant="info">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Cantidad resultante:</p>
                    <p className="text-sm">
                      {mergeInfo.currentQuantity} + {mergeInfo.addedQuantity} ={' '}
                      <strong>{mergeInfo.newQuantity} {batch.unit_of_measure}</strong>
                    </p>
                  </div>
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
                      <SelectItem value="space_optimization">
                        Optimizacion de espacio
                      </SelectItem>
                      <SelectItem value="batch_consolidation">
                        Consolidacion de lotes
                      </SelectItem>
                      <SelectItem value="genetic_uniformity">
                        Uniformidad genetica
                      </SelectItem>
                      <SelectItem value="operational_efficiency">
                        Eficiencia operacional
                      </SelectItem>
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
                      placeholder="Notas adicionales sobre la fusion..."
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
                    Fusionando...
                  </>
                ) : (
                  'Fusionar Lotes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
