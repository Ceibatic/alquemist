'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from 'convex/react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Minus,
  RotateCcw,
  Trash2,
  ArrowRightLeft,
  Undo2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    _id: string;
    product_id: string;
    productName?: string;
    quantity_available: number;
    quantity_unit: string;
    area_id: string;
    reorder_point?: number;
    batch_number?: string;
  };
  facilityId: string;
}

const movementSchema = z.object({
  movement_type: z.enum(['consumption', 'correction', 'waste', 'transfer', 'return'], {
    required_error: 'Debes seleccionar un tipo de movimiento',
  }),
  quantity: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  new_quantity: z.number().min(0).optional(),
  destination_area_id: z.string().optional(),
  reason: z.string().min(10, 'La razón debe tener al menos 10 caracteres'),
  notes: z.string().max(1000).optional(),
});

type MovementInput = z.infer<typeof movementSchema>;

const MOVEMENT_TYPES = [
  {
    value: 'consumption',
    label: 'Consumo',
    icon: Minus,
    description: 'Uso en producción',
    color: 'text-blue-600',
    bgColor: 'peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50'
  },
  {
    value: 'waste',
    label: 'Desperdicio',
    icon: Trash2,
    description: 'Pérdida o daño',
    color: 'text-red-600',
    bgColor: 'peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-50'
  },
  {
    value: 'correction',
    label: 'Corrección',
    icon: RotateCcw,
    description: 'Ajuste de conteo',
    color: 'text-amber-600',
    bgColor: 'peer-data-[state=checked]:border-amber-600 peer-data-[state=checked]:bg-amber-50'
  },
  {
    value: 'transfer',
    label: 'Transferir',
    icon: ArrowRightLeft,
    description: 'Mover a otra área',
    color: 'text-purple-600',
    bgColor: 'peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50'
  },
  {
    value: 'return',
    label: 'Devolución',
    icon: Undo2,
    description: 'Devolver a proveedor',
    color: 'text-orange-600',
    bgColor: 'peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50'
  },
];

const REASONS = {
  consumption: [
    { value: 'Uso en producción', label: 'Uso en producción' },
    { value: 'Aplicación a cultivo', label: 'Aplicación a cultivo' },
    { value: 'Preparación de mezcla', label: 'Preparación de mezcla' },
    { value: 'Muestra', label: 'Muestra' },
    { value: 'Otro', label: 'Otro' },
  ],
  waste: [
    { value: 'Producto vencido', label: 'Producto vencido' },
    { value: 'Daño físico', label: 'Daño físico' },
    { value: 'Contaminación', label: 'Contaminación' },
    { value: 'Pérdida por derrame', label: 'Pérdida por derrame' },
    { value: 'Plagas o enfermedades', label: 'Plagas o enfermedades' },
    { value: 'Otro', label: 'Otro' },
  ],
  correction: [
    { value: 'Corrección de inventario físico', label: 'Corrección de inventario físico' },
    { value: 'Error de registro anterior', label: 'Error de registro anterior' },
    { value: 'Reconciliación de inventario', label: 'Reconciliación de inventario' },
    { value: 'Otro', label: 'Otro' },
  ],
  transfer: [
    { value: 'Reorganización de almacén', label: 'Reorganización de almacén' },
    { value: 'Optimización de espacio', label: 'Optimización de espacio' },
    { value: 'Cambio de condiciones de almacenamiento', label: 'Cambio de condiciones' },
    { value: 'Otro', label: 'Otro' },
  ],
  return: [
    { value: 'Producto defectuoso', label: 'Producto defectuoso' },
    { value: 'Error de pedido', label: 'Error de pedido' },
    { value: 'Exceso de inventario', label: 'Exceso de inventario' },
    { value: 'Producto no cumple especificaciones', label: 'No cumple especificaciones' },
    { value: 'Otro', label: 'Otro' },
  ],
};

