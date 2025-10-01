#!/bin/bash
set -e

echo "🔄 Resetting Alquemist development environment..."

# Confirm reset
read -p "⚠️  This will delete all data. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Reset cancelled"
    exit 0
fi

# Stop services
echo "🛑 Stopping Docker services..."
docker-compose -f docker/docker-compose.dev.yml down -v

# Clean Docker volumes
echo "🧹 Cleaning Docker volumes..."
docker volume rm $(docker volume ls -q | grep alquemist) 2>/dev/null || true

# Reset database
echo "🗄️ Resetting database..."
npx prisma migrate reset --force

# Restart setup
echo "🚀 Restarting setup..."
./scripts/setup-dev.sh

echo "✅ Development environment reset complete!"
