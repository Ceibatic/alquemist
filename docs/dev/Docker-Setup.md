# Docker Setup Guide

This guide explains how to containerize and run Alquemist using Docker.

## Prerequisites

- Docker 20.10+ installed
- Docker Compose v2.0+ installed
- Access to Convex deployment URL
- (Optional) Resend API key for email functionality

## Quick Start

### Production Build

```bash
# Build and run with docker-compose
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### Development with Hot-Reload

```bash
# Start development container with hot-reload
docker-compose -f docker-compose.dev.yml up --build

# In detached mode
docker-compose -f docker-compose.dev.yml up --build -d
```

## Configuration

### Environment Variables

Create a `.env` file in the project root (or use `.env.local` for development):

```env
# Required - Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Alquemist
NEXT_PUBLIC_APP_VERSION=1.0.0

# Optional - Email Service (for production)
RESEND_API_KEY=your_resend_api_key
```

### Build Arguments

For production builds, you can pass build arguments:

```bash
docker build \
  --build-arg NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud \
  --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -t alquemist:latest .
```

## Docker Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production build (optimized, ~150MB) |
| `Dockerfile.dev` | Development build with hot-reload |
| `docker-compose.yml` | Production orchestration |
| `docker-compose.dev.yml` | Development orchestration with volumes |
| `.dockerignore` | Files excluded from Docker context |

## Architecture

### Production Image (Multi-Stage)

1. **deps**: Install npm dependencies
2. **builder**: Build Next.js application with standalone output
3. **runner**: Minimal production image with only necessary files

The production image:
- Uses Node.js 20 Alpine (~150MB total)
- Runs as non-root user (`nextjs`)
- Includes health checks
- Exposes port 3000

### Development Container

- Full source code mounted as volume
- Hot-reload enabled via `WATCHPACK_POLLING`
- node_modules preserved in container (not mounted from host)
- All environment variables loaded from `.env.local`

## Commands Reference

### Build Commands

```bash
# Build production image
docker build -t alquemist:latest .

# Build development image
docker build -f Dockerfile.dev -t alquemist:dev .

# Build with specific Convex URL
docker build \
  --build-arg NEXT_PUBLIC_CONVEX_URL=https://your-app.convex.cloud \
  -t alquemist:latest .
```

### Run Commands

```bash
# Run production container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CONVEX_URL=https://your-app.convex.cloud \
  alquemist:latest

# Run with environment file
docker run -p 3000:3000 --env-file .env.local alquemist:latest
```

### Docker Compose Commands

```bash
# Start production
docker-compose up -d

# Start development
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down

# Rebuild and start
docker-compose up --build

# Remove volumes and containers
docker-compose down -v
```

### Maintenance Commands

```bash
# View running containers
docker ps

# Check container health
docker inspect --format='{{.State.Health.Status}}' alquemist-app

# Execute command in container
docker exec -it alquemist-app sh

# View container logs
docker logs alquemist-app -f
```

## Deployment

### With Convex Cloud

Since Alquemist uses Convex as its backend, the Docker container only runs the Next.js frontend. Ensure:

1. Your Convex deployment is accessible
2. `NEXT_PUBLIC_CONVEX_URL` points to your Convex deployment
3. CORS is configured in Convex for your domain

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `NEXT_PUBLIC_CONVEX_URL` for production Convex
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Configure `RESEND_API_KEY` for email functionality
- [ ] Review health check endpoints
- [ ] Set up reverse proxy (nginx/traefik) for HTTPS

## Troubleshooting

### Common Issues

**Container exits immediately:**
```bash
# Check logs
docker logs alquemist-app

# Verify environment variables are set
docker exec alquemist-app env | grep NEXT_PUBLIC
```

**Hot-reload not working in development:**
```bash
# Ensure WATCHPACK_POLLING is set
# Try rebuilding the dev container
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

**Build fails with memory issues:**
```bash
# Increase Docker memory limit or use:
NODE_OPTIONS="--max-old-space-size=4096" docker build -t alquemist:latest .
```

**Permission issues:**
```bash
# The production container runs as non-root user (nextjs)
# Ensure mounted volumes have correct permissions
```

## CI/CD Integration

Example GitHub Actions step for Docker builds:

```yaml
- name: Build Docker Image
  run: |
    docker build \
      --build-arg NEXT_PUBLIC_CONVEX_URL=${{ secrets.CONVEX_URL }} \
      --build-arg NEXT_PUBLIC_APP_URL=${{ vars.APP_URL }} \
      -t alquemist:${{ github.sha }} .

- name: Push to Registry
  run: |
    docker tag alquemist:${{ github.sha }} your-registry/alquemist:latest
    docker push your-registry/alquemist:latest
```
