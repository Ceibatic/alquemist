# 🚀 GitHub CI/CD Setup - Alquemist

Complete guide to set up GitHub repository with automated CI/CD pipeline for the Alquemist monorepo.

---

## 📋 **Prerequisites**

- GitHub account with organization access
- Git installed locally
- SSH keys configured (recommended) or HTTPS access
- Node.js 20+ and npm 10+

---

## 🔧 **Step 1: Create GitHub Repository**

### **Option A: Using GitHub CLI (Recommended)**

```bash
# Install GitHub CLI if not already installed
# Ubuntu/Debian: sudo apt install gh
# macOS: brew install gh
# Windows: winget install --id GitHub.cli

# Authenticate with GitHub
gh auth login

# Create repository
gh repo create ceibatic/alquemist --private \
  --description "Multi-Crop Agriculture Platform for Colombian Operations" \
  --source=. --remote=origin

# Push initial commit
git add .
git commit -m "🌱 Initial commit: Alquemist v4.0 setup complete

- Complete monorepo structure with Turborepo
- Database schema with 26 tables + Colombian seed data
- Docker services (PostgreSQL, Redis, MinIO, Mailhog)
- Testing infrastructure with Vitest
- CI/CD pipelines with GitHub Actions
- Development environment ready for feature development"

git push -u origin main
```

### **Option B: Using GitHub Web Interface**

1. Go to https://github.com/new
2. Repository name: `alquemist`
3. Description: "Multi-Crop Agriculture Platform for Colombian Operations"
4. Select: **Private**
5. DO NOT initialize with README, .gitignore, or license
6. Click "Create repository"

Then run:

```bash
# Add remote
git remote add origin git@github.com:ceibatic/alquemist.git
# Or HTTPS: git remote add origin https://github.com/ceibatic/alquemist.git

# Push to GitHub
git push -u origin main
```

---

## 🔐 **Step 2: Configure Repository Secrets**

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### **Required Secrets:**

```
STAGING_DATABASE_URL
postgresql://user:password@host:5432/alquemist_staging

PRODUCTION_DATABASE_URL
postgresql://user:password@host:5432/alquemist_production
```

### **Optional Secrets (based on deployment target):**

```
CODECOV_TOKEN              # Code coverage reports
VERCEL_TOKEN               # Vercel deployment
RAILWAY_TOKEN              # Railway deployment
GCP_SERVICE_ACCOUNT        # Google Cloud Platform
AWS_ACCESS_KEY_ID          # AWS deployment
AWS_SECRET_ACCESS_KEY      # AWS deployment
```

---

## 🔄 **CI/CD Pipeline Overview**

The project uses **3 GitHub Actions workflows**:

### **1. CI Workflow** (`.github/workflows/ci.yml`)

**Triggers**: Push or Pull Request to `main` or `develop` branches

**Jobs**:
- ✅ **Lint & Type Check**: ESLint + TypeScript + Prettier
- ✅ **Test Suite**: Vitest with PostgreSQL + Redis services
- ✅ **Build**: Turborepo build all packages/apps
- ✅ **Coverage**: Upload to Codecov

**Services Used**:
- PostgreSQL 15 (test database)
- Redis 7 (cache)

### **2. Deploy Workflow** (`.github/workflows/deploy.yml`)

**Triggers**:
- Push to `main` → **Deploy to Staging**
- Tag `v*.*.*` → **Deploy to Production**
- Manual trigger via `workflow_dispatch`

**Staging Deployment**:
- Runs on every push to `main`
- Deploys to staging environment
- Runs database migrations
- Environment: `staging`

**Production Deployment**:
- Runs on version tags (e.g., `v1.0.0`)
- Requires manual tag creation
- Runs database migrations
- Creates GitHub release with notes
- Environment: `production`

### **3. Database Workflow** (`.github/workflows/database.yml`)

**Triggers**: Manual via `workflow_dispatch`

**Actions Available**:
- `migrate` - Run database migrations
- `seed` - Seed database with initial data
- `backup` - Create database backup
- `reset` - Reset database (⚠️ DANGER)

**Environments**: `staging` or `production`

---

## 📝 **Development Workflow**

### **1. Start New Feature**

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/batch-tracking-ui

# Install dependencies (if package.json changed)
npm install

# Start Docker services
npm run docker:up

# Start development
npm run dev
```

### **2. Make Changes & Test**

```bash
# Run tests
npm run test

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### **3. Commit Changes**

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
git add .
git commit -m "feat: add batch QR code scanning

- Implement QR scanner component
- Add Colombian localization
- Integrate with batch tracking API"
```

**Commit Prefixes**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting (no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

### **4. Push & Create Pull Request**

```bash
# Push feature branch
git push origin feature/batch-tracking-ui

# Create PR using GitHub CLI
gh pr create \
  --title "Add batch QR code scanning" \
  --body "Implements QR scanning functionality for batch tracking

## Changes
- QR scanner component with camera integration
- Colombian Spanish translations
- Integration with existing batch API

## Testing
- ✅ Unit tests for QR decoder
- ✅ Integration tests with batch service
- ✅ Manual testing on 3G network simulation

