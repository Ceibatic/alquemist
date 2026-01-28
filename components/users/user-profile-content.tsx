'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EditUserRoleModal } from './edit-user-role-modal';
import {
  User,
  Mail,
  Phone,
  IdCard,
  Building2,
  MapPin,
  Clock,
  Calendar,
  UserCog,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function UserProfileContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);

  // Get current user data from cookies to check permissions
  useEffect(() => {
    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setCurrentUserId(userData.userId);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  // Fetch profile user data
  const profileUser = useQuery(
    api.users.getUserById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  );

  // Fetch current user data to check permissions
  const currentUser = useQuery(
    api.users.getUserById,
    currentUserId ? { userId: currentUserId as Id<'users'> } : 'skip'
  );

  // Fetch facilities to display names
  const facilities = useQuery(
    api.facilities.list,
    profileUser?.company_id
      ? { companyId: profileUser.company_id as Id<'companies'> }
      : 'skip'
  );

  // Loading state
  if (!profileUser || currentUser === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Check if current user has permission to edit (owner or admin)
  const canEditRole = currentUser && (
    currentUser.roleName?.includes('Propietario') ||
    currentUser.roleName?.includes('Owner') ||
    currentUser.roleName?.includes('Admin') ||
    currentUser.roleName?.includes('Administrador')
  );

  // Generate initials for avatar
  const initials = profileUser.firstName && profileUser.lastName
    ? `${profileUser.firstName[0]}${profileUser.lastName[0]}`.toUpperCase()
    : profileUser.email[0].toUpperCase();

  const fullName = profileUser.firstName && profileUser.lastName
    ? `${profileUser.firstName} ${profileUser.lastName}`
    : profileUser.email;

  // Get role badge color
  const getRoleBadgeColor = (roleName?: string) => {
    if (!roleName) return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Format dates
  const formatRelativeDate = (timestamp?: number) => {
    if (!timestamp) return 'Nunca';
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: es,
    });
  };

  const formatAbsoluteDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get accessible facility names
  const accessibleFacilityNames = profileUser.accessibleFacilityIds
    ?.map((id) => {
      const facility = facilities?.facilities?.find((f) => f._id === id);
      return facility?.name;
    })
    .filter(Boolean) || [];

  return (
    <>
      <PageHeader
        title={fullName}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Usuarios', href: '/users' },
          { label: fullName },
        ]}
        action={
          canEditRole ? (
            <Button
              onClick={() => setIsEditRoleModalOpen(true)}
              className="bg-[#1B5E20] text-white hover:bg-[#2E7D32]"
            >
              <UserCog className="mr-2 h-4 w-4" />
              Editar Rol
            </Button>
          ) : undefined
        }
      />

      {/* Profile Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#1B5E20]" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-[#1B5E20] text-white text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-gray-900">
                  {fullName}
                </h3>
                <div className="mt-1">
                  <Badge
                    className={cn(
                      'text-xs',
                      profileUser.status === 'active'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    )}
                  >
                    {profileUser.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 break-all">
                    {profileUser.email}
                  </p>
                </div>
              </div>

              {profileUser.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="text-sm text-gray-900">{profileUser.phone}</p>
                  </div>
                </div>
              )}

              {profileUser.identification_number && (
                <div className="flex items-start gap-3">
                  <IdCard className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Identificación</p>
                    <p className="text-sm text-gray-900">
                      {profileUser.identification_type && `${profileUser.identification_type} - `}
                      {profileUser.identification_number}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role & Access Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCog className="h-5 w-5 text-[#FFC107]" />
              Rol y Acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Rol</p>
              <Badge className={cn('text-sm', getRoleBadgeColor(profileUser.roleName))}>
                {profileUser.roleName || 'Sin rol'}
              </Badge>
            </div>

            {/* Company */}
            {profileUser.companyName && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Empresa</p>
                  <p className="text-sm text-gray-900">{profileUser.companyName}</p>
                </div>
              </div>
            )}

            {/* Facilities */}
            {accessibleFacilityNames.length > 0 && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2">
                    Instalaciones ({accessibleFacilityNames.length})
                  </p>
                  <div className="space-y-1">
                    {accessibleFacilityNames.map((name, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-900 bg-gray-50 rounded px-2 py-1"
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {accessibleFacilityNames.length === 0 && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Instalaciones</p>
                  <p className="text-sm text-gray-500">Sin acceso a instalaciones</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-[#1B5E20]" />
              Actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Last Login */}
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Último acceso</p>
                <p className="text-sm text-gray-900 font-medium">
                  {formatRelativeDate(profileUser.lastLogin)}
                </p>
                {profileUser.lastLogin && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatAbsoluteDate(profileUser.lastLogin)}
                  </p>
                )}
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Cuenta creada</p>
                <p className="text-sm text-gray-900 font-medium">
                  {formatRelativeDate(profileUser.createdAt)}
                </p>
                {profileUser.createdAt && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatAbsoluteDate(profileUser.createdAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Email Verification Status */}
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    profileUser.emailVerified ? 'bg-green-500' : 'bg-yellow-500'
                  )}
                />
                <p className="text-sm text-gray-900">
                  Email {profileUser.emailVerified ? 'verificado' : 'pendiente de verificación'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Role Modal */}
      {canEditRole && profileUser && (
        <EditUserRoleModal
          open={isEditRoleModalOpen}
          onClose={() => setIsEditRoleModalOpen(false)}
          user={{
            id: profileUser._id,
            email: profileUser.email,
            firstName: profileUser.firstName,
            lastName: profileUser.lastName,
            roleId: profileUser.roleId,
            roleName: profileUser.roleName || 'Sin rol',
            accessibleFacilityIds: profileUser.accessibleFacilityIds,
          }}
          companyId={profileUser.company_id}
        />
      )}
    </>
  );
}
