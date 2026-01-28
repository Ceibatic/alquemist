'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  Star,
  CheckCircle,
  Leaf,
  Clock,
  Flower2,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Cultivar } from '@/lib/types/phase2';

interface CultivarCardProps {
  cultivar: Cultivar;
  isSystem: boolean;
  cropTypeName?: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReactivate?: () => void;
}

export function CultivarCard({
  cultivar,
  isSystem,
  cropTypeName,
  onView,
  onEdit,
  onDelete,
  onReactivate,
}: CultivarCardProps) {
  const router = useRouter();

  // Format variety type for display
  const formatVarietyType = (type?: string) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Get flowering time in weeks
  const getFloweringTimeWeeks = () => {
    if (!cultivar.characteristics?.flowering_time_days) return null;
    const weeks = Math.round(cultivar.characteristics.flowering_time_days / 7);
    return `${weeks} semanas`;
  };

  // Get difficulty label and color
  const getDifficultyInfo = () => {
    const difficulty = cultivar.characteristics?.growth_difficulty;
    if (!difficulty) return null;
    const labels: Record<string, { label: string; color: string }> = {
      easy: { label: 'Fácil', color: 'bg-green-100 text-green-700' },
      medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-700' },
      difficult: { label: 'Difícil', color: 'bg-red-100 text-red-700' },
    };
    return labels[difficulty] || null;
  };

  // Get THC range
  const getThcRange = () => {
    const min = cultivar.characteristics?.thc_min;
    const max = cultivar.characteristics?.thc_max;
    if (min === undefined && max === undefined) return null;
    if (min !== undefined && max !== undefined) return `${min}-${max}%`;
    if (min !== undefined) return `${min}%+`;
    return `hasta ${max}%`;
  };

  // Get CBD range
  const getCbdRange = () => {
    const min = cultivar.characteristics?.cbd_min;
    const max = cultivar.characteristics?.cbd_max;
    if (min === undefined && max === undefined) return null;
    if (min !== undefined && max !== undefined) return `${min}-${max}%`;
    if (min !== undefined) return `${min}%+`;
    return `hasta ${max}%`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on dropdown menu
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown-menu]')) {
      return;
    }
    if (onView) {
      onView();
    } else {
      router.push(`/cultivars/${cultivar._id}`);
    }
  };

  const difficultyInfo = getDifficultyInfo();
  const thcRange = getThcRange();
  const cbdRange = getCbdRange();
  const floweringTime = getFloweringTimeWeeks();

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Header visual / gradient background */}
      <div className="h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Leaf className="h-16 w-16 text-green-400" />
        </div>
        {/* Origin Badge - positioned in header */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={isSystem ? 'default' : 'secondary'}
            className={cn(
              'flex items-center gap-1',
              isSystem
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            )}
          >
            {isSystem ? (
              <>
                <Star className="h-3 w-3" />
                Sistema
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3" />
                Custom
              </>
            )}
          </Badge>
        </div>
      </div>

      <CardContent className="pt-4 space-y-3">
        {/* Header with name and kebab menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-bold text-lg text-gray-900 truncate">{cultivar.name}</span>
          </div>
          {(onEdit || onDelete || onReactivate) && (
            <DropdownMenu>
              <DropdownMenuTrigger
                data-dropdown-menu
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onReactivate && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onReactivate();
                    }}
                    className="text-green-600 focus:text-green-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reactivar
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Variety type and crop type */}
        <div className="flex items-center gap-2 flex-wrap">
          {cultivar.variety_type && (
            <Badge variant="outline" className="text-xs">
              {formatVarietyType(cultivar.variety_type)}
            </Badge>
          )}
          {cropTypeName && (
            <span className="text-sm text-gray-500">{cropTypeName}</span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
          {floweringTime && (
            <div className="flex items-center gap-1">
              <Flower2 className="h-3.5 w-3.5" />
              <span>{floweringTime}</span>
            </div>
          )}
          {difficultyInfo && (
            <Badge className={cn('text-xs', difficultyInfo.color)}>
              {difficultyInfo.label}
            </Badge>
          )}
        </div>

        {/* THC/CBD for Cannabis */}
        {(thcRange || cbdRange) && (
          <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
            {thcRange && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-500" />
                <span>THC: {thcRange}</span>
              </div>
            )}
            {cbdRange && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-blue-500" />
                <span>CBD: {cbdRange}</span>
              </div>
            )}
          </div>
        )}

        {/* Genetic Lineage */}
        {cultivar.genetic_lineage && (
          <p className="text-xs text-gray-500 italic truncate">
            {cultivar.genetic_lineage}
          </p>
        )}

        {/* Last update timestamp */}
        <div className="flex items-center gap-1 text-xs text-gray-400 pt-1">
          <Clock className="h-3 w-3" />
          <span>
            Creado:{' '}
            {cultivar.created_at
              ? new Date(cultivar.created_at).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'Sin registro'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
