# Context Management Strategy

*Optimized for long-horizon development with compaction and JIT loading*

## 🎯 Overview

This document defines how context is managed throughout the Alquemist development process to prevent context pollution, maintain coherence across 13 modules, and ensure sustainable growth.

## 📏 Context Budget

### Active Context Target: ~8,000 tokens
- **claude.md**: ~2,000 tokens (core configuration)
- **Current module summary**: ~500 tokens
- **Component index**: ~1,000 tokens (lightweight references)
- **PROJECT_STATE.md**: ~2,000 tokens (current status)
- **Active integration points**: ~500 tokens
- **Current blockers/issues**: ~500 tokens
- **Buffer**: ~1,500 tokens

### Document Size Limits
- **PROJECT_STATE.md**: Max 8,000 tokens before compaction
- **COMPONENT_INVENTORY.md**: Max 10,000 tokens before compaction
- **Conversation**: Compact every 3 modules or at 75% context window
- **Module PRDs**: No limit (loaded JIT)
- **Backlogs**: No limit (loaded JIT)

## 🗜️ Compaction Strategy

### Automatic Triggers

#### Trigger 1: Module Completion Compaction
**When**: After completing MODULE 3, 6, 9, 12
**Why**: Regular intervals prevent accumulated bloat

**Process**:
1. Archive completed module details → `docs/ARCHIVE/MODULE-[X]-complete.md`
2. Update PROJECT_STATE.md with 200-token summary
3. Move stable components to component catalog
4. Update CONTEXT_INDEX.md with archive references

**Example Archive Entry**:
```markdown
## MODULE 1: Authentication & Company Setup
**Completion Date**: February 1, 2025
**Status**: ✅ COMPLETE

### Summary (200 tokens)
Implemented multi-tenant authentication with Lucia v3, Colombian company
registration with NIT validation, hierarchical RBAC (6 roles), and Spanish/
English localization. Built base UI components (Button, Input, FormField,
Select) and auth forms (Login, Register). Backend includes JWT middleware,
session management, and company registration endpoints. All acceptance
criteria met.

### Components Built
- Button, Input, FormField, Select, LoginForm, RegisterForm,
  CompanyRegistrationWizard

### API Endpoints
- POST /api/auth/login, /api/auth/register, /api/auth/logout,
  GET /api/auth/me, POST /api/companies

### Full Details
See: docs/MODULE_PRDS/01-auth-company-PRD.md
     docs/BACKLOGS/01-auth-frontend-backlog.md
     docs/BACKLOGS/01-auth-backend-backlog.md
```

#### Trigger 2: Document Size Compaction
**When**: PROJECT_STATE.md > 8,000 tokens OR COMPONENT_INVENTORY.md > 10,000 tokens

**Process**:
1. Identify completed modules in PROJECT_STATE.md
2. Archive detailed implementation notes
3. Keep only:
   - Active module full details
   - Last completed module summary (500 tokens)
   - All other modules: 100-token summaries

#### Trigger 3: Conversation Compaction
**When**: Every 3 modules OR conversation reaches 75% context window

**Process**:
1. Create `docs/CONTEXT_SUMMARY.md` with:
   - Architectural decisions made
   - Key technical patterns established
   - Colombian compliance implementations
   - Lessons learned
2. Archive conversation history reference
3. Start new conversation with summary loaded
4. **Git**: Create release tag for production deployment:
   ```bash
   git tag -a v0.X.0 -m "Release v0.X.0

   - MODULE X: Name
   - MODULE Y: Name
   - MODULE Z: Name

   [Key features implemented]"

   git push origin v0.X.0  # Auto-deploys to production
   ```

## 📂 Component Catalog Organization

### Active Components (Last 2 Modules)
Kept in **COMPONENT_INVENTORY.md** with full details

### Stable Components (Older Modules)
Moved to **docs/COMPONENTS/[category]/[name].md**

