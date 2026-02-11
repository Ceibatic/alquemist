'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats } from '@/components/ui/compact-stats';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PhaseDetailFilters } from '@/components/areas/phase-detail-filters';
import { getPhaseLabel, getPhaseColors } from '@/lib/constants/phases';
import { Layers, Sprout, Clock, Activity } from 'lucide-react';

type ActivityRow = {
  _id: Id<'activities'>;
  title: string | undefined;
  category: string | undefined | null;
  crop_phase: string | undefined | null;
  status: string | undefined | null;
  started_at: number | undefined | null;
  timestamp: number | undefined | null;
  duration_minutes: number | undefined | null;
  batchCode: string | null;
  performedByName: string | null;
  activityTypeName: string | null;
  notes: string | undefined | null;
};

const columns: ColumnDef<ActivityRow, unknown>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
    accessorFn: (row) => row.started_at ?? row.timestamp ?? 0,
    cell: ({ getValue }) => {
      const ts = getValue() as number;
      if (!ts) return '-';
      return new Date(ts).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    sortingFn: 'basic',
  },
  {
    accessorKey: 'activityTypeName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    cell: ({ getValue }) => (getValue() as string) ?? '-',
  },
  {
    accessorKey: 'batchCode',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Lote" />,
    cell: ({ getValue }) => {
      const code = getValue() as string | null;
      return code ? (
        <span className="font-mono text-xs">{code}</span>
      ) : (
        '-'
      );
    },
  },
  {
    accessorKey: 'performedByName',
    header: 'Responsable',
    cell: ({ getValue }) => (getValue() as string) ?? '-',
  },
  {
    accessorKey: 'duration_minutes',
    header: 'Duracion',
    cell: ({ getValue }) => {
      const mins = getValue() as number | null;
      if (!mins) return '-';
      if (mins < 60) return `${mins}min`;
      return `${Math.floor(mins / 60)}h ${mins % 60}min`;
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notas',
    cell: ({ getValue }) => {
      const notes = getValue() as string | null;
      if (!notes) return '-';
      return notes.length > 60 ? `${notes.slice(0, 60)}...` : notes;
    },
  },
];

export default function PhaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const areaId = params.id as Id<'areas'>;
  const phase = params.phase as string;

  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState('all');

  const area = useQuery(api.areas.getById, { areaId });
  const phaseGroups = useQuery(api.batches.listByAreaGroupedByPhase, { areaId });

  // Find the current phase group
  const currentGroup = useMemo(
    () => phaseGroups?.find((g) => g.phase === phase),
    [phaseGroups, phase]
  );

  // Compute batch IDs for the query
  const queryBatchIds = useMemo(() => {
    if (!currentGroup) return undefined;
    if (selectedBatchIds.size === 0) return undefined; // all batches
    return Array.from(selectedBatchIds) as Id<'batches'>[];
  }, [currentGroup, selectedBatchIds]);

  const activities = useQuery(
    api.activities.listByAreaAndPhase,
    currentGroup
      ? {
          areaId,
          phase,
          batchIds: queryBatchIds,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }
      : 'skip' as any
  );

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

  if (area === undefined || phaseGroups === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (area === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Area no encontrada"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Areas', href: '/areas' },
            { label: 'No encontrada' },
          ]}
        />
      </div>
    );
  }

  const phaseLabel = getPhaseLabel(phase);
  const phaseColors = getPhaseColors(phase);

  return (
    <div className="space-y-6">
      <PageHeader
        title={phaseLabel}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Areas', href: '/areas' },
          { label: area.name, href: `/areas/${areaId}` },
          { label: phaseLabel },
        ]}
      />

      {/* Phase stats */}
      {currentGroup && (
        <CompactStats
          stats={[
            {
              label: 'Lotes',
              value: currentGroup.batchCount,
              icon: Layers,
              color: 'blue',
            },
            {
              label: 'Plantas',
              value: currentGroup.totalPlants,
              icon: Sprout,
              color: 'green',
            },
            {
              label: 'Dias promedio',
              value: currentGroup.avgDays,
              icon: Clock,
              color: 'gray',
            },
          ]}
        />
      )}

      {/* Filters */}
      {currentGroup && currentGroup.batches.length > 0 && (
        <PhaseDetailFilters
          batches={currentGroup.batches}
          selectedBatchIds={selectedBatchIds}
          onBatchToggle={handleBatchToggle}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
      )}

      {/* Activities table */}
      {!currentGroup || currentGroup.batches.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin lotes en esta fase"
          description="No hay lotes activos en esta fase para esta area."
        />
      ) : activities === undefined ? (
        <Skeleton className="h-64 w-full" />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin actividades"
          description="No se encontraron actividades para los filtros seleccionados."
        />
      ) : (
        <DataTable
          columns={columns}
          data={activities}
          searchKey="activityTypeName"
          searchPlaceholder="Buscar por tipo..."
          onRowClick={(row) =>
            router.push(`/areas/${areaId}/activities/${row._id}`)
          }
        />
      )}
    </div>
  );
}
