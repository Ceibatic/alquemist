'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Bell, Mail, Smartphone } from 'lucide-react';
import { notificationPreferencesSchema, type NotificationPreferencesInput } from '@/lib/validations/settings';

interface UserNotificationsFormProps {
  userId: Id<'users'>;
  user: any;
}

export function UserNotificationsForm({ userId, user }: UserNotificationsFormProps) {
  const updateNotificationSettings = useMutation(api.users.updateNotificationSettings);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<NotificationPreferencesInput>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      email_notifications: user.email_notifications ?? true,
      sms_notifications: user.sms_notifications ?? false,
      notification_types: {
        low_stock: user.notification_types?.low_stock ?? true,
        overdue_activities: user.notification_types?.overdue_activities ?? true,
        compliance_alerts: user.notification_types?.compliance_alerts ?? true,
        system_updates: user.notification_types?.system_updates ?? true,
        team_mentions: user.notification_types?.team_mentions ?? true,
        batch_status_changes: user.notification_types?.batch_status_changes ?? true,
        quality_check_reminders: user.notification_types?.quality_check_reminders ?? true,
        harvest_reminders: user.notification_types?.harvest_reminders ?? true,
        license_expiration: user.notification_types?.license_expiration ?? true,
        pest_disease_alerts: user.notification_types?.pest_disease_alerts ?? true,
      },
      notification_delivery: {
        immediate: user.notification_delivery?.immediate ?? true,
        daily_digest: user.notification_delivery?.daily_digest ?? false,
        weekly_digest: user.notification_delivery?.weekly_digest ?? false,
        digest_time: user.notification_delivery?.digest_time || '08:00',
      },
      quiet_hours_enabled: user.quiet_hours_enabled ?? false,
      quiet_hours_start: user.quiet_hours_start || '20:00',
      quiet_hours_end: user.quiet_hours_end || '08:00',
    },
  });

  const emailNotifications = watch('email_notifications');
  const smsNotifications = watch('sms_notifications');
  const notificationTypes = watch('notification_types');
  const notificationDelivery = watch('notification_delivery');
  const quietHoursEnabled = watch('quiet_hours_enabled');

  const onSubmit = async (data: NotificationPreferencesInput) => {
    try {
      await updateNotificationSettings({
        userId,
        email_notifications: data.email_notifications,
        sms_notifications: data.sms_notifications,
        notification_types: data.notification_types,
        notification_delivery: data.notification_delivery,
        quiet_hours_enabled: data.quiet_hours_enabled,
        quiet_hours_start: data.quiet_hours_start,
        quiet_hours_end: data.quiet_hours_end,
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
          Controla cómo y cuándo recibes notificaciones
        </p>
      </div>

      {/* Global Toggles */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Canales de Notificación
        </h4>

        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications" className="text-base cursor-pointer">
                Notificaciones por Email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones en tu correo electrónico
              </p>
            </div>
          </div>
          <Switch
            id="email_notifications"
            checked={emailNotifications}
            onCheckedChange={(checked) => setValue('email_notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="sms_notifications" className="text-base cursor-pointer">
                Notificaciones por SMS
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones por mensaje de texto (próximamente)
              </p>
            </div>
          </div>
          <Switch
            id="sms_notifications"
            checked={smsNotifications}
            onCheckedChange={(checked) => setValue('sms_notifications', checked)}
            disabled
          />
        </div>
      </div>

      <Separator />

      {/* Notification Types */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Tipos de Notificaciones</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="low_stock" className="cursor-pointer">
              Alertas de Stock Bajo
            </Label>
            <Switch
              id="low_stock"
              checked={notificationTypes.low_stock}
              onCheckedChange={(checked) =>
                setValue('notification_types.low_stock', checked)
              }
              disabled={!emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="overdue_activities" className="cursor-pointer">
              Alertas de Actividades Vencidas
            </Label>
            <Switch
              id="overdue_activities"
              checked={notificationTypes.overdue_activities}
              onCheckedChange={(checked) =>
                setValue('notification_types.overdue_activities', checked)
              }
              disabled={!emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="compliance_alerts" className="cursor-pointer">
              Alertas de Compliance
            </Label>
            <Switch
              id="compliance_alerts"
              checked={notificationTypes.compliance_alerts}
              onCheckedChange={(checked) =>
                setValue('notification_types.compliance_alerts', checked)
              }
              disabled={!emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="system_updates" className="cursor-pointer">
              Actualizaciones del Sistema
            </Label>
            <Switch
              id="system_updates"
              checked={notificationTypes.system_updates}
              onCheckedChange={(checked) =>
                setValue('notification_types.system_updates', checked)
              }
              disabled={!emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="team_mentions" className="cursor-pointer">
              Menciones del Equipo
            </Label>
            <Switch
              id="team_mentions"
              checked={notificationTypes.team_mentions}
              onCheckedChange={(checked) =>
                setValue('notification_types.team_mentions', checked)
              }
              disabled={!emailNotifications}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Delivery Preferences */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Frecuencia de Entrega</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="immediate" className="cursor-pointer">
                Inmediato
              </Label>
              <p className="text-xs text-muted-foreground">
                Recibe notificaciones en tiempo real
              </p>
            </div>
            <Switch
              id="immediate"
              checked={notificationDelivery.immediate}
              onCheckedChange={(checked) =>
                setValue('notification_delivery.immediate', checked)
              }
              disabled={!emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="daily_digest" className="cursor-pointer">
                Resumen Diario
              </Label>
              <p className="text-xs text-muted-foreground">
                Recibe un resumen una vez al día
              </p>
            </div>
            <Switch
              id="daily_digest"
              checked={notificationDelivery.daily_digest}
              onCheckedChange={(checked) =>
                setValue('notification_delivery.daily_digest', checked)
              }
              disabled={!emailNotifications}
            />
          </div>
        </div>
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
