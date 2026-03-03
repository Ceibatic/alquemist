'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  ArrowRight,
  ArrowDown,
  Loader2,
  GitBranch,
  Activity,
  Truck,
  FlaskConical,
  Leaf,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BatchTraceabilityViewProps {
  batchId: string;
}

// ── Label helpers ──────────────────────────────────────────────────────────────

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  watering: 'Riego',
  feeding: 'Nutricion',
  pruning: 'Poda',
  harvest: 'Cosecha',
  transplant: 'Trasplante',
  inspection: 'Inspeccion',
  phase_transition: 'Cambio de fase',
  transformation: 'Transformacion',
  application: 'Aplicacion',
  measurement: 'Medicion',
  movement: 'Movimiento',
  quality_check: 'Control de calidad',
};

const ACTIVITY_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  completed: {
    label: 'Completada',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: CheckCircle2,
  },
  in_progress: {
    label: 'En progreso',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    icon: Clock,
  },
  planned: {
    label: 'Planificada',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelada',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: XCircle,
  },
  verified: {
    label: 'Verificada',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    icon: CheckCircle2,
  },
};

const DIRECTION_LABELS: Record<string, string> = {
  consumed: 'Consumido',
  produced: 'Producido',
  applied: 'Aplicado',
  wasted: 'Desperdiciado',
};

const DIRECTION_COLORS: Record<string, string> = {
  consumed: 'text-red-600',
  produced: 'text-green-600',
  applied: 'text-blue-600',
  wasted: 'text-gray-500',
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  purchase: 'Compra',
  production: 'Produccion interna',
  transfer: 'Transferencia',
};

const BATCH_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  harvested: { label: 'Cosechado', color: 'bg-amber-100 text-amber-800' },
  lost: { label: 'Perdido', color: 'bg-red-100 text-red-800' },
  split: { label: 'Dividido', color: 'bg-blue-100 text-blue-800' },
  merged: { label: 'Fusionado', color: 'bg-purple-100 text-purple-800' },
  archived: { label: 'Archivado', color: 'bg-gray-100 text-gray-800' },
};

const TRANSFORMATION_STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  transformed: 'Transformado',
  consumed: 'Consumido',
  harvested: 'Cosechado',
  expired: 'Vencido',
  waste: 'Desperdicio',
};

const PHASE_LABELS: Record<string, string> = {
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  post_harvest: 'Post-cosecha',
  processing: 'Procesamiento',
  drying: 'Secado',
  curing: 'Curado',
};

// ── Date formatter ────────────────────────────────────────────────────────────

