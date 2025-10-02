# Agentic Development System Framework

**Version**: 1.0
**Last Updated**: January 2025
**Based On**: Anthropic Context Engineering Best Practices
**Purpose**: Reusable framework for implementing multi-agent development systems on complex software projects

---

## 📖 Table of Contents

1. [Executive Overview](#executive-overview)
2. [Core Principles](#core-principles)
3. [System Architecture](#system-architecture)
4. [Directory Structure & Files](#directory-structure--files)
5. [Development Workflow](#development-workflow)
6. [Subagent System](#subagent-system)
7. [Context Management](#context-management)
8. [Templates & Examples](#templates--examples)
9. [Adaptation Guide](#adaptation-guide)
10. [Success Metrics & Monitoring](#success-metrics--monitoring)

---

## Executive Overview

### What Is This Framework?

The **Agentic Development System** is a structured approach to building complex software projects using multiple AI agents (Claude instances) with optimized context management. It enables:

- **Long-horizon development** across 10+ modules without context degradation
- **Separation of concerns** through specialized subagents (frontend/backend)
- **Context optimization** maintaining active context at ~8,000 tokens (vs 15,000+ unmanaged)
- **Knowledge preservation** through compaction and just-in-time loading
- **Sustainable velocity** across months of development

### Key Benefits

#### Context Optimization (75% Reduction)
- Active context: 8,000 tokens (managed) vs 20,000+ tokens (unmanaged)
- JIT loading: 300 tokens per component vs 10,000 tokens for full inventory
- Compaction: Every 3 modules prevents context rot

#### Development Velocity
- Parallel subagent work reduces bottlenecks
- Focused context improves response quality
- Systematic tracking prevents lost work
- Clear handoffs reduce integration time

#### Scalability
- Supports 10+ modules with compaction
- Manages 50+ components without degradation
- Maintains coherence across months
- Preserves all architectural decisions

#### Knowledge Preservation
- Every decision documented and retrievable
- Archived modules remain accessible
- Component catalog organized by category
- Lessons learned captured systematically

### When To Use This Framework

✅ **Ideal For**:
- Complex projects with 5+ major modules
- Multi-month development timelines
- Projects requiring context optimization
- Teams using Claude for development assistance
- Projects with evolving requirements
- Systems needing comprehensive documentation

❌ **Not Ideal For**:
- Simple single-module projects
- Prototype/throwaway code
- Projects under 1,000 lines of code
- One-off scripts or utilities

---

## Core Principles

### 1. Context As Finite Resource

**Problem**: Claude has a finite context window. Traditional approaches load all documentation, leading to:
- Context pollution (15,000+ tokens)
- Degraded response quality
- Lost architectural context
- Inability to scale beyond 3-5 modules

**Solution**: Treat context as a precious, managed resource:
- **Active context budget**: ~8,000 tokens maximum
- **JIT loading**: Load details only when needed
- **Compaction**: Archive completed work regularly
- **Lightweight references**: Index instead of full details

### 2. Subagent Architecture

**Problem**: Single agent trying to do frontend + backend + planning leads to:
- Context switching overhead
- Blurred architectural boundaries
- Difficulty maintaining separation of concerns

**Solution**: Specialized subagents for focused work:
- **Main Claude**: Coordinator, planner, integrator
- **@frontend Subagent**: Frontend specialist
- **@backend Subagent**: Backend specialist
- **Structured handoffs**: XML-tagged context packages

### 3. Just-In-Time Loading

**Problem**: Pre-loading all documentation consumes context unnecessarily.

**Solution**: Load details only when needed:
- **Always loaded**: Lightweight indexes, current module summary
- **JIT loaded**: Component details, archived modules, reference docs
- **User commands**: `@component get [name]`, `@module recall [X]`

### 4. Module-Based Development

**Problem**: Monolithic development lacks clear progress markers.

**Solution**: Break project into 5-15 modules:
- Each module is a cohesive feature set (1-3 weeks)
- Clear acceptance criteria per module
- Frontend/backend backlogs per module
- Integration phase after each module

### 5. Compaction Triggers

**Problem**: Documentation grows unbounded, polluting context.

**Solution**: Automatic compaction at regular intervals:
- **Every 3 modules**: Archive completed module details
- **Document size limits**: PROJECT_STATE.md < 8,000 tokens
- **Component catalog**: Move stable components to separate files
- **Conversation summaries**: Every 3 modules

### 6. Version Control Integration

**Problem**: Development without version control leads to:
- Lost work and difficult collaboration
- No audit trail of decisions
- Manual deployment prone to errors
- Difficulty tracking progress

**Solution**: Git workflow mirrors development phases:
- **Feature branches**: One per module
- **Conventional commits**: Clear change history
- **CI/CD automation**: Automated testing and deployment
- **Release tags**: Production deployments every 3 modules

---

## System Architecture

### Agent Hierarchy

```
┌─────────────────────────────────────┐
│         Main Claude                 │
│  (Coordinator & Integrator)         │
│                                     │
│  Responsibilities:                  │
│  - Module planning with user        │
│  - Backlog creation                 │
│  - Subagent coordination            │
│  - Integration & documentation      │
│  - Context compaction               │
└─────────────┬───────────────────────┘
              │
      ┌───────┴────────┐
      ▼                ▼
┌─────────────┐  ┌─────────────┐
│  @frontend  │  │  @backend   │
│  Subagent   │  │  Subagent   │
│             │  │             │
│  Frontend   │  │  Backend    │
│  specialist │  │  specialist │
└─────────────┘  └─────────────┘
```

### Communication Flow

```
1. Planning Phase
   User + Main Claude → Module PRD
                     → Frontend Backlog
                     → Backend Backlog
                     → Git: Create feature branch

2. Implementation Phase
   Main Claude → Structured Context Package → @frontend Subagent
                                           → @backend Subagent

   Subagents work autonomously
   Git: Commit and push incrementally (CI runs)

   Subagents → Implementation Reports → Main Claude

3. Integration Phase
   Main Claude reviews reports
   Main Claude updates documentation
   Main Claude validates acceptance criteria
   Git: Create PR → Merge (deploy to staging)
   Main Claude triggers compaction if needed

4. Release Phase (Every 3 Modules)
   Main Claude executes compaction
   Git: Create release tag (deploy to production)
```

### Context Budget Allocation

**Target**: 8,000 tokens active context

```
claude.md                     ~2,000 tokens  (core config)
Current module summary          ~500 tokens  (active work)
Component index               ~1,000 tokens  (lightweight refs)
PROJECT_STATE.md              ~2,000 tokens  (current status)
Active integration points       ~500 tokens  (blockers/issues)
CONTEXT_INDEX.md                ~500 tokens  (JIT references)
Buffer                        ~1,500 tokens  (headroom)
──────────────────────────────────────────
Total Active Context          ~8,000 tokens
```

**JIT Loaded** (not in active context):
- Component details: 200-400 tokens each
- Archived modules: 200-1,000 tokens each
- Reference docs: Variable
- Backlogs: 2,000-5,000 tokens each

---

## Git & CI/CD Integration

### Overview

Version control and continuous integration/deployment are integrated seamlessly with the development workflow. Git operations mirror the 4-phase development process, while CI/CD pipelines automate quality gates and deployments.

### Branch Strategy

**Module-Based Feature Branches**:
```
main (protected)
  ├── feature/module-1-auth
  ├── feature/module-2-facilities
  ├── feature/module-3-inventory
  └── ...
```

**Branch Naming Convention**:
- `feature/module-X-name` - Module implementation
- `fix/bug-description` - Bug fixes
- `docs/update-name` - Documentation updates
- `refactor/component-name` - Code refactoring

**Branch Protection** (recommended for `main`):
- Require pull request reviews
- Require status checks to pass (CI)
- Require branches to be up to date
- Restrict deletions

### Commit Conventions

**Conventional Commits Format**:
```bash
type(scope): brief description

- Detailed change 1
- Detailed change 2
```

**Commit Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting (no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

**Examples**:
```bash
feat(module-1): add authentication endpoints

- POST /api/auth/login with Lucia v3
- GET /api/auth/me with JWT validation
- Colombian NIT validation
```

### CI/CD Pipeline Structure

**Recommended Workflows** (GitHub Actions):

**1. CI Workflow** (`.github/workflows/ci.yml`):
- **Triggers**: Push or PR to `main`/`develop`
- **Jobs**:
  - Lint & Type Check
  - Test Suite (with database services)
  - Build All Packages
  - Upload Coverage

**2. Deploy Workflow** (`.github/workflows/deploy.yml`):
- **Triggers**:
  - Push to `main` → Deploy to **Staging**
  - Tag `v*.*.*` → Deploy to **Production**
- **Jobs**:
  - Run migrations
  - Build production artifacts
  - Deploy to environment
  - Create GitHub release (for tags)

**3. Database Workflow** (`.github/workflows/database.yml`):
- **Triggers**: Manual (`workflow_dispatch`)
- **Actions**: Migrate, seed, backup, reset
- **Environments**: Staging or production

### Integration with Development Phases

#### Phase 1: Planning → Branch Creation

**After backlog approval**:
```bash
git checkout -b feature/module-X-name
```

**Updates to Planning Phase**:
- Create feature branch as final step
- Document branch name in PROJECT_STATE.md

#### Phase 2: Implementation → Incremental Commits

**During subagent work**:
```bash
# Frontend subagent commits
git commit -m "feat(module-X): add UI components"
git push origin feature/module-X-name
# CI runs automatically ✅

# Backend subagent commits
git commit -m "feat(module-X): add API endpoints"
git push origin feature/module-X-name
# CI runs automatically ✅
```

**Subagent Enhancements**:
- Add Git tools to `<tools_available>`
- Add optional Git commit to `<output_format>`
- Emphasize: Push anytime for collaboration (flexible)

**CI Automation**:
- Runs on every push
- Validates code quality (lint, type-check)
- Runs test suite
- Builds packages
- Reports status to PR

#### Phase 3: Integration → Pull Request & Merge

**After documentation updates**:
```bash
# Main Claude updates docs
git commit -m "docs(module-X): update project state"
git push origin feature/module-X-name

# Create PR
gh pr create \
  --title "MODULE X: Name" \
  --body "## Summary
[Module overview]

## Components Built
[List]

## Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2"

# After approval
gh pr merge --squash --delete-branch
# Auto-deploys to STAGING ✅
```

**Integration Phase Enhancements**:
- Create PR before updating documentation
- Wait for CI checks to pass
- Merge triggers staging deployment

#### Phase 4: Compaction → Production Release

**Every 3 modules**:
```bash
git checkout main
git pull origin main

# Create annotated tag
git tag -a v0.X.0 -m "Release v0.X.0

MODULE X: Name
MODULE Y: Name
MODULE Z: Name

[Key features implemented]"

git push origin v0.X.0
# Auto-deploys to PRODUCTION ✅
```

**Release Strategy**:
- **v0.X.0**: Development releases (modules 1-12)
- **v1.0.0**: First production release
- **v1.X.0**: Minor releases (new features)
- **v1.X.Y**: Patch releases (bug fixes)

### Git Workflow Diagram

```
Planning Phase
    │
    ├──> Create feature branch
    │
    ▼
Implementation Phase
    │
    ├──> Commit incrementally
    ├──> Push to remote
    ├──> CI runs on push ✅
    │
    ▼
Integration Phase
    │
    ├──> Update documentation
    ├──> Create Pull Request
    ├──> CI checks on PR ✅
    ├──> Code review (optional)
    ├──> Merge to main
    ├──> Deploy to STAGING ✅
    │
    ▼
Compaction Phase (Every 3 modules)
    │
    ├──> Archive modules
    ├──> Create release tag
    ├──> Deploy to PRODUCTION ✅
```

### Repository Setup Checklist

For new projects using this framework:

- [ ] Create GitHub repository (private recommended)
- [ ] Configure branch protection for `main`
- [ ] Set up CI/CD workflows (`.github/workflows/`)
- [ ] Configure repository secrets:
  - [ ] `STAGING_DATABASE_URL`
  - [ ] `PRODUCTION_DATABASE_URL`
  - [ ] Other environment-specific secrets
- [ ] Set up environments (`staging`, `production`)
- [ ] Configure auto-deployment settings
- [ ] Test CI pipeline with initial commit
- [ ] Verify staging deployment works
- [ ] Create first module branch

### Best Practices

**Do**:
- ✅ Commit frequently (incremental progress)
- ✅ Push anytime for collaboration
- ✅ Use conventional commit format
- ✅ Include meaningful descriptions
- ✅ Create PR after module completion
- ✅ Wait for CI checks before merging
- ✅ Tag releases every 3 modules

**Don't**:
- ❌ Commit half-finished features
- ❌ Include secrets or credentials
- ❌ Skip CI checks
- ❌ Merge without code review (if required)
- ❌ Force push to main
- ❌ Delete main branch

---

## Directory Structure & Files

### Complete Directory Structure

```
project-root/
├── claude.md                          # Main configuration (2,000 tokens)
├── .github/                           # GitHub configuration
│   └── workflows/                     # CI/CD pipelines
│       ├── ci.yml                     # Lint, test, build
│       ├── deploy.yml                 # Staging/production deployment
│       └── database.yml               # Database operations
│
├── docs/
│   ├── CONTEXT_INDEX.md               # Lightweight reference index
│   ├── CONTEXT_MANAGEMENT.md          # Compaction strategy
│   ├── PROJECT_STATE.md               # Current development state
│   ├── COMPONENT_INVENTORY.md         # Component catalog (index)
│   ├── IMPLEMENTATION_LOG.md          # File tracking log
│   ├── SUBAGENT_SPECS.md              # Subagent specifications
│   │
│   ├── MODULE_PRDS/                   # Module planning documents
│   │   ├── 01-[module-name]-PRD.md
│   │   ├── 02-[module-name]-PRD.md
│   │   └── ...
│   │
│   ├── BACKLOGS/                      # Task backlogs for subagents
│   │   ├── README.md                  # Backlog creation guide
│   │   ├── TEMPLATE-frontend-backlog.md
│   │   ├── TEMPLATE-backend-backlog.md
│   │   ├── 01-[module]-frontend-backlog.md
│   │   ├── 01-[module]-backend-backlog.md
│   │   └── ...
│   │
│   ├── ARCHIVE/                       # Completed module archive
│   │   ├── MODULE-1-complete.md       # 200-token summaries
│   │   ├── MODULE-2-complete.md
│   │   └── ...
│   │
│   ├── COMPONENTS/                    # Component details (JIT)
│   │   ├── ui/
│   │   │   ├── Button.md
│   │   │   ├── Input.md
│   │   │   └── ...
│   │   ├── features/
│   │   └── layouts/
│   │
│   └── REFERENCE/                     # Reference documentation
│       ├── WORKFLOW_DETAILED.md
│       ├── DESIGN_SYSTEM.md
│       ├── API_STANDARDS.md
│       ├── GIT_WORKFLOW.md            # Git workflow guide
│       └── ...
│
└── scripts/
    └── init-claude-code.sh            # Initialization script
```

### Core Files Specification

#### 1. `claude.md` (Main Configuration)

**Purpose**: Primary configuration file, always loaded
**Size Target**: ~2,000 tokens
**Update Frequency**: Rarely (only for major changes)

**Required Sections**:
```markdown
# [Project Name] Development System

## 🎯 Project Identity
- Platform description
- Tech stack
- Core principles (3-5 key principles)

## 🏗️ Architecture Overview
- Directory structure
- Key technologies
- Deployment strategy

## 🔄 Development Flow
1. Planning Phase (Main Claude + User)
2. Implementation Phase (Subagents)
3. Integration Phase (Main Claude)
4. Release Phase (Every 3 Modules)

## 📋 Core Commands
- State management commands
- Subagent coordination commands
- Context retrieval (JIT) commands
- Documentation commands

## 🗂️ Context Management
- Always loaded (~8,000 tokens)
- Just-in-time loading
- Compaction strategy

## ⚙️ Technical Constraints
- Project-specific requirements
- Performance targets
- Security requirements

## 📚 Reference Documents
- Links to JIT-loaded docs

## 🎯 Module Sequence
- List of all modules (5-15 total)
- Current module indicator
```

#### 2. `docs/CONTEXT_INDEX.md` (Reference Index)

**Purpose**: Lightweight index for JIT retrieval
**Size Target**: ~1,500 tokens
**Update Frequency**: After each module integration

**Required Sections**:
```markdown
# Context Index

## Module Status
- Completed modules (list)
- Active module
- Planned modules (list with PRD links)

## Component Catalog
- UI Components (count + index)
- Feature Components (count + index)
- Layout Components (count + index)

## API Endpoints
- By category (count + index)

## Database Models
- Model references (with line numbers in schema)

## Files Created
- Total count, organized by module

## JIT Retrieval Commands
- @component get [name]
- @module recall [X]
- @file show [path]
- @state current

## Archived Modules
- MODULE 1 → docs/ARCHIVE/MODULE-1-complete.md
- MODULE 2 → docs/ARCHIVE/MODULE-2-complete.md
```

#### 3. `docs/CONTEXT_MANAGEMENT.md` (Compaction Strategy)

**Purpose**: Define context optimization rules
**Size Target**: ~3,000 tokens
**Update Frequency**: Rarely (system-level document)

**Required Sections**:
```markdown
# Context Management Strategy

## Context Budget
- Active context target: ~8,000 tokens
- Document size limits
- Breakdown by file

## Compaction Strategy
### Trigger 1: Module Completion (every 3 modules)
- Archive process
- Summary creation (200 tokens)

### Trigger 2: Document Size Limits
- PROJECT_STATE.md > 8,000 tokens
- COMPONENT_INVENTORY.md > 10,000 tokens

### Trigger 3: Conversation Compaction
- Every 3 modules or 75% context window

## Component Catalog Organization
- Active components (last 2 modules)
- Stable components (moved to docs/COMPONENTS/)

## JIT Loading Workflows
- Component details retrieval
- Module history retrieval

## Compaction Checklist
- Module completion checklist
- 3-module compaction checklist

## Warning Signs
- When to compact immediately
```

#### 4. `docs/PROJECT_STATE.md` (Current State)

**Purpose**: Track current development status
**Size Target**: ~2,000 tokens (compact when > 8,000)
**Update Frequency**: After each module integration

**Required Sections**:
```markdown
# Project State

## Current Status
- Active work
- Immediate next steps

## Completed Phases
- Phase summaries (200 tokens each)

## Module Roadmap
- Current module (full details)
- Next module (brief)
- Future modules (list)

## Available Components
- Recently built (last 2 modules: full list)
- Older (just counts, refer to COMPONENT_INVENTORY)

## Available API Endpoints
- Recently built (last 2 modules: full list)
- Older (just counts)

## Database State
- Schema version
- Sample data status

## Development Metrics
- Modules complete / total
- Components built
- Test coverage
- Context health

## Current Blockers
- Issues preventing progress

## Lessons Learned
- Key learnings from recent work
```

#### 5. `docs/COMPONENT_INVENTORY.md` (Component Catalog)

**Purpose**: Index of all components with JIT loading
**Size Target**: ~1,000-2,000 tokens (index only)
**Update Frequency**: After each module integration

**Structure**:
```markdown
# Component Inventory

## Statistics
- Total components: X
- By category breakdown

## UI Components
### Button
**Status**: 🟢 Stable | **Module**: MODULE 1 | **File**: `path/to/Button.tsx`
**Details**: [docs/COMPONENTS/ui/Button.md](COMPONENTS/ui/Button.md)

### Input
**Status**: 🟢 Stable | **Module**: MODULE 1 | **File**: `path/to/Input.tsx`
**Details**: [docs/COMPONENTS/ui/Input.md](COMPONENTS/ui/Input.md)

## Feature Components
[Same format]

## Component Lifecycle
🔵 Planned → 🟡 In Progress → 🟢 Stable → 🔴 Deprecated

## Quality Standards
- Code quality checklist
- Testing requirements
- Documentation requirements
```

**Note**: Full component details stored in `docs/COMPONENTS/[category]/[name].md`, loaded JIT.

#### 6. `docs/IMPLEMENTATION_LOG.md` (File Tracking)

**Purpose**: Complete file tracking log
**Size Target**: ~800-1,500 tokens (grows with project)
**Update Frequency**: After each module integration

**Structure**:
```markdown
# Implementation Log

## Statistics
- Total files created: X
- Frontend files: X
- Backend files: X
- Shared files: X

## MODULE 1: [Name]
### Frontend Files (@frontend)
1. `path/to/file.tsx` - Brief description

### Backend Files (@backend)
1. `path/to/file.ts` - Brief description

### Shared Files
1. `path/to/file.ts` - Brief description

## MODULE 2: [Name]
[Same structure]

## File Organization
- Frontend structure overview
- Backend structure overview
- Shared structure overview
```

#### 7. `docs/SUBAGENT_SPECS.md` (Subagent Specifications)

**Purpose**: Define subagent roles and context packages
**Size Target**: ~2,500 tokens
**Update Frequency**: Rarely (loaded JIT when assigning work)

**Structure**:
```markdown
# Subagent Specifications

## @frontend Subagent
### Identity
<subagent_identity>
Frontend specialist for [Project Name]
</subagent_identity>

### Expertise
<expertise>
- Tech stack items
- Frameworks
- Patterns
</expertise>

### Context Package Format
```xml
<subagent_role>
@frontend - Execute frontend tasks from MODULE [X] backlog
</subagent_role>

<task_overview>
Brief module overview
</task_overview>

<backlog>
[Paste backlog content]
</backlog>

<available_components>
[List reusable components]
</available_components>

<design_constraints>
[Project-specific constraints]
</design_constraints>

<success_criteria>
[What defines done]
</success_criteria>

<output_format>
1. Files Created
2. Components Built
3. Integration Points
4. Testing Status
5. Next Steps
</output_format>
```

### Report Quality Standards
- Excellent report: 1,000-2,000 tokens
- Required sections
- Example reports

## @backend Subagent
[Same structure as frontend]
```

---

## Development Workflow

### Phase 0: Setup & Initialization

**Goal**: Establish the development infrastructure

**Steps**:
1. **Create directory structure**
   ```bash
   mkdir -p docs/{MODULE_PRDS,BACKLOGS,ARCHIVE,REFERENCE,COMPONENTS}
   mkdir -p scripts
   ```

2. **Create core configuration files**
   - `claude.md` (adapt from template)
   - `docs/CONTEXT_INDEX.md`
   - `docs/CONTEXT_MANAGEMENT.md`
   - `docs/PROJECT_STATE.md`
   - `docs/COMPONENT_INVENTORY.md`
   - `docs/IMPLEMENTATION_LOG.md`
   - `docs/SUBAGENT_SPECS.md`

3. **Create backlog templates**
   - `docs/BACKLOGS/README.md`
   - `docs/BACKLOGS/TEMPLATE-frontend-backlog.md`
   - `docs/BACKLOGS/TEMPLATE-backend-backlog.md`

4. **Create initialization script**
   - `scripts/init-claude-code.sh`
   - Verify directory structure
   - Check all required files exist
   - Report system status

**Deliverables**:
- Complete documentation structure
- Optimized claude.md (~2,000 tokens)
- Subagent specifications
- Ready for MODULE 1 planning

**Time Estimate**: 1-2 hours

---

### Phase 1: Module Planning (Main Claude + User)

**Goal**: Collaboratively define module requirements and create backlogs

**Participants**: Main Claude + User

**Steps**:

1. **Review Current State**
   ```
   User: "@state current"
   Main Claude: [Loads PROJECT_STATE.md, provides summary]
   ```

2. **Collaborative PRD Creation**
   - User describes module goals
   - Main Claude asks clarifying questions
   - Together define:
     - Module overview
     - Key features
     - Acceptance criteria
     - Technical constraints
     - Integration points
   - Main Claude drafts MODULE PRD
   - User reviews and refines
   - Save to `docs/MODULE_PRDS/[XX]-[module-name]-PRD.md`

3. **Generate Frontend Backlog**
   - Main Claude uses `TEMPLATE-frontend-backlog.md`
   - Fills in:
     - Tasks (components, features, pages)
     - Files to create
     - Project-specific requirements (e.g., Colombian localization)
     - Integration points with backend
     - Acceptance criteria
     - Sample data
   - Save to `docs/BACKLOGS/[XX]-[module]-frontend-backlog.md`

4. **Generate Backend Backlog**
   - Main Claude uses `TEMPLATE-backend-backlog.md`
   - Fills in:
     - Tasks (endpoints, services, database operations)
     - Files to create
     - Project-specific business rules
     - Integration points with frontend
     - Acceptance criteria
     - Sample data
   - Save to `docs/BACKLOGS/[XX]-[module]-backend-backlog.md`

5. **Review & Refinement**
   - User reviews both backlogs
   - Clarifies ambiguities
   - Adjusts scope if needed
   - Approves for implementation

6. **Create Feature Branch**
   ```bash
   git checkout -b feature/module-X-name
   git push -u origin feature/module-X-name
   ```
   - Branch naming: `feature/module-[number]-[short-name]`
   - All implementation work happens on this branch
   - CI/CD runs automatically on push

**Deliverables**:
- Module PRD (1,500-3,000 tokens)
- Frontend backlog (2,000-4,000 tokens)
- Backend backlog (2,000-4,000 tokens)
- Feature branch created and pushed

**Time Estimate**: 1-3 hours

**Best Practices**:
- ✅ Be specific about requirements
- ✅ Include project-specific constraints (localization, compliance, etc.)
- ✅ Provide realistic sample data
- ✅ Define clear acceptance criteria
- ✅ Identify integration points explicitly
- ❌ Avoid implementation details (let subagents decide)
- ❌ Don't micromanage UI/UX choices
- ❌ Don't include code snippets in backlogs

---

### Phase 2: Implementation (Subagents)

**Goal**: Execute frontend and backend work autonomously

**Participants**: @frontend Subagent, @backend Subagent

**Steps**:

1. **Assign to Frontend Subagent**
   Main Claude creates structured context package:

   ```xml
   <subagent_role>
   @frontend - Execute frontend tasks from MODULE [X] backlog
   </subagent_role>

   <task_overview>
   [1-2 sentence module overview]
   </task_overview>

   <backlog>
   [Paste frontend backlog content]
   </backlog>

   <available_components>
   [List components from previous modules that can be reused]
   </available_components>

   <design_constraints>
   [Project-specific constraints]
   </design_constraints>

   <success_criteria>
   [From backlog acceptance criteria]
   </success_criteria>

   <output_format>
   Return implementation report with:
   1. Files Created
   2. Components Built
   3. Integration Points
   4. Testing Status
   5. Next Steps
   </output_format>
   ```

2. **Frontend Subagent Execution**
   - @frontend reads backlog
   - Creates components, pages, features
   - Implements project-specific requirements
   - Writes tests (if specified)
   - **Git**: Commits work incrementally (optional but recommended)
     ```bash
     git commit -m "feat(module-X): add user authentication form"
     git push origin feature/module-X-name
     ```
   - CI runs automatically on push (lint, test, build)
   - Generates implementation report (1,000-2,000 tokens)

3. **Assign to Backend Subagent**
   Main Claude creates structured context package:

   ```xml
   <subagent_role>
   @backend - Execute backend tasks from MODULE [X] backlog
   </subagent_role>

   <task_overview>
   [1-2 sentence module overview]
   </task_overview>

   <backlog>
   [Paste backend backlog content]
   </backlog>

   <database_schema>
   [Relevant portions of database schema]
   </database_schema>

   <business_rules>
   [Project-specific business logic]
   </business_rules>

   <success_criteria>
   [From backlog acceptance criteria]
   </success_criteria>

   <output_format>
   Return implementation report with:
   1. Files Created
   2. API Endpoints
   3. Database Operations
   4. Business Rules Implemented
   5. Testing Status
   6. Integration Points
   7. Next Steps
   </output_format>
   ```

4. **Backend Subagent Execution**
   - @backend reads backlog
   - Creates endpoints, services, database operations
   - Implements business rules
   - Writes tests (if specified)
   - **Git**: Commits work incrementally (optional but recommended)
     ```bash
     git commit -m "feat(module-X): add authentication API endpoints"
     git push origin feature/module-X-name
     ```
   - CI runs automatically on push (lint, test, build)
   - Generates implementation report (1,000-2,000 tokens)

**Deliverables**:
- Frontend implementation report (1,000-2,000 tokens)
- Backend implementation report (1,000-2,000 tokens)
- All code files created and pushed to feature branch

**Time Estimate**: 1-3 weeks (depending on module complexity)

**Parallel Execution**:
- Frontend and backend can work simultaneously
- Integration points defined in backlogs
- Main Claude coordinates if conflicts arise

---

### Phase 3: Integration (Main Claude)

**Goal**: Review subagent work, integrate, and update documentation

**Participant**: Main Claude

**Steps**:

1. **Review Subagent Reports**
   ```
   User: "@review implementations"
   Main Claude:
   - Loads frontend implementation report
   - Loads backend implementation report
   - Validates completeness
   - Identifies integration issues
   ```

2. **Validate Integration Points**
   - Check frontend → backend contracts match
   - Verify API endpoint expectations align
   - Confirm data types match
   - Test critical paths (if manual testing needed)

3. **Update Documentation**

   **COMPONENT_INVENTORY.md**:
   ```
   User: "@sync components"
   Main Claude:
   - Adds new components to inventory (lightweight entries)
   - Creates detailed component files in docs/COMPONENTS/ (JIT)
   - Updates statistics
   ```

   **IMPLEMENTATION_LOG.md**:
   ```
   User: "@track files"
   Main Claude:
   - Adds all new files created
   - Organizes by module and category
   - Updates statistics
   ```

   **PROJECT_STATE.md**:
   ```
   User: "@update state"
   Main Claude:
   - Marks current module as complete
   - Adds 500-token summary of module
   - Updates metrics (components, endpoints, files)
   - Moves to next module
   ```

   **CONTEXT_INDEX.md**:
   ```
   Main Claude:
   - Updates module status
   - Increments component/endpoint counts
   - Updates file counts
   ```

4. **Validate Acceptance Criteria**
   - Review acceptance criteria from MODULE PRD
   - Check against implementation reports
   - Identify any gaps
   - Create follow-up tasks if needed

5. **Create Pull Request and Merge**
   ```bash
   # Create PR
   gh pr create --title "MODULE X: Name" --body "$(cat <<'EOF'
   ## Summary
   - Feature 1 implemented
   - Feature 2 implemented

   ## Test Plan
   - [ ] Manual testing completed
   - [ ] CI checks passed
   - [ ] Integration verified

   ## Acceptance Criteria
   - [x] All criteria from PRD met
   EOF
   )"

   # After review and approval, merge
   gh pr merge --squash --delete-branch
   ```
   - Merging to main triggers deployment to **staging** environment
   - Verify deployment successful
   - Test on staging environment

6. **Trigger Compaction (if needed)**
   ```
   Check triggers:
   - Every 3 modules? (MODULE 3, 6, 9, 12)
   - PROJECT_STATE.md > 8,000 tokens?
   - COMPONENT_INVENTORY.md > 10,000 tokens?
   - Conversation > 75% context window?

   If yes:
   - Execute compaction (see Compaction section)
   ```

**Deliverables**:
- Updated COMPONENT_INVENTORY.md
- Updated IMPLEMENTATION_LOG.md
- Updated PROJECT_STATE.md
- Updated CONTEXT_INDEX.md
- Module marked complete
- PR created, reviewed, and merged
- Changes deployed to staging
- Compaction executed (if triggered)

**Time Estimate**: 30-60 minutes

---

### Phase 4: Compaction (Periodic)

**Goal**: Optimize context by archiving completed work

**Trigger Conditions**:
1. After MODULE 3, 6, 9, 12 (every 3 modules)
2. PROJECT_STATE.md > 8,000 tokens
3. COMPONENT_INVENTORY.md > 10,000 tokens
4. Conversation > 75% context window

**Steps**:

1. **Module Archival**
   For each completed module (older than 2 modules):

   ```
   Create docs/ARCHIVE/MODULE-[X]-complete.md:

   ## MODULE [X]: [Name]
   **Completion Date**: [Date]
   **Status**: ✅ COMPLETE

   ### Summary (200 tokens)
   [Concise summary of what was built]

   ### Components Built
   - [List of component names]

   ### API Endpoints
   - [List of endpoints]

   ### Files Created
   - [Count by category]

   ### Full Details
   See: docs/MODULE_PRDS/[XX]-[name]-PRD.md
        docs/BACKLOGS/[XX]-[name]-frontend-backlog.md
        docs/BACKLOGS/[XX]-[name]-backend-backlog.md
   ```

2. **PROJECT_STATE.md Compaction**
   ```
   Keep:
   - Current module (full details)
   - Last completed module (500-token summary)
   - All other modules (100-token summaries or link to archive)

   Remove:
   - Detailed implementation notes for old modules
   - Component lists (refer to COMPONENT_INVENTORY instead)
   - API endpoint details (refer to IMPLEMENTATION_LOG instead)
   ```

3. **Component Catalog Reorganization**
   ```
   For stable components (older than 2 modules):

   Move from COMPONENT_INVENTORY.md to docs/COMPONENTS/[category]/[name].md

   Replace full entry with lightweight reference:
   ### Button
   **Status**: 🟢 Stable | **Module**: MODULE 1 | **File**: `path/to/Button.tsx`
   **Details**: [docs/COMPONENTS/ui/Button.md](COMPONENTS/ui/Button.md)
   ```

4. **Conversation Compaction** (if needed)
   ```
   Create docs/CONTEXT_SUMMARY.md:

   # Context Summary - After MODULE [X]

   ## Architectural Decisions
   - [Key architecture choices made]

   ## Technical Patterns Established
   - [Patterns to follow going forward]

   ## Project-Specific Implementations
   - [e.g., Colombian compliance, batch-first logic]

   ## Lessons Learned
   - [What worked well]
   - [What to avoid]

   ## Integration Patterns
   - [How frontend/backend integrate]

   Start new conversation:
   - Load CONTEXT_SUMMARY.md
   - Load current PROJECT_STATE.md
   - Load current COMPONENT_INVENTORY.md
   - Continue from current module
   ```

5. **Create Release Tag**
   ```bash
   # Create annotated release tag (every 3 modules)
   git tag -a v0.X.0 -m "Release v0.X.0

   - MODULE X: Name
   - MODULE Y: Name
   - MODULE Z: Name

   Key features:
   - Feature 1
   - Feature 2
   - Feature 3"

   # Push tag (triggers production deployment)
   git push origin v0.X.0
   ```
   - Pushing tag triggers deployment to **production** environment
   - Semantic versioning: v0.X.0 for development, v1.0.0 for production release
   - Release notes include all modules in this batch

6. **Verify Context Health**
   ```
   Check:
   - Active context < 8,000 tokens ✓
   - PROJECT_STATE.md < 8,000 tokens ✓
   - COMPONENT_INVENTORY.md < 10,000 tokens ✓
   - All archived modules accessible ✓
   ```

**Deliverables**:
- Archived module files (200 tokens each)
- Compacted PROJECT_STATE.md
- Reorganized COMPONENT_INVENTORY.md
- CONTEXT_SUMMARY.md (if conversation compacted)
- Active context < 8,000 tokens
- Release tag created (every 3 modules)
- Production deployment triggered (every 3 modules)

**Time Estimate**: 15-30 minutes

---

## Subagent System

### @frontend Subagent Specification

#### Identity
```xml
<subagent_identity>
Frontend specialist for [Project Name] - [Brief project description]
</subagent_identity>
```

#### Expertise
```xml
<expertise>
- [Frontend framework, e.g., Next.js 14, React, Vue]
- [Styling approach, e.g., Tailwind CSS, CSS Modules]
- [Form handling, e.g., React Hook Form + Zod]
- [State management, e.g., Zustand, Redux]
- [i18n, e.g., next-intl]
- [Project-specific patterns]
</expertise>
```

#### Context Package Template

```xml
<subagent_role>
@frontend - Execute frontend tasks from MODULE [X] backlog
</subagent_role>

<task_overview>
[1-2 sentence overview of what this module accomplishes from frontend perspective]
</task_overview>

<backlog>
File: docs/BACKLOGS/[XX]-[module]-frontend-backlog.md

[Paste full backlog content here]
</backlog>

<available_components>
[List components available for reuse from previous modules]

Example:
- Button → apps/web/src/components/ui/Button.tsx
- Input → apps/web/src/components/ui/Input.tsx
- FormField → apps/web/src/components/ui/FormField.tsx

Or: "None yet" for early modules
</available_components>

<design_constraints>
[Project-specific design constraints]

Example for multi-language project:
- Primary language: [Language] (locale: [code])
- Secondary language: [Language] (locale: [code])
- Date format: [Format]
- Currency: [Currency code] (format: [Example])
- Phone: [Format]
- Accessibility: WCAG 2.1 AA minimum
- Mobile-first responsive design
- [Styling framework] for styling
- [Form library] + [Validation library] for forms
</design_constraints>

<success_criteria>
- All components render without errors
- [Language 1] labels and validation messages
- [Language 2] labels and validation messages (if applicable)
- [Project-specific formatting] correct (dates, currency, etc.)
- Components match design system (when established)
- Mobile-responsive (works on [min width] minimum)
- Accessibility tested (keyboard navigation, ARIA labels)
- [Additional criteria]
</success_criteria>

<output_format>
Return implementation report with:

1. **Files Created** (with brief descriptions)
   - File path
   - Component/page name
   - Purpose

2. **Components Built** (with key features)
   - Component name
   - Purpose
   - Props/API
   - Variants (if applicable)

3. **Integration Points** (what backend needs)
   - API endpoints required
   - Data contracts (request/response types)
   - Project-specific validations needed

4. **Testing Status** (checklist)
   - [ ] Components render
   - [ ] [Language] switching works (if applicable)
   - [ ] [Project-specific] formatting correct
   - [ ] Form validation working
   - [ ] Mobile responsive

5. **Next Steps Identified**
   - Blockers or dependencies
   - Follow-up work needed

6. **Git Commit** (optional)
   - Conventional commit message for work completed
   - Can push to feature branch for collaboration
</output_format>

<tools_available>
- File system navigation (Read, Write, Edit)
- Component exploration (can review existing components)
- Design system reference (load on demand)
- Package installation (npm install, yarn add, etc.)
- Git operations (commit/push for collaboration - optional)
</tools_available>

<anti_patterns>
❌ Don't include full file contents in report
❌ Don't over-explain implementation details
❌ Don't make assumptions about backend contracts
❌ Don't use [Language 1]-only labels (if multi-language)
❌ Don't use localStorage/sessionStorage in components (if SSR)
✅ Do provide concise, actionable summaries
✅ Do clearly state integration needs
✅ Do identify potential issues early
✅ Do use [Language 1]-first approach (if applicable)
✅ Do follow [Project-specific] formatting standards
</anti_patterns>
```

#### Expected Report Format

```markdown
## Frontend Implementation Report - MODULE [X] - [Date]

### Files Created
1. `path/to/file.tsx`
   - Brief description of component/page/utility

2. `path/to/another-file.tsx`
   - Brief description

[Continue for all files]

### Components Built
- **ComponentName**: Description, key features, variants
- **AnotherComponent**: Description, key features

### Integration Points
Backend needs:
- METHOD /api/endpoint
  * Request: { fields }
  * Response: { fields }
  * Errors: [Error scenarios]

[Continue for all endpoints]

### Testing Status
- [x] Components render
- [x] [Language] switching works
- [x] Form validation working
- [x] Mobile responsive
- [ ] Backend integration (pending API)

### Next Steps
- [Blocker or dependency]
- [Follow-up work identified]
```

**Quality Standards**:
- Length: 1,000-2,000 tokens
- Clarity: Clear sections, easy to parse
- Completeness: All required sections included
- Actionability: Clear next steps and integration points

---

### @backend Subagent Specification

#### Identity
```xml
<subagent_identity>
Backend specialist for [Project Name] - [Brief project description]
</subagent_identity>
```

#### Expertise
```xml
<expertise>
- [Runtime, e.g., Node.js 20+]
- [Framework, e.g., Fastify, Express, NestJS]
- [ORM, e.g., Prisma, TypeORM, Drizzle]
- [Database, e.g., PostgreSQL, MySQL]
- [Validation, e.g., Zod, Joi]
- [Auth, e.g., Lucia, NextAuth, Passport]
- [Project-specific business logic]
</expertise>
```

#### Context Package Template

```xml
<subagent_role>
@backend - Execute backend tasks from MODULE [X] backlog
</subagent_role>

<task_overview>
[1-2 sentence overview of what this module accomplishes from backend perspective]
</task_overview>

<backlog>
File: docs/BACKLOGS/[XX]-[module]-backend-backlog.md

[Paste full backlog content here]
</backlog>

<database_schema>
Relevant models from [path/to/schema]:

[Paste relevant portions of database schema for this module]

Example:
- User model (lines 105-167)
- Company model (lines 16-78)
- Role model (lines 80-103)
</database_schema>

<business_rules>
[Project-specific business rules]

Example for international project:
- Currency: [Currency] - [Decimal rules]
- Timezone: [Timezone]
- [Field] validation: [Format rules]
- [Tax] calculation: [Rate and rules]
- [Geographic codes]: [System and structure]
- Regulatory compliance:
  * [Authority 1]: [Requirements]
  * [Authority 2]: [Requirements]
  * [Business entity types]: [List]
</business_rules>

<project_specific_logic>
[Any project-specific architectural patterns]

Example for batch-tracking system:
- Default tracking level: BATCH (not individual items)
- Individual tracking: OPTIONAL configuration
- QR codes: Generated for batches by default
- Quality checks: Sample-based for batch operations
- Inventory: Track batch quantities
- Activities: Log against batch entities primarily
</project_specific_logic>

<success_criteria>
- All endpoints respond correctly (200/201/400/401/403/404)
- Database queries work with tenant isolation
- Validation schemas match frontend
- Business rules enforced
- [Project-specific logic] implemented
- Error messages include [language] translations
- Performance: <1s response time for CRUD operations
</success_criteria>

<output_format>
Return implementation report with:

1. **Files Created** (with brief descriptions)
   - File path
   - Module/endpoint name
   - Purpose

2. **API Endpoints** (with specifications)
   - Method and path
   - Purpose
   - Request body (if applicable)
   - Response format
   - Project-specific logic

3. **Database Operations**
   - Models queried/modified
   - Tenant isolation applied
   - Project-specific data validations
   - Performance considerations

4. **Business Rules Implemented**
   - [Rule 1] validation
   - [Rule 2] requirements
   - [Rule 3] validations
   - [Currency/formatting] handling

5. **Testing Status** (checklist)
   - [ ] Endpoints respond correctly
   - [ ] Database queries work
   - [ ] Validation working
   - [ ] Business rules enforced
   - [ ] Tenant isolation verified

6. **Integration Points** (what frontend can expect)
   - API contracts (types/interfaces)
   - Error codes and messages
   - Project-specific fields

7. **Next Steps Identified**
   - Blockers or dependencies
   - Follow-up work needed

8. **Git Commit** (optional)
   - Conventional commit message for work completed
   - Can push to feature branch for collaboration
</output_format>

<tools_available>
- File system navigation (Read, Write, Edit)
- Database schema exploration (can read schema)
- ORM commands (e.g., npx prisma generate, migrate)
- Running/testing API (npm run dev, etc.)
- Git operations (commit/push for collaboration - optional)
</tools_available>

<anti_patterns>
❌ Don't include full file contents in report
❌ Don't skip tenant isolation in queries (if multi-tenant)
❌ Don't use hardcoded [project-specific] data (use env vars)
❌ Don't ignore business rules
❌ Don't implement anti-patterns (e.g., individual-first when batch-first required)
✅ Do provide concise, actionable summaries
✅ Do apply row-level security (tenant context, if applicable)
✅ Do validate project-specific fields
✅ Do follow project-specific design patterns
✅ Do include [language] error messages
</anti_patterns>
```

#### Expected Report Format

```markdown
## Backend Implementation Report - MODULE [X] - [Date]

### Files Created
1. `path/to/routes.ts`
   - Brief description of route handler

2. `path/to/service.ts`
   - Brief description of business logic

[Continue for all files]

### API Endpoints
- **METHOD /api/endpoint**
  * Purpose: [What it does]
  * Request: { fields }
  * Response: { fields }
  * Project-specific logic: [What was implemented]

[Continue for all endpoints]

### Database Operations
- [Model] queries with tenant isolation
- [Field] uniqueness validation
- [Operation] with [specific handling]

### Business Rules Implemented
- [x] [Rule 1] validation
- [x] [Rule 2] enforcement
- [x] [Currency] handling
- [x] [Timezone] in timestamps

### Testing Status
- [x] Endpoints respond correctly
- [x] Database queries work
- [x] Tenant isolation verified
- [x] Validation working

### Integration Points
Frontend can expect:
- 200: Success with { data }
- 400: Validation errors ([language] messages)
- 401: Unauthorized
- 404: Not found
- 409: Conflict (e.g., duplicate [field])

### Next Steps
- [Next step or blocker]
```

**Quality Standards**:
- Length: 1,000-2,000 tokens
- Clarity: Clear sections, easy to parse
- Completeness: All required sections included
- Actionability: Clear next steps and integration points

---

## Context Management

### Active Context Budget (~8,000 tokens)

**Breakdown**:
```
claude.md                       ~2,000 tokens  (core configuration)
Current module summary            ~500 tokens  (active work)
Component index                 ~1,000 tokens  (lightweight references)
PROJECT_STATE.md                ~2,000 tokens  (current status)
Active integration points         ~500 tokens  (blockers/issues)
CONTEXT_INDEX.md                  ~500 tokens  (JIT references)
Buffer                          ~1,500 tokens  (headroom)
──────────────────────────────────────────────
Total Active Context            ~8,000 tokens
```

**JIT Loaded** (not in active context):
- Component details: 200-400 tokens each (loaded via `@component get [name]`)
- Archived modules: 200-1,000 tokens each (loaded via `@module recall [X]`)
- Reference docs: Variable (loaded via `@file show [path]`)
- Backlogs: 2,000-5,000 tokens each (loaded when assigning to subagents)

### Document Size Limits

| Document | Size Limit | Action When Exceeded |
|----------|-----------|---------------------|
| PROJECT_STATE.md | 8,000 tokens | Compact: archive old modules, keep summaries |
| COMPONENT_INVENTORY.md | 10,000 tokens | Move stable components to docs/COMPONENTS/ |
| Conversation | 75% of context window | Create CONTEXT_SUMMARY.md, start new conversation |
| claude.md | 2,500 tokens | Rarely updated; if grows, split into JIT docs |
| CONTEXT_INDEX.md | 2,000 tokens | Should remain stable; if grows, improve organization |

### Compaction Triggers

#### Trigger 1: Module Completion Compaction
**When**: After completing MODULE 3, 6, 9, 12 (every 3 modules)
**Why**: Regular intervals prevent accumulated bloat

**Process**:
1. Archive completed module details → `docs/ARCHIVE/MODULE-[X]-complete.md`
2. Update PROJECT_STATE.md with 200-token summary
3. Move stable components to component catalog (`docs/COMPONENTS/`)
4. Update CONTEXT_INDEX.md with archive references

**Example Archive Entry** (`docs/ARCHIVE/MODULE-1-complete.md`):
```markdown
## MODULE 1: [Module Name]
**Completion Date**: [Date]
**Status**: ✅ COMPLETE

### Summary (200 tokens)
[Concise summary of what was built, key features implemented,
technologies used, and acceptance criteria met]

### Components Built
- [Component 1], [Component 2], [Component 3]

### API Endpoints
- METHOD /api/endpoint1, METHOD /api/endpoint2

### Files Created
- Frontend: [count] files
- Backend: [count] files
- Shared: [count] files

### Full Details
See: docs/MODULE_PRDS/[XX]-[name]-PRD.md
     docs/BACKLOGS/[XX]-[name]-frontend-backlog.md
     docs/BACKLOGS/[XX]-[name]-backend-backlog.md
```

#### Trigger 2: Document Size Compaction
**When**: PROJECT_STATE.md > 8,000 tokens OR COMPONENT_INVENTORY.md > 10,000 tokens

**Process**:
1. Identify completed modules in PROJECT_STATE.md
2. Archive detailed implementation notes
3. Keep only:
   - Active module full details
   - Last completed module summary (500 tokens)
   - All other modules: 100-token summaries or links to archives

**Example Compacted MODULE Entry** (in PROJECT_STATE.md):
```markdown
### MODULE 1: [Module Name] (COMPLETE)
**Status**: ✅ Complete
**Summary**: [100-token summary]
**Full Details**: [docs/ARCHIVE/MODULE-1-complete.md](ARCHIVE/MODULE-1-complete.md)
```

#### Trigger 3: Conversation Compaction
**When**: Every 3 modules OR conversation reaches 75% context window

**Process**:
1. Create `docs/CONTEXT_SUMMARY.md`:
   ```markdown
   # Context Summary - After MODULE [X]

   ## Architectural Decisions Made
   - [Decision 1]: [Rationale]
   - [Decision 2]: [Rationale]

   ## Technical Patterns Established
   - [Pattern 1]: [Description and usage]
   - [Pattern 2]: [Description and usage]

   ## Project-Specific Implementations
   - [Implementation 1]: [How it works]
   - [Implementation 2]: [How it works]

   ## Lessons Learned
   **What Worked Well**:
   - [Lesson 1]
   - [Lesson 2]

   **What to Avoid**:
   - [Anti-pattern 1]
   - [Anti-pattern 2]

   ## Integration Patterns
   - Frontend → Backend: [Pattern]
   - Database access: [Pattern]
   - Error handling: [Pattern]

   ## Next Steps
   - Continue with MODULE [X+1]
   - [Any outstanding tasks]
   ```

2. Archive conversation history reference
3. Start new conversation with summary loaded

### JIT Loading Workflows

#### Component Details Retrieval

**Bad (Old Way)**:
```
User: "Show me the Button component"
Main Claude loads all of COMPONENT_INVENTORY.md (10,000 tokens)
to find Button component details
```

**Good (New Way)**:
```
User: "@component get Button"

Main Claude:
1. Checks CONTEXT_INDEX.md (lightweight, ~1,500 tokens)
2. Finds: Button → docs/COMPONENTS/ui/Button.md
3. Loads only Button.md (~300 tokens)
4. Returns details to conversation

Total tokens loaded: 300 (vs 10,000)
```

**Example Component Detail File** (`docs/COMPONENTS/ui/Button.md`):
```markdown
# Button Component

**Module**: MODULE 1
**Category**: UI Components
**File**: `apps/web/src/components/ui/Button.tsx`
**Created**: [Date]
**Status**: 🟢 Stable

## Purpose
Reusable button component with variants for [project-specific needs]

## Variants
- `primary` - Main actions ([color])
- `secondary` - Secondary actions
- `danger` - Destructive actions
- `ghost` - Subtle actions

## Usage
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" onClick={handleSubmit}>
  [Label]
</Button>
```

## Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
```

## Dependencies
- [Styling framework]
- [Class composition utility]

## Testing
- Unit tests: `Button.test.tsx`
- Coverage: 95%

## Notes
- [Any project-specific notes]
```

#### Module History Retrieval

**Bad (Old Way)**:
```
Main Claude keeps all module details in PROJECT_STATE.md
(grows to 15,000+ tokens by MODULE 6)
```

**Good (New Way)**:
```
User: "@module recall 1"

Main Claude:
1. Checks CONTEXT_INDEX.md
2. Finds: MODULE 1 → docs/ARCHIVE/MODULE-1-complete.md
3. Loads archived module summary (~200-1,000 tokens)
4. Returns relevant context

Total tokens loaded: 200-1,000 (vs always-loaded 15,000+)
```

### Compaction Checklist

**After Each Module Completion**:
- [ ] Module PRD archived in docs/ARCHIVE/ (if > 3 modules old)
- [ ] PROJECT_STATE.md updated with module summary
- [ ] COMPONENT_INVENTORY.md organized (stable components moved)
- [ ] CONTEXT_INDEX.md reflects current state
- [ ] All new components catalogued
- [ ] All new files tracked in IMPLEMENTATION_LOG.md
- [ ] Active context < 8,000 tokens

**After Every 3 Modules**:
- [ ] Conversation summary created (CONTEXT_SUMMARY.md)
- [ ] Architectural decisions documented
- [ ] Context refreshed with summary
- [ ] Lessons learned captured
- [ ] Old module details archived
- [ ] PROJECT_STATE.md compacted
- [ ] COMPONENT_INVENTORY.md reorganized
- [ ] **Git**: Release tag created (`git tag -a v0.X.0`)
- [ ] **Git**: Tag pushed to trigger production deployment

### Warning Signs

Compact immediately if you notice:

- ⚠️ PROJECT_STATE.md exceeds 8,000 tokens
- ⚠️ COMPONENT_INVENTORY.md exceeds 10,000 tokens
- ⚠️ Main Claude responses become less focused
- ⚠️ Context window warnings appear
- ⚠️ Module integration taking longer than 30 minutes
- ⚠️ Difficulty finding specific component information
- ⚠️ Repeated loading of same information

### Manual Compaction Commands

```bash
# Compact specific module (archive it)
@compact module [X]

# Compact component inventory (move stable components)
@compact components

# Compact conversation (create summary and reset)
@compact conversation

# Check current context size
@state context-size
```

---

## Templates & Examples

### Template: claude.md (Main Configuration)

```markdown
# [Project Name] Development System

*Optimized for context efficiency with JIT loading*

## 🎯 Project Identity

**Platform**: [Brief description]
**Stack**: [Technologies]
**Focus**: [Core focus areas]

### Core Principles
- **[Principle 1]**: [Description]
- **[Principle 2]**: [Description]
- **[Principle 3]**: [Description]

## 🏗️ Architecture Overview

```
[Project directory structure]
```

**[Architecture detail 1]**: [Description]
**[Architecture detail 2]**: [Description]

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
- **Git**: Commit and push incrementally (CI runs automatically)

### 3. Integration Phase (Main Claude)
- Review subagent reports: `@review implementations`
- Update documentation: `@update state`, `@sync components`
- Track files: `@track files`
- Validate acceptance criteria
- **Git**: Create PR, merge after approval (auto-deploy to staging)

### 4. Release Phase (Every 3 Modules)
- Execute compaction: `@compact module`, `@compact conversation`
- **Git**: Create version tag `git tag -a v0.X.0` (auto-deploy to production)

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
- [Other reference docs]

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

[Project-specific technical constraints]

### [Constraint Category 1]
- **[Detail 1]**: [Requirement]
- **[Detail 2]**: [Requirement]

### [Constraint Category 2]
- **[Detail 1]**: [Requirement]
- **[Detail 2]**: [Requirement]

### Performance Targets
- **[Metric 1]**: [Target]
- **[Metric 2]**: [Target]

### Security Requirements
- **[Requirement 1]**: [Description]
- **[Requirement 2]**: [Description]

## 📚 Reference Documents

*Load these on demand using retrieval commands*

- **Detailed Workflow**: [docs/REFERENCE/WORKFLOW_DETAILED.md](docs/REFERENCE/WORKFLOW_DETAILED.md)
- **Subagent Specs**: [docs/SUBAGENT_SPECS.md](docs/SUBAGENT_SPECS.md)
- **[Project-specific doc]**: [docs/REFERENCE/[name].md](docs/REFERENCE/[name].md)
- **Context Index**: [docs/CONTEXT_INDEX.md](docs/CONTEXT_INDEX.md)
- **Context Management**: [docs/CONTEXT_MANAGEMENT.md](docs/CONTEXT_MANAGEMENT.md)

## 🎯 Module Sequence ([X] Total)

1. ✅ **Foundation** - [Description] (COMPLETE)
2. **MODULE 1**: [Name and description]
3. **MODULE 2**: [Name and description]
4. **MODULE 3**: [Name and description]
[Continue for all modules]

**Current Module**: [Current module name]

---

**Version**: [Version number]
**Last Updated**: [Date]
**Token Count**: ~2,000 tokens
```

### Template: Frontend Backlog

See full template in Section: [Backlog Templates](#backlog-templates)

Key sections:
- Module Overview
- Tasks (components, features, pages)
- Files to Create/Modify
- Project-Specific Requirements
- Integration Points
- Acceptance Criteria
- Sample Data

### Template: Backend Backlog

See full template in Section: [Backlog Templates](#backlog-templates)

Key sections:
- Module Overview
- Tasks (endpoints, services, database operations)
- Files to Create/Modify
- Database Schema References
- Business Rules
- Integration Points
- Acceptance Criteria
- Sample Data

### Example: Frontend Implementation Report

```markdown
## Frontend Implementation Report - MODULE 1: Authentication - Feb 1, 2025

### Files Created
1. `apps/web/src/components/ui/Button.tsx`
   - Reusable button component with primary/secondary/danger variants

2. `apps/web/src/components/ui/Input.tsx`
   - Text input with error states and validation

3. `apps/web/src/components/auth/LoginForm.tsx`
   - Login form with email/password validation

4. `apps/web/src/lib/i18n/es.json`
   - Spanish translations for auth module

### Components Built
- **Button**: Primary/secondary/danger variants, loading states
- **Input**: Error states, validation messages, accessible labels
- **LoginForm**: Complete login with Zod validation, Spanish-first

### Integration Points
Backend needs:
- POST /api/auth/login
  * Request: { email: string, password: string }
  * Response: { user: User, token: string }
  * Errors: Spanish messages for invalid credentials (401)

- GET /api/auth/me
  * Request: Authorization header with token
  * Response: { user: User }
  * Errors: 401 if invalid token

### Testing Status
- [x] Components render without errors
- [x] Spanish/English switching works
- [x] Form validation working (Zod)
- [x] Mobile responsive (tested 360px)
- [ ] Backend integration (pending API endpoints)

### Next Steps
- Needs POST /api/auth/login and GET /api/auth/me endpoints
- MFA component planned for future module
```

### Example: Backend Implementation Report

```markdown
## Backend Implementation Report - MODULE 1: Authentication - Feb 1, 2025

### Files Created
1. `apps/api/src/routes/auth.ts`
   - Authentication endpoints (login, register, logout, me)

2. `apps/api/src/middleware/auth.ts`
   - JWT middleware with Lucia v3

3. `apps/api/src/lib/validation/auth.ts`
   - Zod schemas for auth requests

### API Endpoints
- **POST /api/auth/login**
  * Validates email/password
  * Returns JWT token + user object
  * Response includes timestamps in project timezone

- **GET /api/auth/me**
  * Returns current user from JWT
  * Includes user permissions and role

### Database Operations
- User queries with company_id isolation (multi-tenant)
- Email uniqueness validation
- Role assignment (default: basic role)

### Business Rules Implemented
- [x] Email validation (RFC 5322)
- [x] Password strength (min 8 chars, uppercase, lowercase, number)
- [x] Session management (Lucia v3)
- [x] Spanish error messages

### Testing Status
- [x] Endpoints respond with correct status codes
- [x] Database queries work with tenant isolation
- [x] Validation schemas working
- [x] JWT generation/verification working

### Integration Points
Frontend can expect:
- 200: Success with { user, token }
- 400: Validation errors (Spanish messages: "El email es inválido")
- 401: Invalid credentials ("Credenciales inválidas")
- 500: Server error

### Next Steps
- Ready for frontend integration
- MFA endpoints planned for future module
```

---

## Adaptation Guide

### Step-by-Step: Adapting to Your Project

#### Step 1: Gather Project Information

Collect the following:
- [ ] Project name and description
- [ ] Tech stack (frontend framework, backend framework, database)
- [ ] Core principles (3-5 key principles, e.g., mobile-first, batch-first, etc.)
- [ ] Project-specific requirements (localization, compliance, business rules)
- [ ] Performance targets
- [ ] Security requirements
- [ ] Module breakdown (5-15 modules)

#### Step 2: Create Directory Structure

```bash
mkdir -p docs/{MODULE_PRDS,BACKLOGS,ARCHIVE,REFERENCE,COMPONENTS}
mkdir -p scripts
mkdir -p .github/workflows
```

#### Step 3: Customize claude.md

1. Copy template from [Templates section](#template-claudemd-main-configuration)
2. Replace placeholders:
   - `[Project Name]` → Your project name
   - `[Brief description]` → Your project description
   - `[Technologies]` → Your tech stack
   - `[Core focus areas]` → Your focus areas
   - `[Principle 1/2/3]` → Your core principles
   - `[Project directory structure]` → Your actual structure
   - `[Constraint Category 1/2]` → Your constraints (localization, compliance, etc.)
   - `[Metric 1/2]` → Your performance targets
   - `[Requirement 1/2]` → Your security requirements
   - Module sequence → Your actual modules

3. Save to project root as `claude.md`
4. Verify token count (~2,000 tokens)

#### Step 4: Create CONTEXT_INDEX.md

```bash
cp [this-framework]/templates/CONTEXT_INDEX.md docs/CONTEXT_INDEX.md
```

Customize:
- Module list → Your modules
- Database models → Your schema references
- Adjust categories to your project structure

#### Step 5: Copy CONTEXT_MANAGEMENT.md

```bash
cp [this-framework]/templates/CONTEXT_MANAGEMENT.md docs/CONTEXT_MANAGEMENT.md
```

No customization needed (system-level document).

#### Step 6: Create PROJECT_STATE.md

```bash
cp [this-framework]/templates/PROJECT_STATE.md docs/PROJECT_STATE.md
```

Customize:
- Current status → Your current phase
- Module roadmap → Your modules
- Database state → Your database info
- Lessons learned → Your early learnings

#### Step 7: Create COMPONENT_INVENTORY.md

```bash
cp [this-framework]/templates/COMPONENT_INVENTORY.md docs/COMPONENT_INVENTORY.md
```

Customize:
- Component categories → Your component types
- Quality standards → Your standards (adjust if needed)

#### Step 8: Create IMPLEMENTATION_LOG.md

```bash
cp [this-framework]/templates/IMPLEMENTATION_LOG.md docs/IMPLEMENTATION_LOG.md
```

Customize:
- File organization → Your directory structure

#### Step 9: Customize SUBAGENT_SPECS.md

1. Copy template from [Subagent System section](#subagent-system)
2. Replace placeholders:
   - `[Project Name]` → Your project name
   - `[Frontend framework]` → Your frontend stack
   - `[Styling approach]` → Your styling framework
   - `[Form handling]` → Your form library
   - `[Runtime]` → Your backend runtime
   - `[Framework]` → Your backend framework
   - `[ORM]` → Your ORM
   - `[Auth]` → Your auth solution
   - `[Language 1/2]` → Your languages (if multi-language)
   - `[Currency]` → Your currency (if relevant)
   - `[Project-specific patterns]` → Your architectural patterns

3. Save to `docs/SUBAGENT_SPECS.md`

#### Step 10: Create Backlog Templates

1. Copy frontend backlog template
2. Copy backend backlog template
3. Customize project-specific sections:
   - Localization requirements
   - Business rules
   - Compliance requirements
   - Sample data with realistic values

4. Save to:
   - `docs/BACKLOGS/TEMPLATE-frontend-backlog.md`
   - `docs/BACKLOGS/TEMPLATE-backend-backlog.md`

#### Step 11: Create Backlog README

```bash
cp [this-framework]/templates/BACKLOGS-README.md docs/BACKLOGS/README.md
```

Customize:
- Example backlog → Your project's first module
- Sample data → Your project's sample data

#### Step 12: Create Initialization Script

```bash
cp [this-framework]/templates/init-claude-code.sh scripts/init-claude-code.sh
chmod +x scripts/init-claude-code.sh
```

Customize:
- File list → Match your actual files
- Database check → Your database setup
- Next steps → Your project's next steps

#### Step 13: Set Up Git Repository and CI/CD

1. **Initialize Git Repository** (if not already)
   ```bash
   git init
   git add .
   git commit -m "chore: initial Agentic Development System setup"
   ```

2. **Create GitHub Repository**
   - Create new repo on GitHub
   - Add remote: `git remote add origin <repo-url>`
   - Push: `git push -u origin main`

3. **Set Up GitHub Actions Workflows**
   - Copy workflow templates from [Git & CI/CD Integration section](#git--cicd-integration)
   - Create `.github/workflows/ci.yml` (lint, test, build)
   - Create `.github/workflows/deploy.yml` (staging/production deployment)
   - Create `.github/workflows/database.yml` (database operations - if applicable)
   - Customize workflows for your project's needs

4. **Configure Branch Protection**
   - Require PR reviews
   - Require CI checks to pass
   - Disable direct commits to main

5. **Set Up Environments**
   - Create `staging` environment in GitHub
   - Create `production` environment in GitHub
   - Configure deployment secrets (API keys, database URLs, etc.)

#### Step 14: Run Initialization

```bash
./scripts/init-claude-code.sh
```

Verify:
- All directories created ✓
- All files present ✓
- Token counts reasonable ✓
- Git repository initialized ✓
- GitHub Actions configured ✓

#### Step 15: Provide to Claude

When starting a new Claude conversation:

1. Attach your project PRDs (Product, Engineering, etc.)
2. Attach `claude.md` from your project
3. Say: "I've set up the Agentic Development System. Let's begin with Phase 0 verification."

Claude will:
- Load your configuration
- Verify setup
- Guide you through MODULE 1 planning

---

## Success Metrics & Monitoring

### Context Health Indicators

**Healthy System**:
- ✅ Active context: 6,000-8,000 tokens
- ✅ PROJECT_STATE.md: < 8,000 tokens
- ✅ COMPONENT_INVENTORY.md: < 10,000 tokens
- ✅ Module integration: < 30 minutes
- ✅ Clear component lookup
- ✅ Conversation coherent

**Unhealthy System** (needs compaction):
- ⚠️ Active context: > 10,000 tokens
- ⚠️ PROJECT_STATE.md: > 8,000 tokens
- ⚠️ COMPONENT_INVENTORY.md: > 10,000 tokens
- ⚠️ Module integration: > 60 minutes
- ⚠️ Difficulty finding components
- ⚠️ Context window warnings
- ⚠️ Degraded response quality

### Development Velocity Tracking

**Metrics to Monitor**:

| Metric | Target | Warning Threshold |
|--------|--------|------------------|
| Modules completed per month | 2-3 | < 1 |
| Module planning time | 1-3 hours | > 4 hours |
| Subagent implementation time | 1-3 weeks | > 4 weeks |
| Integration time | 30-60 minutes | > 2 hours |
| Compaction time | 15-30 minutes | > 60 minutes |
| Active context size | 6,000-8,000 tokens | > 10,000 tokens |

### Quality Standards

**Code Quality**:
- [ ] TypeScript with strict types
- [ ] Error boundaries where appropriate
- [ ] Loading states handled
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Project-specific requirements met

**Testing**:
- [ ] Unit tests for complex logic
- [ ] Component/integration tests
- [ ] Coverage > 80%
- [ ] Critical paths tested

**Documentation**:
- [ ] All components catalogued
- [ ] All files tracked
- [ ] Integration points documented
- [ ] Lessons learned captured

**Context Management**:
- [ ] Active context < 8,000 tokens
- [ ] Compaction after every 3 modules
- [ ] All modules archived properly
- [ ] JIT loading working

### Continuous Monitoring

**After Each Module**:
1. Check active context size
2. Verify all files tracked
3. Confirm components catalogued
4. Review integration time
5. Capture lessons learned

**After Every 3 Modules**:
1. Execute compaction
2. Verify context health
3. Review velocity metrics
4. Assess quality standards
5. Adjust process if needed

**Monthly Review**:
1. Modules completed vs target
2. Context health trend
3. Integration efficiency
4. Code quality metrics
5. Team satisfaction (if collaborative)

---

## Appendix: Backlog Templates

### Frontend Backlog Template (Complete)

```markdown
# Frontend Backlog - MODULE [X]: [Module Name]

**Module**: [Module Name]
**Subagent**: @frontend
**Priority**: [Critical|High|Medium|Low]
**Dependencies**: [List module dependencies]
**Estimated Duration**: [X days/weeks]

---

## 📋 Module Overview

[1-2 paragraph overview of what this module accomplishes from frontend perspective]

---

## 🎯 Tasks

### Task 1: [Component Category Name]

**Purpose**: [What these components do]

**Components to Build**:
1. **[ComponentName]**
   - Purpose: [Brief description]
   - Variants: [List variants if applicable]
   - Props: [Key props]
   - Features:
     - [Feature 1]
     - [Feature 2]

2. **[AnotherComponent]**
   - Purpose: [Brief description]
   - [Additional details]

### Task 2: [Feature Name]

**Purpose**: [What this feature does]

**Requirements**:
- [Requirement 1]
- [Requirement 2]

**User Flow**:
1. [Step 1]
2. [Step 2]

**Validation Rules**:
- [Rule 1]
- [Rule 2]

---

## 📁 Files to Create/Modify

### New Files
- `apps/web/src/components/[category]/[ComponentName].tsx`
- `apps/web/src/app/[route]/page.tsx`
- `apps/web/src/lib/i18n/[locale].json`

### Modified Files
- `[existing-file].tsx` (if modifying existing code)

---

## [Project-Specific Requirements Section]

Example for multi-language project:

## 🌍 Localization Requirements

### Translations
- **[Language 1] translations** for:
  - [List UI text]
  - Form labels
  - Validation messages
  - Error messages

- **[Language 2] translations** (secondary)

### Formatting
- **Dates**: [Format]
- **Currency**: [Format]
- **Phone**: [Format]
- **Numbers**: [Format]

### [Project-Specific] Inputs
- **[Field 1]**: [Validation rules]
- **[Field 2]**: [Format rules]

---

## 🔌 Integration Points

### Backend API Endpoints Needed

#### Endpoint 1: [Endpoint Name]
- **Method**: [GET|POST|PUT|PATCH|DELETE]
- **Path**: `/api/[path]`
- **Purpose**: [What this endpoint does]
- **Request Body**:
```typescript
{
  field1: string;
  field2: number;
}
```
- **Response**:
```typescript
{
  data: {
    // fields
  };
}
```
- **Error Responses**:
  - 400: Validation error
  - 401: Unauthorized
  - 404: Not found

---

## 🧩 Available Components for Reuse

[List components from previous modules]

**From MODULE 1**:
- Button → `path/to/Button.tsx`
- Input → `path/to/Input.tsx`

---

## ✅ Acceptance Criteria

### Functionality
- [ ] All components render without errors
- [ ] Form validation working
- [ ] [Language 1] labels and messages
- [ ] [Language 2] labels and messages
- [ ] Navigation flows work
- [ ] Error states handled

### [Project-Specific] Requirements
- [ ] [Requirement 1] implemented
- [ ] [Requirement 2] working
- [ ] [Formatting] correct

### Mobile & Responsiveness
- [ ] Works on [min width] minimum
- [ ] Touch-friendly
- [ ] Mobile-first layout

### Accessibility
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Screen reader friendly

### Testing
- [ ] Unit tests for complex logic
- [ ] Component tests
- [ ] Manual testing complete

---

## 📦 Sample Data

[Provide realistic sample data for testing]

```typescript
const sampleData = {
  // realistic data
};
```

---

**Created**: [Date]
**Last Updated**: [Date]
```

### Backend Backlog Template (Complete)

```markdown
# Backend Backlog - MODULE [X]: [Module Name]

**Module**: [Module Name]
**Subagent**: @backend
**Priority**: [Critical|High|Medium|Low]
**Dependencies**: [List module dependencies]
**Estimated Duration**: [X days/weeks]

---

## 📋 Module Overview

[1-2 paragraph overview of what this module accomplishes from backend perspective]

---

## 🎯 Tasks

### Task 1: [Feature/Endpoint Group]

**Purpose**: [What these endpoints do]

**Endpoints to Build**:

#### Endpoint 1: [Endpoint Name]
- **Method**: [GET|POST|PUT|PATCH|DELETE]
- **Path**: `/api/[path]`
- **Purpose**: [What this does]
- **Authentication**: [Required|Optional|Not Required]
- **Authorization**: [Required roles]
- **Request Body**:
```typescript
{
  field1: string;
}
```
- **Response**:
```typescript
{
  data: {
    // fields
  };
}
```
- **Validation Rules**:
  - [Rule 1]
  - [Rule 2]
- **Business Logic**:
  - [Logic 1]
  - [Logic 2]

---

## 📁 Files to Create/Modify

### New Files
- `apps/api/src/routes/[module].ts`
- `apps/api/src/domains/[module]/service.ts`
- `apps/api/src/domains/[module]/validation.ts`

---

## 🗄️ Database Schema

### Relevant Models

**From `[path/to/schema]`**:

#### Model 1: [ModelName]
```prisma
model [ModelName] {
  id          String   @id @default(cuid())
  // fields
}
```

**Lines**: [XX-YY] in schema

**Key Fields**:
- `field1` - [Purpose]
- `field2` - [Purpose]

---

## [Project-Specific Business Rules Section]

Example for international project:

## 🌍 Business Rules

### Localization
- **Timezone**: [Timezone]
- **Currency**: [Currency] ([Decimal rules])
- **Error Messages**: [Language 1] + [Language 2]

### [Project-Specific] Validations
- **[Field 1]**: [Format and rules]
- **[Field 2]**: [Validation algorithm]

### Regulatory Compliance
- **[Authority 1]**: [Requirements]
- **[Authority 2]**: [Requirements]

---

## 🔐 Security & Authorization

### Authentication
- **Method**: [Auth method]
- **Middleware**: [Path to middleware]

### Authorization (RBAC)
**Permissions**:
- [Endpoint 1]: Requires role [X] or higher
- [Endpoint 2]: Any authenticated user

### Tenant Isolation
**CRITICAL**: All queries must filter by `[tenant_field]`

```typescript
// Correct
const items = await db.item.findMany({
  where: {
    [tenant_field]: request.tenant.id,
  },
});
```

---

## 🔌 Integration Points

### Frontend Contracts

**Types** (create in `packages/types/src/[module].ts`):
```typescript
export interface [TypeName] {
  // fields
}
```

### Error Response Format
```typescript
{
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable ([language])',
    details?: {},
  }
}
```

**Status Codes**:
- 200: Success
- 201: Created
- 400: Validation Error
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Error

---

## ✅ Acceptance Criteria

### Functionality
- [ ] Endpoints respond correctly
- [ ] Database queries work
- [ ] Validation working
- [ ] Business rules enforced

### [Project-Specific] Requirements
- [ ] [Requirement 1] implemented
- [ ] [Requirement 2] working
- [ ] [Formatting/currency] handling

### Security
- [ ] Authentication applied
- [ ] Authorization checks working
- [ ] Tenant isolation verified

### Performance
- [ ] Response time < 1s for CRUD
- [ ] Indexes created
- [ ] Pagination implemented

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for endpoints
- [ ] Manual API testing complete

---

## 📦 Sample Data

[Provide realistic sample data]

```typescript
const sampleData = {
  // realistic data
};
```

---

**Created**: [Date]
**Last Updated**: [Date]
```

---

## Conclusion

This framework provides a complete, reusable system for implementing multi-agent development on complex software projects. Key takeaways:

1. **Context is finite** - Treat it as a precious resource
2. **Subagents specialize** - Separation of concerns improves quality
3. **JIT loading** - Load details only when needed
4. **Compaction is critical** - Regular archiving prevents context rot
5. **Documentation scales** - Lightweight indexes, detailed references

By following this framework, you can:
- Build projects with 10+ modules without context degradation
- Maintain active context at ~8,000 tokens (75% reduction)
- Preserve all architectural decisions and knowledge
- Scale to 50+ components sustainably
- Coordinate multiple specialized agents effectively

**To get started**: Follow the [Adaptation Guide](#adaptation-guide) to customize this framework for your project, then begin with Phase 0 setup.

---

**Framework Version**: 1.0
**Last Updated**: January 2025
**Maintained By**: Claude Code Community
**License**: Open source (adapt freely)

**Total Token Count**: ~12,000 tokens (comprehensive standalone guide)
