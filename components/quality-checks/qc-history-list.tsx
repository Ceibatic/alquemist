'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Search,
  X,
  Eye,
  Calendar,
  Clock,
  User,
  FileText,
  Brain,
  Download,
  ArrowUpDown,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export interface QCHistoryListProps {
  companyId: Id<'companies'>;
  facilityId?: Id<'facilities'>;
  templateId?: Id<'quality_check_templates'>;
  entityType?: string;
  entityId?: string;
  onViewInspection?: (checkId: Id<'quality_checks'>) => void;
  className?: string;
}

type SortField = 'created_at' | 'templateName' | 'overall_result';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

export function QCHistoryList({
  companyId,
  facilityId,
  templateId,
  entityType,
  entityId,
  onViewInspection,
  className,
}: QCHistoryListProps) {
  const router = useRouter();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templateId || 'all');
  const [selectedEntityType, setSelectedEntityType] = useState<string>(entityType || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');
  const [entityIdFilter, setEntityIdFilter] = useState(entityId || '');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  const checksData = useQuery(
    api.qualityChecks.list,
    {
      companyId,
      facilityId,
      templateId: selectedTemplate !== 'all' ? (selectedTemplate as Id<'quality_check_templates'>) : undefined,
      entityType: selectedEntityType !== 'all' ? selectedEntityType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }
  );

  const templates = useQuery(
    api.qualityCheckTemplates.list,
    {
      companyId,
      status: 'active',
    }
  );

  const users = useQuery(api.users.listByCompany, { companyId });

  // Filter and sort checks
  const filteredChecks = useMemo(() => {
    if (!checksData?.checks) return [];

    let result = checksData.checks;

    // Filter by entity ID
    if (entityIdFilter.trim()) {
      const query = entityIdFilter.toLowerCase();
      result = result.filter((check) =>
        check.entity_id.toLowerCase().includes(query)
      );
    }

    // Filter by search query (inspector name or notes)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (check) =>
          check.performerName?.toLowerCase().includes(query) ||
          check.notes?.toLowerCase().includes(query)
      );
    }

    // Filter by result
    if (selectedResult !== 'all') {
      result = result.filter((check) => check.overall_result === selectedResult);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'created_at':
          comparison = a.created_at - b.created_at;
          break;
        case 'templateName':
          comparison = (a.templateName || '').localeCompare(b.templateName || '');
          break;
        case 'overall_result':
          comparison = (a.overall_result || '').localeCompare(b.overall_result || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [checksData?.checks, entityIdFilter, searchQuery, selectedResult, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredChecks.length / ITEMS_PER_PAGE);
  const paginatedChecks = filteredChecks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewInspection = (checkId: Id<'quality_checks'>) => {
    if (onViewInspection) {
      onViewInspection(checkId);
    } else {
      router.push(`/quality-checks/inspections/${checkId}`);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTemplate('all');
    setSelectedEntityType('all');
    setSelectedStatus('all');
    setSelectedResult('all');
    setEntityIdFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedTemplate !== 'all' ||
    selectedEntityType !== 'all' ||
    selectedStatus !== 'all' ||
    selectedResult !== 'all' ||
    entityIdFilter;

  // Get result badge
  const getResultBadge = (result: string) => {
    switch (result) {
      case 'pass':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'fail':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        );
      case 'conditional':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Condicional
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {result}
          </Badge>
        );
    }
  };

  // Loading state
  if (!checksData || !templates || !users) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Template, Entity Type, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los templates</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Tipo de Entidad</label>
              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las entidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="batch">Lote</SelectItem>
                  <SelectItem value="plant">Planta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Estado</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Result, Entity ID, Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Resultado</label>
              <Select value={selectedResult} onValueChange={setSelectedResult}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los resultados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pass">Aprobado</SelectItem>
                  <SelectItem value="fail">Rechazado</SelectItem>
                  <SelectItem value="conditional">Condicional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">ID de Entidad</label>
              <div className="relative">
                <Input
                  placeholder="Buscar por ID..."
                  value={entityIdFilter}
                  onChange={(e) => setEntityIdFilter(e.target.value)}
                  className="pr-8"
                />
                {entityIdFilter && (
                  <button
                    onClick={() => setEntityIdFilter('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Inspector, notas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5" />
            Inspecciones ({filteredChecks.length})
          </CardTitle>
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          {paginatedChecks.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title={hasActiveFilters ? 'No se encontraron inspecciones' : 'No hay inspecciones'}
              description={
                hasActiveFilters
                  ? 'No hay inspecciones que coincidan con los filtros seleccionados.'
                  : 'Aun no se han realizado inspecciones de calidad.'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center gap-2">
                          Fecha/Hora
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('templateName')}
                      >
                        <div className="flex items-center gap-2">
                          Template
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Entidad</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('overall_result')}
                      >
                        <div className="flex items-center gap-2">
                          Resultado
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center">AI</TableHead>
                      <TableHead className="text-center">Duracion</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedChecks.map((check) => (
                      <TableRow
                        key={check._id}
                        className="cursor-pointer"
                        onClick={() => handleViewInspection(check._id as Id<'quality_checks'>)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {format(check.created_at, 'dd/MM/yyyy', { locale: es })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(check.created_at, 'HH:mm', { locale: es })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{check.templateName || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="text-xs mb-1">
                              {check.entity_type === 'batch' ? 'Lote' : 'Planta'}
                            </Badge>
                            <div className="text-sm text-gray-600">{check.entity_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{check.performerName || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getResultBadge(check.overall_result)}</TableCell>
                        <TableCell className="text-center">
                          {check.ai_analysis_results ? (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                              <Brain className="h-3 w-3" />
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {check.duration_minutes ? (
                            <div className="flex items-center justify-center gap-1 text-sm">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {check.duration_minutes} min
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {check.status === 'completed' ? (
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              Completado
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                              Borrador
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInspection(check._id as Id<'quality_checks'>);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paginatedChecks.map((check) => (
                  <Card
                    key={check._id}
                    className="cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => handleViewInspection(check._id as Id<'quality_checks'>)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm mb-1">
                            {check.templateName || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {format(check.created_at, 'dd/MM/yyyy HH:mm', { locale: es })}
                          </div>
                        </div>
                        {getResultBadge(check.overall_result)}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {check.entity_type === 'batch' ? 'Lote' : 'Planta'}
                        </Badge>
                        <span className="text-gray-600">{check.entity_id}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          {check.performerName || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                          {check.ai_analysis_results && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                              <Brain className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          {check.duration_minutes && (
                            <span className="text-xs text-gray-500">
                              {check.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <p className="text-center text-sm text-gray-600 mt-2">
                    Pagina {currentPage} de {totalPages} ({filteredChecks.length} inspecciones)
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
