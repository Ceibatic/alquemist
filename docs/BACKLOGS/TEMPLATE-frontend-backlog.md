# Frontend Backlog - MODULE [X]: [Module Name]

**Module**: [Module Name]
**Subagent**: @frontend
**Priority**: [Critical|High|Medium|Low]
**Dependencies**: [List module dependencies or "None"]
**Estimated Duration**: [X days/weeks]

---

## 📋 Module Overview

[Brief 1-2 paragraph overview of what this module accomplishes from a frontend perspective]

---

## 🎯 Epics & Tasks

### Epic 1: [Epic Name - e.g., "Base UI Components"]

**Purpose**: [What this epic accomplishes]

**Tasks**:
1. Build [ComponentName] component with [key features]
2. Build [AnotherComponent] with [functionality]
3. Create [UtilityName] utility for [purpose]
4. Add [i18n translations] for [language]

### Epic 2: [Epic Name - e.g., "Authentication Flow"]

**Purpose**: [What this epic accomplishes]

**Tasks**:
1. Create [PageName] page with [features]
2. Implement [FeatureName] functionality
3. Add [ValidationName] validation logic
4. Integrate with backend [endpoints]

### Epic 3: [Epic Name - if applicable]

**Purpose**: [What this epic accomplishes]

**Tasks**:
1. [Task description]
2. [Task description]

---

## 📁 Files to Create

### New Files
- `apps/web/src/components/[category]/[ComponentName].tsx`
- `apps/web/src/app/[route]/page.tsx`
- `apps/web/src/lib/[utility].ts`
- `apps/web/src/lib/i18n/es.json` (Spanish translations)
- `apps/web/src/lib/i18n/en.json` (English translations)

### Modified Files
- `[existing-file].tsx` (if modifying existing code - specify reason)

---

## 🔌 Integration Points

### Backend API Endpoints Needed

#### Endpoint 1: [Endpoint Name]
- **Method & Path**: `POST /api/[path]`
- **Purpose**: [What this endpoint does]
- **Request**: `{ field1: type, field2: type }`
- **Response**: `{ data: {...}, meta?: {...} }`
- **Errors**: 400 (validation), 401 (auth), 404 (not found)

#### Endpoint 2: [Another Endpoint]
- **Method & Path**: `GET /api/[path]`
- **Purpose**: [What this endpoint does]
- **Response**: `{ data: [...] }`

### Data Contracts

**Types Needed** (create in `packages/types/src/[module].ts`):
```typescript
export interface [TypeName] {
  id: string;
  // Add key fields that frontend needs to know about
}
```

---

## 🧩 Available Components for Reuse

[Agent should query COMPONENT_INVENTORY.md for available components]

**Expected from previous modules**:
- [ComponentName] → `path/to/component.tsx`
- [AnotherComponent] → `path/to/another.tsx`

**Or**: "None yet" for MODULE 1

---

## ✅ Acceptance Criteria

### Functionality
- [ ] All components render without errors
- [ ] Form validation working (React Hook Form + Zod)
- [ ] Navigation flows work correctly
- [ ] Error states handled gracefully
- [ ] Loading states implemented

### Localization
- [ ] Spanish translations complete (primary)
- [ ] English translations complete (secondary)
- [ ] Language switching works
- [ ] Colombian formatting correct (dates: DD/MM/YYYY, currency: COP, phone: +57)

### Integration
- [ ] API calls structured correctly
- [ ] Request/response types match contracts
- [ ] Error handling implemented
- [ ] Success feedback provided

### Mobile & Responsiveness
- [ ] Works on 360px width minimum
- [ ] Touch-friendly (44px tap targets)
- [ ] Mobile-first layout
- [ ] PWA-ready (if applicable)

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Focus management correct
- [ ] Screen reader friendly (WCAG 2.1 AA)

### Testing
- [ ] Unit tests for complex logic
- [ ] Component tests for UI
- [ ] Manual testing complete

---

## 📚 Context References

**Agent should load these for detailed specifications**:
- Colombian localization rules → Product PRD, Engineering PRD
- Design system → [docs/REFERENCE/DESIGN_SYSTEM.md](../REFERENCE/DESIGN_SYSTEM.md)
- Database models → [packages/database/prisma/schema.prisma](../../packages/database/prisma/schema.prisma)
- Sample data → Query seed files for realistic Colombian data
- Existing components → [docs/COMPONENT_INVENTORY.md](../COMPONENT_INVENTORY.md)

---

## 📝 Notes

[Any special considerations, edge cases, or important context for this module]

**Colombian-Specific**:
- Refer to Product PRD for Colombian business requirements
- Refer to Engineering PRD for localization standards
- Query database schema for Colombian reference data (departments, municipalities, etc.)

**Out of Scope**:
- [Features explicitly not part of this module]

---

**Created**: [Date]
**Last Updated**: [Date]
