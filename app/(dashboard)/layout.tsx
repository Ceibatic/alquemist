import { ConvexClientProvider } from '@/components/providers/convex-client-provider';
import { DashboardLayoutClient } from './dashboard-layout-client';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware handles auth protection — no need for server-side check
  return (
    <ConvexClientProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </ConvexClientProvider>
  );
}
