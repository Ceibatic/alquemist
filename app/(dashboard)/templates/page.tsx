'use client';

import { useMemo, useCallback, Suspense } from 'react';
import { useQuery } from 'convex/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { TemplateList } from '@/components/templates/template-list';
import { ActivityTemplateList } from '@/components/activity-templates/activity-template-list';
import { QualityTemplateList } from '@/components/quality-checks/quality-template-list';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import {
  LayoutTemplate,
  Layers,
  BarChart3,
  CheckCircle,
  ClipboardList,
  ClipboardCheck,
  Repeat,
  Link2,
} from 'lucide-react';

type TabValue = 'production' | 'activities' | 'quality';

const TAB_CONFIG: Record<TabValue, { title: string; description: string }> = {
  production: {
    title: 'Templates',
    description: 'Crea y gestiona plantillas reutilizables para tus procesos de produccion',
  },
  activities: {
    title: 'Templates',
    description: 'Plantillas de actividades estandarizadas para operaciones de cultivo',
  },
  quality: {
    title: 'Templates',
    description: 'Plantillas de control de calidad para inspecciones y chequeos',
  },
};

function ProductionStats({ companyId }: { companyId: Id<'companies'> }) {
  const templates = useQuery(
    api.productionTemplates.list,
    { companyId, status: 'active' }
  );

  const stats = useMemo<CompactStat[]>(() => {
    if (!templates) {
      return [
        { label: 'Templates', value: 0, icon: LayoutTemplate, color: 'default' },
        { label: 'Fases', value: 0, icon: Layers, color: 'default' },
        { label: 'Usos', value: 0, icon: BarChart3, color: 'default' },
        { label: 'Exito', value: '-', icon: CheckCircle, color: 'green' },
      ];
    }

    const totalTemplates = templates.length;
    const totalPhases = templates.reduce((sum, t) => sum + (t.phasesCount || 0), 0);
    const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);

    const templatesWithSuccess = templates.filter(
      (t) => t.average_success_rate !== undefined && t.average_success_rate !== null
    );
    const avgSuccess =
      templatesWithSuccess.length > 0
        ? Math.round(
            (templatesWithSuccess.reduce((sum, t) => sum + (t.average_success_rate || 0), 0) /
              templatesWithSuccess.length) *
              100
          )
        : null;

    return [
      { label: 'Templates', value: totalTemplates, icon: LayoutTemplate, color: 'default' },
      { label: 'Fases', value: totalPhases, icon: Layers, color: 'default' },
      { label: 'Usos', value: totalUsage, icon: BarChart3, color: 'default' },
      {
        label: 'Exito',
        value: avgSuccess !== null ? `${avgSuccess}%` : '-',
        icon: CheckCircle,
        color: 'green',
      },
    ];
  }, [templates]);

  return <CompactStats stats={stats} />;
}

function ActivityStats({ companyId }: { companyId: Id<'companies'> }) {
  const templates = useQuery(
    api.activityTemplates.list,
    { companyId, isActive: true }
  );

  const stats = useMemo<CompactStat[]>(() => {
    if (!templates) {
      return [
        { label: 'Templates', value: 0, icon: ClipboardList, color: 'default' },
        { label: 'Tipos', value: 0, icon: Layers, color: 'default' },
        { label: 'Recurrentes', value: 0, icon: Repeat, color: 'default' },
        { label: 'Con QC', value: 0, icon: Link2, color: 'blue' },
      ];
    }

    const totalTemplates = templates.length;
    const uniqueTypes = new Set(templates.map((t) => t.type_id)).size;
    const recurring = templates.filter(
      (t) => t.frequency_type && t.frequency_type !== 'once' && t.frequency_type !== 'on_demand'
    ).length;
    const withQC = templates.filter((t) => t.quality_check_template_id).length;

    return [
      { label: 'Templates', value: totalTemplates, icon: ClipboardList, color: 'default' },
      { label: 'Tipos', value: uniqueTypes, icon: Layers, color: 'default' },
      { label: 'Recurrentes', value: recurring, icon: Repeat, color: 'default' },
      { label: 'Con QC', value: withQC, icon: Link2, color: 'blue' },
    ];
  }, [templates]);

  return <CompactStats stats={stats} />;
}

function QualityStats({ companyId }: { companyId: Id<'companies'> }) {
  const templates = useQuery(
    api.qualityCheckTemplates.list,
    { companyId, status: 'active' }
  );

  const stats = useMemo<CompactStat[]>(() => {
    if (!templates) {
      return [
        { label: 'Templates', value: 0, icon: ClipboardCheck, color: 'default' },
        { label: 'Procedimientos', value: 0, icon: Layers, color: 'default' },
        { label: 'Inspecciones', value: 0, icon: BarChart3, color: 'default' },
        { label: 'Tiempo Prom.', value: '-', icon: CheckCircle, color: 'default' },
      ];
    }

    const totalTemplates = templates.length;
    const uniqueProcedures = new Set(
      templates.map((t) => t.procedure_type).filter(Boolean)
    ).size;
    const totalInspections = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);

    const templatesWithTime = templates.filter(
      (t) => t.average_completion_time_minutes != null
    );
    const avgTime =
      templatesWithTime.length > 0
        ? Math.round(
            templatesWithTime.reduce(
              (sum, t) => sum + (t.average_completion_time_minutes || 0),
              0
            ) / templatesWithTime.length
          )
        : null;

    return [
      { label: 'Templates', value: totalTemplates, icon: ClipboardCheck, color: 'default' },
      { label: 'Procedimientos', value: uniqueProcedures, icon: Layers, color: 'default' },
      { label: 'Inspecciones', value: totalInspections, icon: BarChart3, color: 'default' },
      {
        label: 'Tiempo Prom.',
        value: avgTime !== null ? `${avgTime} min` : '-',
        icon: CheckCircle,
        color: 'default',
      },
    ];
  }, [templates]);

  return <CompactStats stats={stats} />;
}

function TemplatesPageContent() {
  const { currentCompanyId, isLoading: facilityLoading } = useFacility();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = (searchParams.get('tab') as TabValue) || 'production';
  const config = TAB_CONFIG[activeTab] || TAB_CONFIG.production;

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams();
      if (value !== 'production') {
        params.set('tab', value);
      }
      const query = params.toString();
      router.replace(`/templates${query ? `?${query}` : ''}`, { scroll: false });
    },
    [router]
  );

  // Loading state
  if (facilityLoading || !currentCompanyId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={config.title}
        icon={LayoutTemplate}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Templates' }]}
        description={config.description}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="production">Produccion</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="quality">Calidad</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-6">
          <ProductionStats companyId={currentCompanyId} />
          <TemplateList companyId={currentCompanyId} />
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <ActivityStats companyId={currentCompanyId} />
          <ActivityTemplateList companyId={currentCompanyId} />
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <QualityStats companyId={currentCompanyId} />
          <QualityTemplateList companyId={currentCompanyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-80" />
        </div>
      }
    >
      <TemplatesPageContent />
    </Suspense>
  );
}
