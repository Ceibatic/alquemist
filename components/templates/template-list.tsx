'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { TemplateCard } from './template-card';
import { TemplateCreateModal } from './template-create-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  LayoutTemplate,
  SlidersHorizontal,
  X,
  ChevronDown,
  Leaf,
  LayoutGrid,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TemplateListProps {
  companyId: Id<'companies'>;
}

type CategoryFilter = 'seed-to-harvest' | 'propagation' | 'custom';

export function TemplateList({ companyId }: TemplateListProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Filter states
  const [selectedCropType, setSelectedCropType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([
    'seed-to-harvest',
    'propagation',
    'custom',
  ]);
  const [showArchived, setShowArchived] = useState(false);

  // Archive dialog state
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [templateToArchive, setTemplateToArchive] = useState<any>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Fetch data
  const templates = useQuery(api.productionTemplates.list, {
    companyId,
    cropTypeId: selectedCropType ? (selectedCropType as Id<'crop_types'>) : undefined,
    status: showArchived ? 'archived' : 'active',
  });

  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Mutations
  const archiveTemplate = useMutation(api.productionTemplates.archive);
  const duplicateTemplate = useMutation(api.productionTemplates.duplicate);

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
          template.description?.toLowerCase().includes(query) ||
          template.cropTypeName?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilters.length < 3) {
      result = result.filter((template) => {
        const category = template.template_category;
        if (!category) return true;
        return categoryFilters.includes(category as CategoryFilter);
      });
    }

    // Sort by name
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [templates, searchQuery, categoryFilters]);

  // Handlers
  const handleCategoryFilterChange = (category: CategoryFilter, checked: boolean) => {
    if (checked) {
      setCategoryFilters((prev) => [...prev, category]);
    } else {
      setCategoryFilters((prev) => prev.filter((c) => c !== category));
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (categoryFilters.length < 3) count++;
    if (showArchived) count++;
    return count;
  }, [categoryFilters, showArchived]);

  const clearAllFilters = () => {
    setCategoryFilters(['seed-to-harvest', 'propagation', 'custom']);
    setShowArchived(false);
    setSearchQuery('');
    setSelectedCropType(null);
  };

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

  // Handlers for template actions
  const handleViewTemplate = (template: any) => {
    router.push(`/templates/${template._id}`);
  };

  const handleEditTemplate = (template: any) => {
    router.push(`/templates/${template._id}/edit`);
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      const newTemplateId = await duplicateTemplate({
        templateId: template._id as Id<'production_templates'>,
      });
      toast({
        title: 'Template duplicado',
        description: `Se ha creado una copia de "${template.name}".`,
      });
      router.push(`/templates/${newTemplateId}/edit`);
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo duplicar el template. Intenta de nuevo.',
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
        templateId: templateToArchive._id as Id<'production_templates'>,
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
        description: 'No se pudo archivar el template. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCreateSuccess = (templateId: string) => {
    setCreateModalOpen(false);
    toast({
      title: 'Template creado',
      description: 'El template ha sido creado correctamente.',
    });
    router.push(`/templates/${templateId}/edit`);
  };

  // Loading state
  if (templates === undefined || cropTypes === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (templates.length === 0 && !selectedCropType && !searchQuery && !showArchived) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Template
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutTemplate className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay templates de produccion
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              Crea tu primer template para estandarizar los procesos de produccion
              y automatizar la programacion de actividades.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Template
            </Button>
          </CardContent>
        </Card>

        <TemplateCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          companyId={companyId}
          cropTypes={cropTypes}
          onSuccess={handleCreateSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Left: Filters + Type Dropdown */}
        <div className="flex items-center gap-2">
          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-600 text-[10px] font-medium text-white flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filtros</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-gray-500 hover:text-gray-700"
                      onClick={clearAllFilters}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Categoria</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cat-seed"
                        checked={categoryFilters.includes('seed-to-harvest')}
                        onCheckedChange={(checked) =>
                          handleCategoryFilterChange('seed-to-harvest', checked as boolean)
                        }
                      />
                      <label htmlFor="cat-seed" className="text-sm">
                        Semilla a Cosecha
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cat-prop"
                        checked={categoryFilters.includes('propagation')}
                        onCheckedChange={(checked) =>
                          handleCategoryFilterChange('propagation', checked as boolean)
                        }
                      />
                      <label htmlFor="cat-prop" className="text-sm">
                        Solo Propagacion
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cat-custom"
                        checked={categoryFilters.includes('custom')}
                        onCheckedChange={(checked) =>
                          handleCategoryFilterChange('custom', checked as boolean)
                        }
                      />
                      <label htmlFor="cat-custom" className="text-sm">
                        Personalizado
                      </label>
                    </div>
                  </div>
                </div>

                {/* Archived Filter */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-archived"
                      checked={showArchived}
                      onCheckedChange={(checked) => setShowArchived(checked as boolean)}
                    />
                    <label htmlFor="show-archived" className="text-sm">
                      Mostrar archivados
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

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
        </div>

        {/* Center: Search Input */}
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

        {/* Right: Create Button */}
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white shrink-0"
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Crear Template</span>
        </Button>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutTemplate className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">
              No se encontraron templates que coincidan con tu busqueda
            </p>
            {(activeFiltersCount > 0 || searchQuery || selectedCropType) && (
              <Button
                variant="link"
                className="mt-2 text-green-700"
                onClick={clearAllFilters}
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template: any) => (
            <TemplateCard
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

      {/* Create Modal */}
      <TemplateCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        companyId={companyId}
        cropTypes={cropTypes}
        onSuccess={handleCreateSuccess}
      />

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar template?</AlertDialogTitle>
            <AlertDialogDescription>
              {templateToArchive && (
                <>
                  El template <strong>{templateToArchive.name}</strong> sera archivado
                  y no aparecera en la lista principal. Podras restaurarlo mas adelante
                  desde los filtros.
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