function formatDate(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({
  stats,
}: {
  stats: {
    totalActivities: number;
    totalSourceItems: number;
    totalOutputItems: number;
    totalTransactions: number;
  };
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: 'Actividades', value: stats.totalActivities, icon: Activity },
        { label: 'Insumos usados', value: stats.totalSourceItems, icon: Package },
        { label: 'Productos generados', value: stats.totalOutputItems, icon: FlaskConical },
        { label: 'Transacciones', value: stats.totalTransactions, icon: Truck },
      ].map(({ label, value, icon: Icon }) => (
        <Card key={label} className="border-dashed">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Source materials section ──────────────────────────────────────────────────

function SourceMaterialsSection({
  sourceItems,
}: {
  sourceItems: Array<{
    _id: string;
    productName: string;
    productCategory: string;
    productSku: string;
    quantity: number;
    unit: string;
    batchNumber?: string;
    supplierName?: string;
    sourceType?: string;
    receivedDate?: number;
  }>;
}) {
  if (sourceItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Sin insumos registrados</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sourceItems.map((item) => (
        <div
          key={item._id}
          className="rounded-lg border bg-white p-3 space-y-2 hover:border-amber-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.productName}
              </p>
              {item.productSku && (
                <p className="text-xs text-gray-400 font-mono">{item.productSku}</p>
              )}
            </div>
            {item.productCategory && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {item.productCategory}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="font-medium">
              {item.quantity} {item.unit}
            </span>
            {item.batchNumber && (
              <span className="font-mono text-gray-400">Lote: {item.batchNumber}</span>
            )}
          </div>

          {(item.supplierName || item.sourceType || item.receivedDate) && (
            <div className="border-t pt-2 space-y-1">
              {item.supplierName && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Truck className="h-3 w-3" />
                  {item.supplierName}
                </div>
              )}
              {item.sourceType && (
                <p className="text-xs text-gray-400">
                  {SOURCE_TYPE_LABELS[item.sourceType] ?? item.sourceType}
                </p>
              )}
              {item.receivedDate && (
                <p className="text-xs text-gray-400">
                  Recibido: {formatDate(item.receivedDate)}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Activity timeline section ─────────────────────────────────────────────────

function ActivityTimelineSection({
  activities,
}: {
  activities: Array<{
    _id: string;
    activityType: string;
    status?: string;
    cropPhase?: string;
    startedAt?: number;
    completedAt?: number;
    timestamp: number;
    performerName?: string;
    resources: Array<{
      productName: string;
      quantity: number;
      unit: string;
      direction: string;
    }>;
    notes?: string;
  }>;
}) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Sin actividades registradas</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-1">
      {/* Vertical line */}
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />

      {activities.map((act) => {
        const statusCfg =
          ACTIVITY_STATUS_CONFIG[act.status ?? ''] ??
          ACTIVITY_STATUS_CONFIG['planned'];
        const StatusIcon = statusCfg.icon;
        const displayDate = act.startedAt ?? act.timestamp;

        return (
          <div key={act._id} className="relative pb-4">
            {/* Timeline dot */}
            <div className="absolute -left-3.5 top-1 h-3 w-3 rounded-full border-2 border-background bg-amber-400" />

            <div className="rounded-lg border bg-white p-3 space-y-2">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">
                    {ACTIVITY_TYPE_LABELS[act.activityType] ?? act.activityType}
                  </span>
                  {act.cropPhase && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 text-emerald-700 border-emerald-200 bg-emerald-50"
                    >
                      <Leaf className="h-2.5 w-2.5 mr-1" />
                      {PHASE_LABELS[act.cropPhase] ?? act.cropPhase}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {act.status && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border',
                        statusCfg.color
                      )}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {statusCfg.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(displayDate)}
                </span>
                {act.completedAt && act.startedAt && (
                  <span>
                    Duracion:{' '}
                    {Math.round((act.completedAt - act.startedAt) / 60000)} min
                  </span>
                )}
                {act.performerName && (
                  <span className="text-gray-500">{act.performerName}</span>
                )}
              </div>

              {/* Resources */}
              {act.resources.length > 0 && (
                <div className="border-t pt-2 space-y-1">
                  {act.resources.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={cn(
                          'w-20 text-right font-medium shrink-0',
                          DIRECTION_COLORS[r.direction] ?? 'text-gray-500'
                        )}
                      >
                        {DIRECTION_LABELS[r.direction] ?? r.direction}
                      </span>
                      <span className="text-gray-700">
                        {r.productName}
                      </span>
                      <span className="text-gray-400 ml-auto">
                        {r.quantity} {r.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {act.notes && (
                <p className="text-xs text-gray-500 italic border-t pt-2">
                  {act.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Genealogy section ─────────────────────────────────────────────────────────

function GenealogySection({
  parentBatch,
  childBatches,
}: {
  parentBatch?: {
    _id: string;
    batchCode: string;
    status: string;
  } | null;
  childBatches: Array<{
    _id: string;
    batchCode: string;
    status: string;
    currentPhase?: string;
    plantCount: number;
  }>;
}) {
  const hasParent = !!parentBatch;
  const hasChildren = childBatches.length > 0;

  if (!hasParent && !hasChildren) {
    return (
      <div className="text-center py-8 text-gray-400">
        <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Sin genealogia registrada</p>
        <p className="text-xs mt-1">
          Este lote no fue dividido ni proviene de otro lote
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Parent batch */}
      {hasParent && parentBatch && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Lote origen
          </p>
          <Link href={`/batches/${parentBatch._id}`}>
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-blue-50 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
              <ArrowDown className="h-4 w-4 text-blue-500 rotate-180" />
              <span className="font-medium text-blue-900">{parentBatch.batchCode}</span>
              <Badge
                className={cn(
                  'ml-auto text-[10px]',
                  BATCH_STATUS_CONFIG[parentBatch.status]?.color ?? 'bg-gray-100 text-gray-700'
                )}
              >
                {BATCH_STATUS_CONFIG[parentBatch.status]?.label ?? parentBatch.status}
              </Badge>
            </div>
          </Link>
        </div>
      )}

      {/* Connector arrow */}
      {hasParent && hasChildren && (
        <div className="flex items-center justify-center">
          <ArrowDown className="h-5 w-5 text-gray-300" />
        </div>
      )}

      {/* Child batches */}
      {hasChildren && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Lotes derivados ({childBatches.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {childBatches.map((child) => (
              <Link key={child._id} href={`/batches/${child._id}`}>
                <div className="flex items-center gap-3 rounded-lg border p-3 bg-white hover:border-amber-300 transition-colors cursor-pointer">
                  <ArrowRight className="h-4 w-4 text-amber-500" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {child.batchCode}
                    </p>
                    <p className="text-xs text-gray-400">
                      {child.plantCount} plantas
                      {child.currentPhase && (
                        <> &middot; {PHASE_LABELS[child.currentPhase] ?? child.currentPhase}</>
                      )}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'shrink-0 text-[10px]',
                      BATCH_STATUS_CONFIG[child.status]?.color ?? 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {BATCH_STATUS_CONFIG[child.status]?.label ?? child.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Phase transitions section ─────────────────────────────────────────────────

function PhaseTransitionsSection({
  phaseTransitions,
}: {
  phaseTransitions: Array<{
    phaseName: string;
    fromStatus: string;
    toStatus: string;
    transitionType: string;
    timestamp: number;
  }>;
}) {
  if (phaseTransitions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Leaf className="h-4 w-4 text-emerald-600" />
          Transiciones de fase
          <Badge variant="secondary" className="ml-auto">
            {phaseTransitions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-5 space-y-2">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />
          {phaseTransitions.map((t, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-3 top-1.5 h-2 w-2 rounded-full bg-emerald-400" />
              <div className="flex items-start gap-3 text-xs">
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{t.phaseName}</span>
                  <span className="text-gray-400 mx-1">&middot;</span>
                  <span className="text-gray-500">
                    {t.fromStatus} <ArrowRight className="h-2.5 w-2.5 inline" /> {t.toStatus}
                  </span>
                  <span className="text-gray-400 mx-1">&middot;</span>
                  <span className="text-gray-400 capitalize">{t.transitionType}</span>
                </div>
                <span className="text-gray-400 shrink-0">{formatDate(t.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Output items section ──────────────────────────────────────────────────────

function OutputItemsSection({
  outputItems,
}: {
  outputItems: Array<{
    _id: string;
    productName: string;
    productCategory: string;
    quantity: number;
    unit: string;
    batchNumber?: string;
    transformationStatus?: string;
    createdAt: number;
  }>;
}) {
  if (outputItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Sin productos generados registrados</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {outputItems.map((item) => (
        <div
          key={item._id}
          className="rounded-lg border bg-white p-3 space-y-2 hover:border-purple-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.productName}
            </p>
            {item.productCategory && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {item.productCategory}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="font-medium text-purple-700">
              {item.quantity} {item.unit}
            </span>
            {item.batchNumber && (
              <span className="font-mono text-gray-400">Lote: {item.batchNumber}</span>
            )}
          </div>

          <div className="border-t pt-2 flex items-center justify-between">
            {item.transformationStatus && (
              <Badge
                variant="secondary"
                className="text-[10px]"
              >
                {TRANSFORMATION_STATUS_LABELS[item.transformationStatus] ??
                  item.transformationStatus}
              </Badge>
            )}
            <p className="text-xs text-gray-400 ml-auto">
              {formatDate(item.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BatchTraceabilityView({ batchId }: BatchTraceabilityViewProps) {
  const traceability = useQuery(api.batches.getBatchTraceability, {
    batchId: batchId as Id<'batches'>,
  });

  // Loading state
  if (traceability === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Not found
  if (traceability === null) {
    return (
      <div className="text-center py-12 text-gray-400">
        <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="font-medium text-gray-600">Sin datos de trazabilidad disponibles</p>
        <p className="text-sm mt-1">No se encontro informacion para este lote</p>
      </div>
    );
  }

  const {
    sourceItems,
    outputItems,
    activityTimeline,
    parentBatch,
    childBatches,
    phaseTransitions,
    stats,
  } = traceability;

  const hasAnyData =
    sourceItems.length > 0 ||
    outputItems.length > 0 ||
    activityTimeline.length > 0 ||
    parentBatch !== null ||
    childBatches.length > 0 ||
    phaseTransitions.length > 0;

  if (!hasAnyData) {
    return (
      <div className="text-center py-12 text-gray-400">
        <GitBranch className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="font-medium text-gray-600">Sin datos de trazabilidad disponibles</p>
        <p className="text-sm mt-1">
          Aun no hay actividades ni movimientos de inventario registrados para este lote
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <StatsBar stats={stats} />

      {/* Phase transitions (compact, at top if present) */}
      {phaseTransitions.length > 0 && (
        <PhaseTransitionsSection phaseTransitions={phaseTransitions} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Source materials + Genealogy */}
        <div className="space-y-6">
          {/* Source materials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-600" />
                Origen (insumos)
                {sourceItems.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {sourceItems.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SourceMaterialsSection sourceItems={sourceItems} />
            </CardContent>
          </Card>

          {/* Genealogy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-blue-600" />
                Genealogia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GenealogySection
                parentBatch={parentBatch}
                childBatches={childBatches}
              />
            </CardContent>
          </Card>

          {/* Output products */}
          {outputItems.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-purple-600" />
                  Productos generados
                  <Badge variant="secondary" className="ml-auto">
                    {outputItems.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OutputItemsSection outputItems={outputItems} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Activity timeline */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-600" />
                Linea de tiempo
                {activityTimeline.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {activityTimeline.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimelineSection activities={activityTimeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
