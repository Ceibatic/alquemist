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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Loader2, AlertTriangle, Info } from 'lucide-react';

interface PlantHarvestModalProps {
  plant: {
    _id: Id<'plants'>;
    plant_code: string;
    batch_id: Id<'batches'>;
    current_height_cm?: number;
    status: string;
    [key: string]: any; // Allow additional enriched fields
  };
  batchPhase?: string;
  userId: Id<'users'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const phaseLabels: Record<string, string> = {
  germination: 'Germinacion',
  seedling: 'Plantula',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
};

const qualityGrades = [
  { value: 'premium', label: 'Premium (A)' },
  { value: 'standard', label: 'Estandar (B)' },
  { value: 'second', label: 'Segunda (C)' },
];

export function PlantHarvestModal({
  plant,
  batchPhase,
  userId,
  open,
  onOpenChange,
}: PlantHarvestModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'g' | 'kg'>('g');
  const [qualityGrade, setQualityGrade] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [notes, setNotes] = useState('');

  const harvest = useMutation(api.plants.harvest);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight || parseFloat(weight) <= 0) {
      toast({
        title: 'Error',
        description: 'Ingresa un peso valido',
        variant: 'destructive',
      });
      return;
    }

    if (!qualityGrade) {
      toast({
        title: 'Error',
        description: 'Selecciona un grado de calidad',
        variant: 'destructive',
      });
      return;
    }

    const weightValue = parseFloat(weight);
    if (weightValue < 0.1) {
      toast({
        title: 'Error',
        description: 'El peso minimo es 0.1 gramos',
        variant: 'destructive',
      });
      return;
    }

    // Convert to grams if in kg
    const weightInGrams = weightUnit === 'kg' ? weightValue * 1000 : weightValue;

    if (weightInGrams > 10000) {
      toast({
        title: 'Error',
        description: 'El peso maximo es 10 kg (10,000 g)',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await harvest({
        plantId: plant._id,
        weight: weightInGrams,
        quality: qualityGrade,
        notes: notes || undefined,
        harvestedBy: userId,
      });

      toast({
        title: 'Planta cosechada',
        description: `${plant.plant_code} ha sido cosechada exitosamente. Peso: ${weightInGrams}g, Calidad: ${qualityGrades.find((g) => g.value === qualityGrade)?.label}`,
      });

      // Reset form
      setWeight('');
      setWeightUnit('g');
      setQualityGrade('');
      setHarvestDate('');
      setNotes('');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cosechar la planta',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Leaf className="h-5 w-5" />
            Cosechar Planta Individual
          </DialogTitle>
          <DialogDescription>
            Registra la cosecha de la planta <strong>{plant.plant_code}</strong>.
            {plant.current_height_cm && (
              <span className="block mt-1 text-xs">
                Altura actual: {plant.current_height_cm} cm
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phase validation warning */}
          {batchPhase && !['flowering', 'harvest'].includes(batchPhase) && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                El lote no esta en fase de cosecha. Fase actual:{' '}
                {phaseLabels[batchPhase] || batchPhase}
              </AlertDescription>
            </Alert>
          )}

          {/* Info about harvesting */}
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Al cosechar, la planta sera marcada como cosechada y se actualizara su
              registro con el peso y calidad final.
            </AlertDescription>
          </Alert>

          {/* Weight and unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Peso *</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0.1"
                max={weightUnit === 'kg' ? '10' : '10000'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidad *</Label>
              <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as 'g' | 'kg')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">Gramos (g)</SelectItem>
                  <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quality grade */}
          <div>
            <Label htmlFor="quality">Grado de Calidad *</Label>
            <Select value={qualityGrade} onValueChange={setQualityGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la calidad..." />
              </SelectTrigger>
              <SelectContent>
                {qualityGrades.map((grade) => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Harvest date (optional) */}
          <div>
            <Label htmlFor="harvestDate">Fecha de Cosecha (opcional)</Label>
            <Input
              id="harvestDate"
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Si no se especifica, se usara la fecha actual
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones sobre la cosecha, condiciones, etc..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !weight || !qualityGrade}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Cosecha
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
