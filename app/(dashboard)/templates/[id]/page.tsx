'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutTemplate,
  Pencil,
  Copy,
  Play,
  Leaf,
  Calendar,
  Layers,
  BarChart3,
  Globe,
  Settings,
  Thermometer,
  Droplets,
  Sun,
  ChevronRight,
  Clock,
  CheckCircle,
  RefreshCw,
  Droplet,
  FlaskConical,
  Scissors,
  ArrowRight,
  Eye,
  Shield,
  Package,
  Timer,
  Move,
  Sprout,
} from 'lucide-react';

const categoryLabels: Record<string, string> = {
  'seed-to-harvest': 'Semilla a Cosecha',
  propagation: 'Propagacion',
  custom: 'Personalizado',
};

const methodLabels: Record<string, string> = {
  indoor: 'Interior',
  outdoor: 'Exterior',
  greenhouse: 'Invernadero',
};

const sourceLabels: Record<string, string> = {
  seed: 'Semilla',
  clone: 'Clon',
  tissue_culture: 'Cultivo de Tejido',
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Principiante', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Intermedio', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: 'Avanzado', color: 'bg-red-100 text-red-700' },
};

const activityTypeIcons: Record<string, any> = {
  watering: Droplet,
  feeding: FlaskConical,
  pruning: Scissors,
  transplanting: ArrowRight,
  inspection: Eye,
  treatment: Shield,
  harvest: Package,
  drying: Sun,
  curing: Timer,
  quality_check: CheckCircle,
  movement: Move,
  planting: Sprout,
};

