'use client';

import { Suspense } from 'react';
import { OrderCreateWizard } from '@/components/production-orders/order-create-wizard';

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <OrderCreateWizard />
    </Suspense>
  );
}
