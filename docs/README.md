# Alquemist Documentation

**Version 1.0 - Core Reference Documents**

---

## Quick Start

For a new greenfield implementation of Alquemist, start with these **3 core documents**:

### 1. [Product-Requirements.md](Product-Requirements.md)
**What to build** - Complete feature specifications

- 17 modules across 3 phases
- Regional requirements (default: Colombia)
- User stories and success metrics
- Module dependency map
- Compliance cross-reference (configurable by region)

**Size**: 27KB | **Read time**: 30 minutes

---

### 2. [Technical-Specification.md](Technical-Specification.md)
**How to build** - Architecture and implementation guide

- Recommended tech stack (Next.js + Serverless)
- System architecture patterns
- Authentication & authorization
- Key implementation patterns
- Deployment strategy
- Regional compliance implementation

**Size**: 21KB | **Read time**: 20 minutes

---

### 3. [Database-Schema.md](Database-Schema.md)
**Data structure** - Complete database schema (technology-agnostic)

- 26 tables organized in 8 functional groups
- All fields with types and descriptions
- Relationships and indexes
- Regional fields documented (default: Colombia)
- Batch-first tracking philosophy
- Implementation notes

**Size**: 54KB | **Read time**: 45 minutes

---

## Document Philosophy

These v1.0 documents represent the **definitive, complete specification** for Alquemist:

- **Single source of truth** - No versioning needed, these are final
- **Technology-agnostic** - Can implement with any modern stack
- **Regional design** - Default configuration for Colombia, extensible to other regions
- **Production-ready** - Complete enough to start building immediately

---

## Version History

### Version 1.0 (January 2025)
- Renamed and simplified from previous versioned documents
- Product PRD: Consolidated from v4.1 (removed redundant context)
- Technical Spec: Streamlined from v6.0 Engineering PRD (56% reduction), removed all "OR" alternatives
- Database Schema: Created technology-agnostic version from v4.0 Prisma schema
- Added CLAUDE.MD: Ultra-efficient context engineering agent (~1500 tokens)
- Added Agentic-Dev-System-Simple.md: Simplified workflow guide (75% reduction vs complex version)
- Archived all previous versioned documents

### Previous Versions (Archived)
Old versioned documents moved to `archive/` directory:
- `Product PRD - Alquemist v4.1.md`
- `Engineering PRD - Alquemist v6.0.md`
- `Alquemist - Database Schema & Colombian Seeds v4.0.md`

---

## Quick Reference

### Core Features
- **Multi-tenant**: Company-based isolation with RBAC
- **Multi-crop**: Cannabis, Coffee, Cocoa, Flowers
- **Batch-first tracking**: 50-1000 plants per batch (optional individual)
- **Regional compliance**: Configurable by region (e.g., INVIMA, ICA, FNC in Colombia)
- **AI-powered**: Pest detection, quality checks, form digitization
- **Mobile-first**: PWA with offline capability, QR scanning

### Technology Stack (Final Decision)

**Complete Stack:**
- Frontend: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Database: Convex (serverless, real-time)
- Auth: Clerk (Organizations, RBAC)
- Deployment: Vercel + Convex Cloud
- Cost: Starts FREE, scales to $20-70/month

**Regional Configuration (Colombia Default):**
- Multilingual (default locale: "es")
- Configurable timezone (default: America/Bogota)
- Multi-currency support (default: COP with formatting $290.000)
- Regional administrative codes (e.g., DANE in Colombia)
- Configurable coordinate systems (e.g., MAGNA-SIRGAS in Colombia)

---

## Development Workflow

### Agentic Development System (Simplified)

**Quick Start with CLAUDE.MD:**
```bash
@state current           # Check current project state
@implement module-1      # Load context and implement MODULE 1
@review                  # Review implementation against requirements
@pr create module-1      # Generate comprehensive PR
```

**3-Step Workflow:**
1. **Plan** - User specifies module, Claude loads context from core docs
2. **Implement** - Claude implements with incremental git commits
3. **PR** - Claude generates comprehensive PR description (archives all decisions)

**Key Documents:**
- [CLAUDE.MD](CLAUDE.MD) - Context engineering agent with commands (~1500 tokens)
- [Agentic-Dev-System-Simple.md](Agentic-Dev-System-Simple.md) - Complete workflow guide (~600 lines)

