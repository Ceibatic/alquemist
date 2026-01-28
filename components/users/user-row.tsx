'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MoreVertical, UserX, Edit2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UserRowData {
  id: Id<'users'>;
  email: string;
  firstName?: string;
  lastName?: string;
  roleName: string;
  status: string;
  lastLogin?: number;
}

interface UserRowProps {
  user: UserRowData;
}

export function UserRow({ user }: UserRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const deactivateUser = useMutation(api.users.deactivateUser);

  // Generate initials
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.email[0].toUpperCase();

  // Get role badge color
  const getRoleBadgeColor = (roleName: string) => {
    if (roleName.includes('Owner') || roleName.includes('Propietario')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (roleName.includes('Admin') || roleName.includes('Administrador')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (roleName.includes('Manager') || roleName.includes('Gerente')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Format last login
  const formatLastLogin = (timestamp?: number) => {
    if (!timestamp) return 'Nunca';
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: es
    });
  };

  const isOwner = user.roleName.includes('Owner') || user.roleName.includes('Propietario');

  const handleDeactivate = async () => {
    try {
      setIsDeactivating(true);
      await deactivateUser({ userId: user.id });
      toast({
        title: 'Usuario desactivado',
        description: `${user.firstName || user.email} ha sido desactivado. Ya no podra acceder al sistema.`,
      });
      setIsDeactivateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo desactivar el usuario',
        variant: 'destructive',
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleRowClick = () => {
    router.push(`/users/${user.id}`);
  };

  return (
    <div
      className="flex items-center justify-between border-b p-4 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleRowClick}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-[#1B5E20] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email}
            </span>
            <Badge
              className={cn(
                'text-xs',
                getRoleBadgeColor(user.roleName)
              )}
            >
              {user.roleName}
            </Badge>
          </div>
          <span className="text-sm text-gray-600">{user.email}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              user.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
            )}
          />
          <span className="text-sm text-gray-600">
            {user.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Last Login */}
        <div className="hidden md:block">
          <span className="text-sm text-gray-600">
            {formatLastLogin(user.lastLogin)}
          </span>
        </div>

        {/* Actions */}
        {!isOwner && (
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar Rol
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeactivateDialogOpen(true);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <UserX className="mr-2 h-4 w-4" />
                Desactivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de que deseas desactivar a{' '}
              <strong>{user.firstName ? `${user.firstName} ${user.lastName}` : user.email}</strong>?
              <br /><br />
              El usuario perdera acceso al sistema inmediatamente y todas sus sesiones
              activas seran invalidadas. Podras reactivarlo mas adelante si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeactivating ? 'Desactivando...' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
