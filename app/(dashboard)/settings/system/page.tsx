'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/components/providers/user-provider';
import {
  Bot,
  Mail,
  Shield,
  Bell,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SystemSettingsPage() {
  const { toast } = useToast();
  const { userId } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get full user data including companyId
  const user = useQuery(api.users.getUserById, userId ? { userId } : 'skip');
  const companyId = user?.companyId;

  // Queries
  const systemStatus = useQuery(api.config.getSystemStatus);
  const companySettings = useQuery(
    api.config.getCompanySettings,
    companyId ? { companyId } : 'skip'
  );

  // Mutations
  const updateSettings = useMutation(api.config.updateCompanySettings);
  const refreshStatus = useMutation(api.config.refreshIntegrationStatus);
  const initSettings = useMutation(api.config.initializeCompanySettings);

  // Local state for form
  const [settings, setSettings] = useState<Record<string, any>>({});

  // Initialize settings when loaded
  useEffect(() => {
    if (companySettings?.settings) {
      setSettings(companySettings.settings);
    }
  }, [companySettings]);

  // Initialize settings if they don't exist
  useEffect(() => {
    if (companySettings && !companySettings.exists && companyId) {
      initSettings({ companyId });
    }
  }, [companySettings, companyId, initSettings]);

  const handleRefresh = async () => {
    if (!companyId) return;
    setIsRefreshing(true);
    try {
      await refreshStatus({ companyId });
      toast({
        title: 'Estado actualizado',
        description: 'El estado de las integraciones ha sido actualizado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = async () => {
    if (!companyId || !user?._id) return;
    setIsSaving(true);
    try {
      await updateSettings({
        companyId,
        userId: user._id,
        ...settings,
      });
      toast({
        title: 'Configuracion guardada',
        description: 'Los cambios han sido guardados correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuracion',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (!systemStatus || !companySettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuracion del Sistema"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Configuracion', href: '/settings' },
          { label: 'Sistema' },
        ]}
        description="Administra integraciones, funciones AI y configuracion general"
      />

      {/* System Integrations Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Estado de Integraciones</CardTitle>
                <CardDescription>
                  Conexiones con servicios externos
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualizar Estado
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${systemStatus.integrations.ai.configured ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Bot className={`h-5 w-5 ${systemStatus.integrations.ai.configured ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  Inteligencia Artificial
                  {systemStatus.integrations.ai.configured ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Configurado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      No configurado
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {systemStatus.integrations.ai.provider}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {systemStatus.integrations.ai.configured ? (
                <ul className="space-y-1">
                  {systemStatus.integrations.ai.features.map((f) => (
                    <li key={f} className="flex items-center gap-1 justify-end">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Configurar GEMINI_API_KEY</p>
              )}
            </div>
          </div>

          {/* Email Integration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${systemStatus.integrations.email.configured ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Mail className={`h-5 w-5 ${systemStatus.integrations.email.configured ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  Email Service
                  {systemStatus.integrations.email.configured ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Configurado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      No configurado
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {systemStatus.integrations.email.provider}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {systemStatus.integrations.email.configured ? (
                <ul className="space-y-1">
                  {systemStatus.integrations.email.features.map((f) => (
                    <li key={f} className="flex items-center gap-1 justify-end">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Configurar RESEND_API_KEY</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Funciones de IA</CardTitle>
              <CardDescription>
                Habilita o deshabilita las funciones de inteligencia artificial
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Funciones de IA Habilitadas</Label>
              <p className="text-sm text-muted-foreground">
                Habilitar todas las funciones de inteligencia artificial
              </p>
            </div>
            <Switch
              checked={settings.ai_features_enabled ?? true}
              onCheckedChange={(checked) => updateSetting('ai_features_enabled', checked)}
              disabled={!systemStatus.integrations.ai.configured}
            />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm">Deteccion de Plagas</Label>
                <p className="text-xs text-muted-foreground">Analisis de fotos</p>
              </div>
              <Switch
                checked={settings.ai_pest_detection_enabled ?? true}
                onCheckedChange={(checked) => updateSetting('ai_pest_detection_enabled', checked)}
                disabled={!settings.ai_features_enabled || !systemStatus.integrations.ai.configured}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm">Extraccion de Plantillas</Label>
                <p className="text-xs text-muted-foreground">PDFs a formularios</p>
              </div>
              <Switch
                checked={settings.ai_template_extraction_enabled ?? true}
                onCheckedChange={(checked) => updateSetting('ai_template_extraction_enabled', checked)}
                disabled={!settings.ai_features_enabled || !systemStatus.integrations.ai.configured}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm">Analisis de Calidad</Label>
                <p className="text-xs text-muted-foreground">Evaluacion automatica</p>
              </div>
              <Switch
                checked={settings.ai_quality_analysis_enabled ?? true}
                onCheckedChange={(checked) => updateSetting('ai_quality_analysis_enabled', checked)}
                disabled={!settings.ai_features_enabled || !systemStatus.integrations.ai.configured}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle>Cumplimiento y Regulacion</CardTitle>
              <CardDescription>
                Configura requisitos obligatorios para operaciones
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Controles de Calidad Obligatorios</Label>
                <p className="text-xs text-muted-foreground">Requerir QC antes de cambio de fase</p>
              </div>
              <Switch
                checked={settings.require_quality_checks ?? false}
                onCheckedChange={(checked) => updateSetting('require_quality_checks', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Fotos de Lote Obligatorias</Label>
                <p className="text-xs text-muted-foreground">Requerir foto al crear lotes</p>
              </div>
              <Switch
                checked={settings.require_batch_photos ?? false}
                onCheckedChange={(checked) => updateSetting('require_batch_photos', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Notas de Actividad Obligatorias</Label>
                <p className="text-xs text-muted-foreground">Requerir notas en cada actividad</p>
              </div>
              <Switch
                checked={settings.require_activity_notes ?? false}
                onCheckedChange={(checked) => updateSetting('require_activity_notes', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Reportes Automaticos</Label>
                <p className="text-xs text-muted-foreground">Generar reportes semanales</p>
              </div>
              <Switch
                checked={settings.auto_generate_reports ?? false}
                onCheckedChange={(checked) => updateSetting('auto_generate_reports', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura las notificaciones automaticas del sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label>Notificaciones por Email</Label>
              <p className="text-xs text-muted-foreground">Habilitar envio de emails</p>
            </div>
            <Switch
              checked={settings.email_notifications_enabled ?? true}
              onCheckedChange={(checked) => updateSetting('email_notifications_enabled', checked)}
              disabled={!systemStatus.integrations.email.configured}
            />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm">Cambio de Fase</Label>
                <p className="text-xs text-muted-foreground">Notificar al cambiar fase</p>
              </div>
              <Switch
                checked={settings.notify_on_phase_change ?? true}
                onCheckedChange={(checked) => updateSetting('notify_on_phase_change', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm">Inventario Bajo</Label>
                <p className="text-xs text-muted-foreground">Alertar cuando haya poco stock</p>
              </div>
              <Switch
                checked={settings.notify_on_low_inventory ?? true}
                onCheckedChange={(checked) => updateSetting('notify_on_low_inventory', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm">Actividades Programadas</Label>
                <p className="text-xs text-muted-foreground">Recordatorios de tareas</p>
              </div>
              <Switch
                checked={settings.notify_on_scheduled_activity ?? true}
                onCheckedChange={(checked) => updateSetting('notify_on_scheduled_activity', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-sm">Actividades Atrasadas</Label>
                <p className="text-xs text-muted-foreground">Alertar tareas vencidas</p>
              </div>
              <Switch
                checked={settings.notify_on_overdue_activity ?? true}
                onCheckedChange={(checked) => updateSetting('notify_on_overdue_activity', checked)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="flex-1">
              <Label>Umbral de Inventario Bajo (%)</Label>
              <p className="text-xs text-muted-foreground">Porcentaje minimo antes de alertar</p>
            </div>
            <Input
              type="number"
              min={5}
              max={50}
              className="w-24"
              value={settings.low_inventory_threshold_percentage ?? 20}
              onChange={(e) => updateSetting('low_inventory_threshold_percentage', parseInt(e.target.value) || 20)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Default Values */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Database className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle>Valores Predeterminados</CardTitle>
              <CardDescription>
                Configura los valores por defecto para nuevas operaciones
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nivel de Seguimiento</Label>
              <Select
                value={settings.default_tracking_level ?? 'batch'}
                onValueChange={(value) => updateSetting('default_tracking_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch">Por Lote (Recomendado)</SelectItem>
                  <SelectItem value="individual">Individual por Planta</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Nivel de seguimiento predeterminado para nuevos lotes
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tamano de Lote Predeterminado</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={settings.default_batch_size ?? 50}
                onChange={(e) => updateSetting('default_batch_size', parseInt(e.target.value) || 50)}
              />
              <p className="text-xs text-muted-foreground">
                Cantidad de plantas por lote al crear ordenes
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Dias de Retencion de Logs</Label>
              <Input
                type="number"
                min={30}
                max={3650}
                value={settings.retain_logs_days ?? 365}
                onChange={(e) => updateSetting('retain_logs_days', parseInt(e.target.value) || 365)}
              />
              <p className="text-xs text-muted-foreground">
                Cuanto tiempo conservar registros de actividades
              </p>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg h-fit">
              <div>
                <Label>Registrar Todas las Actividades</Label>
                <p className="text-xs text-muted-foreground">Log detallado de operaciones</p>
              </div>
              <Switch
                checked={settings.log_all_activities ?? true}
                onCheckedChange={(checked) => updateSetting('log_all_activities', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => setSettings(companySettings?.settings || {})}
        >
          Cancelar Cambios
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#1B5E20] hover:bg-[#1B5E20]/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Configuracion'
          )}
        </Button>
      </div>
    </div>
  );
}
