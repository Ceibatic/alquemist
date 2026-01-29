'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DynamicFormRenderer, TemplateStructure } from '@/components/quality-checks/dynamic-form-renderer';
import { useToast } from '@/hooks/use-toast';
import { useFacility } from '@/components/providers/facility-provider';
import { useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  Pencil,
  Copy,
  Play,
  Archive,
  Brain,
  FileText,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Leaf,
} from 'lucide-react';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const procedureLabels: Record<string, string> = {
  visual: 'Visual',
  measurement: 'Medicion',
  laboratory: 'Laboratorio',
  health_check: 'Salud de Planta',
  pest_inspection: 'Inspeccion de Plagas',
  nutrient_check: 'Nutricion',
  harvest_quality: 'Calidad Cosecha',
  environmental: 'Ambiental',
  compliance: 'Cumplimiento',
};

const levelLabels: Record<string, string> = {
  batch: 'Lote',
  sample: 'Muestra',
  individual: 'Individual',
  basic: 'Basico',
  standard: 'Estandar',
  detailed: 'Detallado',
  comprehensive: 'Completo',
};

const stageLabels: Record<string, string> = {
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
};

const complianceStandardLabels: Record<string, string> = {
  INVIMA: 'INVIMA',
  ICA: 'ICA',
  FNC: 'FNC',
  GAP: 'GAP',
  ORGANIC: 'Organico',
};

