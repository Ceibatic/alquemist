'use client';

import { use, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DynamicFormRenderer, TemplateStructure } from '@/components/quality-checks/dynamic-form-renderer';
import { PestDetectionResult } from '@/components/quality-checks/pest-detection-result';
import { QualityGradeResult } from '@/components/quality-checks/quality-grade-result';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ClipboardCheck,
  MoreVertical,
  Pencil,
  FileDown,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Brain,
  FileText,
  StickyNote,
  Bell,
  CalendarPlus,
  AlertOctagon,
  History,
  User,
  Link as LinkIcon,
} from 'lucide-react';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const resultBadgeConfig = {
  pass: {
    label: 'Aprobado',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle2,
  },
  fail: {
    label: 'Reprobado',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle,
  },
  conditional: {
    label: 'Condicional',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: AlertTriangle,
  },
  pending: {
    label: 'Pendiente',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: Clock,
  },
};

const statusConfig = {
  draft: {
    label: 'Borrador',
    color: 'bg-gray-100 text-gray-700',
  },
  completed: {
    label: 'Completado',
    color: 'bg-green-100 text-green-700',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InspectionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const inspectionId = resolvedParams.id as Id<'quality_checks'>;
  const { toast } = useToast();
  const router = useRouter();

  // State
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Fetch data
  const inspection = useQuery(api.qualityChecks.getById, { checkId: inspectionId });
  const entityHistory = useQuery(
    api.qualityChecks.getByEntity,
    inspection
      ? {
          entityType: inspection.entity_type,
          entityId: inspection.entity_id,
        }
      : 'skip'
  );

  // Mutations
  const updateFollowUp = useMutation(api.qualityChecks.updateFollowUp);
  const deleteDraft = useMutation(api.qualityChecks.deleteDraft);

  // Handlers
  const handleEdit = () => {
    router.push(`/quality-checks/inspections/${inspectionId}/edit`);
  };

  const handleExportPDF = () => {
    toast({
      title: 'Exportando PDF',
      description: 'La funcionalidad de exportacion estara disponible pronto.',
    });
  };

  const handleDelete = async () => {
    if (!inspection || inspection.status !== 'draft') {
      toast({
        title: 'Error',
        description: 'Solo se pueden eliminar inspecciones en borrador.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteDraft({ checkId: inspectionId });
      toast({
        title: 'Inspeccion eliminada',
        description: 'La inspeccion ha sido eliminada exitosamente.',
      });
      router.push('/quality-checks');
    } catch (error) {
      console.error('Error deleting inspection:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la inspeccion.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateIncident = () => {
    // Navigate to compliance module with pre-filled data
    toast({
      title: 'Crear Incidente',
      description: 'Redirigiendo al modulo de cumplimiento...',
    });
    // router.push(`/compliance/incidents/create?inspectionId=${inspectionId}`);
  };

  const handleScheduleFollowUp = () => {
    toast({
      title: 'Programar Seguimiento',
      description: 'Funcionalidad en desarrollo.',
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !inspection) return;

    try {
      setIsAddingNote(true);
      const currentNotes = inspection.notes || '';
      const updatedNotes = currentNotes
        ? `${currentNotes}\n\n---\n\n${newNote.trim()}`
        : newNote.trim();

      await updateFollowUp({
        checkId: inspectionId,
        followUpRequired: inspection.follow_up_required,
        followUpDate: inspection.follow_up_date,
        notes: updatedNotes,
      });

      toast({
        title: 'Nota agregada',
        description: 'La nota se ha agregado exitosamente.',
      });
      setNewNote('');
      setAddNoteDialogOpen(false);
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'No se pudo agregar la nota.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  // Loading state
  if (inspection === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Not found state
  if (inspection === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Inspeccion no encontrada"
          icon={AlertTriangle}
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Quality Checks', href: '/quality-checks' },
            { label: 'Inspeccion no encontrada' },
          ]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Inspeccion no encontrada
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              La inspeccion que estas buscando no existe o ha sido eliminada.
            </p>
            <Button onClick={() => router.push('/quality-checks')}>
              Volver a Quality Checks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get result badge config
  const resultConfig = resultBadgeConfig[inspection.overall_result as keyof typeof resultBadgeConfig] || resultBadgeConfig.pending;
  const ResultIcon = resultConfig.icon;
  const statusInfo = statusConfig[inspection.status as keyof typeof statusConfig] || statusConfig.draft;

  // Get template structure
  const templateStructure = inspection.templateStructure as TemplateStructure | null;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if AI analysis exists
  const hasAiAnalysis = inspection.ai_analysis_results && Object.keys(inspection.ai_analysis_results).length > 0;
  const hasPestDetection = hasAiAnalysis && inspection.ai_analysis_results?.pest_detection;
  const hasQualityGrading = hasAiAnalysis && inspection.ai_analysis_results?.quality_grading;

  // Filter history to exclude current inspection
  const previousInspections = entityHistory?.filter((h) => h._id !== inspectionId) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Inspeccion ${inspection.entity_type === 'batch' ? 'Lote' : 'Planta'}`}
        icon={ClipboardCheck}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Quality Checks', href: '/quality-checks' },
          { label: 'Inspecciones' },
          { label: inspectionId.slice(-6) },
        ]}
        action={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {inspection.status === 'draft' && (
                  <>
                    <DropdownMenuItem onClick={handleEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar PDF
                </DropdownMenuItem>
                {inspection.status === 'draft' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Inspection Header Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Left side - Metadata */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {format(new Date(inspection.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                </span>
              </div>

              {inspection.templateName && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Template:</span>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm font-medium text-blue-600"
                    onClick={() => router.push(`/quality-checks/templates/${inspection.template_id}`)}
                  >
                    {inspection.templateName}
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Entidad:</span>
                <span className="text-sm font-medium">
                  {inspection.entity_type === 'batch' ? 'Lote' : 'Planta'} - {inspection.entity_id}
                </span>
              </div>

              {inspection.performerName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Inspector:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                        {getInitials(inspection.performerName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{inspection.performerName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Status badges */}
            <div className="flex flex-col gap-2 items-start sm:items-end">
              <Badge className={`border-2 ${resultConfig.color} px-3 py-1`}>
                <ResultIcon className="h-4 w-4 mr-1" />
                {resultConfig.label}
              </Badge>
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
              {hasAiAnalysis && (
                <Badge variant="outline" className="border-purple-200 text-purple-700">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Asistido
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Resultado General</span>
              <Badge className={`border ${resultConfig.color}`}>
                {resultConfig.label}
              </Badge>
            </div>

            {inspection.duration_minutes !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duracion</span>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {inspection.duration_minutes} min
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Asistencia IA</span>
              <Badge variant={hasAiAnalysis ? 'default' : 'outline'}>
                {hasAiAnalysis ? 'Si' : 'No'}
              </Badge>
            </div>

            {inspection.status === 'completed' && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completado</span>
                  <span className="text-sm font-medium">
                    {format(new Date(inspection.created_at), 'd MMM yyyy', { locale: es })}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Notes & Observations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Notas y Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inspection.notes ? (
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {inspection.notes}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sin notas</p>
            )}

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Requiere Seguimiento</span>
                <Badge variant={inspection.follow_up_required ? 'destructive' : 'outline'}>
                  {inspection.follow_up_required ? 'Si' : 'No'}
                </Badge>
              </div>

              {inspection.follow_up_required && inspection.follow_up_date && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Fecha de seguimiento:</span>
                  <span className="font-medium">
                    {format(new Date(inspection.follow_up_date), "d 'de' MMMM, yyyy", { locale: es })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card: Inspection Form */}
      {templateStructure && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Formulario de Inspeccion
            </CardTitle>
            <CardDescription>
              Respuestas completas del formulario de inspeccion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicFormRenderer
              template={templateStructure}
              initialValues={inspection.form_data || {}}
              readOnly={true}
              showSubmitButton={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Card: AI Analysis Results - Pest Detection */}
      {hasPestDetection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Analisis de IA - Deteccion de Plagas
            </CardTitle>
            <CardDescription>
              Resultados del analisis automatico de imagenes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PestDetectionResult result={inspection.ai_analysis_results.pest_detection} />
          </CardContent>
        </Card>
      )}

      {/* Card: AI Analysis Results - Quality Grading */}
      {hasQualityGrading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Analisis de IA - Clasificacion de Calidad
            </CardTitle>
            <CardDescription>
              Evaluacion automatica de la calidad del producto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QualityGradeResult result={inspection.ai_analysis_results.quality_grading} />
          </CardContent>
        </Card>
      )}

      {/* Card: Follow-Up Actions */}
      {inspection.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Acciones de Seguimiento
            </CardTitle>
            <CardDescription>
              Acciones recomendadas basadas en los resultados de la inspeccion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCreateIncident}
            >
              <AlertOctagon className="h-4 w-4 mr-2" />
              Crear Incidente de Cumplimiento
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleScheduleFollowUp}
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Programar Seguimiento
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setAddNoteDialogOpen(true)}
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Agregar Nota
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Card: History - Previous Inspections */}
      {previousInspections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Inspecciones
            </CardTitle>
            <CardDescription>
              Inspecciones previas en la misma entidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {previousInspections.slice(0, 5).map((prev) => {
                const prevResultConfig = resultBadgeConfig[prev.overall_result as keyof typeof resultBadgeConfig] || resultBadgeConfig.pending;
                const PrevResultIcon = prevResultConfig.icon;

                return (
                  <div
                    key={prev._id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/quality-checks/inspections/${prev._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <PrevResultIcon className={`h-5 w-5 ${prevResultConfig.color.split(' ')[1]}`} />
                      <div>
                        <p className="text-sm font-medium">{prev.templateName || 'Inspeccion'}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(prev.created_at), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <Badge className={`border ${prevResultConfig.color}`}>
                      {prevResultConfig.label}
                    </Badge>
                  </div>
                );
              })}

              {previousInspections.length > 5 && (
                <Button
                  variant="link"
                  className="w-full text-sm text-blue-600"
                  onClick={() => router.push(`/quality-checks?entityId=${inspection.entity_id}`)}
                >
                  Ver todas las inspecciones ({previousInspections.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Note Dialog */}
      <Dialog open={addNoteDialogOpen} onOpenChange={setAddNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nota</DialogTitle>
            <DialogDescription>
              Agrega observaciones adicionales a esta inspeccion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Nota</Label>
              <Textarea
                id="note"
                placeholder="Escribe tu observacion aqui..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddNoteDialogOpen(false);
                setNewNote('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isAddingNote}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isAddingNote ? 'Guardando...' : 'Agregar Nota'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
