'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexClientProvider } from '@/components/providers/convex-client-provider';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Brain,
  Shield,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

// Internal admin layout with role verification
function InternalAdminContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user ID from cookie on mount
  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData.split('=')[1]));
        setUserId(user.userId);
      } catch {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  // Check if user is platform admin
  const isPlatformAdmin = useQuery(
    api.internalAdmin.isPlatformAdmin,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  );

  // Redirect if not platform admin
  useEffect(() => {
    if (!loading && userId && isPlatformAdmin === false) {
      router.push('/dashboard');
    }
  }, [loading, userId, isPlatformAdmin, router]);

  if (loading || isPlatformAdmin === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto" />
          <p className="mt-4 text-slate-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isPlatformAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-emerald-500" />
            <div>
              <h1 className="text-lg font-bold text-white">Ceibatic</h1>
              <p className="text-xs text-slate-400">Internal Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/internal/dashboard" icon={LayoutDashboard}>
            Dashboard
          </NavLink>
          <NavLink href="/internal/companies" icon={Building2}>
            Empresas
          </NavLink>
          <NavLink href="/internal/config/ai" icon={Brain}>
            Configuracion IA
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

// Navigation link component
function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  // Simple active check based on pathname
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(window.location.pathname.startsWith(href));
  }, [href]);

  return (
    <Link
      href={href as any}
      className={cn(
        'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-emerald-500/10 text-emerald-500'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );
}

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <InternalAdminContent>{children}</InternalAdminContent>
      <Toaster />
    </ConvexClientProvider>
  );
}
