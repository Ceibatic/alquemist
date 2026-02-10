'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Package, Users, Zap, Wrench } from 'lucide-react';

interface BatchCostSummaryProps {
  batchId: Id<'batches'>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <p>{message}</p>
    </div>
  );
}

export function BatchCostSummary({ batchId }: BatchCostSummaryProps) {
  const costData = useQuery(api.inventory.getFullCostByBatch, { batchId });

  if (costData === undefined) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasAnyData =
    costData.grandTotal > 0 ||
    costData.materials.entries.length > 0 ||
    costData.labor.entries.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          COGS — Costo de Producción
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyData ? (
          <EmptyState message="No hay costos registrados para este batch." />
        ) : (
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              <TabsTrigger value="materials">Insumos</TabsTrigger>
              <TabsTrigger value="labor">Mano de Obra</TabsTrigger>
              <TabsTrigger value="utilities">Utilities</TabsTrigger>
              <TabsTrigger value="depreciation">Depreciación</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4 pt-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">COGS Total</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(costData.grandTotal)}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                  icon={<Package className="h-4 w-4" />}
                  label="Insumos"
                  value={costData.materials.total}
                  percentage={costData.breakdown.materials}
                  color="bg-blue-100 text-blue-700"
                />
                <SummaryCard
                  icon={<Users className="h-4 w-4" />}
                  label="Mano de Obra"
                  value={costData.labor.total}
                  percentage={costData.breakdown.labor}
                  color="bg-green-100 text-green-700"
                />
                <SummaryCard
                  icon={<Zap className="h-4 w-4" />}
                  label="Utilities"
                  value={costData.utilities.total}
                  percentage={costData.breakdown.utilities}
                  color="bg-amber-100 text-amber-700"
                />
                <SummaryCard
                  icon={<Wrench className="h-4 w-4" />}
                  label="Depreciación"
                  value={costData.depreciation.total}
                  percentage={costData.breakdown.depreciation}
                  color="bg-purple-100 text-purple-700"
                />
              </div>

              {/* Proportion bars */}
              {costData.grandTotal > 0 && (
                <div className="h-4 flex rounded-full overflow-hidden">
                  {costData.breakdown.materials > 0 && (
                    <div
                      className="bg-blue-500"
                      style={{ width: `${costData.breakdown.materials}%` }}
                      title={`Insumos: ${costData.breakdown.materials}%`}
                    />
                  )}
                  {costData.breakdown.labor > 0 && (
                    <div
                      className="bg-green-500"
                      style={{ width: `${costData.breakdown.labor}%` }}
                      title={`Mano de Obra: ${costData.breakdown.labor}%`}
                    />
                  )}
                  {costData.breakdown.utilities > 0 && (
                    <div
                      className="bg-amber-500"
                      style={{ width: `${costData.breakdown.utilities}%` }}
                      title={`Utilities: ${costData.breakdown.utilities}%`}
                    />
                  )}
                  {costData.breakdown.depreciation > 0 && (
                    <div
                      className="bg-purple-500"
                      style={{ width: `${costData.breakdown.depreciation}%` }}
                      title={`Depreciación: ${costData.breakdown.depreciation}%`}
                    />
                  )}
                </div>
              )}
            </TabsContent>

            {/* Materials Tab */}
            <TabsContent value="materials" className="pt-4">
              {costData.materials.entries.length === 0 ? (
                <EmptyState message="No hay registros de insumos para este batch." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Fase</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Costo/Unidad</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costData.materials.entries.map((m) => (
                        <TableRow key={m._id}>
                          <TableCell>
                            {new Date(m.date).toLocaleDateString('es-CO')}
                          </TableCell>
                          <TableCell>{m.productName}</TableCell>
                          <TableCell className="text-gray-500">
                            {m.cropPhase || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {m.quantity} {m.quantityUnit}
                          </TableCell>
                          <TableCell className="text-right">
                            {m.costPerUnit
                              ? formatCurrency(m.costPerUnit)
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(m.costTotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-gray-50">
                        <TableCell colSpan={5}>Total Insumos</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(costData.materials.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Labor Tab */}
            <TabsContent value="labor" className="pt-4">
              {costData.labor.entries.length === 0 ? (
                <EmptyState message="No hay registros de mano de obra para este batch." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Actividad</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead className="text-right">Horas</TableHead>
                        <TableHead className="text-right">Tarifa</TableHead>
                        <TableHead className="text-right">Costo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costData.labor.entries.map((l) => (
                        <TableRow key={l._id}>
                          <TableCell>
                            {new Date(l.date).toLocaleDateString('es-CO')}
                          </TableCell>
                          <TableCell>{l.activityType || '-'}</TableCell>
                          <TableCell>{l.userName}</TableCell>
                          <TableCell className="text-gray-500">
                            {l.roleName}
                          </TableCell>
                          <TableCell className="text-right">
                            {(l.durationMinutes / 60).toFixed(1)}h
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(l.hourlyRate)}/h
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(l.costTotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-gray-50">
                        <TableCell colSpan={6}>Total Mano de Obra</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(costData.labor.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Utilities Tab */}
            <TabsContent value="utilities" className="pt-4">
              {costData.utilities.entries.length === 0 ? (
                <EmptyState message="No hay registros de utilities para este batch." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Consumo Facility</TableHead>
                        <TableHead className="text-right">Proporción</TableHead>
                        <TableHead className="text-right">Costo Asignado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costData.utilities.entries.map((u) => {
                        const typeLabels: Record<string, string> = {
                          utility_electricity: 'Electricidad',
                          utility_water: 'Agua',
                          utility_gas: 'Gas',
                        };
                        return (
                          <TableRow key={u._id}>
                            <TableCell>{u.period || '-'}</TableCell>
                            <TableCell>
                              {typeLabels[u.costType] || u.costType}
                            </TableCell>
                            <TableCell className="text-right">
                              {u.details?.consumption
                                ? `${u.details.consumption.toLocaleString('es-CO')} ${u.details.consumption_unit || ''}`
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {u.details?.proportion
                                ? `${u.details.proportion}%`
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(u.costTotal)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-bold bg-gray-50">
                        <TableCell colSpan={4}>Total Utilities</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(costData.utilities.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Depreciation Tab */}
            <TabsContent value="depreciation" className="pt-4">
              {costData.depreciation.entries.length === 0 ? (
                <EmptyState message="No hay registros de depreciación para este batch." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-right">Depreciación Mensual</TableHead>
                        <TableHead className="text-right">Proporción</TableHead>
                        <TableHead className="text-right">Costo Asignado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costData.depreciation.entries.map((d) => (
                        <TableRow key={d._id}>
                          <TableCell>{d.period || '-'}</TableCell>
                          <TableCell>
                            {d.details?.equipment_name || 'Equipo'}
                            {d.details?.equipment_sku && (
                              <span className="text-gray-500 text-xs ml-1">
                                ({d.details.equipment_sku})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {d.details?.monthly_depreciation
                              ? formatCurrency(d.details.monthly_depreciation)
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {d.details?.proportion
                              ? `${d.details.proportion}%`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(d.costTotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-gray-50">
                        <TableCell colSpan={4}>Total Depreciación</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(costData.depreciation.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  percentage,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  percentage: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${color} mb-2`}>
        {icon}
        {label}
      </div>
      <p className="text-lg font-bold">{formatCurrency(value)}</p>
      <p className="text-xs text-gray-500">{percentage}% del total</p>
    </div>
  );
}
