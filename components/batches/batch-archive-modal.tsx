'use client';

import { useEffect } from 'react';
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
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArchiveX, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Form validation schema
const formSchema = z.object({
  reason: z.string().min(1, 'Razon requerida'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Batch {
  _id: Id<'batches'>;
  batch_code: string;
  current_quantity: number;
  unit_of_measure: string;
  status: string;
}

interface BatchArchiveModalProps {
  batch: Batch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchArchiveModal({ batch, open, onOpenChange }: BatchArchiveModalProps) {
  // Archive mutation
  const archiveMutation = useMutation(api.batches.archive);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: '',
      notes: '',
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        reason: '',
        notes: '',
      });
    }
  }, [open, form]);

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    try {
      const notesText = values.notes
        ? `Razon: ${values.reason}\n${values.notes}`
        : `Razon: ${values.reason}`;

      await archiveMutation({
        batchId: batch._id,
        notes: notesText,
      });

      toast.success('Lote archivado exitosamente', {
        description: `${batch.batch_code} ha sido archivado`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error archiving batch:', error);
      toast.error('Error al archivar lote', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <ArchiveX className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <DialogTitle>Archivar Lote</DialogTitle>
              <DialogDescription>
                Archivar {batch.batch_code}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Batch Info */}
            <div className="p-3 rounded-lg bg-slate-50 border">
              <p className="text-sm font-medium text-slate-700">Informacion del Lote</p>
              <p className="text-lg font-semibold">{batch.batch_code}</p>
              <div className="flex gap-4 mt-2 text-sm text-slate-600">
                <span>Cantidad: {batch.current_quantity} {batch.unit_of_measure}</span>
                <span>Estado: {batch.status}</span>
              </div>
            </div>

            {/* Warning Alert */}
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Este lote sera archivado y ocultado de las vistas activas. Podras
                consultarlo en el historico.
              </AlertDescription>
            </Alert>

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razon *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="¿Por que archivar este lote?"
                      rows={3}
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
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Notas adicionales..."
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
                variant="destructive"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Archivando...
                  </>
                ) : (
                  <>
                    <ArchiveX className="h-4 w-4 mr-2" />
                    Archivar Lote
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
