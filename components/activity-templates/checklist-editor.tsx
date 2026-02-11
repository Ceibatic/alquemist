'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  CheckSquare,
  Loader2,
  GripVertical,
  Camera,
  Hash,
} from 'lucide-react';

const VALUE_TYPE_OPTIONS = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Numero' },
  { value: 'boolean', label: 'Si/No' },
  { value: 'select', label: 'Seleccion' },
];

interface ChecklistEditorProps {
  templateId: Id<'activity_templates'>;
}

export function ChecklistEditor({ templateId }: ChecklistEditorProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const [requiresValue, setRequiresValue] = useState(false);
  const [valueType, setValueType] = useState<string>('');
  const [valueOptions, setValueOptions] = useState('');
  const [valueMin, setValueMin] = useState('');
  const [valueMax, setValueMax] = useState('');

  const checklist = useQuery(api.activityTemplates.getChecklist, { templateId });
  const addItemMutation = useMutation(api.activityTemplates.addChecklistItem);
  const removeItemMutation = useMutation(api.activityTemplates.removeChecklistItem);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIsRequired(true);
    setRequiresPhoto(false);
    setRequiresValue(false);
    setValueType('');
    setValueOptions('');
    setValueMin('');
    setValueMax('');
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      toast.error('El titulo es requerido');
      return;
    }

    try {
      setIsAdding(true);
      await addItemMutation({
        templateId,
        title: title.trim(),
        description: description.trim() || undefined,
        isRequired,
        requiresPhoto,
        requiresValue,
        valueType: requiresValue && valueType ? valueType : undefined,
        valueOptions:
          requiresValue && valueType === 'select' && valueOptions
            ? valueOptions.split(',').map((o) => o.trim()).filter(Boolean)
            : undefined,
        valueMin: requiresValue && valueType === 'number' && valueMin ? Number(valueMin) : undefined,
        valueMax: requiresValue && valueType === 'number' && valueMax ? Number(valueMax) : undefined,
      });
      toast.success('Paso agregado al checklist');
      resetForm();
      setAddDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al agregar');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (itemId: Id<'activity_template_checklist'>) => {
    try {
      await removeItemMutation({ itemId });
      toast.success('Paso eliminado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const items = checklist ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Checklist ({items.length} pasos)
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-1 h-3 w-3" />
            Agregar paso
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay pasos de verificacion. Agrega pasos para estandarizar la ejecucion.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-xs font-medium flex-shrink-0 mt-0.5">
                  {item.step_number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.title}</span>
                    {!item.is_required && (
                      <Badge variant="outline" className="text-xs">Opcional</Badge>
                    )}
                    {item.requires_photo && (
                      <Camera className="h-3 w-3 text-muted-foreground" />
                    )}
                    {item.requires_value && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {item.value_type ?? 'valor'}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                  {item.value_options && item.value_options.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.value_options.map((opt, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {opt}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.value_min !== undefined && item.value_max !== undefined && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rango: {item.value_min} - {item.value_max}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500 flex-shrink-0"
                  onClick={() => handleRemove(item._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Checklist Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar paso al checklist</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titulo *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Verificar pH de la mezcla"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripcion (instruccion detallada)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instrucciones detalladas para el operador..."
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={isRequired} onCheckedChange={setIsRequired} />
                <Label className="cursor-pointer">Paso requerido</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={requiresPhoto} onCheckedChange={setRequiresPhoto} />
                <Label className="cursor-pointer">Requiere foto</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={requiresValue} onCheckedChange={setRequiresValue} />
                <Label className="cursor-pointer">Requiere ingresar valor</Label>
              </div>
            </div>

            {requiresValue && (
              <div className="space-y-4 pl-4 border-l-2">
                <div className="space-y-2">
                  <Label>Tipo de valor</Label>
                  <Select value={valueType} onValueChange={setValueType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALUE_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {valueType === 'select' && (
                  <div className="space-y-2">
                    <Label>Opciones (separadas por coma)</Label>
                    <Input
                      value={valueOptions}
                      onChange={(e) => setValueOptions(e.target.value)}
                      placeholder="Aprobado, Rechazado, Pendiente"
                    />
                  </div>
                )}

                {valueType === 'number' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimo</Label>
                      <Input
                        type="number"
                        value={valueMin}
                        onChange={(e) => setValueMin(e.target.value)}
                        placeholder="Ej: 0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximo</Label>
                      <Input
                        type="number"
                        value={valueMax}
                        onChange={(e) => setValueMax(e.target.value)}
                        placeholder="Ej: 14"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isAdding}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Agregar paso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
