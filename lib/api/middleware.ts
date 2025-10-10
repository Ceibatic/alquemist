/**
 * API Middleware
 * Authentication, validation, and request processing utilities
 */

import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UnauthorizedError, ForbiddenError } from './errors'

export interface AuthenticatedContext {
  userId: string
  organizationId: string | null
  sessionId: string
}

/**
 * Authenticate API request using Clerk
 * Throws UnauthorizedError if not authenticated
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedContext> {
  const { userId, sessionId, orgId } = await auth()

  if (!userId || !sessionId) {
    throw new UnauthorizedError('Authentication required')
  }

  return {
    userId,
    sessionId,
    organizationId: orgId || null,
  }
}

/**
 * Require organization membership
 * Throws ForbiddenError if user is not part of an organization
 */
export function requireOrganization(
  context: AuthenticatedContext
): asserts context is AuthenticatedContext & { organizationId: string } {
  if (!context.organizationId) {
    throw new ForbiddenError('Organization membership required')
  }
}

/**
 * Parse JSON body with error handling
 */
export async function parseJsonBody<T = unknown>(
  request: NextRequest
): Promise<T> {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON body')
  }
}

/**
 * Parse query parameters
 */
export function parseQueryParams(request: NextRequest): URLSearchParams {
  return new URL(request.url).searchParams
}

/**
 * Get pagination parameters from query
 */
export function getPaginationParams(request: NextRequest) {
  const searchParams = parseQueryParams(request)

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') || '50', 10))
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * CORS headers for API responses
 */
export function getCorsHeaders(origin?: string): HeadersInit {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  const shouldAllowOrigin = origin && allowedOrigins.includes(origin)

  return {
    'Access-Control-Allow-Origin': shouldAllowOrigin ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsPreFlight(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}
