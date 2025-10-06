/**
 * Database Helper Functions
 *
 * Utilities for multi-tenant isolation and common database operations
 */

/**
 * Creates a tenant isolation filter for Prisma queries
 * Use this to ensure all queries are scoped to a specific company
 *
 * @param companyId - The company ID to filter by
 * @returns Prisma where clause for tenant isolation
 *
 * @example
 * const facilities = await prisma.facility.findMany({
 *   where: withTenant(user.companyId)
 * })
 */
export function withTenant(companyId: string): { companyId: string } {
  return { companyId }
}

/**
 * Soft delete helper - updates status to 'inactive' instead of deleting
 *
 * @param model - The Prisma model to update
 * @param id - The ID of the record to soft delete
 * @param tx - Optional transaction client
 *
 * @example
 * await softDelete(prisma.user, userId)
 */
export async function softDelete(
  model: any,
  id: string,
  tx?: any
): Promise<void> {
  const client = tx || model
  await client.update({
    where: { id },
    data: { status: 'inactive' }
  })
}

/**
 * Type-safe tenant query builder
 * Extends where clause with mandatory companyId
 */
export type TenantWhere<T> = T & { companyId: string }

/**
 * Creates a combined where clause with tenant isolation
 *
 * @param companyId - The company ID for tenant isolation
 * @param where - Additional where conditions
 * @returns Combined where clause
 *
 * @example
 * const areas = await prisma.area.findMany({
 *   where: tenantWhere(companyId, { status: 'active' })
 * })
 */
export function tenantWhere<T extends Record<string, any>>(
  companyId: string,
  where?: T
): TenantWhere<T> {
  return {
    ...where,
    companyId
  } as TenantWhere<T>
}
