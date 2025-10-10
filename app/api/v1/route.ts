/**
 * GET /api/v1
 * API root - health check and version info
 */

import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  return successResponse({
    name: 'Alquemist API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      auth: '/api/v1/auth',
      companies: '/api/v1/companies',
      facilities: '/api/v1/facilities',
      batches: '/api/v1/batches',
      activities: '/api/v1/activities',
      compliance: '/api/v1/compliance',
      inventory: '/api/v1/inventory',
    },
    documentation: '/api/v1/docs',
  })
}
