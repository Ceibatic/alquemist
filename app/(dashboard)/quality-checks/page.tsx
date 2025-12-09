'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { QCTemplateCard } from '@/components/quality-checks/qc-template-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  ClipboardCheck,
  Search,
  Plus,
  X,
  ChevronDown,
  Leaf,
  LayoutGrid,
  Brain,
  BarChart3,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QualityChecksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentCompanyId, isLoading: facilityLoading } = useFacility();

  // Filter states
  const [selectedCropType, setSelectedCropType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Archive dialog state
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [templateToArchive, setTemplateToArchive] = useState<any>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Fetch data
  const templates = useQuery(
    api.qualityCheckTemplates.list,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          cropTypeId: selectedCropType
            ? (selectedCropType as Id<'crop_types'>)
            : undefined,
          status: 'active',
        }
      : 'skip'
  );

  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Mutations
  const archiveTemplate = useMutation(api.qualityCheckTemplates.archive);
  const duplicateTemplate = useMutation(api.qualityCheckTemplates.duplicate);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];

    let result = templates;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.cropTypeName?.toLowerCase().includes(query)
      );
    }

    // Sort by name
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [templates, searchQuery]);

  // Calculate stats
  const compactStats = useMemo<CompactStat[]>(() => {
    if (!templates) {
      return [
        { label: 'Templates', value: 0, icon: ClipboardCheck, color: 'default' },
        { label: 'Con AI', value: 0, icon: Brain, color: 'purple' },
        { label: 'Usos', value: 0, icon: BarChart3, color: 'default' },
        { label: 'Tiempo Prom', value: '-', icon: Clock, color: 'default' },
      ];
    }

    const totalTemplates = templates.length;
    const aiTemplates = templates.filter((t) => t.ai_assisted).length;
    const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);

    const templatesWithTime = templates.filter(
      (t) => t.average_completion_time_minutes
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
      { label: 'Con AI', value: aiTemplates, icon: Brain, color: 'purple' },
      { label: 'Usos', value: totalUsage, icon: BarChart3, color: 'default' },
      {
        label: 'Tiempo Prom',
        value: avgTime !== null ? `${avgTime} min` : '-',
        icon: Clock,
        color: 'default',
      },
    ];
  }, [templates]);

  // Get crop type options
  const cropTypeOptions = [
    { value: null, label: 'Todos los tipos', icon: LayoutGrid },
    ...(cropTypes?.map((ct) => ({
      value: ct._id,
      label: ct.display_name_es,
      icon: Leaf,
    })) || []),
  ];

  const selectedCropTypeOption =
    cropTypeOptions.find((opt) => opt.value === selectedCropType) || cropTypeOptions[0];
  const SelectedIcon = selectedCropTypeOption.icon;

  // Handlers
  const handleViewTemplate = (template: any) => {
    toast({
      title: 'Vista detalle',
      description: `Ver template: ${template.name}`,
    });
    // TODO: router.push(`/quality-checks/templates/${template._id}`);
  };

  const handleEditTemplate = (template: any) => {
    toast({
      title: 'Editar template',
      description: `Editar: ${template.name}`,
    });
    // TODO: router.push(`/quality-checks/templates/${template._id}/edit`);
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      await duplicateTemplate({
        templateId: template._id as Id<'quality_check_templates'>,
      });
      toast({
        title: 'Template duplicado',
        description: `Se ha creado una copia de "${template.name}".`,
      });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo duplicar el template.',
        variant: 'destructive',
      });
    }
  };

  const handleArchiveTemplate = (template: any) => {
    setTemplateToArchive(template);
    setArchiveDialogOpen(true);
  };

  const confirmArchiveTemplate = async () => {
    if (!templateToArchive) return;

    try {
      setIsArchiving(true);
      await archiveTemplate({
        templateId: templateToArchive._id as Id<'quality_check_templates'>,
      });
      toast({
        title: 'Template archivado',
        description: `"${templateToArchive.name}" ha sido archivado.`,
      });
      setArchiveDialogOpen(false);
      setTemplateToArchive(null);
    } catch (error) {
      console.error('Error archiving template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo archivar el template.',
        variant: 'destructive',
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCropType(null);
  };

  // Loading state
  if (facilityLoading || !currentCompanyId || templates === undefined || cropTypes === undefined) {
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

  // Empty state
  if (templates.length === 0 && !selectedCropType && !searchQuery) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Control de Calidad"
          icon={ClipboardCheck}
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Control de Calidad' },
          ]}
          description="Templates de inspeccion y control de calidad"
        />

        <CompactStats stats={compactStats} />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay templates de QC
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Crea tu primer template de control de calidad para estandarizar
              las inspecciones de tus cultivos.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Crear Template QC
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Control de Calidad"
        icon={ClipboardCheck}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Control de Calidad' },
        ]}
        description="Templates de inspeccion y control de calidad"
      />

      {/* Compact Stats */}
      <CompactStats stats={compactStats} />

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Crop Type Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
              <span className="flex items-center gap-2">
                <SelectedIcon className="h-4 w-4" />
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

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
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
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron templates que coincidan con tu busqueda
            </p>
            {(searchQuery || selectedCropType) && (
              <Button variant="link" className="mt-2 text-blue-700" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template: any) => (
            <QCTemplateCard
              key={template._id}
              template={template}
              onView={() => handleViewTemplate(template)}
              onEdit={() => handleEditTemplate(template)}
              onDuplicate={() => handleDuplicateTemplate(template)}
              onArchive={() => handleArchiveTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Archive Confirmation Dialog */}
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
              onClick={confirmArchiveTemplate}
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
