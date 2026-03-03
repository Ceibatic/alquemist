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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Merge, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/providers/user-provider';

interface MergeBatchModalProps {
  batchId: Id<'batches'>;
  batchCode: string;
  currentQuantity: number;
  companyId: Id<'companies'>;
  cultivarId?: Id<'cultivars'>;
  currentPhase?: string;
  onSuccess?: () => void;
}

export function MergeBatchModal({
  batchId,
  batchCode,
  currentQuantity,
  companyId,
  cultivarId,
  currentPhase,
  onSuccess,
}: MergeBatchModalProps) {
  const { userId } = useUser();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetBatchId, setTargetBatchId] = useState<string>('');
  const [reason, setReason] = useState('');

  // Load all active batches from the same company to find compatible ones
  const allBatches = useQuery(
    api.batches.list,
    open
      ? {
          companyId,
          status: 'active',
          ...(cultivarId ? { cultivarId } : {}),
        }
      : 'skip'
  );

  // Filter to only batches that are compatible: same cultivar + same phase, excluding self
  const compatibleBatches = (allBatches ?? []).filter(
    (b) =>
      b._id !== batchId &&
      b.cultivar_id === cultivarId &&
      b.current_phase === currentPhase
  );

  const selectedBatch = compatibleBatches.find((b) => b._id === targetBatchId);
  const mergedTotal = selectedBatch
    ? currentQuantity + selectedBatch.current_quantity
    : null;

  const mergeBatch = useMutation(api.batches.merge);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTargetBatchId('');
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

    if (!targetBatchId) {
      toast.error('Selecciona el lote con el que fusionar');
      return;
    }

    if (!reason.trim()) {
      toast.error('Ingresa el motivo de la fusion');
      return;
    }

    try {
      setIsSubmitting(true);

      await mergeBatch({
        primaryBatchId: batchId,
        secondaryBatchId: targetBatchId as Id<'batches'>,
        reason: reason.trim(),
        performedBy: userId as Id<'users'>,
      });

      toast.success('Lotes fusionados correctamente', {
        description: `${batchCode} absorbio al lote seleccionado. Nueva cantidad: ${mergedTotal} unidades`,
      });

      handleOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error merging batches:', error);
      toast.error('No se pudo fusionar los lotes', {
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
          <Merge className="h-4 w-4 mr-2" />
          Fusionar Lote
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Merge className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <DialogTitle>Fusionar Lote</DialogTitle>
              <DialogDescription>
                Fusiona <span className="font-medium">{batchCode}</span> con otro
                lote compatible
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Info about compatibility requirement */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Solo se muestran lotes activos con el mismo cultivar y fase de
              cultivo. El lote actual ({batchCode}) sera el principal y absorbe
              al seleccionado.
            </p>
          </div>

          {/* Current batch info */}
          <div className="p-3 rounded-lg bg-gray-50 border text-sm text-gray-600">
            Lote principal:{' '}
            <span className="font-semibold text-gray-900">{batchCode}</span>
            {' — '}
            <span className="font-semibold text-gray-900">
              {currentQuantity} unidades
            </span>
          </div>

          {/* Target batch selector */}
          <div className="space-y-2">
            <Label>
              Lote a fusionar <span className="text-red-500">*</span>
            </Label>
            <Select value={targetBatchId} onValueChange={setTargetBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar lote compatible..." />
              </SelectTrigger>
              <SelectContent>
                {compatibleBatches.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No hay lotes compatibles disponibles
                  </div>
                ) : (
                  compatibleBatches.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      <span className="font-medium">{b.batch_code}</span>
                      <span className="text-gray-500 ml-2">
                        {b.current_quantity} uds
                        {b.areaName ? ` · ${b.areaName}` : ''}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Merged total preview */}
          {selectedBatch && mergedTotal !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
                {batchCode}: {currentQuantity} uds
              </span>
              <span className="text-gray-400">+</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
                {selectedBatch.batch_code}: {selectedBatch.current_quantity} uds
              </span>
              <span className="text-gray-400">=</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-semibold">
                {mergedTotal} uds total
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="merge-reason">
              Motivo <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="merge-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Consolidar lotes pequenos para optimizar espacio de cultivo"
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
              disabled={isSubmitting || !targetBatchId || !reason.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Fusionando...
                </>
              ) : (
                <>
                  <Merge className="h-4 w-4 mr-2" />
                  Fusionar Lotes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