// Error message mapping for user-friendly feedback
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Map backend errors to user-friendly Spanish messages
    if (message.includes('insufficient stock') || message.includes('insuficiente')) {
      return 'Stock insuficiente para realizar esta operación';
    }
    if (message.includes('not found') || message.includes('no existe') || message.includes('does not exist')) {
      return 'El item de inventario no fue encontrado';
    }
    if (message.includes('unauthorized') || message.includes('access denied') || message.includes('permission')) {
      return 'No tienes permiso para realizar esta operación';
    }
    if (message.includes('invalid') && message.includes('quantity')) {
      return 'La cantidad ingresada es inválida. Verifica el valor';
    }
    if (message.includes('invalid') && message.includes('area')) {
      return 'El área seleccionada no es válida';
    }
    if (message.includes('invalid')) {
      return 'Datos inválidos. Verifica los campos e intenta nuevamente';
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente';
    }
    if (message.includes('duplicate')) {
      return 'Ya existe un registro similar. Verifica los datos';
    }

    // Return original message if it's already user-friendly
    return error.message;
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente';
};

export function InventoryMovementModal({
  open,
  onOpenChange,
  item,
  facilityId,
}: InventoryMovementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useUser();
  const logInventoryMovement = useMutation(api.activities.logInventoryMovement);

  // Get areas for transfers
  const areas = useQuery(api.areas.getByFacility, { facilityId: facilityId as any });
  const otherAreas = areas?.filter((a: { _id: string }) => a._id !== item.area_id) || [];

  const form = useForm<MovementInput>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      movement_type: 'consumption',
      quantity: 0,
      new_quantity: undefined,
      destination_area_id: '',
      reason: 'Uso en producción',
      notes: '',
    },
  });

  const movementType = form.watch('movement_type');
  const quantity = form.watch('quantity');
  const newQuantity = form.watch('new_quantity');
  const reason = form.watch('reason');

  // Calculate new stock based on movement type
  const calculatedNewStock = useMemo(() => {
    const current = item.quantity_available;

    if (movementType === 'correction') {
      return newQuantity ?? current;
    } else {
      return Math.max(0, current - (quantity || 0));
    }
  }, [item.quantity_available, movementType, quantity, newQuantity]);

  // Get available reasons based on movement type
  const availableReasons = useMemo(() => {
    return REASONS[movementType as keyof typeof REASONS] || [];
  }, [movementType]);

  // Reset form values when movement type changes
  const handleMovementTypeChange = (value: string) => {
    form.setValue('movement_type', value as any);
    form.setValue('quantity', 0);
    form.setValue('new_quantity', undefined);
    form.setValue('destination_area_id', '');
    const firstReason = REASONS[value as keyof typeof REASONS]?.[0]?.value;
    if (firstReason) {
      form.setValue('reason', firstReason);
    }
  };

  // Real-time validation for stock availability
  useEffect(() => {
    if (['consumption', 'waste', 'transfer', 'return'].includes(movementType)) {
      if (quantity > item.quantity_available && quantity > 0) {
        form.setError('quantity', {
          type: 'manual',
          message: `Stock insuficiente. Disponible: ${item.quantity_available}`,
        });
      } else {
        form.clearErrors('quantity');
      }
    }
  }, [quantity, movementType, item.quantity_available, form]);

  const handleSubmit = async (data: MovementInput) => {
    if (!userId) {
      toast.error('Debe estar autenticado para registrar movimientos');
      return;
    }

    // Validate sufficient stock for deduction movements
    if (['consumption', 'waste', 'transfer', 'return'].includes(data.movement_type)) {
      if (data.quantity > item.quantity_available) {
        form.setError('quantity', {
          type: 'manual',
          message: `Stock insuficiente. Disponible: ${item.quantity_available}`,
        });
        toast.error(`Stock insuficiente. Disponible: ${item.quantity_available}`);
        return;
      }
    }

    // Validate quantity > 0
    if (data.movement_type !== 'correction' && data.quantity <= 0) {
      form.setError('quantity', {
        type: 'manual',
        message: 'La cantidad debe ser mayor a 0',
      });
      return;
    }

    // Validate destination for transfer
    if (data.movement_type === 'transfer' && !data.destination_area_id) {
      toast.error('Debes seleccionar un área de destino');
      return;
    }

    // Validate reason minimum length
    if (data.reason.length < 10) {
      form.setError('reason', {
        type: 'manual',
        message: 'La razón debe tener al menos 10 caracteres',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await logInventoryMovement({
        movement_type: data.movement_type as any,
        product_id: item.product_id as any,
        inventory_item_id: item._id as any,
        quantity: data.movement_type === 'correction'
          ? (data.new_quantity ?? data.quantity)
          : data.quantity,
        quantity_unit: item.quantity_unit,
        area_id: item.area_id as any,
        facility_id: facilityId as any,
        destination_area_id: data.destination_area_id
          ? (data.destination_area_id as any)
          : undefined,
        new_quantity: data.movement_type === 'correction'
          ? (data.new_quantity ?? data.quantity)
          : undefined,
        reason: data.reason,
        notes: data.notes,
        performed_by: userId,
        lot_selection_mode: 'specific',
      });

      const typeLabels: Record<string, string> = {
        consumption: 'Consumo',
        waste: 'Desperdicio',
        correction: 'Corrección',
        transfer: 'Transferencia',
        return: 'Devolución',
      };

      toast.success(`${typeLabels[data.movement_type]} registrado exitosamente`);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error registering movement:', error);
      const userMessage = getErrorMessage(error);
      toast.error(userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento: {item.productName || 'Item'}</DialogTitle>
          <DialogDescription>
            Registra un movimiento de inventario para este lote
            {item.batch_number && (
              <span className="ml-1 font-medium">({item.batch_number})</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Current Stock Display */}
        <div className="rounded-lg border bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Stock Actual:</span>
            <span className="text-2xl font-bold text-blue-600">
              {item.quantity_available} {item.quantity_unit}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Movement Type */}
            <FormField
              control={form.control}
              name="movement_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Movimiento</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={handleMovementTypeChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                    >
                      {MOVEMENT_TYPES.map((type) => {
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
                                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-200 p-3 hover:bg-gray-50',
                                type.bgColor
                              )}
                            >
                              <Icon className={cn('mb-1 h-5 w-5', type.color)} />
                              <span className="text-sm font-medium">{type.label}</span>
                              <span className="text-xs text-gray-500">{type.description}</span>
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

            {/* Quantity or New Quantity for Correction */}
            {movementType === 'correction' ? (
              <FormField
                control={form.control}
                name="new_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Cantidad Total *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Cantidad correcta después del conteo físico
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cantidad a {movementType === 'transfer' ? 'Transferir' :
                        movementType === 'return' ? 'Devolver' :
                        movementType === 'waste' ? 'Dar de Baja' : 'Consumir'} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        max={item.quantity_available}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Máximo disponible: {item.quantity_available} {item.quantity_unit}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Destination Area for Transfers */}
            {movementType === 'transfer' && (
              <FormField
                control={form.control}
                name="destination_area_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área de Destino *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar área destino..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {otherAreas.map((area: { _id: string; name: string }) => (
                          <SelectItem key={area._id} value={area._id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                      placeholder="Notas adicionales sobre este movimiento..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning for consuming all stock */}
            {['consumption', 'waste', 'transfer'].includes(movementType) &&
              quantity === item.quantity_available &&
              quantity > 0 && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Vas a {movementType === 'consumption' ? 'consumir' : movementType === 'waste' ? 'dar de baja' : 'transferir'} todo el stock disponible de este item. ¿Estás seguro?
                  </AlertDescription>
                </Alert>
              )}

            {/* New Stock Preview */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Nuevo Stock:</span>
                <span
                  className={cn(
                    'text-2xl font-bold',
                    calculatedNewStock < (item.reorder_point || 0)
                      ? 'text-red-600'
                      : calculatedNewStock > item.quantity_available
                      ? 'text-green-600'
                      : 'text-gray-900'
                  )}
                >
                  {calculatedNewStock} {item.quantity_unit}
                </span>
              </div>
              {calculatedNewStock < (item.reorder_point || 0) && (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  El nuevo stock estará por debajo del punto de reorden
                </div>
              )}
              {movementType === 'correction' && (
                <div className="mt-2 text-xs text-gray-500">
                  Cambio: {(calculatedNewStock - item.quantity_available) >= 0 ? '+' : ''}
                  {calculatedNewStock - item.quantity_available} {item.quantity_unit}
                </div>
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
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Movimiento
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