**Index Entry Format** (Lightweight):
```markdown
### Button
**Status**: 🟢 Stable | **Module**: MODULE 1 | **Category**: ui
**File**: `apps/web/src/components/ui/Button.tsx`
**Details**: [docs/COMPONENTS/ui/Button.md](COMPONENTS/ui/Button.md)
```

**Full Component File** (docs/COMPONENTS/ui/Button.md):
```markdown
# Button Component

**Module**: MODULE 1
**Category**: UI Components
**File**: `apps/web/src/components/ui/Button.tsx`
**Created**: February 1, 2025
**Status**: 🟢 Stable

## Purpose
Reusable button component with variants for Spanish/English interface

## Variants
- `primary` - Main actions (Colombian green)
- `secondary` - Secondary actions
- `danger` - Destructive actions
- `ghost` - Subtle actions

## Usage
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" onClick={handleSubmit}>
  Guardar
</Button>
```

## Props
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean
- `children`: ReactNode

## Dependencies
- Tailwind CSS
- `clsx` for class composition

## Testing
- Unit tests: `Button.test.tsx`
- Coverage: 95%
```

## 🔄 Just-In-Time Loading Workflow

### When Main Claude Needs Component Details

**Bad (Old Way)**:
```
Main Claude loads all of COMPONENT_INVENTORY.md (10,000 tokens)
to find Button component details
```

**Good (New Way)**:
```
User: "@component get Button"

Main Claude:
1. Checks CONTEXT_INDEX.md (lightweight)
2. Finds: Button → docs/COMPONENTS/ui/Button.md
3. Loads only Button.md (~300 tokens)
4. Returns details to conversation
```

### When Main Claude Needs Module History

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
3. Loads archived module summary
4. Returns relevant context
```

## 📊 Compaction Checklist

After each module completion, verify:

- [ ] Module PRD archived in docs/ARCHIVE/
- [ ] PROJECT_STATE.md updated with summary
- [ ] COMPONENT_INVENTORY.md organized (stable components moved)
- [ ] CONTEXT_INDEX.md reflects current state
- [ ] All new components catalogued
- [ ] All new files tracked in IMPLEMENTATION_LOG.md
- [ ] Active context < 8,000 tokens

After every 3 modules:

- [ ] Conversation summary created
- [ ] Architectural decisions documented
- [ ] Context refreshed with summary
- [ ] Lessons learned captured
- [ ] **Git**: Create release tag and deploy to production

## 🎯 Expected Benefits

### Quantitative
- **Active context**: Maintained at ~8,000 tokens (vs 15,000+ unmanaged)
- **Component lookup**: 300 tokens (vs 10,000 tokens loading full inventory)
- **Module recall**: 500-1,000 tokens (vs always-loaded details)
- **Context refresh**: Every 3 modules (vs never or crisis-driven)

### Qualitative
- **Coherence**: Maintained across all 13 modules
- **Performance**: Fast context loading, no degradation
- **Sustainability**: System scales to 50+ components without issues
- **Knowledge preservation**: All decisions captured and retrievable

## 📝 Manual Compaction Commands

```bash
# Compact specific module
@compact module 1

# Compact component inventory
@compact components

# Compact conversation (create summary and reset)
@compact conversation

# Check current context size
@state context-size
```

## 🚨 Warning Signs

Compact immediately if you notice:

- ⚠️ PROJECT_STATE.md exceeds 8,000 tokens
- ⚠️ COMPONENT_INVENTORY.md exceeds 10,000 tokens
- ⚠️ Main Claude responses become less focused
- ⚠️ Context window warnings appear
- ⚠️ Module integration taking longer than 30 minutes
- ⚠️ Difficulty finding specific component information

## 📖 Related Documents

- [CONTEXT_INDEX.md](CONTEXT_INDEX.md) - Lightweight reference index
- [PROJECT_STATE.md](PROJECT_STATE.md) - Current development state
- [COMPONENT_INVENTORY.md](COMPONENT_INVENTORY.md) - Component catalog
- [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md) - File tracking

---

**Version**: 1.0
**Last Updated**: January 2025
**Based On**: Anthropic Context Engineering Best Practices
