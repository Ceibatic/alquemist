# Agentic Development Framework

**Universal AI-Driven Development System**
**Version**: 1.0
**Date**: January 2025

---

## Philosophy

**Simple, PR-Based Development with AI Agent:**
- Single context engineering agent (CLAUDE.MD or similar)
- 3 core documents provide all requirements
- Pull requests archive implementation decisions
- Git history is the living documentation
- No complex subagent workflows or multi-phase planning

**80% Reduction vs Traditional Documentation:**
- 4 total docs (vs 15+ in complex systems)
- PR-based archive (vs separate planning/spec docs)
- 3-step workflow (vs 4-phase with subagents)
- ~2000 token active context (vs 8000+)

---

## Core Documents (Single Source of Truth)

### 1. Product-Requirements.md
**WHAT to build** - Complete feature specifications

**Use when:**
- Planning module implementation
- Verifying feature completeness
- Understanding user stories
- Checking compliance/business requirements

**Structure:**
```markdown
# Product Requirements

## Overview
- Product vision
- Target users
- Core value proposition

## Modules/Features
### MODULE 1: [Feature Name]
- User stories
- Acceptance criteria
- Business rules
- Compliance requirements

### MODULE 2: [Next Feature]
...

## Dependencies
- Module dependency map
- Implementation order
- Phase breakdown
```

---

### 2. Technical-Specification.md
**HOW to build** - Final architecture and tech stack decisions

**Use when:**
- Implementing new features
- Choosing patterns (auth, data fetching, architecture)
- Understanding deployment strategy
- Applying technology-specific implementations

**Structure:**
```markdown
# Technical Specification

## Technology Stack
- Frontend framework & libraries
- Backend/database solution
- Authentication provider
- Deployment platform
- Third-party services

## System Architecture
- High-level architecture diagram
- Data flow patterns
- Integration points

## Key Implementation Patterns
- Authentication & authorization
- Data fetching & caching
- State management
- Error handling
- Performance optimization

## Deployment
- CI/CD pipeline
- Environment configuration
- Monitoring & logging
```

---

### 3. Database-Schema.md (or Data-Model.md)
**DATA structure** - Technology-agnostic schema

**Use when:**
- Adding new tables/entities/fields
- Understanding relationships
- Implementing queries
- Planning migrations

**Structure:**
```markdown
# Database Schema

## Overview
- Database technology
- Design principles
- Naming conventions

## Tables/Entities
### [Table Name]
**Purpose**: Brief description

**Fields:**
- field_name: type - description
- ...

**Relationships:**
- belongsTo/hasMany/etc.

**Indexes:**
- Primary key
- Foreign keys
- Performance indexes

## Groups
1. **Core System** - auth, users, organizations
2. **Domain Entities** - business-specific tables
3. **Supporting Data** - lookups, settings
```

---

### 4. CLAUDE.MD (or AGENT.MD)
**AGENT workflow** - Context engineering agent with commands

**Use when:**
- Starting new module implementation
- Reviewing current state
- Creating pull requests
- Loading feature context on demand

**Structure:**
```markdown
# Agent Workflow Guide

## Commands

### @state current
Check project state, active work, next steps

### @implement <feature>
Load context and implement functionality

### @review
Review implementation against requirements

### @pr create <module>
Generate comprehensive pull request

## Context Management Rules
- Load context on demand (not everything at once)
- Active context limit: ~2000 tokens
- Archive completed work in PRs

## Implementation Checklist
- [ ] Feature matches requirements
- [ ] Schema matches data model
- [ ] Tests pass
- [ ] Documentation updated
```

---

## Workflow (3 Steps)

### Step 1: Plan
**When**: Starting new module or significant feature

**Process:**
1. User identifies module to implement
2. Agent uses `@implement <module>` command
3. Agent loads relevant context:
   - Module specs from Product-Requirements.md
   - Database tables from Database-Schema.md
   - Architecture patterns from Technical-Specification.md
4. Agent confirms understanding and approach
5. User approves or requests adjustments

**Output**: Shared understanding of feature scope, no separate planning doc needed

**Example:**
```
User: @implement module-1

Agent:
Loading MODULE 1: [Feature Name]...

Context loaded:
✓ Product-Requirements.md → User stories, acceptance criteria
✓ Database-Schema.md → [relevant tables]
✓ Technical-Specification.md → [patterns to use]

Implementation approach:
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

Ready to implement. Proceed? (yes/no)
```

---

### Step 2: Implement
**When**: After plan is approved

**Process:**
1. Agent implements feature following Technical-Specification.md
2. Uses database schema from Database-Schema.md
3. Applies project-specific requirements
4. Makes incremental git commits with descriptive messages
5. Tests implementation locally
6. Updates CLAUDE.MD active context with progress

