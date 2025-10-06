/**
 * Registration Form
 * Full registration with company fields and Colombian data
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegisterSchema, type RegisterFormData } from '@/lib/validation'
import { authFetch, getErrorMessage } from '@/lib/authFetch'
import { COLOMBIAN_DEPARTMENTS, getMunicipalitiesByDepartment } from '@/lib/colombianData'
import { Input } from '@/components/ui/Input'
import { Select, type SelectOption } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import translations from '@/lib/i18n/es.json'

const t = translations.auth

export const RegistrationForm: React.FC = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema)
  })

  const watchDepartment = watch('department')
  const watchBusinessEntityType = watch('businessEntityType')

  // Department options
  const departmentOptions: SelectOption[] = useMemo(
    () => COLOMBIAN_DEPARTMENTS.map(dept => ({ value: dept.name, label: dept.name })),
    []
  )

  // Municipality options based on selected department
  const municipalityOptions: SelectOption[] = useMemo(() => {
    if (!watchDepartment) return []
    const municipalities = getMunicipalitiesByDepartment(watchDepartment)
    return municipalities.map(muni => ({ value: muni, label: muni }))
  }, [watchDepartment])

  // Business entity type options
  const businessEntityOptions: SelectOption[] = [
    { value: 'SAS', label: t.businessEntityTypes.SAS },
    { value: 'SA', label: t.businessEntityTypes.SA },
    { value: 'LTDA', label: t.businessEntityTypes.LTDA },
    { value: 'EU', label: t.businessEntityTypes.EU },
    { value: 'PERSONA_NATURAL', label: t.businessEntityTypes.PERSONA_NATURAL }
  ]

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await authFetch('/api/auth/register', {
        method: 'POST',
        body: data
      })

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* User Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField error={errors.firstName?.message}>
          <Input
            {...register('firstName')}
            id="firstName"
            label={t.register.firstName}
            error={errors.firstName?.message}
            autoComplete="given-name"
          />
        </FormField>

        <FormField error={errors.lastName?.message}>
          <Input
            {...register('lastName')}
            id="lastName"
            label={t.register.lastName}
            error={errors.lastName?.message}
            autoComplete="family-name"
          />
        </FormField>
      </div>

      <FormField error={errors.email?.message}>
        <Input
          {...register('email')}
          id="email"
          type="email"
          label={t.register.email}
          error={errors.email?.message}
          autoComplete="email"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField error={errors.password?.message}>
          <Input
            {...register('password')}
            id="password"
            type="password"
            label={t.register.password}
            error={errors.password?.message}
            autoComplete="new-password"
          />
        </FormField>

        <FormField error={errors.confirmPassword?.message}>
          <Input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            label={t.register.confirmPassword}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />
        </FormField>
      </div>

      {/* Company Information */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Información de la Empresa</h3>

        <FormField error={errors.companyName?.message}>
          <Input
            {...register('companyName')}
            id="companyName"
            label={t.register.companyName}
            error={errors.companyName?.message}
            autoComplete="organization"
          />
        </FormField>

        <div className="mt-4">
          <FormField error={errors.businessEntityType?.message}>
            <Select
              id="businessEntityType"
              label={t.register.businessEntityType}
              options={businessEntityOptions}
              value={watchBusinessEntityType}
              onChange={(value) => setValue('businessEntityType', value as any)}
              placeholder={t.register.selectPlaceholder}
              searchPlaceholder={t.register.searchPlaceholder}
              error={errors.businessEntityType?.message}
              searchable={false}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormField error={errors.department?.message}>
            <Select
              id="department"
              label={t.register.department}
              options={departmentOptions}
              value={watchDepartment}
              onChange={(value) => {
                setValue('department', value)
                setValue('municipality', undefined) // Reset municipality when department changes
              }}
              placeholder={t.register.selectPlaceholder}
              searchPlaceholder={t.register.searchPlaceholder}
              error={errors.department?.message}
            />
          </FormField>

          <FormField error={errors.municipality?.message}>
            <Select
              id="municipality"
              label={t.register.municipality}
              options={municipalityOptions}
              value={watch('municipality')}
              onChange={(value) => setValue('municipality', value)}
              placeholder={t.register.selectPlaceholder}
              searchPlaceholder={t.register.searchPlaceholder}
              error={errors.municipality?.message}
              disabled={!watchDepartment}
            />
          </FormField>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-md bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
        {t.register.submit}
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        {t.register.hasAccount}{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          {t.register.loginLink}
        </Link>
      </p>
    </form>
  )
}
