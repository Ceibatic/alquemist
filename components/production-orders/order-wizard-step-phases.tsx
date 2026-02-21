'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PhaseCreateDialog } from '@/components/templates/phase-create-dialog';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Calendar,
  Loader2,
  LayoutTemplate,
} from 'lucide-react';
import type { OrderWizardFormData, OrderPhaseItem } from './order-create-wizard';
import type { PhaseItem } from '@/components/templates/template-create-wizard';

// ---------------------------------------------------------------------------
// Area type labels
// ---------------------------------------------------------------------------

const AREA_TYPE_LABELS: Record<string, string> = {
  propagation: 'Propagación',
  vegetative: 'Vegetativo',
  flowering: 'Floración',
  drying: 'Secado',
  curing: 'Curado',
  storage: 'Almacenamiento',
  processing: 'Procesamiento',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
}

function parseDateStr(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

// ---------------------------------------------------------------------------
// Sortable Phase Item (manual mode)
// ---------------------------------------------------------------------------

interface SortablePhaseItemProps {
  phase: OrderPhaseItem;
  index: number;
  total: number;
  startDate: number;
  endDate: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortablePhaseItem({
  phase,
  index,
  total,
  startDate,
  endDate,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: SortablePhaseItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-white p-4',
        isDragging && 'shadow-lg opacity-80 z-50'
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{phase.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatShortDate(startDate)} — {formatShortDate(endDate)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="secondary" className="text-xs font-normal">
          {phase.durationDays} {phase.durationDays === 1 ? 'día' : 'días'}
        </Badge>
        <Badge variant="outline" className="text-xs font-normal hidden sm:flex">
          {AREA_TYPE_LABELS[phase.areaType] ?? phase.areaType}
        </Badge>
      </div>

      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template Phase Preview (read-only)
// ---------------------------------------------------------------------------

function TemplatePhasePreview({
  phase,
  index,
  startDate,
  endDate,
}: {
  phase: { phase_name: string; estimated_duration_days: number; area_type: string };
  index: number;
  startDate: number;
  endDate: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{phase.phase_name}</p>
        <p className="text-xs text-muted-foreground">
          {formatShortDate(startDate)} — {formatShortDate(endDate)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="secondary" className="text-xs font-normal">
          <Calendar className="mr-1 h-3 w-3" />
          {phase.estimated_duration_days} días
        </Badge>
        <Badge variant="outline" className="text-xs font-normal hidden sm:flex">
          {AREA_TYPE_LABELS[phase.area_type] ?? phase.area_type}
        </Badge>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Step Component
// ---------------------------------------------------------------------------

interface OrderWizardStepPhasesProps {
  formData: OrderWizardFormData;
  onPhasesChange: (phases: OrderPhaseItem[]) => void;
  companyId: Id<'companies'>;
}

export function OrderWizardStepPhases({
  formData,
  onPhasesChange,
  companyId,
}: OrderWizardStepPhasesProps) {
  const hasTemplate = !!formData.templateId;
  const plannedStart = formData.plannedStartDate
    ? parseDateStr(formData.plannedStartDate)
    : Date.now();

  // Only fetch template phases if a template is selected
  const templatePhases = useQuery(
    api.templatePhases.getByTemplate,
    hasTemplate
      ? { templateId: formData.templateId as Id<'production_templates'> }
      : 'skip'
  );

  // ── Template mode: read-only preview ──

  if (hasTemplate) {
    if (templatePhases === undefined) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    const phases = templatePhases ?? [];
    let phaseStart = plannedStart;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border bg-amber-50 p-3 text-sm">
          <LayoutTemplate className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span>
            Las fases vienen del template seleccionado. Se crearán automáticamente al
            crear la orden.
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Fases del template</h3>
            <p className="text-sm text-muted-foreground">
              {phases.length} {phases.length === 1 ? 'fase' : 'fases'}
            </p>
          </div>
        </div>

        {phases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-muted-foreground">
                El template seleccionado no tiene fases definidas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {phases.map((phase, index) => {
              const start = phaseStart;
              const end = start + phase.estimated_duration_days * DAY_MS;
              phaseStart = end;
              return (
                <TemplatePhasePreview
                  key={phase._id}
                  phase={phase}
                  index={index}
                  startDate={start}
                  endDate={end}
                />
              );
            })}
          </div>
        )}

        {/* Timeline summary */}
        {phases.length > 1 && (
          <TimelineBar
            items={phases.map((p) => ({
              name: p.phase_name,
              days: p.estimated_duration_days,
            }))}
          />
        )}
      </div>
    );
  }

  // ── Manual mode: editable phases ──

  return (
    <ManualPhasesEditor
      phases={formData.phases}
      onPhasesChange={onPhasesChange}
      plannedStart={plannedStart}
    />
  );
}

// ---------------------------------------------------------------------------
// ManualPhasesEditor
// ---------------------------------------------------------------------------

function ManualPhasesEditor({
  phases,
  onPhasesChange,
  plannedStart,
}: {
  phases: OrderPhaseItem[];
  onPhasesChange: (phases: OrderPhaseItem[]) => void;
  plannedStart: number;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<PhaseItem | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = phases.findIndex((p) => p.id === active.id);
      const newIndex = phases.findIndex((p) => p.id === over.id);
      onPhasesChange(arrayMove(phases, oldIndex, newIndex));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    onPhasesChange(arrayMove(phases, index, index - 1));
  };

  const handleMoveDown = (index: number) => {
    if (index === phases.length - 1) return;
    onPhasesChange(arrayMove(phases, index, index + 1));
  };

  const handleOpenAdd = () => {
    setEditingPhase(undefined);
    setDialogOpen(true);
  };

  const handleOpenEdit = (phase: OrderPhaseItem) => {
    setEditingPhase({
      id: phase.id,
      name: phase.name,
      durationDays: phase.durationDays,
      areaType: phase.areaType,
      description: '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onPhasesChange(phases.filter((p) => p.id !== id));
  };

  const handleSavePhase = (phaseData: Omit<PhaseItem, 'id'>) => {
    if (editingPhase) {
      onPhasesChange(
        phases.map((p) =>
          p.id === editingPhase.id
            ? {
                id: p.id,
                name: phaseData.name,
                durationDays: phaseData.durationDays,
                areaType: phaseData.areaType,
              }
            : p
        )
      );
    } else {
      onPhasesChange([
        ...phases,
        {
          id: crypto.randomUUID(),
          name: phaseData.name,
          durationDays: phaseData.durationDays,
          areaType: phaseData.areaType,
        },
      ]);
    }
  };

  // Calculate dates for each phase
  const phaseDates: { start: number; end: number }[] = [];
  let phaseStart = plannedStart;
  for (const phase of phases) {
    const end = phaseStart + phase.durationDays * DAY_MS;
    phaseDates.push({ start: phaseStart, end });
    phaseStart = end;
  }

  const totalDays = phases.reduce((sum, p) => sum + p.durationDays, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Fases de producción</h3>
          {phases.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {phases.length} {phases.length === 1 ? 'fase' : 'fases'} — {totalDays}{' '}
              días en total
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-600 text-white"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Fase
        </Button>
      </div>

      {phases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-muted-foreground mb-1 font-medium">Sin fases definidas</p>
            <p className="text-sm text-muted-foreground mb-4">
              Agrega fases manualmente para definir el flujo de producción.
            </p>
            <Button type="button" variant="outline" onClick={handleOpenAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar primera fase
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={phases.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {phases.map((phase, index) => (
                <SortablePhaseItem
                  key={phase.id}
                  phase={phase}
                  index={index}
                  total={phases.length}
                  startDate={phaseDates[index].start}
                  endDate={phaseDates[index].end}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onEdit={() => handleOpenEdit(phase)}
                  onDelete={() => handleDelete(phase.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Timeline summary */}
      {phases.length > 1 && (
        <TimelineBar
          items={phases.map((p) => ({ name: p.name, days: p.durationDays }))}
        />
      )}

      {/* Dialog */}
      <PhaseCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        phase={editingPhase}
        onSave={handleSavePhase}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline bar (shared)
// ---------------------------------------------------------------------------

function TimelineBar({
  items,
}: {
  items: { name: string; days: number }[];
}) {
  const totalDays = items.reduce((sum, p) => sum + p.days, 0);
  const colors = [
    'bg-amber-400',
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-pink-500',
  ];

  return (
    <div className="flex gap-1 h-6 rounded overflow-hidden">
      {items.map((item, index) => {
        const width = (item.days / totalDays) * 100;
        return (
          <div
            key={`${item.name}-${index}`}
            className={cn(
              colors[index % colors.length],
              'flex items-center justify-center text-white text-xs font-medium px-1 truncate'
            )}
            style={{ width: `${Math.max(width, 3)}%` }}
            title={`${item.name}: ${item.days} días`}
          >
            {width > 8 ? item.name : ''}
          </div>
        );
      })}
    </div>
  );
}
