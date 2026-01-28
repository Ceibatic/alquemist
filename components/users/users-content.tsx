'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Plus, Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { UserTable } from './user-table';
import { PendingInvitations } from './pending-invitations';
import { InviteUserModal } from './invite-user-modal';
import { EditUserRoleModal } from './edit-user-role-modal';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface UserData {
  id: Id<'users'>;
  type: 'user';
  email: string;
  firstName?: string;
  lastName?: string;
  roleId?: Id<'roles'>;
  roleName: string;
  status: string;
  lastLogin?: number;
  createdAt: number;
  accessibleFacilityIds?: string[];
}

export function UsersContent() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 20;

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchQuery]);

  // Get user data to access company ID
  const currentUser = useQuery(
    api.users.getUserById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  );

  const companyId = currentUser?.companyId;

  // Fetch users, invitations, and company data
  const users = useQuery(
    api.users.listByCompany,
    companyId ? { companyId: companyId as Id<'companies'> } : 'skip'
  );
  const pendingInvitations = useQuery(
    api.users.getPendingInvitations,
    companyId ? { companyId: companyId as Id<'companies'> } : 'skip'
  );
  const company = useQuery(
    api.companies.getById,
    companyId ? { id: companyId as Id<'companies'> } : 'skip'
  );

  // Handlers
  const handleEditRole = (user: UserData) => {
    setSelectedUser(user);
    setIsEditRoleModalOpen(true);
  };

  const handleCloseEditRole = () => {
    setIsEditRoleModalOpen(false);
    setSelectedUser(null);
  };

  // Loading state
  if (users === undefined || pendingInvitations === undefined || company === undefined) {
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Calculate stats
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const totalUsers = users.length;
  const totalInvitations = pendingInvitations.length;

  // Check if current user is owner and only user
  const isOwner = currentUser && users.find(u => u.id === currentUser._id)?.roleName === 'Propietario de Empresa';
  const isOnlyUser = totalUsers === 1 && isOwner;
  const hasNoFilters = roleFilter === 'all' && searchQuery === '';

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
      <div className="grid gap-4 md:grid-cols-4">
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
        <Card className="p-4">
          <div className="text-sm text-gray-600">Límite del Plan</div>
          <div className="text-2xl font-bold text-gray-900">
            {totalUsers} / {company?.max_users || '∞'}
          </div>
        </Card>
      </div>

      {/* Tabs for Users and Invitations */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            Usuarios Activos
            <Badge variant="secondary" className="ml-1">
              {totalUsers}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            Invitaciones Pendientes
            {totalInvitations > 0 && (
              <Badge variant="secondary" className="ml-1 bg-[#FFC107] text-gray-900">
                {totalInvitations}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
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
          {filteredUsers.length === 0 ? (
            <Card className="p-8">
              {isOnlyUser && hasNoFilters ? (
                <EmptyState
                  icon={Users}
                  title="Eres el único usuario"
                  description="Invita a otros miembros de tu equipo para colaborar en la gestión de tu empresa."
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
              ) : (
                <EmptyState
                  icon={Users}
                  title="No se encontraron usuarios"
                  description="No hay usuarios que coincidan con los filtros seleccionados."
                />
              )}
            </Card>
          ) : (
            <>
              <UserTable
                users={paginatedUsers}
                companyId={companyId as Id<'companies'>}
                onEditRole={handleEditRole}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <Card className="p-4">
                  <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="text-sm text-gray-600">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>

                        {/* Page numbers with ellipsis logic */}
                        {(() => {
                          const pages = [];
                          const showEllipsisStart = currentPage > 3;
                          const showEllipsisEnd = currentPage < totalPages - 2;

                          if (totalPages <= 7) {
                            // Show all pages if 7 or less
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(i)}
                                    isActive={currentPage === i}
                                    className="cursor-pointer"
                                  >
                                    {i}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                          } else {
                            // Always show first page
                            pages.push(
                              <PaginationItem key={1}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(1)}
                                  isActive={currentPage === 1}
                                  className="cursor-pointer"
                                >
                                  1
                                </PaginationLink>
                              </PaginationItem>
                            );

                            // Show ellipsis after first page if needed
                            if (showEllipsisStart) {
                              pages.push(
                                <PaginationItem key="ellipsis-start">
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            // Show pages around current page
                            const start = Math.max(2, currentPage - 1);
                            const end = Math.min(totalPages - 1, currentPage + 1);
                            for (let i = start; i <= end; i++) {
                              pages.push(
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(i)}
                                    isActive={currentPage === i}
                                    className="cursor-pointer"
                                  >
                                    {i}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }

                            // Show ellipsis before last page if needed
                            if (showEllipsisEnd) {
                              pages.push(
                                <PaginationItem key="ellipsis-end">
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            // Always show last page
                            pages.push(
                              <PaginationItem key={totalPages}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(totalPages)}
                                  isActive={currentPage === totalPages}
                                  className="cursor-pointer"
                                >
                                  {totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }

                          return pages;
                        })()}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {pendingInvitations.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={Mail}
                title="No hay invitaciones pendientes"
                description="Todas las invitaciones enviadas han sido aceptadas o no hay invitaciones activas."
              />
            </Card>
          ) : (
            <PendingInvitations invitations={pendingInvitations} />
          )}
        </TabsContent>
      </Tabs>

      {/* Invite User Modal */}
      {companyId && userId && (
        <InviteUserModal
          open={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          companyId={companyId as Id<'companies'>}
          currentUserId={userId as Id<'users'>}
        />
      )}

      {/* Edit User Role Modal */}
      {companyId && (
        <EditUserRoleModal
          open={isEditRoleModalOpen}
          onClose={handleCloseEditRole}
          user={selectedUser}
          companyId={companyId as Id<'companies'>}
        />
      )}
    </>
  );
}
