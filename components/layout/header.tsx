'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  user: {
    userId: string;
    email: string;
    companyId?: string;
  };
  onMenuClick?: () => void;
  notificationCount?: number;
}

export function Header({
  user,
  onMenuClick,
  notificationCount = 0,
}: HeaderProps) {
  const router = useRouter();

  // Get user initials for avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    // Clear session cookies
    document.cookie =
      'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie =
      'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

    // Redirect to login
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
      {/* Left: Menu button (mobile) + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-md p-2 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Link href="/dashboard" className="flex items-center">
          {/* Mobile: Icon only, centered */}
          <Image
            src="/icon.svg"
            alt="Alquemist"
            width={32}
            height={32}
            className="sm:hidden"
            priority
          />
          {/* Tablet/Desktop: Full logo */}
          <Image
            src="/logo.svg"
            alt="Alquemist"
            width={150}
            height={35}
            className="hidden sm:block"
            priority
          />
        </Link>
      </div>

      {/* Right: Notifications + User Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-900 text-white text-xs">
                  {getInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-sm">
                {user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
