'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RoleSelector } from './role-selector';
import { FacilityAccessSelect } from './facility-access-select';
import { UserCog } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface UserData {
  id: Id<'users'>;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId?: Id<'roles'>;
  roleName: string;
  accessibleFacilityIds?: string[];
}

interface EditUserRoleModalProps {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
  companyId?: Id<'companies'>;
}

export function EditUserRoleModal({
  open,
  onClose,
  user,
  companyId,
}: EditUserRoleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const { toast } = useToast();

  const updateUserRole = useMutation(api.users.updateUserRole);

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (user && open) {
      setSelectedRoleId(user.roleId || '');
      setSelectedFacilities(user.accessibleFacilityIds || []);
    }
  }, [user, open]);

  const handleFacilityToggle = (facilityId: string, checked: boolean) => {
    if (checked) {
      setSelectedFacilities([...selectedFacilities, facilityId]);
    } else {
      setSelectedFacilities(selectedFacilities.filter((id) => id !== facilityId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate selections
    if (!selectedRoleId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un rol',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFacilities.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar al menos una instalación',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserRole({
        userId: user.id,
        roleId: selectedRoleId as Id<'roles'>,
        facilityAccess: selectedFacilities as Id<'facilities'>[],
      });

      toast({
        title: 'Rol actualizado',
        description: `Se ha actualizado el rol de ${user.firstName || user.email} exitosamente.`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Error al actualizar rol',
        description: error.message || 'No se pudo actualizar el rol',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedRoleId('');
      setSelectedFacilities([]);
      onClose();
    }
  };

  if (!user) return null;

  const userName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-[#1B5E20]" />
            Editar Rol de Usuario
          </DialogTitle>
          <DialogDescription>
            Actualiza el rol y acceso a instalaciones de {userName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current User Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Usuario</p>
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Role Selector */}
          <RoleSelector
            value={selectedRoleId}
            onValueChange={setSelectedRoleId}
          />

          {/* Facility Access */}
          {companyId && (
            <FacilityAccessSelect
              companyId={companyId}
              selectedFacilityIds={selectedFacilities}
              onFacilityToggle={handleFacilityToggle}
            />
          )}

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
              className="bg-[#1B5E20] text-white hover:bg-[#2E7D32]"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
