/**
 * GET /api/v1/auth/session
 * Get current session information
 */

import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionId, orgId } = await auth()

    if (!userId || !sessionId) {
      return errorResponse(new Error('Not authenticated'), { statusCode: 401 })
    }

    const user = await currentUser()

    return successResponse({
      userId,
      sessionId,
      organizationId: orgId || null,
      user: {
        id: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
