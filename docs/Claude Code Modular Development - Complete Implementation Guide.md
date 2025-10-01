# 🚀 Claude Code Modular Development - Complete Implementation Guide

**Platform**: Alquemist v4.0  
**Strategy**: Orchestrated Development with Subagent Coordination  
**Purpose**: Step-by-step guide to implement and use the modular development system

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [File Structure Setup](#file-structure-setup)
3. [Configuration Files](#configuration-files)
4. [Module Development Workflow](#module-development-workflow)
5. [Subagent Coordination](#subagent-coordination)
6. [Integration and Tracking](#integration-and-tracking)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

### Prerequisites
- Alquemist foundation phase completed (database, Docker, monorepo)
- Claude Code installed and configured
- Access to main Claude chat and subagent chats

### Setup in 5 Minutes

```bash
# 1. Navigate to project root
cd /path/to/alquemist

# 2. Run initialization script
chmod +x scripts/init-claude-code.sh
./scripts/init-claude-code.sh

# 3. Copy configuration files from artifacts
# Copy claude.md to project root
# Copy backlog templates to docs/BACKLOGS/

# 4. Verify setup
ls -la docs/
ls -la docs/BACKLOGS/

# 5. Ready to start!
echo "✅ Setup complete - Ready for MODULE 1"
```

---

## 📁 File Structure Setup

### Step 1: Create Directory Structure

Run the initialization script or create manually:

```bash
# Create documentation directories
mkdir -p docs/{MODULE_PRDS,BACKLOGS}

# Verify structure
tree docs/
# Expected output:
# docs/
# ├── PROJECT_STATE.md
# ├── COMPONENT_INVENTORY.md
# ├── IMPLEMENTATION_LOG.md
# ├── MODULE_PRDS/
# └── BACKLOGS/
#     ├── README.md
#     ├── TEMPLATE-frontend-backlog.md
#     └── TEMPLATE-backend-backlog.md
```

### Step 2: Copy Artifact Files

Each artifact from this conversation needs to be saved to the correct location:

| Artifact | Destination | Purpose |
|----------|-------------|---------|
| claude.md | `claude.md` (root) | Main configuration |
| PROJECT_STATE.md | `docs/PROJECT_STATE.md` | Project state tracking |
| COMPONENT_INVENTORY.md | `docs/COMPONENT_INVENTORY.md` | Component library |
| IMPLEMENTATION_LOG.md | `docs/IMPLEMENTATION_LOG.md` | File tracking |
| BACKLOGS/README.md | `docs/BACKLOGS/README.md` | Backlog guide |
| TEMPLATE-frontend-backlog.md | `docs/BACKLOGS/TEMPLATE-frontend-backlog.md` | Frontend template |
| TEMPLATE-backend-backlog.md | `docs/BACKLOGS/TEMPLATE-backend-backlog.md` | Backend template |
| init-claude-code.sh | `scripts/init-claude-code.sh` | Setup script |

### Step 3: Set Permissions

```bash
# Make scripts executable
chmod +x scripts/init-claude-code.sh

# Verify permissions
ls -la scripts/init-claude-code.sh
```

---

## ⚙️ Configuration Files

### 1. claude.md (Main Configuration)

**Location**: `claude.md` (project root)  
**Purpose**: Primary configuration for Claude Code  
**Content**: Already complete in artifact - copy as-is

**Key Sections**:
- Project overview and architecture
- Development flow (planning → implementation → integration)
- Subagent configurations
- Commands and coordination workflow

### 2. Documentation Files

#### PROJECT_STATE.md
**Purpose**: Track current development status  
**Updated by**: Main Claude after each module  
**Contains**:
- Current module and status
- Completed phases
- Available components
- Database state
- Next targets

#### COMPONENT_INVENTORY.md
**Purpose**: Library of all built components  
**Updated by**: Main Claude after subagent reports  
**Contains**:
- Component categories
- Component specifications
- Usage examples
- Design system standards

#### IMPLEMENTATION_LOG.md
**Purpose**: Track all generated files  
**Updated by**: Main Claude after integration  
**Contains**:
- Files created by subagents
- Module implementations
- Statistics and summaries

---

## 🔄 Module Development Workflow

### Phase 1: Module Planning (Main Claude + User)

**Duration**: 30-60 minutes per module  
**Participants**: You + Main Claude  
**Goal**: Create comprehensive module plan

#### Step 1.1: Review Current State
```bash
# In main Claude chat, start with context check
@state current

# Review what's available
@docs components
```

**Main Claude will**:
- Read PROJECT_STATE.md
- Review COMPONENT_INVENTORY.md
- Understand what's already built

#### Step 1.2: Collaborative PRD Creation

**Your Role**:
- Describe module goals and requirements
- Specify user flows and business logic
- Clarify acceptance criteria

**Main Claude's Role**:
- Structure requirements into PRD format
- Identify component needs (reuse vs new)
- Define integration points
- Plan database operations

**Example Interaction**:
```
You: "I need authentication with company registration. 
      Users should be able to create companies and then 
      log in. Support for Colombian business entities."

Claude: "Let me help create the MODULE 1 PRD. Based on 
         foundation, we'll need:
         
         Frontend:
         - Login/Register forms
         - Company registration wizard
         - Base UI components (Button, Input, FormField)
         
         Backend:
         - Auth endpoints (login, logout, me)
         - Company registration endpoint
         - JWT middleware
         
         Let's define detailed requirements..."
```

#### Step 1.3: PRD Documentation

Main Claude creates: `docs/MODULE_PRDS/01-auth-PRD.md`

**PRD Structure**:
- Module overview and goals
- Functional requirements
- Component inventory (reuse + new)
- API endpoints specification
- Database operations
- Acceptance criteria
- Success metrics

#### Step 1.4: Backlog Generation

Main Claude creates backlogs:
- `docs/BACKLOGS/01-auth-frontend-backlog.md`
- `docs/BACKLOGS/01-auth-backend-backlog.md`

**Backlog Contents**:
- Specific tasks for subagent
- Files to create/modify
- Requirements and specifications
- Integration points
- Testing requirements

---

### Phase 2: Implementation (Subagents)

**Duration**: Varies by module complexity  
**Participants**: @frontend and @backend subagents  
**Goal**: Execute tasks and build features

#### Step 2.1: Assign Frontend Tasks

**In main Claude chat**:
```bash
@assign frontend MODULE1
```

**Main Claude provides subagent with**:
- Frontend backlog file
- Relevant portions of COMPONENT_INVENTORY.md
- Minimal context (no overwhelming detail)

**@frontend subagent**:
1. Opens new Claude chat (or dedicated frontend chat)
2. Receives focused context:
   ```
   Context Package for @frontend:
   
   Backlog: docs/BACKLOGS/01-auth-frontend-backlog.md
   Available Components: None yet (first components)
   Project: Alquemist authentication module
   
   Execute tasks and report back with simple implementation details.
   ```
3. Works through backlog tasks
4. Creates components and pages
5. Generates implementation report

#### Step 2.2: Assign Backend Tasks

**In main Claude chat**:
```bash
@assign backend MODULE1
```

**Main Claude provides subagent with**:
- Backend backlog file
- Relevant database schema portions
- Minimal context

**@backend subagent**:
1. Opens new Claude chat (or dedicated backend chat)
2. Receives focused context:
   ```
   Context Package for @backend:
   
   Backlog: docs/BACKLOGS/01-auth-backend-backlog.md
   Database: User, Company, Role models
   Project: Alquemist authentication module
   
   Execute tasks and report back with simple implementation details.
   ```
3. Works through backlog tasks
4. Creates API endpoints and services
5. Generates implementation report

#### Step 2.3: Subagent Reports

**Frontend Report Example**:
```markdown
## Frontend Implementation Report - MODULE 1 - Jan 29, 2025

### Files Created:
- apps/web/src/components/ui/Button.tsx - Base button component
- apps/web/src/components/ui/Input.tsx - Form input
- apps/web/src/components/auth/LoginForm.tsx - Login form

### Components Built:
- Button - Reusable button with primary/secondary/danger variants
- Input - Text input with error states and labels
- LoginForm - Complete login form with validation

### Integration Points:
- LoginForm connects to POST /api/auth/login
- Uses Zod validation for form inputs

### Testing Status:
- [x] All components render
- [x] Basic functionality works
- [x] Spanish labels confirmed

### Next Steps:
- Needs backend /api/auth/login endpoint
```

**Backend Report Example**:
```markdown
## Backend Implementation Report - MODULE 1 - Jan 29, 2025

### Files Created:
- apps/api/src/routes/auth.ts - Auth endpoints
- apps/api/src/middleware/auth.ts - JWT middleware

### API Endpoints:
- POST /api/auth/login - User login, returns JWT token
- POST /api/auth/logout - User logout
- GET /api/auth/me - Get current user

### Database Operations:
- User model queries for login validation
- JWT token generation and validation

### Testing Status:
- [x] Endpoints respond correctly
- [x] Database queries work
- [x] JWT tokens generated

### Next Steps:
- Ready for frontend integration
```

---

### Phase 3: Integration (Main Claude)

**Duration**: 15-30 minutes  
**Participant**: Main Claude  
**Goal**: Review, integrate, and document implementations

#### Step 3.1: Review Reports

**In main Claude chat**:
```bash
@review implementations
```

**Main Claude**:
1. Reads both subagent reports
2. Checks for completeness and quality
3. Identifies any issues or conflicts
4. Verifies integration points match

#### Step 3.2: Update Documentation

```bash
@update state
@sync components
@track files
```

**Main Claude updates**:

1. **COMPONENT_INVENTORY.md**:
```markdown
### Button
**Status**: 🟢 Ready
**Module**: MODULE 1
**File**: `apps/web/src/components/ui/Button.tsx`
**Purpose**: Reusable button component
**Variants**: primary, secondary, danger
**Usage**: <Button variant="primary">Click me</Button>
```

2. **IMPLEMENTATION_LOG.md**:
```markdown
## MODULE 1: Authentication & Company Setup

### Frontend Files (@frontend)
- `apps/web/src/components/ui/Button.tsx`
- `apps/web/src/components/ui/Input.tsx`
- `apps/web/src/components/auth/LoginForm.tsx`

### Backend Files (@backend)
- `apps/api/src/routes/auth.ts`
- `apps/api/src/middleware/auth.ts`
```

3. **PROJECT_STATE.md**:
```markdown
## ✅ Completed Phases

### Module 1: Authentication (COMPLETED)
**Completion Date**: Jan 29, 2025
**Components Built**: Button, Input, FormField, LoginForm
**API Endpoints**: 3 auth endpoints
**Status**: ✅ All acceptance criteria met
```

#### Step 3.3: Verify Integration

**Main Claude checks**:
- [ ] Frontend components match backend API contracts
- [ ] All files tracked in IMPLEMENTATION_LOG.md
- [ ] Components documented in COMPONENT_INVENTORY.md
- [ ] PROJECT_STATE.md reflects current status
- [ ] No blocking issues remain

---

### Phase 4: Module Completion

**Duration**: 10-15 minutes  
**Goal**: Finalize module and prepare for next

#### Step 4.1: Acceptance Check

```bash
@module validate
```

**Main Claude verifies**:
- [ ] All PRD requirements met
- [ ] Acceptance criteria satisfied
- [ ] Tests passing
- [ ] Documentation complete
- [ ] No known issues

#### Step 4.2: Prepare Next Module

```bash
@prepare next
```

**Main Claude**:
1. Marks current module complete
2. Updates module sequence status
3. Identifies next module dependencies
4. Prepares context for next planning session

---

## 👥 Subagent Coordination

### Working with @frontend Subagent

**Setup**:
1. Use dedicated Claude chat for frontend work
2. Keep this chat focused only on frontend tasks

**Context Package Format**:
```markdown
# Frontend Context - MODULE 1

## Your Role
Execute frontend tasks from backlog. Report back simply.

## Backlog
[Paste: docs/BACKLOGS/01-auth-frontend-backlog.md]

## Available Components
None yet - you'll build the first components

## Project Context
- Framework: Next.js 14 with TypeScript
- Styling: Tailwind CSS
- Forms: React Hook Form + Zod
- Language: Spanish primary

## Execute
Work through backlog tasks. Generate implementation report when complete.
```

**Communication Flow**:
```
Main Claude → Backlog Assignment → @frontend subagent
                                         ↓
                                    Works on tasks
                                         ↓
                                  Generates report
                                         ↓
@frontend subagent → Implementation Report → Main Claude
```

### Working with @backend Subagent

**Setup**:
1. Use dedicated Claude chat for backend work
2. Keep this chat focused only on backend tasks

**Context Package Format**:
```markdown
# Backend Context - MODULE 1

## Your Role
Execute backend tasks from backlog. Report back simply.

## Backlog
[Paste: docs/BACKLOGS/01-auth-backend-backlog.md]

## Database Schema
Relevant models: User, Company, Role
[Paste relevant portions of schema]

## Project Context
- Framework: Fastify with TypeScript
- ORM: Prisma
- Validation: Zod
- Auth: JWT tokens

## Sample Data
Valle Verde company available for testing

## Execute
Work through backlog tasks. Generate implementation report when complete.
```

---

## 📊 Integration and Tracking

### Daily Workflow

**Morning** (Start of day):
```bash
# Check current state
@state current

# Review what's in progress
@files recent
```

**During Development**:
- Subagents work independently on their backlogs
- Minimal coordination needed (by design)
- Focus on execution, not documentation

**End of Day**:
```bash
# If subagents completed work
@review implementations

# Update tracking
@update state
@sync components
@track files
```

### File Tracking Best Practices

**After each implementation**:
1. Read subagent reports carefully
2. Verify files against backlog expectations
3. Update IMPLEMENTATION_LOG.md with all new files
4. Update COMPONENT_INVENTORY.md with new components
5. Update PROJECT_STATE.md progress

**Example Tracking Entry**:
```markdown
## MODULE 1 - Authentication

### Frontend (@frontend - Jan 29, 2025)
- `apps/web/src/components/ui/Button.tsx`
  ↳ Reusable button with variants
- `apps/web/src/components/auth/LoginForm.tsx`
  ↳ Complete login form with validation

### Backend (@backend - Jan 29, 2025)
- `apps/api/src/routes/auth.ts`
  ↳ 3 authentication endpoints
```

---

## 🐛 Troubleshooting

### Issue: Subagent Report Incomplete

**Symptom**: Subagent returns minimal or missing information

**Solution**:
```bash
# Request specific information
@frontend please provide complete file list and component details

# If still incomplete, ask targeted questions
@frontend what files did you create for the Button component?
```

### Issue: Integration Conflicts

**Symptom**: Frontend expects different API than backend provides

**Solution**:
1. Review both backlogs for discrepancies
2. Create integration specification document
3. Assign fix to appropriate subagent
4. Re-integrate after fix

### Issue: Lost Context Between Sessions

**Symptom**: Main Claude doesn't remember previous work

**Solution**:
```bash
# Always start with context refresh
@state current
@docs log

# Main Claude reads:
- PROJECT_STATE.md (current status)
- IMPLEMENTATION_LOG.md (what's built)
- COMPONENT_INVENTORY.md (available components)
```

### Issue: Overwhelming Detail in Backlogs

**Symptom**: Subagents confused by too much context

**Solution**:
- Review backlog templates
- Remove unnecessary explanations
- Focus on "what to build" not "how to build it"
- Trust subagent expertise

### Issue: Missing Files in Tracking

**Symptom**: Files created but not in IMPLEMENTATION_LOG.md

**Solution**:
```bash
# Manual tracking update
@track files

# Main Claude will:
1. Review recent subagent reports
2. Cross-reference with IMPLEMENTATION_LOG.md
3. Add missing entries
4. Verify completeness
```

---

## 📚 Example: Complete MODULE 1 Flow

### Day 1: Planning (1 hour)

**You start with**:
```
Main Claude: I want to build authentication and company registration
```

**Main Claude responds**:
```
Let me help plan MODULE 1. I'll review current state first.

[Reads PROJECT_STATE.md]

Based on foundation, we need:
1. Basic UI components (Button, Input, FormField)
2. Auth forms (Login, Register)
3. Company registration wizard
4. Backend auth endpoints
5. JWT authentication

Let's create the PRD together...
```

**Collaborative PRD creation happens** → 30 minutes

**Main Claude generates**:
- `docs/MODULE_PRDS/01-auth-PRD.md`
- `docs/BACKLOGS/01-auth-frontend-backlog.md`
- `docs/BACKLOGS/01-auth-backend-backlog.md`

### Day 2: Implementation (4-6 hours)

**Morning - Assign Tasks**:
```bash
@assign frontend MODULE1
@assign backend MODULE1
```

**Subagents work independently**:
- @frontend builds components
- @backend builds API endpoints
- Minimal coordination needed

**End of Day - Reports Come In**:
Both subagents provide implementation reports

### Day 3: Integration (1 hour)

**Review and Integrate**:
```bash
@review implementations
@update state
@sync components
@track files
```

**Main Claude**:
- Updates all documentation
- Verifies integration
- Marks module complete

**Result**:
- MODULE 1 complete ✅
- 8 new components documented
- 3 API endpoints working
- Ready for MODULE 2

---

## 🎯 Success Metrics

### Project Setup Success
- [ ] All artifact files copied to correct locations
- [ ] Init script runs without errors
- [ ] Documentation structure created
- [ ] claude.md in project root

### Module Planning Success
- [ ] PRD clearly defines scope
- [ ] Backlogs are focused and actionable
- [ ] Context is minimal but sufficient
- [ ] Integration points identified

### Implementation Success
- [ ] Subagents complete tasks without confusion
- [ ] Reports are simple and complete
- [ ] Files match backlog expectations
- [ ] No major blockers encountered

### Integration Success
- [ ] All files tracked in IMPLEMENTATION_LOG.md
- [ ] Components documented in COMPONENT_INVENTORY.md
- [ ] PROJECT_STATE.md reflects current status
- [ ] Ready to move to next module

---

## 🚀 You're Ready!

With this guide and all artifact files in place, you're ready to:

1. ✅ **Run initialization** - Setup documentation structure
2. ✅ **Start MODULE 1 planning** - Create PRD with main Claude
3. ✅ **Generate backlogs** - Break down into subagent tasks
4. ✅ **Assign to subagents** - Coordinate implementation
5. ✅ **Integrate results** - Update documentation and track files
6. ✅ **Move to MODULE 2** - Repeat the process

**Next Step**: Copy all artifacts to your project and run `./scripts/init-claude-code.sh`

Good luck building Alquemist! 🌱