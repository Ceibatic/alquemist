'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ActivityTemplateCard } from './activity-template-card';
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
import {
  Search,
  Plus,
  FileText,
  X,
} from 'lucide-react';

interface ActivityTemplateListProps {
  companyId: Id<'companies'>;
}

export function ActivityTemplateList({ companyId }: ActivityTemplateListProps) {
  const router = useRouter();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Archive dialog state
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [templateToArchive, setTemplateToArchive] = useState<Id<'activity_templates'> | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Fetch data
  const templates = useQuery(api.activityTemplates.list, {
    companyId,
    isActive: showArchived ? false : true,
    phase: selectedPhase ?? undefined,
  });

  const activityTypes = useQuery(api.activityTypes.list, {
    companyId,
    status: 'active',
  });

  // Mutations
  const duplicateMutation = useMutation(api.activityTemplates.duplicate);
  const archiveMutation = useMutation(api.activityTemplates.archive);
  const restoreMutation = useMutation(api.activityTemplates.restore);

  // Build type lookup
  const typeMap = useMemo(() => {
    if (!activityTypes) return new Map<string, { name: string; color?: string }>();
    return new Map(
      activityTypes.map((t) => [t._id, { name: t.name, color: t.color }])
    );
  }, [activityTypes]);

  // Client-side search filtering
  const filteredTemplates = useMemo(() => {
    if (!templates) return undefined;
    if (!searchQuery.trim()) return templates;

    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.code && t.code.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [templates, searchQuery]);

  // Handlers
  const handleDuplicate = async (templateId: Id<'activity_templates'>) => {
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

  const handleRestore = async (templateId: Id<'activity_templates'>) => {
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
            placeholder="Buscar por nombre, codigo..."
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

        {/* Phase filter */}
        <Select
          value={selectedPhase ?? 'all'}
          onValueChange={(v) => setSelectedPhase(v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fases</SelectItem>
            <SelectItem value="propagation">Propagacion</SelectItem>
            <SelectItem value="vegetative">Vegetativo</SelectItem>
            <SelectItem value="flowering">Floracion</SelectItem>
            <SelectItem value="harvest">Cosecha</SelectItem>
            <SelectItem value="drying">Secado</SelectItem>
            <SelectItem value="curing">Curado</SelectItem>
            <SelectItem value="post_harvest">Poscosecha</SelectItem>
          </SelectContent>
        </Select>

        {/* Show archived toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-archived"
            checked={showArchived}
            onCheckedChange={(checked) => setShowArchived(!!checked)}
          />
          <Label htmlFor="show-archived" className="text-sm cursor-pointer">
            Archivados
          </Label>
        </div>

        {/* Create button */}
        <Button
          onClick={() => router.push('/activity-templates/new')}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear template
        </Button>
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {searchQuery || selectedPhase
              ? 'Sin resultados'
              : showArchived
                ? 'No hay templates archivados'
                : 'No hay templates'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || selectedPhase
              ? 'Intenta con otros filtros'
              : 'Crea tu primer template de actividad para estandarizar operaciones'}
          </p>
          {!searchQuery && !selectedPhase && !showArchived && (
            <Button
              onClick={() => router.push('/activity-templates/new')}
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
          {filteredTemplates.map((template) => {
            const typeInfo = typeMap.get(template.type_id);
            return (
              <ActivityTemplateCard
                key={template._id}
                template={template}
                activityTypeName={typeInfo?.name}
                activityTypeColor={typeInfo?.color}
                onView={() => router.push(`/activity-templates/${template._id}`)}
                onDuplicate={() => handleDuplicate(template._id)}
                onArchive={() => {
                  setTemplateToArchive(template._id);
                  setArchiveDialogOpen(true);
                }}
                onRestore={() => handleRestore(template._id)}
              />
            );
          })}
        </div>
      )}

      {/* Archive confirmation dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archivar template</AlertDialogTitle>
            <AlertDialogDescription>
              El template no aparecera en la lista de templates activos ni se usara
              para generar actividades programadas. Puedes restaurarlo mas tarde.
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
