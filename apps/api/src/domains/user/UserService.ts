import { hash, verify } from 'argon2'
import { prisma } from '../../shared/db/prisma'
import type { User } from '@alquemist/database'

/**
 * User Service
 *
 * Handles user CRUD operations and password management
 */

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  companyId: string
  roleId: string
  locale?: string
  timezone?: string
}

export class UserService {
  /**
   * Hash password using Argon2id
   */
  async hashPassword(password: string): Promise<string> {
    return await hash(password, {
      type: 2, // Argon2id (recommended for password hashing)
      memoryCost: 19456, // 19 MiB
      timeCost: 2,
      parallelism: 1
    })
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
    try {
      return await verify(hashedPassword, password)
    } catch (error) {
      // If verification fails (e.g., invalid hash format), return false
      return false
    }
  }

  /**
   * Create a new user with hashed password
   */
  async createUser(data: CreateUserData): Promise<User> {
    const passwordHash = await this.hashPassword(data.password)

    return await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        companyId: data.companyId,
        roleId: data.roleId,
        locale: data.locale || 'es',
        timezone: data.timezone || 'America/Bogota',
        status: 'active',
        emailVerified: false
      }
    })
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })
  }

  /**
   * Find user by ID with relations
   */
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        role: true
      }
    })
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email)
    return user !== null
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
        failedLoginAttempts: 0
      }
    })
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: {
          increment: 1
        }
      }
    })
  }
}

// Export singleton instance
export const userService = new UserService()
