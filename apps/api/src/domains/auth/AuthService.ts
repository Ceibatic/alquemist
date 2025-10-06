import { lucia } from '../../shared/auth/lucia'
import { prisma } from '../../shared/db/prisma'
import { userService } from '../user/UserService'
import { companyService } from '../company/CompanyService'
import type { RegisterInput, LoginInput } from './validation'

/**
 * Authentication Service
 *
 * Orchestrates user registration, login, logout, and session management
 */

export interface RegisterResult {
  user: any
  company: any
  role: any
  session: any
}

export interface LoginResult {
  user: any
  company: any
  role: any
  session: any
}

export class AuthService {
  /**
   * Register a new user with company creation
   * Creates User + Company in a transaction and assigns Owner role
   */
  async register(data: RegisterInput): Promise<RegisterResult> {
    // Check if email already exists
    const existingUser = await userService.findByEmail(data.email)
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    // Execute registration in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          companyType: 'cultivation',
          businessEntityType: data.businessEntityType,
          colombianDepartment: data.department,
          daneMunicipalityCode: data.municipality,
          defaultLocale: 'es',
          defaultCurrency: 'COP',
          defaultTimezone: 'America/Bogota',
          country: 'Colombia',
          subscriptionPlan: 'basic',
          maxFacilities: 3,
          maxUsers: 10,
          status: 'active'
        }
      })

      // Get Owner role from seed data (COMPANY_OWNER or company_owner)
      const ownerRole = await tx.role.findFirst({
        where: {
          OR: [
            { name: 'COMPANY_OWNER' },
            { name: 'company_owner' }
          ]
        }
      })

      if (!ownerRole) {
        throw new Error('OWNER_ROLE_NOT_FOUND')
      }

      // Hash password
      const passwordHash = await userService.hashPassword(data.password)

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          companyId: company.id,
          roleId: ownerRole.id,
          locale: 'es',
          timezone: 'America/Bogota',
          status: 'active',
          emailVerified: false
        }
      })

      return { user, company, role: ownerRole }
    })

    // Create Lucia session
    const session = await lucia.createSession(result.user.id, {})

    // Update last login
    await userService.updateLastLogin(result.user.id)

    return {
      user: result.user,
      company: result.company,
      role: result.role,
      session
    }
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginInput): Promise<LoginResult> {
    // Find user by email
    const user = await userService.findByEmail(data.email)
    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // Check if account is active
    if (user.status !== 'active') {
      throw new Error('ACCOUNT_INACTIVE')
    }

    // Verify password
    const isValidPassword = await userService.verifyPassword(
      user.passwordHash,
      data.password
    )

    if (!isValidPassword) {
      await userService.incrementFailedLoginAttempts(user.id)
      throw new Error('INVALID_CREDENTIALS')
    }

    // Get company and role
    const company = await companyService.findById(user.companyId)
    if (!company) {
      throw new Error('COMPANY_NOT_FOUND')
    }

    const role = await prisma.role.findUnique({
      where: { id: user.roleId }
    })
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }

    // Create Lucia session
    const session = await lucia.createSession(user.id, {})

    // Update last login
    await userService.updateLastLogin(user.id)

    return {
      user,
      company,
      role,
      session
    }
  }

  /**
   * Logout user by invalidating session
   */
  async logout(sessionId: string): Promise<void> {
    await lucia.invalidateSession(sessionId)
  }

  /**
   * Get current user from session
   */
  async getCurrentUser(sessionId: string) {
    const { session, user: sessionUser } = await lucia.validateSession(sessionId)

    if (!session || !sessionUser) {
      throw new Error('INVALID_SESSION')
    }

    // Get full user data with relations
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        company: true,
        role: true
      }
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    return {
      user,
      company: user.company,
      role: user.role
    }
  }

  /**
   * Validate session and return user
   */
  async validateSession(sessionId: string) {
    return await lucia.validateSession(sessionId)
  }
}

// Export singleton instance
export const authService = new AuthService()
