'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { facilitySettingsSchema, type FacilitySettingsInput, type Workday } from '@/lib/validations/settings';

interface OperationsFormProps {
  facilityId: Id<'facilities'>;
  facility: any;
}

const WORKDAYS: { value: Workday; label: string }[] = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

const TIMEZONES = [
  { value: 'America/Bogota', label: 'Colombia (América/Bogotá)' },
  { value: 'America/New_York', label: 'Nueva York (América/New_York)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (América/Los_Angeles)' },
  { value: 'Europe/Madrid', label: 'Madrid (Europa/Madrid)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (América/Mexico_City)' },
];

export function OperationsForm({ facilityId, facility }: OperationsFormProps) {
  const updateFacility = useMutation(api.facilities.update);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FacilitySettingsInput>({
    resolver: zodResolver(facilitySettingsSchema),
    defaultValues: {
      timezone: facility.timezone || 'America/Bogota',
      workday_start: facility.workday_start || '08:00',
      workday_end: facility.workday_end || '17:00',
      workdays: facility.workdays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      default_activity_duration: facility.default_activity_duration || 60,
      auto_scheduling: facility.auto_scheduling || false,
    },
  });

  const workdays = watch('workdays');
  const autoScheduling = watch('auto_scheduling');

  const handleWorkdayToggle = (day: Workday) => {
    const currentWorkdays = workdays || [];
    const newWorkdays = currentWorkdays.includes(day)
      ? currentWorkdays.filter((d) => d !== day)
      : [...currentWorkdays, day];
    setValue('workdays', newWorkdays, { shouldValidate: true });
  };

  const onSubmit = async (data: FacilitySettingsInput) => {
    try {
      await updateFacility({
        id: facilityId,
        companyId: facility.company_id,
        timezone: data.timezone,
        workday_start: data.workday_start,
        workday_end: data.workday_end,
        workdays: data.workdays,
        default_activity_duration: data.default_activity_duration,
        auto_scheduling: data.auto_scheduling,
      });

      toast.success('Configuración de operaciones actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar configuración');
      console.error('Error updating operations:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Operaciones</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configuración de horarios y operaciones de la instalación
        </p>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">
          Zona Horaria <span className="text-destructive">*</span>
        </Label>
        <Select
          defaultValue={facility.timezone || 'America/Bogota'}
          onValueChange={(value) => setValue('timezone', value)}
        >
          <SelectTrigger id="timezone">
            <SelectValue placeholder="Selecciona zona horaria" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.timezone && (
          <p className="text-sm text-destructive">{errors.timezone.message}</p>
        )}
      </div>

      {/* Work Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workday_start">
            Hora de Inicio <span className="text-destructive">*</span>
          </Label>
          <Input
            id="workday_start"
            type="time"
            {...register('workday_start')}
          />
          {errors.workday_start && (
            <p className="text-sm text-destructive">{errors.workday_start.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="workday_end">
            Hora de Fin <span className="text-destructive">*</span>
          </Label>
          <Input
            id="workday_end"
            type="time"
            {...register('workday_end')}
          />
          {errors.workday_end && (
            <p className="text-sm text-destructive">{errors.workday_end.message}</p>
          )}
        </div>
      </div>

      {/* Workdays */}
      <div className="space-y-3">
        <Label>
          Días Laborales <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {WORKDAYS.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`workday-${day.value}`}
                checked={workdays?.includes(day.value)}
                onCheckedChange={() => handleWorkdayToggle(day.value)}
              />
              <Label
                htmlFor={`workday-${day.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.workdays && (
          <p className="text-sm text-destructive">{errors.workdays.message}</p>
        )}
      </div>

      {/* Default Activity Duration */}
      <div className="space-y-2">
        <Label htmlFor="default_activity_duration">
          Duración por Defecto de Actividades (minutos)
        </Label>
        <Input
          id="default_activity_duration"
          type="number"
          step="5"
          {...register('default_activity_duration', { valueAsNumber: true })}
          placeholder="60"
        />
        <p className="text-xs text-muted-foreground">
          Duración predeterminada para nuevas actividades en el calendario
        </p>
        {errors.default_activity_duration && (
          <p className="text-sm text-destructive">{errors.default_activity_duration.message}</p>
        )}
      </div>

      {/* Auto-scheduling */}
      <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="auto_scheduling" className="text-base cursor-pointer">
            Programación Automática
          </Label>
          <p className="text-sm text-muted-foreground">
            Permite que el sistema programe automáticamente actividades basándose en los horarios laborales
          </p>
        </div>
        <Switch
          id="auto_scheduling"
          checked={autoScheduling}
          onCheckedChange={(checked) => setValue('auto_scheduling', checked)}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  );
}
