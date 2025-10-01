# Frontend Backlog - MODULE [X]: [Module Name]

**Module**: [Module Name]
**Subagent**: @frontend
**Priority**: [Critical|High|Medium|Low]
**Dependencies**: [List module dependencies]
**Estimated Duration**: [X days/weeks]

---

## 📋 Module Overview

[Brief 1-2 paragraph overview of what this module accomplishes from a frontend perspective]

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
- [Requirement 3]

**User Flow**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Validation Rules**:
- [Rule 1]
- [Rule 2]

### Task 3: [Another Feature/Component Set]

[Continue with additional tasks]

---

## 📁 Files to Create/Modify

### New Files
- `apps/web/src/components/[category]/[ComponentName].tsx`
- `apps/web/src/components/[category]/[AnotherComponent].tsx`
- `apps/web/src/app/[route]/page.tsx`
- `apps/web/src/lib/[utility-file].ts`
- `apps/web/src/lib/i18n/es.json` (Spanish translations)
- `apps/web/src/lib/i18n/en.json` (English translations)

### Modified Files
- `apps/web/src/[existing-file].tsx` (if modifying existing code)

---

## 🇨🇴 Colombian Requirements

### Localization
- **Spanish translations** for:
  - [List UI text that needs translation]
  - Form labels
  - Validation messages
  - Button text
  - Error messages

- **English translations** (secondary) for same elements

### Formatting
- **Dates**: DD/MM/YYYY format
- **Currency**: COP format ($1.000.000, no decimals)
- **Phone**: Colombian format (+57 XXX XXX XXXX)
- **Time**: 24-hour format (HH:mm)
- **Numbers**: 1.000.000,50 (dot thousands, comma decimals)

### Colombian-Specific Inputs
- **NIT Input**: Colombian tax ID validation
  - Format: XXXXXXXXX-X
  - Validation: Check digit algorithm

- **Address Input**: Colombian format
  - Departamento (department selector)
  - Municipio (municipality selector, filtered by department)
  - DANE codes for both
  - Address line 1 and 2

- **Business Entity Selector**:
  - S.A.S (Sociedad por Acciones Simplificada)
  - S.A. (Sociedad Anónima)
  - Ltda. (Limitada)
  - E.U. (Empresa Unipersonal)

### UI Standards
- **Colors**:
  - Primary: Colombian green (#00A859)
  - Secondary: [Specify]
  - Error: Red (#DC2626)
  - Warning: Amber (#F59E0B)
  - Success: Green (#10B981)

- **Typography**: [Specify font stack if special]

---

## 🔌 Integration Points

### Backend API Endpoints Needed

#### Endpoint 1: [Endpoint Name]
- **Method**: [GET|POST|PUT|PATCH|DELETE]
- **Path**: `/api/[path]`
- **Purpose**: [What this endpoint does]
- **Request Body** (if applicable):
```typescript
{
  field1: string;
  field2: number;
  // Colombian-specific fields
  nit?: string;
  department?: string;
}
```
- **Response**:
```typescript
{
  data: {
    id: string;
    // response fields
  };
  meta?: {
    // metadata
  };
}
```
- **Error Responses**:
  - 400: Validation error (Spanish message)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found

#### Endpoint 2: [Another Endpoint]
[Same structure as above]

### Data Contracts

**Types Needed** (create in `packages/types/src/[module].ts`):
```typescript
export interface [TypeName] {
  // Define shared types between frontend and backend
}
```

---

## 🧩 Available Components for Reuse

[List components from previous modules that can be reused]

**From MODULE 1**:
- Button → `apps/web/src/components/ui/Button.tsx`
- Input → `apps/web/src/components/ui/Input.tsx`
- FormField → `apps/web/src/components/ui/FormField.tsx`

**From MODULE 2**:
- [Component list if applicable]

**Usage Notes**:
- [Any notes about using existing components]

---

## ✅ Acceptance Criteria

Checklist for determining task completion:

### Functionality
- [ ] All components render without errors
- [ ] Form validation working (Zod schemas)
- [ ] Spanish labels and messages
- [ ] English fallback working
- [ ] Colombian formatting correct (dates, currency, phone)
- [ ] Navigation flows work
- [ ] Error states handled gracefully

### Localization
- [ ] Spanish translations complete
- [ ] English translations complete
- [ ] Language switching works
- [ ] Date/time in Colombian format
- [ ] Currency in COP format

### Integration
- [ ] API calls structured correctly
- [ ] Request/response types match contracts
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Success feedback provided

### Mobile & Responsiveness
- [ ] Works on 360px width minimum
- [ ] Touch-friendly (44px tap targets)
- [ ] Mobile-first layout
- [ ] PWA-ready (if applicable for this module)

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Focus management correct
- [ ] Screen reader friendly

### Performance
- [ ] Components memoized where appropriate
- [ ] Lazy loading implemented for heavy components
- [ ] Images optimized

### Testing
- [ ] Unit tests for complex logic
- [ ] Component tests for UI
- [ ] Manual testing complete

---

## 📦 Colombian Sample Data

Use this realistic Colombian data for testing:

```typescript
const sampleCompany = {
  name: "Valle Verde S.A.S",
  legalName: "Valle Verde Cultivos Sostenibles S.A.S",
  nit: "900123456-7",
  businessEntityType: "S.A.S",
  department: "Putumayo",
  municipality: "Mocoa",
  daneCode: "86001",
  address: "Carrera 15 # 23-45",
  phone: "+57 314 555 1234",
};

const sampleUser = {
  firstName: "Carlos",
  lastName: "Rodríguez",
  email: "carlos.rodriguez@valleverde.com.co",
  phone: "+57 314 555 1234",
  locale: "es",
  timezone: "America/Bogota",
};
```

---

## 🚀 Future Enhancements (Out of Scope)

[List items that are related but not part of this module]

- [Enhancement 1]
- [Enhancement 2]

---

## 📚 Resources

- **Design System**: [Link if available]
- **Figma/Designs**: [Link if available]
- **Product PRD**: `docs/Product PRD - Alquemist v4.0.md`
- **Module PRD**: `docs/MODULE_PRDS/[XX]-[module]-PRD.md`
- **Component Inventory**: `docs/COMPONENT_INVENTORY.md`

---

**Created**: [Date]
**Last Updated**: [Date]
