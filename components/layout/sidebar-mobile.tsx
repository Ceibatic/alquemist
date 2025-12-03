'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  Leaf,
  Package,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FacilitySwitcher } from './facility-switcher';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Áreas',
    href: '/areas',
    icon: Map,
  },
  {
    name: 'Cultivares',
    href: '/cultivars',
    icon: Leaf,
  },
  {
    name: 'Proveedores',
    href: '/suppliers',
    icon: Package,
  },
  {
    name: 'Inventario',
    href: '/inventory',
    icon: ClipboardList,
  },
  {
    name: 'Usuarios',
    href: '/users',
    icon: Users,
  },
  {
    name: 'Instalaciones',
    href: '/facilities',
    icon: Building2,
  },
];

const secondaryItems = [
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarMobileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentFacilityId?: string;
  onFacilityChange?: (facilityId: string) => void;
}

export function SidebarMobile({
  open,
  onOpenChange,
  userId,
  currentFacilityId,
  onFacilityChange,
}: SidebarMobileProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // Clear session cookies
    document.cookie =
      'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie =
      'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

    // Close drawer
    onOpenChange(false);

    // Redirect to login
    router.push('/login');
  };

  const handleNavClick = (href: string) => {
    onOpenChange(false);
    // Use window.location for navigation to avoid TypeScript route inference issues
    window.location.href = href;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        {/* Logo Header - SheetContent already has close button */}
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center justify-center">
            <Link href="/dashboard" onClick={() => onOpenChange(false)}>
              <Image
                src="/logo.svg"
                alt="Alquemist"
                width={140}
                height={32}
                priority
              />
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Facility Switcher */}
        <div className="border-b px-3 py-3">
          <FacilitySwitcher
            userId={userId}
            currentFacilityId={currentFacilityId}
            onFacilityChange={onFacilityChange}
          />
        </div>

        {/* Navigation */}
        <div className="flex h-full flex-col overflow-y-auto pb-4">
          <nav className="space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          <Separator className="my-2" />

          <nav className="space-y-1 px-3">
            {secondaryItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          <Separator className="my-2" />

          <div className="px-3">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-gray-700"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
