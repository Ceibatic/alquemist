import type { FastifyRequest, FastifyReply } from 'fastify'
import { lucia } from '../shared/auth/lucia'

/**
 * Authentication Middleware
 *
 * Validates session and attaches user to request context
 * Returns 401 if not authenticated
 */

// Extend Fastify request type to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      firstName: string | null
      lastName: string | null
      companyId: string
      roleId: string
      locale: string
      timezone: string
    }
    sessionId?: string
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Extract session ID from cookie
  const sessionId = request.cookies.alquemist_session

  if (!sessionId) {
    return reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'Sesión no encontrada. Por favor inicia sesión.'
    })
  }

  try {
    // Validate session with Lucia
    const { session, user } = await lucia.validateSession(sessionId)

    if (!session || !user) {
      return reply.status(401).send({
        error: 'INVALID_SESSION',
        message: 'Sesión inválida o expirada. Por favor inicia sesión nuevamente.'
      })
    }

    // Attach user and session to request
    request.user = user
    request.sessionId = sessionId

    // If session is fresh (less than half its lifetime remaining), extend it
    if (session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id)
      reply.header('Set-Cookie', sessionCookie.serialize())
    }
  } catch (error) {
    request.log.error(error, 'Error validating session')
    return reply.status(401).send({
      error: 'AUTHENTICATION_ERROR',
      message: 'Error al validar la sesión.'
    })
  }
}
