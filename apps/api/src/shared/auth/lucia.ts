import { Lucia } from 'lucia'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { prisma } from '../db/prisma'

/**
 * Lucia Authentication Configuration
 *
 * Session-based authentication for Alquemist using Lucia v3
 * with Prisma adapter for PostgreSQL session storage
 */

// Create Prisma adapter for session and user tables
const adapter = new PrismaAdapter(prisma.session, prisma.user)

// Initialize Lucia with configuration
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'alquemist_session',
    expires: false, // Session cookies (30 days idle timeout with refresh)
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
      companyId: attributes.companyId,
      roleId: attributes.roleId,
      locale: attributes.locale,
      timezone: attributes.timezone
    }
  }
})

// Type augmentation for Lucia
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

// User attributes from database
interface DatabaseUserAttributes {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  companyId: string
  roleId: string
  locale: string
  timezone: string
}
