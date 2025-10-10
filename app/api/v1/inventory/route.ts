/**
 * /api/v1/inventory
 * Inventory management endpoints
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
import { createInventoryItemSchema } from '@/lib/validations/schemas'
import { api } from '@/convex/_generated/api'
import { fetchQuery, fetchMutation } from 'convex/nextjs'
import { Id } from '@/convex/_generated/dataModel'

/**
 * GET /api/v1/inventory
 * List inventory items
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

    const area_id = searchParams.get('area_id') as Id<'areas'> | undefined
    const product_id = searchParams.get('product_id') as Id<'products'> | undefined
    const lot_status = searchParams.get('lot_status') || undefined

    const result = await fetchQuery(api.inventory.list, {
      companyId: company._id,
      area_id,
      product_id,
      lot_status,
      limit,
      offset,
    })

    return paginatedResponse(result.items, {
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
 * POST /api/v1/inventory
 * Create inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const context = await authenticateRequest(request)
    requireOrganization(context)

    const body = await parseJsonBody(request)

    // Validate input
    const validation = createInventoryItemSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors)
    }

    const data = validation.data

    // Create inventory item in Convex
    const itemId = await fetchMutation(api.inventory.create, {
      product_id: data.product_id as Id<'products'>,
      area_id: data.area_id as Id<'areas'>,
      supplier_id: data.supplier_id as Id<'suppliers'> | undefined,
      quantity_available: data.quantity_available,
      quantity_unit: data.quantity_unit,
      batch_number: data.batch_number,
      received_date: data.received_date ? new Date(data.received_date).getTime() : undefined,
      expiration_date: data.expiration_date ? new Date(data.expiration_date).getTime() : undefined,
      lot_status: data.lot_status,
    })

    return createdResponse({
      id: itemId,
      product_id: data.product_id,
      quantity_available: data.quantity_available,
      lot_status: data.lot_status || 'available',
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    return errorResponse(error)
  }
}
