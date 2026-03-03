'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Activity,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: Id<'companies'>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<string, typeof Bell> = {
  overdue_activity: Clock,
  high_severity_observation: AlertTriangle,
  parameter_deviation: Activity,
};

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  acknowledged: 'Leida',
  resolved: 'Resuelta',
  dismissed: 'Descartada',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationPanel({ open, onOpenChange, companyId }: NotificationPanelProps) {
  const alerts = useQuery(api.alerts.listForUser, { companyId, limit: 50 });
  const acknowledge = useMutation(api.alerts.acknowledge);
  const dismiss = useMutation(api.alerts.dismiss);
  const dismissAll = useMutation(api.alerts.dismissAll);

  const pendingAlerts = alerts?.filter(a => a.status === 'pending') ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between pr-2">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
            {pendingAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {pendingAlerts.length}
              </Badge>
            )}
          </SheetTitle>
          {pendingAlerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => dismissAll({ companyId })}
            >
              <EyeOff className="h-3 w-3 mr-1" /> Descartar todo
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {!alerts ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">Cargando...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => {
                const Icon = TYPE_ICONS[alert.type] ?? Bell;
                const severityStyle = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info;
                const isPending = alert.status === 'pending';

                return (
                  <div
                    key={alert._id}
                    className={`rounded-lg border p-3 transition-colors ${isPending ? 'bg-card' : 'bg-muted/40 opacity-70'}`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isPending ? 'text-foreground' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm font-medium truncate ${!isPending ? 'text-muted-foreground' : ''}`}>
                            {alert.title}
                          </p>
                          <Badge className={`text-[10px] shrink-0 ${severityStyle}`}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: es })}
                          </span>
                          {!isPending && (
                            <span className="text-[10px] text-muted-foreground">
                              {STATUS_LABELS[alert.status] ?? alert.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => acknowledge({ alertId: alert._id })}
                        >
                          <Eye className="h-3 w-3 mr-1" /> Marcar leida
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-muted-foreground"
                          onClick={() => dismiss({ alertId: alert._id })}
                        >
                          <EyeOff className="h-3 w-3 mr-1" /> Descartar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
