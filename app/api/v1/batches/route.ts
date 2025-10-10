/**
 * /api/v1/batches
 * Batch management endpoints
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
import { createBatchSchema } from '@/lib/validations/schemas'
import { api } from '@/convex/_generated/api'
import { fetchQuery, fetchMutation } from 'convex/nextjs'
import { Id } from '@/convex/_generated/dataModel'

/**
 * GET /api/v1/batches
 * List all batches for current company
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

    const facility_id = searchParams.get('facility_id') as Id<'facilities'> | undefined
    const area_id = searchParams.get('area_id') as Id<'areas'> | undefined
    const status = searchParams.get('status') || undefined

    const result = await fetchQuery(api.batches.list, {
      companyId: company._id,
      facility_id,
      area_id,
      status,
      limit,
      offset,
    })

    return paginatedResponse(result.batches, {
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
 * POST /api/v1/batches
 * Create a new batch
 */
export async function POST(request: NextRequest) {
  try {
    const context = await authenticateRequest(request)
    requireOrganization(context)

    const body = await parseJsonBody(request)

    // Validate input
    const validation = createBatchSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors)
    }

    const data = validation.data

    // Create batch in Convex
    const result = await fetchMutation(api.batches.create, {
      facility_id: data.facility_id as Id<'facilities'>,
      area_id: data.area_id as Id<'areas'>,
      crop_type_id: data.crop_type_id as Id<'crop_types'>,
      cultivar_id: data.cultivar_id as Id<'cultivars'> | undefined,
      batch_type: data.batch_type,
      tracking_level: data.tracking_level,
      planned_quantity: data.planned_quantity,
      current_quantity: data.current_quantity,
      initial_quantity: data.initial_quantity,
      unit_of_measure: data.unit_of_measure,
      status: data.status,
      notes: data.notes,
    })

    return createdResponse({
      id: result.id,
      qr_code: result.qr_code,
      planned_quantity: data.planned_quantity,
      status: data.status || 'active',
      created_date: new Date().toISOString(),
    })
  } catch (error) {
    return errorResponse(error)
  }
}
