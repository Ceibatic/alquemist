'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Scissors, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';

interface SplitBatchModalProps {
  batchId: Id<'batches'>;
  batchCode: string;
  currentQuantity: number;
  facilityId: Id<'facilities'>;
  currentAreaId?: Id<'areas'>;
  onSuccess?: () => void;
}

export function SplitBatchModal({
  batchId,
  batchCode,
  currentQuantity,
  facilityId,
  currentAreaId,
  onSuccess,
}: SplitBatchModalProps) {
  const { userId } = useUser();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state — split into 2 groups: the split-off portion and the remainder
  const [splitQuantity, setSplitQuantity] = useState<string>('');
  const [splitAreaId, setSplitAreaId] = useState<string>('');
  const [remainderAreaId, setRemainderAreaId] = useState<string>(currentAreaId ?? '');
  const [reason, setReason] = useState('');

  const areas = useQuery(
    api.areas.getByFacility,
    open ? { facilityId } : 'skip'
  );

  const splitBatch = useMutation(api.batches.split);

  const splitQty = parseInt(splitQuantity) || 0;
  const remainderQty = currentQuantity - splitQty;
  const isValidQuantity = splitQty >= 1 && splitQty < currentQuantity;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSplitQuantity('');
      setSplitAreaId('');
      setRemainderAreaId(currentAreaId ?? '');
      setReason('');
    }
    setOpen(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (!isValidQuantity) {
      toast.error('La cantidad a separar debe ser entre 1 y ' + (currentQuantity - 1));
      return;
    }

    if (!splitAreaId) {
      toast.error('Selecciona un area para el nuevo lote');
      return;
    }

    if (!remainderAreaId) {
      toast.error('Selecciona un area para el lote restante');
      return;
    }

    if (!reason.trim()) {
      toast.error('Ingresa el motivo de la division');
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await splitBatch({
        batchId,
        splits: [
          {
            quantity: splitQty,
            areaId: splitAreaId as Id<'areas'>,
          },
          {
            quantity: remainderQty,
            areaId: remainderAreaId as Id<'areas'>,
          },
        ],
        reason: reason.trim(),
        performedBy: userId as Id<'users'>,
      });

      toast.success('Lote dividido correctamente', {
        description: `Se crearon ${result.newBatchIds.length} nuevos lotes desde ${batchCode}`,
      });

      handleOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error splitting batch:', error);
      toast.error('No se pudo dividir el lote', {
        description: error?.message ?? 'Intenta de nuevo',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Scissors className="h-4 w-4 mr-2" />
          Dividir Lote
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Scissors className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <DialogTitle>Dividir Lote</DialogTitle>
              <DialogDescription>
                Divide <span className="font-medium">{batchCode}</span> en dos
                lotes independientes
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Quantity Info */}
          <div className="p-3 rounded-lg bg-gray-50 border text-sm text-gray-600">
            Cantidad actual del lote:{' '}
            <span className="font-semibold text-gray-900">{currentQuantity} unidades</span>
          </div>

          {/* Split quantity */}
          <div className="space-y-2">
            <Label htmlFor="split-quantity">
              Cantidad a separar <span className="text-red-500">*</span>
            </Label>
            <Input
              id="split-quantity"
              type="number"
              min={1}
              max={currentQuantity - 1}
              value={splitQuantity}
              onChange={(e) => setSplitQuantity(e.target.value)}
              placeholder={`1 - ${currentQuantity - 1}`}
            />
            {splitQty > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">
                  Lote nuevo: {splitQty} uds
                </span>
                <span>+</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">
                  Lote restante: {remainderQty} uds
                </span>
              </div>
            )}
            {splitQty > 0 && !isValidQuantity && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                La cantidad debe estar entre 1 y {currentQuantity - 1}
              </p>
            )}
          </div>

          {/* Area for new (split-off) batch */}
          <div className="space-y-2">
            <Label>
              Area del nuevo lote <span className="text-red-500">*</span>
            </Label>
            <Select value={splitAreaId} onValueChange={setSplitAreaId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar area..." />
              </SelectTrigger>
              <SelectContent>
                {areas?.map((area) => (
                  <SelectItem key={area._id} value={area._id}>
                    {area.name}
                    {area.area_type ? ` (${area.area_type})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Area for remainder batch */}
          <div className="space-y-2">
            <Label>
              Area del lote restante <span className="text-red-500">*</span>
            </Label>
            <Select value={remainderAreaId} onValueChange={setRemainderAreaId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar area..." />
              </SelectTrigger>
              <SelectContent>
                {areas?.map((area) => (
                  <SelectItem key={area._id} value={area._id}>
                    {area.name}
                    {area.area_type ? ` (${area.area_type})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Puede ser la misma area o una diferente
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="split-reason">
              Motivo <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="split-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: 8 plantas con deficiencia Ca severa, separar para tratamiento diferenciado"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValidQuantity || !splitAreaId || !remainderAreaId || !reason.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Dividiendo...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Dividir Lote
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
