'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { TemplateList } from '@/components/templates/template-list';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import { LayoutTemplate, Layers, BarChart3, CheckCircle } from 'lucide-react';

export default function TemplatesPage() {
  const { currentCompanyId, isLoading: facilityLoading } = useFacility();

  // Fetch templates for stats
  const templates = useQuery(
    api.productionTemplates.list,
    currentCompanyId ? { companyId: currentCompanyId, status: 'active' } : 'skip'
  );

  // Calculate stats
  const compactStats = useMemo<CompactStat[]>(() => {
    if (!templates) {
      return [
        { label: 'Total', value: 0, icon: LayoutTemplate, color: 'default' },
        { label: 'Fases', value: 0, icon: Layers, color: 'default' },
        { label: 'En Uso', value: 0, icon: BarChart3, color: 'default' },
        { label: 'Exito', value: '-', icon: CheckCircle, color: 'green' },
      ];
    }

    const totalTemplates = templates.length;
    const totalPhases = templates.reduce((sum, t) => sum + (t.phasesCount || 0), 0);
    const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);

    // Calculate average success rate
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
        title="Templates de Produccion"
        icon={LayoutTemplate}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Templates' }]}
        description="Crea y gestiona plantillas reutilizables para tus procesos de produccion"
      />

      {/* Compact Stats */}
      <CompactStats stats={compactStats} />

      {/* Template List - handles its own filters, search, and create modal */}
      <TemplateList companyId={currentCompanyId} />
    </div>
  );
}
