# Alquemist Development System v4.0

*Optimized for context efficiency with JIT loading*

## 🌱 Project Identity

**Platform**: Multi-crop agriculture management for Colombian operations
**Stack**: Next.js 14, Fastify, PostgreSQL, Prisma
**Focus**: Batch-first tracking, INVIMA/ICA compliance, Colombian localization

### Core Principles
- **Batch-first tracking** (default), individual plant tracking optional
- **Colombian-first**: Spanish primary, COP currency, America/Bogota timezone
- **Regulatory compliance**: INVIMA (cannabis), ICA (agriculture), Colombian business law
- **Rural-optimized**: Offline-first PWA, 3G network support

## 🏗️ Architecture Overview

```
apps/
├── web/          # Next.js 14 PWA (frontend)
├── api/          # Fastify API (backend)
packages/
├── database/     # Prisma schema + migrations
├── types/        # Shared TypeScript types
└── ui/           # Shared UI components
```

**Multi-tenant**: Row-level security, company isolation
**Monorepo**: Turborepo workspace
**Deployment**: Google Cloud Platform (Cloud Run, Cloud SQL)

## 🔄 Development Flow

### 1. Planning Phase (Main Claude + User)
- Check development readiness: `@state current`
- Begin module planning: `@plan module [X]`
  - System loads Product/Engineering PRDs for context
  - System reviews database schema for existing models
  - Collaborative MODULE PRD creation with user
  - Generate simplified frontend/backend backlogs (Epic/Task structure)
- **Git**: Create feature branch `git checkout -b feature/module-X-name`

### 2. Implementation Phase (Subagents)
- Assign tasks: `@assign [frontend|backend] MODULE[X]`
- Subagents execute independently
- Generate implementation reports (1,000-2,000 tokens)
- **Git**: Commit and push incrementally with conventional commits

### 3. Integration Phase (Main Claude)
- Review subagent reports: `@review implementations`
- Update documentation: `@update state`, `@sync components`
- Track files: `@track files`
- Validate acceptance criteria
- **Git**: Create PR, merge after approval → auto-deploy to staging

### 4. Release Phase (Every 3 Modules)
- Execute compaction: `@compact module`, `@compact conversation`
- **Git**: Create version tag `git tag -a v0.X.0` → auto-deploy to production

## 📋 Core Commands

### State Management (Enhanced Workflows)

- **`@state current`** - Complete development environment check
  - Reads PROJECT_STATE.md for module context
  - Checks git status and current branch
  - Verifies Docker services running (db, redis, minio, mailhog)
  - Tests database connectivity
  - Suggests next action (planning, implementation, integration)
  - Offers to start services if not running

- **`@module current`** - Active module detailed status
  - Loads current module PRD from MODULE_PRDS/
  - Shows backlog progress (frontend/backend)
  - Displays acceptance criteria checklist
  - Lists blockers and integration points

- **`@module recall [X]`** - Load archived module summary
  - Retrieves from ARCHIVE/MODULE-X-complete.md
  - Shows components built, endpoints created
  - Displays lessons learned from that module

- **`@compact [module|conversation|components]`** - Manage context size
  - Archives completed modules
  - Reorganizes component catalog
  - Creates conversation summaries

### Module Planning Workflow

- **`@plan module [X]`** - Guided module planning (Main Claude + User)
  - Loads Product PRD for global feature context
  - Loads Engineering PRD for technical architecture
  - Reads database schema for existing models
  - Reviews COMPONENT_INVENTORY for reusable components
  - Guides collaborative MODULE PRD creation
  - Generates frontend/backend backlogs from templates
  - Avoids duplicating already-defined features
  - Creates feature branch: `feature/module-X-name`

### Subagent Coordination (Context-Aware)

- **`@assign frontend MODULE[X]`** - Assign frontend implementation
  - Loads SUBAGENT_SPECS.md for context package format
  - Loads Product/Engineering PRDs for requirements
  - Reads relevant sections of database schema
  - Includes available components from COMPONENT_INVENTORY
  - Creates structured context package with full context
  - Subagent works autonomously, commits incrementally

