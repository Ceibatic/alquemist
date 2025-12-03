'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/shared/password-input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Shield, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/settings';

interface SecurityFormProps {
  userId: Id<'users'>;
  user: any;
}

export function SecurityForm({ userId, user }: SecurityFormProps) {
  const changePassword = useMutation(api.users.changePassword);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  });

  const newPassword = watch('new_password');

  // Calculate password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { score, label: 'Débil', color: 'bg-red-500' };
    } else if (score === 3) {
      return { score, label: 'Media', color: 'bg-yellow-500' };
    } else if (score === 4) {
      return { score, label: 'Buena', color: 'bg-blue-500' };
    } else {
      return { score, label: 'Fuerte', color: 'bg-green-500' };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      await changePassword({
        userId,
        currentPassword: data.current_password,
        newPassword: data.new_password,
      });

      toast.success('Contraseña actualizada exitosamente');
      reset();
    } catch (error) {
      toast.error('Error al cambiar contraseña. Verifica tu contraseña actual.');
      console.error('Error changing password:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Actualiza tu contraseña regularmente para mantener tu cuenta segura
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current_password">
              Contraseña Actual <span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              id="current_password"
              {...register('current_password')}
              placeholder="Ingresa tu contraseña actual"
            />
            {errors.current_password && (
              <p className="text-sm text-destructive">{errors.current_password.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new_password">
              Nueva Contraseña <span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              id="new_password"
              {...register('new_password')}
              placeholder="Ingresa tu nueva contraseña"
            />
            {errors.new_password && (
              <p className="text-sm text-destructive">{errors.new_password.message}</p>
            )}

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fortaleza:</span>
                  <span className="font-medium">{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm_new_password">
              Confirmar Nueva Contraseña <span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              id="confirm_new_password"
              {...register('confirm_new_password')}
              placeholder="Confirma tu nueva contraseña"
            />
            {errors.confirm_new_password && (
              <p className="text-sm text-destructive">{errors.confirm_new_password.message}</p>
            )}
          </div>

          {/* Password Requirements */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">La contraseña debe cumplir:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos 1 letra mayúscula</li>
                <li>Al menos 1 número</li>
                <li>Al menos 1 carácter especial (!@#$%^&*)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                'Cambiar Contraseña'
              )}
            </Button>
          </div>
        </form>
      </div>

      <Separator />

      {/* Two-Factor Authentication Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Autenticación de Dos Factores</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Agrega una capa extra de seguridad a tu cuenta
        </p>

        <div className="rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Estado: No configurado</p>
                <p className="text-sm text-muted-foreground">
                  La autenticación de dos factores no está activada
                </p>
              </div>
            </div>
            <Badge variant="outline">Desactivado</Badge>
          </div>

          <Button variant="outline" disabled className="w-full">
            Configurar 2FA (Próximamente)
          </Button>
        </div>
      </div>

      <Separator />

      {/* Active Sessions Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sesiones Activas</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Administra dónde has iniciado sesión
        </p>

        <div className="rounded-lg border p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium">Sesión Actual</p>
              <p className="text-sm text-muted-foreground">
                Esta es tu sesión actual en este dispositivo
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              La gestión de sesiones múltiples estará disponible en versiones futuras
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
