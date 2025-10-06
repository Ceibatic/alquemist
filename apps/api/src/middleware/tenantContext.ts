import type { FastifyRequest, FastifyReply } from 'fastify'

/**
 * Tenant Context Middleware
 *
 * Extracts companyId from authenticated user and attaches to request
 * Ensures multi-tenant isolation on all queries
 *
 * NOTE: This middleware must be used AFTER requireAuth middleware
 */

// Extend Fastify request type to include tenant context
declare module 'fastify' {
  interface FastifyRequest {
    tenantId?: string
  }
}

export async function tenantContext(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Ensure user is authenticated (set by requireAuth middleware)
  if (!request.user) {
    return reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'Usuario no autenticado'
    })
  }

  // Extract companyId from user
  const { companyId } = request.user

  if (!companyId) {
    return reply.status(403).send({
      error: 'MISSING_TENANT',
      message: 'Usuario no tiene empresa asignada'
    })
  }

  // Attach tenantId to request context
  request.tenantId = companyId

  request.log.debug({ tenantId: companyId }, 'Tenant context set')
}