const aiAnalysisLabels: Record<string, string> = {
  disease_detection: 'Deteccion de Enfermedades',
  pest_detection: 'Deteccion de Plagas',
  nutrient_deficiency: 'Deficiencias Nutricionales',
  growth_analysis: 'Analisis de Crecimiento',
  quality_grading: 'Clasificacion de Calidad',
  yield_prediction: 'Prediccion de Rendimiento',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function QCTemplateDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { currentCompanyId } = useFacility();

  const [startInspectionDialogOpen, setStartInspectionDialogOpen] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<'batch' | 'plant'>('batch');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');

  // Fetch data
  const template = useQuery(
    api.qualityCheckTemplates.getById,
    { templateId: params.id as Id<'quality_check_templates'> }
  );

  const batches = useQuery(
    api.batches.list,
    currentCompanyId ? { companyId: currentCompanyId } : 'skip'
  );

  const plants = useQuery(
    api.plants.list,
    currentCompanyId ? { companyId: currentCompanyId } : 'skip'
  );

  // Mutations
  const duplicateTemplate = useMutation(api.qualityCheckTemplates.duplicate);
  const archiveTemplate = useMutation(api.qualityCheckTemplates.archive);

  // Handlers
  const handleEdit = () => {
    router.push(`/quality-checks/templates/${params.id}/edit`);
  };

  const handleDuplicate = async () => {
    try {
      const newTemplateId = await duplicateTemplate({
        templateId: params.id as Id<'quality_check_templates'>,
      });
      toast({
        title: 'Template duplicado',
        description: 'Se ha creado una copia del template.',
      });
      router.push(`/quality-checks/templates/${newTemplateId}`);
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo duplicar el template.',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async () => {
    try {
      await archiveTemplate({
        templateId: params.id as Id<'quality_check_templates'>,
      });
      toast({
        title: 'Template archivado',
        description: 'El template ha sido archivado.',
      });
      router.push('/quality-checks');
    } catch (error) {
      console.error('Error archiving template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo archivar el template.',
        variant: 'destructive',
      });
    }
  };

  const handleStartInspection = () => {
    setStartInspectionDialogOpen(true);
  };

  const handleConfirmStartInspection = () => {
    if (!selectedEntityId) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una entidad para inspeccionar.',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to execution page
    router.push(
      `/quality-checks/execute?templateId=${params.id}&entityType=${selectedEntityType}&entityId=${selectedEntityId}`
    );
    setStartInspectionDialogOpen(false);
  };

  // Loading state
  if (template === undefined) {
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
  if (template === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Template no encontrado"
          icon={AlertCircle}
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Quality Checks', href: '/quality-checks' },
            { label: 'Template no encontrado' },
          ]}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Template no encontrado
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              El template que estas buscando no existe o ha sido eliminado.
            </p>
            <Button onClick={() => router.push('/quality-checks')}>
              Volver a Quality Checks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare template structure for renderer
  const templateStructure = template.template_structure as TemplateStructure;

  // Entity options for inspection
  const entityOptions =
    selectedEntityType === 'batch'
      ? batches?.map((b) => ({ value: b._id, label: b.code })) || []
      : plants?.map((p) => ({ value: p._id, label: p.name })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={template.name}
        icon={ClipboardCheck}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Quality Checks', href: '/quality-checks' },
          { label: 'Templates', href: '/quality-checks' },
          { label: template.name },
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
            <Button onClick={handleStartInspection} className="bg-amber-500 hover:bg-amber-600">
              <Play className="h-4 w-4 mr-2" />
              Iniciar Inspeccion
            </Button>
            <Button variant="ghost" onClick={handleArchive}>
              <Archive className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2">
        {template.ai_assisted && (
          <Badge variant="outline" className="gap-1 text-purple-600 border-purple-200">
            <Brain className="h-3 w-3" />
            AI
          </Badge>
        )}
        {template.regulatory_requirement && (
          <Badge className="bg-blue-100 text-blue-700">
            Regulatorio
          </Badge>
        )}
        {template.procedure_type && (
          <Badge variant="secondary">
            {procedureLabels[template.procedure_type] || template.procedure_type}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Informacion General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informacion General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Tipo de Cultivo</Label>
              <div className="flex items-center gap-2 mt-1">
                <Leaf className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{template.cropTypeName || 'Todos los cultivos'}</p>
              </div>
            </div>

            {template.procedure_type && (
              <div>
                <Label className="text-muted-foreground">Tipo de Procedimiento</Label>
                <p className="font-medium mt-1">
                  {procedureLabels[template.procedure_type] || template.procedure_type}
                </p>
              </div>
            )}

            {template.inspection_level && (
              <div>
                <Label className="text-muted-foreground">Nivel de Inspeccion</Label>
                <p className="font-medium mt-1">
                  {levelLabels[template.inspection_level] || template.inspection_level}
                </p>
              </div>
            )}

            {template.applicable_stages && template.applicable_stages.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Etapas Aplicables</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {template.applicable_stages.map((stage) => (
                    <Badge key={stage} variant="outline" className="text-xs">
                      {stageLabels[stage] || stage}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {template.frequency_recommendation && (
              <div>
                <Label className="text-muted-foreground">Frecuencia Recomendada</Label>
                <p className="font-medium mt-1">{template.frequency_recommendation}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <BarChart3 className="h-4 w-4" />
                  <Label className="text-muted-foreground">Veces Usado</Label>
                </div>
                <p className="text-2xl font-bold">{template.usage_count}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <Label className="text-muted-foreground">Tiempo Promedio</Label>
                </div>
                <p className="text-2xl font-bold">
                  {template.average_completion_time_minutes
                    ? `${Math.round(template.average_completion_time_minutes)} min`
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Compliance (conditional) */}
        {template.regulatory_requirement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Cumplimiento Regulatorio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.compliance_standard && (
                <div>
                  <Label className="text-muted-foreground">Estandar de Cumplimiento</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700">
                      {complianceStandardLabels[template.compliance_standard] ||
                        template.compliance_standard}
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Requerimiento Regulatorio</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Este template cumple con los requisitos regulatorios establecidos por las
                  autoridades competentes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card: AI Configuration (conditional) */}
        {template.ai_assisted && (
          <Card className={template.regulatory_requirement ? 'md:col-span-2' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Configuracion de IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Tipos de Analisis Habilitados</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {template.ai_analysis_types && template.ai_analysis_types.length > 0 ? (
                    template.ai_analysis_types.map((type) => (
                      <Badge key={type} variant="outline" className="text-purple-600 border-purple-200">
                        {aiAnalysisLabels[type] || type}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No se han configurado tipos de analisis</p>
                  )}
                </div>
              </div>

              {templateStructure?.generatedBy === 'ai' && (
                <div className="flex items-center gap-2 text-sm text-purple-600 pt-2 border-t">
                  <Brain className="h-4 w-4" />
                  <span>Formulario generado por IA</span>
                  {templateStructure.metadata?.confidence && (
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      Confianza: {Math.round(templateStructure.metadata.confidence * 100)}%
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Card: Form Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa del Formulario</CardTitle>
          <p className="text-sm text-muted-foreground">
            Esta es la estructura del formulario que se presentara durante la inspeccion.
          </p>
        </CardHeader>
        <CardContent>
          <DynamicFormRenderer
            template={templateStructure}
            readOnly={true}
            showSubmitButton={false}
          />
        </CardContent>
      </Card>

      {/* Start Inspection Dialog */}
      <Dialog open={startInspectionDialogOpen} onOpenChange={setStartInspectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Inspeccion</DialogTitle>
            <DialogDescription>
              Selecciona el tipo de entidad y la entidad especifica que deseas inspeccionar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Entidad</Label>
              <Select
                value={selectedEntityType}
                onValueChange={(value) => {
                  setSelectedEntityType(value as 'batch' | 'plant');
                  setSelectedEntityId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch">Lote</SelectItem>
                  <SelectItem value="plant">Planta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {selectedEntityType === 'batch' ? 'Seleccionar Lote' : 'Seleccionar Planta'}
              </Label>
              <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedEntityType === 'batch'
                        ? 'Selecciona un lote...'
                        : 'Selecciona una planta...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {entityOptions.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No hay {selectedEntityType === 'batch' ? 'lotes' : 'plantas'} disponibles
                    </div>
                  ) : (
                    entityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStartInspectionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmStartInspection}
              disabled={!selectedEntityId}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Iniciar Inspeccion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