- **`@assign backend MODULE[X]`** - Assign backend implementation
  - Loads SUBAGENT_SPECS.md for context package format
  - Loads Product/Engineering PRDs for business rules
  - Reads relevant database models from schema
  - Includes existing services and patterns
  - Creates structured context package with full context
  - Subagent works autonomously, commits incrementally

- **`@review implementations`** - Integration phase
  - Reviews frontend/backend implementation reports
  - Validates integration points match
  - Updates COMPONENT_INVENTORY, IMPLEMENTATION_LOG
  - Updates PROJECT_STATE with module summary

### Development Services

- **`@services status`** - Check Docker services
  - Lists running containers (db, redis, minio, mailhog)
  - Shows service health and uptime

- **`@services start`** - Start development environment
  - Starts Docker Compose services
  - Waits for database ready
  - Confirms all services healthy

- **`@db check`** - Verify database connectivity
  - Tests PostgreSQL connection
  - Shows database name and schema version
  - Counts tables and confirms seed data

### Context Retrieval (JIT)

- **`@component get [name]`** - Load component full spec
  - Retrieves from COMPONENTS/[category]/[name].md
  - Shows props, usage, dependencies

- **`@component list [category]`** - List components by category
  - Categories: ui, features, layouts

- **`@context load`** - Load global project context
  - Loads Product PRD (feature specifications)
  - Loads Engineering PRD (technical architecture)
  - Reads database schema (all models)
  - Reviews COMPONENT_INVENTORY (existing components)

- **`@context check`** - Verify context health
  - Shows active context size in tokens
  - Identifies documents needing compaction
  - Suggests optimization if over budget

### Documentation Updates

- **`@update state`** - Update PROJECT_STATE.md
  - Adds module completion summary
  - Updates metrics (components, endpoints, files)
  - Moves to next module

- **`@sync components`** - Update COMPONENT_INVENTORY.md
  - Adds new components with lightweight entries
  - Creates detailed files in COMPONENTS/ for JIT loading
  - Updates statistics

- **`@track files`** - Update IMPLEMENTATION_LOG.md
  - Logs all files created this module
  - Organizes by frontend/backend/shared
  - Updates file counts

## 🔀 Git Workflow

### Module Branch Creation
```bash
git checkout -b feature/module-X-name
```

### During Implementation (Flexible)
```bash
# Commit with conventional format
git commit -m "feat(module-X): brief description

- Detail 1
- Detail 2"

# Push for collaboration anytime
git push origin feature/module-X-name
```

### After Integration
```bash
# Create PR
gh pr create --title "MODULE X: Name" --body "..."

# Merge (auto-deploys to staging)
gh pr merge --squash --delete-branch
```

### Production Release (Every 3 Modules)
```bash
git tag -a v0.X.0 -m "Release notes"
git push origin v0.X.0  # Auto-deploys to production
```

**Commit Prefixes**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

**Full workflow**: See [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) and [docs/REFERENCE/GIT_WORKFLOW.md](docs/REFERENCE/GIT_WORKFLOW.md)

## 🗂️ Context Management

### Always Loaded (Active Context ~8,000 tokens)
- Current module summary (500 tokens)
- Component index (lightweight references)
- Active integration points
- Current blockers/issues

### Just-In-Time Loading
- Component details → [docs/COMPONENTS/](docs/COMPONENTS/)
- Archived modules → [docs/ARCHIVE/](docs/ARCHIVE/)
- Detailed workflows → [docs/REFERENCE/](docs/REFERENCE/)
- Design system → [docs/REFERENCE/DESIGN_SYSTEM.md](docs/REFERENCE/DESIGN_SYSTEM.md)

### Compaction Strategy
**Triggers**:
- After MODULE 3, 6, 9 (every 3 modules)
- When PROJECT_STATE.md exceeds 8,000 tokens
- When COMPONENT_INVENTORY.md exceeds 10,000 tokens
- When conversation reaches 75% context window

**Process**:
1. Archive completed module details → [docs/ARCHIVE/](docs/ARCHIVE/)
2. Keep 200-token summaries in PROJECT_STATE.md
3. Move stable components to catalog
4. Summarize conversation if needed