Closes #123"

# Or create PR manually on GitHub
```

**What happens automatically**:
1. CI workflow runs (lint, test, build)
2. All checks must pass before merge
3. Code review required (configure in branch protection)

### **5. Merge to Main**

```bash
# After PR approval, merge via GitHub UI or:
gh pr merge --squash --delete-branch

# What happens next:
# 1. CI workflow runs on main branch
# 2. Deploy workflow triggers → deploys to STAGING
# 3. Staging environment updated automatically
```

---

## 🚀 **Production Deployment**

### **Create Release Tag**

```bash
# Pull latest main
git checkout main
git pull origin main

# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0

- Authentication & Company Setup
- Crop Types & Facilities management
- Inventory tracking system"

# Push tag to GitHub
git push origin v1.0.0

# What happens:
# 1. Deploy workflow triggers for production
# 2. Runs all CI checks
# 3. Builds production artifacts
# 4. Runs database migrations on production
# 5. Deploys to production environment
# 6. Creates GitHub release with notes
```

### **Semantic Versioning**

- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features, backward compatible)
- `v1.1.1` - Patch release (bug fixes)

---

## 🌿 **Branch Strategy**

```
main                           # Production-ready code, protected
├── feature/batch-tracking     # New features
├── fix/qr-scanner-bug        # Bug fixes
├── hotfix/security-patch     # Critical production fixes
├── refactor/api-layer        # Code improvements
└── docs/setup-guide          # Documentation updates
```

### **Branch Protection Rules** (Recommended)

Configure in `Settings` → `Branches` → `Branch protection rules`:

**For `main` branch**:
- ✅ Require pull request before merging
- ✅ Require status checks to pass (CI workflow)
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ Do not allow bypassing
- ✅ Restrict deletions

---

## 🔧 **Environment Files**

### **DO NOT commit:**
- `.env.local`
- `.env.production`
- `.env.staging`
- Any file with real credentials

### **DO commit:**
- `.env.example` (template with placeholder values)

### **Local Environment Setup:**

```bash
# Copy example to local
cp .env.example .env.local

# Edit with your local values
# Database, Redis, MinIO, etc.
```

---

## 🧪 **Running CI Checks Locally**

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

## 🔍 **Manual Workflows**

### **Database Migration (Staging)**

1. Go to `Actions` → `Database - Migrations & Backup`
2. Click `Run workflow`
3. Select:
   - Action: `migrate`
   - Environment: `staging`
4. Click `Run workflow`

### **Database Seed (Production)**

1. Go to `Actions` → `Database - Migrations & Backup`
2. Click `Run workflow`
3. Select:
   - Action: `seed`
   - Environment: `production`
4. Click `Run workflow`
5. ⚠️ Confirm this is intended

---

## 🚨 **Troubleshooting**

### **CI Workflow Fails**

```bash
# Check specific job logs on GitHub Actions tab

# Common issues:
# 1. Type errors
npm run type-check

# 2. Lint errors
npm run lint

# 3. Test failures
npm run test

# 4. Build errors
npm run build
```

### **Deployment Fails**

```bash
# Check secrets are configured
# Settings → Secrets and variables → Actions

# Verify database URL format:
# postgresql://user:password@host:5432/database

# Check environment protection rules
# Settings → Environments → [staging/production]
```

### **Database Migration Fails**

```bash
# Verify DATABASE_URL secret is correct
# Check database connectivity from GitHub Actions
# Review Prisma schema for errors
# Check migration logs in Actions tab
```

### **Local Setup Issues**

```bash
# Docker services not running
npm run docker:down
npm run docker:up

# Wait for PostgreSQL to be ready
sleep 10

# Regenerate Prisma client
npm run db:generate

# Push schema
npm run db:push

# Reseed database
npm run db:seed
```

---

## 📚 **Useful Git Commands**

```bash
# View all branches
git branch -a

# Switch branches
git checkout branch-name

# Create and switch to new branch
git checkout -b feature/new-feature

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature

# View commit history
git log --oneline --graph --all

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Stash changes temporarily
git stash
git stash pop

# Pull with rebase (cleaner history)
git pull --rebase origin main

# View diff before committing
git diff
git diff --staged
```

---

## 🎯 **Setup Checklist**

- [ ] Create GitHub repository
- [ ] Push initial code to `main`
- [ ] Configure repository secrets (`STAGING_DATABASE_URL`, `PRODUCTION_DATABASE_URL`)
- [ ] Set up branch protection rules for `main`
- [ ] Configure environments (`staging`, `production`)
- [ ] Verify CI workflow runs successfully
- [ ] Test PR workflow
- [ ] Deploy to staging
- [ ] Create first release tag
- [ ] Deploy to production

---

## 📞 **Resources**

- **GitHub Actions**: https://docs.github.com/en/actions
- **Turborepo**: https://turbo.build/repo/docs
- **Conventional Commits**: https://www.conventionalcommits.org
- **Semantic Versioning**: https://semver.org

---

**Your CI/CD pipeline is now ready for collaborative development! 🎉**
