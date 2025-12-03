'use client';

import { InvitationCard } from './invitation-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Mail } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface Invitation {
  id: Id<'invitations'>;
  type: 'invitation';
  email: string;
  roleName: string;
  facilityNames: string[];
  inviterName: string;
  status: string;
  expiresAt: number;
  createdAt: number;
}

interface PendingInvitationsProps {
  invitations: Invitation[];
}

export function PendingInvitations({ invitations }: PendingInvitationsProps) {
  if (invitations.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8">
        <EmptyState
          icon={Mail}
          title="No hay invitaciones pendientes"
          description="Todas las invitaciones han sido aceptadas o han expirado."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <InvitationCard key={invitation.id} invitation={invitation} />
      ))}
    </div>
  );
}
