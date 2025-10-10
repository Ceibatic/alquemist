/**
 * /api/v1/facilities
 * Facility management endpoints
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
} from '@/lib/api/middleware'
import { createFacilitySchema } from '@/lib/validations/schemas'
import { api } from '@/convex/_generated/api'
import { fetchQuery, fetchMutation } from 'convex/nextjs'

/**
 * GET /api/v1/facilities
 * List all facilities for current company
 */
export async function GET(request: NextRequest) {
  try {
    const context = await authenticateRequest(request)
    requireOrganization(context)

    const { page, limit, offset } = getPaginationParams(request)

    // Get company first to get the Convex company ID
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

    // Query facilities from Convex using company._id
    const searchParams = new URL(request.url).searchParams
    const status = searchParams.get('status') || undefined

    const result = await fetchQuery(api.facilities.list, {
      companyId: company._id,
      status,
      limit,
      offset,
    })

    return paginatedResponse(result.facilities, {
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
 * POST /api/v1/facilities
 * Create a new facility
 */
export async function POST(request: NextRequest) {
  try {
    const context = await authenticateRequest(request)
    requireOrganization(context)

    const body = await parseJsonBody(request)

    // Validate input
    const validation = createFacilitySchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors)
    }

    const data = validation.data

    // Get company first to get the Convex company ID
    const company = await fetchQuery(api.companies.getByOrganizationId, {
      organizationId: context.organizationId,
    })

    if (!company) {
      throw new Error('Company not found. Please create a company first.')
    }

    // Create facility in Convex
    const facilityId = await fetchMutation(api.facilities.create, {
      company_id: company._id,
      name: data.name,
      license_number: data.license_number,
      license_type: data.license_type,
      license_authority: data.license_authority,
      facility_type: data.facility_type,
      address: data.address,
      city: data.city,
      administrative_division_1: data.administrative_division_1,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude_meters: data.altitude_meters,
      total_area_m2: data.total_area_m2,
      status: data.status || 'active',
    })

    return createdResponse({
      id: facilityId,
      name: data.name,
      license_number: data.license_number,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    return errorResponse(error)
  }
}