**Output**: Working feature with git commits documenting progress

**Git Commit Strategy:**
- Small, focused commits for each logical step
- Descriptive commit messages following convention
- Example: `feat(auth): add authentication setup`
- Example: `feat(schema): add users table`
- Example: `feat(ui): add registration form`

**Implementation Checklist:**
Every implementation should verify:
- ✓ Feature matches Product-Requirements.md
- ✓ Database schema matches Database-Schema.md
- ✓ Tech stack follows Technical-Specification.md
- ✓ Project-specific requirements implemented
- ✓ Type safety (if applicable)
- ✓ Tests pass

---

### Step 3: PR (Pull Request)
**When**: Module or feature is complete and tested

**Process:**
1. User requests PR with `@pr create <module>`
2. Agent reviews implementation against Product-Requirements.md
3. Agent generates comprehensive PR description:
   - Summary (3-5 bullet points)
   - Implementation details
   - Requirements implemented
   - Database changes
   - Testing checklist
   - Screenshots (if UI changes)
   - Next module reference
4. Agent creates PR (or provides PR description for user to create)

**Output**: PR that archives all implementation decisions (no separate docs needed)

**PR Template:**
```markdown
feat: implement MODULE X - [Feature Name]

## Summary
- Key feature 1
- Key feature 2
- Key feature 3

## Implementation Details
- Tech stack decisions
- Architecture patterns applied
- Key files created/modified

## Requirements Implemented
✓ Requirement 1
✓ Requirement 2
✓ Requirement 3

## Database Changes
[Tables added/modified with reference to Database-Schema.md]

## Testing
- [ ] Test case 1
- [ ] Test case 2
- [ ] Test case 3

## Screenshots
[If applicable]

## Next Module
MODULE X+1 - [Next Feature]
```

**PR as Archive:**
- PR description captures all implementation context
- No need for separate "implementation log" or "spec doc"
- Git history + PR descriptions = complete project documentation
- Future developers understand decisions by reading PR history

---

## Commands Reference

All commands are defined in CLAUDE.MD and used during the 3-step workflow.

### `@state current`
**Purpose**: Check project state, active module, and next steps

**Use in workflow**: Before starting Step 1 (Plan)

**Output:**
- Git status (branch, uncommitted changes)
- Active module implementation progress
- Blockers or pending decisions
- Suggested next actions

---

### `@implement <feature>`
**Purpose**: Load feature context and implement functionality

**Use in workflow**: Step 1 (Plan) and Step 2 (Implement)

**Process:**
1. Loads relevant sections from Product-Requirements.md
2. Loads relevant tables from Database-Schema.md
3. Applies patterns from Technical-Specification.md
4. Confirms approach with user
5. Implements feature with project requirements

**Example:**
```bash
@implement module-1   # Implement MODULE 1
@implement auth       # Implement authentication
@implement inventory  # Implement inventory system
```

---

### `@review`
**Purpose**: Review current implementation against requirements

**Use in workflow**: During Step 2 (Implement) or before Step 3 (PR)

**Checks:**
- ✓ Feature matches Product-Requirements.md
- ✓ Database schema matches Database-Schema.md
- ✓ Tech stack follows Technical-Specification.md
- ✓ Project-specific requirements implemented
- ✓ Type safety (if applicable)
- ✓ Tests pass

**Output**: Issues found with suggested fixes

---

### `@pr create <module>`
**Purpose**: Generate comprehensive pull request for completed module

**Use in workflow**: Step 3 (PR)

**Process:**
1. Reviews all changes (git diff)
2. Verifies module completion against Product-Requirements.md
3. Creates PR with comprehensive description

**Example:**
```bash
@pr create module-1  # Create PR for MODULE 1
@pr create auth      # Create PR for authentication
```

---

## Context Management

### Active Context (~2000 tokens)
**What to keep in memory:**
- Current module being implemented
- Immediate next steps
- Active blockers or decisions
- Current file being edited

**What NOT to keep:**
- Completed modules (archived in PRs)
- Entire Product-Requirements.md (load on demand)
- Full Database-Schema.md (load tables as needed)
- Implementation details of other modules

### Load on Demand
**When implementing a feature:**
1. Load only relevant module from Product-Requirements.md
2. Load only relevant tables from Database-Schema.md
3. Reference Technical-Specification.md for patterns
4. Don't load entire documents into context

**Example - Authentication Implementation:**
```
Load from Product-Requirements.md:
→ Authentication module section only (~1000 tokens)

Load from Database-Schema.md:
→ users, sessions, roles tables only (~500 tokens)

Reference from Technical-Specification.md:
→ Authentication setup section
→ Authorization pattern section

Total active context: ~2000 tokens (vs loading all docs)
```

