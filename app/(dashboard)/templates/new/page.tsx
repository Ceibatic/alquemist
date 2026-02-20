'use client';

import { Suspense } from 'react';
import { TemplateCreateWizard } from '@/components/templates/template-create-wizard';

export default function NewTemplatePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <TemplateCreateWizard />
    </Suspense>
  );
}
