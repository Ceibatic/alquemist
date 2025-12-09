'use client';

import { ReactNode, useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { SidebarMobile } from './sidebar-mobile';
import { Toaster } from '@/components/ui/toaster';
import { FacilityProvider, useFacility } from '@/components/providers/facility-provider';
import { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  user: {
    userId: string;
    email: string;
    companyId?: string;
    primaryFacilityId?: string;
  };
}

function DashboardLayoutInner({
  children,
  user,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { currentFacilityId, setCurrentFacilityId } = useFacility();

  const handleFacilityChange = (facilityId: string) => {
    setCurrentFacilityId(facilityId as Id<'facilities'>);
  };

  const handleSidebarToggle = () => {
    setSidebarVisible((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - Full height */}
      <div
        className={cn(
          'hidden lg:block transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0',
          sidebarVisible ? 'w-60' : 'w-0'
        )}
      >
        <Sidebar
          userId={user.userId}
          currentFacilityId={currentFacilityId ?? undefined}
          onFacilityChange={handleFacilityChange}
        />
      </div>

      {/* Mobile Sidebar */}
      <SidebarMobile
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        userId={user.userId}
        currentFacilityId={currentFacilityId ?? undefined}
        onFacilityChange={handleFacilityChange}
      />

      {/* Right side: Header + Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          user={user}
          onMenuClick={() => setMobileMenuOpen(true)}
          onSidebarToggle={handleSidebarToggle}
          notificationCount={0}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <FacilityProvider
      initialFacilityId={user.primaryFacilityId}
      initialCompanyId={user.companyId}
    >
      <DashboardLayoutInner user={user}>
        {children}
      </DashboardLayoutInner>
    </FacilityProvider>
  );
}