### Archive Strategy
**Use Git + PRs as archive, not separate docs:**

**Git Commits:**
- Document incremental progress
- Each commit is queryable
- Git history shows evolution of codebase

**PR Descriptions:**
- Archive implementation decisions
- Capture full module context
- Reference Product-Requirements.md for specs
- Include requirements implemented
- Provide testing checklist

**No Separate Docs Needed:**
- ✗ No "Module 1 Planning Doc"
- ✗ No "Module 1 Implementation Log"
- ✗ No "Module 1 Technical Spec"
- ✓ Just git commits + PR description

---

## Module Implementation Pattern

For each module/feature in Product-Requirements.md:

### 1. Initialize
```bash
@state current                    # Check current state
git checkout -b feature/module-X  # Create feature branch
```

### 2. Plan & Implement
```bash
@implement module-X     # Load context and implement
                       # Agent makes incremental git commits
                       # User tests locally
```

### 3. Review & PR
```bash
@review                # Review implementation
@pr create module-X    # Generate PR description
git push origin feature/module-X
                       # Create PR on GitHub with generated description
```

### 4. Next Module
```bash
git checkout main
git pull origin main   # Merge completed PR
@state current        # Check state, move to next module
```

**Repeat for all modules/features.**

---

## Module Dependencies

**Phase-Based Implementation:**

**Phase 1 (Foundation):**
Must be implemented first, each builds on previous:
- Core authentication & authorization
- Data models
- Basic CRUD operations

**Phase 2 (Core Features):**
Requires Phase 1 complete. Some can be parallelized:
- Primary business features
- Integration points
- Business logic

**Phase 3 (Advanced Features):**
Requires Phase 2 complete. Mostly independent:
- Advanced analytics
- Reporting
- Mobile apps
- Third-party APIs

**Dependency Map:** See Product-Requirements.md for full dependency diagram.

---

## Project-Specific Requirements

Every module implementation must apply these requirements defined in your Product-Requirements.md:

### Example Categories:
- **Internationalization** - Language, locale, timezone
- **Currency/Formatting** - Number formats, date formats
- **Business Rules** - Industry-specific logic
- **Compliance** - Regulatory requirements
- **Security** - Authentication, authorization, data protection
- **Performance** - Response times, caching, optimization

**Implementation Pattern:**
```typescript
// Example: Apply project requirements
const config = {
  locale: PROJECT_DEFAULT_LOCALE,
  currency: PROJECT_DEFAULT_CURRENCY,
  timezone: PROJECT_TIMEZONE,
  // ... other project-specific settings
}
```

---

## Success Metrics

### Context Efficiency
- **Active context**: <2000 tokens (80% reduction vs complex system)
- **Core docs**: 4 files (vs 15+ in traditional systems)
- **Planning docs**: 0 (PR-based archive eliminates separate planning files)
- **Context load time**: <5 seconds (on-demand loading)

### Development Velocity
- **Module planning**: <30 minutes
- **Module implementation**: 1-5 days depending on complexity
- **PR creation**: <10 minutes (automated via @pr command)
- **Context switching**: <5 minutes (git checkout + @state current)

### Quality Indicators
- **Type safety**: 100% (if using TypeScript)
- **Project requirements**: 100% (checked in @review command)
- **Test coverage**: Defined per project
- **Code review time**: <1 hour (clear PR descriptions speed review)

### Git Metrics
- **Commits per module**: 5-15 small, focused commits
- **PR description length**: 500-1000 words (comprehensive)
- **PR review time**: <1 hour (clear descriptions speed review)

---

## Example: Complete Module Workflow

### Step 0: Check State
```
User: @state current

Agent:
**Current State:**
- Branch: main
- Active Module: None (project initialized)
- Database: [Status]
- Auth: [Status]

**Next Steps:**
1. Implement MODULE 1: [First Feature]
2. Set up [required services]
3. Create initial database schema

**Suggested Command:**
@implement module-1
```

### Step 1: Plan
```
User: @implement module-1

Agent:
Loading MODULE 1: [Feature Name]...

**Context Loaded:**
✓ Product-Requirements.md → MODULE 1 specifications
  - [User story 1]
  - [User story 2]
  - [Business rules]

✓ Database-Schema.md → [X] tables needed
  - [table 1 - description]
  - [table 2 - description]

✓ Technical-Specification.md → Implementation patterns
  - [Pattern 1]
  - [Pattern 2]

**Implementation Plan:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

**Estimated Commits:** ~8-10
**Estimated Time:** 2-3 days

Ready to implement? (yes/no)
```

