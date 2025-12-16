'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, User, ChevronRight, Settings2, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Configuración"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Configuración' },
        ]}
        description="Administra la configuración de tu cuenta e instalaciones"
      />

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Facility Settings Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-[#1B5E20]" />
              </div>
              <CardTitle className="text-xl">Configuración de Instalación</CardTitle>
            </div>
            <CardDescription className="text-base">
              Administra la configuración de tu instalación actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Información general de la instalación</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Ubicación y coordenadas GPS</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Licencias y permisos regulatorios</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Configuración de operaciones</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Preferencias de notificaciones</span>
              </li>
            </ul>

            <Link href="/settings/facility" className="block">
              <Button className="w-full bg-[#1B5E20] hover:bg-[#1B5E20]/90">
                Configurar Instalación
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Mi Cuenta</CardTitle>
            </div>
            <CardDescription className="text-base">
              Administra tu perfil, preferencias y seguridad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Información de perfil personal</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Preferencias de idioma y formato</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Notificaciones personales</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Contraseña y seguridad</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Autenticación de dos factores</span>
              </li>
            </ul>

            <Link href="/settings/account" className="block">
              <Button className="w-full" variant="outline">
                Configurar Cuenta
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Settings Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings2 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Sistema e Integraciones</CardTitle>
            </div>
            <CardDescription className="text-base">
              Configura integraciones, IA y preferencias del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Estado de integraciones (IA, Email)</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Funciones de inteligencia artificial</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Cumplimiento y regulacion</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Notificaciones automaticas</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Valores predeterminados</span>
              </li>
            </ul>

            <Link href="/settings/system" className="block">
              <Button className="w-full" variant="outline">
                Configurar Sistema
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl">Suscripcion</CardTitle>
            </div>
            <CardDescription className="text-base">
              Gestiona tu plan y limites de uso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Plan actual y caracteristicas</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Limite de instalaciones y usuarios</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Historial de facturacion</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <span>Actualizar o cambiar plan</span>
              </li>
            </ul>

            <Link href="/settings/subscription" className="block">
              <Button className="w-full" variant="outline">
                Ver Suscripcion
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">¿Necesitas ayuda?</CardTitle>
          <CardDescription>
            Si tienes problemas con la configuración, contacta al administrador del sistema o consulta la documentación.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
