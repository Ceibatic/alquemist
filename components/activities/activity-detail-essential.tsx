'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getPhaseLabel } from '@/lib/constants/phases';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Layers,
  MapPin,
  Building2,
  Tag,
  FileText,
} from 'lucide-react';

interface ActivityData {
  title?: string;
  category?: string | null;
  crop_phase?: string | null;
  status?: string | null;
  started_at?: number | null;
  completed_at?: number | null;
  timestamp?: number;
  duration_minutes?: number | null;
  observations?: string | null;
  notes?: string | null;
  batch_id?: string | null;
  batchCode: string | null;
  batchCultivar: string | null;
  areaName: string | null;
  facilityName: string | null;
  performedByName: string | null;
  assignedToName: string | null;
  verifiedByName: string | null;
  activityTypeName: string | null;
  activityTypeCategory: string | null;
}

interface ActivityDetailEssentialProps {
  activity: ActivityData;
  areaId: string;
}

const statusLabels: Record<string, string> = {
  planned: 'Planificado',
  in_progress: 'En progreso',
  completed: 'Completado',
  verified: 'Verificado',
  cancelled: 'Cancelado',
};

const categoryLabels: Record<string, string> = {
  cultivation: 'Cultivo',
  monitoring: 'Monitoreo',
  transformation: 'Transformacion',
  application: 'Aplicacion',
  movement: 'Movimiento',
  maintenance: 'Mantenimiento',
  quality: 'Calidad',
  harvest: 'Cosecha',
  post_harvest: 'Poscosecha',
  administrative: 'Administrativo',
};

function formatDate(ts: number | null | undefined) {
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(mins: number | null | undefined) {
  if (!mins) return '-';
  if (mins < 60) return `${mins} minutos`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className="text-sm text-gray-900">{children}</div>
      </div>
    </div>
  );
}

export function ActivityDetailEssential({
  activity,
  areaId,
}: ActivityDetailEssentialProps) {
  const date = activity.started_at ?? activity.timestamp;

  return (
    <div className="space-y-6">
      {/* Header info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {activity.title || activity.activityTypeName || 'Actividad'}
            </CardTitle>
            {activity.status && (
              <StatusBadge
                status={
                  activity.status === 'completed' || activity.status === 'verified'
                    ? 'active'
                    : activity.status === 'cancelled'
                      ? 'inactive'
                      : 'maintenance'
                }
                label={statusLabels[activity.status] ?? activity.status}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1 sm:grid-cols-2">
            <InfoRow icon={Tag} label="Tipo">
              {activity.activityTypeName ?? '-'}
            </InfoRow>
            <InfoRow icon={Tag} label="Categoria">
              {activity.activityTypeCategory
                ? categoryLabels[activity.activityTypeCategory] ?? activity.activityTypeCategory
                : '-'}
            </InfoRow>
            <InfoRow icon={Calendar} label="Fecha">
              {formatDate(date)}
            </InfoRow>
            <InfoRow icon={Clock} label="Duracion">
              {formatDuration(activity.duration_minutes)}
            </InfoRow>
            <InfoRow icon={Layers} label="Lote">
              {activity.batchCode ? (
                <Link
                  href={`/batches/${activity.batch_id}`}
                  className="text-amber-600 hover:underline font-mono text-xs"
                >
                  {activity.batchCode}
                </Link>
              ) : (
                '-'
              )}
              {activity.batchCultivar && (
                <span className="text-gray-500 ml-1">({activity.batchCultivar})</span>
              )}
            </InfoRow>
            <InfoRow icon={MapPin} label="Fase">
              {getPhaseLabel(activity.crop_phase)}
            </InfoRow>
            <InfoRow icon={MapPin} label="Area">
              {activity.areaName ? (
                <Link
                  href={`/areas/${areaId}`}
                  className="text-amber-600 hover:underline"
                >
                  {activity.areaName}
                </Link>
              ) : (
                '-'
              )}
            </InfoRow>
            <InfoRow icon={Building2} label="Instalacion">
              {activity.facilityName ?? '-'}
            </InfoRow>
          </div>
        </CardContent>
      </Card>

      {/* People */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Responsables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1 sm:grid-cols-2">
            <InfoRow icon={User} label="Realizado por">
              {activity.performedByName ?? '-'}
            </InfoRow>
            <InfoRow icon={User} label="Asignado a">
              {activity.assignedToName ?? '-'}
            </InfoRow>
            <InfoRow icon={User} label="Verificado por">
              {activity.verifiedByName ?? '-'}
            </InfoRow>
          </div>
        </CardContent>
      </Card>

      {/* Observations & Notes */}
      {(activity.observations || activity.notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.observations && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Observaciones</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {activity.observations}
                </p>
              </div>
            )}
            {activity.notes && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Notas</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {activity.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
