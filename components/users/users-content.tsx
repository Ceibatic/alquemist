'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { UserTable } from './user-table';
import { PendingInvitations } from './pending-invitations';
import { InviteUserModal } from './invite-user-modal';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

export function UsersContent() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from cookies
  useEffect(() => {
    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setUserId(userData.userId);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  // Get user data to access company ID
  const currentUser = useQuery(
    api.users.getUserById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  );

  const companyId = currentUser?.companyId;

  // Fetch users and invitations
  const users = useQuery(
    api.users.listByCompany,
    companyId ? { companyId: companyId as Id<'companies'> } : 'skip'
  );
  const pendingInvitations = useQuery(
    api.users.getPendingInvitations,
    companyId ? { companyId: companyId as Id<'companies'> } : 'skip'
  );

  // Loading state
  if (users === undefined || pendingInvitations === undefined) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
          <p className="text-sm text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Role filter
    if (roleFilter !== 'all' && user.roleName !== roleFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = user.email.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    }

    return true;
  });

  // Calculate stats
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const totalUsers = users.length;
  const totalInvitations = pendingInvitations.length;

  return (
    <>
      <PageHeader
        title="Usuarios"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Usuarios' },
        ]}
        action={
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-[#FFC107] text-gray-900 hover:bg-[#FFB300]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Invitar Usuario
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Activos</div>
          <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Invitaciones</div>
          <div className="text-2xl font-bold text-[#FFC107]">{totalInvitations}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Propietario de Empresa">Propietario</SelectItem>
                <SelectItem value="Gerente de Instalación">Gerente</SelectItem>
                <SelectItem value="Supervisor de Producción">Supervisor</SelectItem>
                <SelectItem value="Trabajador">Trabajador</SelectItem>
                <SelectItem value="Observador">Observador</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Usuarios Activos</h2>
          {filteredUsers.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={Users}
                title="No se encontraron usuarios"
                description="No hay usuarios que coincidan con los filtros seleccionados."
              />
            </Card>
          ) : (
            <UserTable users={filteredUsers} />
          )}
        </div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Invitaciones Pendientes
            </h2>
            <PendingInvitations invitations={pendingInvitations} />
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {companyId && userId && (
        <InviteUserModal
          open={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          companyId={companyId as Id<'companies'>}
          currentUserId={userId as Id<'users'>}
        />
      )}
    </>
  );
}
