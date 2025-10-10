/**
 * /api/v1/activities
 * Activity logging endpoints
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
import { createActivitySchema } from '@/lib/validations/schemas'
import { api } from '@/convex/_generated/api'
import { fetchQuery, fetchMutation } from 'convex/nextjs'
import { Id } from '@/convex/_generated/dataModel'

/**
 * GET /api/v1/activities
 * List activities
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

    const entity_type = searchParams.get('entity_type') || undefined
    const entity_id = searchParams.get('entity_id') || undefined
    const activity_type = searchParams.get('activity_type') || undefined

    const result = await fetchQuery(api.activities.list, {
      companyId: company._id,
      entity_type,
      entity_id,
      activity_type,
      limit,
      offset,
    })

    return paginatedResponse(result.activities, {
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
 * POST /api/v1/activities
 * Log a new activity
 */
export async function POST(request: NextRequest) {
  try {
    const context = await authenticateRequest(request)
    requireOrganization(context)

    const body = await parseJsonBody(request)

    // Validate input
    const validation = createActivitySchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors)
    }

    const data = validation.data

    // Log activity in Convex
    const activityId = await fetchMutation(api.activities.log, {
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      activity_type: data.activity_type,
      performed_by: context.userId as Id<'users'>,
      duration_minutes: data.duration_minutes,
      materials_consumed: data.materials_consumed,
      environmental_data: data.environmental_data,
      notes: data.notes,
    })

    return createdResponse({
      id: activityId,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      activity_type: data.activity_type,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return errorResponse(error)
  }
}
