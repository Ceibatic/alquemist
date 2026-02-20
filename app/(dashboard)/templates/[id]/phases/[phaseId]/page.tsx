'use client';

import { Suspense } from 'react';
import { PhaseDetailView } from '@/components/templates/phase-detail-view';

export default function PhaseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <PhaseDetailView />
    </Suspense>
  );
}
