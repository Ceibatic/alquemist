'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MapPin, Check } from 'lucide-react';

interface WizardStepSelectAreaProps {
  facilityId: Id<'facilities'>;
  selectedAreaId: Id<'areas'> | null;
  onSelect: (areaId: Id<'areas'>, areaName: string) => void;
}

const AREA_TYPE_LABELS: Record<string, string> = {
  cultivation: 'Cultivo',
  propagation: 'Propagacion',
  drying: 'Secado',
  processing: 'Procesamiento',
  storage: 'Almacenamiento',
  mother_room: 'Sala de Madres',
  nursery: 'Vivero',
  quarantine: 'Cuarentena',
};

export function WizardStepSelectArea({ facilityId, selectedAreaId, onSelect }: WizardStepSelectAreaProps) {
  const areas = useQuery(api.areas.getByFacility, { facilityId, status: 'active' });

  if (areas === undefined) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p>No hay areas activas en esta instalacion.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Selecciona el area donde se realizara la actividad.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {areas.map((area) => {
          const isSelected = selectedAreaId === area._id;
          return (
            <Card
              key={area._id}
              className={cn(
                'cursor-pointer transition-all hover:border-amber-300',
                isSelected && 'border-amber-500 ring-1 ring-amber-500'
              )}
              onClick={() => onSelect(area._id, area.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{area.name}</p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {AREA_TYPE_LABELS[area.area_type] ?? area.area_type}
                    </Badge>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                {area.total_area_m2 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {area.total_area_m2} m²
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
