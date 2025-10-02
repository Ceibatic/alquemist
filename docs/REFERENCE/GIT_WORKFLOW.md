# Git Workflow for Alquemist Development

*Module-based branching integrated with Agentic Development System*

**Version**: 1.0
**Last Updated**: January 2025

---

## 🎯 Overview

This document describes the Git workflow integrated with the Alquemist Agentic Development System. The workflow mirrors the 3-phase development process: Planning → Implementation → Integration, with automated CI/CD at each stage.

---

## 🔄 Workflow by Development Phase

### Phase 1: Planning → Branch Creation

**When**: After PRD and backlogs are approved
**Action**: Create feature branch for the module

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/module-X-name

# Examples:
# git checkout -b feature/module-1-auth-company-setup
# git checkout -b feature/module-2-crop-facilities
# git checkout -b feature/module-3-inventory-suppliers
```

**Branch Naming Convention**:
- `feature/module-X-name` - Module implementation
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation only
- `refactor/component-name` - Code refactoring

---

### Phase 2: Implementation → Incremental Commits

**When**: During subagent work (frontend/backend)
**Action**: Commit and push anytime for collaboration

#### Conventional Commit Format

```bash
git add [files]
git commit -m "type(scope): brief description

- Detailed change 1
- Detailed change 2
- Detailed change 3"
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
# Frontend subagent commits
git commit -m "feat(module-1): add Button and Input UI components

- Implement Button with Colombian color variants
- Add Input with error states and validation
- Include Spanish/English labels"

git commit -m "feat(module-1): add LoginForm component

- Complete login form with Zod validation
- Spanish-first labels and error messages
- Mobile-responsive design (360px+)"

# Backend subagent commits
git commit -m "feat(module-1): add authentication endpoints

- POST /api/auth/login with Lucia v3
- GET /api/auth/me with JWT validation
- Colombian NIT validation"

git commit -m "test(module-1): add auth endpoint tests

- Unit tests for login/register
- Integration tests with database
- Colombian NIT validation tests"
```

#### Push for Collaboration

```bash
# Push to feature branch anytime
git push origin feature/module-X-name

# What happens automatically:
# - CI workflow runs (lint, type-check, test, build)
# - All checks must pass
```

**Key Points**:
- ✅ Commit frequently (incremental progress)
- ✅ Push anytime (enables collaboration)
- ✅ Use conventional commit format
- ✅ Include meaningful descriptions
- ❌ Don't commit half-finished features
- ❌ Don't include secrets or credentials

---

### Phase 3: Integration → Pull Request

**When**: After both subagents complete work and Main Claude integrates
**Action**: Create PR and merge to main

#### Update Documentation First

```bash
# Main Claude updates documentation
git add docs/PROJECT_STATE.md
git add docs/COMPONENT_INVENTORY.md
git add docs/IMPLEMENTATION_LOG.md

git commit -m "docs(module-1): update project state after module completion

- Add 15 new components to inventory
- Track 42 new files in implementation log
- Mark MODULE 1 as complete"

git push origin feature/module-1-auth-company-setup
```

#### Create Pull Request

Using GitHub CLI:

```bash
gh pr create \
  --title "MODULE 1: Authentication & Company Setup" \
  --body "## Summary
- Multi-tenant authentication with Lucia v3
- Colombian company registration (NIT validation)
- 6-role RBAC system
- Spanish/English localization

## Components Built (15)
- Button, Input, FormField, Select
- LoginForm, RegisterForm
- CompanyRegistrationWizard
- LanguageSelector, RoleSelector

## API Endpoints (5)
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/companies

## Testing
- ✅ All CI checks passing
- ✅ Unit tests: 85% coverage
- ✅ Manual testing complete

## Acceptance Criteria
- [x] User registration and login
- [x] Company registration with NIT
- [x] Role assignment
- [x] Language switching
- [x] Session management

Closes #123"
```

Or manually on GitHub:
1. Go to repository
2. Click "Pull requests" → "New pull request"
3. Select `feature/module-X-name` → `main`
4. Fill in title and description
5. Click "Create pull request"

**What Happens Automatically**:
1. CI workflow runs (lint, type-check, test, build)
2. All checks must pass before merge
3. Code review (if configured in branch protection)

#### Merge to Main

```bash
# After PR approval
gh pr merge --squash --delete-branch

# Or merge via GitHub UI

# What happens next:
# 1. CI workflow runs on main branch
# 2. Deploy workflow triggers
# 3. Automatically deploys to STAGING environment
```

---

### Phase 4: Compaction → Production Release

**When**: After MODULE 3, 6, 9, 12 (every 3 modules)
**Action**: Create release tag

#### Create Annotated Tag

```bash
# Pull latest main
git checkout main
git pull origin main

# Create annotated tag
git tag -a v0.3.0 -m "Release v0.3.0 - Core Foundation Complete

MODULE 1: Authentication & Company Setup
MODULE 2: Crop Types & Facilities
MODULE 3: Inventory & Suppliers

Features:
- Multi-tenant authentication system
- Colombian compliance (NIT, DANE, ICA)
- 4 crop types supported
- Batch-first tracking foundation

Colombian Localization:
- Spanish/English interface
- COP currency handling
- DANE geographic codes
- ICA/INVIMA integration ready"

