'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { ObservationCard, OBSERVATION_TYPE_CONFIG, SEVERITY_CONFIG } from './observation-card';

// ── Sort helpers ─────────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
};

// ── Component ────────────────────────────────────────────────────────────────

interface ActiveIssuesDashboardProps {
  companyId: Id<'companies'>;
}

export function ActiveIssuesDashboard({ companyId }: ActiveIssuesDashboardProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'follow_up' | 'date'>('severity');

  const stats = useQuery(api.activityObservations.getStats, { companyId });
  const unresolvedRaw = useQuery(api.activityObservations.listUnresolved, { companyId });
  const resolveObservation = useMutation(api.activityObservations.resolve);

  if (stats === undefined || unresolvedRaw === undefined) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Apply client-side filters
  let filtered = [...unresolvedRaw];
  if (filterType !== 'all') {
    filtered = filtered.filter((o) => o.observation_type === filterType);
  }
  if (filterSeverity !== 'all') {
    filtered = filtered.filter((o) => o.severity === filterSeverity);
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'severity') {
      const sa = SEVERITY_ORDER[a.severity ?? 'none'] ?? 4;
      const sb = SEVERITY_ORDER[b.severity ?? 'none'] ?? 4;
      if (sa !== sb) return sa - sb;
      return b.created_at - a.created_at;
    }
    if (sortBy === 'follow_up') {
      const fa = a.follow_up_date ?? Infinity;
      const fb = b.follow_up_date ?? Infinity;
      return fa - fb;
    }
    return b.created_at - a.created_at;
  });

  const handleResolve = async (observationId: Id<'activity_observations'>) => {
    try {
      await resolveObservation({ observationId });
      toast.success('Observación resuelta');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al resolver'
      );
    }
  };

  const criticalCount = stats.by_severity?.critical ?? 0;
  const overdueCount = stats.overdue;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Problemas Activos
          </CardTitle>
          <div className="flex items-center gap-2">
            {stats.total_active > 0 && (
              <span className="text-sm text-gray-600">
                {stats.total_active} activos
              </span>
            )}
            {criticalCount > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                {criticalCount} críticos
              </Badge>
            )}
            {overdueCount > 0 && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {overdueCount} vencidos
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stats.total_active === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-400" />
            <p className="text-sm">No hay problemas activos</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Object.entries(OBSERVATION_TYPE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toda severidad</SelectItem>
                  {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="severity">Severidad</SelectItem>
                  <SelectItem value="follow_up">Fecha seguimiento</SelectItem>
                  <SelectItem value="date">Fecha detección</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Issues list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay observaciones con estos filtros
                </p>
              ) : (
                filtered.map((obs) => (
                  <ObservationCard
                    key={obs._id}
                    observation={obs}
                    onResolve={handleResolve}
                  />
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
