/**
 * /api/v1/companies
 * Company management endpoints
 */

import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  createdResponse,
  validationErrorResponse,
} from '@/lib/api/response'
import {
  authenticateRequest,
  requireOrganization,
  parseJsonBody,
} from '@/lib/api/middleware'
import { createCompanySchema } from '@/lib/validations/schemas'
import { api } from '@/convex/_generated/api'
import { fetchQuery, fetchMutation } from 'convex/nextjs'

/**
 * GET /api/v1/companies
 * Get current user's company by organization ID
 */
export async function GET(request: NextRequest) {
  try {
    const context = await authenticateRequest(request)

    // Get company from Convex by organization ID
    if (context.organizationId) {
      const company = await fetchQuery(api.companies.getByOrganizationId, {
        organizationId: context.organizationId,
      })

      if (company) {
        return successResponse({
          id: company._id,
          organization_id: company.organization_id,
          name: company.name,
          company_type: company.company_type,
          status: company.status,
          subscription_plan: company.subscription_plan,
          max_facilities: company.max_facilities,
          max_users: company.max_users,
          default_locale: company.default_locale,
          default_currency: company.default_currency,
          default_timezone: company.default_timezone,
        })
      }
    }

    // No company found - return organization info
    return successResponse({
      organizationId: context.organizationId,
      userId: context.userId,
      message: 'No company profile found. Create one using POST /api/v1/companies',
    })
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * POST /api/v1/companies
 * Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    const context = await authenticateRequest(request)
    requireOrganization(context)

    const body = await parseJsonBody(request)

    // Validate input
    const validation = createCompanySchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors)
    }

    const data = validation.data

    // Create company in Convex
    const companyId = await fetchMutation(api.companies.create, {
      organization_id: context.organizationId,
      name: data.name,
      company_type: data.company_type,
      country: data.country || 'CO',
      default_locale: data.default_locale || 'es',
      default_currency: data.default_currency || 'COP',
      default_timezone: data.default_timezone || 'America/Bogota',
      legal_name: data.legal_name,
      tax_id: data.tax_id,
      business_entity_type: data.business_entity_type,
      primary_contact_email: data.primary_contact_email,
      primary_contact_phone: data.primary_contact_phone,
      created_by: context.userId,
    })

    // Get the created company
    const company = await fetchQuery(api.companies.getByOrganizationId, {
      organizationId: context.organizationId,
    })

    return createdResponse({
      id: companyId,
      organization_id: context.organizationId,
      name: data.name,
      company_type: data.company_type,
      status: company?.status || 'active',
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    return errorResponse(error)
  }
}
