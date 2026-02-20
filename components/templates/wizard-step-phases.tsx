'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { PhaseCreateDialog } from './phase-create-dialog';
import type { PhaseItem } from './template-create-wizard';

// ---------------------------------------------------------------------------
// Area type labels
// ---------------------------------------------------------------------------

const AREA_TYPE_LABELS: Record<string, string> = {
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  drying: 'Secado',
  curing: 'Curado',
  storage: 'Almacenamiento',
  processing: 'Procesamiento',
};

// ---------------------------------------------------------------------------
// Sortable Phase Item
// ---------------------------------------------------------------------------

interface SortablePhaseItemProps {
  phase: PhaseItem;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortablePhaseItem({
  phase,
  index,
  total,
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
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing touch-none"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Phase number badge */}
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>

      {/* Phase info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{phase.name}</p>
        {phase.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{phase.description}</p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="secondary" className="text-xs font-normal">
          {phase.durationDays} {phase.durationDays === 1 ? 'dia' : 'dias'}
        </Badge>
        <Badge variant="outline" className="text-xs font-normal hidden sm:flex">
          {AREA_TYPE_LABELS[phase.areaType] ?? phase.areaType}
        </Badge>
      </div>

      {/* Arrow buttons (keyboard reorder) */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mover arriba"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mover abajo"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Edit / Delete */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          onClick={onEdit}
          aria-label="Editar fase"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={onDelete}
          aria-label="Eliminar fase"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Step Component
// ---------------------------------------------------------------------------

interface WizardStepPhasesProps {
  phases: PhaseItem[];
  onPhasesChange: (phases: PhaseItem[]) => void;
}

export function WizardStepPhases({ phases, onPhasesChange }: WizardStepPhasesProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<PhaseItem | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
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

  const handleOpenEdit = (phase: PhaseItem) => {
    setEditingPhase(phase);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onPhasesChange(phases.filter((p) => p.id !== id));
  };

  const handleSavePhase = (phaseData: Omit<PhaseItem, 'id'>) => {
    if (editingPhase) {
      // Update existing
      onPhasesChange(
        phases.map((p) =>
          p.id === editingPhase.id ? { ...phaseData, id: p.id } : p
        )
      );
    } else {
      // Add new
      onPhasesChange([
        ...phases,
        { ...phaseData, id: crypto.randomUUID() },
      ]);
    }
  };

  const totalDays = phases.reduce((sum, p) => sum + p.durationDays, 0);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Fases de produccion</h3>
          {phases.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {phases.length} {phases.length === 1 ? 'fase' : 'fases'} &mdash; {totalDays} dias en total
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

      {/* Phase list or empty state */}
      {phases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-muted-foreground mb-1 font-medium">Sin fases definidas</p>
            <p className="text-sm text-muted-foreground mb-4">
              Agrega la primera fase o selecciona un tipo de cultivo en el paso anterior para autocompletar.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenAdd}
            >
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
        <div className="flex gap-1 h-6 rounded overflow-hidden">
          {phases.map((phase, index) => {
            const width = (phase.durationDays / totalDays) * 100;
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
              <div
                key={phase.id}
                className={cn(
                  colors[index % colors.length],
                  'flex items-center justify-center text-white text-xs font-medium px-1 truncate'
                )}
                style={{ width: `${Math.max(width, 3)}%` }}
                title={`${phase.name}: ${phase.durationDays} dias`}
              >
                {width > 8 ? phase.name : ''}
              </div>
            );
          })}
        </div>
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
