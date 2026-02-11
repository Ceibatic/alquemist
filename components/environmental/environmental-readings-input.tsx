'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import {
  Thermometer,
  Droplets,
  Droplet,
  Wind,
  Cloud,
  Sun,
  Zap,
  Waves,
  ChevronDown,
  Loader2,
  Save,
  FlaskConical,
} from 'lucide-react';
import {
  READING_TYPES,
  QUICK_READING_TYPES,
  type ReadingTypeConfig,
} from '@/lib/constants/environmental-readings';

// ── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Thermometer,
  Droplets,
  Droplet,
  Wind,
  Cloud,
  Sun,
  Zap,
  Flask: FlaskConical,
  Waves,
};

// ── VPD calculation ──────────────────────────────────────────────────────────

function calculateVPD(tempC: number, humidityPct: number): number {
  const svp = (610.7 * Math.pow(10, (7.5 * tempC) / (237.3 + tempC))) / 1000;
  return svp * (1 - humidityPct / 100);
}

// ── Range indicator ──────────────────────────────────────────────────────────

function getRangeColor(value: number, range: [number, number]): string {
  const [min, max] = range;
  const margin = (max - min) * 0.2;

  if (value >= min && value <= max) return 'text-green-600 border-green-300 bg-green-50';
  if (value >= min - margin && value <= max + margin)
    return 'text-yellow-600 border-yellow-300 bg-yellow-50';
  return 'text-red-600 border-red-300 bg-red-50';
}

// ── Component ────────────────────────────────────────────────────────────────

interface EnvironmentalReadingsInputProps {
  activityId: Id<'activities'>;
  defaultOpen?: boolean;
}

interface ReadingValue {
  value: string;
  unit: string;
}

export function EnvironmentalReadingsInput({
  activityId,
  defaultOpen = false,
}: EnvironmentalReadingsInputProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showMore, setShowMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [readings, setReadings] = useState<Record<string, ReadingValue>>({});

  const createReadings = useMutation(api.activityEnvironmental.create);

  const quickTypes = READING_TYPES.filter((rt) =>
    QUICK_READING_TYPES.includes(rt.type)
  );
  const extraTypes = READING_TYPES.filter(
    (rt) => !QUICK_READING_TYPES.includes(rt.type)
  );

  const handleValueChange = (type: string, value: string, unit: string) => {
    setReadings((prev) => ({ ...prev, [type]: { value, unit } }));

    // Auto-calculate VPD when temperature and humidity are both set
    if (type === 'temperature' || type === 'humidity') {
      const temp =
        type === 'temperature' ? value : readings.temperature?.value;
      const hum =
        type === 'humidity' ? value : readings.humidity?.value;

      if (temp && hum) {
        const tempNum = parseFloat(temp);
        const humNum = parseFloat(hum);
        if (!isNaN(tempNum) && !isNaN(humNum)) {
          const vpd = calculateVPD(tempNum, humNum);
          setReadings((prev) => ({
            ...prev,
            vpd: { value: vpd.toFixed(2), unit: 'kPa' },
          }));
        }
      }
    }
  };

  const handleSave = async () => {
    const readingsToSave = Object.entries(readings)
      .filter(([, r]) => r.value !== '' && !isNaN(parseFloat(r.value)))
      .map(([type, r]) => ({
        readingType: type,
        value: parseFloat(r.value),
        unit: r.unit,
      }));

    if (readingsToSave.length === 0) {
      toast.error('Ingresa al menos una lectura');
      return;
    }

    setIsSaving(true);
    try {
      await createReadings({
        activityId,
        readings: readingsToSave,
      });
      toast.success(`${readingsToSave.length} lecturas guardadas`);
      setReadings({});
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar lecturas'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filledCount = Object.values(readings).filter(
    (r) => r.value !== '' && !isNaN(parseFloat(r.value))
  ).length;

  const renderReadingCard = (rt: ReadingTypeConfig) => {
    const Icon = ICON_MAP[rt.icon] ?? Thermometer;
    const current = readings[rt.type];
    const value = current?.value ?? '';
    const numValue = parseFloat(value);
    const rangeColor =
      value && !isNaN(numValue)
        ? getRangeColor(numValue, rt.normalRange)
        : 'border-gray-200';

    return (
      <div
        key={rt.type}
        className={`border rounded-lg p-3 transition-colors ${rangeColor}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium">{rt.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            step="any"
            placeholder="-"
            value={value}
            onChange={(e) =>
              handleValueChange(rt.type, e.target.value, rt.defaultUnit)
            }
            className="h-8 text-sm font-mono"
            readOnly={rt.type === 'vpd' && !!readings.temperature?.value && !!readings.humidity?.value}
          />
          {rt.defaultUnit && (
            <span className="text-xs text-gray-500 whitespace-nowrap min-w-[40px]">
              {rt.defaultUnit}
            </span>
          )}
        </div>
        <div className="text-[10px] text-gray-400 mt-1">
          Normal: {rt.normalRange[0]}–{rt.normalRange[1]}
        </div>
      </div>
    );
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-between text-sm text-gray-700 hover:bg-gray-50"
        >
          <span className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-amber-500" />
            Lecturas Ambientales
            {filledCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                {filledCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3">
        {/* Quick reading cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickTypes.map(renderReadingCard)}
        </div>

        {/* More readings */}
        {!showMore && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-500"
            onClick={() => setShowMore(true)}
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            Más lecturas ({extraTypes.length})
          </Button>
        )}
        {showMore && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {extraTypes.map(renderReadingCard)}
          </div>
        )}

        {/* Save button */}
        {filledCount > 0 && (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="bg-amber-500 hover:bg-amber-600"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Guardar {filledCount} lecturas
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
