'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export type CalendarViewMode = 'day' | 'week' | 'month';

interface CalendarToolbarProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
}

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

function getDateLabel(date: Date, viewMode: CalendarViewMode): string {
  switch (viewMode) {
    case 'day':
      return format(date, "EEE d MMM yyyy", { locale: es });
    case 'week': {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      const startStr = format(weekStart, 'd', { locale: es });
      const endStr = format(weekEnd, 'd MMM yyyy', { locale: es });
      return `${startStr} - ${endStr}`;
    }
    case 'month':
      return format(date, 'MMMM yyyy', { locale: es });
  }
}

export function CalendarToolbar({
  currentDate,
  viewMode,
  onDateChange,
  onViewModeChange,
}: CalendarToolbarProps) {
  const router = useRouter();

  const navigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      onDateChange(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else {
      const days = viewMode === 'day' ? 1 : 7;
      const offset = direction === 'prev' ? -days : days;
      onDateChange(addDays(currentDate, offset));
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Left: navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={() => onDateChange(new Date())}>
          Hoy
        </Button>
        <span className="text-sm font-medium capitalize ml-1">
          {getDateLabel(currentDate, viewMode)}
        </span>
      </div>

      {/* Center: view mode toggle */}
      <div className="inline-flex items-center border rounded-md overflow-hidden">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onViewModeChange(opt.value)}
            className={cn(
              'text-xs px-3 h-8 transition-colors',
              viewMode === opt.value
                ? 'bg-amber-500 text-white'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Right: new activity */}
      <Button
        size="sm"
        className="bg-amber-500 hover:bg-amber-600 text-white h-8"
        onClick={() => router.push('/production/activities/new')}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Nueva actividad
      </Button>
    </div>
  );
}