## ⚙️ Technical Constraints

### Colombian Localization (Non-negotiable)
- **Primary locale**: Spanish (es)
- **Currency**: Colombian Peso (COP, no decimals)
- **Timezone**: America/Bogota (COT-5)
- **Date format**: DD/MM/YYYY
- **Address**: Colombian format (Departamento, Municipio, DANE codes)
- **Phone**: Colombian format

### Batch-First Philosophy
- **Default tracking**: BATCH (not individual plants)
- **Individual tracking**: OPTIONAL per facility/crop type
- **QR codes**: Batch-level by default
- **Quality checks**: Sample-based for batches
- **Inventory**: Batch quantities

### Performance Targets
- **API p95**: <1,000ms
- **Mobile 3G**: <3,000ms page load
- **Offline**: Full functionality, background sync
- **Database queries**: <50ms p95

### Security Requirements
- **Auth**: Lucia v3 (session-based)
- **MFA**: Required for admin roles
- **RBAC**: 6 hierarchical roles
- **Data**: Encryption at rest/transit
- **Audit**: Immutable trails for compliance

## 📚 Reference Documents

*Load these on demand using retrieval commands*

- **Detailed Workflow**: [docs/REFERENCE/WORKFLOW_DETAILED.md](docs/REFERENCE/WORKFLOW_DETAILED.md)
- **Subagent Specs**: [docs/SUBAGENT_SPECS.md](docs/SUBAGENT_SPECS.md)
- **Git Workflow**: [docs/REFERENCE/GIT_WORKFLOW.md](docs/REFERENCE/GIT_WORKFLOW.md)
- **GitHub CI/CD Setup**: [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md)
- **Design System**: [docs/REFERENCE/DESIGN_SYSTEM.md](docs/REFERENCE/DESIGN_SYSTEM.md)
- **API Standards**: [docs/REFERENCE/API_STANDARDS.md](docs/REFERENCE/API_STANDARDS.md)
- **Colombian Compliance**: [docs/REFERENCE/COLOMBIAN_COMPLIANCE.md](docs/REFERENCE/COLOMBIAN_COMPLIANCE.md)
- **Module Templates**: [docs/MODULE_PRDS/](docs/MODULE_PRDS/)
- **Context Index**: [docs/CONTEXT_INDEX.md](docs/CONTEXT_INDEX.md)
- **Context Management**: [docs/CONTEXT_MANAGEMENT.md](docs/CONTEXT_MANAGEMENT.md)

## 🇨🇴 Colombian Context

### Regulatory Authorities
- **INVIMA**: Cannabis regulations (individual tracking when required)
- **ICA**: Agricultural chemicals, pest control
- **FNC**: Coffee production standards (if applicable)
- **Municipal**: Local cultivation permits

### Business Requirements
- **NIT validation**: Colombian tax ID format
- **IVA**: 19% tax calculation
- **Business entities**: S.A.S, S.A., Ltda., E.U.
- **Cámara de Comercio**: Chamber of commerce registration

### Geographic Data
- **DANE codes**: Municipality codes
- **Departments**: 32 Colombian departments
- **MAGNA-SIRGAS**: Colombian coordinate system
- **IDEAM**: Weather service integration

## 🎯 Module Sequence (13 Total)

1. ✅ **Foundation** - Database, Docker, monorepo (COMPLETE)
2. **MODULE 1**: Authentication & Company Setup
3. **MODULE 2**: Crop Types & Facilities
4. **MODULE 3**: Inventory & Suppliers
5. **MODULE 4**: Production Templates
6. **MODULE 5**: Operations Registry (Batch-first)
7. **MODULE 6**: Quality Templates + AI
8. **MODULE 7**: Compliance & Reporting
9. **MODULE 8**: Mobile PWA & Offline
10. **MODULE 9**: Analytics & BI
11. **MODULE 10**: Integrations & APIs
12. **MODULE 11**: Advanced AI Features
13. **MODULE 12**: Production Optimization

**Current Module**: Ready for MODULE 1

---

**Version**: 4.0 (Context-Optimized)
**Last Updated**: January 2025
**Token Count**: ~2,000 tokens
