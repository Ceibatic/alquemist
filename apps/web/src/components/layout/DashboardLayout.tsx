/**
 * Dashboard Layout
 * Header with logout, navigation placeholder, and content area
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authFetch } from '@/lib/authFetch'
import translations from '@/lib/i18n/es.json'

const t = translations.auth.dashboard

interface DashboardLayoutProps {
  user: {
    firstName: string | null
    lastName: string | null
  }
  company: {
    name: string
  }
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, company, children }) => {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await authFetch('/api/auth/logout', {
        method: 'POST'
      })

      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">Alquemist</h1>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{company.name}</p>
              </div>

              <Button
                variant="secondary"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t.logout}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Placeholder */}
      {/* TODO: Add navigation for future modules */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