**Benefits:**
- 75% reduction in documentation overhead vs complex systems
- PR-based archive (no separate planning docs)
- On-demand context loading (only relevant sections)
- Git history as living documentation

See [Agentic-Dev-System-Simple.md](Agentic-Dev-System-Simple.md) for complete workflow details.

---

### Implementation Order

**Phase 1: Onboarding (Modules 1-8)**
1. Authentication & Account Creation
2. Email Verification
3. Subscription & Payments
4. Company Profile Completion
5. Facility Creation
6. Crop Type Selection
7. Area Setup with Sample Data
8. Cultivars & Suppliers Setup

**Phase 2: Core Operations (Modules 9-13)**
9. Inventory Management
10. Production Templates
11. Quality Check Templates + AI
12. Production Orders & Operations
13. AI Engine & Intelligent Services

**Phase 3: Advanced Features (Modules 14-17)**
14. Compliance & Reporting
15. Analytics & Business Intelligence
16. Mobile Experience & Media Management
17. Integrations & APIs

---

## Document Maintenance

### When to Update

**Add new features:**
1. Update Product-Requirements.md with new module
2. Update Technical-Specification.md if new patterns needed
3. Update Database-Schema.md if new tables/fields required

**Change architecture:**
1. Update Technical-Specification.md with rationale
2. Update Database-Schema.md if data model changes
3. Keep Product-Requirements.md unchanged (features don't change)

**Update for regional regulations:**
1. Update compliance requirements in Product-Requirements.md
2. Update compliance implementation in Technical-Specification.md
3. Update compliance fields in Database-Schema.md

### Version Control

These documents are version 1.0 and should remain stable. For significant changes:

1. Create new dated versions (e.g., "Product-Requirements-2025-06.md")
2. Move old version to `archive/`
3. Update this README with change summary

---

## Additional Documentation

### Development System
- **[CLAUDE.MD](CLAUDE.MD)** - Context engineering agent with @commands
- **[Agentic-Dev-System-Simple.md](Agentic-Dev-System-Simple.md)** - Complete development workflow guide

### Other Documentation
(Note: These files may not exist yet in new project setup. They existed in the old backup.)
- **IMPLEMENTATION_LOG.md** - Implementation progress tracking (if needed)
- **PROJECT_STATE.md** - Current project state (if needed)

### Archive Directory
(Note: Archive directory exists in old backup at `/home/kris/ceibatic/products/alquemist-old-backup/docs/archive/`)

`archive/` contains previous versions and deprecated documents:
- Historical PRD versions (v4.0, v4.1, v5.0, v6.0)
- Old agentic development system docs (complex 3000+ line version)
- Migration guides

---

## Getting Help

### Questions About Features
→ See [Product-Requirements.md](Product-Requirements.md)

### Questions About Implementation
→ See [Technical-Specification.md](Technical-Specification.md)

### Questions About Data Model
→ See [Database-Schema.md](Database-Schema.md)

### Questions About Development Workflow
→ See [CLAUDE.MD](CLAUDE.MD) for commands and [Agentic-Dev-System-Simple.md](Agentic-Dev-System-Simple.md) for complete workflow

### Questions About Regional Compliance
All three documents have regional compliance sections:
- Product Requirements: Compliance cross-reference (regional examples)
- Technical Spec: Compliance implementation (configurable by region)
- Database Schema: Regional fields (default: Colombia)

---

## Next Steps

### For New Project

1. **Read core documents** (~90 minutes total)
   - [Product-Requirements.md](Product-Requirements.md) - What to build
   - [Technical-Specification.md](Technical-Specification.md) - How to build
   - [Database-Schema.md](Database-Schema.md) - Data structure

2. **Read development workflow** (~15 minutes)
   - [CLAUDE.MD](CLAUDE.MD) - Quick command reference
   - [Agentic-Dev-System-Simple.md](Agentic-Dev-System-Simple.md) - Complete workflow guide

3. **Initialize project** (Next.js 14 + Convex + Clerk)
   ```bash
   npx create-next-app@14 alquemist --typescript --tailwind --app
   npm install convex @clerk/nextjs next-intl
   ```

4. **Start development with CLAUDE.MD commands**
   ```bash
   @state current          # Check current state
   @implement module-1     # Implement MODULE 1: Authentication & Company Setup
   @review                 # Review implementation
   @pr create module-1     # Create comprehensive PR
   ```

5. **Continue with modules 2-17** following the same workflow

**Ready to build Alquemist efficiently!** 🚀
