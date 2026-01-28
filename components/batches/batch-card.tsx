'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Layers,
  MoreVertical,
  Eye,
  ArrowRight,
  Split,
  Merge,
  Trash2,
  Leaf,
  MapPin,
  Calendar,
  AlertTriangle,
  Archive,
} from 'lucide-react';
import { BatchMoveModal } from './batch-move-modal';
import { BatchSplitWizard } from './batch-split-wizard';
import { BatchLossModal } from './batch-loss-modal';
import { BatchHarvestWizard } from './batch-harvest-wizard';
import { BatchMergeModal } from './batch-merge-modal';
import { BatchArchiveModal } from './batch-archive-modal';
import { Id } from '@/convex/_generated/dataModel';

interface BatchCardProps {
  batch: {
    _id: Id<'batches'>;
    batch_code: string;
    status: string;
    batch_type: string;
    cultivarName?: string | null;
    cropTypeName?: string | null;
    areaName?: string | null;
    facilityName?: string | null;
    orderNumber?: string | null;
    current_quantity: number;
    initial_quantity: number;
    lost_quantity: number;
    mortality_rate: number;
    current_phase?: string;
    daysInProduction: number;
    created_date: number;
    current_area_id?: Id<'areas'>;
    area_id?: Id<'areas'>; // Required by modals
    cultivar_id?: Id<'cultivars'> | null;
    crop_type_id?: Id<'crop_types'>;
    facility_id: Id<'facilities'>;
    company_id: Id<'companies'>;
    enable_individual_tracking?: boolean;
    germination_date?: number;
    notes?: string;
    source_type?: string;
    production_order_id?: Id<'production_orders'>;
    unit_of_measure?: string; // Required by modals
  };
  onClick: () => void;
}

export function BatchCard({ batch, onClick }: BatchCardProps) {
  // Modal state management
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [lossModalOpen, setLossModalOpen] = useState(false);
  const [harvestModalOpen, setHarvestModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Get status color for header gradient
  const getHeaderGradient = () => {
    switch (batch.status) {
      case 'active':
        return 'from-green-100 to-green-200';
      case 'harvested':
        return 'from-amber-100 to-amber-200';
      case 'lost':
        return 'from-red-100 to-red-200';
      case 'split':
      case 'merged':
        return 'from-blue-100 to-blue-200';
      default:
        return 'from-gray-100 to-gray-200';
    }
  };

  // Map status to StatusBadge format
  const getStatusBadgeStatus = () => {
    switch (batch.status) {
      case 'active':
        return 'active';
      case 'harvested':
        return 'maintenance';
      case 'lost':
        return 'inactive';
      default:
        return 'inactive';
    }
  };

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    harvested: 'Cosechado',
    lost: 'Perdido',
    split: 'Dividido',
    merged: 'Fusionado',
    archived: 'Archivado',
  };

  const phaseLabels: Record<string, string> = {
    germination: 'Germinacion',
    seedling: 'Plantula',
    propagation: 'Propagacion',
    vegetative: 'Vegetativo',
    flowering: 'Floracion',
    harvest: 'Cosecha',
  };

  // Calculate survival rate
  const survivalRate =
    batch.initial_quantity > 0
      ? Math.round((batch.current_quantity / batch.initial_quantity) * 100)
      : 100;

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Header with gradient */}
      <div
        className={`h-20 bg-gradient-to-br ${getHeaderGradient()} flex items-center justify-center`}
      >
        <Layers className="h-8 w-8 text-gray-500" />
      </div>

      <CardContent className="pt-4 space-y-3">
        {/* Title + Menu */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-bold text-sm">{batch.batch_code}</span>
            {batch.orderNumber && (
              <p className="text-xs text-gray-500">{batch.orderNumber}</p>
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
              {batch.status === 'active' && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setMoveModalOpen(true); }}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Mover
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSplitModalOpen(true); }}>
                    <Split className="h-4 w-4 mr-2" />
                    Dividir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setMergeModalOpen(true); }}>
                    <Merge className="h-4 w-4 mr-2" />
                    Fusionar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setHarvestModalOpen(true); }}>
                    <Leaf className="h-4 w-4 mr-2" />
                    Cosechar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); setLossModalOpen(true); }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Registrar Perdida
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); setArchiveModalOpen(true); }}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archivar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Cultivar and Phase */}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {batch.cultivarName || batch.cropTypeName || 'Sin cultivar'}
          </p>
          {batch.current_phase && (
            <p className="text-xs text-gray-500">
              Fase: {phaseLabels[batch.current_phase] || batch.current_phase}
            </p>
          )}
        </div>

        {/* Quantities */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600 flex items-center justify-center gap-1">
              <Leaf className="h-4 w-4" />
              {batch.current_quantity}
            </p>
            <p className="text-xs text-gray-500">Actuales</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">{batch.initial_quantity}</p>
            <p className="text-xs text-gray-500">Iniciales</p>
          </div>
          <div className="text-center">
            <p
              className={`text-sm ${
                batch.lost_quantity > 0 ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              {batch.lost_quantity > 0 && (
                <AlertTriangle className="h-3 w-3 inline mr-1" />
              )}
              {batch.lost_quantity}
            </p>
            <p className="text-xs text-gray-500">Perdidas</p>
          </div>
        </div>

        {/* Survival Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Supervivencia</span>
            <span className={`font-medium ${survivalRate < 90 ? 'text-amber-600' : ''}`}>
              {survivalRate}%
            </span>
          </div>
          <Progress value={survivalRate} className="h-1.5" />
        </div>

        {/* Location and Date */}
        <div className="flex items-center justify-between pt-1 border-t">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[100px]">
              {batch.areaName || 'Sin area'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{batch.daysInProduction}d</span>
            </div>
            <StatusBadge
              status={getStatusBadgeStatus()}
              size="sm"
              label={statusLabels[batch.status] || batch.status}
            />
          </div>
        </div>
      </CardContent>

      {/* Modals */}
      <BatchMoveModal
        batch={batch as any}
        open={moveModalOpen}
        onOpenChange={setMoveModalOpen}
      />
      <BatchSplitWizard
        batch={batch as any}
        open={splitModalOpen}
        onOpenChange={setSplitModalOpen}
      />
      <BatchLossModal
        batch={batch as any}
        open={lossModalOpen}
        onOpenChange={setLossModalOpen}
      />
      <BatchHarvestWizard
        batch={batch as any}
        open={harvestModalOpen}
        onOpenChange={setHarvestModalOpen}
      />
      <BatchMergeModal
        batch={batch as any}
        open={mergeModalOpen}
        onOpenChange={setMergeModalOpen}
      />
      <BatchArchiveModal
        batch={batch as any}
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
      />
    </Card>
  );
}
