/**
 * Registration Page
 * User registration with integrated company creation
 */

import React from 'react'
import { RegistrationForm } from '@/components/auth/RegistrationForm'
import translations from '@/lib/i18n/es.json'

const t = translations.auth.register

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Alquemist
          </h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {t.title}
          </h2>
          <p className="text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-card rounded-lg shadow-md border border-border p-6 md:p-8">
          <RegistrationForm />
        </div>
      </div>
    </div>
  )
}
