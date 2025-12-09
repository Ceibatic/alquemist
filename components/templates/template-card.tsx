'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Archive,
  Calendar,
  Layers,
  BarChart3,
  Leaf,
  Globe,
} from 'lucide-react';

interface TemplateCardProps {
  template: {
    _id: string;
    name: string;
    description?: string;
    cropTypeName?: string | null;
    cultivarName?: string | null;
    template_category?: string;
    production_method?: string;
    source_type?: string;
    estimated_duration_days?: number;
    estimated_yield?: number;
    yield_unit?: string;
    difficulty_level?: string;
    usage_count: number;
    average_success_rate?: number;
    phasesCount?: number;
    is_public?: boolean;
    status: string;
  };
  onView: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
}

const categoryLabels: Record<string, string> = {
  'seed-to-harvest': 'Semilla a Cosecha',
  propagation: 'Propagacion',
  custom: 'Personalizado',
};

const methodLabels: Record<string, string> = {
  indoor: 'Interior',
  outdoor: 'Exterior',
  greenhouse: 'Invernadero',
};

const sourceLabels: Record<string, string> = {
  seed: 'Semilla',
  clone: 'Clon',
  tissue_culture: 'Cultivo Tejido',
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Principiante', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Intermedio', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: 'Avanzado', color: 'bg-red-100 text-red-700' },
};

export function TemplateCard({
  template,
  onView,
  onEdit,
  onDuplicate,
  onArchive,
}: TemplateCardProps) {
  const difficulty = template.difficulty_level
    ? difficultyConfig[template.difficulty_level]
    : null;

  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-shadow"
      onClick={onView}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base truncate">{template.name}</h3>
              {template.is_public && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Globe className="h-3 w-3" />
                  Publico
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="h-3.5 w-3.5" />
              <span>{template.cropTypeName || 'Sin tipo'}</span>
              {template.cultivarName && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>{template.cultivarName}</span>
                </>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
              )}
              {onArchive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onArchive(); }}
                    className="text-red-600"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archivar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5">
          {template.template_category && (
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[template.template_category] || template.template_category}
            </Badge>
          )}
          {template.production_method && (
            <Badge variant="outline" className="text-xs">
              {methodLabels[template.production_method] || template.production_method}
            </Badge>
          )}
          {template.source_type && (
            <Badge variant="outline" className="text-xs">
              {sourceLabels[template.source_type] || template.source_type}
            </Badge>
          )}
          {difficulty && (
            <Badge className={`text-xs ${difficulty.color}`}>
              {difficulty.label}
            </Badge>
          )}
        </div>

        {/* Description */}
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-medium">
              {template.estimated_duration_days || '-'} dias
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Layers className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-medium">
              {template.phasesCount || 0} fases
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-medium">
              {template.usage_count} usos
            </p>
          </div>
        </div>

        {/* Yield and Success Rate */}
        {(template.estimated_yield || template.average_success_rate) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            {template.estimated_yield && (
              <span>
                Rendimiento: {template.estimated_yield} {template.yield_unit || 'u'}
              </span>
            )}
            {template.average_success_rate && (
              <span className="text-green-600 font-medium">
                {Math.round(template.average_success_rate * 100)}% exito
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
