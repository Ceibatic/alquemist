/**
 * /api/v1/facilities/[id]
 * Single facility operations
 */

import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  noContentResponse,
  validationErrorResponse,
} from '@/lib/api/response'
import {
  authenticateRequest,
  requireOrganization,
  parseJsonBody,
} from '@/lib/api/middleware'
import { updateFacilitySchema } from '@/lib/validations/schemas'
import { NotFoundError } from '@/lib/api/errors'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/v1/facilities/:id
 * Get a single facility
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const authContext = await authenticateRequest(request)
    requireOrganization(authContext)

    const { id } = await context.params

    // TODO: Fetch facility from Convex
    // const facility = await fetchQuery(api.facilities.get, {
    //   id,
    //   companyId: authContext.organizationId,
    // })

    // if (!facility) {
    //   throw new NotFoundError('Facility not found')
    // }

    // Mock response for now
    return successResponse({
      id,
      company_id: authContext.organizationId,
      name: 'Mock Facility',
      status: 'active',
    })
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * PATCH /api/v1/facilities/:id
 * Update a facility
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const authContext = await authenticateRequest(request)
    requireOrganization(authContext)

    const { id } = await context.params
    const body = await parseJsonBody(request)

    // Validate input
    const validation = updateFacilitySchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors)
    }

    const data = validation.data

    // TODO: Update facility in Convex
    // const facility = await fetchMutation(api.facilities.update, {
    //   id,
    //   companyId: authContext.organizationId,
    //   ...data,
    // })

    // Mock response for now
    return successResponse({
      id,
      ...data,
      updated_at: new Date().toISOString(),
    })
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * DELETE /api/v1/facilities/:id
 * Delete a facility (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const authContext = await authenticateRequest(request)
    requireOrganization(authContext)

    const { id } = await context.params

    // TODO: Soft delete facility in Convex
    // await fetchMutation(api.facilities.delete, {
    //   id,
    //   companyId: authContext.organizationId,
    // })

    return noContentResponse()
  } catch (error) {
    return errorResponse(error)
  }
}
