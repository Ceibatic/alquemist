'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  PackagePlus,
  Trash2,
  AlertCircle,
  Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TransformationOutput {
  productId: string;
  productRole: string; // "primary" | "secondary" | "waste"
  expectedQuantity: number;
  actualQuantity: number;
  unit: string;
}

interface TransformationOutputsFormProps {
  /** Cultivar ID from the batch — used to fetch phase_product_flows */
  cultivarId?: string;
  /** Current phase name — used to fetch phase_product_flows */
  phaseName?: string;
  /** Total input quantity (e.g. 42 plants) */
  sourceQuantity: number;
  /** Unit label for the input quantity (e.g. "plantas") */
  sourceUnit: string;
  /** Callback fired whenever any output value changes */
  onChange: (outputs: TransformationOutput[]) => void;
}

const ROLE_LABELS: Record<string, string> = {
  primary: 'Principal',
  secondary: 'Secundario',
  waste: 'Merma',
};

const ROLE_BADGE_VARIANT: Record<string, string> = {
  primary: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  secondary: 'bg-blue-100 text-blue-800 border-blue-200',
  waste: 'bg-red-100 text-red-800 border-red-200',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransformationOutputsForm({
  cultivarId,
  phaseName,
  sourceQuantity,
  sourceUnit,
  onChange,
}: TransformationOutputsFormProps) {
  // ── Backend data ────────────────────────────────────────────────────────
  const flows = useQuery(
    api.phaseProductFlows.getByCultivarPhase,
    cultivarId && phaseName
      ? {
          cultivarId: cultivarId as Id<'cultivars'>,
          phaseName,
          direction: 'output',
        }
      : 'skip',
  );

  // ── Output row state ────────────────────────────────────────────────────
  // Each row: { productId, productRole, expectedQty, actualQty, unit }
  type OutputRow = {
    productId: string;
    productRole: string;
    expectedQty: number;
    actualQty: number;
    unit: string;
    productName: string;
  };

  const [rows, setRows] = useState<OutputRow[]>([]);

  // ── Waste state ─────────────────────────────────────────────────────────
  const [wasteQty, setWasteQty] = useState<number>(0);
  const [wasteReason, setWasteReason] = useState<string>('');

  // ── Initialise rows when flows load ────────────────────────────────────
  useEffect(() => {
    if (!flows) return;

    const outputFlows = flows.filter((f) => f.product_role !== 'waste');
    if (outputFlows.length === 0) return;

    setRows(
      outputFlows.map((f) => {
        let expectedQty = 0;
        if (f.yield_pct !== undefined) {
          expectedQty =
            Math.round(sourceQuantity * f.yield_pct * 100) / 100;
        } else if (f.expected_quantity_per_input !== undefined) {
          expectedQty =
            Math.round(
              sourceQuantity * f.expected_quantity_per_input * 100,
            ) / 100;
        } else {
          expectedQty = sourceQuantity;
        }
        return {
          productId: f.product_id as string,
          productRole: f.product_role,
          expectedQty,
          actualQty: expectedQty,
          unit: f.productUnit,
          productName: f.productName,
        };
      }),
    );
  }, [flows, sourceQuantity]);

  // ── Propagate changes to parent ─────────────────────────────────────────
  useEffect(() => {
    const outputs: TransformationOutput[] = rows.map((r) => ({
      productId: r.productId,
      productRole: r.productRole,
      expectedQuantity: r.expectedQty,
      actualQuantity: r.actualQty,
      unit: r.unit,
    }));

    if (wasteQty > 0) {
      outputs.push({
        productId: '__waste__',
        productRole: 'waste',
        expectedQuantity: 0,
        actualQuantity: wasteQty,
        unit: sourceUnit,
      });
    }

    onChange(outputs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, wasteQty, wasteReason]);

  // ── Derived totals ──────────────────────────────────────────────────────
  const totalActualOutput = useMemo(
    () =>
      rows.reduce((sum, r) => sum + (Number(r.actualQty) || 0), 0) +
      (Number(wasteQty) || 0),
    [rows, wasteQty],
  );

  // ── Handlers ────────────────────────────────────────────────────────────
  function updateActualQty(index: number, value: number) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index]!, actualQty: value };
      return next;
    });
  }

  // ── Early return: no cultivar/phase data ────────────────────────────────
  if (!cultivarId || !phaseName) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-muted-foreground" />
            Productos obtenidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              No se pudo determinar el cultivar o la fase del lote. Los
              productos obtenidos se registraran en el paso de Recursos.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (flows === undefined) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-muted-foreground" />
            Productos obtenidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-10 rounded-md bg-muted animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── No flows defined: fallback manual mode ──────────────────────────────
  if (flows.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-muted-foreground" />
            Productos obtenidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              No hay flujos de transformacion configurados para este cultivar
              y fase. Puedes agregar los productos obtenidos en el paso de
              Recursos usando la direccion &quot;Producido&quot;.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PackagePlus className="h-4 w-4 text-muted-foreground" />
          Productos obtenidos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Registra las cantidades reales obtenidas en esta transformacion.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source summary */}
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <span className="font-medium">
            {sourceQuantity} {sourceUnit}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">
            {rows.length} producto{rows.length !== 1 ? 's' : ''} esperado
            {rows.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_6rem_6rem_4rem] items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground px-1">
          <span>Producto</span>
          <span>Rol</span>
          <span className="text-right">Esperado</span>
          <span className="text-right">Real</span>
          <span />
        </div>

        <Separator />

        {/* Output rows */}
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={row.productId}
              className="grid grid-cols-[1fr_auto_6rem_6rem_4rem] items-center gap-2"
            >
              {/* Product name */}
              <p className="text-sm font-medium truncate">{row.productName}</p>

              {/* Role badge */}
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0',
                  ROLE_BADGE_VARIANT[row.productRole] ??
                    'bg-muted text-muted-foreground border-border',
                )}
              >
                {ROLE_LABELS[row.productRole] ?? row.productRole}
              </span>

              {/* Expected quantity (read-only) */}
              <p className="text-sm text-right text-muted-foreground">
                {row.expectedQty} {row.unit}
              </p>

              {/* Actual quantity (editable) */}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={row.actualQty === 0 ? '' : row.actualQty}
                  onChange={(e) =>
                    updateActualQty(
                      index,
                      e.target.value === '' ? 0 : parseFloat(e.target.value),
                    )
                  }
                  className="h-8 text-right text-sm px-2"
                  placeholder="0"
                />
              </div>

              {/* Unit */}
              <p className="text-xs text-muted-foreground truncate">{row.unit}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Waste section */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Trash2 className="h-3 w-3" />
            Merma / Descarte
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">
                Cantidad descartada ({sourceUnit})
              </Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={wasteQty === 0 ? '' : wasteQty}
                onChange={(e) =>
                  setWasteQty(
                    e.target.value === '' ? 0 : parseFloat(e.target.value),
                  )
                }
                placeholder="0"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Razon (opcional)</Label>
              <Textarea
                value={wasteReason}
                onChange={(e) => setWasteReason(e.target.value)}
                placeholder="Ej: material no apto..."
                rows={1}
                className="text-sm min-h-[2rem] resize-none"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Totals row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total obtenido</span>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'font-medium',
                Math.abs(totalActualOutput - sourceQuantity) < 0.01
                  ? 'text-emerald-700'
                  : totalActualOutput > sourceQuantity
                    ? 'text-red-600'
                    : 'text-amber-600',
              )}
            >
              {totalActualOutput.toFixed(2)}
            </span>
            <span className="text-muted-foreground">
              de {sourceQuantity} {sourceUnit}
            </span>
            {totalActualOutput > sourceQuantity && (
              <span className="text-[10px] text-red-600 font-medium">
                Excede el total de entrada
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
