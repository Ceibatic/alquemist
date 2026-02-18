'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileCheck, Leaf, Pencil } from 'lucide-react';

interface ProductQualityTabProps {
  product: {
    regulatory_registered?: boolean;
    regulatory_registration_number?: string;
    organic_certified?: boolean;
    organic_cert_number?: string;
  };
  onEdit: () => void;
}

export function ProductQualityTab({ product, onEdit }: ProductQualityTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Regulatory Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Registro Regulatorio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Registrado</span>
            <Badge
              variant="secondary"
              className={
                product.regulatory_registered
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }
            >
              {product.regulatory_registered ? 'Si' : 'No'}
            </Badge>
          </div>
          {product.regulatory_registration_number && (
            <div>
              <p className="text-sm text-gray-500">Numero de Registro</p>
              <p className="font-mono text-sm">
                {product.regulatory_registration_number}
              </p>
            </div>
          )}
          {!product.regulatory_registered && !product.regulatory_registration_number && (
            <p className="text-sm text-gray-400">
              Este producto no tiene registro regulatorio configurado.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Organic Certification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Certificacion Organica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Certificado</span>
            <Badge
              variant="secondary"
              className={
                product.organic_certified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }
            >
              {product.organic_certified ? 'Si' : 'No'}
            </Badge>
          </div>
          {product.organic_cert_number && (
            <div>
              <p className="text-sm text-gray-500">Numero de Certificacion</p>
              <p className="font-mono text-sm">{product.organic_cert_number}</p>
            </div>
          )}
          {!product.organic_certified && !product.organic_cert_number && (
            <p className="text-sm text-gray-400">
              Este producto no tiene certificacion organica configurada.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit action */}
      <div className="lg:col-span-2">
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar informacion regulatoria
        </Button>
      </div>
    </div>
  );
}
