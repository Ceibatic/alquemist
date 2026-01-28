'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { UserRow } from './user-row';
import { User } from '@/lib/types/phase2';
import { Id } from '@/convex/_generated/dataModel';

interface UserTableData {
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

interface UserTableProps {
  users: UserTableData[];
  companyId?: Id<'companies'>;
  onEditRole?: (user: UserTableData) => void;
}

export function UserTable({ users, companyId, onEditRole }: UserTableProps) {
  const columns: ColumnDef<UserTableData>[] = [
    {
      id: 'user',
      header: 'Usuario',
      cell: ({ row }) => <UserRow user={row.original} companyId={companyId} onEditRole={onEditRole as any} />,
    },
  ];

  return (
    <div className="rounded-lg border bg-white">
      {users.map((user) => (
        <UserRow key={user.id} user={user} companyId={companyId} onEditRole={onEditRole as any} />
      ))}
    </div>
  );
}
