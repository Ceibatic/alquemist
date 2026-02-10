'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Lock,
  Plus,
  Archive,
  RotateCcw,
  Sprout,
  Search,
  RefreshCw,
  Shield,
  Package,
  Wrench,
  CheckCircle,
  Wheat,
  Scissors,
  FileText,
  MapPin,
  Layers,
  Box,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { ActivityTypeForm } from './activity-type-form';

// ── Category metadata ────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'cultivation', label: 'Cultivo', icon: Sprout },
  { value: 'monitoring', label: 'Monitoreo', icon: Search },
  { value: 'transformation', label: 'Transformacion', icon: RefreshCw },
  { value: 'application', label: 'Aplicacion', icon: Shield },
  { value: 'movement', label: 'Movimientos', icon: Package },
  { value: 'maintenance', label: 'Mantenimiento', icon: Wrench },
  { value: 'quality', label: 'Calidad', icon: CheckCircle },
  { value: 'harvest', label: 'Cosecha', icon: Wheat },
  { value: 'post_harvest', label: 'Poscosecha', icon: Scissors },
  { value: 'administrative', label: 'Administrativo', icon: FileText },
] as const;

const REQUIREMENT_CHIPS: { key: string; label: string; icon: typeof MapPin }[] = [
  { key: 'requires_zone', label: 'Zona', icon: MapPin },
  { key: 'requires_batch', label: 'Lote', icon: Layers },
  { key: 'requires_resources', label: 'Recursos', icon: Box },
  { key: 'requires_photos', label: 'Fotos', icon: Camera },
  { key: 'requires_verification', label: 'Verificacion', icon: ShieldCheck },
];

// ── Component ────────────────────────────────────────────────────────────────

interface ActivityTypeListProps {
  types: Doc<'activity_types'>[];
  companyId: Id<'companies'>;
}

export function ActivityTypeList({ types, companyId }: ActivityTypeListProps) {
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES[0].value);
  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<Doc<'activity_types'> | null>(null);

  const archiveMutation = useMutation(api.activityTypes.archive);
  const restoreMutation = useMutation(api.activityTypes.restore);

  const handleArchive = async (typeId: Id<'activity_types'>) => {
    try {
      await archiveMutation({ typeId });
      toast.success('Tipo archivado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al archivar');
    }
  };

  const handleRestore = async (typeId: Id<'activity_types'>) => {
    try {
      await restoreMutation({ typeId });
      toast.success('Tipo restaurado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al restaurar');
    }
  };

  const handleEdit = (type: Doc<'activity_types'>) => {
    setEditingType(type);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingType(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingType(null);
  };

  return (
    <TooltipProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = types.filter((t) => t.category === cat.value).length;
            return (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{cat.label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CATEGORIES.map((cat) => {
          const categoryTypes = types.filter((t) => t.category === cat.value);
          const activeTypes = categoryTypes.filter((t) => t.status === 'active');
          const archivedTypes = categoryTypes.filter((t) => t.status === 'archived');

          return (
            <TabsContent key={cat.value} value={cat.value} className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {categoryTypes.length} tipo{categoryTypes.length !== 1 ? 's' : ''} en {cat.label}
                </h3>
                <Button size="sm" onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar tipo
                </Button>
              </div>

              {categoryTypes.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No hay tipos de actividad en esta categoria.
                </div>
              )}

              <div className="space-y-2">
                {activeTypes.map((type) => (
                  <TypeRow
                    key={type._id}
                    type={type}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                  />
                ))}

                {archivedTypes.length > 0 && (
                  <>
                    <div className="pt-2 pb-1 text-xs text-muted-foreground font-medium">
                      Archivados
                    </div>
                    {archivedTypes.map((type) => (
                      <TypeRow
                        key={type._id}
                        type={type}
                        onEdit={handleEdit}
                        onRestore={handleRestore}
                      />
                    ))}
                  </>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <ActivityTypeForm
        open={formOpen}
        onClose={handleFormClose}
        companyId={companyId}
        category={activeTab}
        editingType={editingType}
      />
    </TooltipProvider>
  );
}

// ── Type Row ─────────────────────────────────────────────────────────────────

interface TypeRowProps {
  type: Doc<'activity_types'>;
  onEdit: (type: Doc<'activity_types'>) => void;
  onArchive?: (typeId: Id<'activity_types'>) => void;
  onRestore?: (typeId: Id<'activity_types'>) => void;
}

function TypeRow({ type, onEdit, onArchive, onRestore }: TypeRowProps) {
  const isArchived = type.status === 'archived';

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
        isArchived ? 'opacity-60' : ''
      }`}
      onClick={() => onEdit(type)}
    >
      {/* Color dot */}
      <div
        className="h-3 w-3 rounded-full shrink-0"
        style={{ backgroundColor: getColorHex(type.color ?? 'gray') }}
      />

      {/* Name + system badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{type.name}</span>
          {type.is_system && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent>Tipo de sistema</TooltipContent>
            </Tooltip>
          )}
          {isArchived && (
            <Badge variant="outline" className="text-[10px] h-5">
              Archivado
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{type.code}</span>
      </div>

      {/* Requirement chips */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {REQUIREMENT_CHIPS.map((chip) => {
          const value = type[chip.key as keyof typeof type];
          if (!value) return null;
          const Icon = chip.icon;
          return (
            <Tooltip key={chip.key}>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-0.5">
                  <Icon className="h-3 w-3" />
                  <span className="hidden lg:inline">{chip.label}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Requiere {chip.label.toLowerCase()}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Archive/Restore button */}
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        {isArchived && onRestore ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onRestore(type._id)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restaurar</TooltipContent>
          </Tooltip>
        ) : type.is_system ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button size="icon" variant="ghost" className="h-8 w-8" disabled>
                  <Archive className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Los tipos de sistema no se pueden archivar</TooltipContent>
          </Tooltip>
        ) : onArchive ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onArchive(type._id)}
              >
                <Archive className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archivar</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    green: '#16a34a',
    blue: '#2563eb',
    teal: '#0d9488',
    amber: '#d97706',
    violet: '#7c3aed',
    red: '#dc2626',
    cyan: '#0891b2',
    slate: '#64748b',
    rose: '#e11d48',
    pink: '#ec4899',
    orange: '#ea580c',
    gray: '#6b7280',
  };
  return map[color] ?? '#6b7280';
}
