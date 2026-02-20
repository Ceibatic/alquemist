'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'convex/react';
import { useTheme } from 'next-themes';
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
import { Loader2, Palette, Building2 } from 'lucide-react';
import { parseConvexError } from '@/lib/utils/error-handler';

interface PreferencesFormProps {
  userId: Id<'users'>;
  user: any;
  onDirtyChange?: (isDirty: boolean) => void;
}

const THEMES = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
];

interface PreferencesFormValues {
  theme: 'light' | 'dark' | 'system';
  default_facility_id?: string;
}

export function PreferencesForm({ userId, user, onDirtyChange }: PreferencesFormProps) {
  const updatePreferences = useMutation(api.users.updatePreferences);
  const { setTheme } = useTheme();

  // Fetch accessible facilities for the user
  const facilities = useQuery(
    api.facilities.getFacilitiesByCompany,
    user.company_id ? { companyId: user.company_id } : 'skip' as any
  );

  // Filter facilities by user's accessible_facility_ids
  const accessibleFacilities = React.useMemo(() => {
    if (!facilities || !user.accessible_facility_ids) return [];
    return facilities.filter((f) => user.accessible_facility_ids.includes(f._id));
  }, [facilities, user.accessible_facility_ids]);

  const {
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<PreferencesFormValues>({
    defaultValues: {
      theme: user.theme || 'light',
      default_facility_id: user.primary_facility_id || undefined,
    },
  });

  // Report dirty state changes to parent
  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Sync theme with user's saved preference on mount
  React.useEffect(() => {
    if (user.theme) {
      setTheme(user.theme);
    }
  }, [user.theme, setTheme]);

  // Reactive form synchronization: update form when user data changes externally
  React.useEffect(() => {
    if (user && !isDirty) {
      reset({
        theme: user.theme || 'light',
        default_facility_id: user.primary_facility_id || undefined,
      });
    }
  }, [user, isDirty, reset]);

  const theme = watch('theme');
  const defaultFacilityId = watch('default_facility_id');

  // Handler for theme changes - applies immediately
  const handleThemeChange = React.useCallback((value: string) => {
    const themeValue = value as 'light' | 'dark' | 'system';
    setValue('theme', themeValue, { shouldDirty: true });
    setTheme(themeValue);
  }, [setValue, setTheme]);

  const onSubmit = async (data: PreferencesFormValues) => {
    try {
      await updatePreferences({
        userId,
        theme: data.theme,
        default_facility_id: data.default_facility_id as Id<'facilities'> | undefined,
      });

      toast.success('Preferencias actualizadas exitosamente');
      reset(data);
    } catch (error) {
      const parsedError = parseConvexError(error);

      switch (parsedError.type) {
        case 'network':
          toast.error(parsedError.message);
          break;
        case 'validation':
          toast.error(parsedError.message);
          if (parsedError.field) {
            setError(parsedError.field as any, {
              type: 'manual',
              message: parsedError.message,
            });
          }
          break;
        case 'server':
          toast.error(parsedError.message);
          break;
        default:
          toast.error('Error al actualizar preferencias');
      }

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

      {/* Theme */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="theme">Tema</Label>
        </div>
        <Select
          value={theme}
          onValueChange={handleThemeChange}
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
          Cambios aplicados inmediatamente. Haz clic en &quot;Guardar Cambios&quot; para persistir tu preferencia.
        </p>
      </div>

      {/* Default Facility */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="default_facility_id">Instalación por defecto</Label>
        </div>
        <Select
          value={defaultFacilityId || ''}
          onValueChange={(value) => setValue('default_facility_id', value || undefined, { shouldDirty: true })}
        >
          <SelectTrigger id="default_facility_id">
            <SelectValue placeholder="Selecciona instalación por defecto" />
          </SelectTrigger>
          <SelectContent>
            {accessibleFacilities.map((facility) => (
              <SelectItem key={facility._id} value={facility._id}>
                {facility.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Instalación que se seleccionará por defecto al iniciar sesión
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
