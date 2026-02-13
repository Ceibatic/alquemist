'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityExecutionSheet } from '@/components/activities/activity-execution-sheet';
import { ScheduleActivityDialog } from '@/components/activities/schedule-activity-dialog';
import { useFacility } from '@/components/providers/facility-provider';
import { getPhaseLabel } from '@/lib/constants/phases';
import { ACTIVITY_CATEGORIES } from '@/lib/constants/activity-types';
import { Activity, Plus, CalendarPlus } from 'lucide-react';

interface AreaHistoryTabProps {
  areaId: Id<'areas'>;
}

type ActivityRow = {
  _id: Id<'activities'>;
  title: string | undefined;
  category: string | undefined | null;
  crop_phase: string | undefined | null;
  status: string | undefined | null;
  started_at: number | undefined | null;
  timestamp: number | undefined | null;
  batchCode: string | null;
  performedByName: string | null;
  activityTypeName: string | null;
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
    accessorKey: 'crop_phase',
    header: 'Fase',
    cell: ({ getValue }) => getPhaseLabel(getValue() as string | undefined),
  },
  {
    accessorKey: 'performedByName',
    header: 'Responsable',
    cell: ({ getValue }) => (getValue() as string) ?? '-',
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ getValue }) => {
      const status = getValue() as string | null;
      if (!status) return '-';
      const statusLabels: Record<string, string> = {
        planned: 'Planificado',
        in_progress: 'En progreso',
        completed: 'Completado',
        verified: 'Verificado',
        cancelled: 'Cancelado',
      };
      return statusLabels[status] ?? status;
    },
  },
];

export function AreaHistoryTab({ areaId }: AreaHistoryTabProps) {
  const router = useRouter();
  const { currentCompanyId } = useFacility();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Execution sheet + schedule dialog state
  const [executionSheetOpen, setExecutionSheetOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const activities = useQuery(api.activities.listByArea, {
    areaId,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const data = useMemo(() => activities ?? [], [activities]);

  if (activities === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (activities.length === 0 && categoryFilter === 'all') {
    return (
      <>
        <div className="flex justify-end mb-4 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setScheduleDialogOpen(true)}
          >
            <CalendarPlus className="h-3.5 w-3.5 mr-1" />
            Programar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExecutionSheetOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Registrar actividad
          </Button>
        </div>
        <EmptyState
          icon={Activity}
          title="Sin actividades registradas"
          description="Las actividades realizadas en los lotes de esta area apareceran aqui."
        />
        <ActivityExecutionSheet
          open={executionSheetOpen}
          onOpenChange={setExecutionSheetOpen}
          entityType="area"
          entityId={areaId}
          areaId={areaId}
          onCompleted={() => setExecutionSheetOpen(false)}
        />

        <ScheduleActivityDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          fromAreaId={areaId}
          onScheduled={() => setScheduleDialogOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters + actions */}
      <div className="flex items-center justify-between gap-3">
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

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setScheduleDialogOpen(true)}
          >
            <CalendarPlus className="h-3.5 w-3.5 mr-1" />
            Programar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExecutionSheetOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Registrar actividad
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        searchKey="activityTypeName"
        searchPlaceholder="Buscar por tipo de actividad..."
        onRowClick={(row) => router.push(`/areas/${areaId}/activities/${row._id}`)}
        loading={activities === undefined}
      />

      <ActivityExecutionSheet
        open={executionSheetOpen}
        onOpenChange={setExecutionSheetOpen}
        entityType="area"
        entityId={areaId}
        areaId={areaId}
        onCompleted={() => setExecutionSheetOpen(false)}
      />

      <ScheduleActivityDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        fromAreaId={areaId}
        onScheduled={() => setScheduleDialogOpen(false)}
      />
    </div>
  );
}
