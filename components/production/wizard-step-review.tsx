'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import type { WizardFormData, ResourceItem } from './schedule-activity-wizard';

interface WizardStepReviewProps {
  companyId: Id<'companies'>;
  formData: WizardFormData;
  onUpdate: (partial: Partial<WizardFormData>) => void;
}

const PRIORITY_OPTIONS = [
  { value: 'routine', label: 'Rutinaria' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'critical', label: 'Critica' },
];

const QUANTITY_BASIS_OPTIONS = [
  { value: 'fixed', label: 'Fija' },
  { value: 'per_plant', label: 'Por planta' },
  { value: 'per_m2', label: 'Por m²' },
  { value: 'per_zone', label: 'Por zona' },
  { value: 'per_L_solution', label: 'Por L solucion' },
];

const DIRECTION_OPTIONS = [
  { value: 'consumed', label: 'Consumido' },
  { value: 'applied', label: 'Aplicado' },
  { value: 'produced', label: 'Producido' },
];

export function WizardStepReview({ companyId, formData, onUpdate }: WizardStepReviewProps) {
  const users = useQuery(api.users.getUsersByCompany, { companyId });

  const updateResource = (index: number, partial: Partial<ResourceItem>) => {
    const updated = [...formData.resources];
    updated[index] = { ...updated[index], ...partial };
    onUpdate({ resources: updated });
  };

  const removeResource = (index: number) => {
    onUpdate({ resources: formData.resources.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap gap-2 text-sm">
        {formData.areaName && (
          <Badge variant="outline">{formData.areaName}</Badge>
        )}
        <Badge variant="outline">{formData.batchIds.length} lote(s)</Badge>
        {formData.templateName && (
          <Badge variant="secondary">{formData.templateName}</Badge>
        )}
      </div>

      {/* Schedule details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalles de programacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label>Fecha programada *</Label>
            <Input
              type="date"
              value={formData.scheduledDate ? format(formData.scheduledDate, 'yyyy-MM-dd') : ''}
              onChange={(e) =>
                onUpdate({
                  scheduledDate: e.target.value ? new Date(e.target.value + 'T12:00:00') : null,
                })
              }
            />
          </div>

          {/* Assigned to */}
          <div className="space-y-2">
            <Label>Asignado a</Label>
            <Select
              value={formData.assignedTo ?? ''}
              onValueChange={(v) => onUpdate({ assignedTo: (v || null) as Id<'users'> | null })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select
              value={formData.priority}
              onValueChange={(v) => onUpdate({ priority: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duracion estimada (minutos)</Label>
            <Input
              type="number"
              min={1}
              value={formData.estimatedDurationMinutes ?? ''}
              onChange={(e) =>
                onUpdate({
                  estimatedDurationMinutes: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              placeholder="Ej: 60"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label>Instrucciones</Label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => onUpdate({ instructions: e.target.value })}
              placeholder="Instrucciones para realizar la actividad..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recursos</CardTitle>
            <span className="text-xs text-muted-foreground">
              {formData.resources.length} recurso(s)
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {formData.resources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay recursos configurados.
              {formData.templateId && ' El template no tenia recursos definidos.'}
            </p>
          ) : (
            <div className="space-y-3">
              {formData.resources.map((resource, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{resource.productName}</span>
                      {resource.productCode && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({resource.productCode})
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeResource(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Cantidad</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={resource.quantity}
                        onChange={(e) =>
                          updateResource(idx, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Base</Label>
                      <Select
                        value={resource.quantityBasis}
                        onValueChange={(v) => updateResource(idx, { quantityBasis: v })}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUANTITY_BASIS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Direccion</Label>
                      <Select
                        value={resource.direction}
                        onValueChange={(v) => updateResource(idx, { direction: v })}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIRECTION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
