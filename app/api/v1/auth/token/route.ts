/**
 * POST /api/v1/auth/token
 * Generate API token for external clients (e.g., Bubble)
 *
 * This endpoint allows Bubble or other clients to exchange Clerk session
 * token for API access. Bubble will call this endpoint after user authentication.
 */

import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { UnauthorizedError } from '@/lib/api/errors'

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, orgId, getToken } = await auth()

    if (!userId || !sessionId) {
      throw new UnauthorizedError('Authentication required')
    }

    // Get JWT token from Clerk
    // This token can be used by Bubble to make authenticated API requests
    const token = await getToken({ template: 'convex' })

    if (!token) {
      throw new UnauthorizedError('Failed to generate token')
    }

    return successResponse({
      token,
      userId,
      organizationId: orgId || null,
      sessionId,
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer',
    })
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * GET /api/v1/auth/token
 * Verify current token
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, sessionId, orgId } = await auth()

    if (!userId || !sessionId) {
      throw new UnauthorizedError('Invalid or expired token')
    }

    return successResponse({
      valid: true,
      userId,
      organizationId: orgId || null,
      sessionId,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
