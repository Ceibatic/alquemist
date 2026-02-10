'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, GitBranch } from 'lucide-react';
import { productCategoryLabels } from '@/lib/validations/product';
import { Skeleton } from '@/components/ui/skeleton';

interface TransformationChainProps {
  productId: string;
}

export function TransformationChain({ productId }: TransformationChainProps) {
  const chain = useQuery(api.products.getTransformationChain, {
    productId: productId as Id<'products'>,
  });

  if (chain === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Cadena de Transformación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chain.length <= 1) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Cadena de Transformación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {chain.map((item, index) => (
            <div key={item._id} className="flex items-center gap-2">
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  item._id === productId
                    ? 'border-amber-300 bg-amber-50 font-medium'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="font-medium">{item.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{productCategoryLabels[item.category] || item.category}</span>
                  {item.default_yield_pct !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {item.default_yield_pct}%
                    </Badge>
                  )}
                </div>
              </div>
              {index < chain.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
