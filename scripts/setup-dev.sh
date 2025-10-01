#!/bin/bash
set -e

echo "🚀 Setting up Alquemist Development Environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ LTS"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_status "Prerequisites check passed"

# Setup environment
echo "🔧 Setting up environment..."

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    print_status "Created .env.local from template"
else
    print_warning ".env.local already exists, skipping"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
print_status "Dependencies installed"

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose -f docker/docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec alquemist-db pg_isready -U alquemist; do
    sleep 2
done
print_status "PostgreSQL is ready"

# Setup database
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push
print_status "Database schema created"

# Seed with Colombian data
echo "🌱 Seeding database with Colombian sample data..."
npm run db:seed
print_status "Database seeded successfully"

# Setup MinIO buckets
echo "📁 Setting up MinIO buckets..."
npm run setup:minio
print_status "MinIO buckets created"

# Final status
echo ""
echo "🎉 Alquemist development environment is ready!"
echo ""
echo "📊 Services Status:"
echo "   • Database: http://localhost:5432"
echo "   • Redis: localhost:6379"
echo "   • MinIO: http://localhost:9001 (admin/password: alquemist/alquemist_minio_2025)"
echo "   • Email: http://localhost:8025"
echo ""
echo "🚀 Start developing:"
echo "   npm run dev"
echo ""
echo "📚 Useful commands:"
echo "   npm run db:studio     # Open Prisma Studio"
echo "   npm run db:reset      # Reset database"
echo "   npm run docker:logs   # View Docker logs"
echo "   npm run test          # Run tests"
echo ""
