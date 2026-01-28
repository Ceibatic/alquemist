# Module Implementation Workflow

This document describes the standard workflow for implementing or completing modules in Alquemist.

## Overview

All module work should follow a branch-based workflow with PRs for code review and quality control before merging to main.

## Workflow Steps

### 1. Planning Phase

Before writing any code:

1. **Review module documentation** in `docs/modules/phase-{1,2,3,4}/`
2. **Run module audit** using the `review-module` skill:
   ```
   /review-module M{number}
   ```
3. **Review audit report** to understand:
   - What's implemented vs missing
   - Critical gaps (security, validation, user experience)
   - Implementation priorities (Critical > Important > Minor)

4. **Get user approval** on the implementation plan before proceeding

### 2. Branch Creation

Create a descriptive feature branch:

```bash
git checkout -b feat/{module-name}-{description}
```

**Naming conventions:**
- New module: `feat/{module-name}-implementation`
- Module completion: `feat/{module-name}-completion`
- Module audit fixes: `fix/{module-name}-audit-{YYYY-MM-DD}`

**Examples:**
- `feat/batches-completion`
- `fix/registration-audit-2026-01-27`
- `feat/quality-checks-implementation`

### 3. Implementation

Follow these practices during implementation:

#### Commit Discipline

- **Commit frequently** - One logical change per commit
- **Meaningful messages** - Follow conventional commits format:
  ```
  feat(module): add feature description
  fix(module): fix bug description
  docs(module): update documentation
  ```
- **Always include co-author**:
  ```
  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  ```

#### Task Organization

- Use task tracking for complex work with 3+ steps
- Mark tasks `in_progress` when starting
- Mark tasks `completed` when done
- Update task list if priorities change

#### Testing

- **Build check** before committing:
  ```bash
  npm run build
  ```
- Fix TypeScript errors immediately
- Test critical user flows manually if possible

### 4. Daily Logging

Update the dev log **after each implementation session**:

**File:** `docs/dev/logs/YYYY-MM-DD.md`

**Format:**
```markdown
## [HH:MM] module-name — short summary
- **Files:** `path/file1.ts`, `path/file2.tsx`
- **Why:** Brief explanation of changes and their purpose
- **Commit:** `hash1`, `hash2`
```

**Rules:**
- One entry per implementation session
- List only the most relevant files (not entire diff)
- Keep "Why" concise (1-2 sentences)
- Use module name from docs or generic label (infra, ui, dx)

### 5. Pre-PR Checklist

Before creating a PR, verify:

- [ ] All tasks completed (or explicitly marked as future work)
- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors
- [ ] Dev log updated
- [ ] All commits pushed to feature branch
- [ ] Branch is up-to-date with main (rebase if needed)

### 6. Create Pull Request

**Push branch:**
```bash
git push -u origin feat/{module-name}-{description}
```

**Create PR with gh CLI:**
```bash
gh pr create --title "feat({module}): {summary}" --body "$(cat <<'EOF'
## Summary
[Brief description of what was implemented]

## Changes

### Critical
- [List critical changes]

### Important
- [List important changes]

### Minor
- [List minor improvements]

## Module Status
- **Before:** {percentage}% complete
- **After:** {percentage}% complete
- **Coverage:** Backend {%}, Frontend {%}, Security {%}

## Test Plan
- [ ] Build passes
- [ ] TypeScript compilation successful
- [ ] [Other manual tests performed]

## Related
- Closes #{issue-number} (if applicable)
- Implements M{number} (module reference)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**PR Title format:**
- `feat({module}): implement complete module`
- `feat({module}): complete US-{number} requirements`
- `fix({module}): resolve audit gaps`

### 7. Review & Merge

**Before merging:**

1. **Verify build** on PR (CI/CD if configured)
2. **Review changes** - Check diff for unintended changes
3. **Get approval** from user/team lead
4. **Resolve conflicts** if main has diverged

**Merge:**
```bash
gh pr merge {pr-number} --merge
```

**Or with squash** (for many small commits):
```bash
gh pr merge {pr-number} --squash
```

**After merge:**
```bash
git checkout main
git pull
git branch -d feat/{module-name}-{description}
```

### 8. Post-Merge

- Update module status in documentation if needed
- Close related issues
- Notify team/stakeholders
- Plan next module or iteration

## Best Practices

### Branch Hygiene

- Keep branches focused - one module or feature per branch
- Don't let branches live too long (aim for < 1 week)
- Rebase on main before creating PR to avoid conflicts
- Delete branches after merge

### Commit Quality

**Good commit messages:**
```
feat(batches): add split wizard with quantity validation
fix(batches): correct area_id field name in filter logic
docs(batches): update M25 status to 100% complete
```

**Bad commit messages:**
```
updates
fix bug
wip
changes
```

### Code Review Focus

When reviewing PRs, check:
- TypeScript types are correct
- No security vulnerabilities (auth guards, validation)
- Follows existing patterns
- No over-engineering
- Mobile-responsive UI
- Error handling present
- Loading states implemented

### Documentation

Keep these updated:
- `docs/dev/logs/` - Daily implementation log
- `docs/modules/` - Module status (if completion changes %)
- `CLAUDE.md` - Project conventions (if new patterns emerge)

## Emergency Hotfixes

For critical production bugs:

1. Create branch from main: `hotfix/{issue-description}`
2. Make minimal fix
3. Test thoroughly
4. Create PR with "hotfix:" prefix
5. Get immediate review
6. Merge and deploy ASAP
7. Backport to development branches if needed

## Example: Complete Workflow

```bash
# 1. Start new feature
git checkout main
git pull
git checkout -b feat/quality-checks-implementation

# 2. Implement with commits
# ... make changes ...
git add .
git commit -m "feat(quality-checks): add inspection form

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 3. Build check
npm run build

# 4. Update dev log
# Edit docs/dev/logs/2026-01-28.md
git add docs/dev/logs/
git commit -m "docs: add quality-checks implementation log"

# 5. Push and create PR
git push -u origin feat/quality-checks-implementation
gh pr create --title "feat(quality-checks): implement M26 inspection module" --body "..."

# 6. Review and merge (after approval)
gh pr merge 17 --merge

# 7. Cleanup
git checkout main
git pull
git branch -d feat/quality-checks-implementation
```

## Tips

- **Use draft PRs** for work-in-progress to get early feedback
- **Link issues** in PR description with "Closes #123"
- **Add screenshots** for UI changes in PR description
- **Run builds locally** before pushing to catch errors early
- **Keep PRs small** - easier to review (aim for < 500 lines changed)
- **Communicate** - Add comments to complex code sections

## Questions?

Refer to:
- `CLAUDE.md` - Project conventions and tech stack
- `docs/modules/` - Module documentation
- `docs/patterns/` - Code patterns and best practices
- Dev team or project lead for clarification
