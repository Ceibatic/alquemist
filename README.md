# 🌱 Alquemist v4.0

**Multi-Crop Agriculture Platform for Colombian Operations**

A comprehensive batch-first tracking system for Colombian agricultural operations, designed for cannabis, coffee, cacao, and specialty flowers with full regulatory compliance.

[![CI](https://github.com/ceibatic/alquemist/workflows/CI/badge.svg)](https://github.com/ceibatic/alquemist/actions)
[![License](https://img.shields.io/badge/license-PROPRIETARY-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)

---

## 🚀 **Features**

- 🌿 **Multi-Crop Support** - Cannabis, Coffee, Cacao, Flowers
- 📦 **Batch-First Tracking** - Optimized for Colombian operations
- 🏷️ **QR Code System** - Comprehensive tracking from seed to sale
- 🇨🇴 **Colombian Compliance** - Full regulatory integration (INVIMA, ICA, DANE)
- 🤖 **AI-Powered** - Pest detection, quality analysis, and recommendations
- 🌍 **Bilingual** - Spanish/English with Colombian localization
- 📊 **Production Templates** - Pre-configured workflows for each crop
- 🔐 **Role-Based Access** - Company-level, facility-level, and area-level permissions

---

## 📋 **Quick Start**

### **Prerequisites**

- Node.js ≥ 20.0.0
- Docker & Docker Compose
- npm ≥ 10.0.0

### **Installation**

```bash
# Clone the repository
git clone https://github.com/ceibatic/alquemist.git
cd alquemist

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start Docker services
npm run docker:up

# Wait for services to be ready (10 seconds)
sleep 10

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development
npm run dev
```

**Access the application:**
- 🌐 Web App: http://localhost:3000
- 🔌 API: http://localhost:8000
- 📊 Prisma Studio: `npm run db:studio`
- 📦 MinIO Console: http://localhost:9001
- 📧 Mailhog: http://localhost:8025

---

## 🏗️ **Project Structure**

```
alquemist/
├── apps/
│   ├── web/                 # Next.js frontend application
│   └── api/                 # Fastify backend API
├── packages/
│   ├── database/            # Prisma schema + utilities
│   ├── types/               # Shared TypeScript types
│   └── ui/                  # Shared UI components
├── docker/                  # Docker services configuration
├── scripts/                 # Setup & utility scripts
├── tests/                   # Test configuration
└── docs/                    # Documentation
```

---

## 🧪 **Development**

### **Available Scripts**

```bash
# Development
npm run dev              # Start all apps in dev mode
npm run build            # Build all packages and apps
npm run test             # Run all tests
npm run lint             # Lint all code
npm run type-check       # TypeScript type checking

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed with Colombian data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (WARNING)

# Docker
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:logs      # View service logs

# Code Quality
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### **Tech Stack**

- **Frontend**: Next.js 14, React 18, TailwindCSS, Zustand
- **Backend**: Fastify, Lucia (auth), Zod
- **Database**: PostgreSQL 15, Prisma ORM
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Email**: Mailhog (dev), SMTP (prod)
- **Testing**: Vitest, Playwright
- **CI/CD**: GitHub Actions
- **Monorepo**: Turborepo

---

## 🗄️ **Database Schema**

26 tables designed for Colombian agricultural operations:

- **Core System**: Company, User, Role
- **Crop Configuration**: CropType, Cultivar
- **Facilities**: Facility, Area
- **Supply Chain**: Supplier, Product, InventoryItem
- **Production**: ProductionOrder, ProductionTemplate, Recipe
- **Tracking**: Batch, Plant, MotherPlant, Activity
- **Quality**: QualityCheckTemplate, PestDisease, PestDiseaseRecord
- **Compliance**: ComplianceEvent, Certificate, MediaFile

---

## 🇨🇴 **Colombian Features**

### **Localization**
- Timezone: America/Bogota
- Currency: COP (Colombian Peso)
- Language: Spanish (primary), English (secondary)
- Date format: DD/MM/YYYY

### **Compliance**
- DANE municipality codes
- NIT validation
- ICA registration tracking
- INVIMA integration
- Phytosanitary certificates
- Transport manifests

### **Sample Data**
- Company: Cultivos del Valle Verde S.A.S (Sibundoy, Putumayo)
- Crops: Cannabis (psicoactivo) + Coffee (orgánico)
- 4 Users with Colombian roles
- 57 Colombian pest/disease species
- Colombian suppliers and products

---

## 🔐 **Default Credentials**

**Development Environment:**
- Owner: `carlos@cultivosvalleverde.com` / `AlquemistDev2025!`
- Manager: `maria@cultivosvalleverde.com` / `AlquemistDev2025!`
- Technician: `juan@cultivosvalleverde.com` / `AlquemistDev2025!`

⚠️ **Change these in production!**

---

## 📖 **Documentation**

- [Development Setup Guide](docs/Development%20Setup%20Guide%20v4.0.md)
- [GitHub Setup & CI/CD](docs/GITHUB_SETUP.md)
- [Database Schema](docs/Alquemist%20-%20Database%20Schema%20&%20Colombian%20Seeds%20v4.0.md)
- [Engineering PRD](docs/Engineering%20PRD%20-%20Alquemist%20v4.1.md)
- [Product PRD](docs/Product%20PRD%20-%20Alquemist%20v4.1.md)

---

## 🤝 **Contributing**

This is a private repository. Please follow the development workflow:

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm run test`
3. Commit: `git commit -m "feat: add feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request on GitHub

See [GITHUB_SETUP.md](docs/GITHUB_SETUP.md) for detailed workflow.

---

## 🐛 **Known Issues**

- None at this time

---

## 📝 **License**

PROPRIETARY - All Rights Reserved

Copyright (c) 2025 Ceibatic

---

## 📞 **Support**

For issues and questions:
- Create an issue on GitHub
- Contact: support@ceibatic.com

---

**Built with ❤️ in Colombia 🇨🇴**
