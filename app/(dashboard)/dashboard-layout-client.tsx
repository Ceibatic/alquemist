'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Loader2 } from 'lucide-react';

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);

  // Onboarding guard: redirect users who haven't completed setup
  useEffect(() => {
    if (user === undefined || !user) return;

    if (!user.companyId) {
      router.replace('/company-setup');
    } else if (!user.onboardingCompleted) {
      router.replace('/facility-basic');
    }
  }, [user, router]);

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

  // Still in onboarding — show loading while redirect happens
  if (!user.companyId || !user.onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout user={{ ...user, email: user.email ?? "" }}>
      {children}
    </DashboardLayout>
  );
}