const activityTypeLabels: Record<string, string> = {
  watering: 'Riego',
  feeding: 'Fertilizacion',
  pruning: 'Poda',
  transplanting: 'Trasplante',
  inspection: 'Inspeccion',
  treatment: 'Tratamiento',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
  quality_check: 'Control Calidad',
  movement: 'Movimiento',
  planting: 'Siembra',
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const templateId = params.id as string;

  const template = useQuery(api.productionTemplates.getById, {
    templateId: templateId as Id<'production_templates'>,
  });

  const duplicateTemplate = useMutation(api.productionTemplates.duplicate);

  const handleDuplicate = async () => {
    try {
      const newId = await duplicateTemplate({
        templateId: templateId as Id<'production_templates'>,
      });
      toast({
        title: 'Template duplicado',
        description: 'Se ha creado una copia del template.',
      });
      router.push(`/templates/${newId}/edit`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo duplicar el template.',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (template === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Not found
  if (template === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LayoutTemplate className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Template no encontrado</h2>
        <p className="text-muted-foreground mb-4">
          El template que buscas no existe o fue eliminado.
        </p>
        <Button onClick={() => router.push('/templates')}>
          Volver a Templates
        </Button>
      </div>
    );
  }

  const difficulty = template.difficulty_level
    ? difficultyConfig[template.difficulty_level]
    : null;

  const envReqs = template.environmental_requirements as {
    temperature_min?: number;
    temperature_max?: number;
    humidity_min?: number;
    humidity_max?: number;
    light_hours?: number;
  } | undefined;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={template.name}
        icon={LayoutTemplate}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Templates', href: '/templates' },
          { label: template.name },
        ]}
        description={template.description || undefined}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/templates/${templateId}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="mr-2 h-4 w-4" />
              Usar en Orden
            </Button>
          </div>
        }
      />

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1">
          <Leaf className="h-3 w-3" />
          {template.cropTypeName || 'Sin tipo'}
        </Badge>
        {template.cultivarName && (
          <Badge variant="outline">{template.cultivarName}</Badge>
        )}
        {template.template_category && (
          <Badge variant="secondary">
            {categoryLabels[template.template_category] || template.template_category}
          </Badge>
        )}
        {template.production_method && (
          <Badge variant="outline">
            {methodLabels[template.production_method] || template.production_method}
          </Badge>
        )}
        {template.source_type && (
          <Badge variant="outline">
            {sourceLabels[template.source_type] || template.source_type}
          </Badge>
        )}
        {difficulty && (
          <Badge className={difficulty.color}>{difficulty.label}</Badge>
        )}
        {template.is_public && (
          <Badge variant="outline" className="gap-1">
            <Globe className="h-3 w-3" />
            Publico
          </Badge>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* General Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Informacion General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Duracion Total</span>
              <span className="text-sm font-medium">
                {template.estimated_duration_days || '-'} dias
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rendimiento Est.</span>
              <span className="text-sm font-medium">
                {template.estimated_yield || '-'} {template.yield_unit || ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Costo Est.</span>
              <span className="text-sm font-medium">
                {template.estimated_cost
                  ? `$${template.estimated_cost.toLocaleString()}`
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Veces Usado</span>
              <span className="text-sm font-medium">{template.usage_count}</span>
            </div>
            {template.average_success_rate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasa de Exito</span>
                <span className="text-sm font-medium text-green-600">
                  {Math.round(template.average_success_rate * 100)}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Config */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuracion de Batch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tamano por Defecto</span>
              <span className="text-sm font-medium">
                {template.default_batch_size || 50} plantas
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tracking Individual</span>
              <span className="text-sm font-medium">
                {template.enable_individual_tracking ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fases</span>
              <span className="text-sm font-medium">
                {template.phases?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Requirements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Requerimientos Ambientales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {envReqs?.temperature_min !== undefined ||
            envReqs?.temperature_max !== undefined ? (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5" />
                  Temperatura
                </span>
                <span className="text-sm font-medium">
                  {envReqs.temperature_min || '-'}°C - {envReqs.temperature_max || '-'}°C
                </span>
              </div>
            ) : null}
            {envReqs?.humidity_min !== undefined ||
            envReqs?.humidity_max !== undefined ? (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5" />
                  Humedad
                </span>
                <span className="text-sm font-medium">
                  {envReqs.humidity_min || '-'}% - {envReqs.humidity_max || '-'}%
                </span>
              </div>
            ) : null}
            {envReqs?.light_hours !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sun className="h-3.5 w-3.5" />
                  Luz
                </span>
                <span className="text-sm font-medium">{envReqs.light_hours} horas</span>
              </div>
            )}
            {!envReqs && (
              <p className="text-sm text-muted-foreground">
                Sin requerimientos definidos
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Phases Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Fases de Produccion ({template.phases?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!template.phases || template.phases.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                Este template no tiene fases definidas
              </p>
              <Button
                variant="outline"
                onClick={() => router.push(`/templates/${templateId}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Agregar Fases
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline Bar */}
              <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                {template.phases.map((phase: any, index: number) => {
                  const totalDays = template.estimated_duration_days || 1;
                  const width = (phase.estimated_duration_days / totalDays) * 100;
                  const colors = [
                    'bg-green-500',
                    'bg-blue-500',
                    'bg-purple-500',
                    'bg-orange-500',
                    'bg-pink-500',
                    'bg-teal-500',
                  ];
                  return (
                    <div
                      key={phase._id}
                      className={`${colors[index % colors.length]} flex items-center justify-center text-white text-xs font-medium px-2 truncate`}
                      style={{ width: `${Math.max(width, 5)}%` }}
                      title={`${phase.phase_name}: ${phase.estimated_duration_days} dias`}
                    >
                      {width > 10 ? phase.phase_name : ''}
                    </div>
                  );
                })}
              </div>

              {/* Phase Cards */}
              <div className="space-y-3">
                {template.phases.map((phase: any, index: number) => (
                  <div
                    key={phase._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-medium text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{phase.phase_name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {phase.estimated_duration_days} dias
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers className="h-3.5 w-3.5" />
                              {phase.area_type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {phase.activities?.length || 0} actividades
                      </Badge>
                    </div>

                    {/* Activities */}
                    {phase.activities && phase.activities.length > 0 && (
                      <div className="ml-11 space-y-2">
                        {phase.activities.map((activity: any) => {
                          const ActivityIcon =
                            activityTypeIcons[activity.activity_type] || CheckCircle;
                          return (
                            <div
                              key={activity._id}
                              className="flex items-center gap-3 text-sm py-1"
                            >
                              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1">{activity.activity_name}</span>
                              <span className="text-muted-foreground">
                                {activityTypeLabels[activity.activity_type] ||
                                  activity.activity_type}
                              </span>
                              {activity.is_recurring && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <RefreshCw className="h-3 w-3" />
                                  Recurrente
                                </Badge>
                              )}
                              {activity.is_quality_check && (
                                <Badge
                                  variant="outline"
                                  className="text-xs gap-1 text-blue-600 border-blue-200"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  QC
                                </Badge>
                              )}
                              {activity.estimated_duration_minutes && (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {activity.estimated_duration_minutes}min
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
