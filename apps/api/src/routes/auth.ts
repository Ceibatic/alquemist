import type { FastifyInstance } from 'fastify'
import { authService } from '../domains/auth/AuthService'
import { RegisterSchema, LoginSchema } from '../domains/auth/validation'
import { requireAuth } from '../middleware/requireAuth'
import { lucia } from '../shared/auth/lucia'

/**
 * Authentication Routes
 *
 * Endpoints:
 * - POST /api/auth/register - Register new user with company
 * - POST /api/auth/login - Login user
 * - POST /api/auth/logout - Logout user
 * - GET /api/auth/me - Get current user
 */

export async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/auth/register
   * Register new user with integrated company creation
   */
  fastify.post('/register', async (request, reply) => {
    try {
      // Validate request body
      const data = RegisterSchema.parse(request.body)

      // Register user + company
      const result = await authService.register(data)

      // Set session cookie
      const sessionCookie = lucia.createSessionCookie(result.session.id)
      reply.header('Set-Cookie', sessionCookie.serialize())

      return reply.status(201).send({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            companyId: result.user.companyId,
            roleId: result.user.roleId,
            locale: result.user.locale,
            timezone: result.user.timezone,
            status: result.user.status,
            createdAt: result.user.createdAt
          },
          company: {
            id: result.company.id,
            name: result.company.name,
            businessEntityType: result.company.businessEntityType,
            colombianDepartment: result.company.colombianDepartment,
            defaultLocale: result.company.defaultLocale,
            defaultCurrency: result.company.defaultCurrency,
            defaultTimezone: result.company.defaultTimezone,
            subscriptionPlan: result.company.subscriptionPlan,
            status: result.company.status
          },
          role: {
            id: result.role.id,
            name: result.role.name,
            displayNameEs: result.role.displayNameEs,
            level: result.role.level
          }
        }
      })
    } catch (error: any) {
      request.log.error(error, 'Registration error')

      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return reply.status(409).send({
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'Este email ya está registrado. Por favor inicia sesión.'
        })
      }

      if (error.message === 'OWNER_ROLE_NOT_FOUND') {
        return reply.status(500).send({
          error: 'CONFIGURATION_ERROR',
          message: 'Error de configuración del sistema. Contacta al soporte.'
        })
      }

      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Datos de registro inválidos',
          details: error.errors
        })
      }

      return reply.status(500).send({
        error: 'REGISTRATION_ERROR',
        message: 'Error al registrar usuario. Intenta nuevamente.'
      })
    }
  })

  /**
   * POST /api/auth/login
   * Authenticate user with email and password
   */
  fastify.post('/login', async (request, reply) => {
    try {
      // Validate request body
      const data = LoginSchema.parse(request.body)

      // Login user
      const result = await authService.login(data)

      // Set session cookie
      const sessionCookie = lucia.createSessionCookie(result.session.id)
      reply.header('Set-Cookie', sessionCookie.serialize())

      return reply.status(200).send({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            companyId: result.user.companyId,
            roleId: result.user.roleId,
            locale: result.user.locale,
            timezone: result.user.timezone,
            status: result.user.status
          },
          company: {
            id: result.company.id,
            name: result.company.name,
            businessEntityType: result.company.businessEntityType,
            colombianDepartment: result.company.colombianDepartment,
            defaultLocale: result.company.defaultLocale,
            defaultCurrency: result.company.defaultCurrency,
            defaultTimezone: result.company.defaultTimezone,
            subscriptionPlan: result.company.subscriptionPlan,
            status: result.company.status
          },
          role: {
            id: result.role.id,
            name: result.role.name,
            displayNameEs: result.role.displayNameEs,
            level: result.role.level
          }
        }
      })
    } catch (error: any) {
      request.log.error(error, 'Login error')

      if (error.message === 'INVALID_CREDENTIALS') {
        return reply.status(400).send({
          error: 'INVALID_CREDENTIALS',
          message: 'Email o contraseña incorrectos.'
        })
      }

      if (error.message === 'ACCOUNT_INACTIVE') {
        return reply.status(403).send({
          error: 'ACCOUNT_INACTIVE',
          message: 'Tu cuenta está inactiva. Contacta al soporte.'
        })
      }

      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Datos de inicio de sesión inválidos',
          details: error.errors
        })
      }

      return reply.status(500).send({
        error: 'LOGIN_ERROR',
        message: 'Error al iniciar sesión. Intenta nuevamente.'
      })
    }
  })

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  fastify.get('/me', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      if (!request.sessionId) {
        return reply.status(401).send({
          error: 'UNAUTHORIZED',
          message: 'No autenticado'
        })
      }

      const result = await authService.getCurrentUser(request.sessionId)

      return reply.status(200).send({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            companyId: result.user.companyId,
            roleId: result.user.roleId,
            locale: result.user.locale,
            timezone: result.user.timezone,
            status: result.user.status,
            lastLogin: result.user.lastLogin
          },
          company: {
            id: result.company.id,
            name: result.company.name,
            businessEntityType: result.company.businessEntityType,
            colombianDepartment: result.company.colombianDepartment,
            defaultLocale: result.company.defaultLocale,
            defaultCurrency: result.company.defaultCurrency,
            defaultTimezone: result.company.defaultTimezone,
            subscriptionPlan: result.company.subscriptionPlan,
            status: result.company.status
          },
          role: {
            id: result.role.id,
            name: result.role.name,
            displayNameEs: result.role.displayNameEs,
            displayNameEn: result.role.displayNameEn,
            level: result.role.level,
            permissions: result.role.permissions
          }
        }
      })
    } catch (error: any) {
      request.log.error(error, 'Get current user error')

      if (error.message === 'INVALID_SESSION') {
        return reply.status(401).send({
          error: 'INVALID_SESSION',
          message: 'Sesión inválida o expirada.'
        })
      }

      return reply.status(500).send({
        error: 'SERVER_ERROR',
        message: 'Error al obtener datos del usuario.'
      })
    }
  })

  /**
   * POST /api/auth/logout
   * Logout user and destroy session
   */
  fastify.post('/logout', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      if (!request.sessionId) {
        return reply.status(401).send({
          error: 'UNAUTHORIZED',
          message: 'No autenticado'
        })
      }

      // Invalidate session
      await authService.logout(request.sessionId)

      // Clear session cookie
      const blankCookie = lucia.createBlankSessionCookie()
      reply.header('Set-Cookie', blankCookie.serialize())

      return reply.status(200).send({
        success: true,
        message: 'Sesión cerrada exitosamente'
      })
    } catch (error) {
      request.log.error(error, 'Logout error')

      return reply.status(500).send({
        error: 'LOGOUT_ERROR',
        message: 'Error al cerrar sesión.'
      })
    }
  })
}
