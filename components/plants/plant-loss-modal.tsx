'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface PlantLossModalProps {
  open: boolean;
  onClose: () => void;
  plantId: Id<'plants'>;
  plantCode: string;
}

const lossReasons = [
  { value: 'disease', label: 'Enfermedad' },
  { value: 'pest', label: 'Plaga' },
  { value: 'nutrient_deficiency', label: 'Deficiencia Nutricional' },
  { value: 'environmental', label: 'Condiciones Ambientales' },
  { value: 'mechanical_damage', label: 'Dano Mecanico' },
  { value: 'root_rot', label: 'Pudricion de Raiz' },
  { value: 'genetics', label: 'Problemas Geneticos' },
  { value: 'unknown', label: 'Causa Desconocida' },
  { value: 'other', label: 'Otro' },
];

export function PlantLossModal({
  open,
  onClose,
  plantId,
  plantCode,
}: PlantLossModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const markAsLost = useMutation(api.plants.markAsLost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast({
        title: 'Error',
        description: 'Selecciona una razon de perdida',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await markAsLost({
        plantId,
        reason,
        description: description || undefined,
      });

      toast({
        title: 'Planta marcada como perdida',
        description: `${plantCode} ha sido registrada como perdida`,
      });

      setReason('');
      setDescription('');
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo registrar la perdida',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Marcar Planta como Perdida
          </DialogTitle>
          <DialogDescription>
            Esta accion no se puede deshacer. La planta <strong>{plantCode}</strong> sera
            marcada como perdida y se actualizaran las cantidades del lote.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Razon de Perdida *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la causa..." />
              </SelectTrigger>
              <SelectContent>
                {lossReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descripcion (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe los sintomas o circunstancias..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || !reason}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Perdida
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
