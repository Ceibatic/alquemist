'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  Warehouse,
  Brain,
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function InternalDashboardPage() {
  const systemStatus = useQuery(api.internalAdmin.getSystemStatus);

  if (!systemStatus) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800 animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-slate-800 rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-800 rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { integrations, metrics, environment, aiProviders } = systemStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Interno</h1>
        <p className="text-slate-400">
          Panel de administracion de la plataforma Alquemist
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Empresas"
          value={metrics.totalCompanies}
          icon={Building2}
          description={`${metrics.activeCompanies} activas`}
        />
        <MetricCard
          title="Trials Activos"
          value={metrics.trialCompanies}
          icon={Clock}
          description="Empresas en periodo de prueba"
          variant={metrics.trialCompanies > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          title="Total Usuarios"
          value={metrics.totalUsers}
          icon={Users}
          description="Usuarios registrados"
        />
        <MetricCard
          title="Instalaciones"
          value={metrics.totalFacilities}
          icon={Warehouse}
          description="Instalaciones activas"
        />
      </div>

      {/* Integration Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Providers */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-emerald-500" />
              Proveedores de IA
            </CardTitle>
            <CardDescription>
              Estado de configuracion de proveedores de IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <IntegrationRow
              name="Google Gemini"
              configured={integrations.ai.gemini.configured}
              isActive={integrations.ai.activeProvider === 'gemini'}
            />
            <IntegrationRow
              name="Anthropic Claude"
              configured={integrations.ai.claude.configured}
              isActive={integrations.ai.activeProvider === 'claude'}
            />
            <IntegrationRow
              name="OpenAI GPT"
              configured={integrations.ai.openai.configured}
              isActive={integrations.ai.activeProvider === 'openai'}
            />
          </CardContent>
        </Card>

        {/* Email & Other Integrations */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Otras Integraciones
            </CardTitle>
            <CardDescription>
              Estado de servicios externos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <IntegrationRow
              name="Resend (Email)"
              configured={integrations.email.configured}
            />
            <div className="pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Entorno</span>
                <Badge variant={environment.isProduction ? 'default' : 'secondary'}>
                  {environment.isProduction ? 'Produccion' : 'Desarrollo'}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-slate-400">URL</span>
                <span className="text-slate-300 text-xs">{environment.appUrl}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Providers Detail */}
      {aiProviders && aiProviders.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Configuracion de Proveedores</CardTitle>
            <CardDescription>
              Detalle de proveedores de IA configurados en la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {aiProviders.map((provider) => (
                <div
                  key={provider._id}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{provider.display_name}</h3>
                    {provider.is_default && (
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">
                    Modelo: {provider.default_model}
                  </p>
                  <div className="flex gap-2">
                    <Badge
                      variant={provider.is_active ? 'default' : 'secondary'}
                      className={provider.is_active ? 'bg-green-500/20 text-green-400' : ''}
                    >
                      {provider.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge
                      variant={provider.api_key_configured ? 'default' : 'destructive'}
                      className={
                        provider.api_key_configured
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }
                    >
                      {provider.api_key_configured ? 'API Key OK' : 'Sin API Key'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {metrics.suspendedCompanies > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="text-amber-200">
              {metrics.suspendedCompanies} empresa(s) suspendida(s)
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  variant?: 'default' | 'warning' | 'success';
}) {
  const iconColors = {
    default: 'text-slate-400',
    warning: 'text-amber-500',
    success: 'text-emerald-500',
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Integration Row Component
function IntegrationRow({
  name,
  configured,
  isActive = false,
}: {
  name: string;
  configured: boolean;
  isActive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/50">
      <span className="text-slate-300">{name}</span>
      <div className="flex items-center gap-2">
        {isActive && (
          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
            Activo
          </Badge>
        )}
        {configured ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
    </div>
  );
}
