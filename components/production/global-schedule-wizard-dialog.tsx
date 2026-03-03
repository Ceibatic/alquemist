'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CalendarIcon,
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  Package,
  Settings,
  ClipboardList,
  MapPin,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GlobalScheduleWizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batchIds?: string[];
  areaId?: string;
  facilityId?: string;
  initialTemplateId?: string;
}

type Step = 'template' | 'config' | 'resources' | 'review';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GlobalScheduleWizardDialog({
  isOpen,
  onClose,
  batchIds: propBatchIds,
  areaId: propAreaId,
  facilityId: propFacilityId,
  initialTemplateId,
}: GlobalScheduleWizardDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>('template');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [templateId, setTemplateId] = useState<string>(initialTemplateId ?? '');
  const [typeId, setTypeId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [priority, setPriority] = useState<string>('routine');
  const [instructions, setInstructions] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<string>('');

  // ── Queries ─────────────────────────────────────────────────────────────
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const companyId = currentUser?.companyId;

  const activityTypes = useQuery(
    api.activityTypes.list,
    companyId ? { companyId, status: 'active' } : 'skip'
  );

  const templates = useQuery(
    api.activityTemplates.list,
    companyId ? { companyId, isActive: true } : 'skip'
  );

  const users = useQuery(
    api.users.listByCompany,
    companyId ? { companyId } : 'skip'
  );

  const batches = useQuery(
    api.batches.getByIds,
    propBatchIds ? { batchIds: propBatchIds as Id<'batches'>[] } : 'skip'
  );

  // ── Mutations ───────────────────────────────────────────────────────────
  const scheduleMutation = useMutation(api.scheduledActivities.createManual);

  // ── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialTemplateId) setTemplateId(initialTemplateId);
  }, [initialTemplateId]);

  // Load template defaults when templateId changes
  const selectedTemplate = useMemo(() => {
    return templates?.find((t) => t._id === templateId);
  }, [templates, templateId]);

  useEffect(() => {
    if (selectedTemplate) {
      setTypeId(selectedTemplate.type_id);
      setInstructions(selectedTemplate.description ?? '');
      setPriority(selectedTemplate.default_priority ?? 'routine');
      setEstimatedDuration(selectedTemplate.estimated_duration_minutes?.toString() ?? '');
    }
  }, [selectedTemplate]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!companyId || !typeId || !propBatchIds || propBatchIds.length === 0) {
      toast.error('Faltan datos requeridos');
      return;
    }

    try {
      setIsSaving(true);
      await scheduleMutation({
        companyId,
        batchIds: propBatchIds as Id<'batches'>[],
        typeId: typeId as Id<'activity_types'>,
        templateId: templateId ? (templateId as Id<'activity_templates'>) : undefined,
        scheduledDate: scheduledDate.getTime(),
        assignedTo: assignedTo ? (assignedTo as Id<'users'>) : undefined,
        priority: priority !== 'routine' ? priority : undefined,
        instructions: instructions || undefined,
        estimatedDurationMinutes: estimatedDuration ? Number(estimatedDuration) : undefined,
      });

      toast.success('Actividad programada correctamente');
      onClose();
      // Reset form
      setTemplateId('');
      setTypeId('');
      setCurrentStep('template');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al programar');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-amber-500" />
            Programar Actividad
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Step Indicator */}
          <div className="flex border-b bg-muted/30 px-6 py-2">
            {[
              { id: 'template', label: 'Plantilla', icon: ClipboardList },
              { id: 'config', label: 'Configuración', icon: Settings },
              { id: 'review', label: 'Revisión', icon: Check },
            ].map((step, idx) => (
              <div key={step.id} className="flex items-center">
                {idx > 0 && <div className="mx-2 h-px w-4 bg-border" />}
                <button
                  disabled={idx > (currentStep === 'template' ? 0 : currentStep === 'config' ? 1 : 2)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium transition-colors',
                    currentStep === step.id ? 'text-amber-600' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <step.icon className="h-3.5 w-3.5" />
                  {step.label}
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 min-h-[300px]">
            {/* Step 1: Template Selection */}
            {currentStep === 'template' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Selecciona una Plantilla (Opcional)</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Actividad ad-hoc (sin plantilla)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Manual / Sin plantilla</SelectItem>
                      {templates?.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground italic">
                    Las plantillas pre-cargan recursos, checklists y parámetros de referencia.
                  </p>
                </div>

                {!templateId || templateId === 'none' ? (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Tipo de Actividad *</Label>
                    <Select value={typeId} onValueChange={setTypeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activityTypes?.map((at) => (
                          <SelectItem key={at._id} value={at._id}>
                            <div className="flex items-center gap-2">
                              {at.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="rounded-md border border-amber-100 bg-amber-50/50 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                      <ClipboardList className="h-4 w-4" />
                      {selectedTemplate?.name}
                    </div>
                    <p className="mt-1 text-xs text-amber-700/80 line-clamp-2">
                      {selectedTemplate?.description}
                    </p>
                  </div>
                )}

                {/* Batch Context Summary */}
                {batches && batches.length > 0 && (
                  <div className="flex items-start gap-3 rounded-md border bg-muted/20 p-3">
                    <Package className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Lotes seleccionados ({batches.length})
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {batches.map((b) => (
                          <span key={b._id} className="rounded bg-background border px-1.5 py-0.5 text-[10px] font-medium">
                            {b.batch_code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Configuration */}
            {currentStep === 'config' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Planificada *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !scheduledDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={(date: Date | undefined) => date && setScheduledDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Asignar a (Opcional)</Label>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin asignar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {users?.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prioridad</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Rutinaria</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duración Est. (min)</Label>
                    <Input
                      type="number"
                      placeholder="Ej: 30"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instrucciones Adicionales</Label>
                  <Textarea
                    placeholder="Escribe aquí detalles específicos para esta ejecución..."
                    className="min-h-[80px]"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 'review' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {templateId && templateId !== 'none' ? selectedTemplate?.name : activityTypes?.find(at => at._id === typeId)?.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {batches?.length} lote(s) • {format(scheduledDate, 'PPPP', { locale: es })}
                      </p>
                    </div>
                    <div className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      priority === 'critical' ? 'bg-red-100 text-red-700' :
                      priority === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {priority}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground block font-medium">Asignado a:</span>
                      <span className="font-semibold">{assignedTo && assignedTo !== 'none' ? (() => { const u = users?.find(u => u.id === assignedTo); return u?.firstName && u?.lastName ? `${u.firstName} ${u.lastName}` : u?.email; })() : 'Sin asignar'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground block font-medium">Zona:</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="font-semibold">Cargar desde batch...</span>
                      </div>
                    </div>
                  </div>

                  {/* Resources are loaded via getById, not list — shown in detail view */}
                </div>

                <div className="flex items-start gap-2 p-2 bg-blue-50/50 rounded-md border border-blue-100">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700">
                    Al programar, se crearán registros individuales para cada lote seleccionado con un snapshot del template actual.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="bg-muted/30 p-4 px-6 border-t">
          <Button
            variant="ghost"
            onClick={currentStep === 'template' ? onClose : () => setCurrentStep(currentStep === 'review' ? 'config' : 'template')}
            className="text-xs"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            {currentStep === 'template' ? 'Cancelar' : 'Anterior'}
          </Button>

          {currentStep !== 'review' ? (
            <Button
              disabled={currentStep === 'template' && !typeId && (!templateId || templateId === 'none')}
              onClick={() => setCurrentStep(currentStep === 'template' ? 'config' : 'review')}
              className="bg-amber-500 hover:bg-amber-600 text-xs"
            >
              Siguiente
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600 text-xs"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="mr-2 h-3.5 w-3.5" />
              )}
              {isSaving ? 'Programando...' : 'Confirmar Programación'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Separator = () => <div className="h-px bg-border w-full" />;
