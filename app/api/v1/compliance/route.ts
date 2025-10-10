/**
 * /api/v1/compliance
 * Compliance event endpoints
 */

import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  createdResponse,
  validationErrorResponse,
  paginatedResponse,
} from '@/lib/api/response'
import {
  authenticateRequest,
  requireOrganization,
  parseJsonBody,
  getPaginationParams,
  parseQueryParams,
} from '@/lib/api/middleware'
import { createComplianceEventSchema } from '@/lib/validations/schemas'
import { api } from '@/convex/_generated/api'
import { fetchQuery, fetchMutation } from 'convex/nextjs'
import { Id } from '@/convex/_generated/dataModel'

/**
 * GET /api/v1/compliance
 * List compliance events
 */
export async function GET(request: NextRequest) {
  try {
    const context = await authenticateRequest(request)
    requireOrganization(context)

    const { page, limit, offset } = getPaginationParams(request)
    const searchParams = parseQueryParams(request)

    // Get company first
    const company = await fetchQuery(api.companies.getByOrganizationId, {
      organizationId: context.organizationId,
    })

    if (!company) {
      return paginatedResponse([], {
        page,
        limit,
        total: 0,
        totalPages: 0,
      })
    }

    const event_category = searchParams.get('event_category') || undefined
    const status = searchParams.get('status') || undefined
    const facility_id = searchParams.get('facility_id') as Id<'facilities'> | undefined

    const result = await fetchQuery(api.compliance.list, {
      companyId: company._id,
      event_category,
      status,
      facility_id,
      limit,
      offset,
    })

    return paginatedResponse(result.events, {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    })
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * POST /api/v1/compliance
 * Create compliance event
 */
export async function POST(request: NextRequest) {
  try {
    const context = await authenticateRequest(request)
    requireOrganization(context)

    const body = await parseJsonBody(request)

    // Validate input
    const validation = createComplianceEventSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors)
    }

    const data = validation.data

    // Get company first
    const company = await fetchQuery(api.companies.getByOrganizationId, {
      organizationId: context.organizationId,
    })

    if (!company) {
      throw new Error('Company not found')
    }

    // Create compliance event in Convex
    const eventId = await fetchMutation(api.compliance.create, {
      company_id: company._id,
      event_type: data.event_type,
      event_category: data.event_category,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      facility_id: data.facility_id as Id<'facilities'> | undefined,
      title: data.title,
      description: data.description,
      severity: data.severity,
      status: data.status,
      due_date: data.due_date ? new Date(data.due_date).getTime() : undefined,
    })

    return createdResponse({
      id: eventId,
      title: data.title,
      event_type: data.event_type,
      status: data.status || 'open',
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    return errorResponse(error)
  }
}
