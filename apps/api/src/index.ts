import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import { authRoutes } from './routes/auth'

const fastify = Fastify({
  logger: true
})

// Register plugins
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
})

fastify.register(cookie, {
  secret: process.env.COOKIE_SECRET || 'alquemist-dev-secret-change-in-production',
  parseOptions: {}
})

// Health check route
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' })

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8000', 10)
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Alquemist API running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
