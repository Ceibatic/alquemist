'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Globe, Calendar, Clock, Palette } from 'lucide-react';
import { userProfileSettingsSchema, type UserProfileSettingsInput } from '@/lib/validations/settings';

interface PreferencesFormProps {
  userId: Id<'users'>;
  user: any;
}

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
];

const TIME_FORMATS = [
  { value: '12h', label: '12 horas (2:30 PM)' },
  { value: '24h', label: '24 horas (14:30)' },
];

const THEMES = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
];

const TIMEZONES = [
  { value: 'America/Bogota', label: 'Colombia (América/Bogotá)' },
  { value: 'America/New_York', label: 'Nueva York (América/New_York)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (América/Los_Angeles)' },
  { value: 'Europe/Madrid', label: 'Madrid (Europa/Madrid)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (América/Mexico_City)' },
];

export function PreferencesForm({ userId, user }: PreferencesFormProps) {
  const updateUser = useMutation(api.users.updateProfile);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<UserProfileSettingsInput>({
    resolver: zodResolver(userProfileSettingsSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      locale: user.locale || 'es',
      timezone: user.timezone || 'America/Bogota',
      date_format: user.date_format || 'DD/MM/YYYY',
      time_format: user.time_format || '24h',
      theme: user.theme || 'light',
    },
  });

  const locale = watch('locale');
  const timezone = watch('timezone');
  const dateFormat = watch('date_format');
  const timeFormat = watch('time_format');
  const theme = watch('theme');

  const onSubmit = async (data: UserProfileSettingsInput) => {
    try {
      await updateUser({
        userId,
        first_name: user.first_name,
        last_name: user.last_name,
        locale: data.locale,
        timezone: data.timezone,
        date_format: data.date_format,
        time_format: data.time_format,
        theme: data.theme,
      });

      toast.success('Preferencias actualizadas exitosamente');
    } catch (error) {
      toast.error('Error al actualizar preferencias');
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Preferencias</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Personaliza tu experiencia en la plataforma
        </p>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="locale">Idioma</Label>
        </div>
        <Select
          value={locale}
          onValueChange={(value: any) => setValue('locale', value)}
        >
          <SelectTrigger id="locale">
            <SelectValue placeholder="Selecciona idioma" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Format */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="date_format">Formato de Fecha</Label>
        </div>
        <Select
          value={dateFormat}
          onValueChange={(value: any) => setValue('date_format', value)}
        >
          <SelectTrigger id="date_format">
            <SelectValue placeholder="Selecciona formato de fecha" />
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMATS.map((format) => (
              <SelectItem key={format.value} value={format.value}>
                {format.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Format */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="time_format">Formato de Hora</Label>
        </div>
        <Select
          value={timeFormat}
          onValueChange={(value: any) => setValue('time_format', value)}
        >
          <SelectTrigger id="time_format">
            <SelectValue placeholder="Selecciona formato de hora" />
          </SelectTrigger>
          <SelectContent>
            {TIME_FORMATS.map((format) => (
              <SelectItem key={format.value} value={format.value}>
                {format.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="timezone">Zona Horaria</Label>
        </div>
        <Select
          value={timezone}
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
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="theme">Tema</Label>
        </div>
        <Select
          value={theme}
          onValueChange={(value: any) => setValue('theme', value)}
        >
          <SelectTrigger id="theme">
            <SelectValue placeholder="Selecciona tema" />
          </SelectTrigger>
          <SelectContent>
            {THEMES.map((themeOption) => (
              <SelectItem key={themeOption.value} value={themeOption.value}>
                {themeOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          El tema oscuro estará disponible en versiones futuras
        </p>
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
