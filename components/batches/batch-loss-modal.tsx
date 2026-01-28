'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
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
import { AlertTriangle, Loader2, Skull, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';

interface Batch {
  _id: Id<'batches'>;
  batch_code: string;
  current_quantity: number;
  unit_of_measure: string;
  cultivarName?: string | null;
  cropTypeName?: string | null;
}

interface BatchLossModalProps {
  batch: Batch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Loss type options mapping
const lossTypeOptions = [
  { value: 'disease', label: 'Enfermedad' },
  { value: 'pest', label: 'Plaga' },
  { value: 'environmental', label: 'Factores Ambientales' },
  { value: 'handling', label: 'Manejo Inadecuado' },
  { value: 'other', label: 'Otro' },
] as const;

export function BatchLossModal({ batch, open, onOpenChange }: BatchLossModalProps) {
  const { userId } = useUser();
  const [remainingQuantity, setRemainingQuantity] = useState(batch.current_quantity);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Form validation schema - dynamically using batch.current_quantity
  const formSchema = z.object({
    quantity: z
      .number({ required_error: 'Cantidad requerida' })
      .min(1, 'Cantidad debe ser mayor a 0')
      .max(batch.current_quantity, `No puede exceder ${batch.current_quantity} ${batch.unit_of_measure}`),
    lossType: z.enum(['disease', 'pest', 'environmental', 'handling', 'other'], {
      required_error: 'Tipo de pérdida requerido',
    }),
    reason: z.string().min(1, 'Razón requerida'),
    notes: z.string().optional(),
    lossDate: z.string().optional(),
    photos: z.array(z.string()).optional(), // Array of file names or data URLs
  });

  type FormValues = z.infer<typeof formSchema>;

  // Record loss mutation
  const recordLossMutation = useMutation(api.batches.recordLoss);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 0,
      lossType: undefined,
      reason: '',
      notes: '',
      lossDate: new Date().toISOString().split('T')[0], // Today in YYYY-MM-DD format
      photos: [],
    },
  });

  // Watch quantity field to calculate remaining
  const watchedQuantity = form.watch('quantity');

  useEffect(() => {
    const quantity = watchedQuantity || 0;
    setRemainingQuantity(batch.current_quantity - quantity);
  }, [watchedQuantity, batch.current_quantity]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        quantity: 0,
        lossType: undefined,
        reason: '',
        notes: '',
        lossDate: new Date().toISOString().split('T')[0],
        photos: [],
      });
      setRemainingQuantity(batch.current_quantity);
      setSelectedFiles([]);
    }
  }, [open, form, batch.current_quantity]);

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
      const detectionDate = values.lossDate
        ? new Date(values.lossDate).getTime()
        : Date.now();

      // Map form values to mutation args
      // Note: backend expects 'reason' (the type) and 'description' (the notes)
      await recordLossMutation({
        batchId: batch._id,
        quantity: values.quantity,
        reason: values.lossType, // This is the loss type/category
        description: values.reason + (values.notes ? `\n${values.notes}` : ''), // Combine reason + notes
        detectionDate,
        recordedBy: userId as Id<'users'>,
      });

      toast.success('Pérdida registrada exitosamente', {
        description: `${values.quantity} ${batch.unit_of_measure} registrados como pérdida`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error recording loss:', error);
      toast.error('Error al registrar pérdida', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      });
    }
  };

  // Check if loss is high (> 50%)
  const isHighLoss = watchedQuantity > batch.current_quantity * 0.5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Skull className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <DialogTitle>Registrar Pérdida de Plantas</DialogTitle>
              <DialogDescription>
                Registrar pérdida parcial o total del lote {batch.batch_code}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Batch Info */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Código:</span>
            <span className="font-medium">{batch.batch_code}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Producto:</span>
            <span className="font-medium">
              {batch.cultivarName || batch.cropTypeName || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cantidad Actual:</span>
            <span className="font-medium">
              {batch.current_quantity} {batch.unit_of_measure}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Quantity Lost */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad Perdida *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                  {watchedQuantity > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Cantidad restante: {remainingQuantity} {batch.unit_of_measure}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* High Loss Warning */}
            {isHighLoss && watchedQuantity > 0 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Advertencia:</strong> Esta pérdida representa más del 50%
                  del lote ({Math.round((watchedQuantity / batch.current_quantity) * 100)}%).
                  Verifica que la cantidad sea correcta.
                </AlertDescription>
              </Alert>
            )}

            {/* Loss Type Selection */}
            <FormField
              control={form.control}
              name="lossType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pérdida *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lossTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason (required) */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe la causa específica de la pérdida..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Notes (optional) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Información complementaria, acciones tomadas, etc..."
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Loss Date */}
            <FormField
              control={form.control}
              name="lossDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Detección (opcional)</FormLabel>
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

            {/* Photo Upload */}
            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fotos (opcional)</FormLabel>
                  <FormDescription>
                    Adjunta fotos que documenten la pérdida
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="loss-photo-upload"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <ImagePlus className="h-4 w-4" />
                          Seleccionar fotos
                        </label>
                        <input
                          id="loss-photo-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              setSelectedFiles((prev) => [...prev, ...files]);
                              const fileNames = [...selectedFiles, ...files].map((f) => f.name);
                              field.onChange(fileNames);
                            }
                          }}
                          disabled={form.formState.isSubmitting}
                        />
                        {selectedFiles.length > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {selectedFiles.length} {selectedFiles.length === 1 ? 'foto' : 'fotos'} seleccionada(s)
                          </span>
                        )}
                      </div>

                      {/* Selected Files Preview */}
                      {selectedFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200"
                            >
                              <ImagePlus className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-700 truncate flex-1">
                                {file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = selectedFiles.filter((_, i) => i !== index);
                                  setSelectedFiles(newFiles);
                                  field.onChange(newFiles.map((f) => f.name));
                                }}
                                className="text-gray-400 hover:text-red-600 flex-shrink-0"
                                disabled={form.formState.isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Las fotos se almacenarán cuando se implemente la integración completa con Convex storage
                      </p>
                    </div>
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
                    Registrando...
                  </>
                ) : (
                  'Registrar Pérdida'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
