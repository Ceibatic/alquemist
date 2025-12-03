'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Bell, BellOff } from 'lucide-react';

const facilityNotificationsSchema = z.object({
  notifications_enabled: z.boolean().default(true),
  low_stock_alert_enabled: z.boolean().default(true),
  overdue_activity_alert_enabled: z.boolean().default(true),
  license_expiration_alert_enabled: z.boolean().default(true),
  critical_alert_email: z
    .string()
    .email('Correo electrónico inválido')
    .optional()
    .or(z.literal('')),
});

type FacilityNotificationsFormData = z.infer<typeof facilityNotificationsSchema>;

interface FacilityNotificationsFormProps {
  facilityId: Id<'facilities'>;
  facility: any;
}

export function FacilityNotificationsForm({
  facilityId,
  facility,
}: FacilityNotificationsFormProps) {
  const updateFacility = useMutation(api.facilities.update);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FacilityNotificationsFormData>({
    resolver: zodResolver(facilityNotificationsSchema),
    defaultValues: {
      notifications_enabled: facility.notifications_enabled ?? true,
      low_stock_alert_enabled: facility.low_stock_alert_enabled ?? true,
      overdue_activity_alert_enabled: facility.overdue_activity_alert_enabled ?? true,
      license_expiration_alert_enabled: facility.license_expiration_alert_enabled ?? true,
      critical_alert_email: facility.critical_alert_email || '',
    },
  });

  const notificationsEnabled = watch('notifications_enabled');
  const lowStockAlert = watch('low_stock_alert_enabled');
  const overdueActivityAlert = watch('overdue_activity_alert_enabled');
  const licenseExpirationAlert = watch('license_expiration_alert_enabled');

  const onSubmit = async (data: FacilityNotificationsFormData) => {
    try {
      await updateFacility({
        id: facilityId,
        companyId: facility.company_id,
        notifications_enabled: data.notifications_enabled,
        low_stock_alert_enabled: data.low_stock_alert_enabled,
        overdue_activity_alert_enabled: data.overdue_activity_alert_enabled,
        license_expiration_alert_enabled: data.license_expiration_alert_enabled,
        critical_alert_email: data.critical_alert_email || undefined,
      });

      toast.success('Preferencias de notificaciones actualizadas exitosamente');
    } catch (error) {
      toast.error('Error al actualizar notificaciones');
      console.error('Error updating notifications:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Notificaciones</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configura las alertas y notificaciones para esta instalación
        </p>
      </div>

      {/* Master Toggle */}
      <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 bg-muted/50">
        <div className="flex items-center space-x-3">
          {notificationsEnabled ? (
            <Bell className="h-5 w-5 text-green-600" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="space-y-0.5">
            <Label htmlFor="notifications_enabled" className="text-base cursor-pointer font-semibold">
              Notificaciones Habilitadas
            </Label>
            <p className="text-sm text-muted-foreground">
              Activa o desactiva todas las notificaciones para esta instalación
            </p>
          </div>
        </div>
        <Switch
          id="notifications_enabled"
          checked={notificationsEnabled}
          onCheckedChange={(checked) => setValue('notifications_enabled', checked)}
        />
      </div>

      {/* Individual Alert Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Tipos de Alertas</h4>

        {/* Low Stock Alert */}
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="low_stock_alert_enabled" className="text-base cursor-pointer">
              Alerta de Stock Bajo
            </Label>
            <p className="text-sm text-muted-foreground">
              Recibe notificaciones cuando el inventario esté por debajo del nivel mínimo
            </p>
          </div>
          <Switch
            id="low_stock_alert_enabled"
            checked={lowStockAlert}
            onCheckedChange={(checked) => setValue('low_stock_alert_enabled', checked)}
            disabled={!notificationsEnabled}
          />
        </div>

        {/* Overdue Activity Alert */}
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="overdue_activity_alert_enabled" className="text-base cursor-pointer">
              Alerta de Actividades Vencidas
            </Label>
            <p className="text-sm text-muted-foreground">
              Recibe notificaciones cuando haya actividades pendientes fuera de plazo
            </p>
          </div>
          <Switch
            id="overdue_activity_alert_enabled"
            checked={overdueActivityAlert}
            onCheckedChange={(checked) => setValue('overdue_activity_alert_enabled', checked)}
            disabled={!notificationsEnabled}
          />
        </div>

        {/* License Expiration Alert */}
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="license_expiration_alert_enabled" className="text-base cursor-pointer">
              Alerta de Vencimiento de Licencia
            </Label>
            <p className="text-sm text-muted-foreground">
              Recibe notificaciones cuando la licencia esté próxima a vencer (90 días)
            </p>
          </div>
          <Switch
            id="license_expiration_alert_enabled"
            checked={licenseExpirationAlert}
            onCheckedChange={(checked) => setValue('license_expiration_alert_enabled', checked)}
            disabled={!notificationsEnabled}
          />
        </div>
      </div>

      {/* Critical Alerts Email */}
      <div className="space-y-2">
        <Label htmlFor="critical_alert_email">Email para Alertas Críticas</Label>
        <Input
          id="critical_alert_email"
          type="email"
          {...register('critical_alert_email')}
          placeholder="alertas@empresa.com"
          disabled={!notificationsEnabled}
        />
        <p className="text-xs text-muted-foreground">
          Email adicional para recibir alertas críticas (opcional)
        </p>
        {errors.critical_alert_email && (
          <p className="text-sm text-destructive">{errors.critical_alert_email.message}</p>
        )}
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
