'use client';

import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ClipboardList,
  MoreVertical,
  Eye,
  Edit,
  Play,
  Layers,
  Leaf,
  Calendar,
} from 'lucide-react';

interface ProductionOrderCardProps {
  order: {
    _id: string;
    order_number: string;
    status: string;
    order_type: string;
    cultivarName?: string | null;
    cropTypeName?: string | null;
    templateName?: string | null;
    facilityName?: string | null;
    currentPhaseName?: string | null;
    batchesCount: number;
    activeBatchesCount: number;
    total_plants_planned: number;
    total_plants_actual: number;
    completion_percentage: number;
    planned_start_date?: number;
    estimated_completion_date?: number;
    priority: string;
  };
  onClick: () => void;
}

export function ProductionOrderCard({ order, onClick }: ProductionOrderCardProps) {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Get status color for header gradient
  const getHeaderGradient = () => {
    switch (order.status) {
      case 'active':
        return 'from-green-100 to-green-200';
      case 'planning':
        return 'from-blue-100 to-blue-200';
      case 'completed':
        return 'from-gray-100 to-gray-200';
      case 'cancelled':
        return 'from-red-100 to-red-200';
      default:
        return 'from-gray-100 to-gray-200';
    }
  };

  // Map status to StatusBadge format
  const getStatusBadgeStatus = () => {
    switch (order.status) {
      case 'active':
        return 'active';
      case 'planning':
        return 'maintenance';
      case 'completed':
        return 'inactive';
      default:
        return 'inactive';
    }
  };

  const statusLabels: Record<string, string> = {
    planning: 'Planificacion',
    active: 'Activa',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Header with gradient */}
      <div
        className={`h-24 bg-gradient-to-br ${getHeaderGradient()} flex items-center justify-center`}
      >
        <ClipboardList className="h-10 w-10 text-gray-500" />
      </div>

      <CardContent className="pt-4 space-y-3">
        {/* Title + Menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{order.order_number}</span>
            {order.priority === 'high' && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                Prioridad
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalle
              </DropdownMenuItem>
              {order.status === 'planning' && (
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {order.status === 'planning' && (
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Play className="h-4 w-4 mr-2" />
                  Activar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Cultivar and Type */}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {order.cultivarName || order.cropTypeName || 'Sin cultivar'}
          </p>
          {order.templateName && (
            <p className="text-xs text-gray-500">{order.templateName}</p>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            <span>{order.activeBatchesCount} lotes</span>
          </div>
          <div className="flex items-center gap-1">
            <Leaf className="h-3.5 w-3.5" />
            <span>{order.total_plants_actual.toLocaleString()} plantas</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Progreso</span>
            <span className="font-medium">{order.completion_percentage}%</span>
          </div>
          <Progress value={order.completion_percentage} className="h-1.5" />
          {order.currentPhaseName && (
            <p className="text-xs text-gray-500">Fase: {order.currentPhaseName}</p>
          )}
        </div>

        {/* Dates and Status */}
        <div className="flex items-center justify-between pt-1 border-t">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(order.planned_start_date)}</span>
            <span className="mx-1">→</span>
            <span>{formatDate(order.estimated_completion_date)}</span>
          </div>
          <StatusBadge
            status={getStatusBadgeStatus()}
            size="sm"
            label={statusLabels[order.status] || order.status}
          />
        </div>
      </CardContent>
    </Card>
  );
}
