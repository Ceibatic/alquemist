'use client';

import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Camera,
  AlertTriangle,
  Info,
  ImagePlus,
  Flag,
} from 'lucide-react';

interface BatchNotesTabProps {
  batch: {
    _id: Id<'batches'>;
    notes?: string;
    batch_code: string;
  };
}

export function BatchNotesTab({ batch }: BatchNotesTabProps) {
  return (
    <div className="space-y-6">
      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas del Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          {batch.notes ? (
            <div className="prose prose-sm max-w-none">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {batch.notes}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No hay notas registradas para este lote</p>
              <Button variant="outline" className="mt-4" disabled>
                Agregar Nota
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos Section - Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Fotos del Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-blue-100 p-3 mb-3">
              <ImagePlus className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Galeria de Fotos Proximamente
            </h4>
            <p className="text-sm text-gray-600 text-center max-w-md mb-4">
              Pronto podras subir y visualizar fotos del lote para documentar su progreso y condicion.
            </p>
            <Button variant="outline" disabled>
              Subir Foto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Section - Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-600" />
            Incidentes y Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-orange-100 p-3 mb-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Registro de Incidentes Proximamente
            </h4>
            <p className="text-sm text-gray-600 text-center max-w-md mb-4">
              El modulo de incidentes permitira documentar problemas, alertas sanitarias, y eventos importantes del lote.
            </p>
            <div className="text-left w-full max-w-md mt-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Tipos de incidentes:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                  Plagas y enfermedades detectadas
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                  Problemas de riego o nutricion
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                  Condiciones ambientales adversas
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                  Eventos de perdida significativa
                </li>
              </ul>
            </div>
            <Button variant="outline" className="mt-4" disabled>
              Reportar Incidente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Funcionalidades en Desarrollo
              </p>
              <p className="text-xs text-blue-700">
                Las funciones de edicion de notas, subida de fotos, y registro de incidentes
                estaran disponibles proximamente. Mientras tanto, las notas existentes se
                muestran en modo lectura.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