# Push tag to GitHub
git push origin v0.3.0
```

**What Happens Automatically**:
1. Deploy workflow triggers for production
2. Runs all CI checks
3. Builds production artifacts
4. Runs database migrations on production
5. Deploys to PRODUCTION environment
6. Creates GitHub release with notes

#### Semantic Versioning

- `v0.X.0` - Development releases (modules 1-12)
- `v1.0.0` - First production release (after all 13 modules)
- `v1.1.0` - Minor release (new features, backward compatible)
- `v1.1.1` - Patch release (bug fixes)

**Examples**:
- `v0.3.0` - After MODULE 3 (Foundation complete)
- `v0.6.0` - After MODULE 6 (Core features)
- `v0.9.0` - After MODULE 9 (Analytics)
- `v0.12.0` - After MODULE 12 (AI optimization)
- `v1.0.0` - Production release (all modules complete)

---

## 🧪 Running CI Checks Locally

Before pushing, verify your code passes all checks:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run all CI checks
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run format:check  # Prettier
npm run test          # Vitest
npm run build         # Turborepo build

# Or run turbo to parallelize
turbo run lint type-check test build
```

---

## 🔍 Common Git Operations

### Check Current Status

```bash
# View current branch and changes
git status

# View commit history
git log --oneline --graph --all

# View diff before committing
git diff
git diff --staged
```

### Branch Management

```bash
# List all branches
git branch -a

# Switch branches
git checkout branch-name

# Delete local branch (after merge)
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

### Stash Changes

```bash
# Temporarily save changes
git stash

# Apply stashed changes
git stash pop

# List stashes
git stash list
```

### Update Feature Branch

```bash
# Pull latest changes from main
git checkout main
git pull origin main

# Switch back to feature branch
git checkout feature/module-X-name

# Rebase feature branch on main (cleaner history)
git rebase main

# Or merge main into feature branch
git merge main
```

### Undo Changes

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo changes to file (before commit)
git checkout -- file-path

# Amend last commit (change message or add files)
git commit --amend -m "New commit message"
```

---

## 🚨 Troubleshooting

### Merge Conflicts

```bash
# When you have conflicts after pull/rebase/merge
# 1. Open conflicted files in editor
# 2. Resolve conflicts (remove <<<<<<, ======, >>>>>> markers)
# 3. Add resolved files
git add resolved-file.ts

# 4. Continue rebase (if rebasing)
git rebase --continue

# Or commit merge (if merging)
git commit -m "merge: resolve conflicts"
```

### Accidentally Committed to Main

```bash
# If you committed to main instead of feature branch
# 1. Create feature branch from current state
git checkout -b feature/module-X-name

# 2. Switch back to main
git checkout main

# 3. Reset main to remote state
git reset --hard origin/main

# 4. Switch to feature branch and continue work
git checkout feature/module-X-name
```

### CI Checks Failing

```bash
# Pull latest changes
git pull origin feature/module-X-name

# Run checks locally to identify issues
npm run lint          # Fix linting errors
npm run type-check    # Fix TypeScript errors
npm run format        # Auto-format code
npm run test          # Fix failing tests

# Commit fixes
git add .
git commit -m "fix(module-X): resolve CI check failures"
git push origin feature/module-X-name
```

---

## 📊 Complete MODULE 1 Example

```bash
# === PLANNING PHASE ===
git checkout main
git pull origin main
git checkout -b feature/module-1-auth-company-setup

# === IMPLEMENTATION PHASE ===
# Frontend subagent works...
git add apps/web/src/components/
git commit -m "feat(module-1): add UI components

- Button with Colombian color variants
- Input with validation states
- FormField, Select components"
git push origin feature/module-1-auth-company-setup  # CI runs ✅

# Backend subagent works...
git add apps/api/src/routes/auth.ts
git commit -m "feat(module-1): add authentication endpoints

- POST /api/auth/login with Lucia v3
- GET /api/auth/me with JWT validation
- Colombian NIT validation"
git push origin feature/module-1-auth-company-setup  # CI runs ✅

# === INTEGRATION PHASE ===
# Main Claude updates documentation
git add docs/PROJECT_STATE.md docs/COMPONENT_INVENTORY.md
git commit -m "docs(module-1): update project state after completion"
git push origin feature/module-1-auth-company-setup

# Create PR
gh pr create --title "MODULE 1: Auth & Company" --body "..."
# CI runs on PR ✅

# After approval, merge
gh pr merge --squash --delete-branch
# Deploys to STAGING ✅

# === After MODULE 3 (COMPACTION) ===
git checkout main
git pull origin main
git tag -a v0.3.0 -m "Release v0.3.0 - Modules 1-3 complete"
git push origin v0.3.0
# Deploys to PRODUCTION ✅
```

---

## 📞 Resources

- **Full CI/CD Guide**: [docs/GITHUB_SETUP.md](../GITHUB_SETUP.md)
- **Conventional Commits**: https://www.conventionalcommits.org
- **Semantic Versioning**: https://semver.org
- **Git Documentation**: https://git-scm.com/doc

---

**Version**: 1.0
**Token Count**: ~1,800 tokens
**Usage**: Load just-in-time when needed
