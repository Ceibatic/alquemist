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
import { useToast } from '@/hooks/use-toast';
import { Ruler, Loader2 } from 'lucide-react';

interface PlantMeasurementModalProps {
  open: boolean;
  onClose: () => void;
  plantId: Id<'plants'>;
  userId: Id<'users'>;
}

export function PlantMeasurementModal({
  open,
  onClose,
  plantId,
  userId,
}: PlantMeasurementModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [heightCm, setHeightCm] = useState('');
  const [nodes, setNodes] = useState('');
  const [stemDiameter, setStemDiameter] = useState('');
  const [healthStatus, setHealthStatus] = useState('healthy');
  const [notes, setNotes] = useState('');

  const recordMeasurement = useMutation(api.plants.recordMeasurement);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await recordMeasurement({
        plantId,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        nodes: nodes ? parseInt(nodes) : undefined,
        stemDiameterMm: stemDiameter ? parseFloat(stemDiameter) : undefined,
        healthStatus,
        notes: notes || undefined,
        recordedBy: userId,
      });

      toast({
        title: 'Medicion registrada',
        description: 'La medicion se ha guardado correctamente',
      });

      // Reset form
      setHeightCm('');
      setNodes('');
      setStemDiameter('');
      setHealthStatus('healthy');
      setNotes('');
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo registrar la medicion',
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
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-green-600" />
            Registrar Medicion
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="nodes">Nodos</Label>
              <Input
                id="nodes"
                type="number"
                min="0"
                value={nodes}
                onChange={(e) => setNodes(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="stem">Tallo (mm)</Label>
              <Input
                id="stem"
                type="number"
                step="0.1"
                min="0"
                value={stemDiameter}
                onChange={(e) => setStemDiameter(e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="health">Estado de Salud</Label>
            <Select value={healthStatus} onValueChange={setHealthStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Sana
                  </span>
                </SelectItem>
                <SelectItem value="stressed">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Estresada
                  </span>
                </SelectItem>
                <SelectItem value="sick">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Enferma
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
