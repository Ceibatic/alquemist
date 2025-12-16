'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  Warehouse,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Play,
  Pause,
  Plus,
} from 'lucide-react';

export default function CompaniesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Id<'companies'> | null>(null);
  const [extendTrialDays, setExtendTrialDays] = useState('7');
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'trial' | 'active' | 'suspended'>('all');

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

  const companiesData = useQuery(api.internalAdmin.listAllCompanies, {
    status: filter === 'suspended' ? 'suspended' : filter === 'active' ? 'active' : undefined,
    subscriptionPlan: filter === 'trial' ? 'trial' : undefined,
    limit: 100,
  });

  const companyDetails = useQuery(
    api.internalAdmin.getCompanyDetails,
    selectedCompany ? { companyId: selectedCompany } : 'skip'
  );

  const extendTrial = useMutation(api.internalAdmin.extendTrial);
  const suspendCompany = useMutation(api.internalAdmin.suspendCompany);
  const activateCompany = useMutation(api.internalAdmin.activateCompany);

  const handleExtendTrial = async () => {
    if (!userId || !selectedCompany) return;
    try {
      await extendTrial({
        userId: userId as Id<'users'>,
        companyId: selectedCompany,
        additionalDays: parseInt(extendTrialDays),
      });
      toast.success(`Trial extendido por ${extendTrialDays} dias`);
      setShowExtendDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al extender trial');
    }
  };

  const handleSuspend = async (companyId: Id<'companies'>, companyName: string) => {
    if (!userId) return;
    if (!confirm(`Estas seguro de suspender "${companyName}"?`)) return;
    try {
      await suspendCompany({
        userId: userId as Id<'users'>,
        companyId,
        reason: 'Suspendido por administrador',
      });
      toast.success('Empresa suspendida');
    } catch (error: any) {
      toast.error(error.message || 'Error al suspender');
    }
  };

  const handleActivate = async (companyId: Id<'companies'>) => {
    if (!userId) return;
    try {
      await activateCompany({
        userId: userId as Id<'users'>,
        companyId,
      });
      toast.success('Empresa activada');
    } catch (error: any) {
      toast.error(error.message || 'Error al activar');
    }
  };

  if (!companiesData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Empresas</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-800 rounded-lg" />
          <div className="h-64 bg-slate-800 rounded-lg" />
        </div>
      </div>
    );
  }

  const { companies, total } = companiesData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Empresas</h1>
          <p className="text-slate-400">
            {total} empresa(s) registrada(s)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'trial', 'active', 'suspended'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }
          >
            {f === 'all' && 'Todas'}
            {f === 'trial' && 'En Trial'}
            {f === 'active' && 'Activas'}
            {f === 'suspended' && 'Suspendidas'}
          </Button>
        ))}
      </div>

      {/* Companies Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Empresa</TableHead>
                <TableHead className="text-slate-400">Plan</TableHead>
                <TableHead className="text-slate-400">Estado</TableHead>
                <TableHead className="text-slate-400">Uso</TableHead>
                <TableHead className="text-slate-400">Trial</TableHead>
                <TableHead className="text-slate-400 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow
                  key={company._id}
                  className="border-slate-800 hover:bg-slate-800/50"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{company.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(company.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        company.subscription_plan === 'enterprise'
                          ? 'bg-purple-500/20 text-purple-400'
                          : company.subscription_plan === 'pro'
                          ? 'bg-blue-500/20 text-blue-400'
                          : company.subscription_plan === 'trial'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }
                    >
                      {company.subscription_plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {company.status === 'active' ? (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Activa</span>
                      </div>
                    ) : company.status === 'suspended' ? (
                      <div className="flex items-center gap-1 text-red-400">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Suspendida</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">{company.status}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="h-3 w-3 text-slate-500" />
                        <span className="text-slate-300">
                          {company.usage.usersCount}/{company.usage.usersLimit}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(company.usage.usersPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Warehouse className="h-3 w-3 text-slate-500" />
                        <span className="text-slate-300">
                          {company.usage.facilitiesCount}/{company.usage.facilitiesLimit}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(company.usage.facilitiesPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.trialDaysRemaining !== null ? (
                      <div className="flex items-center gap-1">
                        <Clock
                          className={`h-4 w-4 ${
                            company.trialDaysRemaining <= 3
                              ? 'text-red-400'
                              : company.trialDaysRemaining <= 7
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        />
                        <span
                          className={
                            company.trialDaysRemaining <= 3
                              ? 'text-red-400'
                              : company.trialDaysRemaining <= 7
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }
                        >
                          {company.trialDaysRemaining}d
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCompany(company._id)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {company.subscription_plan === 'trial' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedCompany(company._id);
                            setShowExtendDialog(true);
                          }}
                          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                      {company.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSuspend(company._id, company.name)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : company.status === 'suspended' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleActivate(company._id)}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Company Details Modal */}
      {selectedCompany && companyDetails && !showExtendDialog && (
        <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-500" />
                {companyDetails.company.name}
              </DialogTitle>
              <DialogDescription>
                Detalles de la empresa y estadisticas de uso
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-slate-800">
                  <p className="text-xs text-slate-400">Usuarios</p>
                  <p className="text-xl font-bold text-white">
                    {companyDetails.stats.usersCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800">
                  <p className="text-xs text-slate-400">Instalaciones</p>
                  <p className="text-xl font-bold text-white">
                    {companyDetails.stats.facilitiesCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800">
                  <p className="text-xs text-slate-400">Lotes Activos</p>
                  <p className="text-xl font-bold text-white">
                    {companyDetails.stats.activeBatches}
                  </p>
                </div>
              </div>

              {/* Trial Info */}
              {companyDetails.trialInfo && (
                <div
                  className={`p-3 rounded-lg ${
                    companyDetails.trialInfo.daysRemaining <= 3
                      ? 'bg-red-500/10 border border-red-500/30'
                      : companyDetails.trialInfo.daysRemaining <= 7
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock
                      className={`h-4 w-4 ${
                        companyDetails.trialInfo.daysRemaining <= 3
                          ? 'text-red-400'
                          : companyDetails.trialInfo.daysRemaining <= 7
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="text-sm text-slate-300">
                      Trial: {companyDetails.trialInfo.daysRemaining} dias restantes
                    </span>
                  </div>
                </div>
              )}

              {/* Users */}
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Usuarios</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {companyDetails.users.map((user) => (
                    <div
                      key={user._id}
                      className="flex justify-between items-center p-2 rounded bg-slate-800/50 text-sm"
                    >
                      <span className="text-slate-300">{user.email}</span>
                      <Badge
                        className={
                          user.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }
                      >
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Instalaciones</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {companyDetails.facilities.map((facility) => (
                    <div
                      key={facility._id}
                      className="flex justify-between items-center p-2 rounded bg-slate-800/50 text-sm"
                    >
                      <span className="text-slate-300">{facility.name}</span>
                      <span className="text-xs text-slate-500">{facility.city}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedCompany(null)}
                className="border-slate-700 text-slate-300"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Extend Trial Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Extender Trial</DialogTitle>
            <DialogDescription>
              Agrega dias adicionales al periodo de prueba
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Dias adicionales</label>
              <Input
                type="number"
                value={extendTrialDays}
                onChange={(e) => setExtendTrialDays(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                min="1"
                max="365"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExtendDialog(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExtendTrial}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Extender Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
