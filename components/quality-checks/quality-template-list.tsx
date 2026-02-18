'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { QCTemplateCard } from './qc-template-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Search, Plus, ClipboardCheck, X } from 'lucide-react';

interface QualityTemplateListProps {
  companyId: Id<'companies'>;
}

const procedureOptions = [
  { value: 'health_check', label: 'Salud de Planta' },
  { value: 'pest_inspection', label: 'Inspeccion de Plagas' },
  { value: 'nutrient_check', label: 'Nutricion' },
  { value: 'harvest_quality', label: 'Calidad Cosecha' },
  { value: 'environmental', label: 'Ambiental' },
  { value: 'compliance', label: 'Cumplimiento' },
];

export function QualityTemplateList({ companyId }: QualityTemplateListProps) {
  const router = useRouter();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Archive dialog state
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [templateToArchive, setTemplateToArchive] = useState<Id<'quality_check_templates'> | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Fetch data
  const templates = useQuery(api.qualityCheckTemplates.list, {
    companyId,
    status: showArchived ? 'archived' : 'active',
    procedureType: selectedProcedure ?? undefined,
  });

  // Mutations
  const duplicateMutation = useMutation(api.qualityCheckTemplates.duplicate);
  const archiveMutation = useMutation(api.qualityCheckTemplates.archive);
  const restoreMutation = useMutation(api.qualityCheckTemplates.restore);

  // Client-side search filtering
  const filteredTemplates = useMemo(() => {
    if (!templates) return undefined;
    if (!searchQuery.trim()) return templates;

    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.cropTypeName && t.cropTypeName.toLowerCase().includes(q))
    );
  }, [templates, searchQuery]);

  // Handlers
  const handleDuplicate = async (templateId: Id<'quality_check_templates'>) => {
    try {
      await duplicateMutation({ templateId });
      toast.success('Template duplicado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al duplicar');
    }
  };

  const handleArchive = async () => {
    if (!templateToArchive) return;
    try {
      setIsArchiving(true);
      await archiveMutation({ templateId: templateToArchive });
      toast.success('Template archivado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al archivar');
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
      setTemplateToArchive(null);
    }
  };

  const handleRestore = async (templateId: Id<'quality_check_templates'>) => {
    try {
      await restoreMutation({ templateId });
      toast.success('Template restaurado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al restaurar');
    }
  };

  // Loading state
  if (filteredTemplates === undefined) {
    return (
      <div className="space-y-4">
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
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Procedure type filter */}
        <Select
          value={selectedProcedure ?? 'all'}
          onValueChange={(v) => setSelectedProcedure(v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Procedimiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {procedureOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Show archived toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-archived-qc"
            checked={showArchived}
            onCheckedChange={(checked) => setShowArchived(!!checked)}
          />
          <Label htmlFor="show-archived-qc" className="text-sm cursor-pointer">
            Archivados
          </Label>
        </div>

        {/* Create button */}
        <Button
          onClick={() => router.push('/quality-checks/templates/new')}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear template
        </Button>
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {searchQuery || selectedProcedure
              ? 'Sin resultados'
              : showArchived
                ? 'No hay templates archivados'
                : 'No hay templates de calidad'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || selectedProcedure
              ? 'Intenta con otros filtros'
              : 'Crea tu primer template de control de calidad para estandarizar inspecciones'}
          </p>
          {!searchQuery && !selectedProcedure && !showArchived && (
            <Button
              onClick={() => router.push('/quality-checks/templates/new')}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear template
            </Button>
          )}
        </div>
      )}

      {/* Card grid */}
      {filteredTemplates.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <QCTemplateCard
              key={template._id}
              template={{
                ...template,
                _id: template._id,
                usage_count: template.usage_count ?? 0,
                status: template.status,
              }}
              onView={() => router.push(`/quality-checks/templates/${template._id}`)}
              onDuplicate={() => handleDuplicate(template._id)}
              onArchive={
                showArchived
                  ? undefined
                  : () => {
                      setTemplateToArchive(template._id);
                      setArchiveDialogOpen(true);
                    }
              }
            />
          ))}
        </div>
      )}

      {/* Archive confirmation dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar template</AlertDialogTitle>
            <AlertDialogDescription>
              El template no aparecera en la lista de templates activos. Puedes restaurarlo mas tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
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
