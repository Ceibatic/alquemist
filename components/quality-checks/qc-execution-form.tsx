'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { DynamicFormRenderer, TemplateStructure } from './dynamic-form-renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Clock,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Loader2,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface QCExecutionFormProps {
  templateId: Id<'quality_check_templates'>;
  template: {
    name: string;
    template_structure: TemplateStructure;
    ai_assisted: boolean;
    ai_analysis_types: string[];
  };
  entityType: 'batch' | 'plant';
  entityId: string;
  companyId: Id<'companies'>;
  facilityId: Id<'facilities'>;
  areaId?: Id<'areas'>;
  userId: Id<'users'>;
  onComplete?: (checkId: Id<'quality_checks'>) => void;
  onCancel?: () => void;
  existingCheckId?: Id<'quality_checks'>;
  existingFormData?: any;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function calculateProgress(
  formData: Record<string, any>,
  templateStructure: TemplateStructure
): { completed: number; total: number; percentage: number } {
  let completed = 0;
  let total = 0;

  templateStructure.sections.forEach((section) => {
    section.fields.forEach((field) => {
      // Skip non-input fields
      if (field.type === 'heading' || field.type === 'paragraph') return;

      // Only count required fields
      if (field.required) {
        total++;
        const value = formData[field.id];
        if (value !== undefined && value !== null && value !== '') {
          completed++;
        }
      }
    });
  });

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function QCExecutionForm({
  templateId,
  template,
  entityType,
  entityId,
  companyId,
  facilityId,
  areaId,
  userId,
  onComplete,
  onCancel,
  existingCheckId,
  existingFormData,
}: QCExecutionFormProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [checkId, setCheckId] = useState<Id<'quality_checks'> | null>(
    existingCheckId || null
  );
  const [formData, setFormData] = useState<Record<string, any>>(
    existingFormData || {}
  );
  const [notes, setNotes] = useState<string>('');
  const [overallResult, setOverallResult] = useState<string>('pending');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // CONVEX MUTATIONS
  // ============================================================================

  const createCheck = useMutation(api.qualityChecks.create);
  const saveDraftMutation = useMutation(api.qualityChecks.saveDraft);
  const completeMutation = useMutation(api.qualityChecks.complete);

  // ============================================================================
  // CALCULATED VALUES
  // ============================================================================

  const progress = calculateProgress(formData, template.template_structure);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initialize check on mount
  useEffect(() => {
    const initializeCheck = async () => {
      if (!checkId) {
        try {
          const newCheckId = await createCheck({
            templateId,
            entityType,
            entityId,
            performedBy: userId,
            companyId,
            facilityId,
            formData: {},
            notes: '',
          });
          setCheckId(newCheckId);
          toast.success('Inspección iniciada');
        } catch (error) {
          console.error('Error creating check:', error);
          toast.error('Error al iniciar inspección');
        }
      }
    };

    initializeCheck();
  }, [
    checkId,
    createCheck,
    templateId,
    entityType,
    entityId,
    userId,
    companyId,
    facilityId,
  ]);

  // Timer - update elapsed time every second
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveIntervalRef.current = setInterval(() => {
      if (checkId && !isSubmitting) {
        handleSaveDraft(true);
      }
    }, 30000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [checkId, formData, notes, isSubmitting]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFormChange = useCallback((values: Record<string, any>) => {
    setFormData(values);
  }, []);

  const handleSaveDraft = async (isAutoSave = false) => {
    if (!checkId) return;

    setIsSavingDraft(true);

    try {
      await saveDraftMutation({
        checkId,
        formData,
        notes,
      });

      setLastSavedAt(new Date());

      if (!isAutoSave) {
        toast.success('Borrador guardado');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      if (!isAutoSave) {
        toast.error('Error al guardar borrador');
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleComplete = async () => {
    if (!checkId) {
      toast.error('No se puede completar: inspección no iniciada');
      return;
    }

    // Validate required fields
    if (progress.percentage < 100) {
      toast.error(
        `Por favor complete todos los campos requeridos (${progress.completed}/${progress.total})`
      );
      return;
    }

    // Validate overall result is selected
    if (overallResult === 'pending') {
      toast.error('Por favor seleccione un resultado general');
      return;
    }

    // Validate follow-up date if required
    if (followUpRequired && !followUpDate) {
      toast.error('Por favor seleccione una fecha de seguimiento');
      return;
    }

    setIsSubmitting(true);

    try {
      const durationMinutes = Math.floor(elapsedSeconds / 60);

      await completeMutation({
        checkId,
        formData,
        overallResult,
        notes,
        followUpRequired,
        followUpDate: followUpDate ? parseDate(followUpDate).getTime() : undefined,
        durationMinutes,
      });

      toast.success('Inspección completada exitosamente');

      if (onComplete) {
        onComplete(checkId);
      }
    } catch (error) {
      console.error('Error completing check:', error);
      toast.error('Error al completar inspección');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header Card - Timer & Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{template.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {entityType === 'batch' ? 'Lote' : 'Planta'}: {entityId}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm">
                  {formatElapsedTime(elapsedSeconds)}
                </span>
              </div>

              {/* Auto-save indicator */}
              {lastSavedAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-3 w-3 text-green-500" />
                      <span>
                        Guardado {new Date(lastSavedAt).toLocaleTimeString()}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">
                {progress.completed} / {progress.total} campos completados (
                {progress.percentage}%)
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Form Renderer */}
      <DynamicFormRenderer
        template={template.template_structure}
        initialValues={formData}
        onChange={handleFormChange}
        showSubmitButton={false}
      />

      {/* Overall Result Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultado General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Result Selector */}
          <div className="space-y-2">
            <Label>Resultado de la Inspección</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={overallResult === 'pass' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  overallResult === 'pass' &&
                    'bg-green-500 hover:bg-green-600 text-white'
                )}
                onClick={() => setOverallResult('pass')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aprobado
              </Button>
              <Button
                type="button"
                variant={overallResult === 'conditional' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  overallResult === 'conditional' &&
                    'bg-amber-500 hover:bg-amber-600 text-white'
                )}
                onClick={() => setOverallResult('conditional')}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Condicional
              </Button>
              <Button
                type="button"
                variant={overallResult === 'fail' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  overallResult === 'fail' &&
                    'bg-red-500 hover:bg-red-600 text-white'
                )}
                onClick={() => setOverallResult('fail')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazado
              </Button>
            </div>
          </div>

          <Separator />

          {/* Follow-up Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow-up"
                checked={followUpRequired}
                onCheckedChange={(checked) =>
                  setFollowUpRequired(checked as boolean)
                }
              />
              <Label
                htmlFor="follow-up"
                className="text-sm font-normal cursor-pointer"
              >
                Requiere seguimiento
              </Label>
            </div>

            {followUpRequired && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="follow-up-date">Fecha de Seguimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !followUpDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {followUpDate ? (
                        formatDate(parseDate(followUpDate))
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      min={formatDate(new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <Separator />

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas y Observaciones</Label>
            <Textarea
              id="notes"
              placeholder="Agregue notas u observaciones adicionales sobre esta inspección..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSaveDraft(false)}
              disabled={isSavingDraft || isSubmitting || !checkId}
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Borrador
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleComplete}
              disabled={
                isSubmitting ||
                !checkId ||
                overallResult === 'pending' ||
                progress.percentage < 100
              }
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completar Inspección
                </>
              )}
            </Button>
          </div>

          {/* Validation Messages */}
          {progress.percentage < 100 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Complete todos los campos requeridos antes de finalizar (
                {progress.completed}/{progress.total})
              </p>
            </div>
          )}

          {overallResult === 'pending' && progress.percentage === 100 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Seleccione un resultado general (Aprobado/Condicional/Rechazado)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Badge if enabled */}
      {template.ai_assisted && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            IA Habilitada
          </Badge>
          <span>
            Esta plantilla soporta análisis asistido por IA:{' '}
            {template.ai_analysis_types.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
