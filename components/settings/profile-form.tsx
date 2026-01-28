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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, User } from 'lucide-react';
import { userProfileSettingsSchema, type UserProfileSettingsInput } from '@/lib/validations/settings';
import { parseConvexError } from '@/lib/utils/error-handler';

interface ProfileFormProps {
  userId: Id<'users'>;
  user: any;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function ProfileForm({ userId, user, onDirtyChange }: ProfileFormProps) {
  const updateUser = useMutation(api.users.updateProfile);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserProfileSettingsInput>({
    resolver: zodResolver(userProfileSettingsSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      identification_type: user.identification_type || undefined,
      identification_number: user.identification_number || '',
    },
  });

  // Report dirty state changes to parent
  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (data: UserProfileSettingsInput) => {
    try {
      await updateUser({
        userId,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || undefined,
        identification_type: data.identification_type,
        identification_number: data.identification_number || undefined,
      });

      toast.success('Perfil actualizado exitosamente');
      // Reset form to mark as not dirty
      reset(data);
    } catch (error) {
      const parsedError = parseConvexError(error);

      // Show specific toast based on error type
      switch (parsedError.type) {
        case 'network':
          toast.error(parsedError.message);
          break;
        case 'validation':
          toast.error(parsedError.message);
          // Set field-specific error if available
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
          toast.error('Error al actualizar perfil');
      }

      console.error('Error updating profile:', error);
    }
  };

  // Generate initials for avatar
  const getInitials = () => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Información de Perfil</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Actualiza tu información personal
        </p>
      </div>

      {/* Avatar & Name Display */}
      <div className="flex items-center space-x-4 pb-6 border-b">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-[#1B5E20] text-white text-2xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : 'Usuario'}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="first_name"
            {...register('first_name')}
            placeholder="Juan"
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">
            Apellido <span className="text-destructive">*</span>
          </Label>
          <Input
            id="last_name"
            {...register('last_name')}
            placeholder="Pérez"
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            El email no puede ser modificado
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+57 300 123 4567"
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Identification */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="identification_type">Tipo de Identificación</Label>
          <Select
            defaultValue={user.identification_type}
            onValueChange={(value: any) => setValue('identification_type', value)}
          >
            <SelectTrigger id="identification_type">
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
              <SelectItem value="CE">Cédula de Extranjería (CE)</SelectItem>
              <SelectItem value="NIT">NIT</SelectItem>
              <SelectItem value="Passport">Pasaporte</SelectItem>
            </SelectContent>
          </Select>
          {errors.identification_type && (
            <p className="text-sm text-destructive">{errors.identification_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="identification_number">Número</Label>
          <Input
            id="identification_number"
            {...register('identification_number')}
            placeholder="1234567890"
          />
          {errors.identification_number && (
            <p className="text-sm text-destructive">{errors.identification_number.message}</p>
          )}
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
