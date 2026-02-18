'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface InventoryAdjustSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItemId: Id<'inventory_items'> | null;
}

const ADJUSTMENT_TYPES = [
  {
    value: 'adjustment',
    label: 'Ajuste',
    description: 'Correccion de conteo fisico',
    icon: RotateCcw,
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    direction: 'both' as const,
  },
  {
    value: 'waste',
    label: 'Merma',
    description: 'Producto perdido, danado o vencido',
    icon: Trash2,
    color: 'border-red-200 bg-red-50 text-red-700',
    direction: 'negative' as const,
  },
  {
    value: 'correction',
    label: 'Correccion',
    description: 'Error de registro previo',
    icon: AlertTriangle,
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    direction: 'both' as const,
  },
];

type AdjustmentType = 'adjustment' | 'waste' | 'correction';

export function InventoryAdjustSheet({
  open,
  onOpenChange,
  inventoryItemId,
}: InventoryAdjustSheetProps) {
  const { userId } = useUser();
  const [step, setStep] = useState(1);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const item = useQuery(
    api.inventory.getById,
    inventoryItemId ? { inventoryId: inventoryItemId } : 'skip'
  );

  const logMovement = useMutation(api.activities.logInventoryMovement);

  const currentQuantity = item?.quantity_available ?? 0;

  const resultQuantity = useMemo(() => {
    if (!adjustmentType) return currentQuantity;
    if (adjustmentType === 'waste') {
      return currentQuantity - Math.abs(quantity);
    }
    // adjustment and correction: user enters the delta (positive or negative)
    return currentQuantity + quantity;
  }, [adjustmentType, quantity, currentQuantity]);

  const quantityChange = resultQuantity - currentQuantity;

  const isStep2Valid = useMemo(() => {
    if (quantity === 0) return false;
    if (adjustmentType === 'waste' && quantity <= 0) return false;
    if (resultQuantity < 0) return false;
    if (reason.trim().length < 10) return false;
    return true;
  }, [quantity, adjustmentType, resultQuantity, reason]);

  const reset = () => {
    setStep(1);
    setAdjustmentType(null);
    setQuantity(0);
    setReason('');
    setNotes('');
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!userId || !inventoryItemId || !adjustmentType || !item?.facilityId) return;

    setIsSubmitting(true);
    try {
      // Map UI types to logInventoryMovement movement_type
      const movementType: 'correction' | 'waste' =
        adjustmentType === 'waste' ? 'waste' : 'correction';

      await logMovement({
        movement_type: movementType,
        product_id: item.product_id,
        inventory_item_id: inventoryItemId,
        quantity: Math.abs(quantityChange),
        ...(movementType === 'correction' ? { new_quantity: resultQuantity } : {}),
        quantity_unit: item.quantity_unit,
        area_id: item.area_id,
        facility_id: item.facilityId,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        performed_by: userId,
      });

      toast.success('Ajuste registrado', {
        description: `${item?.productName}: ${currentQuantity} → ${resultQuantity} ${item?.quantity_unit || ''}`,
      });
      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al registrar el ajuste'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Ajustar Inventario</SheetTitle>
          <SheetDescription>
            {item?.productName || 'Cargando...'}{' '}
            {item?.batch_number ? `· Lote ${item.batch_number}` : ''}
          </SheetDescription>
        </SheetHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 my-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium shrink-0',
                  s < step
                    ? 'bg-green-100 text-green-700'
                    : s === step
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                )}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    s < step ? 'bg-green-200' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Type selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Tipo de movimiento
            </h3>
            <div className="space-y-3">
              {ADJUSTMENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = adjustmentType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setAdjustmentType(type.value as AdjustmentType);
                      setQuantity(0);
                    }}
                    className={cn(
                      'w-full flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors',
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        type.color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{type.label}</p>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!adjustmentType}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Quantity and reason */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Current stock */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Cantidad actual
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {currentQuantity} {item?.quantity_unit || ''}
                </span>
              </div>
            </div>

            {/* Quantity input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {adjustmentType === 'waste'
                  ? 'Cantidad perdida'
                  : 'Cantidad de ajuste'}
              </label>
              <Input
                type="number"
                step="0.01"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                placeholder={
                  adjustmentType === 'waste'
                    ? 'Ej: 5 (siempre resta)'
                    : 'Positivo para sumar, negativo para restar'
                }
                min={adjustmentType === 'waste' ? 0.01 : undefined}
              />
              {adjustmentType === 'waste' && (
                <p className="text-xs text-gray-500">
                  Se restara del inventario actual
                </p>
              )}
            </div>

            {/* Result preview */}
            {quantity !== 0 && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Resultado</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {currentQuantity}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span
                      className={cn(
                        'text-lg font-bold',
                        resultQuantity < 0
                          ? 'text-red-600'
                          : quantityChange > 0
                            ? 'text-green-600'
                            : quantityChange < 0
                              ? 'text-red-600'
                              : 'text-gray-900'
                      )}
                    >
                      {resultQuantity} {item?.quantity_unit || ''}
                    </span>
                  </div>
                </div>
                {resultQuantity < 0 && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    La cantidad resultante no puede ser negativa
                  </p>
                )}
                {quantityChange !== 0 && resultQuantity >= 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Diferencia: {quantityChange > 0 ? '+' : ''}
                    {quantityChange} {item?.quantity_unit || ''}
                  </p>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Razon del ajuste *
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe el motivo del ajuste (minimo 10 caracteres)"
                rows={3}
                className="resize-none"
              />
              {reason.length > 0 && reason.length < 10 && (
                <p className="text-xs text-red-500">
                  Minimo 10 caracteres ({reason.length}/10)
                </p>
              )}
            </div>

            {/* Notes (optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Notas adicionales
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas opcionales..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atras
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!isStep2Valid}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-lg border bg-gray-50 p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Resumen del ajuste
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Producto</span>
                  <span className="font-medium text-gray-900">
                    {item?.productName}
                  </span>
                </div>

                {item?.batch_number && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Lote</span>
                    <span className="font-mono text-gray-900">
                      {item.batch_number}
                    </span>
                  </div>
                )}

                {item?.areaName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Area</span>
                    <span className="text-gray-900">{item.areaName}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo</span>
                  <Badge
                    variant="outline"
                    className={
                      ADJUSTMENT_TYPES.find((t) => t.value === adjustmentType)
                        ?.color || ''
                    }
                  >
                    {ADJUSTMENT_TYPES.find((t) => t.value === adjustmentType)
                      ?.label}
                  </Badge>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Cantidad</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {currentQuantity}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span
                        className={cn(
                          'text-lg font-bold',
                          quantityChange > 0
                            ? 'text-green-600'
                            : quantityChange < 0
                              ? 'text-red-600'
                              : 'text-gray-900'
                        )}
                      >
                        {resultQuantity}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item?.quantity_unit || ''}
                      </span>
                    </div>
                  </div>
                  <p className="text-right text-xs text-gray-400 mt-1">
                    Diferencia: {quantityChange > 0 ? '+' : ''}
                    {quantityChange} {item?.quantity_unit || ''}
                  </p>
                </div>

                <div className="border-t pt-3">
                  <span className="text-sm text-gray-500">Razon</span>
                  <p className="mt-1 text-sm text-gray-900">{reason}</p>
                </div>

                {notes && (
                  <div>
                    <span className="text-sm text-gray-500">Notas</span>
                    <p className="mt-1 text-sm text-gray-700">{notes}</p>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between text-sm">
                  <span className="text-gray-500">Fecha</span>
                  <span className="text-gray-900">{formatDate()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atras
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Confirmar ajuste
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
