'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';

const UTILITY_TYPES = [
  { value: 'electricity', label: 'Electricidad', unit: 'kWh' },
  { value: 'water', label: 'Agua', unit: 'm3' },
  { value: 'gas', label: 'Gas', unit: 'm3' },
] as const;

interface UtilityReadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: Id<'facilities'>;
  userId: Id<'users'>;
}

export function UtilityReadingModal({
  open,
  onOpenChange,
  facilityId,
  userId,
}: UtilityReadingModalProps) {
  const createReading = useMutation(api.utilities.createReading);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [utilityType, setUtilityType] = useState<string>('electricity');
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [readingPrevious, setReadingPrevious] = useState('');
  const [readingCurrent, setReadingCurrent] = useState('');
  const [costTotal, setCostTotal] = useState('');
  const [notes, setNotes] = useState('');

  const selectedType = UTILITY_TYPES.find((t) => t.value === utilityType);
  const consumption =
    readingCurrent && readingPrevious
      ? Math.max(0, Number(readingCurrent) - Number(readingPrevious))
      : 0;

  const resetForm = () => {
    setUtilityType('electricity');
    const now = new Date();
    setPeriod(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    );
    setReadingPrevious('');
    setReadingCurrent('');
    setCostTotal('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!readingPrevious || !readingCurrent || !costTotal) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    const prev = Number(readingPrevious);
    const curr = Number(readingCurrent);
    const cost = Number(costTotal);

    if (curr < prev) {
      toast.error('La lectura actual debe ser mayor o igual a la anterior');
      return;
    }

    if (cost < 0) {
      toast.error('El costo debe ser mayor o igual a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReading({
        facility_id: facilityId,
        utility_type: utilityType as 'electricity' | 'water' | 'gas',
        period,
        reading_previous: prev,
        reading_current: curr,
        consumption_unit: selectedType?.unit || 'kWh',
        cost_total: cost,
        notes: notes || undefined,
        recorded_by: userId,
      });

      toast.success('Lectura registrada correctamente');
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar lectura');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Zap className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <DialogTitle>Registrar Lectura</DialogTitle>
              <DialogDescription>
                Registra una lectura de medidor para calcular costos de utilities
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Utility Type */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={utilityType} onValueChange={setUtilityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UTILITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period */}
            <div className="space-y-2">
              <Label>Periodo</Label>
              <Input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Previous Reading */}
            <div className="space-y-2">
              <Label>Lectura Anterior</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={readingPrevious}
                onChange={(e) => setReadingPrevious(e.target.value)}
                placeholder="0"
                required
              />
            </div>

            {/* Current Reading */}
            <div className="space-y-2">
              <Label>Lectura Actual</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={readingCurrent}
                onChange={(e) => setReadingCurrent(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Consumption (calculated) */}
          {consumption > 0 && (
            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <span className="text-gray-500">Consumo calculado:</span>{' '}
              <span className="font-medium">
                {consumption.toLocaleString('es-CO')} {selectedType?.unit}
              </span>
            </div>
          )}

          {/* Cost */}
          <div className="space-y-2">
            <Label>Costo Total del Periodo (COP)</Label>
            <Input
              type="number"
              step="any"
              min="0"
              value={costTotal}
              onChange={(e) => setCostTotal(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones sobre la lectura..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
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
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Lectura'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
