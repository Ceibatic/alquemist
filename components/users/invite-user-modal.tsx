'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { createInvitationSchema, type CreateInvitationInput } from '@/lib/validations/invitation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { RoleSelector } from './role-selector';
import { FacilityAccessSelect } from './facility-access-select';
import { Mail, X } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  companyId?: Id<'companies'>;
  currentUserId?: Id<'users'>;
}

export function InviteUserModal({
  open,
  onClose,
  companyId,
  currentUserId,
}: InviteUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const { toast } = useToast();

  const createInvitation = useMutation(api.invitations.create);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      email: '',
      role_id: '',
      facility_ids: [],
      message: '',
    },
  });

  const roleId = watch('role_id');

  // Handle facility selection
  const handleFacilityToggle = (facilityId: string, checked: boolean) => {
    let updatedFacilities: string[];
    if (checked) {
      updatedFacilities = [...selectedFacilities, facilityId];
    } else {
      updatedFacilities = selectedFacilities.filter((id) => id !== facilityId);
    }
    setSelectedFacilities(updatedFacilities);
    setValue('facility_ids', updatedFacilities, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateInvitationInput) => {
    if (!companyId || !currentUserId) {
      toast({
        title: 'Error',
        description: 'Información de sesión no disponible',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createInvitation({
        email: data.email,
        roleId: data.role_id as Id<'roles'>,
        facilityIds: data.facility_ids as Id<'facilities'>[],
        invitedBy: currentUserId,
      });

      toast({
        title: 'Invitación enviada',
        description: `Se ha enviado una invitación a ${data.email}`,
      });

      // Reset form and close modal
      reset();
      setSelectedFacilities([]);
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error al enviar invitación',
        description: error.message || 'No se pudo enviar la invitación',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setSelectedFacilities([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#FFC107]" />
            Invitar Usuario
          </DialogTitle>
          <DialogDescription>
            Envía una invitación por correo electrónico para agregar un nuevo
            miembro al equipo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Correo Electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Role Selector */}
          {companyId && (
            <RoleSelector
              value={roleId}
              onValueChange={(value) =>
                setValue('role_id', value, { shouldValidate: true })
              }
              error={errors.role_id?.message}
            />
          )}

          {/* Facility Access */}
          {companyId && (
            <FacilityAccessSelect
              companyId={companyId}
              selectedFacilityIds={selectedFacilities}
              onFacilityToggle={handleFacilityToggle}
              error={errors.facility_ids?.message}
            />
          )}

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje Personalizado (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Ej: Bienvenido al equipo! Te estamos invitando a colaborar en nuestros proyectos..."
              {...register('message')}
              rows={3}
              className={errors.message ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Este mensaje será incluido en el correo de invitación
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#FFC107] text-gray-900 hover:bg-[#FFB300]"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Invitación
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
