'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityReportSheet } from '@/components/activities/activity-report-sheet';
import { useFacility } from '@/components/providers/facility-provider';
import { getPhaseLabel } from '@/lib/constants/phases';
import { ACTIVITY_CATEGORIES } from '@/lib/constants/activity-types';
import { Activity, Plus } from 'lucide-react';

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

  // Template selector state
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [reportTemplateId, setReportTemplateId] = useState<Id<'activity_templates'> | null>(null);

  const activities = useQuery(api.activities.listByArea, {
    areaId,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const activityTemplates = useQuery(
    api.activityTemplates.list,
    currentCompanyId ? { companyId: currentCompanyId, isActive: true } : 'skip' as any
  );

  const handleRegisterActivity = () => {
    setSelectedTemplateId('');
    setTemplateSelectorOpen(true);
  };

  const handleTemplateSelectorConfirm = () => {
    if (!selectedTemplateId) return;
    setReportTemplateId(selectedTemplateId as Id<'activity_templates'>);
    setTemplateSelectorOpen(false);
    setReportSheetOpen(true);
  };

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
      <EmptyState
        icon={Activity}
        title="Sin actividades registradas"
        description="Las actividades realizadas en los lotes de esta area apareceran aqui."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters + Register button */}
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

        <Button
          size="sm"
          onClick={handleRegisterActivity}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="h-4 w-4 mr-1" />
          Registrar actividad
        </Button>
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

      {/* Template selector dialog */}
      <Dialog open={templateSelectorOpen} onOpenChange={setTemplateSelectorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar template de actividad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template *</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar template..." />
                </SelectTrigger>
                <SelectContent>
                  {(activityTemplates ?? []).map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateSelectorOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleTemplateSelectorConfirm}
              disabled={!selectedTemplateId}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Report Sheet */}
      {reportTemplateId && (
        <ActivityReportSheet
          open={reportSheetOpen}
          onOpenChange={setReportSheetOpen}
          activityTemplateId={reportTemplateId}
          entityType="area"
          entityId={areaId}
          areaId={areaId}
          onCompleted={() => {
            setReportSheetOpen(false);
            setReportTemplateId(null);
          }}
        />
      )}
    </div>
  );
}
