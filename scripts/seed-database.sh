#!/bin/bash
set -e

echo "🌱 Seeding Alquemist database with Colombian sample data..."

# Run Prisma seed
npx prisma db seed

echo "✅ Database seeded with:"
echo "   • Company: Cultivos del Valle Verde S.A.S"
echo "   • Users: 4 Colombian users (Carlos, María, Juan, Sofía)"
echo "   • Facilities: Centro de Cultivo Valle Verde (Putumayo)"
echo "   • Crop Types: Cannabis + Coffee with Colombian compliance"
echo "   • Areas: 7 specialized cultivation areas"
echo "   • Suppliers: 4 Colombian agricultural suppliers"
echo "   • Products: 12 essential products with COP pricing"
echo "   • Cultivars: White Widow (Cannabis) + Castillo (Coffee)"
echo "   • Templates: 2 production templates (47 automated activities)"
echo "   • Pests/Diseases: 57 Colombian species with AI training data"
echo ""
echo "🔐 Login credentials:"
echo "   Owner: carlos@cultivosvalleverde.com / password: AlquemistDev2025!"
echo "   Manager: maria@cultivosvalleverde.com / password: AlquemistDev2025!"
echo ""
