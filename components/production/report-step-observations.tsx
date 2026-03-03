'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
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
import {
  Plus,
  Trash2,
  AlertTriangle,
  Bug,
  Thermometer,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ObservationEntry {
  type: 'pest' | 'disease' | 'deficiency' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  organismId?: string;
  organismName?: string;
  plantPart?: string;
  incidenceCount?: number;
  sampleSize?: number;
  severityPct?: number;
  description: string;
}

interface ReportStepObservationsProps {
  observations: ObservationEntry[];
  onChange: (observations: ObservationEntry[]) => void;
}

const TYPE_LABELS: Record<string, string> = {
  pest: 'Plaga',
  disease: 'Enfermedad',
  deficiency: 'Deficiencia',
  environmental: 'Ambiental',
  other: 'Otro',
};

const SEVERITY_VARIANTS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReportStepObservations({
  observations,
  onChange,
}: ReportStepObservationsProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // Catalogs
  const pests = useQuery(api.pestDiseases.listByType, { type: 'pest' });
  const diseases = useQuery(api.pestDiseases.listByType, { type: 'disease' });
  const deficiencies = useQuery(api.pestDiseases.listByType, { type: 'deficiency' });

  // New observation state
  const [newObs, setNewObs] = useState<ObservationEntry>({
    type: 'pest',
    severity: 'medium',
    description: '',
  });

  const addObservation = () => {
    if (!newObs.description && !newObs.organismId) return;
    
    // Resolve name for organism
    let organismName = '';
    if (newObs.organismId) {
      const all = [...(pests ?? []), ...(diseases ?? []), ...(deficiencies ?? [])];
      organismName = all.find(a => a._id === newObs.organismId)?.name ?? '';
    }

    onChange([...observations, { ...newObs, organismName }]);
    setIsAdding(false);
    setNewObs({ type: 'pest', severity: 'medium', description: '' });
  };

  const removeObservation = (index: number) => {
    onChange(observations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            Monitoreo y Hallazgos
          </CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)} className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" />
              Nuevo hallazgo
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* List of existing observations */}
          {observations.length === 0 && !isAdding ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">No se han registrado hallazgos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {observations.map((obs, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 rounded-md border bg-card text-sm shadow-sm animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 py-0">
                        {TYPE_LABELS[obs.type]}
                      </Badge>
                      <span className={cn("text-[10px] px-1.5 py-0 rounded-full border font-medium", SEVERITY_VARIANTS[obs.severity])}>
                        {obs.severity}
                      </span>
                      {obs.organismName && (
                        <span className="font-semibold text-foreground italic">{obs.organismName}</span>
                      )}
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{obs.description}</p>
                    {(obs.incidenceCount || obs.severityPct) && (
                      <div className="flex gap-3 text-[11px] text-muted-foreground pt-1">
                        {obs.incidenceCount && <span>Incidencia: <strong>{obs.incidenceCount}</strong></span>}
                        {obs.severityPct && <span>Severidad: <strong>{obs.severityPct}%</strong></span>}
                        {obs.plantPart && <span>Parte: <strong>{obs.plantPart}</strong></span>}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeObservation(idx)} className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Form to add new observation */}
          {isAdding && (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de hallazgo</Label>
                  <Select value={newObs.type} onValueChange={(v: any) => setNewObs({ ...newObs, type: v, organismId: undefined })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pest">Plaga</SelectItem>
                      <SelectItem value="disease">Enfermedad</SelectItem>
                      <SelectItem value="deficiency">Deficiencia nutricional</SelectItem>
                      <SelectItem value="environmental">Estrés ambiental</SelectItem>
                      <SelectItem value="other">Otro / General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Severidad</Label>
                  <Select value={newObs.severity} onValueChange={(v: any) => setNewObs({ ...newObs, severity: v })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja (Informativo)</SelectItem>
                      <SelectItem value="medium">Media (Alerta)</SelectItem>
                      <SelectItem value="high">Alta (Acción requerida)</SelectItem>
                      <SelectItem value="critical">Crítica (Emergencia)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(newObs.type === 'pest' || newObs.type === 'disease' || newObs.type === 'deficiency') && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                  <Label className="text-xs">Agente identificado</Label>
                  <Select value={newObs.organismId} onValueChange={(v) => setNewObs({ ...newObs, organismId: v })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={`Selecciona ${TYPE_LABELS[newObs.type]}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {newObs.type === 'pest' && pests?.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                      {newObs.type === 'disease' && diseases?.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                      {newObs.type === 'deficiency' && deficiencies?.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Parte planta</Label>
                  <Input 
                    placeholder="Ej: hoja" 
                    className="h-8 text-xs" 
                    value={newObs.plantPart || ''} 
                    onChange={(e) => setNewObs({ ...newObs, plantPart: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Incidencia (#)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="h-8 text-xs" 
                    value={newObs.incidenceCount || ''} 
                    onChange={(e) => setNewObs({ ...newObs, incidenceCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Severidad (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="h-8 text-xs" 
                    value={newObs.severityPct || ''} 
                    onChange={(e) => setNewObs({ ...newObs, severityPct: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Descripción / Hallazgo *</Label>
                <Textarea 
                  placeholder="Detalla lo observado..." 
                  className="min-h-[60px] text-xs" 
                  value={newObs.description}
                  onChange={(e) => setNewObs({ ...newObs, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="h-8 text-xs">Cancelar</Button>
                <Button size="sm" onClick={addObservation} className="h-8 text-xs bg-amber-500 hover:bg-amber-600">Guardar Hallazgo</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
