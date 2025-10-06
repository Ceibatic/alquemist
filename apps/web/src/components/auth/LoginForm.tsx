/**
 * Login Form
 * Email/password login with validation
 */

'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoginSchema, type LoginFormData } from '@/lib/validation'
import { authFetch, getErrorMessage } from '@/lib/authFetch'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import translations from '@/lib/i18n/es.json'

const t = translations.auth

export const LoginForm: React.FC = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await authFetch('/api/auth/login', {
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
      <FormField error={errors.email?.message}>
        <Input
          {...register('email')}
          id="email"
          type="email"
          label={t.login.email}
          error={errors.email?.message}
          autoComplete="email"
        />
      </FormField>

      <FormField error={errors.password?.message}>
        <Input
          {...register('password')}
          id="password"
          type="password"
          label={t.login.password}
          error={errors.password?.message}
          autoComplete="current-password"
        />
      </FormField>

      {/* Forgot Password Link (disabled for MODULE 1) */}
      <div className="text-right">
        <span className="text-sm text-muted-foreground cursor-not-allowed opacity-50">
          {t.login.forgotPassword}
        </span>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-md bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
        {t.login.submit}
      </Button>

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground">
        {t.login.noAccount}{' '}
        <Link href="/registro" className="text-primary hover:underline font-medium">
          {t.login.registerLink}
        </Link>
      </p>
    </form>
  )
}
