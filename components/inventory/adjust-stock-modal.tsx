'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Minus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdjustStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
}

const adjustStockSchema = z.object({
  adjustmentType: z.enum(['addition', 'consumption', 'correction'], {
    required_error: 'Debes seleccionar un tipo de ajuste',
  }),
  quantity: z
    .number()
    .positive('La cantidad debe ser mayor a 0')
    .or(z.number().min(0).max(0)), // Allow 0 for corrections
  reason: z.enum(
    ['purchase', 'usage', 'waste', 'transfer', 'correction', 'other'],
    {
      required_error: 'Debes seleccionar una razón',
    }
  ),
  notes: z.string().max(1000).optional(),
});

type AdjustStockInput = z.infer<typeof adjustStockSchema>;

const ADJUSTMENT_TYPES = [
  { value: 'addition', label: 'Entrada (+)', icon: Plus },
  { value: 'consumption', label: 'Salida (-)', icon: Minus },
  { value: 'correction', label: 'Corrección', icon: RotateCcw },
];

const REASONS = {
  addition: [
    { value: 'purchase', label: 'Compra' },
    { value: 'transfer', label: 'Transferencia entrada' },
    { value: 'correction', label: 'Corrección' },
    { value: 'other', label: 'Otro' },
  ],
  consumption: [
    { value: 'usage', label: 'Uso en producción' },
    { value: 'waste', label: 'Desperdicio' },
    { value: 'transfer', label: 'Transferencia salida' },
    { value: 'correction', label: 'Corrección' },
    { value: 'other', label: 'Otro' },
  ],
  correction: [
    { value: 'correction', label: 'Corrección de inventario' },
    { value: 'other', label: 'Otro' },
  ],
};

export function AdjustStockModal({
  open,
  onOpenChange,
  item,
}: AdjustStockModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useUser();
  const adjustStock = useMutation(api.inventory.adjustStock);

  const form = useForm<AdjustStockInput>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      adjustmentType: 'consumption',
      quantity: 0,
      reason: 'usage',
      notes: '',
    },
  });

  const adjustmentType = form.watch('adjustmentType');
  const quantity = form.watch('quantity');

  // Calculate new stock based on adjustment type
  const newStock = useMemo(() => {
    const current = item?.quantity_available || 0;

    if (adjustmentType === 'addition') {
      return current + (quantity || 0);
    } else if (adjustmentType === 'consumption') {
      return Math.max(0, current - (quantity || 0));
    } else if (adjustmentType === 'correction') {
      return quantity || 0;
    }

    return current;
  }, [item, adjustmentType, quantity]);

  // Get available reasons based on adjustment type
  const availableReasons = useMemo(() => {
    return REASONS[adjustmentType] || [];
  }, [adjustmentType]);

  // Reset reason when adjustment type changes
  const handleAdjustmentTypeChange = (value: string) => {
    form.setValue('adjustmentType', value as any);
    const firstReason = REASONS[value as keyof typeof REASONS]?.[0]?.value;
    if (firstReason) {
      form.setValue('reason', firstReason as any);
    }
  };

  const handleSubmit = async (data: AdjustStockInput) => {
    if (!userId) {
      toast.error('Debe estar autenticado para ajustar el stock');
      return;
    }

    setIsSubmitting(true);

    // Map reason enum to readable string
    const reasonLabels: Record<string, string> = {
      purchase: 'Compra',
      usage: 'Uso en producción',
      waste: 'Desperdicio',
      transfer: 'Transferencia',
      correction: 'Corrección de inventario',
      other: 'Otro',
    };

    try {
      await adjustStock({
        inventoryId: item._id,
        adjustmentType: data.adjustmentType,
        quantity: data.quantity,
        reason: reasonLabels[data.reason] || data.reason,
        notes: data.notes,
        userId: userId,
      });

      toast.success('Stock ajustado exitosamente');
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast.error(error.message || 'Error al ajustar el stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Stock: {item?.productName || 'Item'}</DialogTitle>
          <DialogDescription>
            Registra un movimiento de inventario para este item
          </DialogDescription>
        </DialogHeader>

        {/* Current Stock Display */}
        <div className="rounded-lg border bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Stock Actual:
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {item?.quantity_available || 0} {item?.quantity_unit || ''}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Adjustment Type */}
            <FormField
              control={form.control}
              name="adjustmentType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Ajuste</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={handleAdjustmentTypeChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-3"
                    >
                      {ADJUSTMENT_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <FormItem key={type.value}>
                            <FormControl>
                              <RadioGroupItem
                                value={type.value}
                                id={type.value}
                                className="peer sr-only"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor={type.value}
                              className={cn(
                                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-200 p-4 hover:bg-gray-50',
                                'peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50'
                              )}
                            >
                              <Icon className="mb-2 h-6 w-6" />
                              <span className="text-sm font-medium">
                                {type.label}
                              </span>
                            </FormLabel>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {adjustmentType === 'correction'
                      ? 'Nueva Cantidad *'
                      : 'Cantidad *'}
                  </FormLabel>
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
                  <FormDescription>
                    {adjustmentType === 'correction'
                      ? 'Cantidad total correcta en inventario'
                      : `Cantidad a ${
                          adjustmentType === 'addition' ? 'agregar' : 'consumir'
                        }`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una razón" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableReasons.map((reason) => (
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

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre este ajuste..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Stock Preview */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Nuevo Stock:
                </span>
                <span
                  className={cn(
                    'text-2xl font-bold',
                    newStock < (item?.reorder_point || 0)
                      ? 'text-red-600'
                      : newStock > item?.quantity_available
                      ? 'text-green-600'
                      : 'text-gray-900'
                  )}
                >
                  {newStock} {item?.quantity_unit || ''}
                </span>
              </div>
              {adjustmentType === 'consumption' &&
                newStock < (item?.reorder_point || 0) && (
                  <p className="mt-2 text-xs text-red-600">
                    El nuevo stock estará por debajo del punto de reorden
                  </p>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar Ajuste
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
