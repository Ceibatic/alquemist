'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutTemplate, Pencil, Copy, Layers, Calendar, Plus } from 'lucide-react';

// ── Label maps ─────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  seed_to_harvest: 'Semilla a Cosecha',
  'seed-to-harvest': 'Semilla a Cosecha',
  propagation: 'Propagación',
  custom: 'Personalizado',
};

const METHOD_LABELS: Record<string, string> = {
  indoor: 'Interior',
  outdoor: 'Exterior',
  greenhouse: 'Invernadero',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const AREA_TYPE_LABELS: Record<string, string> = {
  propagation: 'Propagación',
  vegetative: 'Vegetativo',
  flowering: 'Floración',
  drying: 'Secado',
  curing: 'Curado',
  storage: 'Almacenamiento',
  processing: 'Procesamiento',
};

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  watering: 'bg-blue-100 text-blue-700',
  feeding: 'bg-green-100 text-green-700',
  pruning: 'bg-orange-100 text-orange-700',
  transplanting: 'bg-purple-100 text-purple-700',
  inspection: 'bg-cyan-100 text-cyan-700',
  treatment: 'bg-red-100 text-red-700',
  harvest: 'bg-amber-100 text-amber-700',
  drying: 'bg-yellow-100 text-yellow-700',
  curing: 'bg-teal-100 text-teal-700',
  quality_check: 'bg-indigo-100 text-indigo-700',
  monitoring: 'bg-sky-100 text-sky-700',
  planting: 'bg-lime-100 text-lime-700',
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  watering: 'Riego',
  feeding: 'Fertilización',
  pruning: 'Poda',
  transplanting: 'Trasplante',
  inspection: 'Inspección',
  treatment: 'Tratamiento',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
  quality_check: 'Control Calidad',
  monitoring: 'Monitoreo',
  planting: 'Siembra',
};

// Timeline bar colors — amber first, then a varied palette
const TIMELINE_COLORS = [
  'bg-amber-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-orange-500',
];

// ── Types ───────────────────────────────────────────────────────────────────

interface Activity {
  _id: string;
  activity_name: string;
  activity_type: string;
  is_recurring: boolean;
  is_quality_check: boolean;
  estimated_duration_minutes?: number;
  activity_order: number;
  [key: string]: unknown;
}

interface Phase {
  _id: string;
  phase_name: string;
  estimated_duration_days: number;
  area_type: string;
  phase_order: number;
  activities: Activity[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function groupByType(activities: Activity[]): Record<string, number> {
  return activities.reduce<Record<string, number>>((acc, act) => {
    acc[act.activity_type] = (acc[act.activity_type] ?? 0) + 1;
    return acc;
  }, {});
}

// ── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function PhaseCard({
  phase,
  index,
  templateId,
  onClick,
}: {
  phase: Phase;
  index: number;
  templateId: string;
  onClick: () => void;
}) {
  const typeCounts = groupByType(phase.activities ?? []);
  const areaLabel = AREA_TYPE_LABELS[phase.area_type] ?? phase.area_type;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="flex items-center gap-4 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      {/* Phase number badge */}
      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>

      {/* Phase info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{phase.phase_name}</p>
        <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {phase.estimated_duration_days} días
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {areaLabel}
          </span>
        </div>
      </div>

      {/* Activity type badges */}
      <div className="flex flex-wrap gap-1.5 justify-end flex-shrink-0 max-w-xs">
        {Object.entries(typeCounts)
          .filter(([, count]) => count > 0)
          .map(([type, count]) => (
            <Badge
              key={type}
              className={ACTIVITY_TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700'}
            >
              {count} {ACTIVITY_TYPE_LABELS[type] ?? type}
            </Badge>
          ))}
        {phase.activities?.length === 0 && (
          <span className="text-xs text-muted-foreground">Sin actividades</span>
        )}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
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
      toast.success('Template duplicado', {
        description: 'Se ha creado una copia del template.',
      });
      router.push(`/templates/${newId}/edit`);
    } catch {
      toast.error('Error', {
        description: 'No se pudo duplicar el template.',
      });
    }
  };

  // Loading state
  if (template === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
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

  const phases: Phase[] = template.phases ?? [];
  const totalDays = template.estimated_duration_days || 1;

  // Build info rows — only include rows with a meaningful value
  const infoRows: { label: string; value: React.ReactNode }[] = [];

  if (template.cropTypeName) {
    infoRows.push({ label: 'Tipo de Cultivo', value: template.cropTypeName });
  }
  infoRows.push({
    label: 'Cultivar',
    value: template.cultivarName ?? 'Cualquiera',
  });
  if (template.template_category) {
    infoRows.push({
      label: 'Categoría',
      value: CATEGORY_LABELS[template.template_category] ?? template.template_category,
    });
  }
  if (template.production_method) {
    infoRows.push({
      label: 'Método',
      value: METHOD_LABELS[template.production_method] ?? template.production_method,
    });
  }
  if (template.estimated_duration_days != null) {
    infoRows.push({
      label: 'Duración Total',
      value: `${template.estimated_duration_days} días`,
    });
  }
  if (template.default_batch_size != null) {
    infoRows.push({
      label: 'Tamaño Batch',
      value: `${template.default_batch_size} plantas`,
    });
  }
  if (template.estimated_yield != null) {
    infoRows.push({
      label: 'Rendimiento Est.',
      value: `${template.estimated_yield}${template.yield_unit ? ` ${template.yield_unit}` : ''}`,
    });
  }
  if (template.difficulty_level) {
    infoRows.push({
      label: 'Dificultad',
      value: DIFFICULTY_LABELS[template.difficulty_level] ?? template.difficulty_level,
    });
  }
  infoRows.push({ label: 'Veces Usado', value: template.usage_count ?? 0 });

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
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => router.push(`/templates/${templateId}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        }
      />

      {/* ── Info Card ─────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-x-12 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {infoRows.map(({ label, value }) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Phases Section ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            Fases
            <span className="text-sm font-normal text-muted-foreground">
              ({phases.length})
            </span>
          </h2>
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => router.push(`/templates/${templateId}/edit`)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Agregar Fase
          </Button>
        </div>

        {phases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Layers className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-muted-foreground mb-4">
                Este template no tiene fases definidas aún.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push(`/templates/${templateId}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Agregar Fases
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Timeline bar */}
            <div className="flex gap-1 h-7 rounded-lg overflow-hidden">
              {phases.map((phase, index) => {
                const widthPct = (phase.estimated_duration_days / totalDays) * 100;
                return (
                  <div
                    key={phase._id}
                    className={`${TIMELINE_COLORS[index % TIMELINE_COLORS.length]} flex items-center justify-center text-white text-xs font-medium px-2 truncate`}
                    style={{ width: `${Math.max(widthPct, 4)}%` }}
                    title={`${phase.phase_name}: ${phase.estimated_duration_days} días`}
                  >
                    {widthPct > 8 ? phase.phase_name : ''}
                  </div>
                );
              })}
            </div>

            {/* Phase cards */}
            <div className="space-y-2">
              {phases.map((phase, index) => (
                <PhaseCard
                  key={phase._id}
                  phase={phase}
                  index={index}
                  templateId={templateId}
                  onClick={() =>
                    router.push(`/templates/${templateId}/phases/${phase._id}`)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
