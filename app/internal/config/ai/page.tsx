'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Brain,
  Check,
  RefreshCw,
  Save,
  Star,
  Sparkles,
} from 'lucide-react';

export default function AIConfigPage() {
  const [userId, setUserId] = useState<string | null>(null);

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
        // Ignore
      }
    }
  }, []);

  const providers = useQuery(api.internalAIConfig.getAIProviders);
  const prompts = useQuery(api.internalAIConfig.getAIPrompts);

  const seedProviders = useMutation(api.internalAIConfig.seedAIProviders);
  const seedPrompts = useMutation(api.internalAIConfig.seedAIPrompts);
  const refreshAPIKeys = useMutation(api.internalAIConfig.refreshAPIKeyStatus);
  const setDefaultProvider = useMutation(api.internalAIConfig.setDefaultProvider);
  const updateProvider = useMutation(api.internalAIConfig.updateAIProvider);
  const updatePrompt = useMutation(api.internalAIConfig.updatePrompt);

  // Initialize if no providers exist
  const handleInitialize = async () => {
    try {
      await seedProviders({});
      await seedPrompts({});
      toast.success('Configuracion inicializada correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al inicializar');
    }
  };

  const handleRefreshAPIKeys = async () => {
    if (!userId) return;
    try {
      await refreshAPIKeys({ userId: userId as Id<'users'> });
      toast.success('Estado de API keys actualizado');
    } catch (error: any) {
      toast.error(error.message || 'Error al refrescar');
    }
  };

  const handleSetDefault = async (providerId: Id<'ai_providers'>) => {
    if (!userId) return;
    try {
      await setDefaultProvider({
        userId: userId as Id<'users'>,
        providerId,
      });
      toast.success('Proveedor por defecto actualizado');
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar proveedor');
    }
  };

  // Check if needs initialization
  const needsInit = providers && providers.length === 0;

  if (!providers || !prompts) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Configuracion de IA</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-800 rounded-lg" />
          <div className="h-32 bg-slate-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (needsInit) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Configuracion de IA</h1>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Inicializacion Requerida
            </CardTitle>
            <CardDescription>
              No hay proveedores de IA configurados. Inicializa la configuracion con los valores por defecto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInitialize} className="bg-emerald-600 hover:bg-emerald-700">
              Inicializar Configuracion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuracion de IA</h1>
          <p className="text-slate-400">
            Administra proveedores, modelos y prompts del sistema
          </p>
        </div>
        <Button
          onClick={handleRefreshAPIKeys}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refrescar API Keys
        </Button>
      </div>

      {/* Providers */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-500" />
            Proveedores de IA
          </CardTitle>
          <CardDescription>
            Configura los modelos y parametros de cada proveedor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => (
            <ProviderCard
              key={provider._id}
              provider={provider}
              userId={userId}
              onSetDefault={handleSetDefault}
              onUpdate={updateProvider}
            />
          ))}
        </CardContent>
      </Card>

      {/* Prompts */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Prompts del Sistema</CardTitle>
          <CardDescription>
            Edita los prompts utilizados por las funciones de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {prompts.map((prompt) => (
            <PromptEditor
              key={prompt._id}
              prompt={prompt}
              userId={userId}
              onUpdate={updatePrompt}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Provider Card Component
function ProviderCard({
  provider,
  userId,
  onSetDefault,
  onUpdate,
}: {
  provider: any;
  userId: string | null;
  onSetDefault: (id: Id<'ai_providers'>) => void;
  onUpdate: any;
}) {
  const [temperature, setTemperature] = useState(provider.default_temperature);
  const [maxTokens, setMaxTokens] = useState(provider.default_max_tokens);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await onUpdate({
        userId: userId as Id<'users'>,
        providerId: provider._id,
        defaultTemperature: temperature,
        defaultMaxTokens: maxTokens,
      });
      toast.success('Configuracion guardada');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{provider.display_name}</h3>
            {provider.is_default && (
              <Badge className="bg-emerald-500/20 text-emerald-400">
                <Star className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Modelo: <span className="text-slate-300">{provider.default_model}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            className={
              provider.api_key_configured
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }
          >
            {provider.api_key_configured ? 'API Key OK' : 'Sin API Key'}
          </Badge>
          {!provider.is_default && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSetDefault(provider._id)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Hacer Default
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="text-slate-400">Temperature: {temperature.toFixed(2)}</Label>
          <Slider
            value={[temperature]}
            onValueChange={(v) => setTemperature(v[0])}
            min={0}
            max={2}
            step={0.1}
            className="mt-2"
          />
        </div>
        <div>
          <Label className="text-slate-400">Max Tokens: {maxTokens}</Label>
          <Slider
            value={[maxTokens]}
            onValueChange={(v) => setMaxTokens(v[0])}
            min={256}
            max={16384}
            step={256}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar
        </Button>
      </div>
    </div>
  );
}

// Prompt Editor Component
function PromptEditor({
  prompt,
  userId,
  onUpdate,
}: {
  prompt: any;
  userId: string | null;
  onUpdate: any;
}) {
  const [content, setContent] = useState(prompt.system_prompt);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await onUpdate({
        userId: userId as Id<'users'>,
        promptKey: prompt.prompt_key,
        systemPrompt: content,
      });
      toast.success('Prompt actualizado');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-semibold text-white">{prompt.display_name}</h3>
          <p className="text-sm text-slate-400">{prompt.description}</p>
        </div>
        <Badge className="bg-slate-700 text-slate-300">v{prompt.version}</Badge>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] bg-slate-900 border-slate-700 text-slate-200 font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setContent(prompt.system_prompt);
                setExpanded(false);
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || content === prompt.system_prompt}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
