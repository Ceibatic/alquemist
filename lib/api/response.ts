/**
 * Standardized API Response Utilities
 * Consistent response format for all API endpoints
 */

import { NextResponse } from 'next/server'
import { ApiError, isApiError, toApiError } from './errors'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId?: string
  }
}

/**
 * Success response with data
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }

  return NextResponse.json(response, { status })
}

/**
 * Created response (201)
 */
export function createdResponse<T>(
  data: T,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201, meta)
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Error response
 */
export function errorResponse(
  error: unknown,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse> {
  const apiError = toApiError(error)

  const response: ApiResponse = {
    success: false,
    error: {
      code: apiError.code || 'UNKNOWN_ERROR',
      message: apiError.message,
      details: apiError.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }

  return NextResponse.json(response, { status: apiError.statusCode })
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string[]> | string,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: typeof errors === 'string' ? errors : 'Validation failed',
      details: typeof errors === 'object' ? errors : undefined,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }

  return NextResponse.json(response, { status: 422 })
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
): NextResponse<ApiResponse<T[]>> {
  return successResponse(data, 200, {
    pagination,
  })
}
