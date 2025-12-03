import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { ConvexClientProvider } from '@/components/providers/convex-client-provider';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  // Pass user data to client components via DashboardLayout
  return (
    <ConvexClientProvider>
      <DashboardLayout user={user}>{children}</DashboardLayout>
    </ConvexClientProvider>
  );
}
