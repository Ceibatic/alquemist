# Alquemist

**Multi-Crop Agricultural Management Platform**

A modern SaaS platform for managing agricultural operations across Cannabis, Coffee, Cocoa, and Flowers with batch-first tracking, AI-powered features, and automated regulatory compliance.

## Overview

Alquemist provides comprehensive farm management with:

- **Batch-first tracking** - Scalable approach for large operations
- **AI-powered features** - Pest detection and automated form digitization
- **Regional compliance** - Configurable regulatory requirements (default: Colombia)
- **Real-time collaboration** - Multi-facility, multi-user support
- **Mobile-first PWA** - Offline-capable for rural operations
- **Multilingual** - Default Spanish with extensibility for other languages

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: Convex (serverless, real-time)
- **Auth**: Clerk (Organizations = Companies)
- **Deployment**: Vercel + Convex Cloud
- **i18n**: next-intl (multilingual support)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alquemist
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure Convex:
```bash
npx convex dev
```

4. Configure Clerk (see [CLAUDE.MD](CLAUDE.MD) for detailed setup)

5. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

- **[CLAUDE.MD](CLAUDE.MD)** - Development agent instructions and setup
- **[Product Requirements](docs/Product-Requirements.md)** - Feature specifications
- **[Technical Specification](docs/Technical-Specification.md)** - Architecture and patterns
- **[Database Schema](docs/Database-Schema.md)** - Data models and relationships
- **[Resumen Ejecutivo](docs/Resumen-Ejecutivo.md)** - Executive summary (Spanish)

## Project Structure

```
alquemist/
├── app/                    # Next.js app directory
├── convex/                 # Convex backend functions and schema
├── components/             # React components
├── lib/                    # Utilities and helpers
├── docs/                   # Project documentation
└── public/                 # Static assets
```

## Development

### Running Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Deployment

The application is deployed automatically via Vercel when pushing to the main branch. Convex schema is deployed via `npx convex deploy --prod`.

See [CLAUDE.MD](CLAUDE.MD) for detailed CI/CD setup.

## Features

- Multi-tenant company management
- Batch and individual plant tracking
- Production templates and workflows
- Quality control with AI-powered pest detection
- Inventory management with automated consumption
- Compliance monitoring and reporting
- Real-time analytics and dashboards
- Mobile PWA with offline capability
- RESTful API for integrations

## Regional Configuration

The platform is designed to support multiple regions with Colombia as the default configuration:

- Administrative divisions (departments, municipalities)
- Regional business entity types
- Local payment methods
- Multi-currency support
- Regulatory compliance frameworks
- Regional pest/disease databases

## Contributing

See [CLAUDE.MD](CLAUDE.MD) for development workflow and contribution guidelines.

## License

Proprietary - All rights reserved

## Support

For technical documentation and development assistance, refer to [CLAUDE.MD](CLAUDE.MD).
