'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  Leaf,
  Package,
  ClipboardList,
  Users,
  Settings,
  Building2,
  LayoutTemplate,
  ClipboardCheck,
  Layers,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FacilitySwitcher } from './facility-switcher';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard' as const,
    icon: LayoutDashboard,
  },
  {
    name: 'Áreas',
    href: '/areas' as const,
    icon: Map,
  },
  {
    name: 'Cultivares',
    href: '/cultivars' as const,
    icon: Leaf,
  },
  {
    name: 'Proveedores',
    href: '/suppliers' as const,
    icon: Package,
  },
  {
    name: 'Productos',
    href: '/products' as const,
    icon: ShoppingCart,
  },
  {
    name: 'Inventario',
    href: '/inventory' as const,
    icon: ClipboardList,
  },
  {
    name: 'Templates',
    href: '/templates' as const,
    icon: LayoutTemplate,
  },
  {
    name: 'Ordenes',
    href: '/production-orders' as const,
    icon: ClipboardList,
  },
  {
    name: 'Lotes',
    href: '/batches' as const,
    icon: Layers,
  },
  {
    name: 'Control de Calidad',
    href: '/quality-checks' as const,
    icon: ClipboardCheck,
  },
  {
    name: 'Usuarios',
    href: '/users' as const,
    icon: Users,
  },
  {
    name: 'Instalaciones',
    href: '/facilities' as const,
    icon: Building2,
  },
];

const secondaryItems = [
  {
    name: 'Configuración',
    href: '/settings' as const,
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
  userId: string;
  currentFacilityId?: string;
  onFacilityChange?: (facilityId: string) => void;
}

export function Sidebar({
  className,
  userId,
  currentFacilityId,
  onFacilityChange,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-full w-60 flex-col border-r bg-white',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center border-b px-4 py-4">
        <Link href="/dashboard">
          <Image
            src="/logo.svg"
            alt="Alquemist"
            width={140}
            height={32}
            priority
          />
        </Link>
      </div>

      {/* Facility Switcher */}
      <div className="border-b px-3 py-3">
        <FacilitySwitcher
          userId={userId}
          currentFacilityId={currentFacilityId}
          onFacilityChange={onFacilityChange}
        />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1 px-3">
          {secondaryItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
