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
- Review current state: `@state current`
- Collaborative PRD creation
- Generate module PRD in [docs/MODULE_PRDS/](docs/MODULE_PRDS/)
- Create frontend/backend backlogs in [docs/BACKLOGS/](docs/BACKLOGS/)
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

### State Management
- `@state current` - Check current development status
- `@compact [module|conversation|components]` - Manage context size
- `@module current` - Current module full details
- `@module recall [X]` - Load archived module summary

### Subagent Coordination
- `@assign frontend MODULE[X]` - Assign frontend tasks
- `@assign backend MODULE[X]` - Assign backend tasks
- `@review implementations` - Review subagent reports

### Context Retrieval (JIT)
- `@component get [name]` - Load component full spec
- `@component list [category]` - List components
- `@file show [path]` - Load specific file
- `@file recent [N]` - Show last N files

### Documentation
- `@update state` - Update PROJECT_STATE.md
- `@sync components` - Update COMPONENT_INVENTORY.md
- `@track files` - Update IMPLEMENTATION_LOG.md

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
