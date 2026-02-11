'use client';

import { Suspense, useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { TemplateList } from '@/components/templates/template-list';
import { ActivityTemplateList } from '@/components/activity-templates/activity-template-list';
import { QCTemplateCard } from '@/components/quality-checks/qc-template-card';
import { QCHistoryList } from '@/components/quality-checks/qc-history-list';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useFacility } from '@/components/providers/facility-provider';
import {
  LayoutTemplate,
  Layers,
  BarChart3,
  CheckCircle,
  FileText,
  Repeat,
  Package,
  ClipboardCheck,
  Brain,
  Clock,
  Search,
  Plus,
  X,
  ChevronDown,
  Leaf,
  LayoutGrid,
  History,
} from 'lucide-react';

const TAB_KEYS = ['production', 'activities', 'quality'] as const;
type TabKey = (typeof TAB_KEYS)[number];

function isValidTab(value: string | null): value is TabKey {
  return TAB_KEYS.includes(value as TabKey);
}

function TemplatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { currentCompanyId, currentFacilityId, isLoading: facilityLoading } = useFacility();

  // Tab state from URL
  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = isValidTab(tabParam) ? tabParam : 'production';

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'production') {
        params.delete('tab');
      } else {
        params.set('tab', value);
      }
      const qs = params.toString();
      router.replace(`/templates${qs ? `?${qs}` : ''}`);
    },
    [router, searchParams]
  );

  // --- Production tab data ---
  const productionTemplates = useQuery(
    api.productionTemplates.list,
    currentCompanyId ? { companyId: currentCompanyId, status: 'active' } : ('skip' as any)
  );

  const productionStats = useMemo<CompactStat[]>(() => {
    if (!productionTemplates) {
      return [
        { label: 'Templates', value: 0, icon: LayoutTemplate, color: 'default' },
        { label: 'Fases', value: 0, icon: Layers, color: 'default' },
        { label: 'Usos', value: 0, icon: BarChart3, color: 'default' },
        { label: 'Exito', value: '-', icon: CheckCircle, color: 'green' },
      ];
    }
    const totalPhases = productionTemplates.reduce((sum, t) => sum + (t.phasesCount || 0), 0);
    const totalUsage = productionTemplates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
    const withSuccess = productionTemplates.filter(
      (t) => t.average_success_rate !== undefined && t.average_success_rate !== null
    );
    const avgSuccess =
      withSuccess.length > 0
        ? Math.round(
            (withSuccess.reduce((sum, t) => sum + (t.average_success_rate || 0), 0) /
              withSuccess.length) *
              100
          )
        : null;
    return [
      { label: 'Templates', value: productionTemplates.length, icon: LayoutTemplate, color: 'default' },
      { label: 'Fases', value: totalPhases, icon: Layers, color: 'default' },
      { label: 'Usos', value: totalUsage, icon: BarChart3, color: 'default' },
      { label: 'Exito', value: avgSuccess !== null ? `${avgSuccess}%` : '-', icon: CheckCircle, color: 'green' },
    ];
  }, [productionTemplates]);

  // --- Activities tab data ---
  const activityTemplates = useQuery(
    api.activityTemplates.list,
    currentCompanyId ? { companyId: currentCompanyId } : ('skip' as any)
  );

  const activityStats = useMemo<CompactStat[]>(() => {
    if (!activityTemplates) {
      return [
        { label: 'Templates', value: 0, icon: FileText, color: 'default' },
        { label: 'Activos', value: 0, icon: CheckCircle, color: 'green' },
        { label: 'Recurrentes', value: 0, icon: Repeat, color: 'default' },
        { label: 'Fases', value: 0, icon: Package, color: 'default' },
      ];
    }
    const active = activityTemplates.filter((t) => t.is_active).length;
    const recurring = activityTemplates.filter(
      (t) => t.frequency_type !== 'once' && t.frequency_type !== 'on_demand'
    ).length;
    const withPhases = new Set(activityTemplates.flatMap((t) => t.applicable_phases)).size;
    return [
      { label: 'Templates', value: activityTemplates.length, icon: FileText, color: 'default' },
      { label: 'Activos', value: active, icon: CheckCircle, color: 'green' },
      { label: 'Recurrentes', value: recurring, icon: Repeat, color: 'default' },
      { label: 'Fases', value: withPhases, icon: Package, color: 'default' },
    ];
  }, [activityTemplates]);

  // --- Quality tab data ---
  const [selectedCropType, setSelectedCropType] = useState<string | null>(null);
  const [qcSearchQuery, setQcSearchQuery] = useState('');
  const [qcSubTab, setQcSubTab] = useState<'templates' | 'history'>('templates');
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [templateToArchive, setTemplateToArchive] = useState<any>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const qcTemplates = useQuery(
    api.qualityCheckTemplates.list,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          cropTypeId: selectedCropType ? (selectedCropType as Id<'crop_types'>) : undefined,
          status: 'active' as const,
        }
      : ('skip' as any)
  );

  const cropTypes = useQuery(api.crops.getCropTypes, {});

  const archiveQcTemplate = useMutation(api.qualityCheckTemplates.archive);
  const duplicateQcTemplate = useMutation(api.qualityCheckTemplates.duplicate);

  const filteredQcTemplates = useMemo(() => {
    if (!qcTemplates) return [];
    let result = qcTemplates;
    if (qcSearchQuery.trim()) {
      const q = qcSearchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.cropTypeName?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [qcTemplates, qcSearchQuery]);

  const qualityStats = useMemo<CompactStat[]>(() => {
    if (!qcTemplates) {
      return [
        { label: 'Templates', value: 0, icon: ClipboardCheck, color: 'default' },
        { label: 'Con AI', value: 0, icon: Brain, color: 'purple' },
        { label: 'Usos', value: 0, icon: BarChart3, color: 'default' },
        { label: 'Tiempo Prom', value: '-', icon: Clock, color: 'default' },
      ];
    }
    const aiTemplates = qcTemplates.filter((t) => t.ai_assisted).length;
    const totalUsage = qcTemplates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
    const withTime = qcTemplates.filter((t) => t.average_completion_time_minutes);
    const avgTime =
      withTime.length > 0
        ? Math.round(
            withTime.reduce((sum, t) => sum + (t.average_completion_time_minutes || 0), 0) /
              withTime.length
          )
        : null;
    return [
      { label: 'Templates', value: qcTemplates.length, icon: ClipboardCheck, color: 'default' },
      { label: 'Con AI', value: aiTemplates, icon: Brain, color: 'purple' },
      { label: 'Usos', value: totalUsage, icon: BarChart3, color: 'default' },
      { label: 'Tiempo Prom', value: avgTime !== null ? `${avgTime} min` : '-', icon: Clock, color: 'default' },
    ];
  }, [qcTemplates]);

  const cropTypeOptions = [
    { value: null as string | null, label: 'Todos los tipos', icon: LayoutGrid },
    ...(cropTypes?.map((ct) => ({
      value: ct._id as string | null,
      label: ct.display_name_es,
      icon: Leaf,
    })) || []),
  ];

  const selectedCropTypeOption =
    cropTypeOptions.find((opt) => opt.value === selectedCropType) || cropTypeOptions[0];
  const SelectedCropIcon = selectedCropTypeOption.icon;

  // QC handlers
  const handleViewQcTemplate = (template: any) => {
    router.push(`/quality-checks/templates/${template._id}`);
  };

  const handleEditQcTemplate = (template: any) => {
    router.push(`/quality-checks/templates/${template._id}/edit`);
  };

  const handleDuplicateQcTemplate = async (template: any) => {
    try {
      await duplicateQcTemplate({ templateId: template._id as Id<'quality_check_templates'> });
      toast({ title: 'Template duplicado', description: `Se ha creado una copia de "${template.name}".` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo duplicar el template.', variant: 'destructive' });
    }
  };

  const handleArchiveQcTemplate = (template: any) => {
    setTemplateToArchive(template);
    setArchiveDialogOpen(true);
  };

  const confirmArchiveQcTemplate = async () => {
    if (!templateToArchive) return;
    try {
      setIsArchiving(true);
      await archiveQcTemplate({ templateId: templateToArchive._id as Id<'quality_check_templates'> });
      toast({ title: 'Template archivado', description: `"${templateToArchive.name}" ha sido archivado.` });
      setArchiveDialogOpen(false);
      setTemplateToArchive(null);
    } catch {
      toast({ title: 'Error', description: 'No se pudo archivar el template.', variant: 'destructive' });
    } finally {
      setIsArchiving(false);
    }
  };

  const clearQcFilters = () => {
    setQcSearchQuery('');
    setSelectedCropType(null);
  };

  // Current stats based on active tab
  const currentStats =
    activeTab === 'production'
      ? productionStats
      : activeTab === 'activities'
        ? activityStats
        : qualityStats;

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
        title="Templates"
        icon={LayoutTemplate}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Templates' }]}
        description="Gestiona templates de produccion, actividades y control de calidad"
      />

      {/* Compact Stats — per active tab */}
      <CompactStats stats={currentStats} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="production" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Produccion
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Actividades
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Calidad
          </TabsTrigger>
        </TabsList>

        {/* --- Production Tab --- */}
        <TabsContent value="production" className="space-y-4">
          <TemplateList companyId={currentCompanyId} />
        </TabsContent>

        {/* --- Activities Tab --- */}
        <TabsContent value="activities" className="space-y-4">
          <ActivityTemplateList companyId={currentCompanyId} />
        </TabsContent>

        {/* --- Quality Tab --- */}
        <TabsContent value="quality" className="space-y-4">
          {/* Sub-tabs: Templates | Historial */}
          <Tabs value={qcSubTab} onValueChange={(v) => setQcSubTab(v as 'templates' | 'history')}>
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Crop Type Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
                      <span className="flex items-center gap-2">
                        <SelectedCropIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{selectedCropTypeOption.label}</span>
                        <span className="sm:hidden">Tipo</span>
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    {cropTypeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <DropdownMenuItem
                          key={option.value || 'all'}
                          onClick={() => setSelectedCropType(option.value)}
                          className={selectedCropType === option.value ? 'bg-gray-100' : ''}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {option.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar templates..."
                    value={qcSearchQuery}
                    onChange={(e) => setQcSearchQuery(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {qcSearchQuery && (
                    <button
                      onClick={() => setQcSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Create Button */}
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Crear Template</span>
                </Button>
              </div>

              {/* Templates Grid */}
              {qcTemplates === undefined ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-64" />
                  ))}
                </div>
              ) : filteredQcTemplates.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardCheck className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">
                      {qcSearchQuery || selectedCropType
                        ? 'No se encontraron templates que coincidan con tu busqueda'
                        : 'No hay templates de control de calidad'}
                    </p>
                    {(qcSearchQuery || selectedCropType) && (
                      <Button variant="link" className="mt-2 text-blue-700" onClick={clearQcFilters}>
                        Limpiar filtros
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredQcTemplates.map((template: any) => (
                    <QCTemplateCard
                      key={template._id}
                      template={template}
                      onView={() => handleViewQcTemplate(template)}
                      onEdit={() => handleEditQcTemplate(template)}
                      onDuplicate={() => handleDuplicateQcTemplate(template)}
                      onArchive={() => handleArchiveQcTemplate(template)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {currentCompanyId && (
                <QCHistoryList
                  companyId={currentCompanyId}
                  facilityId={currentFacilityId || undefined}
                />
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Archive Confirmation Dialog (QC) */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar template?</AlertDialogTitle>
            <AlertDialogDescription>
              {templateToArchive && (
                <>
                  El template <strong>{templateToArchive.name}</strong> sera archivado
                  y no aparecera en la lista principal.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchiveQcTemplate}
              disabled={isArchiving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isArchiving ? 'Archivando...' : 'Archivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <TemplatesPageContent />
    </Suspense>
  );
}
