# 🚀 GitHub Setup Guide - Alquemist

Complete guide to set up GitHub repository and CI/CD pipeline for multi-computer development.

---

## 📋 **Prerequisites**

- GitHub account
- Git installed on both computers
- SSH keys configured (recommended) or HTTPS access

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
gh repo create ceibatic/alquemist --private --description "Multi-Crop Agriculture Platform for Colombian Operations" --source=. --remote=origin

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

Then run these commands:

```bash
# Add remote
git remote add origin git@github.com:ceibatic/alquemist.git

# Or if using HTTPS:
# git remote add origin https://github.com/ceibatic/alquemist.git

# Add all files
git add .

# Initial commit
git commit -m "🌱 Initial commit: Alquemist v4.0 setup complete"

# Push to GitHub
git push -u origin main
```

---

## 🔐 **Step 2: Configure Repository Secrets**

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add these secrets:

### **Required Secrets:**

```
STAGING_DATABASE_URL
postgresql://user:password@host:5432/alquemist_staging

PRODUCTION_DATABASE_URL
postgresql://user:password@host:5432/alquemist_production
```

### **Optional Secrets (if using external services):**

```
CODECOV_TOKEN              # For code coverage reports
VERCEL_TOKEN               # If deploying to Vercel
RAILWAY_TOKEN              # If deploying to Railway
AWS_ACCESS_KEY_ID          # If deploying to AWS
AWS_SECRET_ACCESS_KEY      # If deploying to AWS
```

---

## 💻 **Step 3: Setup Second Computer**

### **Clone the repository:**

```bash
# Navigate to your projects directory
cd ~/projects  # or wherever you keep your projects

# Clone the repository
git clone git@github.com:ceibatic/alquemist.git
# Or HTTPS: git clone https://github.com/ceibatic/alquemist.git

cd alquemist

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local  # If you created this
# Or create a new one based on the original

# Start Docker services
npm run docker:up

# Wait for PostgreSQL to be ready (about 10 seconds)
sleep 10

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database
npm run db:seed

# Verify setup
npm run test
npm run type-check

# Start development
npm run dev
```

---

## 🔄 **Step 4: Daily Development Workflow**

### **Starting work on Computer A:**

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Install any new dependencies
npm install

# Start Docker services if needed
npm run docker:up

# Start development
npm run dev

# Make your changes...
```

### **Committing changes:**

```bash
# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: add batch tracking UI

- Created batch list component
- Added QR code scanning
- Implemented Colombian localization"

# Push to GitHub
git push origin feature/your-feature-name
```

### **Creating Pull Request:**

```bash
# Using GitHub CLI
gh pr create --title "Add batch tracking UI" --body "Description of changes"

# Or go to GitHub web interface and create PR manually
```

### **Switching to Computer B:**

```bash
# Pull latest changes from main
git pull origin main

# Or checkout the same feature branch
git fetch origin
git checkout feature/your-feature-name
git pull origin feature/your-feature-name

# Install dependencies (if package.json changed)
npm install

# Start development
npm run dev
```

---

## 🧪 **Step 5: CI/CD Workflow**

### **What happens automatically:**

#### **On every push to any branch:**
- ✅ Linting and type checking
- ✅ Run all tests
- ✅ Build all packages
- ✅ Upload coverage reports

#### **On push to `main` branch:**
- ✅ All CI checks
- ✅ Deploy to staging environment
- ✅ Run database migrations

#### **On tagged release (v1.0.0, v1.1.0, etc.):**
- ✅ All CI checks
- ✅ Deploy to production
- ✅ Create GitHub release with notes

### **Manual workflows:**

```bash
# Trigger database migration
# Go to Actions → Database → Run workflow

# Trigger production deployment
# Go to Actions → Deploy → Run workflow
```

---

## 📝 **Step 6: Branch Strategy**

### **Branch naming convention:**

```
main                           # Production-ready code
develop                        # Integration branch (optional)
feature/batch-tracking         # New features
fix/qr-scanner-bug            # Bug fixes
hotfix/critical-security      # Critical production fixes
refactor/database-layer       # Code refactoring
docs/setup-guide              # Documentation
```

### **Commit message convention:**

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code refactoring
test: adding tests
chore: maintenance tasks

Examples:
feat: implement batch QR code generation
fix: correct Colombian timezone conversion
docs: add API endpoint documentation
test: add unit tests for QR utilities
```

---

## 🔧 **Step 7: Environment Files**

### **DO NOT commit these files:**
- `.env.local`
- `.env.production`
- `.env.staging`

### **DO commit these files:**
- `.env.example` (template)
- `docker/.env.example` (if applicable)

### **Create `.env.example`:**

```bash
# Copy your .env.local and remove sensitive values
cp .env.local .env.example

# Edit .env.example and replace real values with placeholders
# DATABASE_URL="postgresql://user:password@localhost:5432/alquemist_dev"
```

---

## 🚨 **Troubleshooting**

### **Computer B can't connect to database:**

```bash
# Check Docker services
npm run docker:logs

# Restart Docker
npm run docker:down
npm run docker:up

# Wait 10 seconds
sleep 10

# Re-push schema
npm run db:push
```

### **Git conflicts:**

```bash
# Pull latest changes
git pull origin main

# If conflicts, resolve them manually in your editor
# Then:
git add .
git commit -m "merge: resolve conflicts"
git push
```

### **Dependencies out of sync:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### **Prisma client out of sync:**

```bash
npm run db:generate
```

---

## 📚 **Useful Git Commands**

```bash
# See all branches
git branch -a

# Switch branches
git checkout branch-name

# Create and switch to new branch
git checkout -b feature/new-feature

# Delete local branch
git branch -d feature/old-feature

# See commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Stash changes temporarily
git stash
git stash pop

# Pull and rebase (cleaner history)
git pull --rebase origin main
```

---

## 🎯 **Next Steps**

1. ✅ Create GitHub repository
2. ✅ Push initial code
3. ✅ Configure secrets
4. ✅ Clone on second computer
5. ✅ Verify CI/CD pipeline runs
6. ✅ Start developing features!

---

## 📞 **Need Help?**

- GitHub Docs: https://docs.github.com
- GitHub Actions: https://docs.github.com/en/actions
- Turborepo Docs: https://turbo.build/repo/docs

---

**Your multi-computer development environment is now ready! 🎉**
