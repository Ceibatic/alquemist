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
}

interface UserTableProps {
  users: UserTableData[];
}

export function UserTable({ users }: UserTableProps) {
  const columns: ColumnDef<UserTableData>[] = [
    {
      id: 'user',
      header: 'Usuario',
      cell: ({ row }) => <UserRow user={row.original} />,
    },
  ];

  return (
    <div className="rounded-lg border bg-white">
      {users.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </div>
  );
}
