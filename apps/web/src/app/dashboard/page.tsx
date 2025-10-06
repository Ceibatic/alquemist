/**
 * Dashboard Page
 * Protected dashboard with session check
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { authFetch, AuthError } from '@/lib/authFetch'
import type { CurrentUserResponse } from '@alquemist/types/src/auth'
import translations from '@/lib/i18n/es.json'

const t = translations.auth.dashboard

export default function DashboardPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<CurrentUserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await authFetch<CurrentUserResponse>('/api/auth/me')
        setUserData(data)
      } catch (err) {
        if (err instanceof AuthError && err.status === 401) {
          // Not authenticated - redirect to login
          router.push('/login')
        } else {
          setError('Error al cargar los datos del usuario')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()
  }, [router])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Error desconocido'}</p>
          <button
            onClick={() => router.push('/login')}
            className="text-primary hover:underline"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  const userName = `${userData.user.firstName || ''} ${userData.user.lastName || ''}`.trim()

  return (
    <DashboardLayout user={userData.user} company={userData.company}>
      {/* Welcome Section */}
      <div className="bg-card rounded-lg shadow-md border border-border p-6 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t.welcome}, {userName}
        </h2>
        <p className="text-muted-foreground">
          {t.company}: <span className="font-medium text-foreground">{userData.company.name}</span>
        </p>
      </div>

      {/* Dashboard Content Placeholder */}
      <div className="bg-card rounded-lg shadow-md border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Panel de Control
        </h3>
        <p className="text-muted-foreground mb-4">
          Tu panel de control de Alquemist. Próximamente encontrarás aquí las funcionalidades de gestión de cultivos, inventario, trazabilidad y más.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Placeholder Cards */}
          {['Cultivos', 'Inventario', 'Reportes'].map((item) => (
            <div
              key={item}
              className="border border-border rounded-md p-4 text-center bg-muted/30"
            >
              <p className="text-sm font-medium text-muted-foreground">{item}</p>
              <p className="text-xs text-muted-foreground mt-1">Próximamente</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Details (for testing) */}
      <div className="mt-6 bg-card rounded-lg shadow-md border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Información de Usuario
        </h3>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Email:</span> {userData.user.email}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Rol:</span> {userData.role.displayNameEs}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Tipo de Entidad:</span>{' '}
            {userData.company.businessEntityType || 'N/A'}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Departamento:</span>{' '}
            {userData.company.colombianDepartment || 'N/A'}
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
