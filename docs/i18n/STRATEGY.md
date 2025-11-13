# Internationalization (i18n) Strategy - Alquemist

**Last Updated:** November 11, 2025
**Status:** Active
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decision](#architecture-decision)
3. [Language Support](#language-support)
4. [Implementation Approach](#implementation-approach)
5. [Backend Strategy](#backend-strategy)
6. [Frontend Strategy (Bubble.io)](#frontend-strategy-bubbleio)
7. [Translation Inventory](#translation-inventory)
8. [Data Flow](#data-flow)
9. [Best Practices](#best-practices)
10. [Future Considerations](#future-considerations)

---

## Overview

Alquemist requires internationalization support to serve both Spanish-speaking (primary) and English-speaking users. This document outlines the complete strategy for implementing multi-language support across the platform.

### Goals

- ✅ Support Spanish (default) and English
- ✅ Maintain existing database schema without changes
- ✅ Provide seamless language switching in UI
- ✅ Keep backend simple and language-agnostic
- ✅ Enable easy addition of future languages
- ✅ Ensure consistent translations across the platform

### Non-Goals

- ❌ Right-to-left (RTL) language support (not needed for ES/EN)
- ❌ Regional dialects (es-MX, es-AR, etc.) - using neutral Spanish
- ❌ Backend-side text translations (all UI translation in frontend)
- ❌ Machine translation - all translations will be manually curated

---

## Architecture Decision

### **Decision: Frontend-Only Translation (Backend Agnostic)**

**Rationale:**
- Backend (Convex API) sends only **codes/IDs**, not translated text
- Frontend (Bubble.io) handles all translation logic
- Database schema remains unchanged
- Cleaner separation of concerns
- Reduced payload size in API responses

### Alternative Considered (and Rejected)

**Backend-side Translation:**
- Would require adding `display_name_es` and `display_name_en` to all user-facing fields
- Would increase API response size
- Would make backend more complex
- Would violate single responsibility principle

---

## Language Support

### Phase 1: Initial Launch

| Language | Code | Default | Target Market |
|----------|------|---------|---------------|
| Español | `es` | ✅ Yes | Colombia, Latin America |
| English | `en` | ❌ No | International users |

### Phase 2: Future (Optional)

| Language | Code | Priority | Notes |
|----------|------|----------|-------|
| Português | `pt` | Medium | Brazil market expansion |
| Français | `fr` | Low | African markets (coffee/cocoa) |

---

## Implementation Approach

### Component Breakdown

```
┌─────────────────────────────────────────────────┐
│                   USER                          │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│            BUBBLE.IO FRONTEND                   │
│  ┌──────────────────────────────────────────┐   │
│  │  Language Selector (Custom State)        │   │
│  │  current_language: "es" | "en"           │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Option Sets (Translation Database)      │   │
│  │  - UI_Texts (key, text_es, text_en)     │   │
│  │  - Business_Entity_Types (value, ...)   │   │
│  │  - License_Types (value, ...)           │   │
│  │  - Area_Types (value, ...)              │   │
│  │  - Activity_Types (value, ...)          │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Dynamic Expressions:                            │
│  Search for UI_Texts:first's text_[lang]        │
└──────────────────┬──────────────────────────────┘
                   │
                   │ API Calls (codes only)
                   ▼
┌─────────────────────────────────────────────────┐
│            CONVEX BACKEND (API)                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Sends ONLY codes/IDs:                   │   │
│  │  {                                       │   │
│  │    "status": "active",                   │   │
│  │    "license_type": "commercial_growing", │   │
│  │    "business_entity": "S.A.S"            │   │
│  │  }                                       │   │
│  └──────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│            CONVEX DATABASE                      │
│  Schema remains UNCHANGED                        │
│  All enum values stored in English (technical)  │
└─────────────────────────────────────────────────┘
```

---

## Backend Strategy

### What Backend DOES:

1. **Store technical values in English**
   - Database: `"commercial_growing"`, `"active"`, `"S.A.S"`
   - These are technical identifiers, not user-facing text

2. **Send codes in API responses**
   ```json
   {
     "id": "facility_123",
     "name": "Finca Norte",
     "license_type": "commercial_growing",
     "status": "active",
     "climate_zone": "tropical"
   }
   ```

3. **Accept codes in API requests**
   ```json
   POST /api/v1/facilities
   {
     "name": "Finca Norte",
     "license_type": "commercial_growing"
   }
   ```

### What Backend DOES NOT Do:

- ❌ Does NOT accept `Accept-Language` headers
- ❌ Does NOT translate any text
- ❌ Does NOT store display names in multiple languages
- ❌ Does NOT validate user's language preference

### Error Messages (Exception)

Backend error messages should use **error codes** that frontend can translate:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",  // English fallback
    "details": {
      "field": "license_number",
      "reason": "ALREADY_EXISTS"
    }
  }
}
```

Frontend translates error codes:
- `VALIDATION_FAILED` → "Validación fallida" (es) / "Validation failed" (en)
- `ALREADY_EXISTS` → "Ya existe" (es) / "Already exists" (en)

---

## Frontend Strategy (Bubble.io)

### 1. Custom State for Current Language

**Location:** Index page (root)

```
State name: current_language
State type: Language (Option Set)
Default value: es
```

**Persistence:** Store in User data type field `preferred_language`

**On User Login:**
```
Set state current_language = Current User's preferred_language
```

### 2. Option Sets Structure

#### **Option Set: `Languages`**

| Display | Value |
|---------|-------|
| Español | es    |
| English | en    |

#### **Option Set: `UI_Texts`**

**Attributes:**
- `key` (text) - Unique identifier (e.g., "signup_header")
- `text_es` (text) - Spanish translation
- `text_en` (text) - English translation
- `category` (text) - Module grouping (e.g., "auth", "facilities")

**Usage in Bubble:**
```
Dynamic expression:
Search for UI_Texts (key = "signup_header"):first item's text_[index's current_language]
```

#### **Option Set: Enums from Database**

For each enum in the database schema, create an Option Set:

**Example: `Business_Entity_Types`**

| value | display_es | display_en |
|-------|------------|------------|
| S.A.S | S.A.S | Corporation (Simplified) |
| S.A. | S.A. | Corporation |
| Ltda | Ltda | Limited Liability |
| E.U. | E.U. | Sole Proprietorship |
| Persona Natural | Persona Natural | Individual |

**Usage in Dropdown:**
```
Choices style: Dynamic
Choices source: All Business_Entity_Types
Option caption: This Business_Entity_Type's display_[index's current_language]
```

### 3. Language Switcher Component

**Reusable Element:** `LanguageSwitcher`

**Elements:**
- Dropdown with choices: All Languages
- Display: This Language's Display

**Workflow:**
```
When Language Switcher's value is changed
  → Set state index's current_language = This Language
  → Make changes to Current User → preferred_language = This Language
```

**Placement:** Header of all pages (floating group)

---

## Translation Inventory

### Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| Phase 1 UI Texts | ~150 | ✅ Documented |
| Phase 2 UI Texts | ~200 | ✅ Documented |
| Phase 3 UI Texts | ~100 | ✅ Documented |
| Enum Values | ~60 | ✅ Documented |
| Validation Messages | ~30 | ✅ Documented |
| Error Codes | ~20 | ✅ Documented |
| **TOTAL** | **~560** | **Ready** |

### Translation Categories

1. **Authentication & Onboarding** (`category: auth`)
   - Sign up, login, email verification
   - Company setup, facility creation
   - User profile fields

2. **Operations** (`category: operations`)
   - Inventory management
   - Batch tracking
   - Activity logging
   - Quality checks

3. **Compliance & Reporting** (`category: compliance`)
   - Document management
   - Report generation
   - Certificate tracking

4. **Analytics** (`category: analytics`)
   - Dashboard metrics
   - Charts and graphs
   - Performance indicators

5. **System Messages** (`category: system`)
   - Success messages
   - Error messages
   - Validation messages
   - Confirmation dialogs

### Where to Find Translations

- **UI Texts:** See individual phase documentation files
  - [docs/ui/bubble/PHASE-1-ONBOARDING.md](../ui/bubble/PHASE-1-ONBOARDING.md)
  - [docs/ui/bubble/PHASE-2-OPERATIONS.md](../ui/bubble/PHASE-2-OPERATIONS.md)
  - [docs/ui/bubble/PHASE-3-ADVANCED.md](../ui/bubble/PHASE-3-ADVANCED.md)

- **API Error Codes:** See API documentation
  - [docs/api/PHASE-1-ENDPOINTS.md](../api/PHASE-1-ENDPOINTS.md)
  - [docs/api/PHASE-2-ENDPOINTS.md](../api/PHASE-2-ENDPOINTS.md)
  - [docs/api/PHASE-3-ENDPOINTS.md](../api/PHASE-3-ENDPOINTS.md)

---

## Data Flow

### Example: Creating a Facility

**1. User fills form in Bubble (Spanish UI):**
```
Campo: "Nombre de la Instalación"
Input: "Finca Norte"

Campo: "Tipo de Licencia"
Dropdown: Shows "Cultivo Comercial" (from Option Set display_es)
Selected value: "commercial_growing" (technical code)
```

**2. Bubble sends API request:**
```json
POST /api/v1/facilities
{
  "name": "Finca Norte",
  "license_type": "commercial_growing"  // code, not "Cultivo Comercial"
}
```

**3. Backend stores in database:**
```
facilities table:
  name: "Finca Norte"
  license_type: "commercial_growing"  // stored as-is
```

**4. Backend returns response:**
```json
{
  "id": "fac_123",
  "name": "Finca Norte",
  "license_type": "commercial_growing"  // code
}
```

**5. Bubble displays in UI:**
```
If language = es:
  "Tipo de Licencia: Cultivo Comercial"

If language = en:
  "License Type: Commercial Growing"

(Looked up from License_Types Option Set)
```

---

## Best Practices

### 1. Never Hardcode User-Facing Text

❌ **Wrong:**
```
Text element: "Create Account"
```

✅ **Correct:**
```
Text element (dynamic):
Search for UI_Texts (key = "create_account_btn"):first item's text_[index's current_language]
```

### 2. Always Use Option Sets for Enums

❌ **Wrong:**
```
Dropdown choices: Custom list
  - "Cultivo Comercial"
  - "Investigación"
  - "Procesamiento"
```

✅ **Correct:**
```
Dropdown choices: All License_Types
Option caption: This License_Type's display_[index's current_language]
Option value: This License_Type's value
```

### 3. Provide Fallbacks

Always have Spanish as fallback:

```
Search for UI_Texts (key = "some_key"):first item's text_[index's current_language] :default value "Texto no disponible"
```

### 4. Group Related Translations

Use `category` field to organize:
- `auth` - Authentication pages
- `facilities` - Facility management
- `batches` - Batch tracking
- `inventory` - Inventory management
- `compliance` - Compliance module
- `system` - System-wide messages

### 5. Translation Keys Naming Convention

Use descriptive, hierarchical keys:

```
✅ Good:
  - "signup_header"
  - "signup_first_name_label"
  - "signup_create_account_button"
  - "facilities_add_area_popup_title"

❌ Bad:
  - "text1"
  - "label"
  - "btn"
```

### 6. Handle Variables in Translations

For dynamic content:

```
UI_Text:
  key: "batch_count_active"
  text_es: "[COUNT] lotes activos"
  text_en: "[COUNT] active batches"

In Bubble:
Search for UI_Texts (key = "batch_count_active"):first's text_[lang]:replace "[COUNT]" with Search for Batches:count
```

### 7. Date and Number Formatting

Apply locale-specific formatting:

```
Spanish (es):
  - Date: DD/MM/YYYY (27/10/2025)
  - Number: 1.234,56
  - Currency: $1.234,56 COP

English (en):
  - Date: MM/DD/YYYY (10/27/2025)
  - Number: 1,234.56
  - Currency: COP $1,234.56
```

Use conditionals in Bubble:
```
If index's current_language = es
  → formatted as dd/mm/yyyy
Otherwise
  → formatted as mm/dd/yyyy
```

---

## Future Considerations

### 1. Regional Variations

If expanding to specific markets:
- `es-CO` (Colombia - current default)
- `es-MX` (Mexico)
- `pt-BR` (Brazil)
- `en-US` (United States)

Would require expanding Option Sets:
```
UI_Texts attributes:
  - text_es_co
  - text_es_mx
  - text_pt_br
  - text_en_us
```

### 2. User-Generated Content Translation

For content created by users (notes, descriptions):
- Consider adding translation API (Google Translate, DeepL)
- Add "Translate this" button next to user content
- Store original language code with content

### 3. Voice/Audio Content

If adding audio features (future):
- Text-to-speech should use correct language
- Voice commands should recognize language

### 4. Email and Notifications

Emails should use user's preferred language:
- Backend already has Spanish email templates (good!)
- Add English email templates
- Use user's `preferred_language` field to select template

### 5. SEO and Meta Tags

For public-facing pages:
- Add `<html lang="es">` or `<html lang="en">` dynamically
- Translate meta descriptions and titles
- Consider separate URLs: `/es/`, `/en/`

### 6. Admin/Support Tools

Build translation management interface:
- View all UI_Texts
- Edit translations
- Flag missing translations
- Export/import CSV for translators

---

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- ✅ Create Option Sets (Languages, UI_Texts)
- ✅ Add Custom State to index page
- ✅ Populate Phase 1 translations (~150 texts)

### Phase 2: Core UI (Week 2)
- ✅ Implement Language Switcher component
- ✅ Update all Phase 1 pages to use dynamic text
- ✅ Create enum Option Sets (20 enums)
- ✅ Update dropdowns to use Option Sets

### Phase 3: Operations (Week 3)
- ✅ Populate Phase 2 translations (~200 texts)
- ✅ Update all Phase 2 pages
- ✅ Test workflows in both languages

### Phase 4: Advanced Features (Week 4)
- ✅ Populate Phase 3 translations (~100 texts)
- ✅ Update all Phase 3 pages
- ✅ Add error code translations (~20 codes)

### Phase 5: Polish & Testing (Week 5)
- ✅ Full platform testing in Spanish
- ✅ Full platform testing in English
- ✅ Fix inconsistencies
- ✅ User acceptance testing

---

## Success Metrics

### Completeness
- [ ] 100% of UI texts use dynamic translations
- [ ] 0 hardcoded user-facing text in Bubble
- [ ] All enums have translations for both languages

### Quality
- [ ] Translations reviewed by native speakers
- [ ] Consistent terminology across platform
- [ ] No broken references (missing keys)

### Performance
- [ ] Language switch happens instantly (<1s)
- [ ] No noticeable lag from dynamic expressions
- [ ] Option Set lookups are efficient

### User Experience
- [ ] Language preference persists across sessions
- [ ] All UI elements respond to language change
- [ ] Clear visual indicator of current language

---

## Related Documentation

- [Bubble Implementation Guide](./BUBBLE-IMPLEMENTATION.md) - Step-by-step setup
- [Database Schema](../database/SCHEMA.md) - Data structure
- [API Documentation](../api/) - Backend endpoints
- [UI Phase Documentation](../ui/bubble/) - Complete UI specifications

---

## Glossary

| Term | Definition |
|------|------------|
| i18n | Internationalization (18 letters between i and n) |
| l10n | Localization (10 letters between l and n) |
| Option Set | Bubble's enum/dropdown data structure |
| Custom State | Temporary state stored in Bubble element |
| Dynamic Expression | Computed value in Bubble that updates automatically |
| Translation Key | Unique identifier for a translatable text |
| Locale | Language + region code (e.g., es-CO) |
| Fallback | Default value when translation is missing |

---

**Document Owner:** Tech Lead
**Contributors:** Backend Team, Frontend Team, Product Team
**Review Cycle:** Monthly or when adding new languages
