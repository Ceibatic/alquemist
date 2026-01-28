'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Loader2 } from 'lucide-react';

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.getCurrentUser);

  // Loading state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No user (should be caught by middleware, but fallback)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Sesión expirada. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      {children}
    </DashboardLayout>
  );
}
