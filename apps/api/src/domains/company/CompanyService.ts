import { prisma } from '../../shared/db/prisma'
import type { Company } from '@alquemist/database'

/**
 * Company Service
 *
 * Handles company CRUD operations
 */

export interface CreateCompanyData {
  name: string
  businessEntityType: string
  department: string
  municipality?: string
}

export class CompanyService {
  /**
   * Create a new company with Colombian defaults
   */
  async createCompany(data: CreateCompanyData): Promise<Company> {
    return await prisma.company.create({
      data: {
        name: data.name,
        companyType: 'cultivation', // Default for Alquemist
        businessEntityType: data.businessEntityType,
        colombianDepartment: data.department,
        daneMunicipalityCode: data.municipality,

        // Colombian defaults
        defaultLocale: 'es',
        defaultCurrency: 'COP',
        defaultTimezone: 'America/Bogota',
        country: 'Colombia',

        // Subscription defaults (no payment yet)
        subscriptionPlan: 'basic',
        maxFacilities: 3,
        maxUsers: 10,

        status: 'active'
      }
    })
  }

  /**
   * Find company by ID
   */
  async findById(id: string): Promise<Company | null> {
    return await prisma.company.findUnique({
      where: { id }
    })
  }

  /**
   * Find company by ID with relations
   */
  async findByIdWithRelations(id: string) {
    return await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true
          }
        }
      }
    })
  }
}

// Export singleton instance
export const companyService = new CompanyService()