### Step 2: Implement
```
User: yes

Agent:
Implementing MODULE 1...

[Agent creates files and makes incremental commits]

Commit 1: feat(component): initialize [component]
Commit 2: feat(schema): add [table] table
Commit 3: feat(ui): add [feature] component
...

✓ MODULE 1 implementation complete

**Test locally:**
[test commands]

**Test checklist:**
- [ ] Test case 1
- [ ] Test case 2
...

When testing is complete, request PR:
@pr create module-1
```

### Step 3: PR
```
User: @pr create module-1

Agent:
Reviewing MODULE 1 implementation...

✓ All features from Product-Requirements.md implemented
✓ Database schema matches Database-Schema.md
✓ Project requirements applied
✓ Tests pass

**Creating PR...**

[Generates comprehensive PR description]

**Ready to push and create PR:**
git push origin feature/module-1
gh pr create --title "feat: implement MODULE 1" --body "[description]"
```

### Step 4: Next Module
```
[After PR is merged]

User: @state current

Agent:
**Current State:**
- Branch: main
- Active Module: MODULE 1 ✓ (merged)
- Next Module: MODULE 2 - [Next Feature]

**Recent PRs:**
- #1: MODULE 1 - [Feature] (merged)

**Next Steps:**
1. Implement MODULE 2: [Next Feature]
...

**Suggested Command:**
@implement module-2
```

**Repeat this pattern for all modules.**

---

## Adapting This Framework

### For Your Project:

1. **Create Product-Requirements.md**
   - Define all features/modules
   - Write user stories
   - Document business rules
   - List compliance requirements

2. **Create Technical-Specification.md**
   - Choose technology stack
   - Define architecture patterns
   - Document deployment strategy
   - List third-party integrations

3. **Create Database-Schema.md (or Data-Model.md)**
   - Design data model
   - Define relationships
   - Plan indexes
   - Document migrations

4. **Create CLAUDE.MD (or AGENT.MD)**
   - Define @state, @implement, @review, @pr commands
   - Document context management rules
   - Add project-specific checklist
   - Include custom commands as needed

5. **Start Implementing**
   - Follow 3-step workflow
   - Archive in PRs
   - Iterate through modules

---

## Troubleshooting

### Issue: Module too complex to implement in one PR
**Solution:** Break into smaller features, create multiple PRs
```
MODULE X is large, split into:
- PR 1: Basic functionality
- PR 2: Advanced features
- PR 3: Integrations
```

### Issue: Database schema changes breaking existing features
**Solution:** Use migrations, test thoroughly before PR
```
1. Update schema in feature branch
2. Create migration
3. Test migration locally
4. Verify existing queries still work
5. Include migration notes in PR
```

### Issue: Project requirement unclear
**Solution:** Reference Product-Requirements.md or ask stakeholders
```
Example: [Unclear requirement]
→ Check Product-Requirements.md MODULE [X]
→ Check Technical-Specification.md [section]
→ Ask stakeholder if still unclear
```

### Issue: Conflicting features between modules
**Solution:** Check module dependencies in Product-Requirements.md
```
MODULE Y requires MODULE X
Cannot implement [feature] without [dependency]
Follow implementation order: X → Y
```

---

## Quick Start

### For New Project
```bash
# 1. Create core documents
# - Product-Requirements.md
# - Technical-Specification.md
# - Database-Schema.md
# - CLAUDE.MD

# 2. Initialize git repository
git init

# 3. Check state
@state current

# 4. Implement first module
@implement module-1

# 5. Test locally
[run tests]

# 6. Create PR when complete
@pr create module-1

# 7. Repeat for all modules
```

### For Existing Project
```bash
# 1. Check what's implemented
git log --oneline | grep "feat:"

# 2. Check current state
@state current

# 3. Implement next module
@implement module-X

# 4. Continue workflow
```

### For Reviewing Implementation
```bash
# 1. Review current work
@review

# 2. Check against requirements
# Compare implementation to:
# - Product-Requirements.md (features)
# - Technical-Specification.md (patterns)
# - Database-Schema.md (data model)

# 3. Fix issues and re-review
@review
```

---

## Summary

**This framework provides:**
- ✓ Single context engineering agent (CLAUDE.MD)
- ✓ 3 core requirement docs (Product, Technical, Database)
- ✓ PR-based archive (no separate planning docs)
- ✓ 3-step workflow (Plan → Implement → PR)
- ✓ 75% reduction in documentation overhead
- ✓ 75% reduction in active context (2000 vs 8000 tokens)
- ✓ Git history as living documentation

**No subagent complexity:**
- ✗ No specialized subagents
- ✗ No complex context loading system
- ✗ No separate backlog tracking
- ✗ No multi-phase workflows
- ✓ Just: Load context → Implement → PR

**Result:**
- Faster module implementation
- Clearer decision archive (PR history)
- Less cognitive overhead
- More time coding, less time documenting

**Ready to build efficiently with AI agents!** 🚀
