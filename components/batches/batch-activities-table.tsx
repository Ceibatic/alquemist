'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataTableColumnHeader } from '@/components/ui/data-table';
import { PHASE_LABELS, getPhaseColors } from '@/lib/constants/phases';
import { ACTIVITY_CATEGORIES } from '@/lib/constants/activity-types';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderPhase {
  phase_name: string;
  phase_order: number;
  planned_start_date: number;
  planned_end_date: number;
  actual_start_date?: number;
  status: string;
}

type ActivityRow = {
  _id: string;
  timestamp: number;
  title?: string;
  activity_type: string;
  category?: string;
  crop_phase?: string;
  quantity_before?: number;
  quantity_after?: number;
  performedByName: string;
  duration_minutes?: number;
  notes?: string;
};

interface BatchActivitiesTableProps {
  batchId: Id<'batches'>;
  orderPhases: OrderPhase[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryColor(category?: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    cultivation: { bg: 'bg-green-50', text: 'text-green-700' },
    monitoring: { bg: 'bg-amber-50', text: 'text-amber-700' },
    transformation: { bg: 'bg-violet-50', text: 'text-violet-700' },
    application: { bg: 'bg-red-50', text: 'text-red-700' },
    movement: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
    maintenance: { bg: 'bg-slate-50', text: 'text-slate-700' },
    quality: { bg: 'bg-rose-50', text: 'text-rose-700' },
    harvest: { bg: 'bg-pink-50', text: 'text-pink-700' },
    post_harvest: { bg: 'bg-orange-50', text: 'text-orange-700' },
    administrative: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };
  return map[category || ''] || { bg: 'bg-gray-50', text: 'text-gray-700' };
}

function getCategoryLabel(category?: string): string {
  const cat = ACTIVITY_CATEGORIES.find((c) => c.value === category);
  return cat?.label || category || '—';
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeRangeStart(preset: string): number | null {
  const now = new Date();
  switch (preset) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return start.getTime();
    }
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now.getFullYear(), now.getMonth(), diff);
      return start.getTime();
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return start.getTime();
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const columns: ColumnDef<ActivityRow>[] = [
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap">
        {formatDate(row.original.timestamp)}
      </span>
    ),
    sortingFn: 'basic',
  },
  {
    accessorKey: 'activity_type',
    header: 'Tipo',
    cell: ({ row }) => {
      const { bg, text } = getCategoryColor(row.original.category);
      const displayName = row.original.title || row.original.activity_type;
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
        >
          {displayName}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'crop_phase',
    header: 'Fase',
    cell: ({ row }) => {
      const phase = row.original.crop_phase;
      if (!phase) return <span className="text-gray-400">—</span>;
      const colors = getPhaseColors(phase);
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
        >
          {PHASE_LABELS[phase] || phase}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'quantity_before',
    header: 'Cant. Inicial',
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.quantity_before != null
          ? row.original.quantity_before
          : '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'quantity_after',
    header: 'Cant. Final',
    cell: ({ row }) => {
      const before = row.original.quantity_before;
      const after = row.original.quantity_after;
      if (after == null) return <span className="text-gray-400">—</span>;
      let colorClass = 'text-gray-700';
      if (before != null) {
        if (after > before) colorClass = 'text-green-600';
        else if (after < before) colorClass = 'text-red-600';
      }
      return (
        <span className={`text-sm font-medium tabular-nums ${colorClass}`}>
          {after}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'performedByName',
    header: 'Responsable',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.performedByName}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'duration_minutes',
    header: 'Duracion',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.duration_minutes
          ? `${row.original.duration_minutes}min`
          : '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'notes',
    header: 'Notas',
    cell: ({ row }) => {
      const notes = row.original.notes;
      if (!notes) return <span className="text-gray-400">—</span>;
      if (notes.length <= 50)
        return <span className="text-sm text-gray-600">{notes}</span>;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-gray-600 cursor-help">
                {notes.slice(0, 50)}...
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs whitespace-pre-line">
              {notes}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BatchActivitiesTable({
  batchId,
  orderPhases,
}: BatchActivitiesTableProps) {
  const activities = useQuery(api.activities.listByBatch, { batchId });

  // Filter state
  const [phaseIndex, setPhaseIndex] = useState<number>(-1); // -1 = "Todas"
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');

  // Derive phase list: from orderPhases, or from unique crop_phase in activities
  const phaseList = useMemo(() => {
    if (orderPhases.length > 0) {
      return orderPhases.map((p) => p.phase_name);
    }
    if (!activities) return [];
    const unique = [...new Set(activities.map((a) => a.crop_phase).filter(Boolean))] as string[];
    return unique;
  }, [orderPhases, activities]);

  // Derive unique responsible names
  const responsibleNames = useMemo(() => {
    if (!activities) return [];
    return [...new Set(activities.map((a) => a.performedByName))].sort();
  }, [activities]);

  // Derive unique categories in the data
  const categoriesInData = useMemo(() => {
    if (!activities) return [];
    return [...new Set(activities.map((a) => a.category).filter(Boolean))] as string[];
  }, [activities]);

  // Apply filters
  const filteredData = useMemo(() => {
    if (!activities) return [];

    let data = activities as ActivityRow[];

    // Phase filter
    if (phaseIndex >= 0 && phaseIndex < phaseList.length) {
      const selectedPhase = phaseList[phaseIndex].toLowerCase();
      data = data.filter(
        (a) => a.crop_phase?.toLowerCase() === selectedPhase
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      data = data.filter((a) => a.category === categoryFilter);
    }

    // Time range filter
    if (timeRange !== 'all') {
      const start = getTimeRangeStart(timeRange);
      if (start) {
        data = data.filter((a) => a.timestamp >= start);
      }
    }

    // Responsible filter
    if (responsibleFilter !== 'all') {
      data = data.filter((a) => a.performedByName === responsibleFilter);
    }

    return data;
  }, [activities, phaseIndex, phaseList, categoryFilter, timeRange, responsibleFilter]);

  // Table setup
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageSize: 15 } },
  });

  // Phase paginator helpers
  const currentPhaseName =
    phaseIndex >= 0 && phaseIndex < phaseList.length
      ? phaseList[phaseIndex]
      : null;

  const phaseLabel = currentPhaseName
    ? PHASE_LABELS[currentPhaseName.toLowerCase()] || currentPhaseName
    : 'Todas';

  // Days in phase calculation for the label
  const phaseOrderInfo = useMemo(() => {
    if (!currentPhaseName || orderPhases.length === 0) return null;
    const op = orderPhases.find(
      (p) => p.phase_name.toLowerCase() === currentPhaseName.toLowerCase()
    );
    if (!op) return null;
    const startDate = op.actual_start_date || op.planned_start_date;
    const endDate = op.planned_end_date;
    const daysSinceStart = Math.floor(
      (Date.now() - startDate) / (1000 * 60 * 60 * 24)
    );
    const totalDays = Math.floor(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );
    return { day: Math.max(1, daysSinceStart), total: totalDays };
  }, [currentPhaseName, orderPhases]);

  const loading = activities === undefined;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Phase paginator */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={phaseIndex <= -1}
            onClick={() => setPhaseIndex((i) => i - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2 min-w-[120px] text-center">
            {phaseIndex === -1 ? (
              'Todas las fases'
            ) : (
              <>
                Fase: {phaseLabel}
                {phaseOrderInfo && (
                  <span className="text-xs text-gray-500 ml-1">
                    (Dia {phaseOrderInfo.day} de {phaseOrderInfo.total})
                  </span>
                )}
              </>
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={phaseIndex >= phaseList.length - 1}
            onClick={() => setPhaseIndex((i) => i + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {categoriesInData.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Time range filter */}
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px] h-8 text-sm">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
          </SelectContent>
        </Select>

        {/* Responsible filter */}
        {responsibleNames.length > 1 && (
          <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
            <SelectTrigger className="w-[160px] h-8 text-sm">
              <SelectValue placeholder="Responsable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {responsibleNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Activity className="h-8 w-8 mb-2 text-gray-400" />
                    <p className="text-sm font-medium">
                      {activities && activities.length > 0
                        ? 'No hay actividades que coincidan con los filtros'
                        : 'No hay actividades registradas'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-600">
          {table.getFilteredRowModel().rows.length > 0 ? (
            <>
              Mostrando{' '}
              <span className="font-medium">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{' '}
              a{' '}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{' '}
              de{' '}
              <span className="font-medium">
                {table.getFilteredRowModel().rows.length}
              </span>{' '}
              actividad(es)
            </>
          ) : (
            <span>0 actividades</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
