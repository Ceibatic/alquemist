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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFacility } from '@/components/providers/facility-provider';
import { getPhaseLabel, getPhaseColors } from '@/lib/constants/phases';
import { ACTIVITY_CATEGORIES } from '@/lib/constants/activity-types';
import { Layers, Sprout, Clock, Activity, MapPin } from 'lucide-react';

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
  areaName: string | null;
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
      return code ? <span className="font-mono text-xs">{code}</span> : '-';
    },
  },
  {
    accessorKey: 'areaName',
    header: 'Area',
    cell: ({ getValue }) => (getValue() as string) ?? '-',
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

export default function ProductionPhaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const phase = params.phase as string;
  const { currentCompanyId, currentFacilityId, isLoading: facilityLoading } = useFacility();

  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());
  const [selectedAreaIds, setSelectedAreaIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch batches in this phase for the facility
  const phaseBatches = useQuery(
    api.batches.listByPhase,
    currentCompanyId && currentFacilityId
      ? { companyId: currentCompanyId, facilityId: currentFacilityId, phase }
      : ('skip' as any)
  );

  // Fetch areas for multi-select filter
  const facilityAreas = useQuery(
    api.areas.getByFacility,
    currentFacilityId
      ? { facilityId: currentFacilityId, status: 'active' }
      : ('skip' as any)
  );

  // Compute stats from batches
  const phaseStats = useMemo(() => {
    if (!phaseBatches) return null;
    return {
      batchCount: phaseBatches.length,
      totalPlants: phaseBatches.reduce((sum, b) => sum + b.current_quantity, 0),
      avgDays:
        phaseBatches.length > 0
          ? Math.round(
              phaseBatches.reduce((sum, b) => sum + b.daysInProduction, 0) /
                phaseBatches.length
            )
          : 0,
    };
  }, [phaseBatches]);

  // Areas that have batches in this phase (for filter)
  const areasWithBatches = useMemo(() => {
    if (!phaseBatches || !facilityAreas) return [];
    const areaIdsInPhase = new Set(
      phaseBatches.filter((b) => b.areaId).map((b) => b.areaId!.toString())
    );
    return facilityAreas.filter((a) => areaIdsInPhase.has(a._id.toString()));
  }, [phaseBatches, facilityAreas]);

  // Compute query args for activities
  const queryAreaIds = useMemo(() => {
    if (selectedAreaIds.size === 0) return undefined;
    return Array.from(selectedAreaIds) as Id<'areas'>[];
  }, [selectedAreaIds]);

  const queryBatchIds = useMemo(() => {
    if (selectedBatchIds.size === 0) return undefined;
    return Array.from(selectedBatchIds) as Id<'batches'>[];
  }, [selectedBatchIds]);

  const activities = useQuery(
    api.activities.listByPhase,
    currentCompanyId && currentFacilityId && phaseBatches
      ? {
          companyId: currentCompanyId,
          facilityId: currentFacilityId,
          phase,
          areaIds: queryAreaIds,
          batchIds: queryBatchIds,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }
      : ('skip' as any)
  );

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  };

  const handleAreaToggle = (areaId: string) => {
    setSelectedAreaIds((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  };

  if (facilityLoading || !currentCompanyId || phaseBatches === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
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
          { label: 'Produccion', href: '/production' },
          { label: phaseLabel },
        ]}
      />

      {/* Phase stats */}
      {phaseStats && (
        <CompactStats
          stats={[
            { label: 'Lotes', value: phaseStats.batchCount, icon: Layers, color: 'blue' },
            { label: 'Plantas', value: phaseStats.totalPlants.toLocaleString(), icon: Sprout, color: 'green' },
            { label: 'Dias promedio', value: phaseStats.avgDays, icon: Clock, color: 'gray' },
          ]}
        />
      )}

      {/* Filters */}
      {phaseBatches.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:flex-wrap">
          {/* Area filter */}
          {areasWithBatches.length > 1 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Areas:
              </span>
              {areasWithBatches.map((area) => (
                <label
                  key={area._id}
                  className="flex items-center gap-1.5 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selectedAreaIds.has(area._id)}
                    onCheckedChange={() => handleAreaToggle(area._id)}
                  />
                  <span>{area.name}</span>
                </label>
              ))}
            </div>
          )}

          {/* Batch filter */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Lotes:</span>
            {phaseBatches.map((batch) => (
              <label
                key={batch._id}
                className="flex items-center gap-1.5 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selectedBatchIds.has(batch._id)}
                  onCheckedChange={() => handleBatchToggle(batch._id)}
                />
                <span className="font-mono text-xs">{batch.batch_code}</span>
              </label>
            ))}
          </div>

          {/* Category dropdown */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorias</SelectItem>
              {ACTIVITY_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Activities table or empty states */}
      {phaseBatches.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin lotes en esta fase"
          description="No hay lotes activos en esta fase para esta instalacion."
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
          onRowClick={(row) => {
            if (row.batchCode) {
              const batch = phaseBatches.find((b) => b.batch_code === row.batchCode);
              if (batch) {
                router.push(`/batches/${batch._id}`);
              }
            }
          }}
        />
      )}
    </div>
  );
}
