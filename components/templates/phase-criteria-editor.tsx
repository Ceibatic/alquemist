'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical, CheckSquare } from 'lucide-react';

interface Criterion {
  id: string;
  label: string;
  type: string;
  config?: any;
  is_required: boolean;
}

const CRITERION_TYPE_LABELS: Record<string, string> = {
  manual_check: 'Verificacion manual',
  metric_range: 'Rango de metrica',
  activity_completed: 'Actividad completada',
};

interface PhaseCriteriaEditorProps {
  phaseId: Id<'template_phases'>;
  criteria: Criterion[];
}

export function PhaseCriteriaEditor({ phaseId, criteria: initialCriteria }: PhaseCriteriaEditorProps) {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const updateCriteria = useMutation(api.productionTemplates.updatePhaseCompletionCriteria);

  const addCriterion = () => {
    const newCriterion: Criterion = {
      id: crypto.randomUUID(),
      label: '',
      type: 'manual_check',
      is_required: true,
    };
    setCriteria([...criteria, newCriterion]);
    setHasChanges(true);
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
    setHasChanges(true);
  };

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const validCriteria = criteria.filter((c) => c.label.trim());
    if (validCriteria.length === 0 && criteria.length > 0) {
      toast.error('Todos los criterios necesitan un nombre');
      return;
    }

    setIsSaving(true);
    try {
      await updateCriteria({
        phaseId,
        completionCriteria: validCriteria.map((c) => ({
          id: c.id,
          label: c.label.trim(),
          type: c.type,
          config: c.config,
          is_required: c.is_required,
        })),
      });
      setCriteria(validCriteria);
      setHasChanges(false);
      toast.success('Criterios guardados');
    } catch {
      toast.error('Error al guardar criterios');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          Criterios de Completitud
          {criteria.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              ({criteria.length})
            </span>
          )}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          onClick={addCriterion}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Agregar
        </Button>
      </div>

      {criteria.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">
          Sin criterios definidos. La fase se puede completar sin validaciones.
        </p>
      ) : (
        <div className="space-y-2">
          {criteria.map((criterion) => (
            <Card key={criterion.id} className="border-gray-200">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <GripVertical className="h-4 w-4 text-gray-300 mt-2 flex-shrink-0 cursor-grab" />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={criterion.label}
                      onChange={(e) => updateCriterion(criterion.id, { label: e.target.value })}
                      placeholder="Nombre del criterio..."
                      className="h-8 text-sm"
                    />
                    <div className="flex items-center gap-3">
                      <Select
                        value={criterion.type}
                        onValueChange={(val) => updateCriterion(criterion.id, { type: val })}
                      >
                        <SelectTrigger className="h-7 text-xs w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual_check">Verificacion manual</SelectItem>
                          <SelectItem value="metric_range">Rango de metrica</SelectItem>
                          <SelectItem value="activity_completed">Actividad completada</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          id={`required-${criterion.id}`}
                          checked={criterion.is_required}
                          onCheckedChange={(checked) =>
                            updateCriterion(criterion.id, { is_required: checked === true })
                          }
                        />
                        <Label htmlFor={`required-${criterion.id}`} className="text-xs">
                          Requerido
                        </Label>
                      </div>
                      <Badge className={criterion.is_required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}>
                        {criterion.is_required ? 'Obligatorio' : 'Opcional'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                    onClick={() => removeCriterion(criterion.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasChanges && (
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar Criterios'}
        </Button>
      )}
    </div>
  );
}
