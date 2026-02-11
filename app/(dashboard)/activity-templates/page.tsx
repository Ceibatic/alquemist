'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { ActivityTemplateList } from '@/components/activity-templates/activity-template-list';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import { FileText, CheckCircle, Repeat, Package } from 'lucide-react';

export default function ActivityTemplatesPage() {
  const { currentCompanyId, isLoading: facilityLoading } = useFacility();

  const templates = useQuery(
    api.activityTemplates.list,
    currentCompanyId ? { companyId: currentCompanyId } : 'skip' as any
  );

  const compactStats = useMemo<CompactStat[]>(() => {
    if (!templates) {
      return [
        { label: 'Total', value: 0, icon: FileText, color: 'default' },
        { label: 'Activos', value: 0, icon: CheckCircle, color: 'green' },
        { label: 'Recurrentes', value: 0, icon: Repeat, color: 'default' },
        { label: 'Con Recursos', value: 0, icon: Package, color: 'default' },
      ];
    }

    const active = templates.filter((t) => t.is_active).length;
    const recurring = templates.filter((t) => t.frequency_type !== 'once' && t.frequency_type !== 'on_demand').length;
    const withPhases = new Set(templates.flatMap((t) => t.applicable_phases)).size;

    return [
      { label: 'Templates', value: templates.length, icon: FileText, color: 'default' },
      { label: 'Activos', value: active, icon: CheckCircle, color: 'green' },
      { label: 'Recurrentes', value: recurring, icon: Repeat, color: 'default' },
      { label: 'Fases', value: withPhases, icon: Package, color: 'default' },
    ];
  }, [templates]);

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
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates de Actividad"
        icon={FileText}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Templates de Actividad' }]}
        description="Plantillas reutilizables que definen actividades estandar de cultivo"
      />

      <CompactStats stats={compactStats} />

      <ActivityTemplateList companyId={currentCompanyId} />
    </div>
  );
}
